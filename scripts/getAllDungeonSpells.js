import { getDungeonSpells } from './getDungeonSpells.js'

const dungeons = [
  {
    dungeonKey: 'ad',
    code: 'd2DNBHjphC1Wnb3t',
    fightId: 2,
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
