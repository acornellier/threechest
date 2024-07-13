import { fetchWcl } from './wcl.ts'
import {
  pickTopRankings,
  pickVariedComps,
  type WclRanking,
  type WclRankingRaw,
} from '../src/util/wclRankings.ts'

async function fetchRankings(encounterId: number, page: number): Promise<WclRankingRaw[]> {
  const data = await fetchWcl<{
    worldData: { encounter: { fightRankings: { rankings: WclRankingRaw[] } } }
  }>(`
query {
  worldData {
    encounter(id: ${encounterId}) {
      fightRankings(leaderboard: Any, page: ${page})
    }
  }
}
`)

  return data.worldData.encounter.fightRankings.rankings
}

export async function fetchTopRankings(encounterId: number): Promise<WclRanking[]> {
  const rankingsRaw: WclRankingRaw[] = []
  for (let page = 1; page <= 4; ++page) {
    rankingsRaw.push(...(await fetchRankings(encounterId, page)))

    if (rankingsRaw.filter((ranking) => ranking.report.code).length >= 50) break
  }

  const rankings: WclRanking[] = rankingsRaw
    .map((ranking, idx) => ({ ...ranking, rank: idx + 1 }))
    .filter((ranking) => ranking.report.code !== null) as WclRanking[]

  return [...pickVariedComps(rankings, 5), ...pickTopRankings(rankings, 10)]
}
