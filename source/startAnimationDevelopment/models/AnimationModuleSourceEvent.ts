import { EventBase } from './common'

export type AnimationModuleSourceEvent = AnimationModuleSourceUpdatedEvent

export interface AnimationModuleSourceUpdatedEvent
  extends EventBase<
    'animationModuleSourceUpdated',
    {
      animationModuleSessionVersion: number
    }
  > {}
