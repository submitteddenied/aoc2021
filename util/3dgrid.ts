export class Coord {
    x: number
    y: number
    z: number
    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    equals(other: Coord): boolean {
        return this.x === other.x && this.y === other.y && this.z === other.z
    }

    rotate(r: Rotation): Coord {
        const m = r.toMatrix()
        return new Coord(
            m[0][0] * this.x + m[0][1] * this.y + m[0][2] * this.z,
            m[1][0] * this.x + m[1][1] * this.y + m[1][2] * this.z,
            m[2][0] * this.x + m[2][1] * this.y + m[2][2] * this.z
        )
    }

    sub(other: Coord): Coord {
        return new Coord(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
        )
    }
    
    add(other: Coord): Coord {
        return new Coord(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        )
    }

    toKey(): string {
        return `${this.x}:${this.y}:${this.z}`
    }
}

export class CoordSet {
    data: {[key: string]: Coord}
    length: number
    constructor() {
        this.data = {}
        this.length = 0
    }

    add(c: Coord): Coord {
        const k = c.toKey()
        if(this.data[k]) {
            return this.data[k]
        }
        this.data[k] = c
        this.length = Object.values(this.data).length
        return c
    }

    addAll(c: Coord[]): void {
        c.forEach(i => this.add(i))
    }

    has(c: Coord): boolean {
        return this.data[c.toKey()] !== undefined
    }

    values(): Coord[] {
        return Object.values(this.data)
    }
}

export class Rotation {
    x: number
    y: number
    z: number

    /**
     * Create a new rotation
     * @param x Number of 90deg rotations about x
     * @param y Number of 90deg rotations about y
     * @param z Number of 90deg rotations about z
     */
    constructor(x: number, y: number, z: number) {
        this.x = x % 4
        this.y = y % 4
        this.z = z % 4
    }

    equals(other: Rotation): boolean {
        return this.x === other.x && this.y === other.y && this.z === other.z
    }

    toMatrix(): number[][] {
        const COS = [1, 0, -1, 0]
        const SIN = [0, 1, 0, -1]
        const cosA = COS[this.z]
        const sinA = SIN[this.z]
        const cosB = COS[this.y]
        const sinB = SIN[this.y]
        const cosC = COS[this.x]
        const sinC = SIN[this.x]

        return [
            [cosA * cosB, (cosA * sinB * sinC) - (sinA * cosC), (cosA * sinB * cosC) + (sinA * sinC)],
            [sinA * cosB, (sinA * sinB * sinC) + (cosA * cosC), (sinA * sinB * cosC) - (cosA * sinC)],
            [-sinB, cosB * sinC, cosB * cosC]
        ]
    }
}

export type RotationFunc = (c: Coord) => Coord

const rollRight: RotationFunc = (c: Coord) => {
    return new Coord(-c.y, c.x, c.z)
}

const yawRight: RotationFunc = (c: Coord) => {
    return new Coord(-c.z, c.y, c.x)
}

const pitchUp: RotationFunc = (c: Coord) => {
    return new Coord(c.x, c.z, -c.y)
}

export const CUBE_ROTATIONS: RotationFunc[] = [
    (c: Coord) => c, //identity
    //9 axis rotations
    rollRight,
    (c: Coord) => rollRight(rollRight(c)),
    (c: Coord) => rollRight(rollRight(rollRight(c))),
    yawRight,
    (c: Coord) => yawRight(yawRight(c)),
    (c: Coord) => yawRight(yawRight(yawRight(c))),
    pitchUp,
    (c: Coord) => pitchUp(pitchUp(c)),
    (c: Coord) => pitchUp(pitchUp(pitchUp(c))),
    
    //6 crosses
    (c: Coord) => pitchUp(pitchUp(rollRight(c))),
    (c: Coord) => yawRight(yawRight(rollRight(c))),
    (c: Coord) => yawRight(yawRight(pitchUp(c))),
    (c: Coord) => yawRight(pitchUp(pitchUp(c))),
    (c: Coord) => rollRight(pitchUp(yawRight(c))),
    (c: Coord) => pitchUp(pitchUp(yawRight(c))),

    //8 diagonals
    (c: Coord) => yawRight(pitchUp(c)), //b1
    (c: Coord) => new Coord(c.z, c.x, c.y), //b2
    (c: Coord) => new Coord(c.z, -c.x, -c.y), //g1
    (c: Coord) => rollRight(yawRight(c)), //g2
    (c: Coord) => new Coord(c.y, -c.z, -c.x), //r1
    (c: Coord) => rollRight(pitchUp(c)), //r2
    (c: Coord) => new Coord(-c.z, -c.x, c.y), //o1
    (c: Coord) => pitchUp(rollRight(c)), //o2
]

export const ROTATION_NAMES = [
    'identity',
    'z1',
    'z2',
    'z3',
    'y3',
    'y2',
    'y1',
    'x1',
    'x2',
    'x3',
    'r',
    'g',
    'b',
    'pi',
    'pu',
    'o',
    'b1',
    'b2',
    'g1',
    'g2',
    'r1',
    'r2',
    'o1',
    'o2'
]