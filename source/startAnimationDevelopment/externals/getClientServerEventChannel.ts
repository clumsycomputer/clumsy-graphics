import { InitialSagaApi } from '../sagas/initialSaga'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import {
  ClientRequestsGraphicAssetEvent,
  ClientRequestsGraphicsRendererProcessStateEvent,
  ClientRequestsPageEvent,
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
      const { clientPageRouter } = getClientPageRouter({
        emitClientServerEvent,
      })
      clientServer.use('/api', clientApiRouter)
      clientServer.use('/asset', clientAssetRouter)
      clientServer.use('/', clientPageRouter)
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
  emitClientServerEvent: ChannelEventEmitter<ClientRequestsGraphicsRendererProcessStateEvent>
}

function getClientApiRouter(api: GetApiRouterApi) {
  const { emitClientServerEvent } = api
  const clientApiRouter = getExpressRouter()
  clientApiRouter.get(
    '/latestAnimationModule/graphicsRendererProcessState',
    (someClientRequest, someServerResponse) => {
      emitClientServerEvent({
        eventType: 'clientRequestsGraphicsRendererProcessState',
        eventPayload: {
          clientRequest: someClientRequest,
          serverResponse: someServerResponse,
        },
      })
    }
  )
  return { clientApiRouter }
}

interface GetClientAssetRouterApi {
  emitClientServerEvent: ChannelEventEmitter<ClientRequestsGraphicAssetEvent>
}

function getClientAssetRouter(api: GetClientAssetRouterApi) {
  const { emitClientServerEvent } = api
  const clientAssetRouter = getExpressRouter()
  clientAssetRouter.get(
    '/:assetFilename',
    (someClientRequest, someServerResponse) => {
      emitClientServerEvent({
        eventType: 'clientRequestsGraphicAsset',
        eventPayload: {
          clientRequest: someClientRequest,
          serverResponse: someServerResponse,
        },
      })
    }
  )
  return { clientAssetRouter }
}

interface GetClientPageRouterApi {
  emitClientServerEvent: ChannelEventEmitter<ClientRequestsPageEvent>
}

function getClientPageRouter(api: GetClientPageRouterApi) {
  const { emitClientServerEvent } = api
  const clientPageRouter = getExpressRouter()
  clientPageRouter.get(
    '/latestAnimationModule/animation',
    (someClientRequest, someServerResponse) => {
      emitClientServerEvent({
        eventType: 'clientRequestsPage',
        eventPayload: {
          clientRequest: someClientRequest,
          serverResponse: someServerResponse,
        },
      })
    }
  )
  clientPageRouter.get(
    '/latestAnimationModule/frame/:frameIndex(\\d+)',
    (someClientRequest, someServerResponse) => {
      emitClientServerEvent({
        eventType: 'clientRequestsPage',
        eventPayload: {
          clientRequest: someClientRequest,
          serverResponse: someServerResponse,
        },
      })
    }
  )
  return { clientPageRouter }
}
