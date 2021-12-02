import {readFileSync} from 'fs'
import {yellow} from 'colors/safe'

function parseFile(name: string): string[] {
  const result = readFileSync(name, {encoding: 'utf8'}).split('\n').filter(x => x)
  console.log(yellow(`Loaded ${result.length} lines from ${name}`))
  return result
}

export default parseFile