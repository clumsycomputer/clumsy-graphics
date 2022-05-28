import {
  AnimationModuleBundlerActiveState,
  AnimationModuleInvalidBuildState,
  AnimationModuleValidBuildState,
} from './AnimationDevelopmentState'
import {
  GraphicsRendererProcessFailedState,
  GraphicsRendererProcessState,
  GraphicsRendererProcessSuccessfulState,
} from './GraphicsRendererProcessState'
import * as IO from 'io-ts'
import { ClientAnimationModuleCodec } from '../../models/AnimationModule'
import { GraphicsRendererProcessKeyFromString } from './GraphicsRendererProcessKey'

export type ClientGraphicsRendererProcessValidBuildState =
  | ClientGraphicsRendererProcessInitializingState
  | ClientGraphicsRendererProcessActiveState
  | ClientGraphicsRendererProcessSuccessfulState
  | ClientGraphicsRendererProcessFailedState

export interface ClientGraphicsRendererProcessInitializingState
  extends ClientGraphicsRendererProcessValidBuildStateBase<'processInitializing'> {}

const ClientGraphicsRendererProcessInitializingStateCodec = IO.exact(
  IO.type({
    buildVersion: IO.number,
    buildStatus: IO.literal('validBuild'),
    graphicsRendererProcessStatus: IO.literal('processInitializing'),
    graphicsRendererProcessKey: GraphicsRendererProcessKeyFromString,
    graphicsRendererProcessStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
  })
)

export interface ClientGraphicsRendererProcessActiveState
  extends ClientGraphicsRendererProcessValidBuildStateBase<'processActive'> {}

const ClientGraphicsRendererProcessActiveStateCodec = IO.exact(
  IO.type({
    buildVersion: IO.number,
    buildStatus: IO.literal('validBuild'),
    graphicsRendererProcessStatus: IO.literal('processActive'),
    graphicsRendererProcessKey: GraphicsRendererProcessKeyFromString,
    graphicsRendererProcessStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
  })
)

export interface ClientGraphicsRendererProcessSuccessfulState
  extends ClientGraphicsRendererProcessValidBuildStateBase<'processSuccessful'>,
    Pick<GraphicsRendererProcessSuccessfulState, 'graphicAssetUrl'> {}

const ClientGraphicsRendererProcessSuccessfulStateCodec = IO.exact(
  IO.type({
    buildVersion: IO.number,
    buildStatus: IO.literal('validBuild'),
    graphicsRendererProcessStatus: IO.literal('processSuccessful'),
    graphicsRendererProcessKey: GraphicsRendererProcessKeyFromString,
    graphicsRendererProcessStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
    graphicAssetUrl: IO.string,
  })
)

export interface ClientGraphicsRendererProcessFailedState
  extends ClientGraphicsRendererProcessValidBuildStateBase<'processFailed'>,
    Pick<
      GraphicsRendererProcessFailedState,
      'graphicsRendererProcessErrorMessage'
    > {}

const ClientGraphicsRendererProcessFailedStateCodec = IO.exact(
  IO.type({
    buildVersion: IO.number,
    buildStatus: IO.literal('validBuild'),
    graphicsRendererProcessStatus: IO.literal('processFailed'),
    graphicsRendererProcessKey: GraphicsRendererProcessKeyFromString,
    graphicsRendererProcessStdoutLog: IO.string,
    animationModule: ClientAnimationModuleCodec,
    graphicsRendererProcessErrorMessage: IO.string,
  })
)

interface ClientGraphicsRendererProcessValidBuildStateBase<
  GraphicsRendererProcessStatus extends
    | 'processInitializing'
    | GraphicsRendererProcessState['graphicsRendererProcessStatus']
> extends ClientGraphicsRendererProcessStateBase<'validBuild'>,
    Pick<
      GraphicsRendererProcessState,
      'graphicsRendererProcessKey' | 'graphicsRendererProcessStdoutLog'
    > {
  animationModule: Omit<
    AnimationModuleValidBuildState['animationModule'],
    'getFrameDescription'
  >
  graphicsRendererProcessStatus: GraphicsRendererProcessStatus
}

export interface ClientGraphicsRendererProcessInvalidBuildState
  extends ClientGraphicsRendererProcessStateBase<'invalidBuild'>,
    Pick<AnimationModuleInvalidBuildState, 'buildErrorMessage'> {}

const ClientGraphicsRendererProcessInvalidBuildStateCodec = IO.exact(
  IO.type({
    buildVersion: IO.number,
    buildStatus: IO.literal('invalidBuild'),
    buildErrorMessage: IO.string,
  })
)

interface ClientGraphicsRendererProcessStateBase<
  BuildStatus extends AnimationModuleBundlerActiveState['buildStatus']
> extends Pick<AnimationModuleBundlerActiveState, 'buildVersion'> {
  buildStatus: BuildStatus
}

export type ClientGraphicsRendererProcessState =
  | ClientGraphicsRendererProcessValidBuildState
  | ClientGraphicsRendererProcessInvalidBuildState

export const ClientGraphicsRendererProcessStateCodec = IO.union([
  ClientGraphicsRendererProcessInitializingStateCodec,
  ClientGraphicsRendererProcessActiveStateCodec,
  ClientGraphicsRendererProcessSuccessfulStateCodec,
  ClientGraphicsRendererProcessFailedStateCodec,
  ClientGraphicsRendererProcessInvalidBuildStateCodec,
])
