import { fetchWcl } from './wcl.ts'

export interface WclRankingTeamMember {
  id: number
  name: string
  role: 'Tank' | 'Healer' | 'DPS'
  class: string
  spec: string
}

interface WclRankingRaw {
  bracketData: number
  score: number
  report: {
    code: string | null
    fightID: number
  }
  team: WclRankingTeamMember[]
}

export interface WclRanking extends Omit<WclRankingRaw, 'report'> {
  rank: number
  report: {
    code: string
    fightID: number
  }
}

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

export async function topRankings(encounterId: number): Promise<WclRanking[]> {
  const rankingsRaw: WclRankingRaw[] = []
  for (let page = 1; page <= 4; ++page) {
    rankingsRaw.push(...(await fetchRankings(encounterId, page)))

    if (rankingsRaw.filter((ranking) => ranking.report.code).length >= 50) break
  }

  const rankings: WclRanking[] = rankingsRaw
    .map((ranking, idx) => ({ ...ranking, rank: idx + 1 }))
    .filter((ranking) => ranking.report.code !== null) as WclRanking[]

  const chosenRankings: WclRanking[] = []
  const takenComps: string[][] = []

  const pushRankings = (minCompDifferences: number) => {
    for (const ranking of rankings) {
      if (chosenRankings.length >= 5) break
      if (chosenRankings.includes(ranking)) continue

      const comp = ranking.team.map((member) => member.class)
      let smallestCompDifference = Infinity
      for (const takenComp of takenComps) {
        const difference = takenComp.filter((memberClass) => !comp.includes(memberClass)).length
        if (difference < smallestCompDifference) smallestCompDifference = difference
      }

      if (smallestCompDifference < minCompDifferences) continue

      chosenRankings.push(ranking)
      takenComps.push(comp)
    }
  }

  for (let minCompDifferences = 2; minCompDifferences >= 0; minCompDifferences--) {
    pushRankings(minCompDifferences)
  }

  return chosenRankings
}
