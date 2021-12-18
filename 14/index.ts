import parseFile from "../util/parser";

type Polymerization = {[pair: string]: string}
type ElementCount = {[letter: string]: number}
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

function recursivePoly(input: string, rules:Polymerization, depth: number): ElementCount {
  let result: ElementCount = {}
  if(memos[input] !== undefined) {
    return memos[input]
  }
  if(depth === 0) {
    //console.log(`Depth 0: ${input}`)
    if(rules[input]) {
      result[rules[input]] = 1
    }

    //don't count the last char, it's the first of the next pair
    const answer = input.slice(0, -1).split('').reduce(countChar, result)
    memos[input] = answer
    return answer
  }

  for(let i = 0; i < input.length; i++) {
    let pair = input.slice(i, i + 2)
    if(rules[pair]) {
      pair = pair[0] + rules[pair] + pair[1]
    }
    const sub = recursivePoly(pair, rules, depth - 1)
    result = sumCounts(result, sub)
  }
  //also count the last char, it's not counted in the subs
  // const last = input[input.length - 1]
  // if(result[last]) {
  //   result[last] += 1
  // } else {
  //   result[last] = 1
  // }

  //console.log(`Result at depth=${depth}: ${JSON.stringify(result)}`)

  return result
}

function sumCounts(counts: ElementCount, count: ElementCount): ElementCount {
  Object.keys(count).forEach(letter => {
    if(counts[letter] === undefined) {
      counts[letter] = count[letter]
    } else {
      counts[letter] += count[letter]
    }
  })
  
  return counts
}

function countChar(counts: ElementCount, letter: string): ElementCount {
  if(counts[letter] === undefined) {
    counts[letter] = 1
  } else {
    counts[letter] += 1
  }

  return counts
}

function sortCounts(counts: ElementCount): [l: string, n: number][] {
  return Object.entries(counts).sort(([_, countA], [__, countB]) => countA - countB)
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
  let i = 1
  for(i; i <= 10; i++) {
    polymer = polymerize(polymer, rules)
    if(polymer.length < 50) {
      console.log(`After step ${i}: ${polymer}`)
      console.log(`${JSON.stringify(recursivePoly(initial, rules, i))} vs ${JSON.stringify(polymer.split('').reduce(countChar, {}))}`)
    }
  }

  const counts = polymer.split('').reduce(countChar, {})
  const sorted = sortCounts(counts)
  sorted.forEach(([letter, count]) => console.log(`${letter}: ${count}`))
  const result = sorted[sorted.length - 1][1] - sorted[0][1]
  console.log(`${sorted[sorted.length - 1][0]} - ${sorted[0][0]} = ${result}`)

  //console.log(`${JSON.stringify(recursivePoly(initial, rules, 0))}`)
  console.log(`${JSON.stringify(recursivePoly(initial, rules, 10))}`)
  const p2Counts = recursivePoly(initial, rules, 40)
  sortCounts(p2Counts).forEach(([letter, count]) => console.log(`${letter}: ${count}`))
  console.log(JSON.stringify(memos))
}

module.exports = day14