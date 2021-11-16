import { ChildProcess as SpawnedNodeProcess } from 'child_process'
import { getClientAnimationRenderProcessState } from '../helpers/getClientAnimationRenderProcessState'
import { getClientFrameRenderProcessState } from '../helpers/getClientFrameRenderProcessState'

export type AnimationRenderProcessState =
  | AnimationRenderProcessActiveState
  | AnimationRenderProcessSuccessfulState
  | AnimationRenderProcessFailedState

export interface AnimationRenderProcessActiveState extends ProcessStateActive {}

export interface AnimationRenderProcessSuccessfulState
  extends ProcessStateSuccessful {
  animationAssetUrl: string
}

export interface AnimationRenderProcessFailedState extends ProcessStateFailed {}

export type FrameRenderProcessState =
  | FrameRenderProcessActiveState
  | FrameRenderProcessSuccessfulState
  | FrameRenderProcessFailedState

export interface FrameRenderProcessActiveState extends ProcessStateActive {}

export interface FrameRenderProcessSuccessfulState
  extends ProcessStateSuccessful {
  frameAssetUrl: string
}

export interface FrameRenderProcessFailedState extends ProcessStateFailed {}

interface ProcessStateActive extends ProcessStateBase<'processActive'> {
  lastProcessMessage: string | null
}

interface ProcessStateSuccessful
  extends ProcessStateBase<'processSuccessful'> {}

interface ProcessStateFailed extends ProcessStateBase<'processFailed'> {
  processErrorMessage: string
}

interface ProcessStateBase<ProcessStatus extends string> {
  processStatus: ProcessStatus
  spawnedProcess: SpawnedNodeProcess
}

export type ClientAnimationRenderProcessState = ReturnType<
  typeof getClientAnimationRenderProcessState
>

export type ClientFrameRenderProcessState = ReturnType<
  typeof getClientFrameRenderProcessState
>
