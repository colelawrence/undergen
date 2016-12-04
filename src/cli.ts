#!/usr/bin/env node

import { Args } from './cli/args.interface'

import { GenCommand } from './cli/commands'

import parseArgs = require('minimist')
const parsedArgs = <Args> parseArgs(process.argv.slice(2))

const [cmd, ...args] = parsedArgs._

parsedArgs._ = args
switch (cmd) {
  case "gen": GenCommand(parsedArgs).catch((error) => console.error(error)); break
  default: console.error("Unknown command, " + cmd)
}
