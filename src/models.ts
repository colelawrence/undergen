
export
interface UndergenConfig {
  templatesDir?: string // defaults to 'templates'
}

export
interface TemplateConfig {
	// configurable
  variables?: string[]
  filesDir?: string // defaults to 'files'
  outDir?: string // defaults to root of project; './'
  locals?: {[key: string]: any}
  onComplete?: (variables: any, renderedFiles: FileToWrite[]) => void
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
	identifier: string
  vartype: VariableType
}
