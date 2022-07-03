#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync('yarn buildDist', { stdio: 'inherit' })
ChildProcess.execSync('chmod +x ./dist/docker-main.js', { stdio: 'inherit' })
ChildProcess.execSync('chmod +x ./dist/native-main.js', { stdio: 'inherit' })
ChildProcess.execSync('yarn link', { stdio: 'inherit' })
