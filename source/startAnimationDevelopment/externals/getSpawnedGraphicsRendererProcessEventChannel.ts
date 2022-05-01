import {
  buffers as SagaBuffers,
  eventChannel as getEventChannel,
} from 'redux-saga'
import { FunctionBrand } from '../../models/common'
import { SpawnedGraphicsRendererProcessEvent } from '../models/SpawnedGraphicsRendererProcessEvent'
import { spawnGraphicsRendererProcess } from '../sagas/graphicsRendererProcessManagerSaga'

export interface GetSpawnedGraphicsRendererProcessEventChannelApi
  extends Pick<
    FunctionBrand<typeof spawnGraphicsRendererProcess>,
    'spawnedGraphicsRendererProcess'
  > {}

export function getSpawnedGraphicsRendererProcessEventChannel(
  api: GetSpawnedGraphicsRendererProcessEventChannelApi
) {
  const { spawnedGraphicsRendererProcess } = api
  const spawnedGraphicsRendererProcessEventChannel =
    getEventChannel<SpawnedGraphicsRendererProcessEvent>(
      (emitGraphicsRendererProcessEvent) => {
        let spawnedGraphicsRendererProcessLog = ''
        spawnedGraphicsRendererProcess.stdout.setEncoding('utf-8')
        spawnedGraphicsRendererProcess.stdout.on('data', (someStdoutData) => {
          if (typeof someStdoutData === 'string') {
            spawnedGraphicsRendererProcessLog = `${spawnedGraphicsRendererProcessLog}${someStdoutData}`
            emitGraphicsRendererProcessEvent({
              eventType: 'graphicsRendererProcessStdoutLogUpdated',
              eventPayload: {
                updatedGraphicsRendererProcessStdoutLog:
                  spawnedGraphicsRendererProcessLog,
              },
            })
          } else {
            throw new Error('wtf? graphicsRendererProcessMessageTokens')
          }
        })
        const spawnedGraphicsRendererProcessErrorMessagePromise = new Promise<{
          graphicsRendererProcessErrorMessage: string
        }>((resolve) => {
          let graphicsRendererProcessErrorMessage: string | null = null
          spawnedGraphicsRendererProcess.stderr.setEncoding('utf-8')
          spawnedGraphicsRendererProcess.stderr.on('data', (someStderrData) => {
            if (typeof someStderrData === 'string') {
              graphicsRendererProcessErrorMessage =
                graphicsRendererProcessErrorMessage
                  ? `${spawnedGraphicsRendererProcess}${someStderrData}`
                  : someStderrData
            } else {
              throw new Error('wtf? spawnedGraphicsRendererProcess.stderr')
            }
          })
          spawnedGraphicsRendererProcess.stderr.once('end', () => {
            resolve({
              graphicsRendererProcessErrorMessage:
                graphicsRendererProcessErrorMessage ||
                'wtf? graphicsRendererProcessErrorMessage',
            })
          })
        })
        spawnedGraphicsRendererProcess.once(
          'exit',
          async (graphicsRendererProcessExitCode) => {
            switch (graphicsRendererProcessExitCode) {
              case 0:
                emitGraphicsRendererProcessEvent({
                  eventType: 'graphicsRendererProcessSuccessful',
                  eventPayload: {},
                })
                break
              case 1:
                const { graphicsRendererProcessErrorMessage } =
                  await spawnedGraphicsRendererProcessErrorMessagePromise
                emitGraphicsRendererProcessEvent({
                  eventType: 'graphicsRendererProcessFailed',
                  eventPayload: {
                    graphicsRendererProcessErrorMessage,
                  },
                })
                break
              case null:
                emitGraphicsRendererProcessEvent({
                  eventType: 'graphicsRendererProcessTerminated',
                  eventPayload: {},
                })
                break
            }
          }
        )
        return () => {}
      },
      SagaBuffers.expanding(10)
    )
  return { spawnedGraphicsRendererProcessEventChannel }
}
