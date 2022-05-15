import { build as buildScript } from 'esbuild'
import FileSystem from 'fs'
import Path from 'path'
import { buffers as SagaBuffers } from 'redux-saga'
import { getAnimationModuleBundlerEventChannel } from '../externals/getAnimationModuleBundlerEventChannel'
import { getClientServerEventChannel } from '../externals/getClientServerEventChannel'
import { actionChannel, call } from '../helpers/storeEffects'
import { GraphicsRendererProcessManagerAction } from '../models/AnimationDevelopmentAction'
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
  const generatedAssetsDirectoryAbsolutePath = Path.resolve(
    generatedAssetsDirectoryPath
  )
  setupGeneratedAssetsDirectory({
    generatedAssetsDirectoryAbsolutePath,
  })
  const { animationModuleBundlerEventChannel } =
    getAnimationModuleBundlerEventChannel({
      animationModulePath,
    })
  const { clientServerEventChannel } = getClientServerEventChannel({
    clientServerPort,
  })
  const graphicsRendererProcessManagerActionChannel =
    yield* actionChannel<GraphicsRendererProcessManagerAction>(
      [
        'animationModuleBundler_initialBuildSucceeded',
        'animationModuleBundler_rebuildSucceeded',
        'animationModuleBundler_rebuildFailed',
        'spawnGraphicsRendererProcess',
      ],
      SagaBuffers.expanding(3)
    )
  const { clientPageBundle } = yield* call(getClientPageBundle)
  const { localStorageSessionCacheId } = getLocalStorageSessionCacheId()
  return {
    animationModuleBundlerEventChannel,
    clientServerEventChannel,
    graphicsRendererProcessManagerActionChannel,
    clientPageBundle,
    localStorageSessionCacheId,
  }
}

interface SetupGeneratedAssetsDirectoryApi {
  generatedAssetsDirectoryAbsolutePath: string
}

function setupGeneratedAssetsDirectory(api: SetupGeneratedAssetsDirectoryApi) {
  const { generatedAssetsDirectoryAbsolutePath } = api
  FileSystem.rmSync(generatedAssetsDirectoryAbsolutePath, {
    recursive: true,
    force: true,
  })
  FileSystem.mkdirSync(generatedAssetsDirectoryAbsolutePath)
}

async function getClientPageBundle() {
  const clientPageBundleBuildResult = await buildScript({
    absWorkingDir: process.cwd(),
    entryPoints: [Path.resolve(__dirname, '../browser/index.tsx')],
    tsconfig: Path.resolve(__dirname, '../browser/tsconfig.json'),
    platform: 'browser',
    bundle: true,
    write: false,
  })
  const clientPageBundle = clientPageBundleBuildResult.outputFiles[0]!.text!
  return {
    clientPageBundle,
  }
}

function getLocalStorageSessionCacheId() {
  return {
    localStorageSessionCacheId: `${Math.random()}`,
  }
}
