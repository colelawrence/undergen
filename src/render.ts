
import * as M from './models'

import _ = require('lodash')

// TODO configurable?
const PATH_RE = /\{\s*([\$\w]+)\s*\}/g

export
function RenderTemplate (template: M.Template, vars: any, options = {}): M.FileToWrite[] {
	const undefinedVars = template.vars
    .map(({identifier}) => vars[identifier] ? null : identifier)
    .filter(a => a != null)

	if (undefinedVars.length > 0) throw "Undefined variables in options: " + undefinedVars.join(', ')

	return template.files
  	.map((file) => renderFile(file, vars))
}

function renderFile (file: M.FileTemplate, vars: {[identifier: string]: any}): M.FileToWrite {
  // Special normalization of template string
  const contents = file.contents
    // if template is on own line, then reduce entire line
  	.replace(/\n\s*(<%[^=-].+?%>)\s*\n/g, '$1\n')
    // if template is operation starting line, then reduce
  	.replace(/\n(<%[^=-].+?%>)$/g, '$1')

  const renderedContents = _.template(contents)(vars)

  return <M.FileToWrite> {
    basepath: file.basepath.replace(PATH_RE, (_match, id) => vars[id] ),
    filename: file.filename.replace(PATH_RE, (_match, id) => vars[id] ),
    contents: renderedContents
  }
}
