import { Pull as PullComponent } from './Pull.tsx'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import type { PullDetailed } from '../../code/types.ts'
import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useDungeon, useRouteDetailed } from '../../store/hooks.ts'
import { addPull, clearRoute, setPulls } from '../../store/routesReducer.ts'
import { mobCountPercentStr } from '../../code/util.ts'
import { PullContextMenu, RightClickedSettings } from './PullContextMenu.tsx'
import { usePullShortcuts } from './usePullShortcuts.ts'
import { Panel } from '../Common/Panel.tsx'

type SortablePull = PullDetailed & ItemInterface

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

  usePullShortcuts()

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100

  let pullIndex = 0
  return (
    <Panel className="overflow-auto select-none">
      <div className="relative flex justify-center mx-2 rounded-sm text-white font-bold border border-gray-5g00">
        <div
          className="gritty absolute left-0 max-w-full h-full z-[-1]"
          style={{
            backgroundColor: percent >= 102 ? '#e21e1e' : percent >= 100 ? '#0f950f' : '#426bff',
            width: `${percent}%`,
          }}
        ></div>
        <div>
          {routeDetailed.count}/{dungeon.mdt.totalCount} -{' '}
          {mobCountPercentStr(routeDetailed.count, dungeon.mdt.totalCount)}
        </div>
      </div>
      <ReactSortable
        onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
        onEnd={() => setGhostPullIndex(null)}
        list={pullsWithGhost}
        setList={setPullsWrapper}
        className="flex flex-col gap-[3px] relative overflow-auto"
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
      <div className="flex gap-1">
        <Button className="grow" onClick={() => dispatch(addPull())}>
          Add pull
        </Button>
        <Button onClick={() => dispatch(clearRoute())}>Clear</Button>
      </div>
      {rightClickedSettings && (
        <PullContextMenu
          rightClickedSettings={rightClickedSettings}
          onClose={() => setRightClickedSettings(null)}
        />
      )}
    </Panel>
  )
}
