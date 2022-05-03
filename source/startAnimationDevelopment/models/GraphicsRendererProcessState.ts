import { ChildProcess as SpawnedNodeProcess } from 'child_process'
import * as IO from 'io-ts'
import { ClientAnimationModuleCodec } from '../../models/AnimationModule'
import { DistributiveOmit } from '../../models/common'
import { AnimationModuleSourceReadyState } from './AnimationDevelopmentState'

export type GraphicsRendererProcessState =
  | GraphicsRendererProcessActiveState
  | GraphicsRendererProcessSuccessfulState
  | GraphicsRendererProcessFailedState

export interface GraphicsRendererProcessActiveState
  extends GraphicsRendererProcessStateBase<'processActive'> {}

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
  graphicsRendererProcessKey: string
  spawnedProcess: SpawnedNodeProcess
  processStdoutLog: string
}

export type ClientGraphicsRendererProcessState = Pick<
  AnimationModuleSourceReadyState,
  'animationModuleSessionVersion'
> &
  DistributiveOmit<GraphicsRendererProcessState, 'spawnedProcess'> & {
    animationModule: Omit<
      AnimationModuleSourceReadyState['animationModule'],
      'FrameDescriptor'
    >
  }

export type ClientGraphicsRendererProcessActiveState = Extract<
  ClientGraphicsRendererProcessState,
  { processStatus: 'processActive' }
>

const ClientGraphicsRendererProcessActiveStateCodec = IO.exact(
  IO.type({
    animationModule: ClientAnimationModuleCodec,
    animationModuleSessionVersion: IO.number,
    processStatus: IO.literal('processActive'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
  })
)

export type ClientGraphicsRendererProcessSuccessfulState = Extract<
  ClientGraphicsRendererProcessState,
  { processStatus: 'processSuccessful' }
>

const ClientGraphicsRendererProcessSuccessfulStateCodec = IO.exact(
  IO.type({
    animationModule: ClientAnimationModuleCodec,
    animationModuleSessionVersion: IO.number,
    processStatus: IO.literal('processSuccessful'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
    graphicAssetUrl: IO.string,
  })
)

export type ClientGraphicsRendererProcessFailedState = Extract<
  ClientGraphicsRendererProcessState,
  { processStatus: 'processFailed' }
>

const ClientGraphicsRendererProcessFailedStateCodec = IO.exact(
  IO.type({
    animationModule: ClientAnimationModuleCodec,
    animationModuleSessionVersion: IO.number,
    processStatus: IO.literal('processFailed'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
    processErrorMessage: IO.string,
  })
)

export const ClientGraphicsRendererProcessStateCodec = IO.union([
  ClientGraphicsRendererProcessActiveStateCodec,
  ClientGraphicsRendererProcessSuccessfulStateCodec,
  ClientGraphicsRendererProcessFailedStateCodec,
])
