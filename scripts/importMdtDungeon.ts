import parser, { NumericLiteral, TableConstructorExpression, TableKey } from 'luaparse'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { DungeonKey, MdtDungeon, Mob, Point, Spawn } from '../src/data/types.ts'
import { StringLiteral } from 'luaparse/lib/ast'

export function importMdtDungeon(key: DungeonKey, dungeonPath: string) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const data = fs.readFileSync(`${__dirname}/../MythicDungeonTools/${dungeonPath}.lua`)
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

  const getFieldValue = (fields: TableKey[], key: string): any => {
    const field = fields.find((field) => (field.key as StringLiteral).raw === `"${key}"`)

    if (!field) return null

    const { value } = field

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

  const convertCoords = (x: number, y: number): Point => [y / 2.185, x / 2.185]

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
      spawns: [],
    }

    // if (getFieldValue(fields, 'stealthDetect')) enemy.stealthDetect = true

    const spawns = []
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
        spawnIndex,
        group: getFieldValue(cloneFields, 'g'),
        pos: convertCoords(x, y),
        scale: getFieldValue(cloneFields, 'scale'),
        patrol: [],
      }

      const patrol = getFieldValue(cloneFields, 'patrol') as TableKey[]
      spawn.patrol = (patrol ?? []).map((item) => {
        const fields = (item.value as TableConstructorExpression).fields as TableKey[]
        const x = getFieldValue(fields, 'x')
        const y = getFieldValue(fields, 'y')
        return convertCoords(x, y)
      })

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

  fs.writeFileSync(`${__dirname}/../src/data/mdtDungeons/${key}_mdt.json`, JSON.stringify(mdtData))
}
