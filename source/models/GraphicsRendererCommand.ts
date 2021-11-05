import * as IO from 'io-ts'
import { RenderAnimationModuleApi } from '../renderAnimationModule/renderAnimationModule'
import { ConvertAnimationMp4ToGifApi } from '../convertAnimationMp4ToGif/convertAnimationMp4ToGif'
import { Optional } from './common'

const NumberFromString = new IO.Type<number, string, unknown>(
  'NumberFromString',
  (unknownInput): unknownInput is number => typeof unknownInput === 'number',
  (unknownInput, ioContext) => {
    const numberOutput = Number(unknownInput)
    return isNaN(numberOutput)
      ? IO.failure(unknownInput, ioContext)
      : IO.success(numberOutput)
  },
  (numberInput) => `${numberInput}`
)

export type GraphicsRendererCommand =
  | RenderAnimationCommand
  | RenderAnimationFrameCommand
  | ConvertAnimationToGifCommand

interface RenderAnimationCommand
  extends CliCommandBase<
    'renderAnimation',
    Optional<RenderAnimationModuleApi, 'numberOfFrameRendererWorkers'>
  > {}

const RenderAnimationCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('renderAnimation'),
    commandApi: IO.exact(
      IO.intersection([
        IO.type({
          animationModulePath: IO.string,
          outputDirectoryPath: IO.string,
        }),
        IO.partial({
          numberOfFrameRendererWorkers: NumberFromString,
        }),
      ])
    ),
  })
)

interface RenderAnimationFrameCommand
  extends CliCommandBase<
    'renderAnimationFrame',
    {
      animationModulePath: string
      frameFileOutputPath: string
      frameIndex: number
    }
  > {}

const RenderAnimationFrameCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('renderAnimationFrame'),
    commandApi: IO.exact(
      IO.type({
        animationModulePath: IO.string,
        frameFileOutputPath: IO.string,
        frameIndex: NumberFromString,
      })
    ),
  })
)

interface ConvertAnimationToGifCommand
  extends CliCommandBase<
    'convertAnimationToGif',
    ConvertAnimationMp4ToGifApi
  > {}

const ConvertAnimationToGifCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('convertAnimationToGif'),
    commandApi: IO.exact(
      IO.intersection([
        IO.type({
          animationMp4SourcePath: IO.string,
          animationGifOutputPath: IO.string,
        }),
        IO.partial({
          gifAspectRatioWidth: NumberFromString,
        }),
      ])
    ),
  })
)

interface CliCommandBase<
  CommandName extends string,
  CommandOptions extends object
> {
  commandName: CommandName
  commandApi: CommandOptions
}

export const GraphicsRendererCommandCodec = IO.union([
  RenderAnimationCommandCodec,
  RenderAnimationFrameCommandCodec,
  ConvertAnimationToGifCommandCodec,
])
