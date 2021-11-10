export interface AnimationDevelopmentState {
  animationModuleSourceState: AnimationModuleSourceState
}

type AnimationModuleSourceState =
  | AnimationModuleSourceInitializingState
  | AnimationModuleSourceActiveState

interface AnimationModuleSourceInitializingState
  extends AnimationModuleSourceStateBase<'sourceInitializing'> {}

interface AnimationModuleSourceActiveState
  extends AnimationModuleSourceStateBase<'sourceActive'> {
  sessionVersion: number
  animationRenderTask: RenderTask | null
  frameRenderTasks: {
    [frameIndex: `${number}`]: RenderTask
  }
}

interface RenderTask {}

interface AnimationModuleSourceStateBase<SourceStatus extends string> {
  sourceStatus: SourceStatus
}
