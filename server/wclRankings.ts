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
    code: string
    fightID: number
  }
  team: WclRankingTeamMember[]
}

export interface WclRanking extends WclRankingRaw {
  rank: number
}

export async function topRankings(encounterId: number): Promise<WclRanking[]> {
  const data = await fetchWcl<{
    worldData: { encounter: { fightRankings: { rankings: WclRanking[] } } }
  }>(`
query {
  worldData {
    encounter(id: ${encounterId}) {
      fightRankings(leaderboard: LogsOnly)
    }
  }
}
`)

  const rankingsRaw = data.worldData.encounter.fightRankings.rankings
  const rankings = rankingsRaw.map((ranking, index) => ({ ...ranking, rank: index + 1 }))

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

  pushRankings(2)
  pushRankings(1)
  pushRankings(0)

  return chosenRankings
}
