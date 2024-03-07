import { Pulls } from './Pulls/Pulls.tsx'
import { RouteDetails } from './RouteDetails.tsx'
import { SharePanel } from './SharePanel.tsx'
import { useState } from 'react'
import { SidebarCollapser } from './SidebarCollapser.tsx'

const margin = 8
const width = 276

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="fixed right-0 z-20 flex flex-col gap-3"
      style={{
        width,
        margin: `${margin}px 0`,
        maxHeight: `calc(100% - 2*${margin}px)`,
        right: collapsed ? -width : 0,
        transition: '150ms all',
      }}
    >
      <SidebarCollapser collapsed={collapsed} setCollapsed={setCollapsed} />
      <RouteDetails />
      <SharePanel />
      <Pulls />
    </div>
  )
}
