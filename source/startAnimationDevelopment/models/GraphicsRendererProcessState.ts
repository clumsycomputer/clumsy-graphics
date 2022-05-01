import { ChildProcess as SpawnedNodeProcess } from 'child_process'
import { AnimationModuleSourceReadyState } from './AnimationDevelopmentState'
import * as IO from 'io-ts'
import { DistributiveOmit } from '../../models/common'
import { ClientAnimationModuleCodec } from '../../models/AnimationModule'

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
  spawnedProcess: SpawnedNodeProcess
  processStdoutLog: string
  assetType: 'mp4' | 'png'
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
    assetType: IO.union([IO.literal('mp4'), IO.literal('png')]),
    processStatus: IO.literal('processActive'),
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
    assetType: IO.union([IO.literal('mp4'), IO.literal('png')]),
    processStatus: IO.literal('processSuccessful'),
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
    assetType: IO.union([IO.literal('mp4'), IO.literal('png')]),
    processStatus: IO.literal('processFailed'),
    processStdoutLog: IO.string,
    processErrorMessage: IO.string,
  })
)

export const ClientGraphicsRendererProcessStateCodec = IO.union([
  ClientGraphicsRendererProcessActiveStateCodec,
  ClientGraphicsRendererProcessSuccessfulStateCodec,
  ClientGraphicsRendererProcessFailedStateCodec,
])
