import { dungeons } from '../src/data/dungeons.ts'
import fs from 'fs'
import { getWclRoute } from '../server/wclRoute.ts'
import { fetchFightTeam } from '../server/wcl.ts'
import { type WclResult, wclResultToRoute } from '../src/util/wclCalc.ts'
import { getDirname } from '../server/files.ts'
import { fetchTopRankings } from '../server/wclRankingsFetcher.ts'
import type { SampleRoute } from '../src/util/types.ts'
import * as path from 'path'
import { shuffle } from '../src/util/nodash.ts'
import type { WclFightRanking, WclRanking, WclSpecRanking } from '../src/util/wclRankings.ts'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'

const dirname = getDirname(import.meta.url)

const toFileName = (report: { code: string; fightID: number }) =>
  `${report.code}-${report.fightID}.json`

interface DungeonRankings {
  dungeonKey: DungeonKey
  dungeonFolder: string
  rankings: Array<WclFightRanking | WclSpecRanking>
}

const arg = process.argv.slice(2)
const specificDungeon: DungeonKey | null =
  arg.length && dungeonKeys.includes(arg[0]!) ? (arg[0] as DungeonKey) : null
const ignoreCache = arg.includes('--reset')
const recalcFromCache = arg.includes('--recalc')

const dungeonRankings: DungeonRankings[] = []
for (const dungeon of shuffle(dungeons)) {
  if (specificDungeon && dungeon.key !== specificDungeon) continue

  if (!dungeon.wclEncounterId) continue

  const dungeonFolder = `${dirname}/../src/data/sampleRoutes/${dungeon.key}`
  if (!fs.existsSync(dungeonFolder)) fs.mkdirSync(dungeonFolder)

  console.log(`Querying dungeon ${dungeon.key}`)
  const rankings = await fetchTopRankings(dungeon.wclEncounterId)

  dungeonRankings.push({
    dungeonKey: dungeon.key,
    dungeonFolder,
    rankings,
  })
}

for (const { dungeonFolder, rankings, dungeonKey } of dungeonRankings) {
  console.log(`Updating and removing rankings for ${dungeonKey}`)

  // Remove old rankings
  for (const file of fs.readdirSync(dungeonFolder)) {
    if (!rankings.some(({ report }) => file === toFileName(report))) {
      fs.rmSync(path.join(dungeonFolder, file))
    }
  }

  // Update existing rankings
  for (const ranking of rankings) {
    const { code, fightID } = ranking.report
    const file = `${dungeonFolder}/${toFileName(ranking.report)}`
    if (!fs.existsSync(file)) continue

    const sampleRoute = JSON.parse(fs.readFileSync(file).toString()) as SampleRoute
    if (!sampleRoute.wclRanking || !('rank' in sampleRoute.wclRanking)) {
      continue
    }

    const oldRank = sampleRoute.wclRanking.rank
    sampleRoute.wclRanking =
      'rank' in ranking ? ranking : { ...ranking, team: sampleRoute.wclRanking.team }
    fs.writeFileSync(file, JSON.stringify(sampleRoute))
    if (oldRank !== sampleRoute.wclRanking.rank) {
      console.log(
        `Updated ${code}-${fightID} from rank ${oldRank} to ${sampleRoute.wclRanking.rank}`,
      )
    }
  }
}

for (const { dungeonFolder, rankings, dungeonKey } of dungeonRankings) {
  console.log(`=== Adding new rankings for ${dungeonKey} ===`)

  // Add new rankings and calculate routes
  for (const ranking of rankings) {
    const { code, fightID } = ranking.report
    const file = `${dungeonFolder}/${toFileName(ranking.report)}`
    if (fs.existsSync(file) && !ignoreCache && !recalcFromCache) continue

    let result: WclResult | null = null
    try {
      result = (await getWclRoute(code, fightID, ignoreCache)).result
    } catch (e) {
      if ((e as Error).message === 'You do not have permission to view this report.') {
        console.log(`Private log: ${code}`)
        continue
      }
    }

    if (!result) {
      continue
    }

    const { route, errors } = wclResultToRoute(result)
    const wclRanking = await getWclRanking(ranking, code, fightID)
    const tank = wclRanking.team.find((m) => m.role === 'Tank') ?? wclRanking.team[0]!
    route.name = `${tank.name}${tank.name.endsWith('s') ? "'" : "'s"} +${wclRanking.bracketData}`

    if (errors.length) {
      console.error(`Errors parsing ${code}-${fightID}: ${errors.join('\n')}`)
    }

    const sampleRoute: SampleRoute = {
      route,
      wclRanking,
    }

    fs.writeFileSync(file, JSON.stringify(sampleRoute))
  }
}

async function getWclRanking(
  ranking: WclFightRanking | WclSpecRanking,
  code: string,
  fightID: number,
): Promise<WclRanking> {
  if ('team' in ranking) {
    return ranking
  }

  const team = await fetchFightTeam(code, fightID)
  return { ...ranking, team }
}
