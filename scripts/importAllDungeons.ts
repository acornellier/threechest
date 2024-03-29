import { importMdtDungeon } from './importMdtDungeon.ts'
import { DungeonKey } from '../src/data/types.ts'

export const dungeonPaths = new Map<DungeonKey, string>([
  ['aa', 'Dragonflight/AlgetharAcademy'],
  ['ad', 'BattleForAzeroth/AtalDazar'],
  ['bh', 'Dragonflight/BrackenhideHollow'],
  ['brh', 'Dragonflight/BlackRookHold'],
  ['fall', 'Dragonflight/DawnOfTheInfiniteLower'],
  ['rise', 'Dragonflight/DawnOfTheInfiniteUpper'],
  ['dht', 'Legion/DarkheartThicket'],
  ['eb', 'Dragonflight/Everbloom'],
  ['nok', 'Dragonflight/TheNokhudOffensive'],
  ['tott', 'Dragonflight/ThroneOfTides'],
  ['wcm', 'Dragonflight/WaycrestManor'],
])

for (const [key, path] of dungeonPaths) {
  importMdtDungeon(key, path)
}
