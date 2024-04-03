import { DungeonKey } from '../src/data/dungeonKeys.ts'
import { getDirname } from '../server/files.ts'
import { getWclToken } from '../server/wclToken.ts'
import { Spell } from '../src/data/types.ts'
import fs from 'fs'

const dirname = getDirname(import.meta.url)

type DungeonLog = { dungeonKey: DungeonKey; code: string; fightId: number }

const dungeons: DungeonLog[] = [
  { dungeonKey: 'av', code: 'yzWxcC21P4jRXJbY', fightId: 1 },
  { dungeonKey: 'bh', code: 'BjLZVQfJ4r7wP6pF', fightId: 5 },
  { dungeonKey: 'nok', code: 'Qp9Y6wTgd1xjJtZN', fightId: 1 },
  // s3
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
    await dungeonSpells(dungeon)
  }
}

interface CastEvent {
  ability: {
    guid: number
    name: string
    abilityIcon: string
  }
  source: {
    guid: number
  }
}

export async function dungeonSpells({
  code,
  fightId,
  dungeonKey,
}: {
  code: string
  fightId: number | string
  dungeonKey: DungeonKey
}) {
  const token = await getWclToken()

  const toQuery = (startTime: number) => `
query {
  reportData {
    report(code:"${code}") {
      events(fightIDs:${fightId},
             dataType:Casts,
             hostilityType:Enemies,
             useAbilityIDs:false,
             useActorIDs:false,
             startTime:${startTime},
             endTime:999999999) 
      {
        nextPageTimestamp,
        data,
      }
    }
  }
}
`

  const spells: Record<number, Spell[]> = {}
  const ids = new Set<string>()
  let nextTimestamp = 0

  while (nextTimestamp !== null) {
    const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: toQuery(nextTimestamp) }),
    })

    const json = await data.json()
    const events: CastEvent[] = json.data.reportData.report.events.data
    nextTimestamp = json.data.reportData.report.events.nextPageTimestamp

    for (const event of events) {
      const sourceId = event.source.guid
      const spellId = event.ability.guid

      const id = `${sourceId}-${spellId}`
      if (ids.has(id)) continue
      ids.add(id)

      const spell: Spell = {
        id: spellId,
        name: event.ability.name,
        icon: event.ability.abilityIcon,
      }

      spells[sourceId] ??= []
      spells[sourceId]!.push(spell)
    }
  }

  const file = `${dirname}/../src/data/spells/${dungeonKey}_spells.json`
  fs.writeFileSync(file, JSON.stringify(spells))
  console.log(`Wrote ${ids.size} spells to ${file}`)
}
