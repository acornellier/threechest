import parser from 'node-weakauras-parser'

export class DecodingError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DecodingError'
  }
}

async function decode(str) {
  try {
    return await parser.decode(str)
  } catch (err) {
    throw new DecodingError('Invalid MDT string')
  }
}

export async function importRoute(str) {
  const decoded = await decode(str)

  for (const pull of decoded.value.pulls) {
    const newEnemies = []
    const pullKeys = Object.keys(pull)
    for (const enemyIndex of pullKeys) {
      if (Number.isNaN(Number(enemyIndex))) continue

      newEnemies.push({
        enemyIndex: Number(enemyIndex),
        spawnIndexes: pull[enemyIndex],
      })

      delete pull[enemyIndex]
    }
    pull.enemies = newEnemies
  }

  return decoded
}
