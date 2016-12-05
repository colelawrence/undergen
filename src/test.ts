
import path = require("path")

console.log("Hello")

import { ParseTemplate } from './parse'
import { RenderTemplate } from './render'
import { WriteTemplate } from './write'

const wksp1 = path.resolve(__dirname, '../test/cases/workspace-1')

const template = ParseTemplate(wksp1, 'component')
console.log("template", template)

const compDir = path.resolve(wksp1, './src/hello')
const files = RenderTemplate(template, { componentName: "hello", componentDir: compDir, inputArr: ["a1", "b2"] })

console.log("files\n")
console.log(files.map(f => {
  return `<${f.basepath}/${f.filename}>\n${f.contents}<<<<<<>>>>>>`
}).join('\n'))
//WriteTemplate(files)
