#!/usr/bin/env node
import OperatingSystem from 'os'
import Path from 'path'
import { convertAnimationMp4ToGif } from './convertAnimationMp4ToGif/convertAnimationMp4ToGif'
import { decodeData } from './helpers/decodeData'
import {
  GraphicsRendererCommand,
  GraphicsRendererCommandCodec,
} from './models/GraphicsRendererCommand'
import { renderAnimationModule } from './renderAnimationModule/renderAnimationModule'
import { renderAnimationModuleFrame } from './renderAnimationModuleFrame/renderAnimationModuleFrame'
import { startAnimationDevelopment } from './startAnimationDevelopment/startAnimationDevelopment'

export type { AnimationModule } from './models/AnimationModule'

runGraphicsRendererCommand()

async function runGraphicsRendererCommand() {
  const graphicsRendererCommand = await decodeData<
    GraphicsRendererCommand,
    {
      commandName: string
      commandApi: Record<string, string>
    }
  >({
    targetCodec: GraphicsRendererCommandCodec,
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
        numberOfFrameRendererWorkers: OperatingSystem.cpus().length - 2,
        ...graphicsRendererCommand.commandApi,
      })
      break
    case 'renderAnimation':
      await renderAnimationModule({
        numberOfFrameRendererWorkers: OperatingSystem.cpus().length - 1,
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

interface ParseCommandLineArgsApi {
  processArgv: Array<string>
}

function parseCommandLineArgs(api: ParseCommandLineArgsApi): unknown {
  const { processArgv } = api
  return {
    commandName: processArgv[2],
    commandApi: processArgv
      .slice(3)
      .reduce<Record<string, string>>((result, someProcessArg) => {
        const optionMatch = someProcessArg.match(/^--([a-zA-Z0-9]+)=(.+)$/)
        if (optionMatch) {
          const optionKey: string = optionMatch[1]!
          const optionValue: string = optionMatch[2]!
          result[optionKey] = optionValue
        }
        return result
      }, {}),
  }
}
