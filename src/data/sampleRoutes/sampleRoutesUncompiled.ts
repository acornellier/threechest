import type { SampleRoute } from '../../util/types.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import { decodeRoute } from '../../../server/decodeRoute'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'
import { getDirname } from '../../../server/files.ts'
import fs from 'fs'
import * as path from 'path'

type SampleRouteDefinition = Omit<SampleRoute, 'route'> & {
  mdt: string
  name?: string
}

const sampleRouteDefinitions: Record<DungeonKey, SampleRouteDefinition[]> = {
  ak: [],
  cot: [],
  db: [],
  gb: [],
  mot: [],
  nw: [],
  sob: [],
  sv: [],
}

async function convertRouteDefinition({
  affix,
  difficulty,
  name,
  mdt,
}: SampleRouteDefinition): Promise<SampleRoute> {
  const mdtRoute = await decodeRoute(mdt)
  const route = mdtRouteToRoute(mdtRoute)

  if (name) route.name = name

  return {
    affix,
    difficulty,
    route,
  }
}

export type SampleRoutes = Record<DungeonKey, SampleRoute[]>

const sampleRoutes = dungeonKeys.reduce((acc, key) => {
  acc[key as DungeonKey] = []
  return acc
}, {} as SampleRoutes)

const difficultyToNum = (difficulty: SampleRoute['difficulty']) =>
  difficulty === undefined
    ? 0
    : difficulty === 'beginner'
      ? 1
      : difficulty === 'intermediate'
        ? 2
        : 3

const affixToNum = (affix: SampleRoute['affix']) =>
  affix === undefined ? 0 : affix === 'fortified' ? 1 : 2

const wclRankingToNum = (wclRanking: SampleRoute['wclRanking']) =>
  wclRanking === undefined ? -Infinity : -wclRanking.score

function sortSampleRoutes(route1: SampleRoute, route2: SampleRoute) {
  if (route1.wclRanking !== route2.wclRanking) {
    return wclRankingToNum(route1.wclRanking) - wclRankingToNum(route2.wclRanking)
  }

  if (route1.difficulty !== route2.difficulty) {
    return difficultyToNum(route1.difficulty) - difficultyToNum(route2.difficulty)
  }

  if (route1.affix !== route2.affix) {
    return affixToNum(route1.affix) - affixToNum(route2.affix)
  }

  return route1.route.name.localeCompare(route2.route.name)
}

const dirname = getDirname(import.meta.url)

for (const dungeonKey of dungeonKeys) {
  for (const routeDefinition of sampleRouteDefinitions[dungeonKey]) {
    const sampleRoute = await convertRouteDefinition(routeDefinition)
    sampleRoutes[dungeonKey].push(sampleRoute)
  }

  const dungeonFolder = `${dirname}/${dungeonKey}`
  if (fs.existsSync(dungeonFolder)) {
    const files = fs.readdirSync(dungeonFolder)
    for (const file of files) {
      const sampleRoute = JSON.parse(
        fs.readFileSync(path.join(dungeonFolder, file)).toString(),
      ) as SampleRoute
      sampleRoutes[dungeonKey].push(sampleRoute)
    }
  }

  sampleRoutes[dungeonKey].sort(sortSampleRoutes)
}

export default async () => ({
  data: sampleRoutes,
})
