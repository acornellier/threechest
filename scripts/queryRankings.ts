import { dungeons } from '../src/data/dungeons.ts'
import fs from 'fs'
import { getWclRoute } from '../server/wclRoute.ts'
import { wclResultToRoute } from '../src/util/wclCalc.ts'
import { getDirname } from '../server/files.ts'
import { fetchTopRankings } from '../server/wclRankingsFetcher.ts'
import type { SampleRoute } from '../src/util/types.ts'
import * as path from 'path'
import { shuffle } from '../src/util/nodash.ts'
import type { WclRanking } from '../src/util/wclRankings.ts'
import type { DungeonKey } from '../src/data/dungeonKeys.ts'

const dirname = getDirname(import.meta.url)

const toFileName = (report: { code: string; fightID: number }) =>
  `${report.code}-${report.fightID}.json`

interface DungeonRankings {
  dungeonKey: DungeonKey
  dungeonFolder: string
  rankings: WclRanking[]
}

const dungeonRankings: DungeonRankings[] = []
for (const dungeon of shuffle(dungeons)) {
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
  console.log(`Updating and adding rankings for ${dungeonKey}`)

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
    const oldRank = sampleRoute.wclRanking?.rank
    sampleRoute.wclRanking = ranking
    fs.writeFileSync(file, JSON.stringify(sampleRoute))
    if (oldRank !== ranking.rank)
      console.log(`Updated ${code}-${fightID} from rank ${oldRank} to ${ranking.rank}`)
  }
}

for (const { dungeonFolder, rankings, dungeonKey } of dungeonRankings) {
  console.log(`Adding new rankings for ${dungeonKey}`)

  // Add new rankings
  for (const ranking of rankings) {
    const { code, fightID } = ranking.report
    const file = `${dungeonFolder}/${toFileName(ranking.report)}`
    if (fs.existsSync(file)) continue

    const { result } = await getWclRoute(code, fightID)
    const { route, errors } = wclResultToRoute(result)
    const tank = ranking.team.find((member) => member.role === 'Tank') ?? ranking.team[0]!
    route.name = `${tank.name}${tank.name.endsWith('s') ? "'" : "'s"} +${ranking.bracketData}`

    if (errors.length) {
      console.error(`Errors parsing ${code}-${fightID}: ${errors.join('\n')}`)
    }

    const sampleRoute: SampleRoute = {
      route,
      wclRanking: ranking,
    }

    fs.writeFileSync(file, JSON.stringify(sampleRoute))
  }
}
