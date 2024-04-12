import type { DungeonKey } from '../src/data/dungeonKeys.ts'
import { getDirname } from '../server/files.ts'
import fs from 'fs'
import { sum } from 'd3'
import type { SpellIdMap } from '../src/data/types.ts'
import { fetchWcl } from './wcl.ts'

const dirname = getDirname(import.meta.url)

type DungeonLog = { dungeonKey: DungeonKey; code: string; fightId: number }

const dungeons: DungeonLog[] = [
  { dungeonKey: 'aa', code: 'gkfYnQ9mvjChc2Gd', fightId: 1 },
  { dungeonKey: 'av', code: 'yzWxcC21P4jRXJbY', fightId: 1 },
  { dungeonKey: 'bh', code: 'BjLZVQfJ4r7wP6pF', fightId: 5 },
  { dungeonKey: 'hoi', code: 'yzWxcC21P4jRXJbY', fightId: 5 },
  { dungeonKey: 'nelth', code: '6xZb9QNfPLyCHKdM', fightId: 1 },
  { dungeonKey: 'nok', code: 'Qp9Y6wTgd1xjJtZN', fightId: 1 },
  { dungeonKey: 'rlp', code: 'HYC1GWAvgc7NaLxp', fightId: 5 },
  { dungeonKey: 'uld', code: '23BYFzapv6KmRdV7', fightId: 1 },
  // s3
  // { dungeonKey: 'ad', code: '6gAz9tCPKFRkVQJv', fightId: 67 },
  // { dungeonKey: 'brh', code: 'C42jfKx1PkcYFmXT', fightId: 120 },
  // { dungeonKey: 'dht', code: 'XbymrF9fGxkwaB8h', fightId: 5 },
  // { dungeonKey: 'eb', code: 'LFwG2JxXfQnVyYZT', fightId: 3 },
  // { dungeonKey: 'fall', code: 'kLDbtFm926HG1Jwy', fightId: 106 },
  // { dungeonKey: 'rise', code: 'GLDKQX1cynTJ9gdY', fightId: 29 },
  // { dungeonKey: 'tott', code: 'KytwXgGaZ7vk2WBd', fightId: 1 },
  // { dungeonKey: 'wcm', code: 'ZA3yV8WGr2v4TxMY', fightId: 22 },
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
    id: number
    guid: number
  }
}

interface DebuffEvent {
  sourceID: number
  abilityGameID: number
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
  const toCastQuery = (startTime: number) => `
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

  const spellSets: Record<number, Set<number>> = {}
  const actorIdToGuid: Record<number, number> = {}
  let nextTimestamp = 0

  while (nextTimestamp !== null) {
    const data = await fetchWcl(toCastQuery(nextTimestamp))
    const events: CastEvent[] = data.reportData.report.events.data
    nextTimestamp = data.reportData.report.events.nextPageTimestamp

    for (const event of events) {
      const sourceGuid = event.source.guid
      const sourceId = event.source.id
      const spellId = event.ability.guid

      spellSets[sourceGuid] ??= new Set()
      spellSets[sourceGuid]!.add(spellId)
      actorIdToGuid[sourceId] = event.source.guid
    }
  }

  const toDebuffQuery = (startTime: number) => `
query {
  reportData {
    report(code:"${code}") {
      events(fightIDs:${fightId},
             dataType:Debuffs,
             hostilityType:Friendlies,
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

  nextTimestamp = 0
  while (nextTimestamp !== null) {
    const data = await fetchWcl(toDebuffQuery(nextTimestamp))
    const events: DebuffEvent[] = data.reportData.report.events.data
    nextTimestamp = data.reportData.report.events.nextPageTimestamp

    for (const event of events) {
      const sourceId = event.sourceID
      const enemyGuid = actorIdToGuid[sourceId]
      if (!enemyGuid) continue

      const spellId = event.abilityGameID
      spellSets[enemyGuid] ??= new Set()
      spellSets[enemyGuid]!.add(spellId)
    }
  }

  const enemyDamageDoneTableQuery = `
query {
  reportData {
    report(code:"${code}") {
      table: table(
        fightIDs: ${fightId}
        dataType: DamageDone
        hostilityType: Enemies
        viewBy: Ability
      )
    }
  }
}
`

  const enemyDamageDoneTable = await fetchWcl(enemyDamageDoneTableQuery)
  const rows = enemyDamageDoneTable.reportData.report.table.data.entries
  for (const row of rows) {
    if (row.name === 'Melee') continue

    const entries = row.subentries ?? [row]

    for (const entry of entries) {
      const enemyGuid = actorIdToGuid[entry.actor]
      if (!enemyGuid) continue

      const spellId = entry.guid
      spellSets[enemyGuid] ??= new Set()
      spellSets[enemyGuid]!.add(spellId)

      if (spellId === 1) console.log(row, entry)
    }
  }

  const spells = Object.entries(spellSets).reduce((acc, [enemyId, set]) => {
    acc[Number(enemyId)] = [...set]
    return acc
  }, {} as SpellIdMap)

  const file = `${dirname}/../src/data/spells/${dungeonKey}/${dungeonKey}_spells.json`
  fs.writeFileSync(file, JSON.stringify(spells))

  const count = sum(Object.values(spellSets).map((set) => set.size))
  console.log(`Wrote ${count} spells to ${file}`)
}
