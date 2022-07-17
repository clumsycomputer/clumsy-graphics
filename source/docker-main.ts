#!/usr/bin/env node
import OperatingSystem from 'os'
import Path from 'path'
import { convertAnimationMp4ToGif } from './convertAnimationMp4ToGif/convertAnimationMp4ToGif'
import { decodeData } from './helpers/decodeData'
import {
  ClumsyGraphicsCommand,
  ClumsyGraphicsCommandCodec,
  parseCommandLineArgs,
} from './models/ClumsyGraphicsCommand'
import { renderAnimationModule } from './renderAnimationModule/renderAnimationModule'
import { renderAnimationModuleFrame } from './renderAnimationModuleFrame/renderAnimationModuleFrame'
import { startAnimationDevelopment } from './startAnimationDevelopment/startAnimationDevelopment'

export type { AnimationModule } from './models/AnimationModule'

runClumsyGraphicsCommand()

async function runClumsyGraphicsCommand() {
  const graphicsRendererCommand = await decodeData<
    ClumsyGraphicsCommand,
    {
      commandName: string
      commandApi: Record<string, string>
    }
  >({
    targetCodec: ClumsyGraphicsCommandCodec,
    inputData: parseCommandLineArgs({
      processArgv: process.argv,
    }),
  })
  switch (graphicsRendererCommand.commandName) {
    case 'startDevelopment':
      startAnimationDevelopment({
        clientServerPort: 3000,
        generatedAssetsDirectoryPath: Path.resolve(
          __dirname,
          './developmentAssets'
        ),
        numberOfFrameRendererWorkers: OperatingSystem.cpus().length - 1,
        ...graphicsRendererCommand.commandApi,
      })
      break
    case 'renderAnimation':
      await renderAnimationModule({
        numberOfFrameRendererWorkers: OperatingSystem.cpus().length - 1,
        suppressWorkerStdout: false,
        ...graphicsRendererCommand.commandApi,
      })
      break
    case 'renderAnimationFrame':
      await renderAnimationModuleFrame(graphicsRendererCommand.commandApi)
      break
    case 'convertAnimationToGif':
      convertAnimationMp4ToGif(graphicsRendererCommand.commandApi)
      break
  }
}
