import { DungeonDropdown } from './DungeonDropdown.tsx'
import { Button } from '../Common/Button.tsx'
import { UndoRedo } from './UndoRedo.tsx'

export function Header() {
  return (
    <div className="fixed top-2 left-2 z-20 w-full grid items-center">
      <div className="grid items-center p-2 gap-4 grid-rows-2 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex gap-4 flex-col items-start sm:flex-row sm:items-stretch">
          <Button twoDimensional innerClass="text-2xl">
            Keymapper
          </Button>
          <DungeonDropdown />
        </div>
        <div className="hidden sm:block">
          <UndoRedo />
        </div>
      </div>
    </div>
  )
}
