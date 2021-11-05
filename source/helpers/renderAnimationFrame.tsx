import FileSystem from 'fs'
// @ts-expect-error
import Inkscape from 'inkscape'
import ReactDomServer from 'react-dom/server'
import { Readable as ReadableStream } from 'stream'
import Stream from 'stream/promises'
import { AnimationModule } from '../models/AnimationModule'
import { FunctionResult } from '../models/common'
import { decodeData } from './decodeData'
import { getAnimationModule } from './getAnimationModule'
import * as IO from 'io-ts'

export interface RenderAnimationFrameApi {
  animationModule: FunctionResult<typeof getAnimationModule>
  frameIndex: number
  frameFileOutputPath: string
}

export async function renderAnimationFrame(api: RenderAnimationFrameApi) {
  const { animationModule, frameIndex, frameFileOutputPath } = api
  const { FrameDescriptor, frameCount } = animationModule
  const frameSvgMarkup = ReactDomServer.renderToStaticMarkup(
    <FrameDescriptor frameCount={frameCount} frameIndex={frameIndex} />
  )
  await writeSvgMarkupToPngFile({
    frameFileOutputPath,
    frameSvgMarkup,
    frameSize: animationModule.frameSize,
  })
}

interface WriteSvgMarkupToFileApi extends Pick<AnimationModule, 'frameSize'> {
  frameSvgMarkup: FunctionResult<typeof ReactDomServer.renderToStaticMarkup>
  frameFileOutputPath: string
}

async function writeSvgMarkupToPngFile(api: WriteSvgMarkupToFileApi) {
  const { frameSvgMarkup, frameSize, frameFileOutputPath } = api
  const frameSvgStream = ReadableStream.from([frameSvgMarkup])
  const frameFileOutputTypeData: unknown = frameFileOutputPath.split(
    /\.(svg|png)$/,
    2
  )[1]
  const frameFileOutputType = await decodeData<'svg' | 'png'>({
    targetCodec: IO.union([IO.literal('svg'), IO.literal('png')]),
    inputData: frameFileOutputTypeData,
  })
  const svgToPngStream = new Inkscape([
    `--export-type=${frameFileOutputType}`,
    `--export-width=${frameSize}`,
  ])
  const framePngWriteStream = FileSystem.createWriteStream(frameFileOutputPath)
  return Stream.pipeline(frameSvgStream, svgToPngStream, framePngWriteStream)
}
