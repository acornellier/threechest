import { fetchWcl } from './wcl.ts'
import {
  pickTopRankings,
  pickVariedComps,
  tankSpecs,
  type WclFightRanking,
  type WclFightRankingRaw,
  type WclSpecRanking,
  type WclSpecRankingRaw,
} from '../src/util/wclRankings.ts'

async function fetchCharacterRankings(
  encounterId: number,
  className: string,
  specName: string,
  page: number,
): Promise<WclSpecRankingRaw[]> {
  const data = await fetchWcl<{
    worldData: { encounter: { characterRankings: { rankings: WclSpecRankingRaw[] } } }
  }>(`
query {
  worldData {
    encounter(id: ${encounterId}) {
      characterRankings(className: "${className}", specName: "${specName}", leaderboard: Any, page: ${page})
    }
  }
}
`)

  return data.worldData.encounter.characterRankings.rankings
}

async function fetchRankings(encounterId: number, page: number): Promise<WclFightRankingRaw[]> {
  const data = await fetchWcl<{
    worldData: { encounter: { fightRankings: { rankings: WclFightRankingRaw[] } } }
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

export async function fetchTopRankings(
  encounterId: number,
): Promise<Array<WclFightRanking | WclSpecRanking>> {
  const rankingsRaw: WclFightRankingRaw[] = []
  for (let page = 1; page <= 4; ++page) {
    rankingsRaw.push(...(await fetchRankings(encounterId, page)))

    if (rankingsRaw.filter((ranking) => ranking.report.code).length >= 50) break
  }

  const rankings: WclFightRanking[] = rankingsRaw
    .map((ranking, idx) => ({ ...ranking, rank: idx + 1 }))
    .filter((ranking) => ranking.report.code !== null) as WclFightRanking[]

  const base = [...pickVariedComps(rankings, 10), ...pickTopRankings(rankings, 10)]

  const existingIds = new Set(base.map((r) => `${r.report.code}-${r.report.fightID}`))

  const specRankings: WclSpecRanking[] = []
  for (const tank of tankSpecs) {
    const countForSpec = base.filter((r) =>
      r.team.some((m) => m.class === tank.class && m.spec === tank.spec),
    ).length

    const needed = 5 - countForSpec
    if (needed <= 0) continue

    const raw = await fetchCharacterRankings(encounterId, tank.class, tank.spec, 1)
    const filtered = raw
      .filter((r) => r.report.code && !existingIds.has(`${r.report.code}-${r.report.fightID}`))
      .slice(0, needed)
      .map((r) => ({
        ...r,
        report: r.report as { code: string; fightID: number },
        tankSpec: tank,
      }))

    specRankings.push(...filtered)
    filtered.forEach((r) => existingIds.add(`${r.report.code}-${r.report.fightID}`))
  }

  return [...base, ...specRankings].filter((ranking) => !!ranking.report.code)
}
