import * as IO from 'io-ts'

export interface AnimationModuleContainer
  extends EsModuleDefault<AnimationModule> {}

export interface AnimationModule {
  moduleName: string
  frameCount: number
  frameSize: {
    width: number
    height: number
  }
  animationSettings: {
    frameRate: number
    constantRateFactor: number
  }
  getFrameDescription: (props: {
    frameCount: number
    frameIndex: number
  }) => Promise<JSX.Element>
}

export interface EsModuleDefault<SomeDefaultExport extends object> {
  default: SomeDefaultExport
}

export const AnimationModuleCodec = IO.exact(
  IO.type({
    moduleName: IO.string,
    getFrameDescription: IO.any,
    frameCount: IO.number,
    frameSize: IO.exact(
      IO.type({
        width: IO.number,
        height: IO.number,
      })
    ),
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
    moduleName: IO.string,
    frameCount: IO.number,
    frameSize: IO.exact(
      IO.type({
        width: IO.number,
        height: IO.number,
      })
    ),
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
