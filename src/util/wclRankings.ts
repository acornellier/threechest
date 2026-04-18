export interface WclFightRankingRaw {
  bracketData: number // key level
  score: number
  rank: number
  report: {
    code: string | null
    fightID: number
  }
  team: WclRankingTeamMember[]
}

export interface WclRankingTeamMember {
  id: number
  name: string
  role: 'Tank' | 'Healer' | 'DPS'
  class: string
  spec: string
}

export interface WclFightRanking extends Omit<WclFightRankingRaw, 'report'> {
  report: {
    code: string
    fightID: number
  }
}

export interface WclSpecRankingRaw {
  bracketData: number
  score: number
  report: {
    code: string | null
    fightID: number
  }
}

export interface WclSpecRanking extends Omit<WclSpecRankingRaw, 'report'> {
  report: {
    code: string
    fightID: number
  }
  tankSpec: {
    class: string
    spec: string
  }
}

export type WclRanking = Omit<WclFightRanking, 'rank'> & {
  rank?: number
}

export function pickTopRankings(rankings: WclFightRanking[], count: number) {
  return rankings.toSorted((a, b) => b.score - a.score).slice(0, count)
}

export function pickVariedComps<TRanking extends WclRanking>(rankings: TRanking[], count: number) {
  const chosenRankings: TRanking[] = []
  const takenComps: string[][] = []

  const pushRankings = (minCompDifferences: number) => {
    for (const ranking of rankings) {
      if (chosenRankings.length >= count) break
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
