
module.exports = {
  // put additional parameters in here
  variables: [
    "inputArr"
  ],
  outDir: "./src/app/shared",
  locals: {
    isColeCool: true
  },
  onComplete: (vars) => {
    const componentName = vars.componentName
    console.log("Now add the following import to the top of your module file:")
    console.log(``)
    console.log(`    import { ${componentName}Component } from './${componentName}/${componentName}.component.ts'`)
    console.log(``)
  }
}