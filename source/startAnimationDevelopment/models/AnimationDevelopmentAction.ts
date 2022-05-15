import { AnimationModuleBundlerState } from './AnimationDevelopmentState'
import {
  AnimationModuleBundlerInitialBuildSucceededEvent,
  AnimationModuleBundlerRebuildFailedEvent,
  AnimationModuleBundlerRebuildSucceededEvent,
} from './AnimationModuleBundlerEvent'
import { ActionBase } from './common'
import {
  GraphicsRendererProcessActiveState,
  GraphicsRendererProcessFailedState,
  GraphicsRendererProcessState,
  GraphicsRendererProcessSuccessfulState,
} from './GraphicsRendererProcessState'

export type AnimationDevelopmentAction =
  | AnimationModuleBundlerInitialBuildSucceededAction
  | AnimationModuleBundlerRebuildSucceededAction
  | AnimationModuleBundlerRebuildFailedAction
  | AnimationModuleBundlerStateUpdatedAction
  | SpawnGraphicsRendererProcessAction
  | GraphicsRendererProcessActiveAction
  | GraphicsRendererProcessUpdatedAction

// export type AnimationModuleBundlerBuildSucceededAction =
//   | AnimationModuleBundlerInitialBuildSucceededAction
//   | AnimationModuleBundlerRebuildSucceededAction

export type GraphicsRendererProcessManagerAction =
  | AnimationModuleBundlerInitialBuildSucceededAction
  | AnimationModuleBundlerRebuildSucceededAction
  | AnimationModuleBundlerRebuildFailedAction
  | SpawnGraphicsRendererProcessAction

export type GraphicsRendererProcessUpdatedAction =
  | GraphicsRendererProcessProgressInfoUpdatedAction
  | GraphicsRendererProcessSuccessfulAction
  | GraphicsRendererProcessFailedAction

export interface AnimationModuleBundlerInitialBuildSucceededAction
  extends ActionBase<
    'animationModuleBundler_initialBuildSucceeded',
    AnimationModuleBundlerInitialBuildSucceededEvent['eventPayload']
  > {}

export interface AnimationModuleBundlerRebuildSucceededAction
  extends ActionBase<
    'animationModuleBundler_rebuildSucceeded',
    AnimationModuleBundlerRebuildSucceededEvent['eventPayload']
  > {}

export interface AnimationModuleBundlerRebuildFailedAction
  extends ActionBase<
    'animationModuleBundler_rebuildFailed',
    AnimationModuleBundlerRebuildFailedEvent['eventPayload']
  > {}

export interface AnimationModuleBundlerStateUpdatedAction
  extends ActionBase<
    'animationModuleBundlerStateUpdated',
    {
      nextAnimationModuleBundlerState: AnimationModuleBundlerState
    }
  > {}

export interface SpawnGraphicsRendererProcessAction
  extends ActionBase<
    'spawnGraphicsRendererProcess',
    {
      buildVersion: number
      graphicsRendererProcessKey: string
      graphicsRendererProcessCommandString: string
      graphicAssetPathKey: string
      graphicAssetPath: string
      graphicAssetUrlResult: string
    }
  > {}

export interface GraphicsRendererProcessActiveAction
  extends ActionBase<
    'graphicsRendererProcessActive',
    {
      newGraphicsRendererProcessKey: string
      newGraphicsRendererProcessState: GraphicsRendererProcessActiveState
    }
  > {}

export interface GraphicsRendererProcessProgressInfoUpdatedAction
  extends GraphicsRendererProcessUpdatedActionBase<
    'graphicsRendererProcessStdoutLogUpdated',
    Pick<GraphicsRendererProcessState, 'graphicsRendererProcessStdoutLog'>
  > {}

export interface GraphicsRendererProcessSuccessfulAction
  extends GraphicsRendererProcessUpdatedActionBase<
    'graphicsRendererProcessSuccessful',
    Pick<GraphicsRendererProcessSuccessfulState, 'graphicAssetUrl'>,
    {
      targetGraphicAssetKey: string
      targetGraphicAssetPath: string
    }
  > {}

export interface GraphicsRendererProcessFailedAction
  extends GraphicsRendererProcessUpdatedActionBase<
    'graphicsRendererProcessFailed',
    Pick<
      GraphicsRendererProcessFailedState,
      'graphicsRendererProcessErrorMessage'
    >
  > {}

interface GraphicsRendererProcessUpdatedActionBase<
  GraphicsRendererProcessActionType extends string,
  TargetGraphicsRendererProcessStateUpdates extends Partial<GraphicsRendererProcessState>,
  GraphicsRendererProcessStateUpdaterActionPayload extends object = {}
> extends ActionBase<
    GraphicsRendererProcessActionType,
    {
      buildVersion: number
      targetGraphicsRendererProcessKey: string
      targetGraphicsRendererProcessStateUpdates: TargetGraphicsRendererProcessStateUpdates
    } & GraphicsRendererProcessStateUpdaterActionPayload
  > {}
