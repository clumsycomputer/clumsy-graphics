import { build as buildModule } from 'esbuild'

export interface GetAnimationModuleBundleApi {
  animationModulePath: string
}

export async function getAnimationModuleBundle(
  api: GetAnimationModuleBundleApi
) {
  const { animationModulePath } = api
  const animationModuleBuildResult = await buildModule({
    absWorkingDir: process.cwd(),
    entryPoints: [animationModulePath],
    bundle: true,
    platform: 'node',
    format: 'iife',
    globalName: 'animationModule',
    write: false,
  })
  const animationModuleBundle = animationModuleBuildResult.outputFiles[0]!.text!
  return { animationModuleBundle }
}
