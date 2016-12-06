
import * as M from './models'
import * as helpers from './helpers'

import { walkSync } from './utils/walk-sync'
import fs = require('fs')

import * as C from 'typescript-collections'

import path = require('path')


// TODO configurable?
const PATH_RE = /\{\s*([\$\w]+)\s*\}/g
const PATH_REl = /\{\s*([\$\w]+)\s*\}/

export
function ParseTemplate(cwd: string, templateName: string): M.Template {
	const config = helpers.readUndergenConfig(cwd)

  const templateDir = path.resolve(cwd, config.templatesDir, templateName)
  const template_config = helpers.readTemplateConfig(cwd, templateDir, config)

	const templates: M.FileTemplate[] =
  	walkSync(template_config.filesDir)
  	// Take only files
  	.filter(({stats}) => stats.isFile())
  	// Read files
  	.map(({filename, basedir}) => {
      path.resolve(basedir, filename)
      let wkpath = path.relative(template_config.filesDir, basedir)
      const contents = fs.readFileSync(path.resolve(basedir, filename), 'utf8')
    	return {
        baseDir: wkpath,
        // replace optional ejs extension
        filename: filename,
        contents: contents
      }
    })
  
  const configVarDictionary = new C.Dictionary<string, M.TemplateConfigVariable>()

  template_config
    .variables
    .forEach(config => {
			return configVarDictionary.setValue(config.id, config)
    })

	const filenameVars = templates
    .map(({filename}) => filename.match(PATH_RE))
	const basenameVars = templates
    .map(({baseDir}) => baseDir.match(PATH_RE))

  basenameVars.concat(filenameVars)
  	.reduce(flatten, []).filter(a => a != null)
    .map(p => PATH_REl.exec(p)[1])
    // Add to dictionary if not present
    .filter(id => !configVarDictionary.containsKey(id))
    .forEach(id => configVarDictionary.setValue(id, { id: id }))

	const templateVars: M.TemplateVariable[] =
  	configVarDictionary
      .values() // no duplicates configs
      .map(helpers.createTemplateVariableFromTemplateConfigVariable)

  return <M.Template> {
    baseDir: templateDir,
    filesDir: template_config.filesDir,
    locals: template_config.locals,
		vars: templateVars,
    outDir: template_config.outDir,
    files: templates,
  }
}

// helper function for flatteing using
// [["a"], ["b", "c"]].reduce(flatten, [])
function flatten(a: string[], b: string[]) {
  return a.concat(b)
}
