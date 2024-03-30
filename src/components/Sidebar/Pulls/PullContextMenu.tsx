import { addPull, clearPull, clearRoute, deletePull } from '../../../store/routes/routesReducer.ts'
import { ContextMenu, ContextMenuProps } from '../../Common/ContextMenu.tsx'
import { shortcuts } from '../../../data/shortcuts.ts'
import { BackspaceIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'

import { useAppDispatch } from '../../../store/storeUtil.ts'

interface Props extends Omit<ContextMenuProps, 'buttons'> {
  pullIndex: number
}

export const pullContextMenuMinHeight = 250
export const pullContextMenuMinWidth = 180

export function PullContextMenu({ position, pullIndex, onClose }: Props) {
  const dispatch = useAppDispatch()

  return (
    <ContextMenu
      position={position}
      onClose={onClose}
      minHeight={pullContextMenuMinHeight}
      minWidth={pullContextMenuMinWidth}
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
          text: 'Clear pull',
          shortcut: shortcuts.clearPull[0],
          onClick: () => dispatch(clearPull(pullIndex)),
        },
        {
          Icon: TrashIcon,
          text: 'Delete pull',
          shortcut: shortcuts.deletePull[0],
          onClick: () => dispatch(deletePull({ pullIndex })),
        },
        {
          Icon: BackspaceIcon,
          text: 'Clear route',
          onClick: () => dispatch(clearRoute()),
        },
      ]}
    />
  )
}
