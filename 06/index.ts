import parseFile from "../util/parser";

const RESET_TIMER = 6
const NEW_FISH_TIMER = 8
const DAYS = 256

// Map of ages to count of fish at that age
interface AgeMap {
  [timer: number]: number
}

function processDay(ages: AgeMap): AgeMap {
  const result: AgeMap = {}
  let newFish = 0
  for(let i = 0; i <= NEW_FISH_TIMER /*inclusive*/; i++) {
    if(ages[i] !== undefined) {
      if(i === 0) {
        //these fish spawn new fish
        newFish = ages[i]
        if(result[RESET_TIMER] === undefined) {
          result[RESET_TIMER] = 0
        }
        result[RESET_TIMER] += ages[i]
      } else {
        if(result[i - 1] === undefined) {
          result[i - 1] = 0
        }
        result[i - 1] += ages[i]
      }
    }
  }
  if(newFish > 0) {
    result[NEW_FISH_TIMER] = newFish
  }

  return result
}

function day6(file: string) {
  const input = parseFile(file).map(x => x.trim())
  const initialTimers = input[0].split(',').map(i => Number.parseInt(i))
  const ages: AgeMap = initialTimers.reduce((memo, i) => {
    if(memo[i] === undefined) {
      memo[i] = 0
    }
    memo[i]++
    return memo
  }, <AgeMap>{})

  let p1Ages = Object.assign({}, ages)
  for(let day = 0; day < 80; day++) {
    //console.log(JSON.stringify(ages))
    p1Ages = processDay(p1Ages)
  }
  //console.log(JSON.stringify(ages))
  const p1Result = Object.values(p1Ages).reduce((s, i) => s + i, 0)
  console.log(`Part 1 Total fish: ${p1Result}`)

  let p2Ages = Object.assign({}, ages)
  for(let day = 0; day < 256; day++) {
    //console.log(JSON.stringify(ages))
    p2Ages = processDay(p2Ages)
  }

  const p2Result = Object.values(p2Ages).reduce((s, i) => s + i, 0)
  console.log(`Part 2 Total fish: ${p2Result}`)
}

module.exports = day6