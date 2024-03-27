import { DungeonDropdown } from './DungeonDropdown.tsx'
import { Button } from '../Common/Button.tsx'
import { sidebarWidth } from '../Sidebar/Sidebar.tsx'
import { UndoRedo } from './UndoRedo.tsx'
import { DrawToolbar } from '../Map/Draw/DrawToolbar.tsx'
import { useRootSelector } from '../../store/storeUtil.ts'

export const dropdownWidth = 270

export function Header() {
  const smMaxWidth = `sm:max-w-[${sidebarWidth + 32}px]`
  const sidebarCollapsed = useRootSelector((state) => state.map.sidebarCollapsed)

  return (
    <div className="z-30 fixed pt-4 px-4 w-full grid items-center pointer-events-none">
      <div className="pointer-events-none flex flex-col items-start gap-4">
        <div
          className={`w-fit flex gap-4  flex-nowrap items-start sm:items-stretch pointer-events-auto ${smMaxWidth}`}
        >
          <Button
            twoDimensional
            className="[&]:hidden [&]:sm:flex [&]:cursor-default min-w-fit"
            innerClass="text-2xl"
          >
            <img src="/images/logo_64x64.png" alt="logo" width={36} className="min-w-[36] mr-1" />
            <div className="flex">Threechest</div>
          </Button>
          <div className="h-full" style={{ width: dropdownWidth }}>
            <DungeonDropdown />
          </div>
        </div>
        <div
          className={`items-start gap-6 h-full pointer-events-auto
                         ${sidebarCollapsed ? 'flex' : 'hidden sm:flex'}`}
        >
          <UndoRedo />
          <DrawToolbar />
        </div>
      </div>
    </div>
  )
}
