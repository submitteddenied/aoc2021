import { yellow } from "colors/safe"
import { Coord, CoordSet, CUBE_ROTATIONS, RotationFunc, ROTATION_NAMES } from "../util/3dgrid"
import parseFile from "../util/parser"

interface Scanner {
    id: number
    position?: Coord
    localBeacons: Coord[]
}

function rotateScannerView(scanner: Scanner, rf: RotationFunc): Scanner {
    return {
        id: scanner.id,
        localBeacons: scanner.localBeacons.map(rf)
    }
}

function day19(file: string) {
    const input = parseFile(file).map(x => x.trim())
    const scanners: Scanner[] = []
    for(let i = 0; i < input.length; i++) {
        const line = input[i]
        if(line.startsWith('--- scanner ')) {
            const id = Number.parseInt(line.slice(4, -4).split(' ')[1])
            if(id !== scanners.length) {
                console.log(`WARN: Scanner idx ${scanners.length} doesn't have id ${id}`)
            }
            scanners.push({id, localBeacons: []})
        } else {
            const [x, y, z] = line.split(',').map(n => Number.parseInt(n))
            scanners[scanners.length - 1].localBeacons.push(new Coord(x, y, z))
        }
    }

    console.log(yellow(`Parsed ${scanners.length} scanners`))

    interface Result {
        scanners: Scanner[],
        beacons: CoordSet
    }

    const result: Result = {
        scanners: [],
        beacons: new CoordSet()
    }

    scanners[0].position = new Coord(0, 0, 0)
    result.scanners.push(scanners[0])
    result.beacons.addAll(scanners[0].localBeacons)
    while(scanners.length > result.scanners.length) {
        const resultBeacons = result.beacons.values()
        for(let i = 0; i < scanners.length; i++) {
            const thisScanner = scanners[i]
            if(result.scanners.find(s => s.id === thisScanner.id)) {
                continue
            }
            let found = false

            //can we match this scanner against N known beacons?
            const REQUIRED_BEACONS = 12
            //for each rotation
            for(let r = 0; r < CUBE_ROTATIONS.length; r++) {
                const beacons = thisScanner.localBeacons.map(CUBE_ROTATIONS[r])
                //for each pair of (unknown, known) beacons
                for(let b = 0; b < beacons.length; b++) {
                    for(let k = 0; k < resultBeacons.length; k++) {
                        //if these were actually the same
                        const offset = resultBeacons[k].sub(beacons[b])
                        let matches = 0
                        //how many others match?
                        for(let x = 0; x < beacons.length; x++) {
                            const candidate = beacons[x].add(offset)
                            if(result.beacons.has(candidate)) {
                                matches++
                                if(matches >= REQUIRED_BEACONS) {
                                    console.log(`Matched scanner ${thisScanner.id} (${result.scanners.length}/${scanners.length}) - rotation ${ROTATION_NAMES[r]} offset ${JSON.stringify(offset)}`)
                                    found = true
                                    thisScanner.position = offset
                                    result.scanners.push(thisScanner)
                                    result.beacons.addAll(beacons.map(b => b.add(offset)))
                                    break
                                }
                            }
                        }
                        if(found) {
                            break
                        }
                    }
                    if(found) {
                        break
                    }
                }
                if(found) {
                    break
                }
            }
        }
    }

    console.log(`Matched all scanners, total beacons: ${result.beacons.length}`)

    let max = 0
    for(let i = 0; i < result.scanners.length; i++) {
        const iPos = scanners[i].position
        if(iPos === undefined) {
            throw new Error(`Scanner ${scanners[i].id} has no position?`)
        }
        for(let j = i + 1; j < result.scanners.length; j++) {
            const jPos = scanners[j].position
            if(jPos === undefined) {
                throw new Error(`Scanner ${scanners[j].id} has no position?`)
            }
            const delta = iPos.sub(jPos)
            const distance = Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z)
            if(distance > max) {
                max = distance
            }
        }
    }
    console.log(`Max Distance: ${max}`)
}

module.exports = day19