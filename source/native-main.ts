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
FileSystem.writeFileSync(
  `${__dirname}/clumsycomputer-graphics-renderer-v2.0.3.tgz`,
  FileSystem.readFileSync(
    `${process.cwd()}/clumsycomputer-graphics-renderer-v2.0.3.tgz`
  )
)
const targetGraphicsRendererSubCommand = process.argv.slice(2).join(' ')
ChildProcess.execSync(
  `PROJECT_SOURCE_DIRECTORY_PATH=${process.cwd()}/source docker compose -f ${__dirname}/dist.docker-compose.yml build && GRAPHICS_RENDERER_SUB_COMMAND="${targetGraphicsRendererSubCommand}" PROJECT_SOURCE_DIRECTORY_PATH=${process.cwd()}/source docker compose -f ${__dirname}/dist.docker-compose.yml up`,
  { stdio: 'inherit' }
)
