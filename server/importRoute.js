import parser from 'node-weakauras-parser'

export async function importRoute(str) {
  const decoded = await parser.decode(str)

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
