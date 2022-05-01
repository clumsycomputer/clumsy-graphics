import {
  AnimationDevelopmentAction,
  AnimationModuleSourceUpdatedAction,
  GraphicsRendererProcessActiveAction,
  GraphicsRendererProcessFailedAction,
  GraphicsRendererProcessProgressInfoUpdatedAction,
  GraphicsRendererProcessSuccessfulAction,
  GraphicsRendererProcessUpdatedAction,
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
    case 'graphicsRendererProcessStdoutLogUpdated':
      return handleGraphicsRendererProcessStdoutLogUpdated(
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
  const { newGraphicsRendererProcessKey, newGraphicsRendererProcessState } =
    graphicsRendererProcessActiveActionPayload
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
          [newGraphicsRendererProcessKey]: newGraphicsRendererProcessState,
        },
      },
    }
  }
}

function handleGraphicsRendererProcessStdoutLogUpdated(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessUpdateActionPayload: GraphicsRendererProcessProgressInfoUpdatedAction['actionPayload']
): AnimationDevelopmentState {
  return handleGraphicsRendererProcessUpdated(
    currentAnimationDevelopmentState,
    graphicsRendererProcessUpdateActionPayload
  )
}

function handleGraphicsRendererProcessSuccessful(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessSuccessfulActionPayload: GraphicsRendererProcessSuccessfulAction['actionPayload']
): AnimationDevelopmentState {
  const { targetGraphicAssetKey, targetGraphicAssetPath } =
    graphicsRendererProcessSuccessfulActionPayload
  return {
    ...handleGraphicsRendererProcessUpdated(
      currentAnimationDevelopmentState,
      graphicsRendererProcessSuccessfulActionPayload
    ),
    availableAssetsFilePathMap: {
      ...currentAnimationDevelopmentState.availableAssetsFilePathMap,
      [targetGraphicAssetKey]: targetGraphicAssetPath,
    },
  }
}

function handleGraphicsRendererProcessFailed(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessFailedActionPayload: GraphicsRendererProcessFailedAction['actionPayload']
): AnimationDevelopmentState {
  return handleGraphicsRendererProcessUpdated(
    currentAnimationDevelopmentState,
    graphicsRendererProcessFailedActionPayload
  )
}

function handleGraphicsRendererProcessUpdated(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessFailedActionPayload: GraphicsRendererProcessUpdatedAction['actionPayload']
): AnimationDevelopmentState {
  const {
    animationModuleSessionVersionStamp,
    targetGraphicsRendererProcessKey,
    targetGraphicsRendererProcessStateUpdates,
  } = graphicsRendererProcessFailedActionPayload
  const currentAnimationModuleSourceState =
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
      'sourceReady' &&
    currentAnimationDevelopmentState.animationModuleSourceState
  const currentTargetGraphicRendererProcessState =
    currentAnimationModuleSourceState &&
    currentAnimationModuleSourceState.animationModuleSessionVersion ===
      animationModuleSessionVersionStamp &&
    currentAnimationModuleSourceState.graphicsRendererProcessStates[
      targetGraphicsRendererProcessKey
    ]
  if (!currentAnimationModuleSourceState) {
    throw new Error('wtf? handleGraphicsRendererProcessFailed')
  } else if (currentTargetGraphicRendererProcessState) {
    return {
      ...currentAnimationDevelopmentState,
      animationModuleSourceState: {
        ...currentAnimationModuleSourceState,
        graphicsRendererProcessStates: {
          ...currentAnimationModuleSourceState.graphicsRendererProcessStates,
          [targetGraphicsRendererProcessKey]: {
            ...currentTargetGraphicRendererProcessState,
            ...targetGraphicsRendererProcessStateUpdates,
          },
        },
      },
    }
  } else {
    return currentAnimationDevelopmentState
  }
}
