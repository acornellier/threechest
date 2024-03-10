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
        onClick={() => {
          dispatch(addPull(pullIndex))
          onClose()
        }}
      >
        Insert before
      </Button>
      <Button
        justifyStart
        short
        onClick={() => {
          dispatch(addPull(pullIndex + 1))
          onClose()
        }}
      >
        Insert after
      </Button>
      <Button
        justifyStart
        short
        onClick={() => {
          dispatch(deletePull({ pullIndex: pullIndex }))
          onClose()
        }}
      >
        Delete
      </Button>
    </ContextMenu>
  )
}
