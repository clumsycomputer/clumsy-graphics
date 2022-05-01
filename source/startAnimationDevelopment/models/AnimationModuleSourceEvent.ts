import { AnimationModule } from '../../main'
import { EventBase } from './common'

export type AnimationModuleSourceEvent = AnimationModuleSourceChangedEvent

export interface AnimationModuleSourceChangedEvent
  extends EventBase<
    'animationModuleSourceChanged',
    {
      nextAnimationModule: AnimationModule
      nextAnimationModuleSessionVersion: number
    }
  > {}
