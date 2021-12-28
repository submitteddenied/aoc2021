import parseFile from "../util/parser"

type SnailNumber = {
    left: number | SnailNumber,
    right: number | SnailNumber
}

interface BaseAction {
    type: 'Explode' | 'Propagate' | 'Split' | 'None' | 'Done'
}

type Action = ExplodeAction | PropagateAction | SplitAction | NoneAction | DoneAction

interface ExplodeAction extends BaseAction {
    type: 'Explode'
    value: {left: number, right: number}
}

interface PropagateAction extends BaseAction {
    type: 'Propagate'
    direction: 'left' | 'right'
    value: number
}

interface SplitAction extends BaseAction {
    type: 'Split'
}

interface NoneAction extends BaseAction {
    type: 'None'
}

interface DoneAction extends BaseAction {
    type: 'Done'
}

function add(a: SnailNumber, b: SnailNumber): SnailNumber {
    return {
        left: a,
        right: b
    }
}

function isSnailNumber(a: SnailNumber | number): a is SnailNumber {
    return typeof a !== 'number'
}

function propagateExplosionDown(node: SnailNumber | number, direction: 'left' | 'right', val: number): SnailNumber | number {
    if(isSnailNumber(node)) {
        node[direction] = propagateExplosionDown(node[direction], direction, val)
        
        return node
    } else {
        return node + val
    }
}

function findExplosion(node: SnailNumber, pairsAbove: number): Action {
    if(pairsAbove >= 4) {
        if(!isSnailNumber(node.left) && !isSnailNumber(node.right)) {
            //explode this number!
            //console.log(`Exploding ${JSON.stringify(node)}`)
            return {
                type: 'Explode',
                value: {
                    left: node.left,
                    right: node.right
                }
            }
        }
    }
    const lResult = walkExplosion(node, 'left', pairsAbove)
    if(lResult.type !== 'None') {
        return lResult
    }

    return walkExplosion(node, 'right', pairsAbove)
}

function findSplit(node: SnailNumber): Action {
    const left = node.left
    if(isSnailNumber(left)) {
        const result = findSplit(left)
        if(result.type === 'Done') {
            return result
        }
    } else {
        if(left >= 10) {
            node.left = splitNumber(left)
            return {type: 'Done'}
        }
    }
    const right = node.right
    if(isSnailNumber(right)) {
        const result = findSplit(right)
        if(result.type === 'Done') {
            return result
        }
    } else {
        if(right >= 10) {
            node.right = splitNumber(right)
            return {type: 'Done'}
        }
    }

    return {type: 'None'}
}

function splitNumber(left: number): SnailNumber {
    return {
        left: Math.floor(left / 2),
        right: Math.ceil(left / 2)
    }
}

function oppositeDir(direction: 'left' | 'right') {
    return direction === 'left' ? 'right' : 'left'
}

function walkExplosion(node: SnailNumber | number, direction: 'left' | 'right', pairsAbove: number): Action {
    if(!isSnailNumber(node)) {
        return {type: 'None'}
    }

    const otherDirection = oppositeDir(direction)
    const child = node[direction]
    if(isSnailNumber(child)) {
        const lResult = findExplosion(child, pairsAbove + 1)
        if(lResult.type === 'Explode') {
            node[direction] = 0
            node[otherDirection] = propagateExplosionDown(node[otherDirection], direction, lResult.value[otherDirection])
            return {
                type: 'Propagate',
                direction,
                value: lResult.value[direction]
            }
        } else if(lResult.type === 'Propagate') {
            if(lResult.direction === otherDirection) {
                node[otherDirection] = propagateExplosionDown(node[otherDirection], direction, lResult.value)
                return { type: 'Done' }
            } else {
                return lResult
            }
        } else if(lResult.type === 'Done') {
            return lResult
        }
    }
    return {type: 'None'}   
}

function magnitude(n: SnailNumber | number): number {
    if(isSnailNumber(n)) {
        return (3 * magnitude(n.left)) + (2 * magnitude(n.right))
    } else {
        return n
    }
}

function objectifyNumber(input: any[]): SnailNumber {
    let left: number | SnailNumber
    let right: number | SnailNumber
    if(typeof input[0] === 'number') {
        left = input[0]
    } else {
        left = objectifyNumber(input[0])
    }
    if(typeof input[1] === 'number') {
        right = input[1]
    } else {
        right = objectifyNumber(input[1])
    }
    
    return {
        left,
        right
    }
}

function arrayifyNumber(input: SnailNumber): any[] {
    const result = []
    if(isSnailNumber(input.left)){
        result.push(arrayifyNumber(input.left))
    } else {
        result.push(input.left)
    }
    if(isSnailNumber(input.right)){
        result.push(arrayifyNumber(input.right))
    } else {
        result.push(input.right)
    }

    return result
}

function parseNumber(input: string): SnailNumber {
    return objectifyNumber(JSON.parse(input))
}


function printNumber(n: SnailNumber) {
    console.log(`${JSON.stringify(arrayifyNumber(n))}`)
}

function day18(file: string) {
    const input = parseFile(file).map(x => x.trim())
    let sum = parseNumber(input[0])
    printNumber(sum)
    for(let i = 1; i < input.length; i++) {
        const n = parseNumber(input[i])
        printNumber(n)
        sum = add(sum, n)
        printNumber(sum)
        reduce(sum)
    }

    printNumber(sum)
    console.log(`Part 1 Mag: ${magnitude(sum)}`)

    let max = Number.MIN_VALUE
    for(let i = 0; i < input.length; i++) {
        for(let j = 0; j < input.length; j++) {
            if(i === j) {
                continue
            }
            const a = parseNumber(input[i])
            const b = parseNumber(input[j])
            const result = reduce(add(a, b))
            const mag = magnitude(result)
            if(mag > max) {
                console.log(`New max: ${mag}`)
                printNumber(result)
                max = mag
            }
        }
    }

    console.log(`Part 2 Mag: ${max}`)
}

module.exports = day18

function reduce(n: SnailNumber): SnailNumber {
    let res: Action
    do {
        do {
            res = findExplosion(n, 0)
        } while (res.type !== 'None')

        res = findSplit(n)
    } while (res.type !== 'None')

    return n
}

