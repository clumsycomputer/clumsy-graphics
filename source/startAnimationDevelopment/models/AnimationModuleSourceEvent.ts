import { AnimationModule } from '../../main'
import { EventBase } from './common'

export type AnimationModuleBundlerEvent =
  | AnimationModuleBundlerInitialBuildSucceededEvent
  | AnimationModuleBundlerRebuildSucceededEvent
  | AnimationModuleBundlerRebuildFailedEvent

export interface AnimationModuleBundlerInitialBuildSucceededEvent
  extends EventBase<
    'animationModuleBundler_initialBuildSucceeded',
    {
      nextBundleSessionVersion: number
      nextAnimationModule: AnimationModule
    }
  > {}

export interface AnimationModuleBundlerRebuildSucceededEvent
  extends EventBase<
    'animationModuleBundler_rebuildSucceeded',
    {
      nextBundleSessionVersion: number
      nextAnimationModule: AnimationModule
    }
  > {}

export interface AnimationModuleBundlerRebuildFailedEvent
  extends EventBase<
    'animationModuleBundler_rebuildFailed',
    {
      nextBundleSessionVersion: number
      nextBundleErrorMessage: string
    }
  > {}
