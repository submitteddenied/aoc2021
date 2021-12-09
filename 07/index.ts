import parseFile from "../util/parser"

function sumUnder(x: number): number {
  let result = 0
  while(x > 0) {
    result += x
    x--
  }

  return result
}

function fuelCost(positions: number[], target: number): number {
  return positions.reduce((total, pos) => total + sumUnder(Math.abs(pos - target)), 0)
}

function simpleFuelCost(positions: number[], target: number): number {
  return positions.reduce((total, pos) => total + (Math.abs(pos - target)), 0)
}

function day7(file: string) {
  const input = parseFile(file).map(x => x.trim())
  const initialPositions = input[0].split(',').map(i => Number.parseInt(i))

  const max = Math.max(...initialPositions)
  const min = Math.min(...initialPositions)

  let minFuel = Number.MAX_SAFE_INTEGER
  let minI = 0
  let p2MinFuel = Number.MAX_SAFE_INTEGER
  let p2MinI = 0
  for(let i = min; i <= max; i++) {
    const cost = simpleFuelCost(initialPositions, i)
    if(cost < minFuel) {
      minFuel = cost
      minI = i
    }
    const p2Cost = fuelCost(initialPositions, i)
    if(p2Cost < p2MinFuel) {
      p2MinFuel = p2Cost
      p2MinI = i
    }
  }

  if(process.env['DEBUG']) {
    initialPositions.forEach(p => {
      console.log(`Move ${p} => ${minI}: ${Math.abs(p - minI)} fuel // ${p} => ${p2MinI}: ${sumUnder(Math.abs(p - p2MinI))} fuel`)
    })
  }
  
  console.log(`Part 1 - Target: ${minI}; Cost: ${minFuel}`)
  console.log(`Part 2 - Target: ${p2MinI}; Cost: ${p2MinFuel}`)
}
module.exports = day7