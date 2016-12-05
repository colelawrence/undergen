
import * as M from './models'

import ejs = require('ejs')
import path = require('path')

// TODO configurable?
const PATH_RE = /\{\s*([\$\w]+)\s*\}/g

export
function RenderTemplate (template: M.Template, vars: any, options = {}): M.FileToWrite[] {
	const undefinedVars = template.vars
    .map(({identifier}) => vars[identifier] ? null : identifier)
    .filter(a => a != null)

	if (undefinedVars.length > 0) throw "Undefined variables in options: " + undefinedVars.join(', ')

	return template.files
  	.map((file) => renderFile(file, vars, template))
}

function renderFile (file: M.FileTemplate, vars: {[identifier: string]: any}, template: M.Template): M.FileToWrite {
  const contents = file.contents
    // Cost of learning to always use <%- ? nah...
  	.replace(/<%=/g, '<%-')

	// Access to data includes lodash as _, locals of template config, and vars passed in
	const data = Object.assign(
    { _: require('lodash') },
    template.locals,
    vars
  )

  const renderedContents = ejs.render(contents, data, <any> {
    // absolute paths resolved to here
    root: template.baseDir,
    context: {}, // this
    filename: path.resolve(template.filesDir, file.baseDir, file.filename),
  })

  return <M.FileToWrite> {
    baseDir: file.baseDir
      // use variables in path
    	.replace(PATH_RE, (_match, id) => vars[id] ),

    filename: file.filename
      // remove ejs extension if present
    	.replace(/\.ejs$/, '')
      // use variables in path
      .replace(PATH_RE, (_match, id) => vars[id] ),

    contents: renderedContents
  }
}
