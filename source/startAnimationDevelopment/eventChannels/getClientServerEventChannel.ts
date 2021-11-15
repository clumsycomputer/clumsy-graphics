import { InitialSagaApi } from '../sagas/initialSaga'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import {
  ClientApiRequestEvent,
  ClientAssetRequestEvent,
  ClientServerEvent,
} from '../models/ClientServerEvent'
import getExpressServer, { Router as getExpressRouter } from 'express'
import { ChannelEventEmitter } from '../models/common'

export interface GetClientServerEventChannelApi
  extends Pick<InitialSagaApi, 'clientServerPort'> {}

export function getClientServerEventChannel(
  api: GetClientServerEventChannelApi
) {
  const { clientServerPort } = api
  const clientServerEventChannel = getEventChannel<ClientServerEvent>(
    (emitClientServerEvent) => {
      const clientServer = getExpressServer()
      const { clientApiRouter } = getClientApiRouter({
        emitClientServerEvent,
      })
      const { clientAssetRouter } = getClientAssetRouter({
        emitClientServerEvent,
      })
      clientServer.use('/api', clientApiRouter)
      clientServer.use('/asset', clientAssetRouter)
      clientServer.listen(clientServerPort, () => {
        emitClientServerEvent({
          eventType: 'clientServerListening',
          eventPayload: {},
        })
      })
      return () => {}
    },
    SagaBuffers.expanding(5)
  )
  return { clientServerEventChannel }
}

interface GetApiRouterApi {
  emitClientServerEvent: ChannelEventEmitter<ClientApiRequestEvent>
}

function getClientApiRouter(api: GetApiRouterApi) {
  const { emitClientServerEvent } = api
  const clientApiRouter = getExpressRouter()
  clientApiRouter.get(
    '/latestAnimationModule/animationRenderProcessState',
    (
      someGetAnimationRenderProcessStateRequest,
      getAnimationRenderProcessStateResponse
    ) => {
      emitClientServerEvent({
        eventType: 'clientApiRequest',
        eventPayload: {
          apiRequestType: 'getAnimationRenderProcessState',
          apiRequest: someGetAnimationRenderProcessStateRequest,
          apiResponse: getAnimationRenderProcessStateResponse,
        },
      })
    }
  )
  clientApiRouter.get(
    '/latestAnimationModule/frameRenderProcessState/:frameIndex(\\d+)',
    (someGetFrameRenderTaskRequest, getFrameRenderTaskResponse) => {
      emitClientServerEvent({
        eventType: 'clientApiRequest',
        eventPayload: {
          apiRequestType: 'getFrameRenderProcessState',
          apiRequest: someGetFrameRenderTaskRequest,
          apiResponse: getFrameRenderTaskResponse,
        },
      })
    }
  )
  return { clientApiRouter }
}

interface GetClientAssetRouterApi {
  emitClientServerEvent: ChannelEventEmitter<ClientAssetRequestEvent>
}

function getClientAssetRouter(api: GetClientAssetRouterApi) {
  const { emitClientServerEvent } = api
  const clientAssetRouter = getExpressRouter()
  clientAssetRouter.get(
    '/:assetFilename',
    (someGetAssetRequest, getAssetResponse) => {
      emitClientServerEvent({
        eventType: 'clientAssetRequest',
        eventPayload: {
          assetRequest: someGetAssetRequest,
          assetResponse: getAssetResponse,
        },
      })
    }
  )
  return { clientAssetRouter }
}
