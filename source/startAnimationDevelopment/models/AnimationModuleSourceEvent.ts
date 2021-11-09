import { EventBase } from './common'

export type AnimationModuleSourceEvent = AnimationModuleSourceUpdated

interface AnimationModuleSourceUpdated
  extends EventBase<'animationModuleSourceUpdated', {}> {}
