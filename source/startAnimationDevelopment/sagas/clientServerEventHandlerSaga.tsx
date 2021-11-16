import * as IO from 'io-ts'
import { SagaReturnType } from 'redux-saga/effects'
import { NumberFromString } from '../../helpers/codecTypes'
import { decodeData } from '../../helpers/decodeData'
import { call, put, select, spawn, takeEvent } from '../helpers/storeEffects'
import {
  ClientApiRequestEvent,
  ClientAssetRequestEvent,
  ClientPageRequestEvent,
  ClientServerEvent,
} from '../models/ClientServerEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'
import ReactDomServer from 'react-dom/server'
import { getClientAnimationRenderProcessState } from '../helpers/getClientAnimationRenderProcessState'
import { getClientFrameRenderProcessState } from '../helpers/getClientFrameRenderProcessState'

export interface ClientServerEventHandlerSagaApi
  extends Pick<
    SagaReturnType<typeof animationDevelopmentSetupSaga>,
    'clientServerEventChannel' | 'clientPageBundle'
  > {}

export function* clientServerEventHandlerSaga(
  api: ClientServerEventHandlerSagaApi
) {
  const { clientServerEventChannel, clientPageBundle } = api
  while (true) {
    const someClientServerEvent = yield* takeEvent<ClientServerEvent>(
      clientServerEventChannel
    )
    switch (someClientServerEvent.eventType) {
      case 'clientServerListening':
        break
      case 'clientApiRequest':
        switch (someClientServerEvent.eventPayload.apiRequestType) {
          case 'getAnimationRenderProcessState':
            yield* spawn(getAnimationRenderProcessStateRequestHandler, {
              apiResponse: someClientServerEvent.eventPayload.apiResponse,
            })
            break
          case 'getFrameRenderProcessState':
            yield* spawn(getFrameRenderProcessStateRequestHandler, {
              apiRequest: someClientServerEvent.eventPayload.apiRequest,
              apiResponse: someClientServerEvent.eventPayload.apiResponse,
            })
            break
        }
        break
      case 'clientAssetRequest':
        yield* spawn(getClientAssetRequestHandler, {
          assetRequest: someClientServerEvent.eventPayload.assetRequest,
          assetResponse: someClientServerEvent.eventPayload.assetResponse,
        })
        break
      case 'clientPageRequest':
        yield* spawn(getClientPageRequestHandler, {
          clientPageBundle,
          pageResponse: someClientServerEvent.eventPayload.pageResponse,
        })
        break
    }
  }
}

interface GetAnimationRenderProcessStateRequestHandlerApi
  extends Pick<ClientApiRequestEvent['eventPayload'], 'apiResponse'> {}

function* getAnimationRenderProcessStateRequestHandler(
  api: GetAnimationRenderProcessStateRequestHandlerApi
) {
  const { apiResponse } = api
  const currentAnimationModuleSourceState = yield* select(
    (currentAnimationDevelopmentState) =>
      currentAnimationDevelopmentState.animationModuleSourceState
  )
  switch (currentAnimationModuleSourceState.sourceStatus) {
    case 'sourceInitializing':
      apiResponse.sendStatus(204)
      break
    case 'sourceReady':
      if (
        currentAnimationModuleSourceState.animationRenderProcessState === null
      ) {
        yield* put({
          type: 'spawnAnimationRenderProcess',
          actionPayload: {
            animationModuleSessionVersion:
              currentAnimationModuleSourceState.animationModuleSessionVersion,
          },
        })
      }
      const currentClientAnimationRenderProcessState =
        getClientAnimationRenderProcessState({
          animationModuleSessionVersion:
            currentAnimationModuleSourceState.animationModuleSessionVersion,
          animationRenderProcessState:
            currentAnimationModuleSourceState.animationRenderProcessState,
        })
      apiResponse.statusCode = 200
      apiResponse.send(JSON.stringify(currentClientAnimationRenderProcessState))
      break
  }
}

interface GetFrameRenderProcessStateRequestHandlerApi
  extends Pick<
    ClientApiRequestEvent['eventPayload'],
    'apiResponse' | 'apiRequest'
  > {}

function* getFrameRenderProcessStateRequestHandler(
  api: GetFrameRenderProcessStateRequestHandlerApi
) {
  const { apiResponse, apiRequest } = api
  const currentAnimationModuleSourceState = yield* select(
    (currentAnimationDevelopmentState) =>
      currentAnimationDevelopmentState.animationModuleSourceState
  )
  switch (currentAnimationModuleSourceState.sourceStatus) {
    case 'sourceInitializing':
      apiResponse.sendStatus(204)
      break
    case 'sourceReady':
      const getFrameRenderProcessStateRequestParams = yield* call(() =>
        decodeData<{ frameIndex: number }, { frameIndex: string }>({
          targetCodec: IO.exact(
            IO.type({
              frameIndex: NumberFromString,
            })
          ),
          inputData: apiRequest.params,
        })
      )
      const targetFrameRenderProcessState =
        currentAnimationModuleSourceState.frameRenderProcessStates[
          getFrameRenderProcessStateRequestParams.frameIndex
        ]
      if (targetFrameRenderProcessState === undefined) {
        yield* put({
          type: 'spawnFrameRenderProcess',
          actionPayload: {
            frameIndex: getFrameRenderProcessStateRequestParams.frameIndex,
            animationModuleSessionVersion:
              currentAnimationModuleSourceState.animationModuleSessionVersion,
          },
        })
      }
      const currentClientFrameRenderProcessState =
        getClientFrameRenderProcessState({
          animationModuleSessionVersion:
            currentAnimationModuleSourceState.animationModuleSessionVersion,
          frameRenderProcessState: targetFrameRenderProcessState,
        })
      apiResponse.statusCode = 200
      apiResponse.send(JSON.stringify(currentClientFrameRenderProcessState))
      break
  }
}

interface GetClientAssetRequestHandlerApi
  extends Pick<
    ClientAssetRequestEvent['eventPayload'],
    'assetRequest' | 'assetResponse'
  > {}

function* getClientAssetRequestHandler(api: GetClientAssetRequestHandlerApi) {
  const { assetRequest, assetResponse } = api
  const getClientAssetRequestParams = yield* call(() =>
    decodeData<{ assetFilename: string }>({
      targetCodec: IO.exact(
        IO.type({
          assetFilename: IO.string,
        })
      ),
      inputData: assetRequest.params,
    })
  )
  const currentAvailableAssetsFilePathMap = yield* select(
    (currentAnimationDevelopmentState) =>
      currentAnimationDevelopmentState.availableAssetsFilePathMap
  )
  const targetAssetFilepath =
    currentAvailableAssetsFilePathMap[getClientAssetRequestParams.assetFilename]
  if (targetAssetFilepath) {
    assetResponse.sendFile(targetAssetFilepath)
  } else {
    assetResponse.sendStatus(404)
  }
}

interface GetClientPageRequestHandlerApi
  extends Pick<ClientServerEventHandlerSagaApi, 'clientPageBundle'>,
    Pick<ClientPageRequestEvent['eventPayload'], 'pageResponse'> {}

function* getClientPageRequestHandler(api: GetClientPageRequestHandlerApi) {
  const { pageResponse, clientPageBundle } = api
  pageResponse.statusCode = 200
  pageResponse.setHeader('Content-Type', 'text/html')
  pageResponse.send(
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
