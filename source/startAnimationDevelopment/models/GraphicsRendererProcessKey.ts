import * as IO from 'io-ts'

export type GraphicsRendererProcessKey = 'animation' | `frame/${number}`

export const GraphicsRendererProcessKeyFromString =
  new IO.Type<GraphicsRendererProcessKey>(
    'GraphicsRendererProcessKeyFromString',
    (unknownInput): unknownInput is GraphicsRendererProcessKey =>
      typeof unknownInput === 'string',
    (unknownInput, ioContext) => {
      const maybeGraphicsRendererProcessKeyOutput: GraphicsRendererProcessKey | null =
        unknownInput === 'animation'
          ? (unknownInput as GraphicsRendererProcessKey)
          : typeof unknownInput === 'string' &&
            unknownInput.startsWith('frame/') &&
            unknownInput.substring(6).match(/^[0-9]+$/) !== null
          ? (unknownInput as GraphicsRendererProcessKey)
          : null
      return maybeGraphicsRendererProcessKeyOutput === null
        ? IO.failure(unknownInput, ioContext)
        : IO.success(maybeGraphicsRendererProcessKeyOutput)
    },
    (someGraphicsRendererProcessKeyInput) => someGraphicsRendererProcessKeyInput
  )
