import ChildProcess from 'child_process'
import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import getExpressServer, { Router as getExpressRouter } from 'express'
import FileSystem from 'fs'
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
import {
  RenderProcessStateAction,
  SpawnFrameRenderProcessAction,
} from '../models/AnimationDevelopmentAction'
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
  yield* call(() => {
    FileSystem.rmSync(Path.resolve(generatedAssetsDirectoryPath), {
      recursive: true,
      force: true,
    })
    FileSystem.mkdirSync(Path.resolve(generatedAssetsDirectoryPath))
  })
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
                      const {
                        spawnedProcess,
                        ...clientAnimationRenderProcessState
                      } =
                        currentAnimationModuleSourceState.animationRenderProcessState
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify(clientAnimationRenderProcessState)
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
                          // animationModuleSessionVersion:
                          //   currentAnimationModuleSourceState.animationModuleSessionVersion,
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
                    const getFrameRenderProcessStateRequestParams = yield* call(
                      () =>
                        decodeData<
                          { frameIndex: number },
                          { frameIndex: string }
                        >({
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
                        getFrameRenderProcessStateRequestParams.frameIndex
                      ]
                    if (targetFrameRenderProcessState) {
                      const {
                        spawnedProcess,
                        ...clientFrameRenderProcessState
                      } = targetFrameRenderProcessState
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify(clientFrameRenderProcessState)
                      )
                    } else {
                      yield* put({
                        type: 'spawnFrameRenderProcess',
                        actionPayload: {
                          frameIndex:
                            getFrameRenderProcessStateRequestParams.frameIndex,
                          animationModuleSessionVersion:
                            currentAnimationModuleSourceState.animationModuleSessionVersion,
                        },
                      })
                      apiResponse.statusCode = 200
                      apiResponse.send(
                        JSON.stringify({
                          processStatus: 'processActive',
                          // animationModuleSessionVersion:
                          //   currentAnimationModuleSourceState.animationModuleSessionVersion,
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
          yield* spawn(function* () {
            const getClientAssetRequestParams = yield* call(() =>
              decodeData<{ assetFilename: string }>({
                targetCodec: IO.exact(
                  IO.type({
                    assetFilename: IO.string,
                  })
                ),
                inputData:
                  someClientServerEvent.eventPayload.assetRequest.params,
              })
            )
            const currentAvailableAssetsFilePathMap = yield* select(
              (currentAnimationDevelopmentState) =>
                currentAnimationDevelopmentState.availableAssetsFilePathMap
            )
            const targetAssetFilepath =
              currentAvailableAssetsFilePathMap[
                getClientAssetRequestParams.assetFilename
              ]
            if (targetAssetFilepath) {
              someClientServerEvent.eventPayload.assetResponse.sendFile(
                targetAssetFilepath
              )
            } else {
              someClientServerEvent.eventPayload.assetResponse.sendStatus(404)
            }
          })
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
      if (
        currentAnimationModuleSourceState.sourceStatus ===
          'sourceInitializing' &&
        someRenderProcessStateAction.type === 'animationModuleSourceChanged'
      ) {
        yield* put({
          type: 'animationModuleSourceUpdated',
          actionPayload: {
            animationModuleSessionVersion:
              someRenderProcessStateAction.actionPayload
                .animationModuleSessionVersion,
          },
        })
      } else if (
        currentAnimationModuleSourceState.sourceStatus === 'sourceReady'
      ) {
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
                const targetAnimationMp4OutputPath = Path.resolve(
                  generatedAssetsDirectoryPath,
                  `${someRenderProcessStateAction.actionPayload.animationModuleSessionVersion}.mp4`
                )
                const { spawnedAnimationRenderProcess } =
                  spawnAnimationRenderProcess({
                    animationModulePath,
                    numberOfFrameRendererWorkers,
                    animationMp4OutputPath: targetAnimationMp4OutputPath,
                  })
                yield* put({
                  type: 'animationRenderProcessActive',
                  actionPayload: {
                    spawnedAnimationRenderProcess,
                  },
                })
                yield* spawn(function* () {
                  const { renderProcessExitCode } = yield* call(
                    () =>
                      new Promise<{ renderProcessExitCode: number | null }>(
                        (resolve) => {
                          spawnedAnimationRenderProcess.once(
                            'exit',
                            (renderProcessExitCode) => {
                              resolve({
                                renderProcessExitCode,
                              })
                            }
                          )
                        }
                      )
                  )
                  switch (renderProcessExitCode) {
                    case 0:
                      yield* put({
                        type: 'animationRenderProcessSuccessful',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessStateAction.actionPayload
                              .animationModuleSessionVersion,
                          animationAssetPath: targetAnimationMp4OutputPath,
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
            if (
              currentAnimationModuleSourceState.animationModuleSessionVersion ===
                someRenderProcessStateAction.actionPayload
                  .animationModuleSessionVersion &&
              currentAnimationModuleSourceState.frameRenderProcessStates[
                someRenderProcessStateAction.actionPayload.frameIndex
              ] === undefined
            ) {
              yield* call(function* () {
                const targetFramePngOutputPath = Path.resolve(
                  generatedAssetsDirectoryPath,
                  `${someRenderProcessStateAction.actionPayload.animationModuleSessionVersion}_${someRenderProcessStateAction.actionPayload.frameIndex}.png`
                )
                const { spawnedFrameRenderProcess } = spawnFrameRenderProcess({
                  animationModulePath,
                  frameIndex:
                    someRenderProcessStateAction.actionPayload.frameIndex,
                  frameFileOutputPath: targetFramePngOutputPath,
                })
                yield* put({
                  type: 'frameRenderProcessActive',
                  actionPayload: {
                    spawnedFrameRenderProcess,
                    frameIndex:
                      someRenderProcessStateAction.actionPayload.frameIndex,
                  },
                })
                yield* spawn(function* () {
                  const { renderProcessExitCode } = yield* call(
                    () =>
                      new Promise<{ renderProcessExitCode: number | null }>(
                        (resolve) => {
                          spawnedFrameRenderProcess.once(
                            'exit',
                            (renderProcessExitCode) => {
                              resolve({
                                renderProcessExitCode,
                              })
                            }
                          )
                        }
                      )
                  )
                  switch (renderProcessExitCode) {
                    case 0:
                      yield* put({
                        type: 'frameRenderProcessSuccessful',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessStateAction.actionPayload
                              .animationModuleSessionVersion,
                          targetFrameIndex:
                            someRenderProcessStateAction.actionPayload
                              .frameIndex,
                          frameAssetPath: targetFramePngOutputPath,
                        },
                      })
                      break
                    case 1:
                      yield* put({
                        type: 'frameRenderProcessFailed',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessStateAction.actionPayload
                              .animationModuleSessionVersion,
                          targetFrameIndex:
                            someRenderProcessStateAction.actionPayload
                              .frameIndex,
                        },
                      })
                      break
                    case null:
                      // frameRenderProcess was terminated
                      break
                  }
                })
              })
            }
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
    'animationModulePath' | 'numberOfFrameRendererWorkers'
  > {
  animationMp4OutputPath: string
}

export function spawnAnimationRenderProcess(
  api: SpawnAnimationRenderProcessApi
) {
  const {
    animationModulePath,
    animationMp4OutputPath,
    numberOfFrameRendererWorkers,
  } = api
  const spawnedAnimationRenderProcess = ChildProcess.spawn(
    'graphics-renderer',
    [
      'renderAnimation',
      `--animationModulePath=${Path.resolve(animationModulePath)}`,
      `--animationMp4OutputPath=${animationMp4OutputPath}`,
      `--numberOfFrameRendererWorkers=${numberOfFrameRendererWorkers}`,
    ]
  )
  return { spawnedAnimationRenderProcess }
}

export interface SpawnFrameRenderProcessApi
  extends Pick<InitialSagaApi, 'animationModulePath'>,
    Pick<SpawnFrameRenderProcessAction['actionPayload'], 'frameIndex'> {
  frameFileOutputPath: string
}

export function spawnFrameRenderProcess(api: SpawnFrameRenderProcessApi) {
  const { animationModulePath, frameIndex, frameFileOutputPath } = api
  const spawnedFrameRenderProcess = ChildProcess.spawn('graphics-renderer', [
    'renderAnimationFrame',
    `--animationModulePath=${Path.resolve(animationModulePath)}`,
    `--frameIndex=${frameIndex}`,
    `--frameFileOutputPath=${frameFileOutputPath}`,
  ])
  return { spawnedFrameRenderProcess }
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
