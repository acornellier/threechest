import { Pull, PullDetailed } from '../code/types.ts'

export function augmentPulls(pulls: Pull[]): PullDetailed[] {
  const pullsDetailed: PullDetailed[] = []

  let countCumulative = 0
  for (const pull of pulls) {
    const count = pull.mobSpawns.reduce((acc, mobSpawn) => acc + mobSpawn.mob.count, 0)
    countCumulative += count

    pullsDetailed.push({
      ...pull,
      count,
      countCumulative,
    })
  }

  return pullsDetailed
}
