import colors from "colors/safe"
import parseFile from "../util/parser"

interface HeightPoint {
  row: number
  col: number
}

function neighbors(map: number[][],point: HeightPoint): HeightPoint[] {
  const results = []

  if(point.row > 0) {
    results.push({row: point.row - 1, col: point.col})
  }
  if(point.row < map.length - 1) {
    results.push({row: point.row + 1, col: point.col})
  }
  if(point.col > 0) {
    results.push({row: point.row, col: point.col - 1})
  }
  if(point.col < map[point.row].length - 1) {
    results.push({row: point.row, col: point.col + 1})
  }

  return results
}

function regionSize(map: number[][], startPoint: HeightPoint): HeightPoint[] {
  const fringe = [startPoint]
  const seen: HeightPoint[] = []
  while(fringe.length > 0) {
    const thisPoint = <HeightPoint>fringe.shift()
    if(map[thisPoint.row][thisPoint.col] === 9) {
      continue
    }
    if(seen.find(x => x.col === thisPoint.col && x.row === thisPoint.row) !== undefined) {
      continue
    }
    seen.push(thisPoint)

    fringe.push(...neighbors(map, thisPoint))
  }

  return seen
}

function day9(file: string) {
  const input = parseFile(file).map(x => x.trim())

  const heightMap: number[][] = input.map(line => {
    return line.split('').map(x => Number.parseInt(x))
  })

  const lowPoints: HeightPoint[] = []
  for(let row = 0; row < heightMap.length; row++) {
    const line = []
    for(let col = 0; col < heightMap[row].length; col++) {
      const thisHeight = heightMap[row][col]
      const n = neighbors(heightMap, {row, col})
      let lowPoint = n.find(x => heightMap[x.row][x.col] <= thisHeight) === undefined

      if(lowPoint) {
        lowPoints.push({
          row, col
        })
        line.push(colors.blue(thisHeight.toString()))
      } else {
        if(thisHeight === 9) {
          line.push(' ')//red(thisHeight.toString()))
        } else {
          line.push(colors.yellow(heightMap[row][col].toString()))
        }
      }  
    }
    //console.log(line.join(''))
  }

  lowPoints.forEach(point => {
    //console.log(` - [${point.row}, ${point.col}]: ${point.height}`)
  })

  const p1Result = lowPoints.reduce((sum, point) => {
    return sum + heightMap[point.row][point.col] + 1
  }, 0)
  console.log(`Part 1: ${p1Result}`)

  const output: string[][] = []
  for(let row = 0; row < heightMap.length; row++) {
    const line = []
    for(let col = 0; col < heightMap[row].length; col++) {
      line.push(colors.black(heightMap[row][col].toString()))
    }
    output.push(line)
  }
  const regions = lowPoints.map(p => regionSize(heightMap, p))  
  //console.log(JSON.stringify(regions, null, 2))
  const colorList = [
    colors.red,
    colors.green,
    colors.yellow,
    colors.blue,
    colors.magenta,
    colors.cyan,
    colors.bgGreen,
    colors.bgRed
  ]

  for(let i = 0; i < regions.length; i++) {
    const thisColor = colorList[i % colorList.length]
    regions[i].forEach(p => {
      const char = heightMap[p.row][p.col].toString()
      
      output[p.row][p.col] = thisColor(char)
    })
  }

  output.forEach(l => console.log(l.join('') + colors.reset('')))
  const sizes = regions.map(r => r.length).sort((a, b) => a - b)
  console.log(`Smallest: ${JSON.stringify(sizes.slice(0, 3))}; Largest: ${JSON.stringify(sizes.slice(-3, undefined))}`)
  console.log(`Result: ${sizes.slice(-3, undefined).reduce((x, y) => x * y, 1)}`)
}

module.exports = day9