
import {Args} from './args.interface'

import path = require('path')

import * as helpers from '../helpers'
import * as M from '../models'
import chalk = require('chalk')

import { ParseTemplate } from '../parse'
import { RenderTemplate } from '../render'
import { WriteTemplate } from '../write'

import fs = require('fs')

import inquirer = require('inquirer')

// Inquirer plugins
inquirer.registerPrompt('directory', require('inquirer-directory'));

export
async function GenCommand(args: Args) {
  // Current working directory
  const cwd = path.resolve(args.cwd || process.cwd)

	const DEBUG = !!args.debug

	function debug(...args) {
    if (!DEBUG) return
    console.log.apply(console, args)
  }

  const [templateName, ...templateVarArgs] = args._

	debug("CWD:", cwd)
	debug("GENERATE Template:", templateName)

	const vars_from_cli = templateVarArgs
  	.map(arg => arg.split(/:/))
    .map(([id, value]) => ({
      templateVar: helpers.createTemplateVariableFromIdentifier(id),
      value
    }))
    .map(helpers.parseValueForTemplateVar({cwd}))

	debug("GENERATE Vars:", vars_from_cli)

	const template = ParseTemplate(cwd, templateName)

	const definedIds = vars_from_cli.map(({key}) => key)

  const undefinedIds = template.vars
  	.filter(({identifier: id}) => definedIds.indexOf(id) === -1)

  console.log("Undefined keys:", undefinedIds.map(({identifier: id}) => id))

	const questions: inquirer.Question[] =
  	undefinedIds.map(helpers.createQuestionFromTemplateVar({cwd}))

  const answers = await inquirer.prompt(questions)

	// Resolve directory answers to absolute paths!
	Object.keys(answers)
  	// take only templateVars that are directories
  	.filter(k => /^templateVar:.*Dir$/.test(k))
  	// and resolve to absolute paths
  	.forEach(k => {
      answers[k] = path.resolve(cwd, answers[k])
    })
  
  const VAR_RE = /^templateVar:(.+)$/

	// Store the variables we will actually use to pass into our renderer
  const complete_vars = {}

	// enter in vars from cli
	vars_from_cli
  	.forEach(({key, value}) => complete_vars[key] = value)

  // enter in vars from answers
	Object.keys(answers)
  	// take only templateVars that are directories
  	.filter(k => VAR_RE.test(k))
    .map(key => VAR_RE.exec(key))
    .forEach(([match, identifier]) => {
      complete_vars[identifier] = answers[match]
    })
  
  debug("Rendering Template!")

	const rendered = RenderTemplate(template, complete_vars, {cwd})

	// Message confirm writing files
  const filePathsToWrite = rendered
  	.map(t => path.resolve(t.basepath, t.filename))
	
  const filesToReplace = filePathsToWrite
  	.filter(fp => fs.existsSync(fp))
  
  if (filesToReplace.length > 0) {
		console.log(chalk.bold.red("The following files will be overwritten:"))
    console.log(filesToReplace.map(fp => ` ${chalk.bold('*')} ${chalk.yellow(fp)}`).join('\n'))
    const {confirm_overwrite} = await inquirer.prompt({
      name: 'confirm_overwrite',
      message: `Confirm overwrite of listed ${filesToReplace.length} files?`,
      type: 'confirm',
    })

    if (!confirm_overwrite) return console.log(chalk.bold('Generation cancelled'))
  }

  WriteTemplate(rendered)

	console.log(chalk.bold(chalk.green(`Generated ${filePathsToWrite.length} files:`)))
	console.log(
    filePathsToWrite
      .map(fp => ' * ' + path.relative(cwd, fp))
      .join('\n')
  )
}
