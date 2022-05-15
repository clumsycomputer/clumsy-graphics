import getExpressServer from 'express'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import { ClientServerEvent } from '../models/ClientServerEvent'
import { InitialSagaApi } from '../sagas/initialSaga'

export interface GetClientServerEventChannelApi
  extends Pick<InitialSagaApi, 'clientServerPort'> {}

export function getClientServerEventChannel(
  api: GetClientServerEventChannelApi
) {
  const { clientServerPort } = api
  const clientServerEventChannel = getEventChannel<ClientServerEvent>(
    (emitClientServerEvent) => {
      const clientServer = getExpressServer()
      clientServer.get(
        '/api/latestAnimationModule/graphicsRendererProcessState',
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
      clientServer.get(
        '/asset/:assetFilename',
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
      clientServer.get('*', (someClientRequest, someServerResponse) => {
        emitClientServerEvent({
          eventType: 'clientRequestsPage',
          eventPayload: {
            clientRequest: someClientRequest,
            serverResponse: someServerResponse,
          },
        })
      })
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
