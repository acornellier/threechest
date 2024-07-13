import { dungeons } from '../src/data/dungeons.ts'
import fs from 'fs'
import { getWclRoute } from '../server/wclRoute.ts'
import { wclResultToRoute } from '../src/util/wclCalc.ts'
import { getDirname } from '../server/files.ts'
import { topRankings } from '../server/wclRankingsFetcher.ts'
import type { SampleRoute } from '../src/util/types.ts'
import * as path from 'path'

const dirname = getDirname(import.meta.url)

for (const dungeon of dungeons) {
  if (!dungeon.wclEncounterId) continue

  console.log(`Querying dungeon ${dungeon.key}`)
  const dungeonFolder = `${dirname}/../src/data/sampleRoutes/${dungeon.key}`
  const rankings = await topRankings(dungeon.wclEncounterId)

  for (const file of fs.readdirSync(dungeonFolder)) {
    if (!rankings.some(({ report: { code, fightID } }) => file === `${code}-${fightID}.json`)) {
      fs.rmSync(path.join(dungeonFolder, file))
    }
  }

  for (const ranking of rankings) {
    const { code, fightID } = ranking.report
    const file = `${dungeonFolder}/${code}-${fightID}.json`
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
