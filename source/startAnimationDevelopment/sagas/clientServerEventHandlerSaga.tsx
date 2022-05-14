import * as IO from 'io-ts'
import Path from 'path'
import ReactDomServer from 'react-dom/server'
import { SagaReturnType } from 'redux-saga/effects'
import { decodeData } from '../../helpers/decodeData'
import { FunctionBrand } from '../../models/common'
import { call, put, select, spawn, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleBundlerActiveState } from '../models/AnimationDevelopmentState'
import { ClientGraphicsRendererProcessState } from '../models/ClientGraphicsRendererProcessState'
import {
  ClientRequestsGraphicAssetEvent,
  ClientRequestsPageEvent,
  ClientServerEvent,
} from '../models/ClientServerEvent'
import {
  GraphicsRendererProcessStateRequestQueryParams,
  GraphicsRendererProcessStateRequestQueryParamsCodec,
} from '../models/GraphicsRendererProcessStateRequestQueryParams'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'
import { InitialSagaApi } from './initialSaga'

export interface ClientServerEventHandlerSagaApi
  extends Pick<
      InitialSagaApi,
      | 'generatedAssetsDirectoryPath'
      | 'animationModulePath'
      | 'numberOfFrameRendererWorkers'
    >,
    Pick<
      SagaReturnType<typeof animationDevelopmentSetupSaga>,
      | 'clientServerEventChannel'
      | 'clientPageBundle'
      | 'localStorageSessionCacheId'
    > {}

export function* clientServerEventHandlerSaga(
  api: ClientServerEventHandlerSagaApi
) {
  const {
    clientServerEventChannel,
    generatedAssetsDirectoryPath,
    animationModulePath,
    numberOfFrameRendererWorkers,
    clientPageBundle,
    localStorageSessionCacheId,
  } = api
  while (true) {
    const someClientServerEvent = yield* takeEvent<ClientServerEvent>(
      clientServerEventChannel
    )
    switch (someClientServerEvent.eventType) {
      case 'clientServerListening':
        break
      case 'clientRequestsGraphicsRendererProcessState':
        yield* spawn(clientRequestsGraphicsRendererProcessStateHandler, {
          generatedAssetsDirectoryPath,
          animationModulePath,
          numberOfFrameRendererWorkers,
          clientRequest: someClientServerEvent.eventPayload.clientRequest,
          serverResponse: someClientServerEvent.eventPayload.serverResponse,
        })
        break
      case 'clientRequestsGraphicAsset':
        yield* spawn(clientRequestsGraphicAssetHandler, {
          clientRequest: someClientServerEvent.eventPayload.clientRequest,
          serverResponse: someClientServerEvent.eventPayload.serverResponse,
        })
        break
      case 'clientRequestsPage':
        yield* spawn(clientRequestsPageHandler, {
          clientPageBundle,
          localStorageSessionCacheId,
          serverResponse: someClientServerEvent.eventPayload.serverResponse,
        })
        break
    }
  }
}

interface ClientRequestsGraphicsRendererProcessStateHandlerApi
  extends Pick<
      ClientServerEventHandlerSagaApi,
      | 'generatedAssetsDirectoryPath'
      | 'animationModulePath'
      | 'numberOfFrameRendererWorkers'
    >,
    Pick<
      ClientRequestsGraphicAssetEvent['eventPayload'],
      'clientRequest' | 'serverResponse'
    > {}

function* clientRequestsGraphicsRendererProcessStateHandler(
  api: ClientRequestsGraphicsRendererProcessStateHandlerApi
) {
  const {
    serverResponse,
    clientRequest,
    generatedAssetsDirectoryPath,
    animationModulePath,
    numberOfFrameRendererWorkers,
  } = api
  const currentAnimationModuleBundlerState = yield* select(
    (currentAnimationDevelopmentState) =>
      currentAnimationDevelopmentState.animationModuleBundlerState
  )
  try {
    switch (currentAnimationModuleBundlerState.bundlerStatus) {
      case 'bundlerInitializing':
        serverResponse.sendStatus(204)
        break
      case 'bundlerActive':
        const { graphicsRendererProcessStateRequestQueryParams } = yield* call(
          getGraphicsRendererProcessStateRequestQueryParams,
          {
            clientRequestQueryData: clientRequest.query,
          }
        )
        const { specifiedClientGraphicsRendererProcessState } =
          getSpecifiedClientGraphicsRendererProcessState({
            currentAnimationModuleBundlerState,
            graphicsRendererProcessStateRequestQueryParams,
          })
        serverResponse.statusCode = 200
        serverResponse.setHeader('Content-Type', 'application/json')
        serverResponse.send(
          JSON.stringify(specifiedClientGraphicsRendererProcessState)
        )
        if (
          specifiedClientGraphicsRendererProcessState.buildStatus ===
            'validBuild' &&
          specifiedClientGraphicsRendererProcessState.graphicsRendererProcessStatus ===
            'processInitializing'
        ) {
          const {
            graphicsRendererProcessCommandString,
            graphicAssetPathKey,
            graphicAssetPath,
            graphicAssetUrlResult,
          } = getPartialSpawnGraphicsRendererProcessActionPayload({
            generatedAssetsDirectoryPath,
            animationModulePath,
            numberOfFrameRendererWorkers,
            graphicsRendererProcessStateRequestQueryParams,
            currentBundleSessionVersion:
              currentAnimationModuleBundlerState.buildVersion,
          })
          yield* put({
            type: 'spawnGraphicsRendererProcess',
            actionPayload: {
              graphicsRendererProcessCommandString,
              graphicAssetPathKey,
              graphicAssetPath,
              graphicAssetUrlResult,
              buildVersion: currentAnimationModuleBundlerState.buildVersion,
              graphicsRendererProcessKey:
                graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey,
            },
          })
        }
        break
    }
  } catch (queryParamsError) {
    if (queryParamsError instanceof Error) {
      serverResponse.statusCode = 400
      serverResponse.send(`${queryParamsError}`)
    } else {
      serverResponse.sendStatus(500)
    }
  }
}

interface GetGraphicsRendererProcessStateRequestQueryParamsApi {
  clientRequestQueryData: ClientRequestsGraphicsRendererProcessStateHandlerApi['clientRequest']['query']
}

async function getGraphicsRendererProcessStateRequestQueryParams(
  api: GetGraphicsRendererProcessStateRequestQueryParamsApi
) {
  const { clientRequestQueryData } = api
  const graphicsRendererProcessStateRequestQueryParams =
    await decodeData<GraphicsRendererProcessStateRequestQueryParams>({
      targetCodec: GraphicsRendererProcessStateRequestQueryParamsCodec,
      inputData: clientRequestQueryData,
    })
  return { graphicsRendererProcessStateRequestQueryParams }
}

interface GetPartialSpawnGraphicsRendererProcessActionPayloadApi
  extends Pick<
      ClientRequestsGraphicsRendererProcessStateHandlerApi,
      | 'generatedAssetsDirectoryPath'
      | 'animationModulePath'
      | 'numberOfFrameRendererWorkers'
    >,
    FunctionBrand<
      typeof getGraphicsRendererProcessStateRequestQueryParams,
      'graphicsRendererProcessStateRequestQueryParams'
    > {
  currentBundleSessionVersion: AnimationModuleBundlerActiveState['buildVersion']
}

function getPartialSpawnGraphicsRendererProcessActionPayload(
  api: GetPartialSpawnGraphicsRendererProcessActionPayloadApi
) {
  const {
    generatedAssetsDirectoryPath,
    animationModulePath,
    graphicsRendererProcessStateRequestQueryParams,
    currentBundleSessionVersion,
    numberOfFrameRendererWorkers,
  } = api
  const generatedAssetsDirectoryAbsolutePath = Path.resolve(
    generatedAssetsDirectoryPath
  )
  const animationModuleAbsolutePath = Path.resolve(animationModulePath)
  if (
    graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey.startsWith(
      'animation'
    )
  ) {
    const animationAssetFilename = `${currentBundleSessionVersion}.mp4`
    const animationMp4OutputPath = Path.join(
      generatedAssetsDirectoryAbsolutePath,
      animationAssetFilename
    )
    return {
      graphicAssetPathKey: animationAssetFilename,
      graphicAssetPath: animationMp4OutputPath,
      graphicAssetUrlResult: `/asset/${animationAssetFilename}`,
      graphicsRendererProcessCommandString: `graphics-renderer renderAnimation --animationModulePath=${animationModuleAbsolutePath} --animationMp4OutputPath=${animationMp4OutputPath} --numberOfFrameRendererWorkers=${numberOfFrameRendererWorkers}`,
    }
  } else if (
    graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey.startsWith(
      'frame'
    )
  ) {
    const frameIndex = Number(
      graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey.replace(
        'frame/',
        ''
      )!
    )
    const frameAssetFilename = `${currentBundleSessionVersion}_${frameIndex}.png`
    const frameFileOutputPath = Path.join(
      generatedAssetsDirectoryAbsolutePath,
      frameAssetFilename
    )
    return {
      graphicAssetPathKey: frameAssetFilename,
      graphicAssetPath: frameFileOutputPath,
      graphicsRendererProcessCommandString: `graphics-renderer renderAnimationFrame --animationModulePath=${animationModuleAbsolutePath} --frameIndex=${frameIndex} --frameFileOutputPath=${frameFileOutputPath}`,
      graphicAssetUrlResult: `/asset/${frameAssetFilename}`,
    }
  } else {
    throw new Error('wtf? getPartialSpawnGraphicsRendererProcessActionPayload')
  }
}

interface GetSpecifiedClientGraphicsRendererProcessStateApi
  extends FunctionBrand<
    typeof getGraphicsRendererProcessStateRequestQueryParams,
    'graphicsRendererProcessStateRequestQueryParams'
  > {
  currentAnimationModuleBundlerState: AnimationModuleBundlerActiveState
}

function getSpecifiedClientGraphicsRendererProcessState(
  api: GetSpecifiedClientGraphicsRendererProcessStateApi
): {
  specifiedClientGraphicsRendererProcessState: ClientGraphicsRendererProcessState
} {
  const {
    graphicsRendererProcessStateRequestQueryParams,
    currentAnimationModuleBundlerState,
  } = api
  const specifiedGraphicsRendererProcessState =
    currentAnimationModuleBundlerState.graphicsRendererProcessStates[
      graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey
    ]
  if (
    currentAnimationModuleBundlerState.buildStatus === 'validBuild' &&
    !specifiedGraphicsRendererProcessState
  ) {
    const { getFrameDescription, ...clientAnimationModule } =
      currentAnimationModuleBundlerState.animationModule
    return {
      specifiedClientGraphicsRendererProcessState: {
        buildVersion: currentAnimationModuleBundlerState.buildVersion,
        buildStatus: currentAnimationModuleBundlerState.buildStatus,
        graphicsRendererProcessKey:
          graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey,
        animationModule: clientAnimationModule,
        graphicsRendererProcessStatus: 'processInitializing',
        graphicsRendererProcessStdoutLog: '',
      },
    }
  } else if (
    currentAnimationModuleBundlerState.buildStatus === 'validBuild' &&
    specifiedGraphicsRendererProcessState
  ) {
    const {
      spawnedGraphicsRendererProcess,
      ...someSpecifiedClientGraphicsRendererProcessState
    } = specifiedGraphicsRendererProcessState
    const { getFrameDescription, ...clientAnimationModule } =
      currentAnimationModuleBundlerState.animationModule
    return {
      specifiedClientGraphicsRendererProcessState: {
        ...someSpecifiedClientGraphicsRendererProcessState,
        buildVersion: currentAnimationModuleBundlerState.buildVersion,
        buildStatus: currentAnimationModuleBundlerState.buildStatus,
        animationModule: clientAnimationModule,
      },
    }
  } else if (
    currentAnimationModuleBundlerState.buildStatus === 'invalidBuild'
  ) {
    return {
      specifiedClientGraphicsRendererProcessState: {
        buildVersion: currentAnimationModuleBundlerState.buildVersion,
        buildStatus: currentAnimationModuleBundlerState.buildStatus,
        buildErrorMessage: currentAnimationModuleBundlerState.buildErrorMessage,
      },
    }
  } else {
    throw new Error('wtf? getSpecifiedClientGraphicsRendererProcessState')
  }
}

interface ClientRequestsGraphicAssetHandlerApi
  extends Pick<
    ClientRequestsGraphicAssetEvent['eventPayload'],
    'clientRequest' | 'serverResponse'
  > {}

function* clientRequestsGraphicAssetHandler(
  api: ClientRequestsGraphicAssetHandlerApi
) {
  const { clientRequest, serverResponse } = api
  const clientRequestRouteParams = yield* call(() =>
    decodeData<{ assetFilename: string }>({
      targetCodec: IO.exact(
        IO.type({
          assetFilename: IO.string,
        })
      ),
      inputData: clientRequest.params,
    })
  )
  const currentAvailableAssetsFilePathMap = yield* select(
    (currentAnimationDevelopmentState) =>
      currentAnimationDevelopmentState.availableAssetsFilePathMap
  )
  const targetAssetFilepath =
    currentAvailableAssetsFilePathMap[clientRequestRouteParams.assetFilename]
  if (targetAssetFilepath) {
    const targetAssetMimeType = getTargetAssetMimeType({
      targetAssetFilepath,
    })
    serverResponse.setHeader('Content-Type', targetAssetMimeType)
    serverResponse.sendFile(targetAssetFilepath)
  } else {
    serverResponse.sendStatus(404)
  }
}

interface GetTargetAssetMimeTypeApi {
  targetAssetFilepath: string
}

function getTargetAssetMimeType(api: GetTargetAssetMimeTypeApi) {
  const { targetAssetFilepath } = api
  const assetType = targetAssetFilepath.split(/\.(svg|png|mp4|gif)$/, 2)[1]
  switch (assetType) {
    case 'svg':
      return 'image/svg+xml'
    case 'png':
      return 'image/png'
    case 'mp4':
      return 'video/mp4'
    case 'gif':
      return 'image/gif'
    default:
      throw new Error('wtf? getTargetAssetMimeType')
  }
}

interface ClientRequestsPageHandlerApi
  extends Pick<
      ClientServerEventHandlerSagaApi,
      'clientPageBundle' | 'localStorageSessionCacheId'
    >,
    Pick<ClientRequestsPageEvent['eventPayload'], 'serverResponse'> {}

function* clientRequestsPageHandler(api: ClientRequestsPageHandlerApi) {
  const { serverResponse, localStorageSessionCacheId, clientPageBundle } = api
  serverResponse.statusCode = 200
  serverResponse.setHeader('Content-Type', 'text/html')
  serverResponse.send(
    ReactDomServer.renderToStaticMarkup(
      <html lang={'en'}>
        <head>
          <meta charSet={'utf-8'} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <script
            id={'client-page-bundle-script'}
            data-local-storage-session-cache-id={localStorageSessionCacheId}
            dangerouslySetInnerHTML={{
              __html: clientPageBundle,
            }}
          />
        </body>
      </html>
    )
  )
}
