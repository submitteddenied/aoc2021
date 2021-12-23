import { createCanvas } from "canvas"
import { createWriteStream } from "fs"
import { Coord } from "../util/2dgrid"
import { zeroPad } from "../util/numbers"
import parseFile from "../util/parser"

type Cave = number[][]

function neighborsInBounds(coord: Coord, maxCoord: Coord): Coord[] {
  return coord.neighbors(false).filter(c => c.x <= maxCoord.x && c.y <= maxCoord.y && c.x >= 0 && c.y >= 0)
}

function notIn(list: Coord[]): (c: Coord) => boolean {
  return (c: Coord) => {
    return list.find(s => s.equals(c)) === undefined
  }
}

interface Path {
  cost: number
  fringe: Coord
  track: Coord[]
}

function costAt(c: Coord, cave: Cave): number {
  const stepsX = Math.floor(c.x / cave[0].length)
  const stepsY = Math.floor(c.y / cave.length)
  const [x, y] = [c.x % cave[0].length, c.y % cave.length]

  let score = cave[y][x] + stepsX + stepsY
  while(score > 9) {
    score -= 9
  }

  return score
}

function distance(a: Coord, b: Coord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

let INDEX = 1
function render(cave: Cave, end: Coord, seen: Coord[], path: Path): Promise<void> {
  const PIXEL_SIZE = 1
  const COLORS = [
    "#fef2f2",
    "#fee2e2",
    "#fecaca",
    "#fca5a5",
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#991b1b",
    "#7f1d1d",
  ]
  const SEEN_COLORS = [
    "#fafaf9",
    "#f5f5f4",
    "#e7e5e4",
    "#d6d3d1",
    "#a8a29e",
    "#78716c",
    "#57534e",
    "#44403c",
    "#292524",
    "#1c1917",
  ]
  const PATH_COLOR = "#fde68a"
  const canvas = createCanvas((end.x + 1) * PIXEL_SIZE, (end.y + 1) * PIXEL_SIZE)
  const ctx = canvas.getContext('2d')
  for(let y = 0; y < end.y; y++) {
    for(let x = 0; x < end.x; x++) {
      const coord = new Coord(x, y)
      if(path.track.find(c => c.equals(coord))) {
        ctx.fillStyle = PATH_COLOR
      } else if(seen.find(c => c.equals(coord))) {
        ctx.fillStyle = SEEN_COLORS[costAt(coord, cave)]  
      } else {
        ctx.fillStyle = COLORS[costAt(coord, cave)]
      }
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
    }
  }

  return new Promise((res, rej) => {
    const outStream = createWriteStream(`15/img/path-${end.x}x${end.y}-${INDEX++}.png`)
    canvas.createPNGStream().pipe(outStream)
    outStream.on('finish', res)
  })
}

function minPath(end: Coord, cave: Cave): Promise<Path> {
  const seen: Coord[] = []
  const p = []
  let fringe: Path[] = [
    {cost: 0, fringe: new Coord(0, 0), track:[new Coord(0, 0)]}
  ]

  while(fringe.length > 0) {
    fringe = fringe.sort((a, b) => {
      return (a.cost + distance(a.fringe, end)) - (b.cost + distance(b.fringe, end))
    })
    const item = fringe.shift()
    if(item === undefined) {
      throw new Error()
    }
    if(item.fringe.equals(end)) {
      p.push(render(cave, end, seen, item))
      return Promise.all(p).then(() => item)
    }
    //console.log(`Exploring! ${JSON.stringify(item)}`)
    seen.push(item.fringe)

    const neighbors = neighborsInBounds(item.fringe, end).filter(notIn(seen)).filter(notIn(fringe.map(x => x.fringe)))
    neighbors.forEach(n => {
      const cost = costAt(n, cave)
      const nextP: Path = {
        cost: item.cost + cost,
        fringe: n,
        track: item.track.concat([n])
      }
      p.push(render(cave, end, seen.concat([]), nextP))
      fringe.push(nextP)
    })
  }
  throw new Error('???')
}

function day15(file: string) {
  const input = parseFile(file).map(x => x.trim())

  const cave: Cave = input.map(l => l.split('').map(n => Number.parseInt(n)))

  const minRiskToGoal: Cave = cave.map(l => l.map(x => Number.MAX_SAFE_INTEGER))
  const end = new Coord(cave.length - 1, cave[0].length - 1)
  minRiskToGoal[end.y][end.x] = cave[end.y][end.x]

  for(let y = cave.length - 1; y >= 0; y--) {
    for(let x = cave.length - 1; x >= 0; x--) {
      if(x === cave.length - 1 && y === cave.length - 1) {
        continue
      }

      const neighbors = neighborsInBounds(new Coord(x, y), end)
      let minVal = Number.MAX_SAFE_INTEGER
      neighbors.forEach(n => {
        const neighborVal = minRiskToGoal[n.y][n.x]
        if(neighborVal === Number.MAX_SAFE_INTEGER) {
          return
        }
        const thisTotal = neighborVal + ((x === 0 && y === 0) ? 0 : cave[y][x])
        minVal = Math.min(thisTotal, minVal)
      })

      minRiskToGoal[y][x] = minVal
    }
  }

  for(let y = 0; y < 5; y++) {
    const line = []
    for(let x = 0; x < 5; x++) {
      line.push(costAt(new Coord(x * cave.length, y * cave.length), cave))
    }
    console.log(line.join(' '))
  }
  return

  console.log(`Part 1: ${minRiskToGoal[0][0]}`)
  minPath(end, cave).then(p1 => {
    console.log(`Part 1: ${JSON.stringify(p1)}`)

    const p2End = new Coord((cave.length * 5) - 1, (cave.length * 5) - 1)
    return minPath(p2End, cave)
  }).then(p2 => {
    console.log(`Part 2: ${JSON.stringify(p2.cost)}`)
  })
  
  /*
  const p2Seen: Coord[] = []
  let fringe: Path[] = [
    {cost: 0, fringe: new Coord(0, 0), track:[]}
  ]

  while(fringe.length > 0) {
    fringe = fringe.sort((a, b) => {
      return (a.cost + distance(a.fringe, p2End)) - (b.cost + distance(b.fringe, p2End))
    })
    const item = fringe.shift()
    if(item === undefined) {
      throw new Error()
    }
    if(item.fringe.equals(p2End)) {
      console.log(`P2 Result: ${JSON.stringify(item)}`)
      break
    }
    //console.log(`Exploring! ${JSON.stringify(item)}`)
    p2Seen.push(item.fringe)

    const neighbors = neighborsInBounds(item.fringe, p2End).filter(notIn(p2Seen)).filter(notIn(fringe.map(x => x.fringe)))
    neighbors.forEach(n => {
      const cost = costAt(n, cave)
      fringe.push({
        cost: item.cost + cost,
        fringe: n,
        track: item.track.concat([cost])
      })
    })
  }
  */
}

module.exports = day15