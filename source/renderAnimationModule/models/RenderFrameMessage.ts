import { MessageBase } from '../../models/common'
import * as IO from 'io-ts'

export interface RenderAnimationFrameMessage
  extends MessageBase<
    'renderAnimationFrame',
    {
      frameIndex: number
      framePngOutputPath: string
    }
  > {}

export const RenderAnimationFrameMessageCodec = IO.exact(
  IO.type({
    messageType: IO.literal('renderAnimationFrame'),
    messagePayload: IO.exact(
      IO.type({
        frameIndex: IO.number,
        framePngOutputPath: IO.string,
      })
    ),
  })
)
