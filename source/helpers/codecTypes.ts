import * as IO from 'io-ts'

export const NumberFromString = new IO.Type<number, string, unknown>(
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

export const NaturalNumber = new IO.Type<string, string, unknown>(
  'naturalNumber',
  (unknownInput): unknownInput is string => typeof unknownInput === 'string',
  (unknownInput, ioContext) => {
    const stringInput = `${unknownInput}`
    const digitStringMatch = /^(\d+)$/.test(stringInput)
    return digitStringMatch
      ? IO.success(stringInput)
      : IO.failure(unknownInput, ioContext)
  },
  (stringInput) => stringInput
)
