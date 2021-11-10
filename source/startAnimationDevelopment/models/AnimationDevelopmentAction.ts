import { AnimationModuleSourceUpdatedEvent } from './AnimationModuleSourceEvent'
import { ActionBase } from './common'

export type AnimationDevelopmentAction =
  | AnimationModuleSourceUpdatedAction
  | ClientRequestsAnimationRenderTaskAction
  | ClientRequestsFrameRenderTaskAction

export interface AnimationModuleSourceUpdatedAction
  extends ActionBase<
    'animationModuleSourceUpdated',
    Pick<
      AnimationModuleSourceUpdatedEvent['eventPayload'],
      'animationModuleSessionVersion'
    >
  > {}

export interface ClientRequestsAnimationRenderTaskAction
  extends ActionBase<'clientRequestsAnimationRenderTask', {}> {}

export interface ClientRequestsFrameRenderTaskAction
  extends ActionBase<'clientRequestsFrameRenderTask', {}> {}
