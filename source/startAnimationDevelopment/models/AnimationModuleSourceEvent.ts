import { AnimationModule } from '../../main'
import { EventBase } from './common'

export type AnimationModuleBundlerEvent =
  | AnimationModuleBundlerInitialBuildSucceededEvent
  | AnimationModuleBundlerRebuildSucceededEvent
  | AnimationModuleBundlerRebuildFailedEvent

export interface AnimationModuleBundlerInitialBuildSucceededEvent
  extends AnimationModuleBundlerBuildSucceededEventBase<'animationModuleBundler_initialBuildSucceeded'> {}

export interface AnimationModuleBundlerRebuildSucceededEvent
  extends AnimationModuleBundlerBuildSucceededEventBase<'animationModuleBundler_rebuildSucceeded'> {}

interface AnimationModuleBundlerBuildSucceededEventBase<
  AnimationModuleBundlerBuildSucceededEventType extends string
> extends AnimationModuleBundlerEventBase<
    AnimationModuleBundlerBuildSucceededEventType,
    'bundleValid',
    {
      nextBundleSessionVersion: number
      nextAnimationModule: AnimationModule
    }
  > {}

export interface AnimationModuleBundlerRebuildFailedEvent
  extends AnimationModuleBundlerEventBase<
    'animationModuleBundler_rebuildFailed',
    'bundleInvalid',
    {
      nextBundleSessionVersion: number
      nextBundleErrorMessage: string
    }
  > {}

interface AnimationModuleBundlerEventBase<
  AnimationModuleBundlerEventType extends string,
  LatestBundleStatus extends string,
  AnimationModuleBundlerBaseEventPayload extends object
> extends EventBase<
    AnimationModuleBundlerEventType,
    {
      nextLatestBundleStatus: LatestBundleStatus
    } & AnimationModuleBundlerBaseEventPayload
  > {}
