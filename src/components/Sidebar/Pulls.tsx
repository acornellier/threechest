import { useRoute } from '../RouteContext/UseRoute.ts'
import { Pull as PullComponent } from './Pull.tsx'
import { roundTo } from '../../code/util.ts'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import type { Pull, PullDetailed } from '../../code/types.ts'
import { useCallback, useMemo, useState } from 'react'

type SortablePull = PullDetailed & ItemInterface

export function Pulls() {
  const { dungeon, routeDetailed, dispatch } = useRoute()

  const pullsWithIds = useMemo<SortablePull[]>(
    () => routeDetailed.pulls.map((pull, idx) => ({ ...pull, id: idx.toString() })),
    [routeDetailed.pulls],
  )

  const [ghostPullIndex, setGhostPullIndex] = useState<number | null>(null)

  const pullsWithGhost = useMemo(() => {
    const pulls = [...pullsWithIds]
    if (ghostPullIndex !== null) {
      pulls.splice(ghostPullIndex + 1, 0, {
        ...pullsWithIds[ghostPullIndex],
        id: `${ghostPullIndex}-ghost`,
        filtered: true,
      })
    }
    return pulls
  }, [pullsWithIds, ghostPullIndex])

  const setPulls = useCallback(
    (pulls: SortablePull[]) => {
      dispatch({ type: 'set_pulls', pulls: pulls.filter(({ filtered }) => !filtered) })
    },
    [dispatch],
  )

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100
  const percentColor = percent >= 102 ? 'bg-[red]' : percent >= 100 ? 'bg-[lime]' : 'bg-[#426bff]'

  return (
    <div className="flex flex-col p-2 gap-2 bg-gray-500 border-2 border-gray-400 rounded-md">
      <div className={`flex justify-center mx-2 ${percentColor}`}>
        {routeDetailed.count}/{dungeon.mdt.totalCount} -{' '}
        {roundTo(percent, 2).toFixed(2).toLocaleString()}%
      </div>
      <ReactSortable
        onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
        onEnd={() => setGhostPullIndex(null)}
        list={pullsWithGhost}
        setList={setPulls}
        className="flex flex-col gap-0.5 relative"
      >
        {pullsWithGhost.map((pull, idx) => (
          <PullComponent key={idx} pullIndex={idx} pull={pull} ghost={pull.filtered} />
        ))}
      </ReactSortable>
      <button className="mx-2 bg-gray-200" onClick={() => dispatch({ type: 'add_pull' })}>
        Add pull
      </button>
    </div>
  )
}
