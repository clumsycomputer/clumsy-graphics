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
  | AnimationModuleValidBundleState
  | AnimationModuleInvalidBundleState

export type AnimationModuleBundlerActiveState =
  | AnimationModuleValidBundleState
  | AnimationModuleInvalidBundleState

export interface AnimationModuleBundlerInitializingState
  extends AnimationModuleBundlerStateBase<'bundlerInitializing'> {}

export interface AnimationModuleValidBundleState
  extends AnimationModuleBundlerActiveStateBase<'bundleValid'> {
  animationModule: AnimationModule
}

export interface AnimationModuleInvalidBundleState
  extends AnimationModuleBundlerActiveStateBase<'bundleInvalid'> {
  bundleErrorMessage: string
}

interface AnimationModuleBundlerActiveStateBase<BundleStatus extends string>
  extends AnimationModuleBundlerStateBase<'bundlerActive'> {
  latestBundleStatus: BundleStatus
  bundleSessionVersion: number
  graphicsRendererProcessStates: Record<string, GraphicsRendererProcessState>
}

interface AnimationModuleBundlerStateBase<BundlerStatus extends string> {
  bundlerStatus: BundlerStatus
}
