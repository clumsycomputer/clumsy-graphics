export interface WriteProcessProgressInfoToStdoutApi {
  processProgressInfo: string
}

export function writeProcessProgressInfoToStdout(
  api: WriteProcessProgressInfoToStdoutApi
) {
  const { processProgressInfo } = api
  process.stdout.write(`${processProgressInfo}\n`)
}
