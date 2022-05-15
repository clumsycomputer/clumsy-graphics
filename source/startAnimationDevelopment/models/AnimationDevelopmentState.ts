import { AnimationModule } from '../../models/AnimationModule'
import { GraphicsRendererProcessState } from './GraphicsRendererProcessState'

export interface AnimationDevelopmentState {
  animationModuleBundlerState: AnimationModuleBundlerState
  availableAssetsFilePathMap: {
    [graphicAssetPathKey: string]: string
  }
}

export type AnimationModuleBundlerState =
  | AnimationModuleBundlerInitializingState
  | AnimationModuleValidBuildState
  | AnimationModuleInvalidBuildState

export type AnimationModuleBundlerActiveState =
  | AnimationModuleValidBuildState
  | AnimationModuleInvalidBuildState

export interface AnimationModuleBundlerInitializingState
  extends AnimationModuleBundlerStateBase<'bundlerInitializing'> {}

export interface AnimationModuleValidBuildState
  extends AnimationModuleBundlerActiveStateBase<'validBuild'> {
  animationModule: AnimationModule
}

export interface AnimationModuleInvalidBuildState
  extends AnimationModuleBundlerActiveStateBase<'invalidBuild'> {
  buildErrorMessage: string
}

interface AnimationModuleBundlerActiveStateBase<BuildStatus extends string>
  extends AnimationModuleBundlerStateBase<'bundlerActive'> {
  buildStatus: BuildStatus
  buildVersion: number
  graphicsRendererProcessStates: Record<string, GraphicsRendererProcessState>
}

interface AnimationModuleBundlerStateBase<BundlerStatus extends string> {
  bundlerStatus: BundlerStatus
}
