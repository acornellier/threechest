import type { SampleRoute } from '../src/util/types.ts'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'
import { getDirname } from './files.ts'
import fs from 'fs'
import * as path from 'path'
import type { WclRanking } from '../src/util/wclRankings.ts'
import { routeToMdtRoute } from '../src/util/mdtUtil.ts'
import { encodeRoute } from './encodeRoute'

export interface TopRoute {
  mdtString: string
  wclRanking: WclRanking
}

export type TopRoutes = Record<DungeonKey, TopRoute[]>

const topRoutes = dungeonKeys.reduce((acc, key) => {
  acc[key as DungeonKey] = []
  return acc
}, {} as TopRoutes)

const dirname = getDirname(import.meta.url)

for (const dungeonKey of dungeonKeys) {
  const dungeonFolder = `${dirname}/../src/data/sampleRoutes/${dungeonKey}`
  if (!fs.existsSync(dungeonFolder)) continue

  const files = fs.readdirSync(dungeonFolder)
  for (const file of files) {
    const sampleRoute = JSON.parse(
      fs.readFileSync(path.join(dungeonFolder, file)).toString(),
    ) as SampleRoute

    console.log(sampleRoute)
    if (sampleRoute.wclRanking === undefined) continue

    const mdtRoute = routeToMdtRoute(sampleRoute.route)
    topRoutes[dungeonKey].push({
      mdtString: await encodeRoute(JSON.stringify({ mdtRoute })),
      wclRanking: sampleRoute.wclRanking,
    })
  }
}

export default async () => ({
  data: topRoutes,
})
