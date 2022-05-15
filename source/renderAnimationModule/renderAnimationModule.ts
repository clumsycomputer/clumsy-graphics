import ChildProcess from 'child_process'
import FileSystem from 'fs'
import Path from 'path'
import { Worker } from 'worker_threads'
import { decodeData } from '../helpers/decodeData'
import { getAnimationModule } from '../helpers/getAnimationModule'
import { getAnimationModuleBundle } from '../helpers/getAnimationModuleBundle'
import { AnimationModule } from '../models/AnimationModule'
import { FunctionBrand, FunctionResult } from '../models/common'
import {
  FrameRendererWorkerMessage,
  FrameRendererWorkerMessageCodec,
} from './models/FrameRendererWorkerMessage'
import { RenderAnimationFrameMessage } from './models/RenderFrameMessage'

export interface RenderAnimationModuleApi {
  animationModulePath: string
  animationMp4OutputPath: string
  numberOfFrameRendererWorkers: number
  suppressWorkerStdout: boolean
}

export async function renderAnimationModule(api: RenderAnimationModuleApi) {
  const {
    animationModulePath,
    animationMp4OutputPath,
    numberOfFrameRendererWorkers,
    suppressWorkerStdout,
  } = api
  const { animationModuleBundle } = await getAnimationModuleBundle({
    animationModulePath,
  })
  const animationModule = await getAnimationModule({
    animationModuleBundle,
  })
  const { tempFramesDirectoryPath } = getTempFramesDirectoryPath({
    animationModule,
  })
  try {
    setupTempFramesDirectory({
      tempFramesDirectoryPath,
    })
    await renderAnimationFrames({
      numberOfFrameRendererWorkers,
      suppressWorkerStdout,
      tempFramesDirectoryPath,
      animationModuleBundle,
      animationModule,
    })
    composeAnimationMp4({
      animationMp4OutputPath,
      frameRate: animationModule.animationSettings.frameRate,
      constantRateFactor: animationModule.animationSettings.constantRateFactor,
      framePathPattern: `${tempFramesDirectoryPath}/${animationModule.moduleName}_%d.png`,
    })
  } finally {
    cleanupTempFramesDirectory({
      tempFramesDirectoryPath,
    })
  }
}

interface GetTempFramesDirectoryPathApi {
  animationModule: FunctionResult<typeof getAnimationModule>
}

function getTempFramesDirectoryPath(api: GetTempFramesDirectoryPathApi) {
  const { animationModule } = api
  const tempFramesDirectoryPath = Path.resolve(
    __dirname,
    `./${animationModule.moduleName}-frames_${Math.ceil(Math.random() * 10000)}`
  )
  return { tempFramesDirectoryPath }
}

interface SetupTempFramesDirectoryPathApi
  extends FunctionBrand<typeof getTempFramesDirectoryPath> {}

function setupTempFramesDirectory(api: SetupTempFramesDirectoryPathApi) {
  const { tempFramesDirectoryPath } = api
  FileSystem.mkdirSync(tempFramesDirectoryPath, {
    recursive: true,
  })
}

interface RenderAnimationFramesApi
  extends Pick<
      RenderAnimationModuleApi,
      'numberOfFrameRendererWorkers' | 'suppressWorkerStdout'
    >,
    FunctionBrand<typeof getAnimationModuleBundle>,
    FunctionBrand<typeof getTempFramesDirectoryPath> {
  animationModule: FunctionResult<typeof getAnimationModule>
}

async function renderAnimationFrames(api: RenderAnimationFramesApi) {
  const {
    numberOfFrameRendererWorkers,
    animationModuleBundle,
    suppressWorkerStdout,
    animationModule,
    tempFramesDirectoryPath,
  } = api
  console.log('rendering frames...')
  await new Promise<void>((resolve, reject) => {
    let framesRenderedCount = 0
    let nextFrameIndex = 0
    new Array(numberOfFrameRendererWorkers)
      .fill(undefined)
      .map(
        () =>
          new Worker(Path.resolve(__dirname, './frameRendererWorker.js'), {
            workerData: {
              animationModuleBundle,
            },
            stdout: suppressWorkerStdout,
          })
      )
      .forEach((someFrameRendererWorker) => {
        someFrameRendererWorker.on(
          'message',
          async (someFrameRendererWorkerMessageData: unknown) => {
            const someFrameRendererWorkerMessage =
              await decodeData<FrameRendererWorkerMessage>({
                targetCodec: FrameRendererWorkerMessageCodec,
                inputData: someFrameRendererWorkerMessageData,
              })
            switch (someFrameRendererWorkerMessage.messageType) {
              // @ts-expect-error
              case 'workerRenderedFrame':
                framesRenderedCount = framesRenderedCount + 1
              case 'workerInitialized':
                if (nextFrameIndex < animationModule.frameCount) {
                  const renderAnimationFrameMessage: RenderAnimationFrameMessage =
                    {
                      messageType: 'renderAnimationFrame',
                      messagePayload: {
                        frameIndex: nextFrameIndex,
                        framePngOutputPath: Path.join(
                          tempFramesDirectoryPath,
                          `./${animationModule.moduleName}_${nextFrameIndex}.png`
                        ),
                      },
                    }
                  someFrameRendererWorker.postMessage(
                    renderAnimationFrameMessage
                  )
                  nextFrameIndex = nextFrameIndex + 1
                } else {
                  someFrameRendererWorker.terminate()
                }
                if (framesRenderedCount === animationModule.frameCount) {
                  resolve()
                }
                break
              case 'workerRenderError':
                reject(
                  someFrameRendererWorkerMessage.messagePayload.renderError
                )
                break
            }
          }
        )
      })
  })
}

interface ComposeAnimationMp4Api
  extends Pick<
      AnimationModule['animationSettings'],
      'frameRate' | 'constantRateFactor'
    >,
    Pick<RenderAnimationModuleApi, 'animationMp4OutputPath'> {
  framePathPattern: string
}

function composeAnimationMp4(api: ComposeAnimationMp4Api) {
  const {
    frameRate,
    framePathPattern,
    constantRateFactor,
    animationMp4OutputPath,
  } = api
  console.log('encoding animation...')
  ChildProcess.execSync(`
    ffmpeg \
      -y \
      -f image2 \
      -framerate ${frameRate} \
      -i ${framePathPattern} \
      -codec libx264 \
      -preset veryslow \
      -crf ${constantRateFactor} \
      -pix_fmt yuv420p \
      ${Path.resolve(animationMp4OutputPath)}
  `)
}

interface CleanupTempFramesDirectoryApi
  extends FunctionBrand<typeof getTempFramesDirectoryPath> {}

function cleanupTempFramesDirectory(api: CleanupTempFramesDirectoryApi) {
  const { tempFramesDirectoryPath } = api
  FileSystem.rmSync(tempFramesDirectoryPath, {
    force: true,
    recursive: true,
  })
}
