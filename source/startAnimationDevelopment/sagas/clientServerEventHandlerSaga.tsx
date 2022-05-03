import * as IO from 'io-ts'
import Path from 'path'
import ReactDomServer from 'react-dom/server'
import { SagaReturnType } from 'redux-saga/effects'
import { decodeData } from '../../helpers/decodeData'
import { DistributiveOmit, FunctionBrand } from '../../models/common'
import { call, put, select, spawn, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
import {
  ClientRequestsGraphicAssetEvent,
  ClientRequestsPageEvent,
  ClientServerEvent,
} from '../models/ClientServerEvent'
import {
  ClientGraphicsRendererProcessState,
  GraphicsRendererProcessState,
} from '../models/GraphicsRendererProcessState'
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
      'clientServerEventChannel' | 'clientPageBundle'
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
  const currentAnimationModuleSourceState = yield* select(
    (currentAnimationDevelopmentState) =>
      currentAnimationDevelopmentState.animationModuleSourceState
  )
  try {
    const { graphicsRendererProcessStateRequestQueryParams } = yield* call(
      getGraphicsRendererProcessStateRequestQueryParams,
      {
        clientRequestQueryData: clientRequest.query,
      }
    )
    switch (currentAnimationModuleSourceState.sourceStatus) {
      case 'sourceInitializing':
        serverResponse.sendStatus(204)
        break
      case 'sourceReady':
        const specifiedGraphicsRendererProcessState =
          currentAnimationModuleSourceState.graphicsRendererProcessStates[
            graphicsRendererProcessStateRequestQueryParams
              .graphicsRendererProcessKey
          ]
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
          currentAnimationModuleSessionVersion:
            currentAnimationModuleSourceState.animationModuleSessionVersion,
        })
        if (specifiedGraphicsRendererProcessState === undefined) {
          yield* put({
            type: 'spawnGraphicsRendererProcess',
            actionPayload: {
              graphicsRendererProcessCommandString,
              graphicAssetPathKey,
              graphicAssetPath,
              graphicAssetUrlResult,
              animationModuleSessionVersionStamp:
                currentAnimationModuleSourceState.animationModuleSessionVersion,
              graphicsRendererProcessKey:
                graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey,
            },
          })
        }
        const { specifiedClientGraphicsRendererProcessState } =
          getSpecifiedClientGraphicsRendererProcessState({
            currentPartialGraphicsRendererProcessState:
              specifiedGraphicsRendererProcessState || {
                processStatus: 'processActive',
                processStdoutLog: '',
                graphicsRendererProcessKey:
                  graphicsRendererProcessStateRequestQueryParams.graphicsRendererProcessKey,
              },
            currentAnimationModule:
              currentAnimationModuleSourceState.animationModule,
            currentAnimationModuleSessionVersion:
              currentAnimationModuleSourceState.animationModuleSessionVersion,
          })
        serverResponse.statusCode = 200
        serverResponse.setHeader('Content-Type', 'application/json')
        serverResponse.send(
          JSON.stringify(specifiedClientGraphicsRendererProcessState)
        )
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
  currentAnimationModuleSessionVersion: AnimationModuleSourceReadyState['animationModuleSessionVersion']
}

function getPartialSpawnGraphicsRendererProcessActionPayload(
  api: GetPartialSpawnGraphicsRendererProcessActionPayloadApi
) {
  const {
    generatedAssetsDirectoryPath,
    animationModulePath,
    graphicsRendererProcessStateRequestQueryParams,
    currentAnimationModuleSessionVersion,
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
    const animationAssetFilename = `${currentAnimationModuleSessionVersion}.mp4`
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
    const frameAssetFilename = `${currentAnimationModuleSessionVersion}_${frameIndex}.png`
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

interface GetSpecifiedClientGraphicsRendererProcessStateApi {
  currentPartialGraphicsRendererProcessState: DistributiveOmit<
    GraphicsRendererProcessState,
    'spawnedProcess'
  >
  currentAnimationModule: AnimationModuleSourceReadyState['animationModule']
  currentAnimationModuleSessionVersion: AnimationModuleSourceReadyState['animationModuleSessionVersion']
}

function getSpecifiedClientGraphicsRendererProcessState(
  api: GetSpecifiedClientGraphicsRendererProcessStateApi
): {
  specifiedClientGraphicsRendererProcessState: ClientGraphicsRendererProcessState
} {
  const {
    currentPartialGraphicsRendererProcessState,
    currentAnimationModule,
    currentAnimationModuleSessionVersion,
  } = api
  const { FrameDescriptor, ...clientAnimationModule } = currentAnimationModule
  return {
    specifiedClientGraphicsRendererProcessState: {
      ...currentPartialGraphicsRendererProcessState,
      animationModuleSessionVersion: currentAnimationModuleSessionVersion,
      animationModule: clientAnimationModule,
    },
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
  extends Pick<ClientServerEventHandlerSagaApi, 'clientPageBundle'>,
    Pick<ClientRequestsPageEvent['eventPayload'], 'serverResponse'> {}

function* clientRequestsPageHandler(api: ClientRequestsPageHandlerApi) {
  const { serverResponse, clientPageBundle } = api
  serverResponse.statusCode = 200
  serverResponse.setHeader('Content-Type', 'text/html')
  serverResponse.send(
    ReactDomServer.renderToStaticMarkup(
      <html lang={'en'}>
        <head>
          <meta charSet={'utf-8'} />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
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
            data-local-storage-session-cache-id={`${Math.random()}`}
            dangerouslySetInnerHTML={{
              __html: clientPageBundle,
            }}
          />
        </body>
      </html>
    )
  )
}
