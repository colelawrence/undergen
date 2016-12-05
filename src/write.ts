
const mkdirp = require('mkdirp')

import fs = require('fs')
import path = require('path')
import * as M from './models'

export
function WriteTemplate(filesToWrite: M.FileToWrite[]) {
  filesToWrite
  .forEach((file) => {
		mkdirp.sync(file.baseDir)

		const filepath = path.resolve(file.baseDir, file.filename)
		fs.writeFileSync(filepath, file.contents)
  })
}