import { ChildProcess as SpawnedNodeProcess } from 'child_process'

export interface AnimationDevelopmentState {
  animationModuleSourceState: AnimationModuleSourceState
  availableAssetsFilePathMap: {
    [assetKey: `${number}` | `${number}_${number}`]: string
  }
}

type AnimationModuleSourceState =
  | AnimationModuleSourceInitializingState
  | AnimationModuleSourceReadyState

interface AnimationModuleSourceInitializingState
  extends AnimationModuleSourceStateBase<'sourceInitializing'> {}

export interface AnimationModuleSourceReadyState
  extends AnimationModuleSourceStateBase<'sourceReady'> {
  animationModuleSessionVersion: number
  animationRenderProcessState: AnimationRenderProcessState | null
  frameRenderProcessStates: {
    [frameIndex: number]: FrameRenderProcessState
  }
}

type AnimationRenderProcessState =
  | AnimationRenderProcessActiveState
  | AnimationRenderProcessSuccessfulState
  | AnimationRenderProcessFailedState

export interface AnimationRenderProcessActiveState extends ProcessStateActive {}

export interface AnimationRenderProcessSuccessfulState
  extends ProcessStateSuccessful {
  animationAssetUrl: string
}

export interface AnimationRenderProcessFailedState extends ProcessStateFailed {}

type FrameRenderProcessState =
  | FrameRenderProcessStateActive
  | FrameRenderProcessStateSuccessful
  | FrameRenderProcessStateFailed

interface FrameRenderProcessStateActive extends ProcessStateActive {}

interface FrameRenderProcessStateSuccessful extends ProcessStateSuccessful {}

interface FrameRenderProcessStateFailed extends ProcessStateFailed {}

interface ProcessStateActive extends ProcessStateBase<'processActive'> {}

interface ProcessStateSuccessful
  extends ProcessStateBase<'processSuccessful'> {}

interface ProcessStateFailed extends ProcessStateBase<'processFailed'> {}

interface ProcessStateBase<ProcessStatus extends string> {
  processStatus: ProcessStatus
  spawnedProcess: SpawnedNodeProcess
}

interface AnimationModuleSourceStateBase<SourceStatus extends string> {
  sourceStatus: SourceStatus
}
