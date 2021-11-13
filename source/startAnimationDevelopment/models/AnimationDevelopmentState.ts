import { ChildProcess as SpawnedNodeProcess } from 'child_process'

export interface AnimationDevelopmentState {
  animationModuleSourceState: AnimationModuleSourceState
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
  | AnimationRenderProcessStateActive
  | AnimationRenderProcessStateSuccessful
  | AnimationRenderProcessStateFailed

interface AnimationRenderProcessStateActive extends ProcessStateActive {}

interface AnimationRenderProcessStateSuccessful
  extends ProcessStateSuccessful {}

interface AnimationRenderProcessStateFailed extends ProcessStateFailed {}

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
