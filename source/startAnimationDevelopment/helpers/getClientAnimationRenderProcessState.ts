import { AnimationModuleSourceReadyState } from '../models/AnimationDevelopmentState'
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
      processStatus: 'processActive' as 'processActive',
    }
  } else {
    throw new Error('wtf? getClientAnimationRenderProcessState')
  }
}
