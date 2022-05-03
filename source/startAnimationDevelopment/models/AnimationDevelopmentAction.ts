import { AnimationModuleSourceReadyState } from './AnimationDevelopmentState'
import { AnimationModuleSourceChangedEvent } from './AnimationModuleSourceEvent'
import { ActionBase } from './common'
import {
  GraphicsRendererProcessActiveState,
  GraphicsRendererProcessFailedState,
  GraphicsRendererProcessState,
  GraphicsRendererProcessSuccessfulState,
} from './GraphicsRendererProcessState'

export type AnimationDevelopmentAction =
  | AnimationModuleSourceChangedAction
  | AnimationModuleSourceUpdatedAction
  | SpawnGraphicsRendererProcessAction
  | GraphicsRendererProcessActiveAction
  | GraphicsRendererProcessUpdatedAction

export type GraphicsRendererProcessUpdatedAction =
  | GraphicsRendererProcessProgressInfoUpdatedAction
  | GraphicsRendererProcessSuccessfulAction
  | GraphicsRendererProcessFailedAction

export interface AnimationModuleSourceChangedAction
  extends ActionBase<
    'animationModuleSourceChanged',
    Pick<
      AnimationModuleSourceChangedEvent['eventPayload'],
      'nextAnimationModule' | 'nextAnimationModuleSessionVersion'
    >
  > {}

export interface AnimationModuleSourceUpdatedAction
  extends ActionBase<
    'animationModuleSourceUpdated',
    {
      animationModuleSourceState: AnimationModuleSourceReadyState
    }
  > {}

export interface SpawnGraphicsRendererProcessAction
  extends ActionBase<
    'spawnGraphicsRendererProcess',
    {
      animationModuleSessionVersionStamp: number
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
    Pick<GraphicsRendererProcessState, 'processStdoutLog'>
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
    Pick<GraphicsRendererProcessFailedState, 'processErrorMessage'>
  > {}

interface GraphicsRendererProcessUpdatedActionBase<
  GraphicsRendererProcessActionType extends string,
  TargetGraphicsRendererProcessStateUpdates extends Partial<GraphicsRendererProcessState>,
  GraphicsRendererProcessStateUpdaterActionPayload extends object = {}
> extends ActionBase<
    GraphicsRendererProcessActionType,
    {
      animationModuleSessionVersionStamp: number
      targetGraphicsRendererProcessKey: string
      targetGraphicsRendererProcessStateUpdates: TargetGraphicsRendererProcessStateUpdates
    } & GraphicsRendererProcessStateUpdaterActionPayload
  > {}

export type GraphicsRendererProcessManagerAction =
  | AnimationModuleSourceChangedAction
  | SpawnGraphicsRendererProcessAction
