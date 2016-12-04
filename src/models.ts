
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
