import { zeroPad } from "../util/numbers"
import parseFile from "../util/parser"

enum PacketType {
    Literal,
    Operator
}

interface BasePacket {
    packetType: PacketType
    version: number
    typeId: number
}

type Packet = LiteralPacket | OperatorPacket

interface LiteralPacket extends BasePacket {
    packetType: PacketType.Literal
    value: number
}

interface OperatorPacket extends BasePacket {
    packetType: PacketType.Operator
    subpackets: Packet[]
}

function isOperator(obj: Packet): obj is OperatorPacket {
    return obj.packetType === PacketType.Operator
}

class PacketDecoder {
    input: string
    index: number
    buffer: string[]
    constructor(input: string) {
        this.input = input
        this.index = 0
        this.buffer = this.input.split('').flatMap(l => {
            let str = Number.parseInt(l, 16).toString(2)
            while(str.length < 4) {
                str = '0' + str
            }
            return str.split('')
        })
    }

    getNBitNumber(n: number): number {
        const result = this.buffer.slice(this.index, this.index + n).join('')
        this.index += n
        
        return Number.parseInt(result, 2)
    }

    readType(): number {
        return this.getNBitNumber(3)
    }

    readVersion(): number {
        return this.getNBitNumber(3)
    }

    readLiteral(): number {
        let result = ''
        let terminal = false
        do {
            terminal = this.buffer[this.index++] === '0'
            
            result = result + this.buffer.slice(this.index, this.index + 4).join('')
            this.index += 4
        } while(!terminal)
        this.endPacket()
        return Number.parseInt(result, 2)
    }

    endPacket(): void {
        //TODO
    }

    readPacket(): Packet {
        const version = this.readVersion()
        const typeId = this.readType()

        if(typeId === 4) {
            return {
                packetType: PacketType.Literal,
                version,
                typeId,
                value: this.readLiteral()
            }
        } else {
            const lengthType = this.getNBitNumber(1)
            const subpackets = []
            if(lengthType === 0) {
                const bitLength = this.getNBitNumber(15)
                const startIndex = this.index
                while(this.index < startIndex + bitLength) {
                    subpackets.push(this.readPacket())
                }
            } else {
                const packetLength = this.getNBitNumber(11)
                for(let i = 0; i < packetLength; i++) {
                    subpackets.push(this.readPacket())
                }    
            }

            return {
                packetType: PacketType.Operator,
                version,
                typeId,
                subpackets
            }
        }
    }
}

const opNames: {[id: number]: string} = {
    0: 'sum',
    1: 'product',
    2: 'min',
    3: 'max',
    5: 'gt',
    6: 'lt',
    7: 'eq'
}

function renderPacket(p: Packet, d: number = 0) {
    let result = ''
    while(result.length < d * 2) {
        result += '  '
    }

    if(isOperator(p)) {
        result += `Operator ${p.typeId} - ${opNames[p.typeId]} (v${p.version})`
        console.log(result)
        for(let i = 0; i < p.subpackets.length; i++) {
            renderPacket(p.subpackets[i], d + 1)
        }
    } else {
        result += `Literal ${p.value} (v${p.version})`
        console.log(result)
    }
}

function sumVersion(p: Packet): number {
    let result = 0

    result += p.version
    if(isOperator(p)) {
        for(let i = 0; i < p.subpackets.length; i++) {
            result += sumVersion(p.subpackets[i])
        }
    }

    return result
}

type PacketOperation = (p: Packet[]) => number

const operations: {[id: number]: PacketOperation} = {
    0: (l) => l.reduce((s, p) => s + getValue(p), 0),   //sum
    1: (l) => l.reduce((r, p) => r * getValue(p), 1),   //product
    2: (l) => Math.min(...l.map(getValue)),             //min
    3: (l) => Math.max(...l.map(getValue)),             //max
    5: (l) => getValue(l[0]) > getValue(l[1]) ? 1 : 0,  //gt
    6: (l) => getValue(l[0]) < getValue(l[1]) ? 1 : 0,  //lt
    7: (l) => getValue(l[0]) == getValue(l[1]) ? 1 : 0  //eq
}

function getValue(p: Packet): number {
    if(isOperator(p)) {
        return operations[p.typeId](p.subpackets)
    } else {
        return p.value
    }
}

function day16(file: string) {
    const input = parseFile(file).map(x => x.trim())
    
    for(let i = 0; i < input.length; i++) {
        console.log(input[i])
        const decoder = new PacketDecoder(input[i])
        const p = decoder.readPacket()
        renderPacket(p)
        console.log(`Sum: ${sumVersion(p)}`)
        console.log(`Value: ${getValue(p)}`)
        console.log()
    }
    
}

module.exports = day16