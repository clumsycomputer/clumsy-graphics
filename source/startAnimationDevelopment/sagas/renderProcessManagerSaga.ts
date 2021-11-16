import {
  ChildProcessWithoutNullStreams,
  spawn as spawnChildProcess,
} from 'child_process'
import Path from 'path'
import {
  EventChannel,
  eventChannel as getEventChannel,
  buffers as SagaBuffers,
} from 'redux-saga'
import { SagaReturnType } from 'redux-saga/effects'
import {
  call,
  put,
  select,
  spawn,
  takeActionFromChannel,
  takeEvent,
} from '../helpers/storeEffects'
import {
  RenderProcessManagerAction,
  SpawnFrameRenderProcessAction,
} from '../models/AnimationDevelopmentAction'
import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
import { SpawnedGraphicsRendererProcessEvent } from '../models/SpawnedGraphicsRendererProcessEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'
import { InitialSagaApi } from './initialSaga'

export interface RenderProcessManagerSagaApi
  extends Pick<
      InitialSagaApi,
      | 'generatedAssetsDirectoryPath'
      | 'animationModulePath'
      | 'numberOfFrameRendererWorkers'
    >,
    Pick<
      SagaReturnType<typeof animationDevelopmentSetupSaga>,
      'renderProcessManagerActionChannel'
    > {}

export function* renderProcessManagerSaga(api: RenderProcessManagerSagaApi) {
  const {
    renderProcessManagerActionChannel,
    generatedAssetsDirectoryPath,
    animationModulePath,
    numberOfFrameRendererWorkers,
  } = api
  while (true) {
    const someRenderProcessManagerAction =
      yield* takeActionFromChannel<RenderProcessManagerAction>(
        renderProcessManagerActionChannel
      )
    const currentAnimationModuleSourceState = yield* select(
      (currentAnimationDevelopmentState) =>
        currentAnimationDevelopmentState.animationModuleSourceState
    )
    if (
      currentAnimationModuleSourceState.sourceStatus === 'sourceInitializing' &&
      someRenderProcessManagerAction.type === 'animationModuleSourceChanged'
    ) {
      yield* put({
        type: 'animationModuleSourceUpdated',
        actionPayload: {
          animationModuleSessionVersion:
            someRenderProcessManagerAction.actionPayload
              .animationModuleSessionVersion,
        },
      })
    } else if (
      currentAnimationModuleSourceState.sourceStatus === 'sourceReady'
    ) {
      switch (someRenderProcessManagerAction.type) {
        case 'animationModuleSourceChanged':
          yield* call(function* () {
            terminateActiveRenderProcesses({
              currentAnimationModuleSourceState,
            })
            yield* put({
              type: 'animationModuleSourceUpdated',
              actionPayload: {
                animationModuleSessionVersion:
                  someRenderProcessManagerAction.actionPayload
                    .animationModuleSessionVersion,
              },
            })
          })
          break
        case 'spawnAnimationRenderProcess':
          if (
            currentAnimationModuleSourceState.animationModuleSessionVersion ===
              someRenderProcessManagerAction.actionPayload
                .animationModuleSessionVersion &&
            currentAnimationModuleSourceState.animationRenderProcessState ===
              null
          ) {
            yield* call(function* () {
              const targetAnimationMp4OutputPath = Path.resolve(
                generatedAssetsDirectoryPath,
                `${someRenderProcessManagerAction.actionPayload.animationModuleSessionVersion}.mp4`
              )
              const {
                spawnedAnimationRenderProcess,
                spawnedAnimationRenderProcessEventChannel,
              } = spawnAnimationRenderProcess({
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
                let animationRenderProcessRunning = true
                while (animationRenderProcessRunning) {
                  const someSpawnedAnimationRenderProcessEvent =
                    yield* takeEvent<SpawnedGraphicsRendererProcessEvent>(
                      spawnedAnimationRenderProcessEventChannel
                    )
                  switch (someSpawnedAnimationRenderProcessEvent.eventType) {
                    case 'graphicsRendererProcessMessage':
                      yield* put({
                        type: 'animationRenderProcessUpdate',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessManagerAction.actionPayload
                              .animationModuleSessionVersion,
                          animationRenderProcessMessage:
                            someSpawnedAnimationRenderProcessEvent.eventPayload
                              .graphicsRendererProcessMessage,
                        },
                      })
                      break
                    case 'graphicsRendererProcessSuccessful':
                      yield* put({
                        type: 'animationRenderProcessSuccessful',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessManagerAction.actionPayload
                              .animationModuleSessionVersion,
                          animationAssetPath: targetAnimationMp4OutputPath,
                        },
                      })
                      break
                    case 'graphicsRendererProcessFailed':
                      yield* put({
                        type: 'animationRenderProcessFailed',
                        actionPayload: {
                          animationRenderProcessErrorMessage:
                            someSpawnedAnimationRenderProcessEvent.eventPayload
                              .graphicsRendererProcessErrorMessage,
                          targetAnimationModuleSessionVersion:
                            someRenderProcessManagerAction.actionPayload
                              .animationModuleSessionVersion,
                        },
                      })
                      break
                    case 'graphicsRendererProcessTerminated':
                      break
                  }
                  if (
                    someSpawnedAnimationRenderProcessEvent.eventType ===
                      'graphicsRendererProcessSuccessful' ||
                    someSpawnedAnimationRenderProcessEvent.eventType ===
                      'graphicsRendererProcessFailed' ||
                    someSpawnedAnimationRenderProcessEvent.eventType ===
                      'graphicsRendererProcessTerminated'
                  ) {
                    animationRenderProcessRunning = false
                  }
                }
              })
            })
          }
          break
        case 'spawnFrameRenderProcess':
          if (
            currentAnimationModuleSourceState.animationModuleSessionVersion ===
              someRenderProcessManagerAction.actionPayload
                .animationModuleSessionVersion &&
            currentAnimationModuleSourceState.frameRenderProcessStates[
              someRenderProcessManagerAction.actionPayload.frameIndex
            ] === undefined
          ) {
            yield* call(function* () {
              const targetFramePngOutputPath = Path.resolve(
                generatedAssetsDirectoryPath,
                `${someRenderProcessManagerAction.actionPayload.animationModuleSessionVersion}_${someRenderProcessManagerAction.actionPayload.frameIndex}.png`
              )
              const {
                spawnedFrameRenderProcess,
                spawnedFrameRenderProcessEventChannel,
              } = spawnFrameRenderProcess({
                animationModulePath,
                frameIndex:
                  someRenderProcessManagerAction.actionPayload.frameIndex,
                frameFileOutputPath: targetFramePngOutputPath,
              })
              yield* put({
                type: 'frameRenderProcessActive',
                actionPayload: {
                  spawnedFrameRenderProcess,
                  frameIndex:
                    someRenderProcessManagerAction.actionPayload.frameIndex,
                },
              })
              yield* spawn(function* () {
                let frameRenderProcessRunning = true
                while (frameRenderProcessRunning) {
                  const someSpawnedFrameRenderProcessEvent =
                    yield* takeEvent<SpawnedGraphicsRendererProcessEvent>(
                      spawnedFrameRenderProcessEventChannel
                    )
                  switch (someSpawnedFrameRenderProcessEvent.eventType) {
                    case 'graphicsRendererProcessMessage':
                      yield* put({
                        type: 'frameRenderProcessUpdate',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessManagerAction.actionPayload
                              .animationModuleSessionVersion,
                          targetFrameIndex:
                            someRenderProcessManagerAction.actionPayload
                              .frameIndex,
                          frameRenderProcessMessage:
                            someSpawnedFrameRenderProcessEvent.eventPayload
                              .graphicsRendererProcessMessage,
                        },
                      })
                      break
                    case 'graphicsRendererProcessSuccessful':
                      yield* put({
                        type: 'frameRenderProcessSuccessful',
                        actionPayload: {
                          targetAnimationModuleSessionVersion:
                            someRenderProcessManagerAction.actionPayload
                              .animationModuleSessionVersion,
                          targetFrameIndex:
                            someRenderProcessManagerAction.actionPayload
                              .frameIndex,
                          frameAssetPath: targetFramePngOutputPath,
                        },
                      })
                      break
                    case 'graphicsRendererProcessFailed':
                      yield* put({
                        type: 'frameRenderProcessFailed',
                        actionPayload: {
                          frameRenderProcessErrorMessage:
                            someSpawnedFrameRenderProcessEvent.eventPayload
                              .graphicsRendererProcessErrorMessage,
                          targetAnimationModuleSessionVersion:
                            someRenderProcessManagerAction.actionPayload
                              .animationModuleSessionVersion,
                          targetFrameIndex:
                            someRenderProcessManagerAction.actionPayload
                              .frameIndex,
                        },
                      })
                      break
                    case 'graphicsRendererProcessTerminated':
                      break
                  }
                  if (
                    someSpawnedFrameRenderProcessEvent.eventType ===
                      'graphicsRendererProcessSuccessful' ||
                    someSpawnedFrameRenderProcessEvent.eventType ===
                      'graphicsRendererProcessFailed' ||
                    someSpawnedFrameRenderProcessEvent.eventType ===
                      'graphicsRendererProcessTerminated'
                  ) {
                    frameRenderProcessRunning = false
                  }
                }
              })
            })
          }
          break
      }
    }
  }
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
  const [
    spawnedAnimationRenderProcess,
    spawnedAnimationRenderProcessEventChannel,
  ] = spawnGraphicsRendererProcess({
    graphicsRendererCommand: `graphics-renderer renderAnimation --animationModulePath=${Path.resolve(
      animationModulePath
    )} --animationMp4OutputPath=${animationMp4OutputPath} --numberOfFrameRendererWorkers=${numberOfFrameRendererWorkers}`,
  })
  return {
    spawnedAnimationRenderProcess,
    spawnedAnimationRenderProcessEventChannel,
  }
}

export interface SpawnFrameRenderProcessApi
  extends Pick<InitialSagaApi, 'animationModulePath'>,
    Pick<SpawnFrameRenderProcessAction['actionPayload'], 'frameIndex'> {
  frameFileOutputPath: string
}

export function spawnFrameRenderProcess(api: SpawnFrameRenderProcessApi) {
  const { animationModulePath, frameIndex, frameFileOutputPath } = api
  const [spawnedFrameRenderProcess, spawnedFrameRenderProcessEventChannel] =
    spawnGraphicsRendererProcess({
      graphicsRendererCommand: `graphics-renderer renderAnimationFrame --animationModulePath=${Path.resolve(
        animationModulePath
      )} --frameIndex=${frameIndex} --frameFileOutputPath=${frameFileOutputPath}`,
    })
  return {
    spawnedFrameRenderProcess,
    spawnedFrameRenderProcessEventChannel,
  }
}

interface SpawnGraphicsRendererProcessApi {
  graphicsRendererCommand: string
}

function spawnGraphicsRendererProcess(
  api: SpawnGraphicsRendererProcessApi
): [
  ChildProcessWithoutNullStreams,
  EventChannel<SpawnedGraphicsRendererProcessEvent>
] {
  const { graphicsRendererCommand } = api
  const graphicsRendererCommandTokens = graphicsRendererCommand.split(' ')
  const [
    mainGraphicsRendererCommandToken,
    ...graphicsRendererCommandArgumentTokens
  ] = graphicsRendererCommandTokens
  const spawnedGraphicsRendererProcess = spawnChildProcess(
    mainGraphicsRendererCommandToken!,
    graphicsRendererCommandArgumentTokens,
    {
      stdio: 'pipe',
    }
  )
  const { spawnedGraphicsRendererProcessEventChannel } =
    getSpawnedGraphicsRendererProcessEventChannel({
      spawnedGraphicsRendererProcess,
    })
  return [
    spawnedGraphicsRendererProcess,
    spawnedGraphicsRendererProcessEventChannel,
  ]
}

interface GetSpawnedGraphicsRendererProcessEventChannelApi {
  spawnedGraphicsRendererProcess: ChildProcessWithoutNullStreams
}

function getSpawnedGraphicsRendererProcessEventChannel(
  api: GetSpawnedGraphicsRendererProcessEventChannelApi
) {
  const { spawnedGraphicsRendererProcess } = api
  const spawnedGraphicsRendererProcessEventChannel =
    getEventChannel<SpawnedGraphicsRendererProcessEvent>(
      (emitGraphicsRendererProcessEvent) => {
        spawnedGraphicsRendererProcess.stdout.setEncoding('utf-8')
        spawnedGraphicsRendererProcess.stdout.on('data', (someStdoutData) => {
          if (typeof someStdoutData === 'string') {
            const graphicsRendererProcessMessageTokens =
              someStdoutData.split(/\r?\n/)
            const graphicsRendererProcessMessage =
              graphicsRendererProcessMessageTokens[
                graphicsRendererProcessMessageTokens.length - 2
              ]
            if (graphicsRendererProcessMessage) {
              emitGraphicsRendererProcessEvent({
                eventType: 'graphicsRendererProcessMessage',
                eventPayload: {
                  graphicsRendererProcessMessage,
                },
              })
            } else {
              throw new Error('wtf? graphicsRendererProcessMessageTokens')
            }
          } else {
            throw new Error('wtf? someStdoutData')
          }
        })
        const spawnedGraphicsRendererProcessErrorMessagePromise = new Promise<{
          graphicsRendererProcessErrorMessage: string
        }>((resolve) => {
          let graphicsRendererProcessErrorMessage: string | null = null
          spawnedGraphicsRendererProcess.stderr.setEncoding('utf-8')
          spawnedGraphicsRendererProcess.stderr.on('data', (someStderrData) => {
            if (typeof someStderrData === 'string') {
              graphicsRendererProcessErrorMessage =
                graphicsRendererProcessErrorMessage
                  ? `${spawnedGraphicsRendererProcess}${someStderrData}`
                  : someStderrData
            } else {
              throw new Error('wtf? spawnedGraphicsRendererProcess.stderr')
            }
          })
          spawnedGraphicsRendererProcess.stderr.once('end', () => {
            resolve({
              graphicsRendererProcessErrorMessage:
                graphicsRendererProcessErrorMessage ||
                'wtf? graphicsRendererProcessErrorMessage',
            })
          })
        })
        spawnedGraphicsRendererProcess.once(
          'exit',
          async (graphicsRendererProcessExitCode) => {
            switch (graphicsRendererProcessExitCode) {
              case 0:
                emitGraphicsRendererProcessEvent({
                  eventType: 'graphicsRendererProcessSuccessful',
                  eventPayload: {},
                })
                break
              case 1:
                const { graphicsRendererProcessErrorMessage } =
                  await spawnedGraphicsRendererProcessErrorMessagePromise
                emitGraphicsRendererProcessEvent({
                  eventType: 'graphicsRendererProcessFailed',
                  eventPayload: {
                    graphicsRendererProcessErrorMessage,
                  },
                })
                break
              case null:
                emitGraphicsRendererProcessEvent({
                  eventType: 'graphicsRendererProcessTerminated',
                  eventPayload: {},
                })
                break
            }
          }
        )
        return () => {}
      },
      SagaBuffers.expanding(10)
    )
  return { spawnedGraphicsRendererProcessEventChannel }
}
