import { getDungeonSpells } from './getDungeonSpells.js'

const dungeons = [
  {
    dungeonKey: 'ad',
    code: '6gAz9tCPKFRkVQJv',
    fightId: 67,
  },
  {
    dungeonKey: 'eb',
    code: 'LFwG2JxXfQnVyYZT',
    fightId: 3,
  },
]

for (const dungeon of dungeons) {
  console.log(`Fetching ${dungeon.dungeonKey}...`)
  await getDungeonSpells(dungeon)
}
