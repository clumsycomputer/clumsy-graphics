import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
import {
  // ClientFrameRenderProcessState,
  FrameRenderProcessState,
} from '../models/RenderProcessState'

export interface GetClientAnimationRenderProcessStateApi
  extends Pick<
    AnimationModuleSourceReadyState,
    'animationModuleSessionVersion'
  > {
  frameRenderProcessState: FrameRenderProcessState | undefined
}

export function getClientFrameRenderProcessState(
  api: GetClientAnimationRenderProcessStateApi
) {
  const { frameRenderProcessState, animationModuleSessionVersion } = api
  if (frameRenderProcessState) {
    const { spawnedProcess, ...partialClientFrameRenderProcessState } =
      frameRenderProcessState
    return {
      ...partialClientFrameRenderProcessState,
      animationModuleSessionVersion,
    }
  } else if (frameRenderProcessState === undefined) {
    return {
      animationModuleSessionVersion,
      processStatus: 'processActive' as 'processActive',
    }
  } else {
    throw new Error('wtf? getClientFrameRenderProcessState')
  }
}
