import { UndoRedo } from './UndoRedo.tsx'
import { DungeonDropdown } from './DungeonSelect/DungeonDropdown.tsx'

export function TopBar() {
  return (
    <div
      className="fixed m-2 z-20 w-full grid items-center"
      style={{
        gridTemplateColumns: '1fr auto 1fr',
      }}
    >
      <DungeonDropdown />
      <UndoRedo />
    </div>
  )
}
