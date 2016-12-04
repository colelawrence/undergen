import fs = require('fs')
const walk = <{walkSync: (path:string, cb: (basedir: string, filename: string, stat: fs.Stats) => void) => void }> require('fs-walk')

type finfo = {basedir: string, filename: string, stats: fs.Stats}
export
function walkSync(path: string): finfo[] {
  const res: finfo[] = []
  walk.walkSync(path, (basedir, filename, stats) => {
		res.push({ filename, basedir, stats })
  })
  return res
}