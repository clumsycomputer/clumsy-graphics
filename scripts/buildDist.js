#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync('rm -rf ./dist', { stdio: 'inherit' })
ChildProcess.execSync('tsc --project ./tsconfig.dist.json --outDir ./dist', {
  stdio: 'inherit',
})
ChildProcess.execSync(
  'cp -r ./source/startAnimationDevelopment/browser ./dist/startAnimationDevelopment/browser',
  { stdio: 'inherit' }
)
ChildProcess.execSync(
  'cp ./clumsy-graphics-dist.docker-compose.yml ./dist/clumsy-graphics-dist.docker-compose.yml',
  { stdio: 'inherit' }
)
ChildProcess.execSync(
  'cp ./clumsy-graphics-dist.Dockerfile ./dist/clumsy-graphics-dist.Dockerfile',
  {
    stdio: 'inherit',
  }
)
