import parser from 'node-weakauras-parser'

export async function exportRoute(mdtRoute) {
  mdtRoute.value.pulls = mdtRoute.value.pulls.map((pull) => {
    const newPull = { color: pull.color }
    for (const enemy of pull.enemies) {
      newPull[enemy.enemyIndex] = enemy.spawnIndexes
    }
    return newPull
  })

  return await parser.encode(mdtRoute)
}
