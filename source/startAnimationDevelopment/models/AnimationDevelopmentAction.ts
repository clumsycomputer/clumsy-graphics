import { FunctionBrand } from '../../models/common'
import { spawnAnimationRenderProcess } from '../sagas/initialSaga'
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
    }
  > {}

export interface AnimationRenderProcessFailedAction
  extends ActionBase<'animationRenderProcessFailed', {}> {}

export interface SpawnFrameRenderProcessAction
  extends ActionBase<
    'spawnFrameRenderProcess',
    Pick<AnimationModuleSourceReadyState, 'animationModuleSessionVersion'> & {
      frameIndex: number
    }
  > {}

export type RenderProcessStateAction =
  | AnimationModuleSourceChangedAction
  | SpawnAnimationRenderProcessAction
  | SpawnFrameRenderProcessAction
