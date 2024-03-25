import { RouteDetails } from './RouteDetails.tsx'
import { SidebarCollapser } from './SidebarCollapser.tsx'
import { Pulls } from './Pulls/Pulls.tsx'
import { CollabPanel } from '../Collab/CollabPanel.tsx'
import { useState } from 'react'
import { Footer } from '../Header/Footer.tsx'
import { HostRouteDetails } from './HostRouteDetails.tsx'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { MiniPulls } from './Pulls/MiniPulls.tsx'

export const sidebarWidth = 290
const marginTop = 8
const marginBottom = 60

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
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
          right: collapsed ? -sidebarWidth : 0,
        }}
      >
        <SidebarCollapser collapsed={collapsed} setCollapsed={setCollapsed} index={0} />
        {isGuestCollab ? <HostRouteDetails /> : <RouteDetails />}
        <CollabPanel />
        <Pulls />
        <Footer />
      </div>
      <div
        className="fixed bottom-0 z-20 transition-all"
        style={{
          width: sidebarWidth,
          marginTop,
          marginBottom,
          maxHeight: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
          right: collapsed ? 0 : -sidebarWidth,
        }}
      >
        {collapsed && (
          <SidebarCollapser collapsed={!collapsed} setCollapsed={setCollapsed} index={0} />
        )}
        <MiniPulls />
      </div>
    </>
  )
}
