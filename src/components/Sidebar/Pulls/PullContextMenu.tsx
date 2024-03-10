import { Button } from '../../Common/Button.tsx'
import { addPull, deletePull } from '../../../store/routesReducer.ts'
import { useAppDispatch } from '../../../store/hooks.ts'
import { ContextMenu, ContextMenuProps } from '../../Common/ContextMenu.tsx'

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
        Insert before
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
        Insert after
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
        Delete
      </Button>
    </ContextMenu>
  )
}
