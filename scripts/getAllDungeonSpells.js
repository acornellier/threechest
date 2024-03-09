import { getDungeonSpells } from './getDungeonSpells.js'

const dungeons = [
  { dungeonKey: 'ad', code: '6gAz9tCPKFRkVQJv', fightId: 67 },
  { dungeonKey: 'brh', code: 'C42jfKx1PkcYFmXT', fightId: 120 },
  { dungeonKey: 'dht', code: 'XbymrF9fGxkwaB8h', fightId: 5 },
  { dungeonKey: 'eb', code: 'LFwG2JxXfQnVyYZT', fightId: 3 },
  { dungeonKey: 'fall', code: 'kLDbtFm926HG1Jwy', fightId: 106 },
  { dungeonKey: 'rise', code: 'GLDKQX1cynTJ9gdY', fightId: 29 },
  { dungeonKey: 'tott', code: 'KytwXgGaZ7vk2WBd', fightId: 1 },
  { dungeonKey: 'wcm', code: 'ZA3yV8WGr2v4TxMY', fightId: 22 },
]

const filterDungeonKey = process.argv[2]

for (const dungeon of dungeons) {
  if (!filterDungeonKey || dungeon.dungeonKey === filterDungeonKey) {
    console.log(`Fetching ${dungeon.dungeonKey}...`)
    await getDungeonSpells(dungeon)
  }
}
