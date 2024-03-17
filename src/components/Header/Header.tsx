import { DungeonDropdown } from './DungeonDropdown.tsx'
import { Button } from '../Common/Button.tsx'
import { UndoRedo } from './UndoRedo.tsx'

export function Header() {
  return (
    <div className="fixed top-4 left-4 z-20 w-full grid items-center pointer-events-none">
      <div className="pointer-events-none flex flex-col items-start gap-4 lg:grid lg:items-center lg:grid-cols-[minmax(470px,1fr)_auto_1fr]">
        <div className="w-fit flex gap-4 flex-col items-start sm:flex-row sm:items-stretch pointer-events-auto">
          <Button twoDimensional className="min-w-fit" innerClass="text-2xl">
            <img src="/favicon.png" alt="logo" width={36} />
            <div>Threechest</div>
          </Button>
          <DungeonDropdown />
        </div>
        <div className="hidden sm:block pointer-events-auto">
          <UndoRedo />
        </div>
      </div>
    </div>
  )
}
