import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Pull as PullComponent } from './Pull.tsx'
import { roundTo } from '../code/util.ts'
import { ReactSortable } from 'react-sortablejs'
import type { Pull } from '../code/types.ts'
import { useCallback, useMemo } from 'react'

export function Pulls() {
  const { dungeon, route, routeDetailed, dispatch } = useRouteContext()

  const pullsWithIds = useMemo(
    () => route.pulls.map((pull, idx) => ({ ...pull, id: idx })),
    [route],
  )

  const setPulls = useCallback(
    (pulls: Pull[]) => dispatch({ type: 'set_pulls', pulls }),
    [dispatch],
  )

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100

  return (
    <div className="flex flex-col p-2 gap-2 bg-gray-500 border-2 border-gray-400 rounded-md">
      <div
        className="flex justify-center mx-2"
        style={{
          backgroundColor: percent >= 100 ? 'green' : 'red',
        }}
      >
        {routeDetailed.count}/{dungeon.mdt.totalCount} - {roundTo(percent, 2).toLocaleString()}%
      </div>
      <ReactSortable list={pullsWithIds} setList={setPulls} className="flex flex-col gap-0.5">
        {routeDetailed.pulls.map((pull, idx) => (
          <PullComponent key={idx} pullIndex={idx} pull={pull} />
        ))}
      </ReactSortable>
      <button className="mx-2 bg-gray-200" onClick={() => dispatch({ type: 'add_pull' })}>
        Add pull
      </button>
    </div>
  )
}
