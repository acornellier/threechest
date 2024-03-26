import { RouteDetails } from './RouteDetails.tsx'
import { SidebarCollapser } from './SidebarCollapser.tsx'
import { Pulls } from './Pulls/Pulls.tsx'
import { CollabPanel } from '../Collab/CollabPanel.tsx'
import { useState } from 'react'
import { HostRouteDetails } from './HostRouteDetails.tsx'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { MiniPulls } from './Pulls/MiniPulls.tsx'

export const sidebarWidth = 290
const marginTop = 8
const marginBottom = 60

export function Sidebar() {
  const [topCollapsed, setTopCollapsed] = useState(false)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const isBottomCollapsed = !topCollapsed || bottomCollapsed
  const isGuestCollab = useIsGuestCollab()

  return (
    <>
      <div
        className="fixed pt-16 md:pt-0 z-20 flex flex-col gap-1.5 transition-all"
        style={{
          width: sidebarWidth,
          marginTop,
          marginBottom,
          maxHeight: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
          right: topCollapsed ? -sidebarWidth : 0,
        }}
      >
        <SidebarCollapser collapsed={topCollapsed} setCollapsed={setTopCollapsed} />
        {isGuestCollab ? <HostRouteDetails /> : <RouteDetails />}
        <CollabPanel />
        <Pulls />
      </div>
      <div
        className="fixed z-20 transition-all"
        style={{
          width: sidebarWidth,
          marginTop,
          marginBottom,
          maxHeight: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
          right: isBottomCollapsed ? -sidebarWidth : 0,
          bottom: 0,
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
