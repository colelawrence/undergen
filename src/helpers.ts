
import * as M from './models'

export
function createTemplateVariableFromIdentifier(a: string) {
  if (/dir$/i.test(a)) return <M.TemplateVariable> { identifier: a, vartype: M.VariableType.directory }
  else if (/arr$/i.test(a)) return <M.TemplateVariable> { identifier: a, vartype: M.VariableType.array }
  else if (/num$|count$/i.test(a)) return <M.TemplateVariable> { identifier: a, vartype: M.VariableType.number }
  else return <M.TemplateVariable> { identifier: a, vartype: M.VariableType.string }
}

import path = require('path')
import fs = require('fs')

export
function parseValueForTemplateVar(opts: { cwd: string }) {
 return ({templateVar, value}: {templateVar: M.TemplateVariable, value: string}) => {
    let res = null
    switch(templateVar.vartype) {
      case M.VariableType.array:
      	console.log("hey", value)
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