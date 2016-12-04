
module.exports = {
  // put additional parameters in here
  variables: [
    "inputArr"
  ],
  onComplete: (vars) => {
    const componentName = vars.componentName
    console.log("Now add the following import to the top of your module file:")
    console.log(``)
    console.log(`    import { ${componentName}Component } from './${componentName}/${componentName}.component.ts'`)
    console.log(``)
  }
}