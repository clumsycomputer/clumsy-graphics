import * as IO from 'io-ts'
import ReactDomServer from 'react-dom/server'
import { SagaReturnType } from 'redux-saga/effects'
import { decodeData } from '../../helpers/decodeData'
import { FunctionBrand } from '../../models/common'
import { call, put, select, spawn, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
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
import Path from 'path'
import { GraphicsRendererProcessState } from '../models/GraphicsRendererProcessState'

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
        const { specifiedGraphicsRendererProcessKey } =
          getSpecifiedGraphicsRendererProcessKey({
            graphicsRendererProcessStateRequestQueryParams,
          })
        const specifiedGraphicsRendererProcessState =
          currentAnimationModuleSourceState.graphicsRendererProcessStates[
            specifiedGraphicsRendererProcessKey
          ]
        if (specifiedGraphicsRendererProcessState === undefined) {
          const { partialSpawnGraphicsRendererProcessActionPayload } =
            getPartialSpawnGraphicsRendererProcessActionPayload({
              generatedAssetsDirectoryPath,
              animationModulePath,
              numberOfFrameRendererWorkers,
              graphicsRendererProcessStateRequestQueryParams,
              currentAnimationModuleSessionVersion:
                currentAnimationModuleSourceState.animationModuleSessionVersion,
            })
          yield* put({
            type: 'spawnGraphicsRendererProcess',
            actionPayload: {
              ...partialSpawnGraphicsRendererProcessActionPayload,
              animationModuleSessionVersionStamp:
                currentAnimationModuleSourceState.animationModuleSessionVersion,
              graphicsRendererProcessKey: specifiedGraphicsRendererProcessKey,
            },
          })
        }
        const { specifiedClientGraphicsRendererProcessState } =
          getSpecifiedClientGraphicsRendererProcessState({
            specifiedGraphicsRendererProcessState,
            currentAnimationModuleSessionVersion:
              currentAnimationModuleSourceState.animationModuleSessionVersion,
          })
        serverResponse.statusCode = 200
        serverResponse.send(
          JSON.stringify(specifiedClientGraphicsRendererProcessState)
        )
        break
    }
  } catch {
    // invalid query params
    serverResponse.sendStatus(400)
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

interface GetSpecifiedGraphicsRendererProcessKeyApi
  extends FunctionBrand<
    typeof getGraphicsRendererProcessStateRequestQueryParams,
    'graphicsRendererProcessStateRequestQueryParams'
  > {}

function getSpecifiedGraphicsRendererProcessKey(
  api: GetSpecifiedGraphicsRendererProcessKeyApi
) {
  const { graphicsRendererProcessStateRequestQueryParams } = api
  switch (graphicsRendererProcessStateRequestQueryParams.assetType) {
    case 'mp4':
      return {
        specifiedGraphicsRendererProcessKey: 'animation',
      }
    case 'png':
      return {
        specifiedGraphicsRendererProcessKey: `${graphicsRendererProcessStateRequestQueryParams.frameIndex}`,
      }
    default:
      throw new Error('wtf? getSpecifiedGraphicsRendererProcessKey')
  }
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
  switch (graphicsRendererProcessStateRequestQueryParams.assetType) {
    case 'mp4':
      const animationAssetFilename = `${currentAnimationModuleSessionVersion}.mp4`
      const animationMp4OutputPath = Path.join(
        generatedAssetsDirectoryAbsolutePath,
        animationAssetFilename
      )
      return {
        partialSpawnGraphicsRendererProcessActionPayload: {
          graphicAssetPathKey: animationAssetFilename,
          graphicAssetPath: animationMp4OutputPath,
          graphicAssetUrlResult: `/asset/${animationAssetFilename}`,
          graphicsRendererProcessCommandString: `graphics-renderer renderAnimation --animationModulePath=${animationModuleAbsolutePath} --animationMp4OutputPath=${animationMp4OutputPath} --numberOfFrameRendererWorkers=${numberOfFrameRendererWorkers}`,
          initialProcessProgressInfo: 'starting animation rendering...',
        },
      }
    case 'png':
      const frameAssetFilename = `${currentAnimationModuleSessionVersion}_${graphicsRendererProcessStateRequestQueryParams.frameIndex}.png`
      const frameFileOutputPath = Path.join(
        generatedAssetsDirectoryAbsolutePath,
        frameAssetFilename
      )
      return {
        partialSpawnGraphicsRendererProcessActionPayload: {
          graphicAssetPathKey: frameAssetFilename,
          graphicAssetPath: frameFileOutputPath,
          graphicsRendererProcessCommandString: `graphics-renderer renderAnimationFrame --animationModulePath=${animationModuleAbsolutePath} --frameIndex=${graphicsRendererProcessStateRequestQueryParams.frameIndex} --frameFileOutputPath=${frameFileOutputPath}`,
          graphicAssetUrlResult: `/asset/${frameAssetFilename}`,
          initialProcessProgressInfo: 'starting frame rendering...',
        },
      }
  }
}

interface GetSpecifiedClientGraphicsRendererProcessStateApi {
  specifiedGraphicsRendererProcessState:
    | AnimationModuleSourceReadyState['graphicsRendererProcessStates'][string]
    | undefined
  currentAnimationModuleSessionVersion: AnimationModuleSourceReadyState['animationModuleSessionVersion']
}

function getSpecifiedClientGraphicsRendererProcessState(
  api: GetSpecifiedClientGraphicsRendererProcessStateApi
) {
  const { currentAnimationModuleSessionVersion } = api
  return {
    specifiedClientGraphicsRendererProcessState: {
      animationModuleSessionVerions: currentAnimationModuleSessionVersion,
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
    serverResponse.sendFile(targetAssetFilepath)
  } else {
    serverResponse.sendStatus(404)
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
        </head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: clientPageBundle,
            }}
          />
        </body>
      </html>
    )
  )
}
