import * as IO from 'io-ts'

export type GraphicsRendererProcessStateRequestQueryParams =
  | RenderAnimationProcessStateRequestQueryParams
  | RenderFrameProcessStateRequestQueryParams

export interface RenderAnimationProcessStateRequestQueryParams
  extends GraphicsRendererProcessStateRequestQueryParamsBase<'mp4'> {}

const RenderAnimationProcessStateRequestQueryParamsCodec = IO.exact(
  IO.type({
    assetType: IO.literal('mp4'),
  })
)

export interface RenderFrameProcessStateRequestQueryParams
  extends GraphicsRendererProcessStateRequestQueryParamsBase<'png'> {
  frameIndex: string
}

const RenderFrameProcessStateRequestQueryParamsCodec = IO.exact(
  IO.type({
    assetType: IO.literal('png'),
    frameIndex: IO.string,
  })
)

interface GraphicsRendererProcessStateRequestQueryParamsBase<
  AssetType extends string
> {
  assetType: AssetType
}

export const GraphicsRendererProcessStateRequestQueryParamsCodec = IO.union([
  RenderAnimationProcessStateRequestQueryParamsCodec,
  RenderFrameProcessStateRequestQueryParamsCodec,
])
