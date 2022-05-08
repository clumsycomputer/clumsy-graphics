import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import Path from 'path'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import { getAnimationModule } from '../../helpers/getAnimationModule'
import { getAnimationModuleBundle } from '../../helpers/getAnimationModuleBundle'
import { AnimationModuleBundlerEvent } from '../models/AnimationModuleSourceEvent'
import { InitialSagaApi } from '../sagas/initialSaga'

export interface GetAnimationModuleBundlerEventChannelApi
  extends Pick<InitialSagaApi, 'animationModulePath'> {}

export function getAnimationModuleBundlerEventChannel(
  api: GetAnimationModuleBundlerEventChannelApi
) {
  const { animationModulePath } = api
  const animationModuleBundlerEventChannel =
    getEventChannel<AnimationModuleBundlerEvent>(
      (emitAnimationModuleSourceEvent) => {
        let nextBundleSessionVersion = 0
        buildModule({
          platform: 'node',
          bundle: true,
          write: false,
          incremental: true,
          logLevel: 'silent',
          absWorkingDir: process.cwd(),
          entryPoints: [Path.resolve(animationModulePath)],
          plugins: [getNodeExternalsPlugin()],
          watch: {
            onRebuild: async () => {
              try {
                const { animationModuleBundle } =
                  await getAnimationModuleBundle({
                    animationModulePath,
                  })
                const nextAnimationModule = await getAnimationModule({
                  animationModuleBundle,
                })
                nextBundleSessionVersion = nextBundleSessionVersion + 1
                emitAnimationModuleSourceEvent({
                  eventType: 'animationModuleBundler_rebuildSucceeded',
                  eventPayload: {
                    nextBundleSessionVersion,
                    nextAnimationModule,
                    nextLatestBundleStatus: 'bundleValid',
                  },
                })
              } catch (nextBundleError) {
                emitAnimationModuleSourceEvent({
                  eventType: 'animationModuleBundler_rebuildFailed',
                  eventPayload: {
                    nextBundleSessionVersion,
                    nextLatestBundleStatus: 'bundleInvalid',
                    nextBundleErrorMessage:
                      nextBundleError instanceof Error
                        ? nextBundleError.message
                        : 'Invalid animation module',
                  },
                })
              }
            },
          },
        }).then(async () => {
          const { animationModuleBundle } = await getAnimationModuleBundle({
            animationModulePath,
          })
          const nextAnimationModule = await getAnimationModule({
            animationModuleBundle,
          })
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleBundler_initialBuildSucceeded',
            eventPayload: {
              nextBundleSessionVersion,
              nextAnimationModule,
              nextLatestBundleStatus: 'bundleValid',
            },
          })
        })
        return () => {}
      },
      SagaBuffers.sliding(1)
    )
  return { animationModuleBundlerEventChannel }
}
