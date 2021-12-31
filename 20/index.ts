import parseFile from "../util/parser"
import { Range } from '../util/2dgrid' 

interface Image {
    [c: string]: boolean
}

function rangeToIndex(r: Range, image: Image): number {
    const numStr = r.coords().map(c => image[c.toString()]).map(i => i ? '1' : '0').join('')

    return Number.parseInt(numStr, 2)
}

function stepImage(image: Image, rules: string): Image {
    const result = {}



    return result
}

function day20(file: string) {
    const input = parseFile(file).map(x => x.trim())
    
    
}

module.exports = day20 