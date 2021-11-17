import { SagaReturnType } from '@redux-saga/core/effects'
import { put, takeEvent } from '../helpers/storeEffects'
import { AnimationModuleSourceEvent } from '../models/AnimationModuleSourceEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'

export interface AnimationModuleSourceEventHandlerSagaApi
  extends Pick<
    SagaReturnType<typeof animationDevelopmentSetupSaga>,
    'animationModuleSourceEventChannel'
  > {}

export function* animationModuleSourceEventHandlerSaga(
  api: AnimationModuleSourceEventHandlerSagaApi
) {
  const { animationModuleSourceEventChannel } = api
  while (true) {
    const someAnimationModuleSourceEvent =
      yield* takeEvent<AnimationModuleSourceEvent>(
        animationModuleSourceEventChannel
      )
    switch (someAnimationModuleSourceEvent.eventType) {
      case 'animationModuleSourceChanged':
        yield* put({
          type: 'animationModuleSourceChanged',
          actionPayload: {
            nextAnimationModuleSessionVersion:
              someAnimationModuleSourceEvent.eventPayload
                .nextAnimationModuleSessionVersion,
          },
        })
        break
    }
  }
}
