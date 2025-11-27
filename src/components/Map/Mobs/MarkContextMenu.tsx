import type { SpawnId } from '../../../data/types.ts'
import { setAssignment } from '../../../store/routes/routesReducer.ts'
import {
  ContextMenu,
  type ContextMenuButton,
  type ContextMenuPosition,
} from '../../Common/ContextMenu.tsx'
import { marks } from '../../../util/marks.ts'
import { useMemo } from 'react'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { setMarkingSpawn } from '../../../store/reducers/hoverReducer.ts'

interface Props {
  spawnId: SpawnId
  contextMenuPosition: ContextMenuPosition
  onClose: () => void
}

export const markerPopupMinHeight = 50
export const markerPopupMinWidth = 40

export function MarkContextMenu({ spawnId, contextMenuPosition, onClose }: Props) {
  const dispatch = useAppDispatch()

  const buttons = useMemo<ContextMenuButton[]>(() => {
    return marks.map((mark) => ({
      contents: <img height={16} width={16} src={`images/markers/${mark}.png`} alt={mark} />,
      onClick: () => {
        dispatch(setAssignment({ spawnId, assignment: mark }))
        dispatch(setMarkingSpawn(null))
      },
      twoDimensional: true,
    }))
  }, [dispatch, spawnId])

  return (
    <ContextMenu
      position={contextMenuPosition}
      onClose={onClose}
      minHeight={markerPopupMinHeight}
      minWidth={markerPopupMinWidth}
      buttons={buttons}
      gap={2}
    />
  )
}
