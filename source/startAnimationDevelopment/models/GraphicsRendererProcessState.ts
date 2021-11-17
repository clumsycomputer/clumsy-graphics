import { ChildProcess as SpawnedNodeProcess } from 'child_process'

export type GraphicsRendererProcessState =
  | GraphicsRendererProcessActiveState
  | GraphicsRendererProcessSuccessfulState
  | GraphicsRendererProcessFailedState

export interface GraphicsRendererProcessActiveState
  extends GraphicsRendererProcessStateBase<'processActive'> {
  processProgressInfo: string
}

export interface GraphicsRendererProcessSuccessfulState
  extends GraphicsRendererProcessStateBase<'processSuccessful'> {
  graphicAssetUrl: string
}

export interface GraphicsRendererProcessFailedState
  extends GraphicsRendererProcessStateBase<'processFailed'> {
  processErrorMessage: string
}

interface GraphicsRendererProcessStateBase<ProcessStatus extends string> {
  processStatus: ProcessStatus
  spawnedProcess: SpawnedNodeProcess
}
