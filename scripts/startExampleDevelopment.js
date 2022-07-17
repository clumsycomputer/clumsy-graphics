#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync(
  '_clumsy-graphics startDevelopment --animationModulePath=./example-project/HelloRainbow.animation.tsx',
  { stdio: 'inherit' }
)
