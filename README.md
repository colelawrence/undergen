Undergen
============

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

You can see how this parsing works in the [parse.ts](./src/parse.ts) file.

Todo:
 - [ ] CLI interface created based on compiled templates
    - Looking into [inquirer](https://github.com/SBoudrias/Inquirer.js) and [inquirer directory](https://github.com/nicksrandall/inquirer-directory)
 - [ ] :art: Validation error reporting.
 - [ ] :white_checkmark: General Testing (also good for documentation).
 - [ ] :memo: Documentation.