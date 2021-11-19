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
  | GraphicsRendererProcessProgressInfoUpdatedAction
  | GraphicsRendererProcessSuccessfulAction
  | GraphicsRendererProcessFailedAction

export interface AnimationModuleSourceChangedAction
  extends ActionBase<
    'animationModuleSourceChanged',
    Pick<
      AnimationModuleSourceChangedEvent['eventPayload'],
      'nextAnimationModuleSessionVersion'
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
      initialProcessProgressInfo: string
      graphicAssetPathKey: string
      graphicAssetPath: string
      graphicAssetUrlResult: string
    }
  > {}

export interface GraphicsRendererProcessActiveAction
  extends GraphicsRendererProcessActionBase<
    'graphicsRendererProcessActive',
    GraphicsRendererProcessActiveState
  > {}

export interface GraphicsRendererProcessProgressInfoUpdatedAction
  extends GraphicsRendererProcessStateUpdaterAction<
    'graphicsRendererProcessProgressInfoUpdated',
    GraphicsRendererProcessActiveState
  > {}

export interface GraphicsRendererProcessSuccessfulAction
  extends GraphicsRendererProcessStateUpdaterAction<
    'graphicsRendererProcessSuccessful',
    GraphicsRendererProcessSuccessfulState,
    {
      targetGraphicAssetKey: string
      targetGraphicAssetPath: string
    }
  > {}

export interface GraphicsRendererProcessFailedAction
  extends GraphicsRendererProcessStateUpdaterAction<
    'graphicsRendererProcessFailed',
    GraphicsRendererProcessFailedState
  > {}

interface GraphicsRendererProcessStateUpdaterAction<
  GraphicsRendererProcessActionType extends string,
  TargetGraphicsRendererProcessState extends GraphicsRendererProcessState,
  GraphicsRendererProcessStateUpdaterAction extends object = {}
> extends GraphicsRendererProcessActionBase<
    GraphicsRendererProcessActionType,
    TargetGraphicsRendererProcessState,
    {
      animationModuleSessionVersionStamp: number
    } & GraphicsRendererProcessStateUpdaterAction
  > {}

interface GraphicsRendererProcessActionBase<
  GraphicsRendererProcessActionType extends string,
  TargetGraphicsRendererProcessState extends GraphicsRendererProcessState,
  GraphicsRendererProcessActionPayload extends object = {}
> extends ActionBase<
    GraphicsRendererProcessActionType,
    {
      targetGraphicsRendererProcessKey: string
      targetGraphicsRendererProcessState: TargetGraphicsRendererProcessState
    } & GraphicsRendererProcessActionPayload
  > {}

export type GraphicsRendererProcessManagerAction =
  | AnimationModuleSourceChangedAction
  | SpawnGraphicsRendererProcessAction
