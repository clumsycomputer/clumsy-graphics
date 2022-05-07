import {
  AnimationModuleBundlerActiveState,
  AnimationModuleInvalidBundleState,
  AnimationModuleValidBundleState,
} from './AnimationDevelopmentState'
import {
  GraphicsRendererProcessFailedState,
  GraphicsRendererProcessState,
  GraphicsRendererProcessSuccessfulState,
} from './GraphicsRendererProcessState'
import * as IO from 'io-ts'
import { ClientAnimationModuleCodec } from '../../models/AnimationModule'

export type ClientGraphicsRendererProcessValidBundleState =
  | ClientGraphicsRendererProcessInitializingState
  | ClientGraphicsRendererProcessActiveState
  | ClientGraphicsRendererProcessSuccessfulState
  | ClientGraphicsRendererProcessFailedState

export interface ClientGraphicsRendererProcessInitializingState
  extends ClientGraphicsRendererProcessValidBundleStateBase<'processInitializing'> {}

const ClientGraphicsRendererProcessInitializingStateCodec = IO.exact(
  IO.type({
    bundleSessionVersion: IO.number,
    latestBundleStatus: IO.literal('bundleValid'),
    graphicsRendererProcessStatus: IO.literal('processInitializing'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
  })
)

export interface ClientGraphicsRendererProcessActiveState
  extends ClientGraphicsRendererProcessValidBundleStateBase<'processActive'> {}

const ClientGraphicsRendererProcessActiveStateCodec = IO.exact(
  IO.type({
    bundleSessionVersion: IO.number,
    latestBundleStatus: IO.literal('bundleValid'),
    graphicsRendererProcessStatus: IO.literal('processActive'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
  })
)

export interface ClientGraphicsRendererProcessSuccessfulState
  extends ClientGraphicsRendererProcessValidBundleStateBase<'processSuccessful'>,
    Pick<GraphicsRendererProcessSuccessfulState, 'graphicAssetUrl'> {}

const ClientGraphicsRendererProcessSuccessfulStateCodec = IO.exact(
  IO.type({
    bundleSessionVersion: IO.number,
    latestBundleStatus: IO.literal('bundleValid'),
    graphicsRendererProcessStatus: IO.literal('processSuccessful'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
    graphicAssetUrl: IO.string,
  })
)

export interface ClientGraphicsRendererProcessFailedState
  extends ClientGraphicsRendererProcessValidBundleStateBase<'processFailed'>,
    Pick<GraphicsRendererProcessFailedState, 'processErrorMessage'> {}

const ClientGraphicsRendererProcessFailedStateCodec = IO.exact(
  IO.type({
    bundleSessionVersion: IO.number,
    latestBundleStatus: IO.literal('bundleValid'),
    graphicsRendererProcessStatus: IO.literal('processFailed'),
    graphicsRendererProcessKey: IO.string,
    processStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
    processErrorMessage: IO.string,
  })
)

interface ClientGraphicsRendererProcessValidBundleStateBase<
  GraphicsRendererProcessStatus extends
    | 'processInitializing'
    | GraphicsRendererProcessState['graphicsRendererProcessStatus']
> extends ClientGraphicsRendererProcessStateBase<'bundleValid'>,
    Pick<
      GraphicsRendererProcessState,
      'graphicsRendererProcessKey' | 'processStdoutLog'
    > {
  animationModule: Omit<
    AnimationModuleValidBundleState['animationModule'],
    'FrameDescriptor'
  >
  graphicsRendererProcessStatus: GraphicsRendererProcessStatus
}

export interface ClientGraphicsRendererProcessInvalidBundleState
  extends ClientGraphicsRendererProcessStateBase<'bundleInvalid'>,
    Pick<AnimationModuleInvalidBundleState, 'bundleErrorMessage'> {}

const ClientGraphicsRendererProcessInvalidBundleStateCodec = IO.exact(
  IO.type({
    bundleSessionVersion: IO.number,
    latestBundleStatus: IO.literal('bundleInvalid'),
    bundleErrorMessage: IO.string,
  })
)

interface ClientGraphicsRendererProcessStateBase<
  LatestBundleStatus extends AnimationModuleBundlerActiveState['latestBundleStatus']
> extends Pick<AnimationModuleBundlerActiveState, 'bundleSessionVersion'> {
  latestBundleStatus: LatestBundleStatus
}

export type ClientGraphicsRendererProcessState =
  | ClientGraphicsRendererProcessValidBundleState
  | ClientGraphicsRendererProcessInvalidBundleState

export const ClientGraphicsRendererProcessStateCodec = IO.union([
  ClientGraphicsRendererProcessInitializingStateCodec,
  ClientGraphicsRendererProcessActiveStateCodec,
  ClientGraphicsRendererProcessSuccessfulStateCodec,
  ClientGraphicsRendererProcessFailedStateCodec,
  ClientGraphicsRendererProcessInvalidBundleStateCodec,
])
