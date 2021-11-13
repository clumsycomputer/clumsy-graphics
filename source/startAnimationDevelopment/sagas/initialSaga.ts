import ChildProcess from 'child_process'
import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import getExpressServer, { Router as getExpressRouter } from 'express'
import * as IO from 'io-ts'
import Path from 'path'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import { NumberFromString } from '../../helpers/codecTypes'
import { decodeData } from '../../helpers/decodeData'
import {
  actionChannel,
  call,
  put,
  select,
  spawn,
  takeActionFromChannel,
  takeEvent,
} from '../helpers/storeEffects'
import { RenderProcessStateAction } from '../models/AnimationDevelopmentAction'
import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
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
  const {
    animationModulePath,
    clientServerPort,
    generatedAssetsDirectoryPath,
    numberOfFrameRendererWorkers,
  } = api

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
        case 'animationModuleSourceChanged':
          yield* put({
            type: 'animationModuleSourceChanged',
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
      const someClientServerEvent = yield* takeEvent<ClientServerEvent>(
        clientServerEventChannel
      )
      switch (someClientServerEvent.eventType) {
        case 'clientServerListening':
          break
        case 'clientApiRequest':
          const { apiRequestType, apiRequest, apiResponse } =
            someClientServerEvent.eventPayload
          switch (apiRequestType) {
            case 'getAnimationRenderProcessState':
              yield* spawn(function* () {
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
                      currentAnimationModuleSourceState.animationRenderProcessState
                    ) {
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify({
                          processStatus:
                            currentAnimationModuleSourceState
                              .animationRenderProcessState.processStatus,
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                        })
                      )
                    } else {
                      yield* put({
                        type: 'spawnAnimationRenderProcess',
                        actionPayload: {
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                        },
                      })
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify({
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                          processStatus: 'processActive',
                        })
                      )
                    }
                }
              })
              break
            case 'getFrameRenderProcessState':
              yield* spawn(function* () {
                const currentAnimationModuleSourceState = yield* select(
                  (currentAnimationDevelopmentState) =>
                    currentAnimationDevelopmentState.animationModuleSourceState
                )
                switch (currentAnimationModuleSourceState.sourceStatus) {
                  case 'sourceInitializing':
                    apiResponse.sendStatus(204)
                    break
                  case 'sourceReady':
                    const currentRequestParams = yield* call(() =>
                      decodeData<{ frameIndex: number }>({
                        targetCodec: IO.exact(
                          IO.type({
                            frameIndex: NumberFromString,
                          })
                        ),
                        inputData: apiRequest.params,
                      })
                    )
                    const targetFrameRenderProcessState =
                      currentAnimationModuleSourceState
                        .frameRenderProcessStates[
                        currentRequestParams.frameIndex
                      ]
                    if (targetFrameRenderProcessState) {
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify({
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                          processStatus:
                            targetFrameRenderProcessState.processStatus,
                        })
                      )
                    } else {
                      yield* put({
                        type: 'spawnFrameRenderProcess',
                        actionPayload: {
                          frameIndex: currentRequestParams.frameIndex,
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                        },
                      })
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify({
                          taskStatus: 'renderTaskInProgress',
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                        })
                      )
                    }
                    break
                }
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
    const someRenderProcessStateActionChannel =
      yield* actionChannel<RenderProcessStateAction>(
        [
          'animationModuleSourceChanged',
          'spawnAnimationRenderProcess',
          'spawnFrameRenderProcess',
        ],
        SagaBuffers.expanding(3)
      )
    while (true) {
      const someRenderProcessStateAction =
        yield* takeActionFromChannel<RenderProcessStateAction>(
          someRenderProcessStateActionChannel
        )
      const currentAnimationModuleSourceState = yield* select(
        (currentAnimationDevelopmentState) =>
          currentAnimationDevelopmentState.animationModuleSourceState
      )
      if (currentAnimationModuleSourceState.sourceStatus === 'sourceReady') {
        switch (someRenderProcessStateAction.type) {
          case 'animationModuleSourceChanged':
            yield* call(function* () {
              terminateActiveRenderProcesses({
                currentAnimationModuleSourceState,
              })
              yield* put({
                type: 'animationModuleSourceUpdated',
                actionPayload: {
                  animationModuleSessionVersion:
                    someRenderProcessStateAction.actionPayload
                      .animationModuleSessionVersion,
                },
              })
            })
            break
          case 'spawnAnimationRenderProcess':
            if (
              currentAnimationModuleSourceState.animationModuleSessionVersion ===
                someRenderProcessStateAction.actionPayload
                  .animationModuleSessionVersion &&
              currentAnimationModuleSourceState.animationRenderProcessState ===
                null
            ) {
              yield* call(function* () {
                const { spawnedAnimationRenderProcess } =
                  spawnAnimationRenderProcess({
                    animationModulePath,
                    numberOfFrameRendererWorkers,
                    generatedAssetsDirectoryPath,
                  })
                yield* put({
                  type: 'animationRenderProcessActive',
                  actionPayload: {
                    spawnedAnimationRenderProcess,
                  },
                })
                yield* spawn(function* () {
                  const { renderTaskExitCode } = yield* call(
                    () =>
                      new Promise<{ renderTaskExitCode: number | null }>(
                        (resolve) => {
                          spawnedAnimationRenderProcess.once(
                            'exit',
                            (renderTaskExitCode) => {
                              resolve({
                                renderTaskExitCode,
                              })
                            }
                          )
                        }
                      )
                  )
                  switch (renderTaskExitCode) {
                    case 0:
                      yield* put({
                        type: 'animationRenderProcessSuccessful',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessStateAction.actionPayload
                              .animationModuleSessionVersion,
                        },
                      })
                      break
                    case 1:
                      yield* put({
                        type: 'animationRenderProcessFailed',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessStateAction.actionPayload
                              .animationModuleSessionVersion,
                        },
                      })
                      break
                    case null:
                      // animationRenderProcess was terminated
                      break
                  }
                })
              })
            }
            break
          case 'spawnFrameRenderProcess':
            yield* call(function* () {})
            break
        }
      }
    }
  })
}

interface TerminateActiveRenderProcessesApi {
  currentAnimationModuleSourceState: AnimationModuleSourceReadyState
}

function terminateActiveRenderProcesses(
  api: TerminateActiveRenderProcessesApi
) {
  const { currentAnimationModuleSourceState } = api
  currentAnimationModuleSourceState.animationRenderProcessState?.spawnedProcess.kill(
    'SIGINT'
  )
  Object.values(
    currentAnimationModuleSourceState.frameRenderProcessStates
  ).forEach((someFrameRenderProcess) => {
    someFrameRenderProcess.spawnedProcess.kill('SIGINT')
  })
}

export interface SpawnAnimationRenderProcessApi
  extends Pick<
    InitialSagaApi,
    | 'animationModulePath'
    | 'numberOfFrameRendererWorkers'
    | 'generatedAssetsDirectoryPath'
  > {}

export function spawnAnimationRenderProcess(
  api: SpawnAnimationRenderProcessApi
) {
  const {
    animationModulePath,
    numberOfFrameRendererWorkers,
    generatedAssetsDirectoryPath,
  } = api
  const spawnedAnimationRenderProcess = ChildProcess.spawn(
    'graphics-renderer',
    [
      'renderAnimation',
      `--animationModulePath=${Path.resolve(animationModulePath)}`,
      `--numberOfFrameRendererWorkers=${numberOfFrameRendererWorkers}`,
      `--outputDirectoryPath=${generatedAssetsDirectoryPath}`,
    ]
  )
  return { spawnedAnimationRenderProcess }
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
                eventType: 'animationModuleSourceChanged',
                eventPayload: {
                  animationModuleSessionVersion,
                },
              })
            },
          },
        }).then(() => {
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleSourceChanged',
            eventPayload: {
              animationModuleSessionVersion,
            },
          })
        })
        return () => {}
      },
      SagaBuffers.sliding(1)
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
    '/latestAnimationModule/animationRenderProcessState',
    (someGetAnimationRenderTaskRequest, getAnimationRenderTaskResponse) => {
      emitClientServerEvent({
        eventType: 'clientApiRequest',
        eventPayload: {
          apiRequestType: 'getAnimationRenderProcessState',
          apiRequest: someGetAnimationRenderTaskRequest,
          apiResponse: getAnimationRenderTaskResponse,
        },
      })
    }
  )
  clientApiRouter.get(
    '/latestAnimationModule/frameRenderProcessState/:frameIndex',
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
  clientAssetRouter.get('/:assetFilename', () => {
    emitClientServerEvent({
      eventType: 'clientAssetRequest',
      eventPayload: {},
    })
  })
  return { clientAssetRouter }
}
