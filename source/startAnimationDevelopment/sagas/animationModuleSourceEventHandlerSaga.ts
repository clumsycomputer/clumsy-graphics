import { SagaReturnType } from '@redux-saga/core/effects'
import { put, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleBundlerEvent } from '../models/AnimationModuleSourceEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'

export interface AnimationModuleBundlerEventHandlerSagaApi
  extends Pick<
    SagaReturnType<typeof animationDevelopmentSetupSaga>,
    'animationModuleBundlerEventChannel'
  > {}

export function* animationModuleBundlerEventHandlerSaga(
  api: AnimationModuleBundlerEventHandlerSagaApi
) {
  const { animationModuleBundlerEventChannel } = api
  while (true) {
    const someAnimationModuleBundlerEvent =
      yield* takeEvent<AnimationModuleBundlerEvent>(
        animationModuleBundlerEventChannel
      )
    switch (someAnimationModuleBundlerEvent.eventType) {
      case 'animationModuleBundler_initialBuildSucceeded':
        yield* put({
          type: someAnimationModuleBundlerEvent.eventType,
          actionPayload: {
            ...someAnimationModuleBundlerEvent.eventPayload,
          },
        })
        break
      case 'animationModuleBundler_rebuildSucceeded':
        yield* put({
          type: someAnimationModuleBundlerEvent.eventType,
          actionPayload: {
            ...someAnimationModuleBundlerEvent.eventPayload,
          },
        })
        break
      case 'animationModuleBundler_rebuildFailed':
        yield* put({
          type: someAnimationModuleBundlerEvent.eventType,
          actionPayload: {
            ...someAnimationModuleBundlerEvent.eventPayload,
          },
        })
        break
    }
  }
}
