import { call, spawn } from '../helpers/storeEffects'
import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment'
import { animationModuleSourceEventHandlerSaga } from './animationModuleSourceEventHandlerSaga'
import { clientServerEventHandlerSaga } from './clientServerEventHandlerSaga'
import { renderProcessManagerSaga } from './renderProcessManagerSaga'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'

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
    clientServerEventChannel,
    animationModuleSourceEventChannel,
    renderProcessManagerActionChannel,
  } = yield* call(animationDevelopmentSetupSaga, {
    animationModulePath,
    generatedAssetsDirectoryPath,
    clientServerPort,
  })
  yield* spawn(animationModuleSourceEventHandlerSaga, {
    animationModuleSourceEventChannel,
  })
  yield* spawn(clientServerEventHandlerSaga, {
    clientServerEventChannel,
  })
  yield* spawn(renderProcessManagerSaga, {
    animationModulePath,
    generatedAssetsDirectoryPath,
    numberOfFrameRendererWorkers,
    renderProcessManagerActionChannel,
  })
}
