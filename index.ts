const daynum = process.argv[2]
const filename = process.argv[3]

const problem = require(`./${daynum}`)

problem(`./${daynum}/${filename}`)