import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import Path from 'path'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import { getAnimationModule } from '../../helpers/getAnimationModule'
import { getAnimationModuleBundle } from '../../helpers/getAnimationModuleBundle'
import { AnimationModuleSourceEvent } from '../models/AnimationModuleSourceEvent'
import { InitialSagaApi } from '../sagas/initialSaga'

export interface GetAnimationModuleSourceEventChannelApi
  extends Pick<InitialSagaApi, 'animationModulePath'> {}

export function getAnimationModuleSourceEventChannel(
  api: GetAnimationModuleSourceEventChannelApi
) {
  const { animationModulePath } = api
  const animationModuleSourceEventChannel =
    getEventChannel<AnimationModuleSourceEvent>(
      (emitAnimationModuleSourceEvent) => {
        let nextAnimationModuleSessionVersion = 0
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
              nextAnimationModuleSessionVersion =
                nextAnimationModuleSessionVersion + 1
              // todo handle bundle errors
              const { animationModuleBundle } = await getAnimationModuleBundle({
                animationModulePath,
              })
              const nextAnimationModule = await getAnimationModule({
                animationModuleBundle,
              })
              emitAnimationModuleSourceEvent({
                eventType: 'animationModuleSourceChanged',
                eventPayload: {
                  nextAnimationModule,
                  nextAnimationModuleSessionVersion,
                },
              })
            },
          },
        }).then(async () => {
          // todo handle bundle errors
          const { animationModuleBundle } = await getAnimationModuleBundle({
            animationModulePath,
          })
          const nextAnimationModule = await getAnimationModule({
            animationModuleBundle,
          })
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleSourceChanged',
            eventPayload: {
              nextAnimationModule,
              nextAnimationModuleSessionVersion,
            },
          })
        })
        return () => {}
      },
      SagaBuffers.sliding(1)
    )
  return { animationModuleSourceEventChannel }
}
