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
  tankSpec?: { class: string; spec: string }
}

export type Spec = { class: string; spec: string; icon: string }

export const tankSpecs: Spec[] = [
  { class: 'DeathKnight', spec: 'Blood', icon: 'spell_deathknight_bloodpresence' },
  { class: 'DemonHunter', spec: 'Vengeance', icon: 'ability_demonhunter_spectank' },
  { class: 'Druid', spec: 'Guardian', icon: 'ability_racial_bearform' },
  { class: 'Monk', spec: 'Brewmaster', icon: 'spell_monk_brewmaster_spec' },
  { class: 'Paladin', spec: 'Protection', icon: 'ability_paladin_shieldofthetemplar' },
  { class: 'Warrior', spec: 'Protection', icon: 'ability_warrior_defensivestance' },
]

export function pickTopRankings<TRanking extends WclRanking>(rankings: TRanking[], count: number) {
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

  return chosenRankings.toSorted((a, b) => b.score - a.score)
}

export function pickSpecRankings<TRanking extends WclRanking>(
  rankings: TRanking[],
  spec: Spec,
  count: number,
) {
  return rankings
    .toSorted((a, b) => b.score - a.score)
    .filter((ranking) =>
      ranking.team.some((member) => member.class === spec.class && member.spec === spec.spec),
    )
    .slice(0, count)
}
