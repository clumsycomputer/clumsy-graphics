import FileSystem from 'fs'
import Path from 'path'
import { buffers as SagaBuffers } from 'redux-saga'
import { getAnimationModuleSourceEventChannel } from '../eventChannels/getAnimationModuleSourceEventChannel'
import { getClientServerEventChannel } from '../eventChannels/getClientServerEventChannel'
import { actionChannel } from '../helpers/storeEffects'
import { RenderProcessManagerAction } from '../models/AnimationDevelopmentAction'
import { InitialSagaApi } from './initialSaga'

export interface AnimationDevelopmentSetupSagaApi
  extends Pick<
    InitialSagaApi,
    'generatedAssetsDirectoryPath' | 'animationModulePath' | 'clientServerPort'
  > {}

export function* animationDevelopmentSetupSaga(
  api: AnimationDevelopmentSetupSagaApi
) {
  const {
    generatedAssetsDirectoryPath,
    animationModulePath,
    clientServerPort,
  } = api
  FileSystem.rmSync(Path.resolve(generatedAssetsDirectoryPath), {
    recursive: true,
    force: true,
  })
  FileSystem.mkdirSync(Path.resolve(generatedAssetsDirectoryPath))
  const { animationModuleSourceEventChannel } =
    getAnimationModuleSourceEventChannel({
      animationModulePath,
    })
  const { clientServerEventChannel } = getClientServerEventChannel({
    clientServerPort,
  })
  const renderProcessManagerActionChannel =
    yield* actionChannel<RenderProcessManagerAction>(
      [
        'animationModuleSourceChanged',
        'spawnAnimationRenderProcess',
        'spawnFrameRenderProcess',
      ],
      SagaBuffers.expanding(3)
    )
  return {
    animationModuleSourceEventChannel,
    clientServerEventChannel,
    renderProcessManagerActionChannel,
  }
}
