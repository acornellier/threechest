import parser, { Expression, NumericLiteral, TableConstructorExpression, TableKey } from 'luaparse'
import * as fs from 'fs'
import { MdtDungeon, Mob, Point, Spawn } from '../src/data/types.ts'
import { StringLiteral } from 'luaparse/lib/ast'
import { roundTo } from '../src/util/numbers.ts'
import { getDirname } from '../server/files.ts'
import { DungeonKey } from '../src/data/dungeonKeys.ts'

const dirname = getDirname(import.meta.url)

export function importMdtDungeon(key: DungeonKey, dungeonPath: string) {
  const data = fs.readFileSync(`${dirname}/../MythicDungeonTools/${dungeonPath}.lua`)
  const ast = parser.parse(data.toString())

  const dungeonIndexItem: any = ast.body.find((item: any) =>
    item.variables?.some((variable: any) => variable.name === 'dungeonIndex'),
  )
  const dungeonIndex = dungeonIndexItem!.init[0].value

  const dungeonCountItem: any = ast.body.find(
    (item) =>
      item.type === 'AssignmentStatement' &&
      item.variables?.some(
        (variable: any) => variable?.base?.identifier?.name === 'dungeonTotalCount',
      ),
  )

  const totalCount = dungeonCountItem.init[0].fields[0].value.value

  const dungeonEnemiesItem: any = ast.body.find((item: any) =>
    item.variables?.some((variable: any) => variable?.base?.identifier?.name === 'dungeonEnemies'),
  )

  const luaEnemies: TableConstructorExpression[] = dungeonEnemiesItem.init[0].fields.map(
    (field: any) => field.value,
  )

  const parseExpression = (value: Expression): any => {
    if (value.type === 'NumericLiteral') {
      return value.value
    } else if (value.type === 'BooleanLiteral') {
      return !!(value.value as boolean | undefined)
    } else if (value.type === 'StringLiteral') {
      return value.raw.replaceAll('"', '')
    } else if (value.type === 'UnaryExpression') {
      return -1 * (value.argument as NumericLiteral).value
    } else if (value.type === 'TableConstructorExpression') {
      return value.fields
    } else {
      throw `Unknown field value type: ${value.type}`
    }
  }

  const getFieldValue = (fields: TableKey[], key: string) => {
    const field = fields.find((field) => (field.key as StringLiteral).raw === `"${key}"`)

    if (!field) return null

    return parseExpression(field.value)
  }

  const convertCoords = (x: number, y: number): Point => [
    roundTo(y / 2.185, 2),
    roundTo(x / 2.185, 2),
  ]

  const enemies: Mob[] = []
  for (let enemyIndex = 0; enemyIndex < luaEnemies.length; ++enemyIndex) {
    const enemyIndexVal = enemyIndex + 1
    const fields = luaEnemies[enemyIndex]!.fields as TableKey[]
    const enemy: Mob = {
      id: getFieldValue(fields, 'id'),
      enemyIndex: enemyIndexVal,
      name: getFieldValue(fields, 'name'),
      count: getFieldValue(fields, 'count'),
      health: getFieldValue(fields, 'health'),
      creatureType: getFieldValue(fields, 'creatureType'),
      scale: getFieldValue(fields, 'scale'),
      isBoss: !!getFieldValue(fields, 'isBoss'),
      characteristics: [],
      spawns: [],
    }

    if (getFieldValue(fields, 'stealthDetect')) enemy.stealthDetect = true

    const characteristicFields = getFieldValue(fields, 'characteristics') as TableKey[]
    if (characteristicFields)
      enemy.characteristics = characteristicFields.map((field) => parseExpression(field.key))

    const spawns: Spawn[] = []
    const clones = getFieldValue(fields, 'clones')
    for (const clone of clones) {
      const cloneFields = clone.value.fields

      const teeming = getFieldValue(cloneFields, 'teeming')
      if (teeming) continue

      const spawnIndex = clone.key.value
      const x = getFieldValue(cloneFields, 'x')
      const y = getFieldValue(cloneFields, 'y')
      const spawn: Spawn = {
        id: `${enemyIndexVal}-${spawnIndex}`,
        idx: spawnIndex,
        group: getFieldValue(cloneFields, 'g'),
        pos: convertCoords(x, y),
      }

      const scale = getFieldValue(cloneFields, 'scale')
      if (scale) spawn.scale = scale

      const patrol = getFieldValue(cloneFields, 'patrol') as TableKey[] | null
      if (patrol) {
        spawn.patrol = patrol.map((item) => {
          const fields = (item.value as TableConstructorExpression).fields as TableKey[]
          const x = getFieldValue(fields, 'x')
          const y = getFieldValue(fields, 'y')
          return convertCoords(x, y)
        })
      }

      spawns.push(spawn)
    }

    enemy.spawns = spawns
    enemies.push(enemy)
  }

  const mdtData: MdtDungeon = {
    dungeonIndex,
    totalCount,
    enemies,
  }

  fs.writeFileSync(`${dirname}/../src/data/mdtDungeons/${key}_mdt.json`, JSON.stringify(mdtData))
}
