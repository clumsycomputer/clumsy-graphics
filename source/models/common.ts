export interface MessageBase<
  MessageType extends string,
  MessagePayload extends object
> {
  messageType: MessageType
  messagePayload: MessagePayload
}

export type FunctionBrand<
  SomeBrandedFunction extends BrandedFunction,
  SomeBrandKey extends keyof BrandedFunctionResult<SomeBrandedFunction> = keyof BrandedFunctionResult<SomeBrandedFunction>
> = Pick<BrandedFunctionResult<SomeBrandedFunction>, SomeBrandKey>

type BrandedFunction = (...args: Array<any>) => Promise<object> | object

type BrandedFunctionResult<SomeFunction extends BrandedFunction> =
  ReturnType<SomeFunction> extends Promise<infer SomeResult>
    ? SomeResult
    : ReturnType<SomeFunction>

export type FunctionResult<
  SomeFunction extends (...args: Array<any>) => Promise<any> | any
> = ReturnType<SomeFunction> extends Promise<infer SomeResult>
  ? SomeResult
  : ReturnType<SomeFunction>

export type Optional<
  SomeObject extends object,
  SomeKey extends keyof SomeObject
> = {
  [Key in SomeKey]?: SomeObject[Key]
} & Pick<SomeObject, Exclude<keyof SomeObject, SomeKey>>

export type PromiseResult<SomePromise extends Promise<any>> =
  SomePromise extends Promise<infer Result> ? Result : never

export type DistributiveOmit<
  SomeObject extends object,
  ObjectKey extends keyof SomeObject
> = SomeObject extends SomeObject ? Omit<SomeObject, ObjectKey> : never
