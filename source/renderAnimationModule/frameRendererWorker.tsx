import FileSystem from 'fs'
// @ts-expect-error
import Inkscape from 'inkscape'
import React from 'react'
import ReactDomServer from 'react-dom/server'
import { Readable as ReadableStream } from 'stream'
import Stream from 'stream/promises'
import { parentPort, workerData } from 'worker_threads'
import { decodeData } from '../helpers/decodeData'
import { FunctionResult } from '../models/common'
import { getAnimationModule } from './helpers/getAnimationModule'
import { AnimationModule } from './models/AnimationModule'
import {
  FrameRendererWorkerData,
  FrameRendererWorkerDataCodec,
} from './models/FrameRendererWorkerData'
import {
  FrameRendererWorkerInitializedMessage,
  FrameRendererWorkerRenderedFrameMessage,
  FrameRendererWorkerRenderErrorMessage,
} from './models/FrameRendererWorkerMessage'
import {
  RenderAnimationFrameMessage,
  RenderAnimationFrameMessageCodec,
} from './models/RenderFrameMessage'

startFrameRendererWorker()

async function startFrameRendererWorker() {
  const frameRendererParentSagaMessageChannel = parentPort!
  const { animationModuleBundle } = await decodeData<FrameRendererWorkerData>({
    targetCodec: FrameRendererWorkerDataCodec,
    inputData: workerData,
  })
  const animationModule = await getAnimationModule({
    animationModuleBundle,
  })
  frameRendererParentSagaMessageChannel.on(
    'message',
    async (someRenderFrameMessageData: unknown) => {
      const someRenderFrameMessage =
        await decodeData<RenderAnimationFrameMessage>({
          targetCodec: RenderAnimationFrameMessageCodec,
          inputData: someRenderFrameMessageData,
        })
      const { frameIndex, framePngOutputPath } =
        someRenderFrameMessage.messagePayload
      const { FrameDescriptor, frameCount } = animationModule
      try {
        const frameSvgMarkup = ReactDomServer.renderToStaticMarkup(
          <FrameDescriptor frameCount={frameCount} frameIndex={frameIndex} />
        )
        await writeSvgMarkupToPngFile({
          frameSvgMarkup,
          framePngOutputPath,
          frameSize: animationModule.frameSize,
        })
        const renderedFrameMessage: FrameRendererWorkerRenderedFrameMessage = {
          messageType: 'workerRenderedFrame',
          messagePayload: {},
        }
        frameRendererParentSagaMessageChannel.postMessage(renderedFrameMessage)
      } catch (renderError) {
        const renderErrorMessage: FrameRendererWorkerRenderErrorMessage = {
          messageType: 'workerRenderError',
          messagePayload: {
            renderError,
          },
        }
        frameRendererParentSagaMessageChannel.postMessage(renderErrorMessage)
      }
    }
  )
  const initializedMessage: FrameRendererWorkerInitializedMessage = {
    messageType: 'workerInitialized',
    messagePayload: {},
  }
  frameRendererParentSagaMessageChannel.postMessage(initializedMessage)
}

interface WriteSvgMarkupToPngFileApi
  extends Pick<AnimationModule, 'frameSize'>,
    Pick<RenderAnimationFrameMessage['messagePayload'], 'framePngOutputPath'> {
  frameSvgMarkup: FunctionResult<typeof ReactDomServer.renderToStaticMarkup>
}

function writeSvgMarkupToPngFile(api: WriteSvgMarkupToPngFileApi) {
  const { frameSvgMarkup, frameSize, framePngOutputPath } = api
  const frameSvgStream = ReadableStream.from([frameSvgMarkup])
  const svgToPngStream = new Inkscape([
    '--export-type=png',
    `--export-width=${frameSize}`,
  ])
  const framePngWriteStream = FileSystem.createWriteStream(framePngOutputPath)
  return Stream.pipeline(frameSvgStream, svgToPngStream, framePngWriteStream)
}
