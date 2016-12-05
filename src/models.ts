
export
interface UndergenConfig {
  templatesDir?: string // defaults to 'templates'
}

export
interface TemplateConfig {
	// configurable
  variables?: string[]
  filesDir?: string // defaults to 'files'
  locals?: {[key: string]: any}
  onComplete?: (variables: any, renderedFiles: FileToWrite[]) => void

  // the directory of this ./template.js file (should not be configured)
  baseDir?: string
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
