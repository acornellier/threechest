import { UndoRedo } from './UndoRedo.tsx'
import { DungeonDropdown } from './DungeonDropdown.tsx'
import { useIsMobile } from '../../hooks/useIsMobile.ts'

export function TopBar() {
  const isMobile = useIsMobile()

  return (
    <div
      className="fixed m-2 z-20 w-full grid items-center"
      style={{
        gridTemplateColumns: '1fr auto 1fr',
      }}
    >
      <DungeonDropdown />
      {!isMobile && <UndoRedo />}
    </div>
  )
}
