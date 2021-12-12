import { red } from "colors/safe";
import parseFile from "../util/parser";

type CaveGraph = {[room: string]: string[]}
type VisitCounts = {[cave: string]: number}
const graph: CaveGraph = {}

function isLower(s: string): boolean {
  return s.toLowerCase() === s
}

function canVisit(cave: string, visited: VisitCounts): boolean {
  if(!isLower(cave)) {
    return true
  }

  if(cave === 'start' || cave === 'end') {
    return visited[cave] === undefined
  }
  
  if(visited[cave] === undefined) {
    return true
  }

  const twiceVisited = Object.entries(visited).filter(([c, visitCount]) => {
    if(!isLower(c)) {
      return false
    }
    if(visitCount > 2) {
      throw new Error('Small cave visited more than twice!')
    }
    return visitCount === 2
  })
  return twiceVisited.length === 0
}

function explore(graph: CaveGraph, startNode: string, visited: VisitCounts, target: string): string[][] {
  const result: string[][] = []
  const nextVisited = Object.assign({}, visited)
  if(nextVisited[startNode] === undefined) {
    nextVisited[startNode] = 0
  }
  nextVisited[startNode]++
  const candidates = graph[startNode].filter(x => canVisit(x, nextVisited))
  // if(startNode === 'A') {
  //   console.log(`A: ${candidates.join(', ')} - ${JSON.stringify(visited)}}`)
  // }
  candidates.forEach(next => {
    if(next === target) {
      return result.push([startNode, next])
    }
    const subpaths = explore(graph, next, nextVisited, target)
    subpaths.forEach(p => {
      result.push([startNode].concat(p))
    })
  })

  return result
}

function day12(file: string) {
  const input = parseFile(file).map(x => x.trim())

  input.forEach(line => {
    const [from, to] = line.split('-')
    if(graph[from] === undefined) {
      graph[from] = []
    }
    graph[from].push(to)
    if(graph[to] === undefined) {
      graph[to] = []
    }
    graph[to].push(from)
  })
  //console.log(JSON.stringify(graph))

  const paths = explore(graph, 'start', {}, 'end')
  paths.forEach(x => {
    //console.log(x.join(','))
  })
  
  console.log(`Part 1: ${paths.length}`)
}

module.exports = day12