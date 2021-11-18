import { ChildProcess as SpawnedNodeProcess } from 'child_process'
import { AnimationModuleSourceReadyState } from './AnimationDevelopmentState'
import * as IO from 'io-ts'

export type GraphicsRendererProcessState =
  | GraphicsRendererProcessActiveState
  | GraphicsRendererProcessSuccessfulState
  | GraphicsRendererProcessFailedState

export interface GraphicsRendererProcessActiveState
  extends GraphicsRendererProcessStateBase<'processActive'> {
  processProgressInfo: string
}

export interface GraphicsRendererProcessSuccessfulState
  extends GraphicsRendererProcessStateBase<'processSuccessful'> {
  graphicAssetUrl: string
}

export interface GraphicsRendererProcessFailedState
  extends GraphicsRendererProcessStateBase<'processFailed'> {
  processErrorMessage: string
}

interface GraphicsRendererProcessStateBase<ProcessStatus extends string> {
  processStatus: ProcessStatus
  spawnedProcess: SpawnedNodeProcess
}

export type ClientGraphicsRendererProcessState<
  SomeClientGraphicsRendererProcessState = GraphicsRendererProcessState
> = SomeClientGraphicsRendererProcessState extends GraphicsRendererProcessState
  ? Pick<AnimationModuleSourceReadyState, 'animationModuleSessionVersion'> &
      Omit<SomeClientGraphicsRendererProcessState, 'spawnedProcess'>
  : never

export type ClientGraphicsRendererProcessActiveState = Extract<
  ClientGraphicsRendererProcessState,
  { processStatus: 'processActive' }
>

const ClientGraphicsRendererProcessActiveStateCodec = IO.exact(
  IO.type({
    processStatus: IO.literal('processActive'),
    processProgressInfo: IO.string,
    animationModuleSessionVersion: IO.number,
  })
)

export type ClientGraphicsRendererProcessSuccessfulState = Extract<
  ClientGraphicsRendererProcessState,
  { processStatus: 'processSuccessful' }
>

const ClientGraphicsRendererProcessSuccessfulStateCodec = IO.exact(
  IO.type({
    processStatus: IO.literal('processSuccessful'),
    graphicAssetUrl: IO.string,
    animationModuleSessionVersion: IO.number,
  })
)

export type ClientGraphicsRendererProcessFailedState = Extract<
  ClientGraphicsRendererProcessState,
  { processStatus: 'processFailed' }
>

const ClientGraphicsRendererProcessFailedStateCodec = IO.exact(
  IO.type({
    processStatus: IO.literal('processFailed'),
    processErrorMessage: IO.string,
    animationModuleSessionVersion: IO.number,
  })
)

export const ClientGraphicsRendererProcessStateCodec = IO.union([
  ClientGraphicsRendererProcessActiveStateCodec,
  ClientGraphicsRendererProcessSuccessfulStateCodec,
  ClientGraphicsRendererProcessFailedStateCodec,
])
