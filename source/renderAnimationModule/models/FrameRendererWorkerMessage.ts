import { MessageBase } from '../../models/common'
import * as IO from 'io-ts'

export type FrameRendererWorkerMessage =
  | FrameRendererWorkerInitializedMessage
  | FrameRendererWorkerRenderedFrameMessage
  | FrameRendererWorkerRenderErrorMessage

export interface FrameRendererWorkerInitializedMessage
  extends MessageBase<'workerInitialized', {}> {}

const FrameRendererWorkerInitializedMessageCodec = IO.exact(
  IO.type({
    messageType: IO.literal('workerInitialized'),
    messagePayload: IO.exact(IO.type({})),
  })
)

export interface FrameRendererWorkerRenderedFrameMessage
  extends MessageBase<'workerRenderedFrame', {}> {}

const FrameRendererWorkerRenderedFrameMessageCodec = IO.exact(
  IO.type({
    messageType: IO.literal('workerRenderedFrame'),
    messagePayload: IO.exact(IO.type({})),
  })
)

export interface FrameRendererWorkerRenderErrorMessage
  extends MessageBase<
    'workerRenderError',
    {
      renderError: unknown
    }
  > {}

const FrameRendererWorkerRenderErrorMessage = IO.exact(
  IO.type({
    messageType: IO.literal('workerRenderError'),
    messagePayload: IO.exact(
      IO.type({
        renderError: IO.any,
      })
    ),
  })
)

export const FrameRendererWorkerMessageCodec = IO.union([
  FrameRendererWorkerInitializedMessageCodec,
  FrameRendererWorkerRenderedFrameMessageCodec,
  FrameRendererWorkerRenderErrorMessage,
])
