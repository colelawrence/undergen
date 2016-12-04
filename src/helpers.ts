
import * as M from './models'

export
function createTemplateVariableFromIdentifier(id: string): M.TemplateVariable {
  // Crate types for the variables based on their matched suffix
  if (/dir$/i.test(id))              return { identifier: id, vartype: M.VariableType.directory }
  else if (/arr$/i.test(id))         return { identifier: id, vartype: M.VariableType.array }
  else if (/num$|count$/i.test(id))  return { identifier: id, vartype: M.VariableType.number }
  else                               return { identifier: id, vartype: M.VariableType.string }
}

import path = require('path')
import fs = require('fs')

export
function readUndergenConfig(cwd): M.UndergenConfig {
	const conffile: string = path.resolve(cwd, './.undergen.js')

  // Require undergen conf file
  const config: M.UndergenConfig = require(conffile)

  // Ensure templates directory
  if (!config.templatesDir) {
		console.warn("Templates directory not specified, defaulting to `./templates`")
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
function readTemplateConfig(cwd: string, config: M.UndergenConfig, templateName: string): M.TemplateConfig {
	const templateDir = path.resolve(cwd, config.templatesDir, templateName)

  let template_conffile: string = path.resolve(templateDir, './template.js')

  // Require template conf file
  const template_config: M.TemplateConfig = require(template_conffile)

  // Ensure files directory
  if (!template_config.filesDir) {
		console.warn("Template filesDir directory not specified, defaulting to relative `./files`")
    template_config.filesDir = './files'
  }

  // Assert template's files directory exists
	const fullTemplateFilesPath = path.resolve(templateDir, template_config.filesDir)
  if (!fs.existsSync(fullTemplateFilesPath)) {
    throw `Template filesDir directory not found: ${fullTemplateFilesPath}`
  }

  template_config.filesDir = fullTemplateFilesPath

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
 return ({templateVar, value}: {templateVar: M.TemplateVariable, value: string}) => {
    let res = null
    switch(templateVar.vartype) {
      case M.VariableType.array:
        // We're just a bunch of goofs up here.
        res = value.replace(/([^\\]),/g, '$1😂').split('😂')
        break;
      case M.VariableType.directory:
        res = path.resolve(opts.cwd, value)
        if (!fs.existsSync(res)) {
          throw `Directory does not exist: ${templateVar.identifier} = "${value}" when resolved to "${res}"`
        }
        break
      case M.VariableType.number:
        res = parseFloat(value); break
      case M.VariableType.string:
        res = String(value); break
    }
    return { key: templateVar.identifier, value: res }
  }
}

import inquirer = require('inquirer')

export
function createQuestionFromTemplateVar(opts: {cwd: string}) {
  return <(t: M.TemplateVariable) => inquirer.Question>
  function (tv) {
    let res: inquirer.Question = {
      name: 'templateVar:' + tv.identifier
    }
    switch(tv.vartype) {
      case M.VariableType.array:
      	res.message = `Define ${tv.identifier}. Enter strings separated by commas. Ex: "hello,goodbye, m" => ["hello", "goodbye", " m"]`
        res.type = 'string'
        break
      case M.VariableType.directory:
      	res.message = `Define ${tv.identifier}`
        // We need to add basePath for inquirer-directory module
        ;(<any> res).basePath = opts.cwd
        res.type = 'directory'
        break
      case M.VariableType.number:
      	res.message = `Define ${tv.identifier}. Enter number:`
        res.validate = (input) => isNaN(parseFloat(input)) ? "Enter a number" : true
        break
      case M.VariableType.string:
      	res.message = `Define ${tv.identifier}. Enter string:`
				break
    }
    return res
  }
}

export
/**
 * This function generates a function for parsing an argument formatted string ("identifier:value")
 * So, example:
 * 		const fn = createKeyValuePairsFromArgument({cwd})
 * 		fn(`f:1`) //=> {key: 'f', value: '1'}
 * 		fn(`fCount:1`) //=> {key: 'fCount', value: 1}
 * 		fn(`aArr:1`) //=> {key: 'aArr', value: ["1"]}
 * 		fn(`aArr:a,b, c`) //=> {key: 'aArr', value: ["a", "b", " c"]}
 * 		fn(`aDir:src`) //=> {key: 'aDir', value: path.resolve(cwd, "src")} // pretend the function is evaluated using the passed in cwd
 *
 * */
function createKeyValuePairsFromArgument({cwd}) {
  const valueFromTemplateVar = parseValueForTemplateVar({cwd})
  return (arg) => {
    const [id, value] = arg.split(/:/)
    return valueFromTemplateVar({
      templateVar: createTemplateVariableFromIdentifier(id),
      value
    })
  }
}