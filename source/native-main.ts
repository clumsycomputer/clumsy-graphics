#!/usr/bin/env node
import ChildProcess from 'child_process'

const targetGraphicsRendererSubCommand = process.argv.slice(2).join(' ')
ChildProcess.execSync(
  `PROJECT_DIRECTORY_PATH=${process.cwd()} docker compose --file ${__dirname}/clumsy-graphics-dist.docker-compose.yml build && GRAPHICS_RENDERER_SUB_COMMAND="${targetGraphicsRendererSubCommand}" PROJECT_DIRECTORY_PATH=${process.cwd()} docker compose --file ${__dirname}/clumsy-graphics-dist.docker-compose.yml run -p 3000:3000 --rm clumsy-graphics`,
  { stdio: 'inherit' }
)
