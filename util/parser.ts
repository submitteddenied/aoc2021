import {readFileSync} from 'fs'

function parseFile(name: string): string[] {
  return readFileSync(name, {encoding: 'utf8'}).split('\n').filter(x => x)
}

export default parseFile