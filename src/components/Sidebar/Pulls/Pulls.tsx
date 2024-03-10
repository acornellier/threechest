import { Pull as PullComponent } from './Pull.tsx'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import type { PullDetailed } from '../../../code/types.ts'
import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useDungeon, useHoveredPull, useRoute } from '../../../store/hooks.ts'
import { addPull, clearRoute, setPulls } from '../../../store/routesReducer.ts'
import { mobCountPercentStr } from '../../../code/util.ts'
import { minContextMenuWidth, PullContextMenu, RightClickedSettings } from './PullContextMenu.tsx'
import { usePullShortcuts } from './usePullShortcuts.ts'
import { Panel } from '../../Common/Panel.tsx'
import { augmentPulls } from '../../../store/augmentPulls.ts'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Browser } from 'leaflet'

type SortablePull = PullDetailed & ItemInterface

export function Pulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls), [route.pulls])

  const hoveredPull = useHoveredPull()
  const clampedHoveredPull = hoveredPull
    ? Math.min(Math.max(hoveredPull, 0), pullsDetailed.length - 1)
    : pullsDetailed.length - 1
  const totalCount = pullsDetailed[clampedHoveredPull]?.countCumulative ?? 0

  const [ghostPullIndex, setGhostPullIndex] = useState<number | null>(null)

  const pullsWithGhost = useMemo(() => {
    const pulls: SortablePull[] = [...pullsDetailed]
    if (ghostPullIndex !== null) {
      const ghostPull = pullsDetailed[ghostPullIndex]
      if (ghostPull) {
        pulls.splice(ghostPullIndex + 1, 0, {
          ...ghostPull,
          id: -1,
          filtered: true,
        })
      }
    }
    return pulls
  }, [pullsDetailed, ghostPullIndex])

  const setPullsWrapper = useCallback(
    (pulls: SortablePull[]) => {
      if (pulls.every((pull, idx) => pull.id === pullsWithGhost[idx]!.id)) return

      dispatch(setPulls(pulls.filter(({ filtered }) => !filtered)))
    },
    [dispatch, pullsWithGhost],
  )

  const [rightClickedSettings, setRightClickedSettings] = useState<RightClickedSettings | null>(
    null,
  )

  const onRightClick = useCallback(
    (e: MouseEvent, pullIndex: number) => {
      if (rightClickedSettings?.pullIndex === pullIndex) {
        setRightClickedSettings(null)
      } else {
        const windowWidth = window.innerWidth
        console.log(windowWidth, e.pageX)
        setRightClickedSettings({
          y: e.pageY,
          pullIndex,
          left:
            e.pageX + minContextMenuWidth < windowWidth
              ? e.pageX
              : windowWidth - minContextMenuWidth,
        })
      }
    },
    [rightClickedSettings?.pullIndex],
  )

  usePullShortcuts()

  const percent = (totalCount / dungeon.mdt.totalCount) * 100

  let pullIndex = 0
  return (
    <Panel className="overflow-auto select-none">
      <div className="relative flex justify-center mx-2 rounded-sm font-bold border border-gray-400">
        <div
          className="gritty absolute left-0 max-w-full h-full z-[-1]"
          style={{
            backgroundColor: percent >= 102 ? '#e21e1e' : percent >= 100 ? '#0f950f' : '#426bff',
            width: `${percent}%`,
          }}
        />
        <div>
          {totalCount}/{dungeon.mdt.totalCount} -{' '}
          {mobCountPercentStr(totalCount, dungeon.mdt.totalCount)}
        </div>
      </div>
      <ReactSortable
        onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
        onEnd={() => setGhostPullIndex(null)}
        list={pullsWithGhost}
        setList={setPullsWrapper}
        className="flex flex-col relative overflow-auto"
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
          <PlusIcon width={18} height={18} />
          Add pull
        </Button>
        <Button onClick={() => dispatch(clearRoute())}>
          <svg
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m15.87 2.669 4.968 4.968a2.25 2.25 0 0 1 0 3.182l-8.681 8.68 6.097.001a.75.75 0 0 1 .744.648l.006.102a.75.75 0 0 1-.648.743l-.102.007-8.41.001a2.244 2.244 0 0 1-1.714-.655l-4.968-4.969a2.25 2.25 0 0 1 0-3.182l9.526-9.526a2.25 2.25 0 0 1 3.182 0ZM5.709 11.768l-1.487 1.488a.75.75 0 0 0 0 1.06l4.969 4.969c.146.146.338.22.53.22l.029-.005.038.002a.747.747 0 0 0 .463-.217l1.487-1.487-6.03-6.03Zm8.04-8.039-6.98 6.978 6.03 6.03 6.979-6.978a.75.75 0 0 0 0-1.061l-4.969-4.969a.75.75 0 0 0-1.06 0Z" />
          </svg>
          Clear
        </Button>
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
