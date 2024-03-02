import { dungeonPaths, importMdtDungeon } from './importMdtDungeon.js'

const dungeonKeys = Object.keys(dungeonPaths)

for (const key of dungeonKeys) {
  importMdtDungeon(key)
}
