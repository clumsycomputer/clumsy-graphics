import VirtualMachine from 'vm'
import { decodeData } from '../helpers/decodeData'
import {
  AnimationModuleContainer,
  AnimationModuleContainerCodec,
} from '../models/AnimationModule'
import 'isomorphic-fetch'

export interface GetAnimationModuleApi {
  animationModuleBundle: string
}

export async function getAnimationModule(api: GetAnimationModuleApi) {
  const { animationModuleBundle } = api
  const evaluationContext = VirtualMachine.createContext({
    ...globalThis,
    console,
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
