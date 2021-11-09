import { ActionBase } from './common'

export type AnimationDevelopmentAction = AnimationModuleSourceUpdatedAction

export interface AnimationModuleSourceUpdatedAction
  extends ActionBase<'animationModuleSourceUpdated', {}> {}
