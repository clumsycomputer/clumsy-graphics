#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync('yarn buildPackage', { stdio: 'inherit' })
ChildProcess.execSync('chmod +x ./package/docker-main.js', { stdio: 'inherit' })
ChildProcess.execSync('chmod +x ./package/native-main.js', { stdio: 'inherit' })
ChildProcess.execSync('yarn link', { stdio: 'inherit' })
