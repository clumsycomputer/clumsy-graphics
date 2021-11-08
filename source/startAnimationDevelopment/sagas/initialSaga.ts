import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment'

export interface InitialSagaApi
  extends Pick<
    StartAnimationDevelopmentApi,
    | 'animationModulePath'
    | 'generatedAssetsDirectoryPath'
    | 'clientServerPort'
    | 'numberOfFrameRendererWorkers'
  > {}

export function* initialSaga(api: InitialSagaApi) {}
