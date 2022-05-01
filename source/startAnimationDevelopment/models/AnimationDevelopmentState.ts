import { AnimationModule } from '../../models/AnimationModule'
import { GraphicsRendererProcessState } from './GraphicsRendererProcessState'

export interface AnimationDevelopmentState {
  animationModuleSourceState: AnimationModuleSourceState
  availableAssetsFilePathMap: {
    [graphicAssetPathKey: string]: string
  }
}

export type AnimationModuleSourceState =
  | AnimationModuleSourceInitializingState
  | AnimationModuleSourceReadyState

export interface AnimationModuleSourceInitializingState
  extends AnimationModuleSourceStateBase<'sourceInitializing'> {}

export interface AnimationModuleSourceReadyState
  extends AnimationModuleSourceStateBase<'sourceReady'> {
  animationModule: AnimationModule
  animationModuleSessionVersion: number
  graphicsRendererProcessStates: Record<string, GraphicsRendererProcessState>
}

interface AnimationModuleSourceStateBase<SourceStatus extends string> {
  sourceStatus: SourceStatus
}
