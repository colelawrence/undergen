
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
inquirer.registerPrompt('directory', require('inquirer-directory-undergen'));

export
async function GenCommand(args: Args) {
  // Current working directory
  const cwd = path.resolve(args.cwd || process.cwd())

	const DEBUG = !!args.debug
	const DRY = !!args.dry
	const FORCE = !!args.force

	function debug(...args) {
    if (!DEBUG) return
    console.log.apply(console, args)
  }

	debug("CWD:", cwd)

  const [templateName, ...templateVarArgs] = args._

	debug("GENERATE Template:", templateName)

    /////////////////////////
	 // 1. PARSING TEMPLATE //
  /////////////////////////
	const template = ParseTemplate(cwd, templateName)

	const vars_from_cli = templateVarArgs
  	// map into {key, value} pairs acknowledging identifier suffix
    .map(helpers.createKeyValuePairsFromArgument(template, {cwd}))

	debug("GENERATE Vars:", vars_from_cli)
	
  const definedIds = vars_from_cli.map(({key}) => key)

  const undefinedIds = template.vars
  	.filter(v => definedIds.indexOf(v.config.name) === -1)

  console.log("Undefined variables:", undefinedIds.map(v => v.config.name).join(', '))

	// This prefix prevents conflicts between application specific questions and template variables
	const noConflictPrefix = 'templateVar:'

	const question_vars = {}
  vars_from_cli.forEach(v => question_vars[v.key] = v.value)
	const questions: inquirer.Question[] =
  	undefinedIds.map(helpers.createQuestionFromTemplateVar(template, {cwd, vars: question_vars, prefix: noConflictPrefix}))


	/*
  const answersPromise = <Promise<inquirer.Answers> & {ui: any}> inquirer.prompt(questions)
  // This is the way we can access the answers objectof a prompt,
  // it was very difficult to figure out, so I'm keeping this around
  // here for documentation purposes, in case we need it for filter,
  // or other Inquirer js Question functions.
  const answersToPopulate = answersPromise.ui.answers
  vars_from_cli.forEach(({key, value}) => answersToPopulate[key] = value)
  const message = util.inspect(answersPromise.ui, true, 2, true)
  */

  const answers = await inquirer.prompt(questions)

	const VAR_DIR_RE = new RegExp(`^${noConflictPrefix}.*Dir$`)
	const VAR_RE = new RegExp(`^${noConflictPrefix}(.*)$`)

	// Resolve directory answers to absolute paths!
	Object.keys(answers)
  	// take only templateVars that are directories
  	.filter(k => VAR_DIR_RE.test(k))
  	// and resolve to absolute paths
  	.forEach(k => {
      answers[k] = path.resolve(cwd, answers[k])
    })

  // convert in vars from answers into {key, value} pairs
	const vars_from_answers = Object.keys(answers)
  	// take only templateVars
  	.filter(k => VAR_RE.test(k))
    .map(key => VAR_RE.exec(key))
    .map(([match, identifier]) => `${identifier}:${answers[match]}`)		
  	// map into {key, value} pairs acknowledging identifier suffix
    .map(helpers.createKeyValuePairsFromArgument(template, {cwd}))

	// Store the variables we will actually use to pass into our renderer
  const complete_vars = {}

	// enter in vars from cli and answers
	vars_from_cli
  	.concat(vars_from_answers)
  	.forEach(({key, value}) => complete_vars[key] = value)
  
  debug("Rendering Template!\n", complete_vars)
	
    ///////////////////////////
	 // 2. RENDERING TEMPLATE //
  ///////////////////////////
	const rendered = RenderTemplate(template, complete_vars, {cwd})

	// Message confirm writing files
  const filePathsToWrite = rendered
  	.map(t => path.resolve(t.baseDir, t.filename))
	
  const filesToReplace = filePathsToWrite
  	.filter(fp => fs.existsSync(fp))
  
  if (filesToReplace.length > 0) {
		console.log(chalk.bold.red("The following files will be overwritten: 😱"))
    console.log(filesToReplace.map(fp => ` ${chalk.bold('*')} ${chalk.yellow(fp)}`).join('\n'))

    if (FORCE) {
      console.log(chalk.bold.red("Forcing overwrite via --force: 🤐"))

  	} else {
      const {confirm_overwrite} = await inquirer.prompt({
        name: 'confirm_overwrite',
        message: `Confirm overwrite of listed ${filesToReplace.length} files? 🤔`,
        type: 'confirm',
      })
      if (!confirm_overwrite) return console.log(chalk.bold('Generation cancelled 😅'))
    }
  }

    ///////////////////////
	 // 3. WRITE TEMPLATE //
  ///////////////////////
  if (DRY) {
		console.log(chalk.bold.yellow("DRY run; no generated files."))
  } else {
    WriteTemplate(rendered)
  }

	console.log(chalk.bold.green(`Generated ${filePathsToWrite.length} files 😎`))
	console.log(
    filePathsToWrite
      .map(fp => ' * ' + path.relative(cwd, fp))
      .join('\n')
  )

	// execute onComplete command, for printing messages or whatever
	getOnComplete(cwd, templateName)(complete_vars, rendered)
}

function getOnComplete(cwd, templateName){
	const config = helpers.readUndergenConfig(cwd)
  const templateDir = path.resolve(cwd, config.templatesDir, templateName)
  const template_config = helpers.readTemplateConfig(cwd, templateDir, config)
  return template_config.onComplete
}
