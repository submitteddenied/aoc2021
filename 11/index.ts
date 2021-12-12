import { createCanvas } from "canvas"
import { bgWhite, grey, white } from "colors/safe"
import { createWriteStream } from "fs"
import parseFile from "../util/parser"

type OctopusMap = number[][]
type Coord = {x: number, y: number}

const IMAGE_W = 720

class Cave {
  map: OctopusMap
  prevFlashes: Coord[]
  constructor(input: string[]) {
    this.map = input.map(line => {
      return line.split('').map(x => Number.parseInt(x))
    })
    this.prevFlashes = []
  }

  isInBounds(coord: Coord): boolean {
    return (coord.x >= 0 && coord.x < this.map[0].length) &&
           (coord.y >= 0 && coord.y < this.map.length)
  }

  step(): Coord[] {
    //first increment all
    const nextMap = this.map.map(row => {
      return row.map(c => c + 1)
    })

    let flashed = true
    this.prevFlashes = []
    while(flashed) {
      flashed = false
      for(let y = 0; y < nextMap.length; y++) {
        for(let x = 0; x < nextMap.length; x++) {
          if(nextMap[y][x] > 9) {
            flashed = true
            this.prevFlashes.push({x, y})
            nextMap[y][x] = NaN //sentinel to prevent re-flashing
            //increment all neighbors
            neighbors({x, y}).filter(c => this.isInBounds(c)).forEach(coord => {
              nextMap[coord.y][coord.x]++
            })
          }
        }
      }
    }

    //reset NaNs to 0
    for(let y = 0; y < nextMap.length; y++) {
      for(let x = 0; x < nextMap.length; x++) {
        if(Number.isNaN(nextMap[y][x])) {
          nextMap[y][x] = 0
        }
      }
    }
    this.map = nextMap

    return this.prevFlashes
  }

  toString(): string[] {
    return this.map.map(row => {
      return row.join('')
    })
  }

  /**
   * Draws a PNG of the cave and saves it at the given path
   * @param path 
   */
  render(path: string): Promise<void> {
    const canvas = createCanvas(IMAGE_W, IMAGE_W)
    const ctx = canvas.getContext('2d')
    ctx.font = 'monospaced'
    const boxSize = IMAGE_W / this.map.length //depends on square map
    for(let y = 0; y < this.map.length; y++) { 
      for(let x = 0; x < this.map[y].length; x++) {
        if(this.prevFlashes.find(c => c.x === x && c.y === y) !== undefined) {
          ctx.fillStyle = 'hsl(0, 0%, 100%)'
        } else {
          const brightness = Math.min(this.map[y][x], 9) * 8
          ctx.fillStyle = `hsl(0, 0%, ${brightness}%)`
        }
        ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize)
      }
    }

    return new Promise((res, rej) => {
      try {
        const outStream = createWriteStream(path)
        canvas.createPNGStream().pipe(outStream)
        outStream.on('finish', res)
      } catch(ex) {
        rej(ex)
      }
    })
  }
}


function neighbors(coord: Coord): Coord[] {
  const result: Coord[] = []
  for(let x = -1; x <= 1; x++) {
    for(let y = -1; y <= 1; y++) {
      if(x === 0 && y === 0) {
        continue
      }
      result.push({
        x: coord.x + x,
        y: coord.y + y
      })
    }
  }
  return result
}

function zeroPad(n: number, l: number): string {
  let result = '' + n
  while(result.length < l) {
    result = '0' + result
  }

  return result
}

function day11(file: string) {
  const input = parseFile(file).map(x => x.trim())
  const map = new Cave(input)

  let sum = 0
  let prevFlashed: Coord[] = []
  for(let i = 0; i < 100; i++) {
    if(i == 2) {
      console.log(`Step ${i}`)
    
      for(let y = 0; y < map.map.length; y++) {
        const line = []
        for(let x = 0; x < map.map[y].length; x++) {
          if(prevFlashed.find(c => c.x === x && c.y === y) !== undefined) {
            line.push(bgWhite(grey(map.map[y][x].toString())))
          } else {
            line.push(map.map[y][x].toString())
          }
        }
        console.log(line.join(''))
      }
      console.log()
      
    }
    prevFlashed = map.step()
    sum += prevFlashed.length
  }

  console.log(`Part 1: ${sum}`)

  prevFlashed = []
  let step = 0
  const p2Map = new Cave(input)
  p2Map.render(__dirname + `/img/step-${zeroPad(step, 4)}.png`)
  while(prevFlashed.length != p2Map.map.length * p2Map.map.length) {
    prevFlashed = p2Map.step()
    step++
    p2Map.render(__dirname + `/img/step-${zeroPad(step, 4)}.png`)
  }

  console.log(`Part 2: ${step}`)
}

module.exports = day11