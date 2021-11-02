import * as IO from 'io-ts'

export interface FrameRendererWorkerData {
  animationModuleBundle: string
}

export const FrameRendererWorkerDataCodec = IO.exact(
  IO.type({
    animationModuleBundle: IO.string,
  })
)
