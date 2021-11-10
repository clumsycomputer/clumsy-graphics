import { select } from '@redux-saga/core/effects'
import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import getExpressServer, { Router as getExpressRouter } from 'express'
import Path from 'path'
import {
  eventChannel as getEventChannel,
  buffers as SagaBuffers,
} from 'redux-saga'
import {
  actionChannel,
  call,
  put,
  spawn,
  takeActionFromChannel,
  takeEvent,
} from '../helpers/storeEffects'
import {
  AnimationModuleSourceUpdatedAction,
  ClientRequestsAnimationRenderTaskAction,
  ClientRequestsFrameRenderTaskAction,
} from '../models/AnimationDevelopmentAction'
import { AnimationModuleSourceEvent } from '../models/AnimationModuleSourceEvent'
import {
  ClientApiRequestEvent,
  ClientAssetRequestEvent,
  ClientServerEvent,
} from '../models/ClientServerEvent'
import { ChannelEventEmitter } from '../models/common'
import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment'

export interface InitialSagaApi
  extends Pick<
    StartAnimationDevelopmentApi,
    | 'animationModulePath'
    | 'generatedAssetsDirectoryPath'
    | 'clientServerPort'
    | 'numberOfFrameRendererWorkers'
  > {}

export function* initialSaga(api: InitialSagaApi) {
  const { animationModulePath, clientServerPort } = api
  yield* spawn(function* () {
    const { animationModuleSourceEventChannel } =
      getAnimationModuleSourceEventChannel({
        animationModulePath,
      })
    while (true) {
      const someAnimationModuleSourceEvent =
        yield* takeEvent<AnimationModuleSourceEvent>(
          animationModuleSourceEventChannel
        )
      switch (someAnimationModuleSourceEvent.eventType) {
        case 'animationModuleSourceUpdated':
          yield* put({
            type: 'animationModuleSourceUpdated',
            actionPayload: {
              animationModuleSessionVersion:
                someAnimationModuleSourceEvent.eventPayload
                  .animationModuleSessionVersion,
            },
          })
          break
      }
    }
  })
  yield* spawn(function* () {
    const { clientServerEventChannel } = getClientServerEventChannel({
      clientServerPort,
    })
    while (true) {
      const someClientServerEvent = yield* takeEvent(clientServerEventChannel)
      switch (someClientServerEvent.eventType) {
        case 'clientServerListening':
          break
        case 'clientApiRequest':
          const { apiRequestType } = someClientServerEvent.eventPayload
          switch (apiRequestType) {
            case 'getAnimationRenderTask':
              yield* put({
                type: 'clientRequestsAnimationRenderTask',
                actionPayload: {},
              })
              break
            case 'getFrameRenderTask':
              yield* put({
                type: 'clientRequestsFrameRenderTask',
                actionPayload: {},
              })
              break
          }
          break
        case 'clientAssetRequest':
          yield* spawn(function* () {})
          break
      }
    }
  })
  yield* spawn(function* () {
    const someAnimationModuleSourceStateActionChannel = yield* actionChannel<
      | AnimationModuleSourceUpdatedAction
      | ClientRequestsAnimationRenderTaskAction
      | ClientRequestsFrameRenderTaskAction
    >(
      [
        'animationModuleSourceUpdated',
        'clientRequestsAnimationRenderTask',
        'clientRequestsFrameRenderTask',
      ],
      SagaBuffers.expanding(3)
    )
    while (true) {
      const someAnimationModuleSourceStateAction = yield* takeActionFromChannel(
        someAnimationModuleSourceStateActionChannel
      )
      switch (someAnimationModuleSourceStateAction.type) {
        case 'animationModuleSourceUpdated':
          yield* call(function* () {
            yield* put({
              type: 'activeRenderTasksCleanedUp',
              actionPayload: {},
            })
          })
          break
        case 'clientRequestsAnimationRenderTask':
          yield* spawn(function* () {})
          break
        case 'clientRequestsFrameRenderTask':
          yield* spawn(function* () {})
          break
      }
    }
  })
}

interface GetAnimationModuleSourceEventChannelApi
  extends Pick<InitialSagaApi, 'animationModulePath'> {}

function getAnimationModuleSourceEventChannel(
  api: GetAnimationModuleSourceEventChannelApi
) {
  const { animationModulePath } = api
  const animationModuleSourceEventChannel =
    getEventChannel<AnimationModuleSourceEvent>(
      (emitAnimationModuleSourceEvent) => {
        let animationModuleSessionVersion = 0
        buildModule({
          platform: 'node',
          bundle: true,
          write: false,
          incremental: true,
          absWorkingDir: process.cwd(),
          entryPoints: [Path.resolve(animationModulePath)],
          plugins: [getNodeExternalsPlugin()],
          watch: {
            onRebuild: () => {
              animationModuleSessionVersion = animationModuleSessionVersion + 1
              emitAnimationModuleSourceEvent({
                eventType: 'animationModuleSourceUpdated',
                eventPayload: {
                  animationModuleSessionVersion,
                },
              })
            },
          },
        }).then(() => {
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleSourceUpdated',
            eventPayload: {
              animationModuleSessionVersion,
            },
          })
        })
        return () => {}
      },
      SagaBuffers.expanding(2)
    )
  return { animationModuleSourceEventChannel }
}

interface GetClientServerEventChannelApi
  extends Pick<InitialSagaApi, 'clientServerPort'> {}

function getClientServerEventChannel(api: GetClientServerEventChannelApi) {
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
    '/latestAnimationModule/animationRenderTask',
    (someGetAnimationRenderTaskRequest, getAnimationRenderTaskResponse) => {
      emitClientServerEvent({
        eventType: 'clientApiRequest',
        eventPayload: {
          apiRequestType: 'getAnimationRenderTask',
          clientRequest: someGetAnimationRenderTaskRequest,
          serverResponse: getAnimationRenderTaskResponse,
        },
      })
    }
  )
  clientApiRouter.get(
    '/latestAnimationModule/frameRenderTask/:frameIndex',
    (someGetFrameRenderTaskRequest, getFrameRenderTaskResponse) => {
      emitClientServerEvent({
        eventType: 'clientApiRequest',
        eventPayload: {
          apiRequestType: 'getFrameRenderTask',
          clientRequest: someGetFrameRenderTaskRequest,
          serverResponse: getFrameRenderTaskResponse,
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
  clientAssetRouter.get('/:assetFilename', () => {
    emitClientServerEvent({
      eventType: 'clientAssetRequest',
      eventPayload: {},
    })
  })
  return { clientAssetRouter }
}
