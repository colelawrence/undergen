
export
interface UndergenConfig {
  templatesDir?: string // defaults to 'templates'
}

export
interface TemplateConfig {
  variables?: string[],
  filesDir?: string, // defaults to 'files'
  onComplete?: (variables: any, renderedFiles: FileToWrite[]) => void
}

export
interface FileToWrite {
  filename: string
  basepath: string
  contents: string
}

export
interface FileTemplate {
  filename: string
  basepath: string
  contents: string
}

export
interface Template {
  vars: TemplateVariable[]
  files: FileTemplate[]
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
