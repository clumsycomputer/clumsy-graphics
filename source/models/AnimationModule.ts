import * as IO from 'io-ts'
import { ReactElement } from 'react'

export interface AnimationModuleContainer
  extends EsModuleDefault<AnimationModule> {}

export interface AnimationModule {
  animationName: string
  frameCount: number
  frameSize: number
  FrameDescriptor: (props: {
    frameCount: number
    frameIndex: number
  }) => ReactElement
  animationSettings: {
    frameRate: number
    constantRateFactor: number
  }
}

export interface EsModuleDefault<SomeDefaultExport extends object> {
  default: SomeDefaultExport
}

export const AnimationModuleCodec = IO.exact(
  IO.type({
    animationName: IO.string,
    FrameDescriptor: IO.any,
    frameCount: IO.number,
    frameSize: IO.number,
    animationSettings: IO.exact(
      IO.type({
        frameRate: IO.number,
        constantRateFactor: IO.number,
      })
    ),
  })
)

export const ClientAnimationModuleCodec = IO.exact(
  IO.type({
    animationName: IO.string,
    frameCount: IO.number,
    frameSize: IO.number,
    animationSettings: IO.exact(
      IO.type({
        frameRate: IO.number,
        constantRateFactor: IO.number,
      })
    ),
  })
)

export const AnimationModuleContainerCodec = IO.exact(
  IO.type({
    default: AnimationModuleCodec,
  })
)
