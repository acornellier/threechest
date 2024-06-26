import { RouteDetails } from './RouteDetails.tsx'
import { SidebarCollapser } from './SidebarCollapser.tsx'
import { Pulls } from './Pulls/Pulls.tsx'
import { CollabPanel } from '../Collab/CollabPanel.tsx'
import { useState } from 'react'
import { HostRouteDetails } from './HostRouteDetails.tsx'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { MiniPulls } from './Pulls/MiniPulls.tsx'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { selectIsLive, setSidebarCollapsed } from '../../store/reducers/mapReducer.ts'

export const sidebarWidth = 290

export function Sidebar() {
  const dispatch = useAppDispatch()
  const topCollapsed = useRootSelector((state) => state.map.sidebarCollapsed)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const isBottomCollapsed = !topCollapsed || bottomCollapsed
  const isGuestCollab = useIsGuestCollab()
  const isLive = useRootSelector(selectIsLive)

  if (isLive) return false

  return (
    <>
      <div
        className="fixed max-h-full z-20 flex flex-col gap-1.5 transition-all pt-2 pb-14 sm:pb-2"
        style={{
          width: sidebarWidth,
          right: topCollapsed ? -sidebarWidth : 0,
        }}
      >
        <SidebarCollapser
          collapsed={topCollapsed}
          setCollapsed={() => dispatch(setSidebarCollapsed(!topCollapsed))}
        />
        {isLive ? null : isGuestCollab ? <HostRouteDetails /> : <RouteDetails />}
        <CollabPanel />
        <Pulls />
      </div>
      <div
        className="fixed max-h-full z-20 transition-all bottom-0 pb-14 sm:pb-2"
        style={{
          width: sidebarWidth,
          right: isBottomCollapsed ? -sidebarWidth : 0,
          maxHeight: 800,
        }}
      >
        {topCollapsed && (
          <>
            <SidebarCollapser collapsed={bottomCollapsed} setCollapsed={setBottomCollapsed} />
            <MiniPulls />
          </>
        )}
      </div>
    </>
  )
}
