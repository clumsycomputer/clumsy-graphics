#!/usr/bin/env node
import OperatingSystem from 'os'
import { convertAnimationMp4ToGif } from './convertAnimationMp4ToGif/convertAnimationMp4ToGif'
import { decodeData } from './helpers/decodeData'
import {
  GraphicsRendererCommand,
  GraphicsRendererCommandCodec,
} from './models/GraphicsRendererCommand'
import { renderAnimationModule } from './renderAnimationModule/renderAnimationModule'

export type { AnimationModule } from './renderAnimationModule/models/AnimationModule'

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
    case 'renderAnimation':
      await renderAnimationModule({
        numberOfFrameRendererWorkers: OperatingSystem.cpus().length - 1,
        ...graphicsRendererCommand.commandApi,
      })
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
