import { FunctionBrand } from '../../models/common'
import {
  spawnAnimationRenderProcess,
  SpawnAnimationRenderProcessApi,
  spawnFrameRenderProcess,
  SpawnFrameRenderProcessApi,
} from '../sagas/renderProcessManagerSaga'
import { AnimationModuleSourceReadyState } from './AnimationDevelopmentState'
import { AnimationModuleSourceChangedEvent } from './AnimationModuleSourceEvent'
import { ActionBase } from './common'
import { SpawnedGraphicsRendererProcessFailedEvent } from './SpawnedGraphicsRendererProcessEvent'

export type AnimationDevelopmentAction =
  | AnimationModuleSourceChangedAction
  | AnimationModuleSourceUpdatedAction
  | SpawnAnimationRenderProcessAction
  | AnimationRenderProcessActiveAction
  | AnimationRenderProcessUpdateAction
  | AnimationRenderProcessSuccessfulAction
  | AnimationRenderProcessFailedAction
  | SpawnFrameRenderProcessAction
  | FrameRenderProcessActiveAction
  | FrameRenderProcessUpdateAction
  | FrameRenderProcessSuccessfulAction
  | FrameRenderProcessFailedAction

export interface AnimationModuleSourceChangedAction
  extends ActionBase<
    'animationModuleSourceChanged',
    Pick<
      AnimationModuleSourceChangedEvent['eventPayload'],
      'animationModuleSessionVersion'
    >
  > {}

export interface AnimationModuleSourceUpdatedAction
  extends ActionBase<
    'animationModuleSourceUpdated',
    Pick<
      AnimationModuleSourceChangedAction['actionPayload'],
      'animationModuleSessionVersion'
    >
  > {}

export interface SpawnAnimationRenderProcessAction
  extends ActionBase<
    'spawnAnimationRenderProcess',
    Pick<AnimationModuleSourceReadyState, 'animationModuleSessionVersion'>
  > {}

export interface AnimationRenderProcessActiveAction
  extends ActionBase<
    'animationRenderProcessActive',
    Pick<
      FunctionBrand<typeof spawnAnimationRenderProcess>,
      'spawnedAnimationRenderProcess'
    >
  > {}

export interface AnimationRenderProcessUpdateAction
  extends ActionBase<
    'animationRenderProcessUpdate',
    {
      targetAnimationModuleSessionVersion: SpawnAnimationRenderProcessAction['actionPayload']['animationModuleSessionVersion']
      animationRenderProcessMessage: string
    }
  > {}

export interface AnimationRenderProcessSuccessfulAction
  extends ActionBase<
    'animationRenderProcessSuccessful',
    {
      targetAnimationModuleSessionVersion: SpawnAnimationRenderProcessAction['actionPayload']['animationModuleSessionVersion']
      animationAssetPath: SpawnAnimationRenderProcessApi['animationMp4OutputPath']
    }
  > {}

export interface AnimationRenderProcessFailedAction
  extends ActionBase<
    'animationRenderProcessFailed',
    {
      targetAnimationModuleSessionVersion: SpawnAnimationRenderProcessAction['actionPayload']['animationModuleSessionVersion']
      animationRenderProcessErrorMessage: SpawnedGraphicsRendererProcessFailedEvent['eventPayload']['graphicsRendererProcessErrorMessage']
    }
  > {}

export interface SpawnFrameRenderProcessAction
  extends ActionBase<
    'spawnFrameRenderProcess',
    Pick<AnimationModuleSourceReadyState, 'animationModuleSessionVersion'> & {
      frameIndex: number
    }
  > {}

export interface FrameRenderProcessActiveAction
  extends ActionBase<
    'frameRenderProcessActive',
    Pick<SpawnFrameRenderProcessAction['actionPayload'], 'frameIndex'> &
      Pick<
        FunctionBrand<typeof spawnFrameRenderProcess>,
        'spawnedFrameRenderProcess'
      >
  > {}

export interface FrameRenderProcessUpdateAction
  extends ActionBase<
    'frameRenderProcessUpdate',
    {
      targetAnimationModuleSessionVersion: SpawnFrameRenderProcessAction['actionPayload']['animationModuleSessionVersion']
      targetFrameIndex: SpawnFrameRenderProcessAction['actionPayload']['frameIndex']
      frameRenderProcessMessage: string
    }
  > {}

export interface FrameRenderProcessSuccessfulAction
  extends ActionBase<
    'frameRenderProcessSuccessful',
    {
      targetAnimationModuleSessionVersion: SpawnFrameRenderProcessAction['actionPayload']['animationModuleSessionVersion']
      targetFrameIndex: SpawnFrameRenderProcessAction['actionPayload']['frameIndex']
      frameAssetPath: SpawnFrameRenderProcessApi['frameFileOutputPath']
    }
  > {}

export interface FrameRenderProcessFailedAction
  extends ActionBase<
    'frameRenderProcessFailed',
    {
      targetAnimationModuleSessionVersion: SpawnFrameRenderProcessAction['actionPayload']['animationModuleSessionVersion']
      targetFrameIndex: SpawnFrameRenderProcessAction['actionPayload']['frameIndex']
      frameRenderProcessErrorMessage: SpawnedGraphicsRendererProcessFailedEvent['eventPayload']['graphicsRendererProcessErrorMessage']
    }
  > {}

export type RenderProcessManagerAction =
  | AnimationModuleSourceChangedAction
  | SpawnAnimationRenderProcessAction
  | SpawnFrameRenderProcessAction
