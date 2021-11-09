import { AnimationDevelopmentAction } from './models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from './models/AnimationDevelopmentState'

export function animationDevelopmentStateReducer(
  currentAnimationDevelopmentState: AnimationDevelopmentState = {
    animationModuleRenderTasks: {},
  },
  someAnimationDevelopmentAction: AnimationDevelopmentAction
): AnimationDevelopmentState {
  switch (someAnimationDevelopmentAction.type) {
    default:
      return currentAnimationDevelopmentState
  }
}
