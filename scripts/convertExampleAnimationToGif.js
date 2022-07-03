#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync(
  '_graphics-renderer convertAnimationToGif --animationMp4SourcePath=./example-project/HelloRainbow.mp4 --animationGifOutputPath=./example-project/HelloRainbow.gif --gifAspectRatioWidth=512',
  { stdio: 'inherit' }
)
