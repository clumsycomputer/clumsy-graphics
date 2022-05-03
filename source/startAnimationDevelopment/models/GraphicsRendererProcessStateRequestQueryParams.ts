import * as IO from 'io-ts'

export interface GraphicsRendererProcessStateRequestQueryParams {
  graphicsRendererProcessKey: string
}

export const GraphicsRendererProcessStateRequestQueryParamsCodec = IO.exact(
  IO.type({
    graphicsRendererProcessKey: IO.string,
  })
)
