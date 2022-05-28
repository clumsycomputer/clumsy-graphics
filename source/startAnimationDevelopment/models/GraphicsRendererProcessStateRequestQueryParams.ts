import * as IO from 'io-ts'
import {
  GraphicsRendererProcessKey,
  GraphicsRendererProcessKeyFromString,
} from './GraphicsRendererProcessKey'

export interface GraphicsRendererProcessStateRequestQueryParams {
  graphicsRendererProcessKey: GraphicsRendererProcessKey
}

export const GraphicsRendererProcessStateRequestQueryParamsCodec = IO.exact(
  IO.type({
    graphicsRendererProcessKey: GraphicsRendererProcessKeyFromString,
  })
)
