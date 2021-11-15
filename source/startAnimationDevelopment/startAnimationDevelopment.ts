import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware, { Task as SagaTask } from 'redux-saga'
import { RenderAnimationModuleApi } from '../renderAnimationModule/renderAnimationModule'
import { animationDevelopmentStateReducer } from './animationDevelopmentStateReducer'
import { AnimationDevelopmentAction } from './models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from './models/AnimationDevelopmentState'
import { initialSaga, InitialSagaApi } from './sagas/initialSaga'

export interface StartAnimationDevelopmentApi
  extends Pick<RenderAnimationModuleApi, 'numberOfFrameRendererWorkers'> {
  animationModulePath: string
  generatedAssetsDirectoryPath: string
  clientServerPort: number
}

export function startAnimationDevelopment(api: StartAnimationDevelopmentApi) {
  const {
    animationModulePath,
    generatedAssetsDirectoryPath,
    clientServerPort,
    numberOfFrameRendererWorkers,
  } = api
  const sagaMiddleware = createSagaMiddleware()
  createStore<
    AnimationDevelopmentState,
    AnimationDevelopmentAction,
    { dispatch: unknown },
    {}
  >(animationDevelopmentStateReducer, applyMiddleware(sagaMiddleware))
  sagaMiddleware.run(
    initialSaga as (
      api: InitialSagaApi
    ) => Generator<unknown, void, SagaTask | any>,
    {
      animationModulePath,
      generatedAssetsDirectoryPath,
      clientServerPort,
      numberOfFrameRendererWorkers,
    }
  )
}
