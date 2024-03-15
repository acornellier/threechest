import { addPull, clearPull, deletePull } from '../../../store/routes/routesReducer.ts'
import { useAppDispatch } from '../../../store/hooks.ts'
import { ContextMenu, ContextMenuProps } from '../../Common/ContextMenu.tsx'
import { shortcuts } from '../../../data/shortcuts.ts'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'

interface Props extends Omit<ContextMenuProps, 'buttons'> {
  pullIndex: number
}

export function PullContextMenu({ position, pullIndex, onClose }: Props) {
  const dispatch = useAppDispatch()

  return (
    <ContextMenu
      position={position}
      onClose={onClose}
      buttons={[
        {
          Icon: PlusIcon,
          text: 'Insert before',
          shortcut: shortcuts.prependPull[0],
          onClick: () => dispatch(addPull(pullIndex)),
        },
        {
          Icon: PlusIcon,
          text: 'Insert after',
          shortcut: shortcuts.appendPull[0],
          onClick: () => dispatch(addPull(pullIndex + 1)),
        },
        {
          Icon: ClearIcon,
          text: 'Clear',
          shortcut: shortcuts.clearPull[0],
          onClick: () => dispatch(clearPull(pullIndex)),
        },
        {
          Icon: TrashIcon,
          text: 'Delete',
          shortcut: shortcuts.deletePull[0],
          onClick: () => dispatch(deletePull({ pullIndex })),
        },
      ]}
    />
  )
}
