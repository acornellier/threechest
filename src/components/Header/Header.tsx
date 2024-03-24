import { DungeonDropdown } from './DungeonDropdown.tsx'
import { Button } from '../Common/Button.tsx'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { RouteDropdown } from '../Sidebar/RouteDropdown.tsx'
import { RenameRoute } from '../Sidebar/Buttons/RenameRoute.tsx'
import { useState } from 'react'
import { sidebarWidth } from '../Sidebar/Sidebar.tsx'
import { UndoRedo } from './UndoRedo.tsx'
import { DrawToolbar } from '../Map/Draw/DrawToolbar.tsx'

export const dropdownWidth = 258

export function Header() {
  const isGuestCollab = useIsGuestCollab()
  const [isRenaming, setRenaming] = useState(false)

  const smMaxWidth = `sm:max-w-[${sidebarWidth + 32}px]`

  return (
    <div className="fixed pt-4 px-4 z-10 sm:z-30 w-full grid items-center pointer-events-none">
      <div className="pointer-events-none flex flex-col items-start gap-4 lg: flex-row]">
        <div
          className={`w-fit flex gap-4 flex-col flex-wrap items-start sm:flex-row sm:items-stretch pointer-events-auto ${smMaxWidth}`}
        >
          <Button twoDimensional className="[&]:hidden [&]:sm:flex min-w-fit" innerClass="text-2xl">
            <img src="/images/favicon2.png" alt="logo" width={36} className="min-w-[36] mr-1" />
            <div className="[&]:hidden [&]:md:flex">Threechest</div>
          </Button>
          <div className="h-full" style={{ width: dropdownWidth }}>
            <DungeonDropdown />
          </div>
          <div className="flex gap-2 pointer-events-auto">
            {!isRenaming && (
              <div className="h-full" style={{ width: dropdownWidth }}>
                <RouteDropdown />
              </div>
            )}
            <RenameRoute isRenaming={isRenaming} setRenaming={setRenaming} />
          </div>
        </div>
        <div className="pointer-events-auto">
          <div className="flex items-start gap-6 h-full">
            {!isGuestCollab && <UndoRedo />}
            <DrawToolbar />
          </div>
        </div>
      </div>
    </div>
  )
}
