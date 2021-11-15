import { spawn as spawnChildProcess } from 'child_process'
import Path from 'path'
import { SagaReturnType } from 'redux-saga/effects'
import {
  call,
  put,
  select,
  spawn,
  takeActionFromChannel,
} from '../helpers/storeEffects'
import {
  RenderProcessManagerAction,
  SpawnFrameRenderProcessAction,
} from '../models/AnimationDevelopmentAction'
import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
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
                          someRenderProcessManagerAction.actionPayload
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
                          someRenderProcessManagerAction.actionPayload
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
              const { spawnedFrameRenderProcess } = spawnFrameRenderProcess({
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
                          someRenderProcessManagerAction.actionPayload
                            .animationModuleSessionVersion,
                        targetFrameIndex:
                          someRenderProcessManagerAction.actionPayload
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
                          someRenderProcessManagerAction.actionPayload
                            .animationModuleSessionVersion,
                        targetFrameIndex:
                          someRenderProcessManagerAction.actionPayload
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
  const spawnedAnimationRenderProcess = spawnChildProcess('graphics-renderer', [
    'renderAnimation',
    `--animationModulePath=${Path.resolve(animationModulePath)}`,
    `--animationMp4OutputPath=${animationMp4OutputPath}`,
    `--numberOfFrameRendererWorkers=${numberOfFrameRendererWorkers}`,
  ])
  return { spawnedAnimationRenderProcess }
}

export interface SpawnFrameRenderProcessApi
  extends Pick<InitialSagaApi, 'animationModulePath'>,
    Pick<SpawnFrameRenderProcessAction['actionPayload'], 'frameIndex'> {
  frameFileOutputPath: string
}

export function spawnFrameRenderProcess(api: SpawnFrameRenderProcessApi) {
  const { animationModulePath, frameIndex, frameFileOutputPath } = api
  const spawnedFrameRenderProcess = spawnChildProcess('graphics-renderer', [
    'renderAnimationFrame',
    `--animationModulePath=${Path.resolve(animationModulePath)}`,
    `--frameIndex=${frameIndex}`,
    `--frameFileOutputPath=${frameFileOutputPath}`,
  ])
  return { spawnedFrameRenderProcess }
}
