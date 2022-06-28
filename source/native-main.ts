#!/usr/bin/env node
import ChildProcess from 'child_process'
import FileSystem from 'fs'

FileSystem.writeFileSync(
  `${__dirname}/package.json`,
  FileSystem.readFileSync(`${process.cwd()}/package.json`)
)
FileSystem.writeFileSync(
  `${__dirname}/yarn.lock`,
  FileSystem.readFileSync(`${process.cwd()}/yarn.lock`)
)
const targetGraphicsRendererSubCommand = process.argv.slice(2).join(' ')
ChildProcess.execSync(
  `GRAPHICS_RENDERER_SUB_COMMAND="${targetGraphicsRendererSubCommand}" PROJECT_SOURCE_DIRECTORY_PATH=${process.cwd()}/source docker compose --file ${__dirname}/dist.docker-compose.yml up --build`,
  { stdio: 'inherit' }
)
