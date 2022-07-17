#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync(
  '_clumsy-graphics convertAnimationToGif --animationMp4SourcePath=./example-project/HelloRainbow.mp4 --animationGifOutputPath=./example-project/HelloRainbow.gif --gifAspectRatioWidth=1024',
  { stdio: 'inherit' }
)
