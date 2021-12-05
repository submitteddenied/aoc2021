import { green, red } from 'colors/safe'
import parseFile from '../util/parser'

const input = parseFile(process.argv[2]).map(x => x.trim())

function countFrequency(list: string[]): number[] {
  const result = []
  for(let i = 0; i < list[0].length; i++) {
    result.push(0)
  }
  
  for(let i = 0; i < list.length; i++) {
    for(let j = 0; j < list[0].length; j++) {
      if(list[i][j] === '1') {
        result[j] += 1
      }
    }
  }

  return result
}

const counts = countFrequency(input)

let gammaBinary = ''
let epsilonBinary = ''
for(let i = 0; i < counts.length; i++) {
  if(counts[i] >= (input.length / 2)) {
    gammaBinary += '1'
    epsilonBinary += '0'
  } else {
    gammaBinary += '0'
    epsilonBinary += '1'
  }
}

console.log(`Part 1:`)
console.log(`Counts: ${JSON.stringify(counts)}`)
console.log(`gamma: ${gammaBinary} (${Number.parseInt(gammaBinary, 2)})`)
console.log(`epsilon: ${epsilonBinary} (${Number.parseInt(epsilonBinary, 2)})`)
console.log(`Result: ${Number.parseInt(gammaBinary, 2) * Number.parseInt(epsilonBinary, 2)}`)

// Part 2
// oxygen generator * co2 scrubber

enum KeepType {
  Most,
  Least
}

function spaces(num: number): string {
  let r = ''
  for(let i = 0; i < num; i++) {
    r += ' '
  }
  return r
}

function searchForValue(list: string[], index: number, type: KeepType): string {
  if(list.length === 1) {
    //console.log(`${spaces(index)} -> [${green(list[0])}]`)
    return list[0]
  }
  const count = countFrequency(list)
  let mostCommon: string
  if(count[index] >= list.length / 2) {
    mostCommon = '1'
  } else {
    mostCommon = '0'
  }
  if(type === KeepType.Most) {
    //console.log(`${spaces(index)} -> ${count[index]} [${list.map(x => x[index] === mostCommon ? green(x) : red(x)).join(', ')}]`)
    return searchForValue(
      list.filter(x => x[index] === mostCommon),
      index + 1,
      type
    )
  } else {
    //console.log(`${spaces(index)} -> ${count[index]} [${list.map(x => x[index] !== mostCommon ? green(x) : red(x)).join(', ')}]`)
    return searchForValue(
      list.filter(x => x[index] !== mostCommon),
      index + 1,
      type
    )
  }
}

const oxygen = searchForValue(input, 0, KeepType.Most)
const co2 = searchForValue(input, 0, KeepType.Least)

console.log('Part 2')
console.log(`oxygen: ${oxygen} (${Number.parseInt(oxygen, 2)})`)
console.log(`co2: ${co2} (${Number.parseInt(co2, 2)})`)
console.log(`Result: ${Number.parseInt(co2, 2) * Number.parseInt(oxygen, 2)}`)