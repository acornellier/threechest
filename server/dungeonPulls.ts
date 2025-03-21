import { dungeons } from '../src/data/dungeons.ts'
import { fetchWcl, getFight, type WclFight } from './wcl.ts'

interface DeathEvent {
  timestamp: number
  targetID: number
  targetInstance?: number
}

async function getDeathEvents(code: string, fight: WclFight) {
  const query = `
query {
  reportData {
    report(code: "${code}") {
      events(fightIDs: [${fight.id}], dataType: Deaths, hostilityType: Enemies) {
        data
      }
    }
  }
}`

  const json = await fetchWcl<{ reportData: { report: { events: { data: DeathEvent[] } } } }>(query)
  return json.reportData.report.events.data
}

export async function getDungeonPulls(
  code: string,
  fightId: 'last' | string | number,
): Promise<void> {
  const fight = await getFight(code, fightId)

  const deathEvents = await getDeathEvents(code, fight)

  const dungeon = dungeons.find((dungeon) => dungeon.wclEncounterId === fight.encounterID)
  if (!dungeon) throw new Error(`Dungeon not supported, WCL encounter ID ${fight.encounterID}`)

  let totalPercent = 0
  fight.dungeonPulls.map((pull, pullIdx) => {
    const duration = (pull.endTime - pull.startTime) / 1000
    let count = 0
    for (const enemy of pull.enemyNPCs) {
      const mobSpawn = dungeon.mobSpawnsList.find(({ mob }) => mob.id === enemy.gameID)
      if (!mobSpawn) continue

      for (
        let instanceID = enemy.minimumInstanceID;
        instanceID <= enemy.maximumInstanceID;
        instanceID++
      ) {
        const died = deathEvents.some(
          (death) =>
            death.timestamp >= pull.startTime &&
            death.timestamp <= pull.endTime &&
            death.targetID === enemy.id &&
            (!death.targetInstance || death.targetInstance === instanceID),
        )
        if (!died) continue

        count += mobSpawn.mob.count
      }
    }

    if (count === 0) return

    const percent = (count / dungeon.mdt.totalCount) * 100
    totalPercent += percent
    const percentPerMin = (percent / duration) * 60
    const pullNum = pullIdx + 1
    console.log(
      `Pull ${pullNum.toString().padStart(2)} | ${percentPerMin.toFixed(1).padStart(4)}%/min | ${percent.toFixed(2).padStart(5)}% in ${duration.toFixed(0).padStart(3)} seconds | ${pull.name}`,
    )
  })

  console.log(`Total percent: ${totalPercent.toFixed(1)}%`)
}
