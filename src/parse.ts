
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

  const template_config = helpers.readTemplateConfig(cwd, config, templateName)

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
  
  const templateVarIdsSet = new C.Set<string>()

	const filenameVars = templates
    .map(({filename}) => filename.match(PATH_RE))
	const basenameVars = templates
    .map(({baseDir}) => baseDir.match(PATH_RE))

  basenameVars.concat(filenameVars)
  	.reduce(flatten, []).filter(a => a != null)
    .map(p => PATH_REl.exec(p)[1])
    // Add to set (removing duplicates)
    .forEach(id => templateVarIdsSet.add(id))

  template_config
    .variables
    .forEach(id => {
			return templateVarIdsSet.add(id)
    })


	// Get path variables
	const templateVars: M.TemplateVariable[] = templateVarIdsSet.toArray()
  	.map(helpers.createTemplateVariableFromIdentifier)

  return <M.Template> {
    baseDir: template_config.baseDir,
    filesDir: template_config.filesDir,
    locals: template_config.locals,
		vars: templateVars,
    files: templates
  }
}

// helper function for flatteing using
// [["a"], ["b", "c"]].reduce(flatten, [])
function flatten(a: string[], b: string[]) {
  return a.concat(b)
}
