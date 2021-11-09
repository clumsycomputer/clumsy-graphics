import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import Path from 'path'
import { eventChannel as getEventChannel } from 'redux-saga'
import { put, spawn, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleSourceEvent } from '../models/AnimationModuleSourceEvent'
import {
  ClientApiRequestEvent,
  ClientAssetRequestEvent,
  ClientServerEvent,
} from '../models/ClientServerEvent'
import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment'
import getExpressServer, { Router as getExpressRouter } from 'express'
import { ChannelEventEmitter } from '../models/common'

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
      const someAnimationModuleSourceEvent = yield* takeEvent(
        animationModuleSourceEventChannel
      )
      switch (someAnimationModuleSourceEvent.eventType) {
        case 'animationModuleSourceUpdated':
          yield* put({
            type: 'animationModuleSourceUpdated',
            actionPayload: {},
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
          break
        case 'clientAssetRequest':
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
              emitAnimationModuleSourceEvent({
                eventType: 'animationModuleSourceUpdated',
                eventPayload: {},
              })
            },
          },
        }).then(() => {
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleSourceUpdated',
            eventPayload: {},
          })
        })
        return () => {}
      }
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
    }
  )
  return { clientServerEventChannel }
}

interface GetApiRouterApi {
  emitClientServerEvent: ChannelEventEmitter<ClientApiRequestEvent>
}

function getClientApiRouter(api: GetApiRouterApi) {
  const { emitClientServerEvent } = api
  const clientApiRouter = getExpressRouter()
  clientApiRouter.get('/latestAnimationModule/animationRenderTask', () => {
    emitClientServerEvent({
      eventType: 'clientApiRequest',
      eventPayload: {},
    })
  })
  clientApiRouter.get(
    '/latestAnimationModule/frameRenderTask/:frameIndex',
    () => {
      emitClientServerEvent({
        eventType: 'clientApiRequest',
        eventPayload: {},
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
