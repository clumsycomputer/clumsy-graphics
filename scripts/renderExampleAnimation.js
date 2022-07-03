#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync(
  '_graphics-renderer renderAnimation --animationModulePath=./example-project/HelloRainbow.animation.tsx --animationMp4OutputPath=./example-project/HelloRainbow.mp4',
  { stdio: 'inherit' }
)
