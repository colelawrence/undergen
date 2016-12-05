
export
interface Args {
  _: string[]
	cwd?: string
  debug?: boolean
  dry?: boolean
	force?: boolean
}

// If an argument is not in this, then halt.
export
const ValidArgs: { name: string, type: string }[] = [
	{ name: "cwd",	 	type: "string" 	},
	{ name: "debug", 	type: "boolean" },
	{ name: "force",  type: "boolean" },
	{ name: "dry", 		type: "boolean" },
	{ name: "_", 			type: "object" 	}
]
