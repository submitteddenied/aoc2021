import { yellow } from "colors/safe"
import parseFile from "../util/parser"

interface Player {
    score: number
    position: number
}

interface GameResult {
    winner: Player
    loser: Player
    rolls: number
}

interface Universe {
    players: Player[]
    nextTurn: 0 | 1
}

interface DiracResult {
    winCount: number[]
}

/** Update the player and return the new next dice number */
function doTurn(player: Player, dice: number): number {
    const roll = (3 * dice) + 3 //dice + dice + 1 + dice + 2
    player.position = player.position + roll
    while(player.position > 10) {
        player.position -= 10
    }
    player.score = player.score + player.position
    let newDice = dice + 3
    while(newDice > 100) {
        newDice -= 100
    }
    return newDice
}

function playGame(players: Player[]): GameResult {
    let rollCount = 0
    let dice = 1
    let turn = 0
    while(true) {
        const player = players[turn % players.length]
        dice = doTurn(player, dice)
        rollCount += 3
        if(player.score >= 1000) {
            return {
                winner: player,
                loser: players[(turn + 1) % players.length],
                rolls: rollCount
            }
        }
        turn++
    }
}

interface Outcomes {
    [roll: number]: number
}
const OUTCOME_COUNTS: Outcomes = {
    3: 1,
    4: 3,
    5: 6,
    6: 7,
    7: 6,
    8: 3,
    9: 1
}
function diracGame(universe: Universe): DiracResult {
    const result: DiracResult = {
        winCount: [0, 0]
    }
    
    for(let roll = 3; roll <= 9; roll++) {
        const thisTurn = universe.nextTurn
        const nextUniverse: Universe = {
            players: universe.players.map(p => Object.assign({}, p)),
            nextTurn: universe.nextTurn === 1 ? 0 : 1
        }
        const player = nextUniverse.players[thisTurn]
        player.position += roll
        while(player.position > 10) {
            player.position -= 10
        }
        player.score += player.position
        if(player.score >= 21) {
            result.winCount[thisTurn] += OUTCOME_COUNTS[roll]
        } else {
            
            const subResult = diracGame(nextUniverse)
            const expandedResults = subResult.winCount.map(c => c * OUTCOME_COUNTS[roll])
            result.winCount = [result.winCount[0] + expandedResults[0], result.winCount[1] + expandedResults[1]]
        }
    }

    return result
}

function day21(file: string) {
    const input = parseFile(file).map(x => x.trim())
    
    const p1Start = 8
    const p2Start = 10
    const p1: Player = {
        score: 0,
        position: p1Start
    }
    const p2: Player = {
        score: 0,
        position: p2Start
    }

    const result = playGame([p1, p2])
    console.log(`${result.loser.score} * ${result.rolls} = ` + yellow((result.loser.score * result.rolls).toString()))
    const dp1: Player = {
        score: 0,
        position: p1Start
    }
    const dp2: Player = {
        score: 0,
        position: p2Start
    }
    const dirac = diracGame({
        players: [dp1, dp2],
        nextTurn: 0
    })
    console.log("Player 1 Wins: " + yellow(dirac.winCount[0].toString()))
    console.log("Player 2 Wins: " + yellow(dirac.winCount[1].toString()))
}

module.exports = day21