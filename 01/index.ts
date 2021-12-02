import {readFileSync} from 'fs'

const inputFileName = process.argv[2]

const input = readFileSync(inputFileName, {encoding: 'utf8'}).split('\n').filter(x => x).map(x => Number.parseInt(x))

let count = 0
console.log(`Part 1`)
for(let i = 1; i < input.length; i++) {
  if(input[i] > input[i - 1]) {
    count++
  }
}

console.log(`Answer: ${count}`)

console.log(`Part 2`)
count = 0
for(let i = 4; i < input.length + 1; i++) {
  const firstWindow = input.slice(i - 4, i - 1).reduce((a, b) => a + b, 0)
  const secondWindow = input.slice(i - 3, i).reduce((a, b) => a + b, 0)
  if(firstWindow < secondWindow) {
    //console.log(`f: ${firstWindow}; s: ${secondWindow}; increase`)
    count++
  } else {
    //console.log(`f: ${firstWindow}; s: ${secondWindow}; no increase`)
  }
}

console.log(`Answer: ${count}`)