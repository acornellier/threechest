import { Pull as PullComponent } from './Pull.tsx'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import type { PullDetailed } from '../../code/types.ts'
import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useDungeon, useRouteDetailed } from '../../store/hooks.ts'
import { addPull, deletePull, setPulls } from '../../store/reducer.ts'
import { roundTo } from '../../code/util.ts'

type SortablePull = PullDetailed & ItemInterface

interface RightClickedSettings {
  x: number
  y: number
  pullIndex: number
}

export function Pulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const routeDetailed = useRouteDetailed()

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

  const setPullsWrapper = useCallback(
    (pulls: SortablePull[]) => {
      if (pulls.every((pull, idx) => pull.id === pullsWithGhost[idx].id)) return

      dispatch(setPulls(pulls.filter(({ filtered }) => !filtered)))
    },
    [dispatch, pullsWithGhost],
  )

  const [rightClickedSettings, setRightClickedSettings] = useState<RightClickedSettings | null>(
    null,
  )

  const onRightClick = useCallback((e: MouseEvent, pullIndex: number) => {
    setRightClickedSettings({
      x: e.pageX,
      y: e.pageY,
      pullIndex,
    })
  }, [])

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100
  const percentColor =
    percent >= 102 ? 'bg-[#e21e1e]' : percent >= 100 ? 'bg-[#0f950f]' : 'bg-[#426bff]'

  let pullIndex = 0
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
        setList={setPullsWrapper}
        className="flex flex-col gap-[3px] relative"
      >
        {pullsWithGhost.map((pull) => (
          <PullComponent
            key={pull.id}
            pullIndex={pull.id === -1 ? pullIndex : pullIndex++}
            pull={pull}
            ghost={pull.filtered}
            onRightClick={onRightClick}
          />
        ))}
      </ReactSortable>
      <Button className="justify-center" onClick={() => dispatch(addPull())}>
        Add pull
      </Button>
      {rightClickedSettings && (
        <div
          className="fixed bg-gray-900 z-[9999] p-2 rounded-md"
          style={{
            top: rightClickedSettings.y,
            left: rightClickedSettings.x,
          }}
        >
          <div className="flex flex-col gap-2">
            <Button
              short
              onClick={() => {
                dispatch(addPull(rightClickedSettings.pullIndex))
                setRightClickedSettings(null)
              }}
            >
              Insert before
            </Button>
            <Button
              short
              onClick={() => {
                dispatch(addPull(rightClickedSettings.pullIndex + 1))
                setRightClickedSettings(null)
              }}
            >
              Insert after
            </Button>
            <Button
              short
              onClick={() => {
                dispatch(deletePull(rightClickedSettings.pullIndex))
                setRightClickedSettings(null)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
