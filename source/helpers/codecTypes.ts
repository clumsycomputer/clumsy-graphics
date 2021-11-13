import * as IO from 'io-ts'

export const NumberFromString = new IO.Type<number, number, unknown>(
  'NumberFromString',
  (unknownInput): unknownInput is number => typeof unknownInput === 'number',
  (unknownInput, ioContext) => {
    const numberOutput = Number(unknownInput)
    return isNaN(numberOutput)
      ? IO.failure(unknownInput, ioContext)
      : IO.success(numberOutput)
  },
  (numberInput) => numberInput
)
