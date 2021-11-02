import { fold } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import {
  ContextEntry,
  Errors as DecodeErrors,
  Type as Codec,
  ValidationError,
} from 'io-ts'

export interface DecodeDataApi<
  TargetData,
  InputData,
  TargetCodec = Codec<InputData, TargetData>
> {
  targetCodec: TargetCodec
  inputData: unknown
}

export function decodeData<TargetData, InputData = TargetData>(
  api: DecodeDataApi<InputData, TargetData>
): Promise<TargetData> {
  const { targetCodec, inputData } = api
  return new Promise<TargetData>((resolve, reject) => {
    const handleDecodeErrors = (decodeErrors: DecodeErrors) => {
      const simpleDecodeError = getSimpleDecodeError({ decodeErrors })
      reject(simpleDecodeError)
    }
    const decodeResult = targetCodec.decode(inputData)
    pipe(decodeResult, fold(handleDecodeErrors, resolve))
  })
}

interface GetSimpleDecodeErrorApi {
  decodeErrors: DecodeErrors
}

const getSimpleDecodeError = (api: GetSimpleDecodeErrorApi): Error => {
  const { decodeErrors } = api
  const validationErrors = decodeErrors.map((validationError) =>
    getValidationErrorSpecifics({ validationError })
  )
  const validationErrorsJson = JSON.stringify(validationErrors, null, 2)
  return Error(validationErrorsJson)
}

interface GetValidationErrorSpecificsApi {
  validationError: ValidationError
}

const getValidationErrorSpecifics = (
  api: GetValidationErrorSpecificsApi
): ContextEntry => {
  const { validationError } = api
  return validationError.context[validationError.context.length - 1]!
}
