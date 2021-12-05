import { blue, bold, green } from "colors/safe";
import parseFile from "../util/parser";

function pad(length: number): (a: string) => string {
  return (a: string) => {
    let result = a
    while(result.length < length) {
      result = ' ' + result
    }
    return result
  }
}

class Board {
  board: string[][]
  markedBoard: string[][]
  winner: boolean

  constructor(numbers: string[]) {
    if(numbers.length !== 5) {
      throw new Error('Wrong number of rows used to initialize board: ' + JSON.stringify(numbers))
    }
    this.board = []
    this.markedBoard = []
    this.winner = false
    for(let i = 0; i < 5; i++) {
      this.board.push(numbers[i].split(' ').filter(x => x))
      if(this.board[i].length !== 5) {
        throw new Error('Wrong number of numbers used to initialize board: ' + JSON.stringify(numbers))
      }
    }
    this.reset()
  }

  reset() {
    this.markedBoard = []
    for(let i = 0; i < 5; i++) {
      this.markedBoard.push(this.board[i].slice())
    }
  }

  markNumber(num: string): boolean {
    if(this.winner) {
      return false
    }
    let row = -1, col = -1
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        if(this.markedBoard[i][j] === num) {
          this.markedBoard[i][j] = 'x'
          row = i
          col = j
        }
      }
    }
    if(row === -1 || col === -1) {
      return false //no number marked, not a winner
    }
    //check the row
    let winner = true
    for(let j = 0; j < 5; j++) {
      if(this.markedBoard[row][j] !== 'x') {
        winner = false
        break
      }
    }
    if(winner) {
      this.winner = true
      return winner
    }
    //check the column
    winner = true
    for(let i = 0; i < 5; i++) {
      if(this.markedBoard[i][col] !== 'x') {
        winner = false
        break
      }
    }

    if(winner) {
      this.winner = true
      return winner
    }
    return false
  }

  boardScore(lastNumber: string): number {
    const lastNum = Number.parseInt(lastNumber)
    let sum = 0
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        if(this.markedBoard[i][j] !== 'x') {
          sum += Number.parseInt(this.markedBoard[i][j])
        }
      }
    }

    return sum * lastNum
  }

  toString(): string[] {
    return this.markedBoard.map(r => {
      const line = r.map(c => c === 'x' ? bold(c) : c).map(pad(2)).join(' ')
      if(this.winner) {
        return green(line)
      }
      return line
    })
  }
}

function printAllBoards(boards: Board[]) {
  // rows of 4
  for(let i = 0; i < boards.length; i += 4) {
    const boardStrings = boards.slice(i, i + 4).map(b => b.toString())
    for(let j = 0; j < 5; j++) {
      console.log(boardStrings.map(s => s[j]).join('\t\t'))
    }
    console.log('') //newline
  }
}

function day4(file: string) {
  const input = parseFile(file).map(x => x.trim())
  
  const numbersToCall = input[0].split(',')
  const boards = []

  for(let lineNum = 1; lineNum < input.length; lineNum += 5) {
    boards.push(new Board(input.slice(lineNum, lineNum + 5)))
  }

  //printAllBoards(boards)

  for(let i = 0; i < numbersToCall.length; i++) {
    const called = numbersToCall[i];
    console.log(`Calling number ${blue(called)}`)
    const winners = boards.reduce((w: Board[], b: Board, i: number) => {
      if(b.markNumber(called)) {
        console.log(`Board ${i} final score: ${b.boardScore(called)}`)
        w.push(b)
      }
      return w
    }, [])
    //printAllBoards(boards)
  }
  
}

module.exports = day4