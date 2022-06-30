#!/usr/bin/env node
import ChildProcess from 'child_process'

const targetGraphicsRendererSubCommand = process.argv.slice(2).join(' ')
ChildProcess.execSync(
  `PROJECT_DIRECTORY_PATH=${process.cwd()} docker compose --file ${__dirname}/dist.docker-compose.yml build && GRAPHICS_RENDERER_SUB_COMMAND="${targetGraphicsRendererSubCommand}" PROJECT_DIRECTORY_PATH=${process.cwd()} docker compose --file ${__dirname}/dist.docker-compose.yml run -p 3000:3000 --rm graphics-renderer`,
  { stdio: 'inherit' }
)
