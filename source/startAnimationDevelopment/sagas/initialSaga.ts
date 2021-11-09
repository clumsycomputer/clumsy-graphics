import { build as buildModule } from 'esbuild'
import getNodeExternalsPlugin from 'esbuild-node-externals'
import Path from 'path'
import { eventChannel as getEventChannel } from 'redux-saga'
import { put, spawn, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleSourceEvent } from '../models/AnimationModuleSourceEvent'
import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment'

export interface InitialSagaApi
  extends Pick<
    StartAnimationDevelopmentApi,
    | 'animationModulePath'
    | 'generatedAssetsDirectoryPath'
    | 'clientServerPort'
    | 'numberOfFrameRendererWorkers'
  > {}

export function* initialSaga(api: InitialSagaApi) {
  const { animationModulePath } = api
  yield* spawn(function* () {
    const { animationModuleSourceEventChannel } =
      getAnimationModuleSourceEventChannel({
        animationModulePath,
      })
    while (true) {
      const someAnimationModuleSourceEvent =
        yield* takeEvent<AnimationModuleSourceEvent>(
          animationModuleSourceEventChannel
        )
      switch (someAnimationModuleSourceEvent.eventType) {
        case 'animationModuleSourceUpdated':
          yield* put<AnimationModuleSourceUpdatedAction>({
            type: 'animationModuleSourceUpdated',
            actionPayload: {},
          })
          break
      }
    }
  })
}

interface GetAnimationModuleSourceEventChannelApi
  extends Pick<InitialSagaApi, 'animationModulePath'> {}

function getAnimationModuleSourceEventChannel(
  api: GetAnimationModuleSourceEventChannelApi
) {
  const { animationModulePath } = api
  const animationModuleSourceEventChannel =
    getEventChannel<AnimationModuleSourceEvent>(
      (emitAnimationModuleSourceEvent) => {
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
              emitAnimationModuleSourceEvent({
                eventType: 'animationModuleSourceUpdated',
                eventPayload: {},
              })
            },
          },
        }).then(() => {
          emitAnimationModuleSourceEvent({
            eventType: 'animationModuleSourceUpdated',
            eventPayload: {},
          })
        })
        return () => {}
      }
    )
  return { animationModuleSourceEventChannel }
}
