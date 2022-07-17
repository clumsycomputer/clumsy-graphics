#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync('rm -rf ./package', {
  stdio: 'inherit',
})
ChildProcess.execSync(
  'tsc --project ./tsconfig.package.json --outDir ./package',
  {
    stdio: 'inherit',
  }
)
ChildProcess.execSync(
  'cp -r ./source/startAnimationDevelopment/browser ./package/startAnimationDevelopment/browser',
  { stdio: 'inherit' }
)
ChildProcess.execSync(
  'cp ./clumsy-graphics-package.docker-compose.yml ./package/clumsy-graphics-package.docker-compose.yml',
  { stdio: 'inherit' }
)
ChildProcess.execSync(
  'cp ./clumsy-graphics-package.Dockerfile ./package/clumsy-graphics-package.Dockerfile',
  {
    stdio: 'inherit',
  }
)
