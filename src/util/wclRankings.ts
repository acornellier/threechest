export interface WclRankingRaw {
  bracketData: number
  score: number
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

export interface WclRanking extends Omit<WclRankingRaw, 'report'> {
  rank: number
  report: {
    code: string
    fightID: number
  }
}

export function pickTopRankings(rankings: WclRanking[], count: number) {
  return rankings.toSorted((a, b) => b.bracketData - a.bracketData).slice(0, count)
}

export function pickVariedComps(rankings: WclRanking[], count: number) {
  const chosenRankings: WclRanking[] = []
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
