import { green, red } from "colors/safe"
import parseFile from "../util/parser"

class CorruptedChunk extends Error {
  char: string
  constructor(expected: string, found: string) {
    super(`Expected '${expected}', but found '${found}' instead.`)
    this.char = found
  }
}

class IncompleteChunk extends Error {
  expected: string
  constructor(expected: string) {
    super(`Expected to find ${expected} but got EOL`)
    this.expected = expected
  }
}

const pairs: {[char: string]: string} = {
  '{': '}',
  '(': ')',
  '[': ']',
  '<': '>'
}

const SCORING: {[char: string]: number} = {
  '}': 1197,
  ')': 3,
  ']': 57,
  '>': 25137
}

function indent(d: number): string {
  let result = ''
  for(let i = 0; i < d; i++) {
    result += ' '
  }
  return result
}

function repairLine(chunk: string): string[] {
  const added: string[] = []

  while(true) {
    try {
      //console.log(`${chunk + added.join('')} check`)
      let attempt = chunk + added.join('')
      while(attempt.length > 0) {
        attempt = processChunk(attempt)
      }
    } catch(ex) {
      if(ex instanceof IncompleteChunk) {
        added.push(ex.expected)
        continue
      }
      throw ex
    }
    return added
  }
}

function processChunk(chunk: string): string {
  if(chunk.length === 0) {
    return ''
  }
  
  if(pairs[chunk[0]] !== undefined) {
    //this is a new sub-chunk
    const opening = chunk[0]
    //process chunks until the next closing at this level
    let remainder = chunk.slice(1, undefined)
    //if remainder[0] is an opening char, it's a "descendent"
    while(pairs[remainder[0]] !== undefined) {
      remainder = processChunk(remainder) 
    }
    if(remainder.length === 0) {
      throw new IncompleteChunk(pairs[opening])
    }
    if(remainder[0] !== pairs[opening]) {
      throw new CorruptedChunk(pairs[opening], remainder[0])
    }
    return remainder.slice(1, undefined)
  } else {
    //this is a closing char
    return chunk
  }
}

const P2_SCORING: {[char: string]: number} = {
  '}': 3,
  ')': 1,
  ']': 2,
  '>': 4
}

function scoreAdditions(additions: string[]): number {
  return additions.reduce((total, item) => {
    return (total * 5) + P2_SCORING[item]
  }, 0)
}

function day10(file: string) {
  const input = parseFile(file).map(x => x.trim())
  const incompleteScores = []
  const totalScore = input.reduce((score, line) => {
    let processedLine = line
    try {
      while(processedLine.length > 0) {
        processedLine = processChunk(processedLine)
      }
      console.log(`${green(line)} - Valid`)
    } catch(ex) {
      if(ex instanceof IncompleteChunk) {
        const toAdd = repairLine(line)
        const score = scoreAdditions(toAdd)
        incompleteScores.push(score)
        console.log(`${red(line)}: ${(<Error>ex).message} (Add ${toAdd.join('')} for Score: ${green(score.toString())})`)
      }
      if(ex instanceof CorruptedChunk) {
        console.log(`${red(line)}: ${(<Error>ex).message}`)
        return score + SCORING[ex.char]
      }
    }
    return score
  }, 0)

  console.log(`Part 1: ${totalScore}`)

  const middleIdx = Math.floor(incompleteScores.length / 2)
  console.log(`Part 2: ${incompleteScores.sort((a, b) => a - b)[middleIdx]}`)
}

module.exports = day10

/*
{
  (
    [
      (
        <
          {}
          [
            <>
            []
          }>{[]{[(<()>
*/