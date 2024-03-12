import { Button } from '../../Common/Button.tsx'
import { addPull, clearPull, deletePull } from '../../../store/routesReducer.ts'
import { useAppDispatch } from '../../../store/hooks.ts'
import { ContextMenu, ContextMenuProps } from '../../Common/ContextMenu.tsx'
import { shortcuts } from '../../../data/shortcuts.ts'

export const minContextMenuWidth = 140

interface Props extends Omit<ContextMenuProps, 'children'> {
  pullIndex: number
}

export function PullContextMenu({ position, pullIndex, onClose }: Props) {
  const dispatch = useAppDispatch()

  return (
    <ContextMenu position={position} onClose={onClose}>
      <Button
        justifyStart
        short
        onClick={(e) => {
          dispatch(addPull(pullIndex))
          onClose()
          e.stopPropagation()
        }}
      >
        Insert before ({shortcuts.prependPull[0]!.key.toUpperCase()})
      </Button>
      <Button
        justifyStart
        short
        onClick={(e) => {
          dispatch(addPull(pullIndex + 1))
          onClose()
          e.stopPropagation()
        }}
      >
        Insert after ({shortcuts.appendPull[0]!.key.toUpperCase()})
      </Button>
      <Button
        justifyStart
        short
        onClick={(e) => {
          dispatch(clearPull(pullIndex))
          onClose()
          e.stopPropagation()
        }}
      >
        Clear ({shortcuts.clearPull[0]!.key.toUpperCase()})
      </Button>
      <Button
        justifyStart
        short
        onClick={(e) => {
          dispatch(deletePull({ pullIndex: pullIndex }))
          onClose()
          e.stopPropagation()
        }}
      >
        Delete (Del)
      </Button>
    </ContextMenu>
  )
}
