import fs from 'fs'
import { Spell } from '../src/data/types.ts'
import { getWclToken } from '../server/wclToken.ts'
import { getDirname } from '../server/files.ts'
import { DungeonKey } from '../src/data/dungeonKeys.ts'

const dirname = getDirname(import.meta.url)

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
  const ids = new Set()
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
      const spellId = event.ability.guid
      if (ids.has(spellId)) continue

      ids.add(spellId)

      const spell: Spell = {
        id: spellId,
        name: event.ability.name,
        icon: event.ability.abilityIcon,
      }

      spells[event.source.guid] ??= []
      spells[event.source.guid]!.push(spell)
    }
  }

  const file = `${dirname}/../src/data/spells/${dungeonKey}_spells.json`
  fs.writeFileSync(file, JSON.stringify(spells))
  console.log(`Wrote to ${file}`)
}
