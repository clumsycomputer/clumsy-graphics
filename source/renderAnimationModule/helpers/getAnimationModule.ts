import VirtualMachine from 'vm'
import {
  AnimationModuleContainer,
  AnimationModuleContainerCodec,
} from '../models/AnimationModule'
import { decodeData } from '../../helpers/decodeData'

export interface GetAnimationModuleApi {
  animationModuleBundle: string
}

export async function getAnimationModule(api: GetAnimationModuleApi) {
  const { animationModuleBundle } = api
  const evaluationContext = VirtualMachine.createContext({
    process: {
      env: {
        NODE_ENV: 'development',
      },
    },
  })
  VirtualMachine.runInContext(animationModuleBundle, evaluationContext)
  const evaluatedAnimationModuleBundle: unknown =
    evaluationContext['animationModule']
  const animationModuleContainer = await decodeData<AnimationModuleContainer>({
    targetCodec: AnimationModuleContainerCodec,
    inputData: evaluatedAnimationModuleBundle,
  })
  const animationModule = animationModuleContainer.default
  return animationModule
}
