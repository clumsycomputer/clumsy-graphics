import { AnimationModule } from '../../main'
import { EventBase } from './common'

export type AnimationModuleBundlerEvent =
  | AnimationModuleBundlerInitialBuildSucceededEvent
  | AnimationModuleBundlerRebuildSucceededEvent
  | AnimationModuleBundlerRebuildFailedEvent

export interface AnimationModuleBundlerInitialBuildSucceededEvent
  extends AnimationModuleBundlerBaseEvent<
    'animationModuleBundler_initialBuildSucceeded',
    'bundleValid',
    {
      nextBundleSessionVersion: number
      nextAnimationModule: AnimationModule
    }
  > {}

export interface AnimationModuleBundlerRebuildSucceededEvent
  extends AnimationModuleBundlerBaseEvent<
    'animationModuleBundler_rebuildSucceeded',
    'bundleValid',
    {
      nextBundleSessionVersion: number
      nextAnimationModule: AnimationModule
    }
  > {}

export interface AnimationModuleBundlerRebuildFailedEvent
  extends AnimationModuleBundlerBaseEvent<
    'animationModuleBundler_rebuildFailed',
    'bundleInvalid',
    {
      nextBundleSessionVersion: number
      nextBundleErrorMessage: string
    }
  > {}

interface AnimationModuleBundlerBaseEvent<
  AnimationModuleBundlerBaseEventType extends string,
  LatestBundleStatus extends string,
  AnimationModuleBundlerBaseEventPayload extends object
> extends EventBase<
    AnimationModuleBundlerBaseEventType,
    {
      nextLatestBundleStatus: LatestBundleStatus
    } & AnimationModuleBundlerBaseEventPayload
  > {}
