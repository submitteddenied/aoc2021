import parseFile from "../util/parser"
import { Coord, Range } from '../util/2dgrid' 
import { yellow } from "colors/safe"
import { createCanvas } from "canvas"
import { createWriteStream } from "fs"

type PixelMap = {
    [coord: string]: boolean
}

interface Image {
    extents: Range
    pixels: PixelMap
}

function rangeToIndex(r: Range, image: Image, outOfBoundsState: boolean): number {
    // const temp: Image = {
    //     extents: r,
    //     pixels: image.pixels
    // }
    //console.log(r.toString())
    //render(temp)
    
    const numStr = r.coords().map(c => {
        const result = image.pixels[c.toString()]
        if(result === undefined) {
            return outOfBoundsState
        }
        return result
    }).map(i => i ? '1' : '0').join('')
    //console.log(`Read ${numStr} (${Number.parseInt(numStr, 2)})`)
    
    return Number.parseInt(numStr, 2)
}

function nextValueForCoord(c: Coord, prevImage: Image, rules: string, outOfBoundsState: boolean): boolean {
    //create range centered on coord
    const r = new Range(c.sub(new Coord(1, 1)), c.add(new Coord(1, 1)))
    const nextValIndex = rangeToIndex(r, prevImage, outOfBoundsState)
    //console.log(`Next value for ${c.toString()}: ${rules[nextValIndex]}`)

    //console.log('')
    return rules[nextValIndex] === '#'
}

function stepImage(image: Image, rules: string, outOfBoundsState: boolean): Image {

    const toProcess = new Range(image.extents.topLeft.sub(new Coord(1, 1)), image.extents.bottomRight.add(new Coord(1, 1)))

    const nextPixels: [Coord, boolean][] = toProcess.coords().map(c => [c, nextValueForCoord(c, image, rules, outOfBoundsState)])

    const result: Image = {
        extents: toProcess,
        pixels: {}
    }

    result.pixels = nextPixels.reduce<PixelMap>((i, [coord, val]) => {
        i[coord.toString()] = val
        return i
    }, {})

    return result
}

let INDEX = 1
function render(image: Image, r?: Range, outsideState: boolean = false): Promise<void> {
    if(r === undefined) {
        r = image.extents
    }
    const PIXEL_SIZE = 5
    const COLORS = {
        DARK: '#334155', //slate_700
        LIT: '#e2e8f0', //slate_200
        LIT_OUTSIDE: '#94a3b8' //slate_400
    }
    const [w, h] = [r.bottomRight.x - r.topLeft.x, r.bottomRight.y - r.topLeft.y]
    const [xOffset, yOffset] = [r.topLeft.x, r.topLeft.y]
    const canvas = createCanvas(w * PIXEL_SIZE, h * PIXEL_SIZE)
    const ctx = canvas.getContext('2d')
    const outsideColor = outsideState ? COLORS.LIT_OUTSIDE : COLORS.DARK
    ctx.fillStyle = outsideColor
    ctx.fillRect(0, 0, w * PIXEL_SIZE, h * PIXEL_SIZE)
    for(let y = r.topLeft.y; y <= r.bottomRight.y; y++) {
        //const line = []
        for(let x = r.topLeft.x; x <= r.bottomRight.x; x++) {
            const coord = new Coord(x, y)

            if(image.pixels[coord.toString()] === undefined) {
                //line.push(outsideState ? yellow('#') : '.')
            } else {
                //line.push(image.pixels[coord.toString()] ? yellow('#') : '.')
                ctx.fillStyle = image.pixels[coord.toString()] ? COLORS.LIT : COLORS.DARK
                ctx.fillRect((x - xOffset) * PIXEL_SIZE, (y - yOffset) * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
        }
        //console.log(line.join(''))
    }

    return new Promise((res, rej) => {
        const outStream = createWriteStream(`20/img/img-${INDEX++}.png`)
        canvas.createPNGStream().pipe(outStream)
        outStream.on('finish', res)
    })
}

function day20(file: string) {
    const input = parseFile(file).map(x => x.trim())
    
    const rules = input[0]

    const image: Image = {
        extents: new Range(new Coord(0, 0), new Coord(0, 0)),
        pixels: {}
    }
    for(let y = 0; y < input.length - 1; y++) {
        const line = input[y + 1]
        for(let x = 0; x < line.length; x++) {
            if(line[x] === '#') {
                const coord = new Coord(x, y)
                image.pixels[coord.toString()] = true
                if(x < image.extents.topLeft.x) {
                    image.extents.topLeft.x = x
                } else if(x > image.extents.bottomRight.x) {
                    image.extents.bottomRight.x = x
                }
                if(y < image.extents.topLeft.y) {
                    image.extents.topLeft.y = y
                } else if(y > image.extents.bottomRight.y) {
                    image.extents.bottomRight.y = y
                }
            }
        }
    }
    let current = image
    let outsideState = false
    const LOOP_COUNT = 50
    const expansion = new Coord(LOOP_COUNT+2, LOOP_COUNT+2)
    const finalExtents = new Range(image.extents.topLeft.sub(expansion), image.extents.bottomRight.add(expansion))
    const renders = []

    renders.push(render(current, finalExtents, outsideState))
    const c = Object.values(current.pixels).filter(v => v).length
    console.log(`Lit: ${c}`)
    for(let i = 0; i < LOOP_COUNT; i++) {
        current = stepImage(current, rules, outsideState)
        if(rules[0] === '#' && outsideState === false) {
            outsideState = true
        } else if(rules[rules.length - 1] === '.' && outsideState === true) {
            outsideState = false
        }
        console.log('')
        console.log(`Step ${i + 1}`)
        renders.push(render(current, finalExtents, outsideState))
        const count = Object.values(current.pixels).filter(v => v).length
        console.log(`Lit: ${count}${outsideState ? ' (+infinity)': ''}`)
    }

    console.log(`Processing done, finishing renders...`)
    Promise.all(renders).then(() => {
        console.log(`Renders done!`)
    })
}

module.exports = day20 