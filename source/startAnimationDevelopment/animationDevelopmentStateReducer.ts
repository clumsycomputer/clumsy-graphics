import {
  AnimationDevelopmentAction,
  AnimationModuleSourceUpdatedAction,
  AnimationRenderProcessActiveAction,
  AnimationRenderProcessFailedAction,
  AnimationRenderProcessSuccessfulAction,
  AnimationRenderProcessUpdateAction,
  FrameRenderProcessActiveAction,
  FrameRenderProcessFailedAction,
  FrameRenderProcessSuccessfulAction,
  FrameRenderProcessUpdateAction,
} from './models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from './models/AnimationDevelopmentState'
import {
  AnimationRenderProcessActiveState,
  AnimationRenderProcessFailedState,
  AnimationRenderProcessSuccessfulState,
  FrameRenderProcessActiveState,
  FrameRenderProcessFailedState,
  FrameRenderProcessSuccessfulState,
} from './models/RenderProcessState'

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
    case 'animationRenderProcessUpdate':
      return handleAnimationRenderProcessUpdate(
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
    case 'frameRenderProcessActive':
      return handleFrameRenderProcessActive(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'frameRenderProcessUpdate':
      return handleFrameRenderProcessUpdate(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'frameRenderProcessSuccessful':
      return handleFrameRenderProcessSuccessful(
        currentAnimationDevelopmentState,
        someAnimationDevelopmentAction.actionPayload
      )
    case 'frameRenderProcessFailed':
      return handleFrameRenderProcessFailed(
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
      lastProcessMessage: null,
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

function handleAnimationRenderProcessUpdate(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  animationRenderProcessUpdateActionPayload: AnimationRenderProcessUpdateAction['actionPayload']
): AnimationDevelopmentState {
  const { targetAnimationModuleSessionVersion, animationRenderProcessMessage } =
    animationRenderProcessUpdateActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceReady'
  ) {
    if (
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationModuleSessionVersion ===
        targetAnimationModuleSessionVersion &&
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationRenderProcessState?.processStatus === 'processActive'
    ) {
      const nextAnimationRenderProcessState: AnimationRenderProcessActiveState =
        {
          ...currentAnimationDevelopmentState.animationModuleSourceState
            .animationRenderProcessState,
          lastProcessMessage: animationRenderProcessMessage,
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
    throw new Error('wtf? handleAnimationRenderProcessUpdate')
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
      [`${targetAnimationModuleSessionVersion}.mp4`]: animationAssetPath,
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
          animationAssetUrl: `/asset/${targetAnimationModuleSessionVersion}.mp4`,
          processStatus: 'processSuccessful',
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
  const {
    targetAnimationModuleSessionVersion,
    animationRenderProcessErrorMessage,
  } = animationRenderProcessFailedActionPayload
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
          processErrorMessage: animationRenderProcessErrorMessage,
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

function handleFrameRenderProcessActive(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  frameRenderProcessActiveActionPayload: FrameRenderProcessActiveAction['actionPayload']
): AnimationDevelopmentState {
  const { frameIndex, spawnedFrameRenderProcess } =
    frameRenderProcessActiveActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceReady'
  ) {
    const nextFrameRenderProcessState: FrameRenderProcessActiveState = {
      spawnedProcess: spawnedFrameRenderProcess,
      lastProcessMessage: null,
      processStatus: 'processActive',
    }
    return {
      ...currentAnimationDevelopmentState,
      animationModuleSourceState: {
        ...currentAnimationDevelopmentState.animationModuleSourceState,
        frameRenderProcessStates: {
          ...currentAnimationDevelopmentState.animationModuleSourceState
            .frameRenderProcessStates,
          [frameIndex]: nextFrameRenderProcessState,
        },
      },
    }
  } else {
    throw new Error('wtf? handleFrameRenderProcessActive')
  }
}

function handleFrameRenderProcessUpdate(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  frameRenderProcessUpdateActionPayload: FrameRenderProcessUpdateAction['actionPayload']
): AnimationDevelopmentState {
  const {
    targetAnimationModuleSessionVersion,
    frameRenderProcessMessage,
    targetFrameIndex,
  } = frameRenderProcessUpdateActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
    'sourceReady'
  ) {
    const targetFrameRenderProcessState =
      currentAnimationDevelopmentState.animationModuleSourceState
        .frameRenderProcessStates[targetFrameIndex]

    if (
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationModuleSessionVersion ===
        targetAnimationModuleSessionVersion &&
      targetFrameRenderProcessState?.processStatus === 'processActive'
    ) {
      const nextTargetFrameRenderProcessState: FrameRenderProcessActiveState = {
        ...targetFrameRenderProcessState,
        lastProcessMessage: frameRenderProcessMessage,
      }
      return {
        ...currentAnimationDevelopmentState,
        animationModuleSourceState: {
          ...currentAnimationDevelopmentState.animationModuleSourceState,
          frameRenderProcessStates: {
            ...currentAnimationDevelopmentState.animationModuleSourceState
              .frameRenderProcessStates,
            [targetFrameIndex]: nextTargetFrameRenderProcessState,
          },
        },
      }
    } else {
      return currentAnimationDevelopmentState
    }
  } else {
    throw new Error('wtf? handleFrameRenderProcessUpdate')
  }
}

function handleFrameRenderProcessSuccessful(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  frameRenderProcessSuccessfulActionPayload: FrameRenderProcessSuccessfulAction['actionPayload']
): AnimationDevelopmentState {
  const {
    targetAnimationModuleSessionVersion,
    frameAssetPath,
    targetFrameIndex,
  } = frameRenderProcessSuccessfulActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
      'sourceReady' &&
    currentAnimationDevelopmentState.animationModuleSourceState
      .frameRenderProcessStates[targetFrameIndex] !== undefined
  ) {
    const nextAvailableAssetsFilePathMap = {
      ...currentAnimationDevelopmentState.availableAssetsFilePathMap,
      [`${targetAnimationModuleSessionVersion}_${targetFrameIndex}.png`]:
        frameAssetPath,
    }
    if (
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationModuleSessionVersion === targetAnimationModuleSessionVersion
    ) {
      const nextFrameRenderProcessState: FrameRenderProcessSuccessfulState = {
        spawnedProcess:
          currentAnimationDevelopmentState.animationModuleSourceState
            .frameRenderProcessStates[targetFrameIndex]!.spawnedProcess,
        frameAssetUrl: `/asset/${targetAnimationModuleSessionVersion}_${targetFrameIndex}.png`,
        processStatus: 'processSuccessful',
      }
      return {
        ...currentAnimationDevelopmentState,
        animationModuleSourceState: {
          ...currentAnimationDevelopmentState.animationModuleSourceState,
          frameRenderProcessStates: {
            ...currentAnimationDevelopmentState.animationModuleSourceState
              .frameRenderProcessStates,
            [targetFrameIndex]: nextFrameRenderProcessState,
          },
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
    throw new Error('wtf? handleFrameRenderProcessSuccessful')
  }
}

function handleFrameRenderProcessFailed(
  currentAnimationDevelopmentState: AnimationDevelopmentState,
  frameRenderProcessFailedActionPayload: FrameRenderProcessFailedAction['actionPayload']
): AnimationDevelopmentState {
  const {
    targetAnimationModuleSessionVersion,
    targetFrameIndex,
    frameRenderProcessErrorMessage,
  } = frameRenderProcessFailedActionPayload
  if (
    currentAnimationDevelopmentState.animationModuleSourceState.sourceStatus ===
      'sourceReady' &&
    currentAnimationDevelopmentState.animationModuleSourceState
      .frameRenderProcessStates[targetFrameIndex] !== undefined
  ) {
    if (
      currentAnimationDevelopmentState.animationModuleSourceState
        .animationModuleSessionVersion === targetAnimationModuleSessionVersion
    ) {
      const nextFrameRenderProcessState: FrameRenderProcessFailedState = {
        spawnedProcess:
          currentAnimationDevelopmentState.animationModuleSourceState
            .frameRenderProcessStates[targetFrameIndex]!.spawnedProcess,
        processErrorMessage: frameRenderProcessErrorMessage,
        processStatus: 'processFailed',
      }
      return {
        ...currentAnimationDevelopmentState,
        animationModuleSourceState: {
          ...currentAnimationDevelopmentState.animationModuleSourceState,
          frameRenderProcessStates: {
            ...currentAnimationDevelopmentState.animationModuleSourceState
              .frameRenderProcessStates,
            [targetFrameIndex]: nextFrameRenderProcessState,
          },
        },
      }
    } else {
      return currentAnimationDevelopmentState
    }
  } else {
    throw new Error('wtf? handleFrameRenderProcessFailed')
  }
}
