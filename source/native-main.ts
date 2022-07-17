#!/usr/bin/env node
import ChildProcess from 'child_process'
import { decodeData } from './helpers/decodeData'
import {
  parseCommandLineArgs,
  StartDevelopmentCommand,
  StartDevelopmentCommandCodec,
} from './models/ClumsyGraphicsCommand'

runClumsyGraphics()

async function runClumsyGraphics() {
  const startDevelopmentCommand = await decodeData<
    StartDevelopmentCommand,
    {
      commandName: string
      commandApi: Record<string, string>
    }
  >({
    targetCodec: StartDevelopmentCommandCodec,
    inputData: parseCommandLineArgs({
      processArgv: ['', '', 'startDevelopment', ...process.argv.slice(2)],
    }),
  })
  const clientServerPort =
    startDevelopmentCommand.commandApi.clientServerPort || 3000
  ChildProcess.execSync(
    `PROJECT_DIRECTORY_PATH=${process.cwd()} docker compose --file ${__dirname}/clumsy-graphics-package.docker-compose.yml build && ANIMATION_MODULE_PATH="${
      startDevelopmentCommand.commandApi.animationModulePath
    }" CLIENT_SERVER_PORT="${clientServerPort}" PROJECT_DIRECTORY_PATH=${process.cwd()} docker compose --file ${__dirname}/clumsy-graphics-package.docker-compose.yml run -p ${clientServerPort}:${clientServerPort} --rm clumsy-graphics`,
    {
      stdio: 'inherit',
    }
  )
}
