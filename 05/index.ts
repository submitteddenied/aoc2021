import parseFile from "../util/parser"

class Coordinate {
  x: number
  y: number
  constructor(_x: number, _y: number) {
    this.x = _x
    this.y = _y
  }

  static fromString(str: string): Coordinate {
    const [x, y] = str.trim().split(',').map(n => Number.parseInt(n))
    return new Coordinate(x, y)
  }

  toString(): string {
    return `${this.x},${this.y}`
  }
}

function numbersBetween(a: number, b: number): number[] {
  if(a === b) {
    return [a] //inclusive!
  }
  const result = []
  if(a < b) {
    for(let i = a; i <= b; i++) {
      result.push(i)
    }
  } else {
    for(let i = a; i >= b; i--) {
      result.push(i)
    }
  }

  return result
}

class Line {
  start: Coordinate
  end: Coordinate

  constructor(line: string) {
    const coordStrs = line.split(' -> ')
    this.start = Coordinate.fromString(coordStrs[0])
    this.end = Coordinate.fromString(coordStrs[1])
  }

  isHorizontalOrVertical(): boolean {
    return this.start.x === this.end.x ||
           this.start.y === this.end.y
  }

  coveredCoords(): Coordinate[] {
    const dx = this.end.x - this.start.x
    const dy = this.end.y - this.start.y
    if(dx === 0) {
      return numbersBetween(this.start.y, this.end.y).map(n => new Coordinate(this.start.x, n))
    }
    if(dy === 0) {
      return numbersBetween(this.start.x, this.end.x).map(n => new Coordinate(n, this.start.y))
    }
    if(Math.abs(dx) === Math.abs(dy)) {
      const xs = numbersBetween(this.start.x, this.end.x)
      const ys = numbersBetween(this.start.y, this.end.y)
      if(xs.length !== ys.length) {
        throw new Error(`Different number of xs (${xs.length}) than ys (${ys.length}): line=${this.toString()} dy=${dy} dx=${dx}`)
      }
      const result = []
      for(let i = 0; i < xs.length; i++) {
        result.push(new Coordinate(xs[i], ys[i]))
      }
      return result
    }

    throw new Error(`dy or dx is not 0 AND dx !== dy: line=${this.toString()} dy=${dy} dx=${dx}`)
  }

  toString(): string {
    return `${this.start.toString()} -> ${this.end.toString()}`
  }
}

type Map = {[x: string]: {[y: string]: number}}

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function printMap(map: Map, minX: number, maxX: number, minY: number, maxY: number) {
  for(let i = minY; i <= maxY; i++) {
    let row = ''
    for(let j = minX; j <= maxX; j++) {
      if(map[j] === undefined) {
        row += '.'
        continue
      }
      if(map[j][i] === undefined) {
        row += '.'
        continue
      }
      if(map[j][i] >= CHARS.length) {
        throw new Error(`Value ${map[j][i]} is outside bounds (${CHARS.length})`)
      }
      row += CHARS[map[j][i]]
    }
    console.log(row)
  }
}

function day5(file: string) {
  const input = parseFile(file).map(x => x.trim())

  const lines = input.map(l => new Line(l)) //.filter(l => l.isHorizontalOrVertical())

  const map: Map = {}
  let minX: number = Number.MAX_SAFE_INTEGER
  let maxX: number = Number.MIN_SAFE_INTEGER
  let minY: number = Number.MAX_SAFE_INTEGER
  let maxY: number = Number.MIN_SAFE_INTEGER

  lines.forEach(line => {
    //console.log(`Processing line ${line.toString()}`)
    const coords = line.coveredCoords()
    //console.log(`  ${JSON.stringify(coords.map(c => c.toString()))}`)
    coords.forEach(c => {
      if(c.x < minX) minX = c.x
      if(c.x > maxX) maxX = c.x
      if(c.y < minY) minY = c.y
      if(c.y > maxY) maxY = c.y
      if(map[c.x] === undefined) {
        map[c.x] = {}
      }
      if(map[c.x][c.y] === undefined) {
        map[c.x][c.y] = 0
      }
      map[c.x][c.y] += 1
    })
  })
  console.log(`Processed ${lines.length} lines`)

  //count entries in map > 1
  const result = Object.keys(map).reduce((sum, xCoord) => {
    const colSum = Object.values(map[xCoord]).filter(x => x > 1).length
    return colSum + sum
  }, 0)

  //printMap(map, minX, maxX, minY, maxY)
  console.log(`Result: ${result}`)
}

module.exports = day5