
import * as M from './models'

export
function createTemplateVariableFromTemplateConfigVariable(config: M.TemplateConfigVariable): M.TemplateVariable {
  // Crate types for the variables based on their matched suffix
  if (/dir$/i.test(config.id))              return { config, vartype: M.VariableType.directory }
  else if (/arr$/i.test(config.id))         return { config, vartype: M.VariableType.array }
  else if (/num$|count$/i.test(config.id))  return { config, vartype: M.VariableType.number }
  else                               				return { config, vartype: M.VariableType.string }
}

import path = require('path')
import fs = require('fs')
import chalk = require('chalk')

export
function readUndergenConfig(cwd): M.UndergenConfig {
	const conffile: string = path.resolve(cwd, './.undergen.js')

  // Require undergen conf file
  let config: M.UndergenConfig
  try {
    config = require(conffile)
  } catch (err) {
    console.warn("No './.undergen.js' file found. Using defaults; looking for templates in './templates'.")
		config = {}
  }

  // Ensure templates directory
  if (!config.templatesDir) {
    config.templatesDir = './templates'
  }

  // Assert templates directory exists
	const testTemplatesPath = path.resolve(cwd, config.templatesDir)
  if (!fs.existsSync(testTemplatesPath)) {
    throw `Templates directory not found: ${testTemplatesPath}`
  }

  return config
}

export
function readTemplateConfig(cwd, templateDir: string, config: M.UndergenConfig): M.TemplateConfig {
  let template_conffile: string = path.resolve(templateDir, './template.js')

  // Require template conf file
  const template_config: M.TemplateConfig = require(template_conffile)

  // Ensure files directory
  if (!template_config.filesDir) {
    template_config.filesDir = './files'
  }

  // Ensure template config are all advanced variables directory
  template_config.variables =
  	template_config.variables
    .map(variable =>
    	typeof variable === 'string'
      ? <M.TemplateConfigVariable> { id: variable }
      : variable
    )

  // Assert template's files directory exists
	const fullTemplateFilesDir = path.resolve(templateDir, template_config.filesDir)
  if (!fs.existsSync(fullTemplateFilesDir)) {
    throw `Template filesDir directory not found: ${fullTemplateFilesDir}`
  }

  template_config.filesDir = fullTemplateFilesDir

  // Assert template's out directory exists
	const fullTemplateOutDir = path.resolve(cwd, template_config.outDir || './')
  if (!fs.existsSync(fullTemplateOutDir)) {
    throw `Template outDir directory not found: ${fullTemplateOutDir}`
  }

  template_config.outDir = fullTemplateOutDir

	if (template_config.variables == null) {
	  template_config.variables = []
  }

	if (template_config.onComplete == null) {
	  template_config.onComplete = (noop => noop)
  }

  return template_config
}

export
function parseValueForTemplateVar(opts: { cwd: string }) {
 return (templateVar: M.TemplateVariable, value: string) => {
    let res = null
    switch(templateVar.vartype) {
      case M.VariableType.array:
        // We're just a bunch of goofs up here.
        res = value
        	.replace(/([^\\]),/g, '$1😂').split('😂')
          // Ensure that there is at least one string
          .filter(str => str && str.length)

        break;
      case M.VariableType.directory:
        res = path.resolve(opts.cwd, value)
        if (!fs.existsSync(res)) {
          throw `Directory does not exist: ${templateVar.config.id} = "${value}" when resolved to "${res}"`
        }
        break
      case M.VariableType.number:
        res = parseFloat(value); break
      case M.VariableType.string:
        res = String(value); break
    }
    return res
  }
}

import inquirer = require('inquirer')

export
function createQuestionFromTemplateVar(template, opts: {cwd: string}) {
  return <(t: M.TemplateVariable) => inquirer.Question>
  function (tv) {
    let res: inquirer.Question = {
      name: 'templateVar:' + tv.config.id
    }

		let description = ''

    // add description for the variable to the message
    if (tv.config.description) {
			description = `\n${ chalk.reset(tv.config.description) }\n`
    }

    let displayName = tv.config.name || tv.config.id
    switch(tv.vartype) {
      case M.VariableType.array:
      	res.message = `Define ${displayName}. ${description}Enter strings separated by commas.\nEx: "a1,b#, m" => ["a1", "b#", " m"]\n`
        res.type = 'string'
        break
      case M.VariableType.directory:
      	res.message = `Define ${displayName}. ${description}`
        // We need to add basePath for inquirer-directory module
        ;(<any> res).basePath = opts.cwd
        ;(<any> res).startPath = template.outDir || opts.cwd
        ;(<any> res).cwd = opts.cwd
        res.type = 'directory'
        break
      case M.VariableType.number:
      	res.message = `Define ${displayName}. ${description}Enter number:`
        res.validate = (input) => isNaN(parseFloat(input)) ? `Unable to parse not a number "${input}".` : true
        break
      case M.VariableType.string:
      	res.message = `Define ${displayName}. ${description}Enter string:`
				break
    }

    return res
  }
}

export
/**
 * This function generates a function for parsing an argument formatted string ("identifier:value")
 * So, example:
 * 		const fn = createKeyValuePairsFromArgument(template, {cwd})
 * 		fn(`f:1`) //=> {key: 'f', value: '1'}
 * 		fn(`fCount:1`) //=> {key: 'fCount', value: 1}
 * 		fn(`aArr:1`) //=> {key: 'aArr', value: ["1"]}
 * 		fn(`aArr:a,b, c`) //=> {key: 'aArr', value: ["a", "b", " c"]}
 * 		fn(`aDir:src`) //=> {key: 'aDir', value: path.resolve(cwd, "src")} // pretend the function is evaluated using the passed in cwd
 *
 * */
function createKeyValuePairsFromArgument(template: M.Template, {cwd}) {
  const parseTemplateVarValue = parseValueForTemplateVar({cwd})
  return (arg) => {
    const [id, value] = arg.split(/:/)

    const templateVariable = template.vars.find(v => v.config.id === id)
		if (templateVariable == null) {
      throw new Error(`Unknown template variable argument ID: ${id}`)
    }

    return {
      key: templateVariable.config.id,
      value: parseTemplateVarValue(templateVariable, value)
    }
  }
}
