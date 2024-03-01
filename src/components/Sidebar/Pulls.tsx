import { useRoute } from '../RouteContext/UseRoute.ts'
import { Pull as PullComponent } from './Pull.tsx'
import { roundTo } from '../../code/util.ts'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import type { PullDetailed } from '../../code/types.ts'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '../Common/Button.tsx'

type SortablePull = PullDetailed & ItemInterface

export function Pulls() {
  const { dungeon, routeDetailed, dispatch } = useRoute()

  const [ghostPullIndex, setGhostPullIndex] = useState<number | null>(null)

  const pullsWithGhost = useMemo(() => {
    const pulls: SortablePull[] = [...routeDetailed.pulls]
    if (ghostPullIndex !== null) {
      pulls.splice(ghostPullIndex + 1, 0, {
        ...routeDetailed.pulls[ghostPullIndex],
        id: -1,
        filtered: true,
      })
    }
    return pulls
  }, [routeDetailed.pulls, ghostPullIndex])

  const setPulls = useCallback(
    (pulls: SortablePull[]) => {
      if (pulls.every((pull, idx) => pull.id === pullsWithGhost[idx].id)) return

      dispatch({ type: 'set_pulls', pulls: pulls.filter(({ filtered }) => !filtered) })
    },
    [dispatch, pullsWithGhost],
  )

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100
  const percentColor =
    percent >= 102 ? 'bg-[#e21e1e]' : percent >= 100 ? 'bg-[#0f950f]' : 'bg-[#426bff]'

  return (
    <div className="flex flex-col p-2 gap-2 bg-gray-900 border-2 border-gray-700 rounded-md">
      <div className={`flex justify-center mx-2 ${percentColor} rounded-sm text-white font-bold`}>
        {routeDetailed.count}/{dungeon.mdt.totalCount} -{' '}
        {roundTo(percent, 2).toFixed(2).toLocaleString()}%
      </div>
      <ReactSortable
        onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
        onEnd={() => setGhostPullIndex(null)}
        list={pullsWithGhost}
        setList={setPulls}
        className="flex flex-col gap-[3px] relative"
      >
        {pullsWithGhost.map((pull, idx) => (
          <PullComponent key={idx} pullIndex={idx} pull={pull} ghost={pull.filtered} />
        ))}
      </ReactSortable>
      <Button className="justify-center" onClick={() => dispatch({ type: 'add_pull' })}>
        Add pull
      </Button>
    </div>
  )
}
