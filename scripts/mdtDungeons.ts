import type { Expression, NumericLiteral, TableConstructorExpression, TableKey } from 'luaparse'
import parser from 'luaparse'
import * as fs from 'fs'
import type { MdtDungeon, MdtSpell, Mob, Point, PointOfInterest, Spawn } from '../src/data/types.ts'
import type { StringLiteral } from 'luaparse/lib/ast'
import { roundTo } from '../src/util/numbers.ts'
import { getDirname } from '../server/files.ts'
import type { DungeonKey } from '../src/data/dungeonKeys.ts'

const dirname = getDirname(import.meta.url)

export const dungeonPaths = new Map<DungeonKey, string>([
  ['cm', 'TheWarWithin/CinderbrewMeadery'],
  ['dc', 'TheWarWithin/DarkflameCleft'],
  ['of', 'TheWarWithin/OperationFloodgate'],
  ['mw', 'TheWarWithin/MechagonWorkshop'],
  ['psf', 'TheWarWithin/PrioryOfTheSacredFlame'],
  ['tm', 'TheWarWithin/TheMotherlode'],
  ['tr', 'TheWarWithin/TheRookery'],
  ['top', 'TheWarWithin/TheaterOfPain'],
])

const filterDungeonKey = process.argv[2]

for (const [key, path] of dungeonPaths) {
  if (!filterDungeonKey || key === filterDungeonKey) {
    importMdtDungeon(key, path)
  }
}

function parseExpression(value: Expression): any {
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

function getFieldValue(fields: TableKey[], key: string) {
  const field = fields.find((field) => (field.key as StringLiteral).raw === `"${key}"`)

  if (!field) return null

  return parseExpression(field.value)
}

function convertCoords(x: number, y: number): Point {
  return [roundTo(y / 2.185, 2), roundTo(x / 2.185, 2)]
}

export function importMdtDungeon(key: DungeonKey, dungeonPath: string) {
  const data = fs.readFileSync(`${dirname}/../MythicDungeonTools/${dungeonPath}.lua`)
  const body = parser.parse(data.toString()).body

  const dungeonIndexItem: any = body.find((item: any) =>
    item.variables?.some((variable: any) => variable.name === 'dungeonIndex'),
  )
  const dungeonIndex = dungeonIndexItem!.init[0].value

  const dungeonCountItem: any = body.find(
    (item) =>
      item.type === 'AssignmentStatement' &&
      item.variables?.some(
        (variable: any) => variable?.base?.identifier?.name === 'dungeonTotalCount',
      ),
  )

  const totalCount = dungeonCountItem.init[0].fields[0].value.value

  const mapPoisItem: any = body.find((item: any) =>
    item.variables?.some((variable: any) => variable?.base?.identifier?.name === 'mapPOIs'),
  )

  const pois: PointOfInterest[] = []
  if (mapPoisItem) {
    const poiItems: TableConstructorExpression[] =
      mapPoisItem.init[0].fields[0]?.value?.fields?.map((field: any) => field.value) ?? []

    for (let poiIndex = 0; poiIndex < poiItems.length; poiIndex++) {
      const fields = poiItems[poiIndex]!.fields as TableKey[]
      const x = getFieldValue(fields, 'x')
      const y = getFieldValue(fields, 'y')
      pois.push({
        type: getFieldValue(fields, 'type'),
        itemType: getFieldValue(fields, 'itemType'),
        pos: convertCoords(x, y),
      })
    }
  }

  const dungeonEnemiesItem: any = body.find((item: any) =>
    item.variables?.some((variable: any) => variable?.base?.identifier?.name === 'dungeonEnemies'),
  )

  const luaEnemies: TableConstructorExpression[] = dungeonEnemiesItem.init[0].fields.map(
    (field: any) => field.value,
  )

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
      spells: [],
      spawns: [],
    }

    if (getFieldValue(fields, 'stealthDetect')) enemy.stealthDetect = true

    const characteristicFields = getFieldValue(fields, 'characteristics') as TableKey[]
    if (characteristicFields)
      enemy.characteristics = characteristicFields.map((field) => parseExpression(field.key))

    const spellsField = getFieldValue(fields, 'spells')
    if (spellsField) {
      for (const spellField of spellsField) {
        const spell: MdtSpell = {
          id: spellField.key.value,
          attributes: spellField.value.fields.map((field: TableKey) => parseExpression(field.key)),
        }

        enemy.spells.push(spell)
      }
    }

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

      enemy.spawns.push(spawn)
    }

    enemies.push(enemy)
  }

  const mdtData: MdtDungeon = {
    dungeonIndex,
    totalCount,
    enemies,
    pois,
  }

  fs.writeFileSync(
    `${dirname}/../src/data/mdtDungeons/${key}_mdt.json`,
    JSON.stringify(mdtData, null, 2),
  )
}
