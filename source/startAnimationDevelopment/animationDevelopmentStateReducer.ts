import {
  AnimationDevelopmentAction,
  AnimationModuleSourceUpdatedAction,
  AnimationRenderProcessActiveAction,
  AnimationRenderProcessFailedAction,
  AnimationRenderProcessSuccessfulAction,
} from './models/AnimationDevelopmentAction'
import {
  AnimationDevelopmentState,
  AnimationModuleSourceReadyState,
  AnimationRenderProcessActiveState,
  AnimationRenderProcessFailedState,
  AnimationRenderProcessSuccessfulState,
} from './models/AnimationDevelopmentState'

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
    case 'animationRenderProcessActive':
      return handleAnimationRenderProcessActive(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'animationRenderProcessSuccessful':
      return handleAnimationRenderProcessSuccessful(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'animationRenderProcessFailed':
      return handleAnimationRenderProcessFailed(
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

function handleAnimationRenderProcessActive(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  animationRenderProcessActiveActionPayload: AnimationRenderProcessActiveAction['actionPayload']
): AnimationDevelopmentState {
  const { spawnedAnimationRenderProcess } =
    animationRenderProcessActiveActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceReady'
  ) {
    const nextAnimationRenderProcessState: AnimationRenderProcessActiveState = {
      spawnedProcess: spawnedAnimationRenderProcess,
      processStatus: 'processActive',
    }
    return {
      ...currentAnimationDevelopmentState,
      animationModuleSourceState: {
        ...currentAnimationDevelopmentState.animationModuleSourceState,
        animationRenderProcessState: nextAnimationRenderProcessState,
      },
    }
  } else {
    throw new Error('wtf? handleAnimationRenderProcessActive')
  }
}

function handleAnimationRenderProcessSuccessful(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  animationRenderProcessSuccessfulActionPayload: AnimationRenderProcessSuccessfulAction['actionPayload']
): AnimationDevelopmentState {
  const { targetAnimationModuleSessionVersion, animationAssetPath } =
    animationRenderProcessSuccessfulActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
      'sourceReady' &&
    currentAnimationDevelopmentState.animationModuleSourceState
      .animationRenderProcessState !== null
  ) {
    const nextAvailableAssetsFilePathMap = {
      ...currentAnimationDevelopmentState.availableAssetsFilePathMap,
      [`${targetAnimationModuleSessionVersion}`]: animationAssetPath,
    }
    if (
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationModuleSessionVersion === targetAnimationModuleSessionVersion
    ) {
      const nextAnimationRenderProcessState: AnimationRenderProcessSuccessfulState =
        {
          spawnedProcess:
            currentAnimationDevelopmentState.animationModuleSourceState
              .animationRenderProcessState.spawnedProcess,
          processStatus: 'processSuccessful',
          animationAssetUrl: `/asset/${targetAnimationModuleSessionVersion}.mp4`,
        }
      return {
        ...currentAnimationDevelopmentState,
        animationModuleSourceState: {
          ...currentAnimationDevelopmentState.animationModuleSourceState,
          animationRenderProcessState: nextAnimationRenderProcessState,
        },
        availableAssetsFilePathMap: nextAvailableAssetsFilePathMap,
      }
    } else {
      return {
        ...currentAnimationDevelopmentState,
        availableAssetsFilePathMap: nextAvailableAssetsFilePathMap,
      }
    }
  } else {
    throw new Error('wtf? handleAnimationRenderProcessSuccessful')
  }
}

function handleAnimationRenderProcessFailed(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  animationRenderProcessFailedActionPayload: AnimationRenderProcessFailedAction['actionPayload']
): AnimationDevelopmentState {
  const { targetAnimationModuleSessionVersion } =
    animationRenderProcessFailedActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
      'sourceReady' &&
    currentAnimationDevelopmentState.animationModuleSourceState
      .animationRenderProcessState !== null
  ) {
    if (
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationModuleSessionVersion === targetAnimationModuleSessionVersion
    ) {
      const nextAnimationRenderProcessState: AnimationRenderProcessFailedState =
        {
          spawnedProcess:
            currentAnimationDevelopmentState.animationModuleSourceState
              .animationRenderProcessState.spawnedProcess,
          processStatus: 'processFailed',
        }
      return {
        ...currentAnimationDevelopmentState,
        animationModuleSourceState: {
          ...currentAnimationDevelopmentState.animationModuleSourceState,
          animationRenderProcessState: nextAnimationRenderProcessState,
        },
      }
    } else {
      return currentAnimationDevelopmentState
    }
  } else {
    throw new Error('wtf? handleAnimationRenderProcessFailed')
  }
}
