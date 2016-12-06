
export
interface UndergenConfig {
  templatesDir?: string // defaults to 'templates'
}

export
interface TemplateConfigVariable {
  name: string
  description?: string
  default?: (answers: {[varname: string]: any}) => any
}

export
interface TemplateConfig {
	// configurable
  
  // these can also be strings,
  // which we will turn into `config = { name: config }`
  variables?: TemplateConfigVariable[]

  filesDir?: string // defaults to 'files'
  outDir?: string // defaults to root of project; './'
  locals?: {[id: string]: any}
  onComplete?: (variables: {[name: string]: any}, renderedFiles: FileToWrite[]) => void
}

export
interface FileToWrite {
  filename: string
  baseDir: string
  contents: string
}

export
interface FileTemplate {
  filename: string
  baseDir: string
  contents: string
}

export
interface Template {
  vars: TemplateVariable[]
  locals: {[key: string]: any}
  files: FileTemplate[]
  outDir: string,
  baseDir: string
  filesDir: string
}

export
enum VariableType {
  string, directory, array, number
}

export
interface TemplateVariable {
	config: TemplateConfigVariable
  vartype: VariableType
}
