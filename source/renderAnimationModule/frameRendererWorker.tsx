import { parentPort, workerData } from 'worker_threads'
import { decodeData } from '../helpers/decodeData'
import { getAnimationModule } from '../helpers/getAnimationModule'
import { renderAnimationFrame } from '../helpers/renderAnimationFrame'
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
      try {
        await renderAnimationFrame({
          animationModule,
          frameIndex,
          frameFileOutputPath: framePngOutputPath,
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
