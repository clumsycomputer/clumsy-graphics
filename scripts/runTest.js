#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync('playwright test --quiet', { stdio: 'inherit' })
