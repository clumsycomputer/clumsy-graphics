import { AnimationModule } from '../../docker-main'
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
    'validBuild',
    {
      nextBuildSessionVersion: number
      nextAnimationModule: AnimationModule
    }
  > {}

export interface AnimationModuleBundlerRebuildFailedEvent
  extends AnimationModuleBundlerEventBase<
    'animationModuleBundler_rebuildFailed',
    'invalidBuild',
    {
      nextBuildSessionVersion: number
      nextBuildErrorMessage: string
    }
  > {}

interface AnimationModuleBundlerEventBase<
  AnimationModuleBundlerEventType extends string,
  BuildStatus extends string,
  AnimationModuleBundlerBaseEventPayload extends object
> extends EventBase<
    AnimationModuleBundlerEventType,
    {
      nextBuildStatus: BuildStatus
    } & AnimationModuleBundlerBaseEventPayload
  > {}
