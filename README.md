Undergen
============

## Usage

```sh
under gen yourTemplateName someDir:src/modules
```

and it will ask you about any other variables you need to define, based on your `templates/yourTemplateName/template.json`

See [workspace-1](test/cases/workspace-1) for an example workspace for using undergen.

## Configuration files

```ts
export
interface UndergenConfig {
  templatesDir?: string // defaults to 'templates'
}

module.exports = {
	// Variables which need to be defined for template
  variables?: string[]

	// files directory relative to this file
  // The files directory is a mirrored representation of these templates
  filesDir?: string // defaults to './files'

  // locals that can be used inside the template files
  locals?: {[key: string]: any}

  // Called after files are created
  onComplete?: (variables: any, renderedFiles: FileToWrite[]) => void
}
```

## Example 1

```js
// File: .undergen.js
module.exports = {
  templatesDir: "./templatesDir"
}
```

```js
// File: templatesDir/coolTemplate/template.js
module.exports = {
  // put additional variables in here
  // (some variables are already scraped from pathnames)
  "variables": [
    "inputArr" // this is a string array based on the suffix 'Arr'
  ]
}
```

```js
// File: templatesDir/coolTemplate/files/{fileDir}/{fileName}.txt.erb
<% inputArr.forEach(str => {%>
  <%= str %>!
<% }) %>
```

So, now calling `under gen coolTemplate fileDir:dest fileName:hello inputArr:a,b,c`,
will write the following file at `dest/hello.txt`:

```
a!
b!
c!

```

## Example 2: Angular

Let's say you want to generate lots of files like **Angular 2** components.

```js
// File: templatesDir/NGC/template.js
module.exports = {
  // put additional variables in here
  // (some variables are already scraped from pathnames)
  "variables": [
    "componentName", // this is a string based on no significant suffix
    "componentCapitallizedName" // this is a string as well
  ]
}
```

Note, that for didactic purposes I'm skipping a module file.

```js
// File: templatesDir/NGC/files/{fileDir}/{componentName}/{componentName}.component.ts.erb
@Component({
  template: require("./<%= componentName %>.component.html"),
  styles: [require("./<%= componentName %>.component.scss")]
})
class <%= componentCapitallizedName %>Component {
  // insert significant things
  // could have a inputsArr generate the inputs here and in the html file
}
```
```html
<!-- File: templatesDir/NGC/files/{fileDir}/{componentName}/{componentName}.component.html.erb -->

<!-- <%= componentCapitallizedName %>Component template -->
<!-- could have a inputsArr generate inputs needed here with bindings -->
```
```css
/* File: templatesDir/NGC/files/{fileDir}/{componentName}/{componentName}.component.scss.erb -->

/* <%= componentCapitallizedName %>Component styles */
```

So, now calling `under gen NGC fileDir:src/app/shared componentName:hello componentCapitallizedName:Hello`,
will write the following files (_excluding_ `File: ` header):

```js
// File: src/app/shared/hello/hello.component.ts
@Component({
  template: require("./hello.component.html"),
  styles: [require("./hello.component.scss")]
})
class HelloComponent {
  // insert significant things
  // could have a inputsArr generate the inputs here and in the html file
}
```
```html
<!-- File: src/app/shared/hello/hello.component.html -->

<!-- HelloComponent template -->
<!-- could have a inputsArr generate inputs needed here with bindings -->
```
```css
/* File: src/app/shared/hello/hello.component.scss -->

/* HelloComponent styles */
```


This is a code generation utility for when you want to store the 
template files in the workspace you're in.

This is prompted by quickly changing best practices in Angular 2,
and the intricacies of subtle updates to how things need to be written
differently in each codebase, having easy to understand and use codegen
configured inside the repo itself, makes your workflow much easier
for your team.

Variable types work as follows (not case sensitive):

 * `*Dir`: `string` Requires directory path
 * `*Arr`: `string[]` Requires string array
 * `*Num` | `*Count`: `number` Requires number
 * `*`: `string` Requires any string

You can see how this parsing works in the [helpers.ts](./src/helpers.ts) file.

Todo:
 - [x] CLI interface created based on compiled templates
    - Looking into [inquirer](https://github.com/SBoudrias/Inquirer.js) and [inquirer directory](https://github.com/nicksrandall/inquirer-directory)
 - [x] :art: Validation error reporting.
 - [ ] :white_check_mark: General Testing (also good for documentation).
 - [ ] :memo: User documentation.
