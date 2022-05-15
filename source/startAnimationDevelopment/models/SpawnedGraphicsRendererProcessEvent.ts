import { EventBase } from './common'

export type SpawnedGraphicsRendererProcessEvent =
  | SpawnedGraphicsRendererProcessStdoutLogUpdatedEvent
  | SpawnedGraphicsRendererProcessSuccessfulEvent
  | SpawnedGraphicsRendererProcessFailedEvent
  | SpawnedGraphicsRendererProcessTerminatedEvent

export interface SpawnedGraphicsRendererProcessStdoutLogUpdatedEvent
  extends EventBase<
    'graphicsRendererProcessStdoutLogUpdated',
    {
      updatedGraphicsRendererProcessStdoutLog: string
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
