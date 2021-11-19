import {
  AnimationDevelopmentAction,
  AnimationModuleSourceUpdatedAction,
  GraphicsRendererProcessActiveAction,
  GraphicsRendererProcessFailedAction,
  GraphicsRendererProcessProgressInfoUpdatedAction,
  GraphicsRendererProcessSuccessfulAction,
} from './models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from './models/AnimationDevelopmentState'

export function animationDevelopmentStateReducer(
  currentAnimationDevelopmentState: AnimationDevelopmentState = {
    animationModuleSourceState: {
      sourceStatus: 'sourceInitializing',
    },
    availableAssetsFilePathMap: {},
  },
  someAnimationDevelopmentAction: AnimationDevelopmentAction
): AnimationDevelopmentState {
  switch (someAnimationDevelopmentAction.type) {
    case 'animationModuleSourceUpdated':
      return handleAnimationModuleSourceUpdated(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'graphicsRendererProcessActive':
      return handleGraphicsRendererProcessActive(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'graphicsRendererProcessProgressInfoUpdated':
      return handleGraphicsRendererProcessProgessInfoUpdated(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'graphicsRendererProcessSuccessful':
      return handleGraphicsRendererProcessSuccessful(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'graphicsRendererProcessFailed':
      return handleGraphicsRendererProcessFailed(
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
  const { animationModuleSourceState } =
    animationModuleSourceUpdatedActionPayload
  return {
    ...currentAnimationDevelopmentState,
    animationModuleSourceState,
  }
}

function handleGraphicsRendererProcessActive(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessActiveActionPayload: GraphicsRendererProcessActiveAction['actionPayload']
): AnimationDevelopmentState {
  const {
    targetGraphicsRendererProcessKey,
    targetGraphicsRendererProcessState,
  } = graphicsRendererProcessActiveActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceInitializing'
  ) {
    throw new Error('wtf? handleGraphicsRendererProcessActive')
  } else {
    return {
      ...currentAnimationDevelopmentState,
      animationModuleSourceState: {
        ...currentAnimationDevelopmentState.animationModuleSourceState,
        graphicsRendererProcessStates: {
          ...currentAnimationDevelopmentState.animationModuleSourceState
            .graphicsRendererProcessStates,
          [targetGraphicsRendererProcessKey]:
            targetGraphicsRendererProcessState,
        },
      },
    }
  }
}

function handleGraphicsRendererProcessProgessInfoUpdated(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessUpdateActionPayload: GraphicsRendererProcessProgressInfoUpdatedAction['actionPayload']
): AnimationDevelopmentState {
  const {
    animationModuleSessionVersionStamp,
    targetGraphicsRendererProcessKey,
    targetGraphicsRendererProcessState,
  } = graphicsRendererProcessUpdateActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceInitializing'
  ) {
    throw new Error('wtf? handleGraphicsRendererProcessProgessInfoUpdated')
  } else if (
    currentAnimationDevelopmentState.animationModuleSourceState
      .animationModuleSessionVersion === animationModuleSessionVersionStamp &&
    currentAnimationDevelopmentState.animationModuleSourceState
      .graphicsRendererProcessStates[targetGraphicsRendererProcessKey]
      ?.processStatus === 'processActive'
  ) {
    return {
      ...currentAnimationDevelopmentState,
      animationModuleSourceState: {
        ...currentAnimationDevelopmentState.animationModuleSourceState,
        graphicsRendererProcessStates: {
          ...currentAnimationDevelopmentState.animationModuleSourceState
            .graphicsRendererProcessStates,
          [targetGraphicsRendererProcessKey]:
            targetGraphicsRendererProcessState,
        },
      },
    }
  } else {
    return currentAnimationDevelopmentState
  }
}

function handleGraphicsRendererProcessSuccessful(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessSuccessfulActionPayload: GraphicsRendererProcessSuccessfulAction['actionPayload']
): AnimationDevelopmentState {
  const {
    animationModuleSessionVersionStamp,
    targetGraphicsRendererProcessKey,
    targetGraphicsRendererProcessState,
    targetGraphicAssetKey,
    targetGraphicAssetPath,
  } = graphicsRendererProcessSuccessfulActionPayload
  const availableAssetsFilePathMap = {
    ...currentAnimationDevelopmentState.availableAssetsFilePathMap,
    [targetGraphicAssetKey]: targetGraphicAssetPath,
  }
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceInitializing'
  ) {
    throw new Error('wtf? handleGraphicsRendererProcessSuccessful')
  } else if (
    currentAnimationDevelopmentState.animationModuleSourceState
      .animationModuleSessionVersion === animationModuleSessionVersionStamp
  ) {
    return {
      ...currentAnimationDevelopmentState,
      availableAssetsFilePathMap,
      animationModuleSourceState: {
        ...currentAnimationDevelopmentState.animationModuleSourceState,
        graphicsRendererProcessStates: {
          ...currentAnimationDevelopmentState.animationModuleSourceState
            .graphicsRendererProcessStates,
          [targetGraphicsRendererProcessKey]:
            targetGraphicsRendererProcessState,
        },
      },
    }
  } else {
    return {
      ...currentAnimationDevelopmentState,
      availableAssetsFilePathMap,
    }
  }
}

function handleGraphicsRendererProcessFailed(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessFailedActionPayload: GraphicsRendererProcessFailedAction['actionPayload']
): AnimationDevelopmentState {
  const {
    animationModuleSessionVersionStamp,
    targetGraphicsRendererProcessKey,
    targetGraphicsRendererProcessState,
  } = graphicsRendererProcessFailedActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceInitializing'
  ) {
    throw new Error('wtf? handleGraphicsRendererProcessFailed')
  } else if (
    currentAnimationDevelopmentState.animationModuleSourceState
      .animationModuleSessionVersion === animationModuleSessionVersionStamp
  ) {
    return {
      ...currentAnimationDevelopmentState,
      animationModuleSourceState: {
        ...currentAnimationDevelopmentState.animationModuleSourceState,
        graphicsRendererProcessStates: {
          ...currentAnimationDevelopmentState.animationModuleSourceState
            .graphicsRendererProcessStates,
          [targetGraphicsRendererProcessKey]:
            targetGraphicsRendererProcessState,
        },
      },
    }
  } else {
    return currentAnimationDevelopmentState
  }
}
