import { Pull as PullComponent } from './Pull.tsx'
import { useKeyHeld } from '../../../hooks/useKeyHeld.ts'
import type { PullDetailed } from '../../../util/types.ts'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch } from '../../../store/hooks.ts'
import { setPulls } from '../../../store/routes/routesReducer.ts'

type SortablePull = PullDetailed & ItemInterface

interface Props {
  pullsDetailed: PullDetailed[]
  onRightClickPull: (e: MouseEvent, pullIndex: number) => void
}

export function PullList({ pullsDetailed, onRightClickPull }: Props) {
  const dispatch = useAppDispatch()
  const [ghostPullIndex, setGhostPullIndex] = useState<number | null>(null)
  const isShiftHeld = useKeyHeld('Shift')

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

  let pullIndex = 0
  const children = pullsWithGhost.map((pull) => (
    <PullComponent
      key={pull.id}
      pullIndex={pull.id === -1 ? pullIndex : pullIndex++}
      pull={pull}
      ghost={pull.filtered}
      onRightClick={onRightClickPull}
      isShiftHeld={isShiftHeld}
    />
  ))

  return (
    <ReactSortable
      onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
      onEnd={() => setGhostPullIndex(null)}
      list={pullsWithGhost}
      setList={setPullsWrapper}
      className="flex flex-col relative overflow-auto"
    >
      {children}
    </ReactSortable>
  )
}
