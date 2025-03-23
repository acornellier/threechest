import { DungeonDropdown } from './DungeonDropdown.tsx'
import { Button } from '../Common/Button.tsx'
import { sidebarWidth } from '../Sidebar/Sidebar.tsx'
import { UndoRedo } from './UndoRedo.tsx'
import { DrawToolbar } from '../Map/Draw/DrawToolbar.tsx'
import { useRootSelector } from '../../store/storeUtil.ts'
import { selectIsLive } from '../../store/reducers/mapReducer.ts'
import { MobileDungeonDropdown } from './MobileDungeonDropdown.tsx'

export function Header() {
  const isLive = useRootSelector(selectIsLive)
  const sidebarCollapsed = useRootSelector((state) => state.map.sidebarCollapsed)

  const actualSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth + 20
  const xsHiddenDungeons = sidebarCollapsed ? 'hidden sm:flex' : ''

  return (
    <div className="z-10 fixed pt-4 px-4 w-full grid items-center pointer-events-none">
      <div className={`pointer-events-none flex flex-col items-start gap-4`}>
        {!isLive && (
          <div
            className={`flex gap-4 flex-nowrap items-start pointer-events-auto ${xsHiddenDungeons}`}
            style={{
              maxWidth: `calc(100% - ${actualSidebarWidth}px)`,
            }}
          >
            <Button
              twoDimensional
              className="[&]:hidden [&]:lg:flex [&]:cursor-default min-w-fit"
              innerClass="text-2xl"
            >
              <img src="/images/logo_64x64.png" alt="logo" width={36} className="min-w-[36] mr-1" />
              <div>Threechest</div>
            </Button>
            <DungeonDropdown />
          </div>
        )}
        <div
          className={`items-start gap-6 h-full pointer-events-auto ${sidebarCollapsed ? 'flex' : 'hidden sm:flex'}`}
        >
          <div className="sm:hidden">
            <MobileDungeonDropdown />
          </div>
          <UndoRedo />
          {!isLive && <DrawToolbar />}
        </div>
      </div>
    </div>
  )
}
