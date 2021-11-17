import { EventBase } from './common'

export type AnimationModuleSourceEvent = AnimationModuleSourceChangedEvent

export interface AnimationModuleSourceChangedEvent
  extends EventBase<
    'animationModuleSourceChanged',
    {
      nextAnimationModuleSessionVersion: number
    }
  > {}
