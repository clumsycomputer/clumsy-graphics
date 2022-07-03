#!/usr/bin/env node
const ChildProcess = require('child_process')

ChildProcess.execSync('docker compose --file ./dev.docker-compose.yml build', {
  stdio: 'inherit',
})
ChildProcess.execSync(
  'docker compose --file ./dev.docker-compose.yml run -p 3000:3000 --rm development-environment',
  { stdio: 'inherit' }
)
