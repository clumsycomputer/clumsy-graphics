import { spawn as spawnChildProcess } from 'child_process'
import { SagaReturnType } from 'redux-saga/effects'
import { getSpawnedGraphicsRendererProcessEventChannel } from '../externals/getSpawnedGraphicsRendererProcessEventChannel'
import {
  call,
  put,
  select,
  spawn,
  takeActionFromChannel,
  takeEvent,
} from '../helpers/storeEffects'
import { GraphicsRendererProcessManagerAction } from '../models/AnimationDevelopmentAction'
import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
import { SpawnedGraphicsRendererProcessEvent } from '../models/SpawnedGraphicsRendererProcessEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'

export interface GraphicsRendererProcessManagerSagaApi
  extends Pick<
    SagaReturnType<typeof animationDevelopmentSetupSaga>,
    'graphicsRendererProcessManagerActionChannel'
  > {}

export function* graphicsRendererProcessManagerSaga(
  api: GraphicsRendererProcessManagerSagaApi
) {
  const { graphicsRendererProcessManagerActionChannel } = api
  while (true) {
    const someGraphicsRendererProcessManagerAction =
      yield* takeActionFromChannel<GraphicsRendererProcessManagerAction>(
        graphicsRendererProcessManagerActionChannel
      )
    const currentAnimationModuleSourceState = yield* select(
      (currentAnimationDevelopmentState) =>
        currentAnimationDevelopmentState.animationModuleSourceState
    )
    if (
      currentAnimationModuleSourceState.sourceStatus === 'sourceInitializing' &&
      someGraphicsRendererProcessManagerAction.type ===
        'animationModuleSourceChanged'
    ) {
      yield* put({
        type: 'animationModuleSourceUpdated',
        actionPayload: {
          animationModuleSourceState: {
            animationModuleSessionVersion:
              someGraphicsRendererProcessManagerAction.actionPayload
                .nextAnimationModuleSessionVersion,
            graphicsRendererProcessStates: {},
            sourceStatus: 'sourceReady',
          },
        },
      })
    } else if (
      currentAnimationModuleSourceState.sourceStatus === 'sourceReady' &&
      someGraphicsRendererProcessManagerAction.type ===
        'animationModuleSourceChanged'
    ) {
      yield* call(function* () {
        terminateActiveGraphicsRendererProcesses({
          currentAnimationModuleSourceState,
        })
        yield* put({
          type: 'animationModuleSourceUpdated',
          actionPayload: {
            animationModuleSourceState: {
              animationModuleSessionVersion:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextAnimationModuleSessionVersion,
              graphicsRendererProcessStates: {},
              sourceStatus: 'sourceReady',
            },
          },
        })
      })
    } else if (
      currentAnimationModuleSourceState.sourceStatus === 'sourceReady' &&
      someGraphicsRendererProcessManagerAction.type ===
        'spawnGraphicsRendererProcess' &&
      currentAnimationModuleSourceState.animationModuleSessionVersion ===
        someGraphicsRendererProcessManagerAction.actionPayload
          .animationModuleSessionVersionStamp &&
      currentAnimationModuleSourceState.graphicsRendererProcessStates[
        someGraphicsRendererProcessManagerAction.actionPayload
          .graphicsRendererProcessKey
      ] === undefined
    ) {
      yield* call(function* () {
        // const targetFramePngOutputPath = Path.resolve(
        //   generatedAssetsDirectoryPath,
        //   `${someGraphicRendererProcessManagerAction.actionPayload.animationModuleSessionVersion}_${someGraphicRendererProcessManagerAction.actionPayload.frameIndex}.png`
        // )
        const { spawnedGraphicsRendererProcess } = spawnGraphicsRendererProcess(
          {
            graphicsRendererCommandString:
              someGraphicsRendererProcessManagerAction.actionPayload
                .graphicsRendererProcessCommandString,
          }
        )
        const { spawnedGraphicsRendererProcessEventChannel } =
          getSpawnedGraphicsRendererProcessEventChannel({
            spawnedGraphicsRendererProcess,
          })
        yield* put({
          type: 'graphicsRendererProcessActive',
          actionPayload: {
            targetGraphicsRendererProcessKey:
              someGraphicsRendererProcessManagerAction.actionPayload
                .graphicsRendererProcessKey,
            targetGraphicsRendererProcessState: {
              processProgressInfo:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .initialProcessProgressInfo,
              spawnedProcess: spawnedGraphicsRendererProcess,
              processStatus: 'processActive',
            },
          },
        })
        yield* spawn(function* () {
          let graphicsRendererProcessRunning = true
          while (graphicsRendererProcessRunning) {
            const someSpawnedGraphicsRendererProcessEvent =
              yield* takeEvent<SpawnedGraphicsRendererProcessEvent>(
                spawnedGraphicsRendererProcessEventChannel
              )
            switch (someSpawnedGraphicsRendererProcessEvent.eventType) {
              case 'graphicsRendererProcessMessage':
                yield* put({
                  type: 'graphicsRendererProcessProgressInfoUpdated',
                  actionPayload: {
                    targetGraphicsRendererProcessKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicsRendererProcessKey,
                    animationModuleSessionVersionStamp:
                      currentAnimationModuleSourceState.animationModuleSessionVersion,
                    targetGraphicsRendererProcessState: {
                      spawnedProcess: spawnedGraphicsRendererProcess,
                      processProgressInfo:
                        someSpawnedGraphicsRendererProcessEvent.eventPayload
                          .graphicsRendererProcessMessage,
                      processStatus: 'processActive',
                    },
                  },
                })
                break
              case 'graphicsRendererProcessSuccessful':
                yield* put({
                  type: 'graphicsRendererProcessSuccessful',
                  actionPayload: {
                    targetGraphicAssetKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicAssetPathKey,
                    targetGraphicAssetPath:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicAssetPath,
                    targetGraphicsRendererProcessKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicsRendererProcessKey,
                    animationModuleSessionVersionStamp:
                      currentAnimationModuleSourceState.animationModuleSessionVersion,
                    targetGraphicsRendererProcessState: {
                      graphicAssetUrl:
                        someGraphicsRendererProcessManagerAction.actionPayload
                          .graphicAssetUrlResult,
                      spawnedProcess: spawnedGraphicsRendererProcess,
                      processStatus: 'processSuccessful',
                    },
                  },
                })
                break
              case 'graphicsRendererProcessFailed':
                yield* put({
                  type: 'graphicsRendererProcessFailed',
                  actionPayload: {
                    targetGraphicsRendererProcessKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicsRendererProcessKey,
                    animationModuleSessionVersionStamp:
                      currentAnimationModuleSourceState.animationModuleSessionVersion,
                    targetGraphicsRendererProcessState: {
                      processErrorMessage:
                        someSpawnedGraphicsRendererProcessEvent.eventPayload
                          .graphicsRendererProcessErrorMessage,
                      spawnedProcess: spawnedGraphicsRendererProcess,
                      processStatus: 'processFailed',
                    },
                  },
                })
                break
              case 'graphicsRendererProcessTerminated':
                break
            }
            if (
              someSpawnedGraphicsRendererProcessEvent.eventType ===
                'graphicsRendererProcessSuccessful' ||
              someSpawnedGraphicsRendererProcessEvent.eventType ===
                'graphicsRendererProcessFailed' ||
              someSpawnedGraphicsRendererProcessEvent.eventType ===
                'graphicsRendererProcessTerminated'
            ) {
              graphicsRendererProcessRunning = false
            }
          }
        })
      })
    }
  }
}

interface TerminateActiveGraphicsRenderProcessesApi {
  currentAnimationModuleSourceState: AnimationModuleSourceReadyState
}

function terminateActiveGraphicsRendererProcesses(
  api: TerminateActiveGraphicsRenderProcessesApi
) {
  const { currentAnimationModuleSourceState } = api
  Object.values(
    currentAnimationModuleSourceState.graphicsRendererProcessStates
  ).forEach((someGraphicsRendererProcessState) => {
    someGraphicsRendererProcessState.spawnedProcess.kill('SIGINT')
  })
}

export interface SpawnGraphicsRendererProcessApi {
  graphicsRendererCommandString: string
}

export function spawnGraphicsRendererProcess(
  api: SpawnGraphicsRendererProcessApi
) {
  const { graphicsRendererCommandString } = api
  const graphicsRendererCommandTokens = graphicsRendererCommandString.split(' ')
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
  return {
    spawnedGraphicsRendererProcess,
  }
}
