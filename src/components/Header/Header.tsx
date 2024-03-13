import { DungeonDropdown } from './DungeonDropdown.tsx'
import { Button } from '../Common/Button.tsx'
import { UndoRedo } from './UndoRedo.tsx'
import { useIsMobile } from '../../hooks/useIsMobile.ts'

export function Header() {
  const isMobile = useIsMobile()

  return (
    <div className="fixed m-2 z-20 w-full grid items-center">
      <div
        className="grid  items-center p-2"
        style={{
          gridTemplateColumns: '1fr auto 1fr',
        }}
      >
        <div className="flex gap-4 items-center">
          <Button twoDimensional innerClass="text-2xl">
            Keymapper
          </Button>
          <DungeonDropdown />
        </div>
        {!isMobile && <UndoRedo />}
      </div>
    </div>
  )
}
