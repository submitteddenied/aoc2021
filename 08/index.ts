import { Map } from "typescript"
import parseFile from "../util/parser"

const segments: {[digit: number]: string} = {
  1: 'cf',        //2 <--
  7: 'acf',       //3 <--
  4: 'bcdf',      //4 <--
  2: 'acdeg',     //5
  3: 'acdfg',     //5
  5: 'abdfg',     //5
  0: 'abcefg',    //6
  6: 'abdefg',    //6
  9: 'abcdfg',    //6
  8: 'abcdefg'    //7 <--
}

type SegmentToNumber = {[segs: string]: number}
const invSegments: SegmentToNumber = Object.entries(segments).reduce((result, [key, value]) => {
  result[value] = Number.parseInt(key)
  return result
}, <SegmentToNumber>{})

const frequency = {
  'a': 8,
  'b': 6, //*
  'c': 8,
  'd': 7,
  'e': 4, //*
  'f': 9, //*
  'g': 7
}

/*
8: all
9: 8 - e (not present in 1,7,4)
6: 8 - c
0: 8 - d
5: 6 - e; 8 - c, e
3: 9 - b; 8 - b, e
2: 8 - b, f
*/

interface LetterMap {
  [source: string]: string
}

function takeOnly<T>(list: T[]): T {
  if(list.length !== 1) {
    throw new Error(`Expected only a single item, got ${list.length} (${JSON.stringify(list)})`)
  }
  return list[0]
}

class BiMap {
  aToB: {[key: string]: string}
  bToA: {[value: string]: string}
  constructor() {
    this.aToB = {}
    this.bToA = {}
  }

  put(key: string, value: string): BiMap {
    this.aToB[key] = value
    this.bToA[value] = key

    return this
  }

  get(key: string): string {
    return this.aToB[key]
  }

  getByValue(value: string): string {
    return this.bToA[value]
  }
}

function computeMapping(inputs: string[]): LetterMap {
  //find an input length 2 and an input length 3
  //the letter present in l3 but missing in l2 should be "a"*
  //using frequency, find "f", "b" and "e" *
  //l2 word, remove the "f", remaining letter is "c"
  //l4 word, remove bcf, remaining letter is "d"
  //remaining letter is "g"
  const result = new BiMap()
  const l2 = takeOnly(inputs.filter(i => i.length === 2))
  const l3 = takeOnly(inputs.filter(i => i.length === 3))
  const a = takeOnly(l3.split('').filter(l => l2.indexOf(l) === -1))
  result.put(a, 'a')

  const freqs: {[letter: string]: number} = {}
  inputs.forEach(word => {
    word.split('').forEach(letter => {
      if(freqs[letter] === undefined) {
        freqs[letter] = 0
      }
      freqs[letter]++
    })
  })
  Object.entries(freqs).forEach(([key, value]) => {
    /*
      'b': 6
      'e': 4
      'f': 9
    */
    if(value === 4) {
      if(result.get(key) !== undefined) {
        throw new Error(`Expected ${key} to be identified by freq:4 but it was already mapped?`)
      }
      result.put(key, 'e')
    } else if(value === 6) {
      if(result.get(key) !== undefined) {
        throw new Error(`Expected ${key} to be identified by freq:6 but it was already mapped?`)
      }
      result.put(key, 'b')
    } else if(value === 9) {
      if(result.get(key) !== undefined) {
        throw new Error(`Expected ${key} to be identified by freq:9 but it was already mapped?`)
      }
      result.put(key, 'f')
    }
  })

  const c = takeOnly(l2.split('').filter(l => l !== result.getByValue('f')))
  result.put(c, 'c')

  const l4 = takeOnly(inputs.filter(i => i.length === 4))
  //remove bcf, remaining is d
  const d = takeOnly(l4.split('').filter(l => ['b', 'c', 'f'].indexOf(result.get(l)) === -1))
  result.put(d, 'd')

  //remaining unmapped letter is 'g'
  const g = takeOnly("abcdefg".split('').filter(l => result.get(l) === undefined))
  result.put(g, 'g')
  return result.aToB
}

function day8(file: string) {
  const input = parseFile(file).map(x => x.trim())

  //Part 1, count the unique numbers in the output part
  const part1 = input.reduce((count, line) => {
    const [_, outputSegment] = line.split(' | ')
    const outputs = outputSegment.split(' ')
    const uniques = outputs.filter(x => [2, 4, 3, 7].indexOf(x.length) >= 0).length
    return count + uniques
  }, 0)

  console.log(`Part 1 result: ${part1}`)

  const part2 = input.reduce((sum, line) => {
    const [clues, outputSegment] = line.split(' | ')
    const mapping = computeMapping(clues.split(' '))
    //console.log(`Computed: ${JSON.stringify(mapping)}`)

    const lineResult = outputSegment.split(' ').reduce((memo, item) => {
      const mappedSegments = item.split('').map(l => mapping[l]).sort().join('')
      const digit = invSegments[mappedSegments]
      return memo + digit
    }, '')
    //console.log(`Line result: ${lineResult}`)
    return sum + Number.parseInt(lineResult)
  }, 0)

  console.log(`Part 2 result: ${part2}`)
}

module.exports = day8