import parseFile from '../util/parser'

const input = parseFile(process.argv[2])

//y = distance from surface
const pos = {x: 0, y: 0}
console.log('Part 1')
for(let i = 0; i < input.length; i++) {
  const [dir, amountStr] = input[i].split(' ')
  const amount = Number.parseInt(amountStr)

  if(dir === 'forward') {
    pos.x += amount
  } else if (dir === 'down') {
    pos.y += amount
  } else if (dir === 'up') {
    pos.y -= amount
  }
}

console.log(`Final position: (${pos.x}, ${pos.y})`)
console.log(`Answer: ${pos.x * pos.y}`)

console.log('Part 2')
pos.x = 0
pos.y = 0
let aim = 0

for(let i = 0; i < input.length; i++) {
  const [dir, amountStr] = input[i].split(' ')
  const amount = Number.parseInt(amountStr)

  if(dir === 'forward') {
    pos.x += amount
    pos.y += (amount * aim)
  } else if (dir === 'down') {
    aim += amount
  } else if (dir === 'up') {
    aim -= amount
  }
}

console.log(`Final position: (${pos.x}, ${pos.y}) - Aim: ${aim}`)
console.log(`Answer: ${pos.x * pos.y}`)