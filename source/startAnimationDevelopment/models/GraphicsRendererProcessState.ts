import { ChildProcess as SpawnedNodeProcess } from 'child_process'

export type GraphicsRendererProcessState =
  | GraphicsRendererProcessActiveState
  | GraphicsRendererProcessSuccessfulState
  | GraphicsRendererProcessFailedState

export interface GraphicsRendererProcessActiveState
  extends GraphicsRendererProcessStateBase<'processActive'> {}

export interface GraphicsRendererProcessSuccessfulState
  extends GraphicsRendererProcessStateBase<'processSuccessful'> {
  graphicAssetUrl: string
}

export interface GraphicsRendererProcessFailedState
  extends GraphicsRendererProcessStateBase<'processFailed'> {
  graphicsRendererProcessErrorMessage: string
}

interface GraphicsRendererProcessStateBase<ProcessStatus extends string> {
  graphicsRendererProcessStatus: ProcessStatus
  graphicsRendererProcessKey: string
  spawnedGraphicsRendererProcess: SpawnedNodeProcess
  graphicsRendererProcessStdoutLog: string
}
