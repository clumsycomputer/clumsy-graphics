import {
  AnimationDevelopmentAction,
  AnimationModuleSourceUpdatedAction,
} from './models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from './models/AnimationDevelopmentState'

export function animationDevelopmentStateReducer(
  currentAnimationDevelopmentState: AnimationDevelopmentState = {
    animationModuleSourceState: {
      sourceStatus: 'sourceInitializing',
    },
  },
  someAnimationDevelopmentAction: AnimationDevelopmentAction
): AnimationDevelopmentState {
  switch (someAnimationDevelopmentAction.type) {
    case 'animationModuleSourceUpdated':
      return handleAnimationModuleSourceUpdated(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    default:
      return currentAnimationDevelopmentState
  }
}

function handleAnimationModuleSourceUpdated(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  animationModuleSourceUpdatedActionPayload: AnimationModuleSourceUpdatedAction['actionPayload']
): AnimationDevelopmentState {
  const { animationModuleSessionVersion } =
    animationModuleSourceUpdatedActionPayload
  return {
    ...currentAnimationDevelopmentState,
    animationModuleSourceState: {
      animationModuleSessionVersion,
      sourceStatus: 'sourceReady',
      animationRenderProcessState: null,
      frameRenderProcessStates: {},
    },
  }
}
