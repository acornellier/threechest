import parser from 'luaparse'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const data = fs.readFileSync(`${__dirname}/TheVortexPinnacle.lua`)
const ast = parser.parse(data.toString())

const dungeonEnemiesItem = ast.body.find(
  (item) =>
    item.variables &&
    item.variables.some((variable) => variable?.base?.identifier?.name === 'dungeonEnemies'),
)

const luaEnemies = dungeonEnemiesItem.init[0].fields.map(({ value }) => value)

const getFieldValue = (fields, key) => {
  const field = fields.find((field) => field.key.raw === `"${key}"`)

  if (!field) return null

  if (field.value.type === 'NumericLiteral') {
    return field.value.value
  } else if (field.value.type === 'StringLiteral') {
    return field.value.raw
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
for (const { fields } of luaEnemies) {
  const enemy = {
    id: getFieldValue(fields, 'id'),
    name: getFieldValue(fields, 'name'),
    count: getFieldValue(fields, 'count'),
    health: getFieldValue(fields, 'health'),
    creatureType: getFieldValue(fields, 'creatureType'),
    scale: getFieldValue(fields, 'scale'),
  }

  const spawns = []
  const clones = getFieldValue(fields, 'clones')
  for (const clone of clones) {
    const cloneFields = clone.value.fields
    const x = getFieldValue(cloneFields, 'x')
    const y = getFieldValue(cloneFields, 'y')
    const spawn = {
      group: getFieldValue(cloneFields, 'g'),
      pos: convertCoords(x, y),
    }
    spawns.push(spawn)
  }

  enemy.spawns = spawns
  enemies.push(enemy)
}

const mdtData = {
  enemies,
}

fs.writeFileSync(`${__dirname}/../../src/data/vp_mdt.json`, JSON.stringify(mdtData))
