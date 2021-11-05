import { getAnimationModule } from '../helpers/getAnimationModule'
import { getAnimationModuleBundle } from '../helpers/getAnimationModuleBundle'
import { renderAnimationFrame } from '../helpers/renderAnimationFrame'

export interface RenderAnimationModuleFrameApi {
  animationModulePath: string
  frameFileOutputPath: string
  frameIndex: number
}

export async function renderAnimationModuleFrame(
  api: RenderAnimationModuleFrameApi
) {
  const { animationModulePath, frameFileOutputPath, frameIndex } = api
  const { animationModuleBundle } = await getAnimationModuleBundle({
    animationModulePath,
  })
  const animationModule = await getAnimationModule({
    animationModuleBundle,
  })
  await renderAnimationFrame({
    frameFileOutputPath,
    frameIndex,
    animationModule,
  })
}
