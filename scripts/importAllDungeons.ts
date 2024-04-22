import { importMdtDungeon } from './importMdtDungeon.ts'

import type { DungeonKey } from '../src/data/dungeonKeys.ts'

export const dungeonPaths = new Map<DungeonKey, string>([
  ['aa', 'Dragonflight/AlgetharAcademy'],
  ['av', 'Dragonflight/TheAzureVault'],
  ['bh', 'Dragonflight/BrackenhideHollow'],
  ['hoi', 'Dragonflight/HallsofInfusion'],
  ['nelth', 'Dragonflight/Neltharus'],
  ['nok', 'Dragonflight/TheNokhudOffensive'],
  ['rlp', 'Dragonflight/RubyLifePools'],
  ['uld', 'Dragonflight/UldamanLegacyOfTyr'],
])

for (const [key, path] of dungeonPaths) {
  importMdtDungeon(key, path)
}
