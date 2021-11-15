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

export type AnimationDevelopmentAction =
  | AnimationModuleSourceChangedAction
  | AnimationModuleSourceUpdatedAction
  | SpawnAnimationRenderProcessAction
  | AnimationRenderProcessActiveAction
  | AnimationRenderProcessSuccessfulAction
  | AnimationRenderProcessFailedAction
  | SpawnFrameRenderProcessAction
  | FrameRenderProcessActiveAction
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
    FunctionBrand<typeof spawnAnimationRenderProcess>
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
      FunctionBrand<typeof spawnFrameRenderProcess>
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
    }
  > {}

export type RenderProcessManagerAction =
  | AnimationModuleSourceChangedAction
  | SpawnAnimationRenderProcessAction
  | SpawnFrameRenderProcessAction
