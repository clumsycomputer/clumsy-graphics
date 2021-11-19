import { EventBase } from './common'

export type SpawnedGraphicsRendererProcessEvent =
  | SpawnedGraphicsRendererProcessMessageEvent
  | SpawnedGraphicsRendererProcessSuccessfulEvent
  | SpawnedGraphicsRendererProcessFailedEvent
  | SpawnedGraphicsRendererProcessTerminatedEvent

export interface SpawnedGraphicsRendererProcessMessageEvent
  extends EventBase<
    'graphicsRendererProcessMessage',
    {
      graphicsRendererProcessMessage: string
    }
  > {}

export interface SpawnedGraphicsRendererProcessSuccessfulEvent
  extends EventBase<'graphicsRendererProcessSuccessful', {}> {}

export interface SpawnedGraphicsRendererProcessFailedEvent
  extends EventBase<
    'graphicsRendererProcessFailed',
    {
      graphicsRendererProcessErrorMessage: string
    }
  > {}

export interface SpawnedGraphicsRendererProcessTerminatedEvent
  extends EventBase<'graphicsRendererProcessTerminated', {}> {}
