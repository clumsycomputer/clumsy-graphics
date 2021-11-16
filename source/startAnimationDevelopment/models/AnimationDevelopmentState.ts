import {
  AnimationRenderProcessState,
  FrameRenderProcessState,
} from './RenderProcessState'

export interface AnimationDevelopmentState {
  animationModuleSourceState: AnimationModuleSourceState
  availableAssetsFilePathMap: {
    [assetKey: string]: string
  }
}

export type AnimationModuleSourceState =
  | AnimationModuleSourceInitializingState
  | AnimationModuleSourceReadyState

export interface AnimationModuleSourceInitializingState
  extends AnimationModuleSourceStateBase<'sourceInitializing'> {}

export interface AnimationModuleSourceReadyState
  extends AnimationModuleSourceStateBase<'sourceReady'> {
  animationModuleSessionVersion: number
  animationRenderProcessState: AnimationRenderProcessState | null
  frameRenderProcessStates: Record<number, FrameRenderProcessState>
}

interface AnimationModuleSourceStateBase<SourceStatus extends string> {
  sourceStatus: SourceStatus
}
