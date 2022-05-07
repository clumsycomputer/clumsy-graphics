import { call, spawn } from '../helpers/storeEffects'
import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'
import { animationModuleBundlerEventHandlerSaga } from './animationModuleSourceEventHandlerSaga'
import { clientServerEventHandlerSaga } from './clientServerEventHandlerSaga'
import { graphicsRendererProcessManagerSaga } from './graphicsRendererProcessManagerSaga'

export interface InitialSagaApi
  extends Pick<
    StartAnimationDevelopmentApi,
    | 'animationModulePath'
    | 'generatedAssetsDirectoryPath'
    | 'clientServerPort'
    | 'numberOfFrameRendererWorkers'
  > {}

export function* initialSaga(api: InitialSagaApi) {
  const {
    animationModulePath,
    generatedAssetsDirectoryPath,
    clientServerPort,
    numberOfFrameRendererWorkers,
  } = api
  const {
    animationModuleBundlerEventChannel,
    clientServerEventChannel,
    clientPageBundle,
    localStorageSessionCacheId,
    graphicsRendererProcessManagerActionChannel,
  } = yield* call(animationDevelopmentSetupSaga, {
    animationModulePath,
    generatedAssetsDirectoryPath,
    clientServerPort,
  })
  yield* spawn(animationModuleBundlerEventHandlerSaga, {
    animationModuleBundlerEventChannel,
  })
  yield* spawn(clientServerEventHandlerSaga, {
    animationModulePath,
    generatedAssetsDirectoryPath,
    numberOfFrameRendererWorkers,
    clientServerEventChannel,
    clientPageBundle,
    localStorageSessionCacheId,
  })
  yield* spawn(graphicsRendererProcessManagerSaga, {
    graphicsRendererProcessManagerActionChannel,
  })
}
