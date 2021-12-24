import { Coord, Range } from "../util/2dgrid"
import parseFile from "../util/parser"

function hasYInRange(yVel: number, range: Range): boolean {
    const inRange = (yCoord: number) => range.topLeft.y >= yCoord && range.bottomRight.y <= yCoord

    let currVel = -yVel
    let pos = 0
    const p = []
    while(pos >= range.bottomRight.y) {
        p.push(pos)
        if(inRange(pos)) {
            return true
        }

        currVel--
        pos += currVel
    }
    console.log(`No position in range for ${yVel} (positions: ${JSON.stringify(p)})`)
    return false
}

function maxYVelocity(range: Range): number {
    const absMax = Math.abs(range.bottomRight.y)

    for(let i = absMax; i >= 0; i--) {
        if(hasYInRange(i, range)) {
            return i
        }
    }

    throw new Error('???')
}

function minYVelocity(range: Range): number {
    return range.bottomRight.y
}

function maxXVelocity(range: Range): number {
    return range.bottomRight.x
}

function minXVelocity(range: Range): number {
    for(let i = 0; i <= range.topLeft.x; i++) {
        let pos = 0
        let xVel = i
        while(xVel > 0) {
            pos += xVel
            xVel--
        }
        if(pos >= range.topLeft.x && pos <= range.bottomRight.x) {
            return i
        }
    }
    throw new Error('???')
}

function maxHeight(yVel: number): number {
    let result = 0
    for(let i = 1; i <= yVel; i++) {
        result += i
    }
    return result
}

function hasIntersection(initialVelocity: Coord, target: Range): boolean {
    const pos = new Coord(0, 0)
    const vel = new Coord(initialVelocity.x, initialVelocity.y)
    while(pos.y >= target.bottomRight.y && pos.x <= target.bottomRight.x) {
        pos.x += vel.x
        pos.y += vel.y
        if(target.contains(pos)) {
            return true
        }
        vel.x = vel.x === 0 ? 0 : vel.x - 1
        vel.y = vel.y - 1
    }

    return false
}

function day17(file: string) {
    const input = parseFile(file).map(x => x.trim())
    
    for(let i = 0; i < input.length; i++) {
        const [xstr, ystr] = input[i].substring('target area: '.length).split(', ')
        const x = xstr.substring('x='.length).split('..').map(x => Number.parseInt(x))
        const y = ystr.substring('y='.length).split('..').map(x => Number.parseInt(x))

        const area = new Range(new Coord(Math.min(...x), Math.max(...y)), new Coord(Math.max(...x), Math.min(...y)))
        console.log(area.toString())
        const maxYVel = maxYVelocity(area)
        console.log(`Max Y: ${maxHeight(maxYVel)}`)
        console.log(`Max yVel: ${maxYVel}`)
        const minYVel = minYVelocity(area)
        console.log(`Min yVel: ${minYVel}`)
        const minXVel = minXVelocity(area)
        console.log(`Min xVel: ${minXVel}`)
        const maxXVel = maxXVelocity(area)
        console.log(`Max xVel: ${maxXVel}`)

        const valid = []
        for(let x = minXVel; x <= maxXVel; x++) {
            for(let y = minYVel; y <= maxYVel; y++) {
                const initial = new Coord(x, y)
                if(hasIntersection(initial, area)) {
                    valid.push(initial)
                }
            }
        }
        console.log(`${JSON.stringify(valid)}`)
        console.log(`Got ${valid.length} valid results`)
    }
}

module.exports = day17