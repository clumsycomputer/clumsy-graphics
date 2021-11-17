import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import Path from 'path'
import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
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
          absWorkingDir: process.cwd(),
          entryPoints: [Path.resolve(animationModulePath)],
          plugins: [getNodeExternalsPlugin()],
          watch: {
            onRebuild: () => {
              nextAnimationModuleSessionVersion =
                nextAnimationModuleSessionVersion + 1
              emitAnimationModuleSourceEvent({
                eventType: 'animationModuleSourceChanged',
                eventPayload: {
                  nextAnimationModuleSessionVersion,
                },
              })
            },
          },
        }).then(() => {
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleSourceChanged',
            eventPayload: {
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
