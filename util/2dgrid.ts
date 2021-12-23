export class Coord {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    neighbors(includeDiagonals: boolean = true): Coord[] {
        const result: Coord[] = []
        for(let x = -1; x <= 1; x++) {
            for(let y = -1; y <= 1; y++) {
                if(x === 0 && y === 0) {
                    continue
                }
                if((!includeDiagonals) && Math.abs(x) === 1 && Math.abs(y) === 1) {
                    continue
                }

                result.push(new Coord(this.x + x, this.y + y))
            }
        }
        return result
    }

    equals(other: Coord): boolean {
        return this.x === other.x && this.y === other.y
    }
}