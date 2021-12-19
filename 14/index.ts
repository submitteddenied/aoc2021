import parseFile from "../util/parser";

type Polymerization = {[pair: string]: string}
type ElementCount = {[letter: string]: bigint}
function polymerize(input: string, rules: Polymerization): string {
  let result = ''
  for(let i = 0; i < input.length - 1; i++) {
    result += input[i]
    const pair = input.slice(i, i + 2)
    if(rules[pair]) {
      result += rules[pair]
    }
  }
  result += input[input.length - 1]

  return result
}

const memos: {[p: string]: ElementCount} = {}

function startRecursive(input: string, rules: Polymerization, depth: number): ElementCount {
  const initialCount = input.split('').reduce(countChar, {})
  if(depth === 0) {
    return initialCount
  }
  return sumCounts(recursivePoly(input, rules, depth), initialCount)
}

function recursivePoly(input: string, rules:Polymerization, depth: number): ElementCount {
  const memoKey = `${input}-${depth}`
  if(memos[memoKey]) {
    //console.log(`Using ${memoKey} = ${countToString(memos[memoKey])}`)
    return memos[memoKey]
  }
  //for each pair of letters in input
  let result: ElementCount = {}
  for(let i = 0; i < input.length - 1; i++) {
    let pair = input.slice(i, i + 2)
    //if there's a rule for this pair
    if(rules[pair]) {
      const letter = rules[pair]
      pair = pair[0] + letter + pair[1]
      //add the new letter to the result
      result = sumCounts({[letter]: 1n}, result)
      //if we need to go deeper
      if(depth > 0) {
        //add the new letters from the depths
        const subResult = Object.assign({}, recursivePoly(pair, rules, depth - 1))
        result = sumCounts(subResult, result)
      }
    }
  }

  memos[memoKey] = Object.assign({}, result)
  return result
}

function sumCounts(counts: ElementCount, count: ElementCount): ElementCount {
  Object.keys(count).forEach(letter => {
    if(counts[letter] === undefined) {
      counts[letter] = count[letter]
    } else {
      counts[letter] = count[letter] + counts[letter]
    }
  })
  
  return counts
}

function countChar(counts: ElementCount, letter: string): ElementCount {
  if(counts[letter] === undefined) {
    counts[letter] = 1n
  } else {
    counts[letter] += 1n
  }

  return counts
}

function sortCounts(counts: ElementCount): [l: string, n: bigint][] {
  return Object.entries(counts).sort(([_, a], [__, b]) =>  (a < b) ? -1 : ((a > b) ? 1 : 0))
}

function countToString(counts: ElementCount): string {
  const sorted = Object.entries(counts).sort(([_, a], [__, b]) =>  (a < b) ? -1 : ((a > b) ? 1 : 0))
  return '{' 
    + sorted.map(([letter, count]) => `"${letter}": ${count}`).join(', ') 
    + '}'
}

function day14(file: string) {
  const input = parseFile(file).map(x => x.trim())

  const initial = input[0]
  const rules: Polymerization = {}
  
  for(let i = 1; i < input.length; i++) {
    const [pair, insertion] = input[i].split(' -> ')
    rules[pair] = insertion
  }

  let polymer = initial
  console.log(`Template:     ${polymer}`)
  console.log(`${countToString(startRecursive(initial, rules, 0))} vs ${countToString(polymer.split('').reduce(countChar, {}))}`)
  console.log(`${countToString(startRecursive(initial, rules, 1))}`)
  let i = 1
  for(i; i <= 10; i++) {
    if(i < 20) {
      polymer = polymerize(polymer, rules)
    
      if(polymer.length < 50) {
        console.log(`After step ${i}: ${polymer}`)
      }
      console.log(`${countToString(startRecursive(initial, rules, i - 1))} vs ${countToString(polymer.split('').reduce(countChar, {}))}`)
    } else {
      console.log(i)
      console.log(`Step ${i}: ${countToString(startRecursive(initial, rules, i - 1))}`)
    }
  }

  const counts = polymer.split('').reduce(countChar, {})
  const sorted = sortCounts(counts)
  sorted.forEach(([letter, count]) => console.log(`${letter}: ${count}`))
  const result = sorted[sorted.length - 1][1] - sorted[0][1]
  console.log(`${sorted[sorted.length - 1][0]} - ${sorted[0][0]} = ${result}`)

  const part2 = startRecursive(initial, rules, 40 - 1)
  console.log(countToString(part2))
  const p2Sort = sortCounts(part2)
  const result2 = p2Sort[p2Sort.length - 1][1] - p2Sort[0][1]
  console.log(`${p2Sort[p2Sort.length - 1][0]} - ${p2Sort[0][0]} = ${result2}`)
}

module.exports = day14