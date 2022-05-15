import {
  AnimationDevelopmentAction,
  AnimationModuleBundlerStateUpdatedAction,
  GraphicsRendererProcessActiveAction,
  GraphicsRendererProcessFailedAction,
  GraphicsRendererProcessProgressInfoUpdatedAction,
  GraphicsRendererProcessSuccessfulAction,
  GraphicsRendererProcessUpdatedAction,
} from './models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from './models/AnimationDevelopmentState'

export function animationDevelopmentStateReducer(
  currentAnimationDevelopmentState: AnimationDevelopmentState = {
    animationModuleBundlerState: {
      bundlerStatus: 'bundlerInitializing',
    },
    availableAssetsFilePathMap: {},
  },
  someAnimationDevelopmentAction: AnimationDevelopmentAction
): AnimationDevelopmentState {
  switch (someAnimationDevelopmentAction.type) {
    case 'animationModuleBundlerStateUpdated':
      return handleAnimationModuleBundlerStateUpdated(
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

function handleAnimationModuleBundlerStateUpdated(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  animationModuleBundlerStateUpdatedActionPayload: AnimationModuleBundlerStateUpdatedAction['actionPayload']
): AnimationDevelopmentState {
  const { nextAnimationModuleBundlerState } =
    animationModuleBundlerStateUpdatedActionPayload
  return {
    ...currentAnimationDevelopmentState,
    animationModuleBundlerState: nextAnimationModuleBundlerState,
  }
}

function handleGraphicsRendererProcessActive(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  graphicsRendererProcessActiveActionPayload: GraphicsRendererProcessActiveAction['actionPayload']
): AnimationDevelopmentState {
  const { newGraphicsRendererProcessKey, newGraphicsRendererProcessState } =
    graphicsRendererProcessActiveActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleBundlerState
      .bundlerStatus === 'bundlerInitializing'
  ) {
    throw new Error('wtf? handleGraphicsRendererProcessActive')
  } else {
    return {
      ...currentAnimationDevelopmentState,
      animationModuleBundlerState: {
        ...currentAnimationDevelopmentState.animationModuleBundlerState,
        graphicsRendererProcessStates: {
          ...currentAnimationDevelopmentState.animationModuleBundlerState
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
    buildVersion,
    targetGraphicsRendererProcessKey,
    targetGraphicsRendererProcessStateUpdates,
  } = graphicsRendererProcessFailedActionPayload
  const currentAnimationModuleSourceState =
    currentAnimationDevelopmentState.animationModuleBundlerState
      .bundlerStatus === 'bundlerActive' &&
    currentAnimationDevelopmentState.animationModuleBundlerState
  const currentTargetGraphicRendererProcessState =
    currentAnimationModuleSourceState &&
    currentAnimationModuleSourceState.buildVersion === buildVersion &&
    currentAnimationModuleSourceState.graphicsRendererProcessStates[
      targetGraphicsRendererProcessKey
    ]
  if (!currentAnimationModuleSourceState) {
    throw new Error('wtf? handleGraphicsRendererProcessFailed')
  } else if (currentTargetGraphicRendererProcessState) {
    return {
      ...currentAnimationDevelopmentState,
      animationModuleBundlerState: {
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
