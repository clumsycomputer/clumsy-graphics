import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
import { AnimationRenderProcessActiveState } from '../models/RenderProcessState'
// import { ClientAnimationRenderProcessState } from '../models/RenderProcessState'

export interface GetClientAnimationRenderProcessStateApi
  extends Pick<
    AnimationModuleSourceReadyState,
    'animationModuleSessionVersion' | 'animationRenderProcessState'
  > {}

export function getClientAnimationRenderProcessState(
  api: GetClientAnimationRenderProcessStateApi
) {
  const { animationRenderProcessState, animationModuleSessionVersion } = api
  if (animationRenderProcessState) {
    const { spawnedProcess, ...partialClientAnimationRenderProcessState } =
      animationRenderProcessState
    return {
      ...partialClientAnimationRenderProcessState,
      animationModuleSessionVersion,
    }
  } else if (animationRenderProcessState === null) {
    return {
      animationModuleSessionVersion,
      lastProcessMessage:
        null as AnimationRenderProcessActiveState['lastProcessMessage'],
      processStatus:
        'processActive' as AnimationRenderProcessActiveState['processStatus'],
    }
  } else {
    throw new Error('wtf? getClientAnimationRenderProcessState')
  }
}
