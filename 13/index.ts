import { createCanvas } from "canvas";
import { green } from "colors/safe";
import { createWriteStream } from "fs";
import parseFile from "../util/parser";

type Paper = Coord[]
type Coord = {x: number, y: number}

function dedupCoords(list: Paper, coord: Coord): Paper {
  if(list.filter(c => c.x === coord.x && c.y === coord.y).length === 0) {
    list.push(coord)
  }
  return list
}

function foldPaperY(paper: Paper, yCoord: number): Paper {
  const result: Paper = paper.map(c => {
    if(c.y === yCoord) {
      throw new Error(`Point on the fold line! ${c} on y=${yCoord}`)
    }
    if(c.y > yCoord) {
      const diff = c.y - yCoord
      const newC = {
        x: c.x, y: yCoord - diff
      }
      return newC
    } else {
      return c
    }
  }).reduce(dedupCoords, [])

  return result
}

function foldPaperX(paper: Paper, xCoord: number): Paper {
  const result: Paper = paper.map(c => {
    if(c.x === xCoord) {
      throw new Error(`Point on the fold line! ${c} on x=${xCoord}`)
    }
    if(c.x > xCoord) {
      const diff = c.x - xCoord
      return {
        x: xCoord - diff, y: c.y
      }
    } else {
      return c
    }
  }).reduce(dedupCoords, [])

  return result
}

let DOT_SIZE = 2

enum Axis {
  x,
  y
}
type FoldLine = {
  axis: Axis
  coord: number
}
let IMG_INDEX = 0
type Extents = {
  maxX: number,
  minX: number,
  maxY: number,
  minY: number
}

let [imgWidth, imgHeight] = [0, 0]

function render(paper: Paper, foldLine?: FoldLine, allowScale: boolean = true) {
  console.log(green(`${paper.length} dots visible`))
  const extents: Extents = paper.reduce((memo, c) => {
    return {
      maxX: Math.max(c.x + 1, memo.maxX), 
      maxY: Math.max(c.y + 1, memo.maxY), 
      minX: Math.min(c.x, memo.minX), 
      minY: Math.min(c.y, memo.minY)
    }
  }, {maxX: 0, maxY: 0, minX: Number.MAX_SAFE_INTEGER, minY: Number.MAX_SAFE_INTEGER})
  console.log(extents)
  
  const [xOffset, yOffset] = [-extents.minX, -extents.minY]
  if(imgWidth === 0 && imgHeight === 0) {
    [imgWidth, imgHeight] = [DOT_SIZE * (extents.maxX + xOffset), DOT_SIZE * (extents.maxY + yOffset)]
  }
  let [width, height] = [DOT_SIZE * (extents.maxX + xOffset), DOT_SIZE * (extents.maxY + yOffset)]
  while(allowScale && width < imgWidth && height < imgHeight) {
    //scale it up!
    //will DOT_SIZE + 1 break everything?
    const [newWidth, newHeight] = [(DOT_SIZE + 1) * (extents.maxX + xOffset), (DOT_SIZE + 1) * (extents.maxY + yOffset)]
    if(newWidth > imgWidth || newHeight > imgHeight) {
      break
    }
    DOT_SIZE++
    [width, height] = [DOT_SIZE * (extents.maxX + xOffset), DOT_SIZE * (extents.maxY + yOffset)]
    render(paper, undefined, false)
  }
  const canvas = createCanvas(imgWidth, imgHeight)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, imgWidth, imgHeight)
  ctx.fillStyle = '#ffe591'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'black'
  paper.forEach(c => {
    ctx.fillRect((c.x + xOffset) * DOT_SIZE, (c.y + yOffset) * DOT_SIZE, DOT_SIZE, DOT_SIZE)
  })
  if(foldLine && foldLine.axis === Axis.x) {
    ctx.fillStyle = 'red'
    ctx.fillRect((foldLine.coord + xOffset) * DOT_SIZE, 0, DOT_SIZE, height)
  } else if(foldLine && foldLine.axis === Axis.y) {
    ctx.fillStyle = 'red'
    ctx.fillRect(0, (foldLine.coord + yOffset) * DOT_SIZE, width, DOT_SIZE)
  }
  
  return new Promise((res, rej) => {
    try {
      const outStream = createWriteStream(`13/img/day13-${IMG_INDEX++}.png`)
      canvas.createPNGStream().pipe(outStream)
      outStream.on('finish', res)
    } catch(ex) {
      rej(ex)
    }
  })
}

function day13(file: string) {
  const input = parseFile(file).map(x => x.trim())

  let paper: Paper = []

  let i = 0
  while(input[i].indexOf(',') >= 0) {
    try {
      const [x, y] = input[i].split(',').map(n => Number.parseInt(n))
      paper.push({x, y})
      i++
    } catch (ex) {
      console.log(`Error line ${i+1}: ${ex}`)
      throw ex
    }
    
  }
  console.log(`Read ${paper.length} coords`)
  
  const instructions: FoldLine[] = []
  while(i < input.length) {
    const [axisStr, coordStr] = input[i].split(' ')[2].split('=')
    instructions.push({
      axis: axisStr === 'x' ? Axis.x : Axis.y,
      coord: Number.parseInt(coordStr)
    })
    //console.log(instructions.slice(-1)[0])
    i++
  }

  instructions.forEach(inst => {
    render(paper, inst)
    console.log(`Folding at ${inst.axis == Axis.x ? 'x' : 'y'} = ${inst.coord}`)
    console.log()
    switch(inst.axis) {
      case Axis.x:
        paper = foldPaperX(paper, inst.coord)
        break
      case Axis.y:
        paper = foldPaperY(paper, inst.coord)
        break
    }
  })

  render(paper)
}

module.exports = day13