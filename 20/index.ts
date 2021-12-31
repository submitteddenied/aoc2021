import parseFile from "../util/parser"
import { Coord, Range } from '../util/2dgrid' 
import { yellow } from "colors/safe"

type PixelMap = {
    [coord: string]: boolean
}

interface Image {
    extents: Range
    pixels: PixelMap
}

function rangeToIndex(r: Range, image: Image): number {
    const temp: Image = {
        extents: r,
        pixels: image.pixels
    }
    const numStr = r.coords().map(c => image.pixels[c.toString()]).map(i => i ? '1' : '0').join('')

    return Number.parseInt(numStr, 2)
}

function nextValueForCoord(c: Coord, prevImage: Image, rules: string): boolean {
    //create range centered on coord
    const r = new Range(c.sub(new Coord(1, 1)), c.add(new Coord(1, 1)))
    const nextValIndex = rangeToIndex(r, prevImage)

    return rules[nextValIndex] === '#'
}

function stepImage(image: Image, rules: string): Image {

    const toProcess = new Range(image.extents.topLeft.sub(new Coord(1, 1)), image.extents.bottomRight.add(new Coord(1, 1)))

    const nextPixels: [Coord, boolean][] = toProcess.coords().map(c => [c, nextValueForCoord(c, image, rules)])

    const result: Image = {
        extents: new Range(new Coord(0, 0), new Coord(0, 0)),
        pixels: {}
    }

    result.pixels = nextPixels.reduce<PixelMap>((i, [coord, val]) => {
        if(coord.x < result.extents.topLeft.x) {
            result.extents.topLeft.x = coord.x
        } else if(coord.x > result.extents.bottomRight.x) {
            result.extents.bottomRight.x = coord.x
        }
        if(coord.y < result.extents.topLeft.y) {
            result.extents.topLeft.y = coord.y
        } else if(coord.y > result.extents.bottomRight.y) {
            result.extents.bottomRight.y = coord.y
        }
        if(val) {
            i[coord.toString()] = val
        }
        return i
    }, {})

    return result
}

function render(image: Image): void {
    for(let y = image.extents.topLeft.y; y <= image.extents.bottomRight.y; y++) {
        const line = []
        for(let x = image.extents.topLeft.x; x <= image.extents.bottomRight.x; x++) {
            const coord = new Coord(x, y)
            if(image.pixels[coord.toString()]) {
                line.push(yellow('#'))
            } else {
                line.push('.')
            }
        }
        console.log(line.join(''))
    }
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
    render(current)
    current = stepImage(image, rules)
    console.log('')
    render(current)
}

module.exports = day20 