import type { SpawnId } from '../../../data/types.ts'
import { setAssignment, setCcSpawn } from '../../../store/routes/routesReducer.ts'
import {
  ContextMenu,
  type ContextMenuButton,
  type ContextMenuPosition,
} from '../../Common/ContextMenu.tsx'
import { marks } from '../../../util/marks.ts'
import { useMemo } from 'react'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { ccSpells, menuCcSpellIds } from '../../../data/spells/ccSpells.ts'
import { getIconLink } from '../../../data/spells/spells.ts'

interface Props {
  spawnId: SpawnId
  contextMenuPosition: ContextMenuPosition
  onClose: () => void
}

export const spawnMenuMinHeight = 50
export const spawnMenuMinWidth = 90

export function SpawnContextMenu({ spawnId, contextMenuPosition, onClose }: Props) {
  const dispatch = useAppDispatch()

  const columns = useMemo<ContextMenuButton[][]>(() => {
    const markButtons = marks.map<ContextMenuButton>((mark) => ({
      contents: <img height={16} width={16} src={`images/markers/${mark}.png`} alt={mark} />,
      onClick: () => {
        dispatch(setAssignment({ spawnId, assignment: mark }))
      },
      twoDimensional: true,
    }))

    const ccButtons = menuCcSpellIds.flatMap<ContextMenuButton>((spellId) => {
      const ccSpell = ccSpells[spellId]
      if (!ccSpell) return []

      return {
        contents: (
          <img
            className="rounded-sm"
            height={16}
            width={16}
            src={getIconLink(ccSpell.icon)}
            alt={ccSpell.name}
          />
        ),
        title: ccSpell.name,
        onClick: () => {
          dispatch(setCcSpawn({ spawnId, spellId }))
        },
        twoDimensional: true,
      }
    })

    return [markButtons, ccButtons]
  }, [dispatch, spawnId])

  return (
    <ContextMenu
      position={contextMenuPosition}
      onClose={onClose}
      minHeight={spawnMenuMinHeight}
      minWidth={spawnMenuMinWidth}
      buttons={columns}
      gap={2}
    />
  )
}
