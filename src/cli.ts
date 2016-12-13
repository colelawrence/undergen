#!/usr/bin/env node

import { Args, ValidArgs } from './cli/args.interface'

const booleanArgs = ValidArgs
	.filter(({type}) => type === "boolean")
  .map(({name}) => name)

import { GenCommand } from './cli/commands'

import parseArgs = require('minimist')

// either 'under' or 'undergen'
const binCmd = filename(process.argv[1])

const parsedArgs = <Args> parseArgs(process.argv.slice(2), { boolean: booleanArgs })

// helper function returns bool if string looks like bool
function bool(arg: any) {
  if (/^true$/i.test(arg)) return true
  else if (/^false$/i.test(arg)) return false
  else return arg
}

// convert boolean type arguments to booleans
Object.keys(parsedArgs).forEach((pArgKey) => parsedArgs[pArgKey] = bool(parsedArgs[pArgKey]))

// Check for invalid arguments
const invalidArgs = Object.keys(parsedArgs)
	// if arg is not in valid args, or is wrong type
	.filter(pArgKey => !ValidArgs.find(va => (va.name === pArgKey && typeof parsedArgs[pArgKey] === va.type)))

if (invalidArgs.length > 0) {
  console.error(`Invalid arguments given:\n * ${invalidArgs.map(a => `${a}=${parsedArgs[a]}`).join('\n * ')}`)

} else {

	switch (binCmd) {
		case 'under':
      const [cmd, ...args] = parsedArgs._

      parsedArgs._ = args
      switch (cmd) {
        case "gen": GenCommand(parsedArgs).catch((error) => console.error(error)); break
        default: console.error("Unknown command, " + cmd)
      }
      break

    // I had to add this command, I love typing out `undergen` and not `under gen`,
    // less confusing as the package name is undergen as well.
    case 'undergen':
    	GenCommand(parsedArgs).catch((error) => console.error(error)); break
    default: console.error("Unknown command, " + binCmd)
  }
}

function filename(filepath) {
  return filepath.match(/[^\\\/]+$/)[0].toLowerCase()
}