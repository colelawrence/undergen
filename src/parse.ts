
import * as M from './models'
import * as helpers from './helpers'

import { walkSync } from './utils/walk-sync'
import fs = require('fs')

import * as C from 'typescript-collections'

import path = require('path')


// TODO configurable?
const PATH_RE = /\{\s*([\$\w]+)\s*\}/g

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
    // Separate all the places in the path
    .reduce(flatten, []).filter(a => a != null)
    // Get each piece separately
    .map(p => PATH_RE.exec(p)).filter(a => a != null)
    // Add to set (removing duplicates)
    .forEach(([,match]) => templateVarIdsSet.add(match))

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
