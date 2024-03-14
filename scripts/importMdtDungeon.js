import parser from 'luaparse'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

export const dungeonPaths = {
  aa: 'Dragonflight/AlgetharAcademy',
  ad: 'BattleForAzeroth/AtalDazar',
  bh: 'Dragonflight/BrackenhideHollow',
  brh: 'Dragonflight/BlackRookHold',
  fall: 'Dragonflight/DawnOfTheInfiniteLower',
  rise: 'Dragonflight/DawnOfTheInfiniteUpper',
  dht: 'Legion/DarkheartThicket',
  eb: 'Dragonflight/Everbloom',
  tott: 'Dragonflight/ThroneOfTides',
  wcm: 'Dragonflight/WaycrestManor',
}

export function importMdtDungeon(key) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const data = fs.readFileSync(`${__dirname}/../MythicDungeonTools/${dungeonPaths[key]}.lua`)
  const ast = parser.parse(data.toString())

  const dungeonIndexItem = ast.body.find((item) =>
    item.variables?.some((variable) => variable.name === 'dungeonIndex'),
  )
  const dungeonIndex = dungeonIndexItem.init[0].value

  const dungeonCountItem = ast.body.find((item) =>
    item.variables?.some((variable) => variable?.base?.identifier?.name === 'dungeonTotalCount'),
  )

  const totalCount = dungeonCountItem.init[0].fields[0].value.value

  const dungeonEnemiesItem = ast.body.find((item) =>
    item.variables?.some((variable) => variable?.base?.identifier?.name === 'dungeonEnemies'),
  )

  const luaEnemies = dungeonEnemiesItem.init[0].fields.map(({ value }) => value)

  const getFieldValue = (fields, key) => {
    const field = fields.find((field) => field.key.raw === `"${key}"`)

    if (!field) return null

    if (field.value.type === 'NumericLiteral') {
      return field.value.value
    } else if (field.value.type === 'BooleanLiteral') {
      return !!field.value.value
    } else if (field.value.type === 'StringLiteral') {
      return field.value.raw.replaceAll('"', '')
    } else if (field.value.type === 'UnaryExpression') {
      return -1 * field.value.argument.value
    } else if (field.value.type === 'TableConstructorExpression') {
      return field.value.fields
    } else {
      throw `Unknown field value type: ${field.value.type}`
    }
  }

  const convertCoords = (x, y) => [y / 2.185, x / 2.185]

  const enemies = []
  for (let enemyIndex = 0; enemyIndex < luaEnemies.length; ++enemyIndex) {
    const enemyIndexVal = enemyIndex + 1
    const fields = luaEnemies[enemyIndex].fields
    const enemy = {
      id: getFieldValue(fields, 'id'),
      enemyIndex: enemyIndexVal,
      name: getFieldValue(fields, 'name'),
      count: getFieldValue(fields, 'count'),
      health: getFieldValue(fields, 'health'),
      creatureType: getFieldValue(fields, 'creatureType'),
      scale: getFieldValue(fields, 'scale'),
      isBoss: !!getFieldValue(fields, 'isBoss'),
    }

    const spawns = []
    const clones = getFieldValue(fields, 'clones')
    for (const clone of clones) {
      const cloneFields = clone.value.fields

      const teeming = getFieldValue(cloneFields, 'teeming')
      if (teeming) continue

      const spawnIndex = clone.key.value
      const x = getFieldValue(cloneFields, 'x')
      const y = getFieldValue(cloneFields, 'y')
      const spawn = {
        id: `${enemyIndexVal}-${spawnIndex}`,
        spawnIndex,
        group: getFieldValue(cloneFields, 'g'),
        pos: convertCoords(x, y),
      }

      const patrol = getFieldValue(cloneFields, 'patrol')
      spawn.patrol = (patrol ?? []).map((item) => {
        const fields = item.value.fields
        const x = getFieldValue(fields, 'x')
        const y = getFieldValue(fields, 'y')
        return convertCoords(x, y)
      })

      spawns.push(spawn)
    }

    enemy.spawns = spawns
    enemies.push(enemy)
  }

  const mdtData = {
    dungeonIndex,
    totalCount,
    enemies,
  }

  fs.writeFileSync(`${__dirname}/../src/data/mdtDungeons/${key}_mdt.json`, JSON.stringify(mdtData))
}
