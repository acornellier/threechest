import { RouteDetails } from './RouteDetails.tsx'
import { SharePanel } from './SharePanel.tsx'
import { SidebarCollapser } from './SidebarCollapser.tsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.ts'
import { Pulls } from './Pulls/Pulls.tsx'
import { CollabPanel } from '../Collab/CollabPanel.tsx'

const marginTop = 8
const marginBottom = 60
const width = 285

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage('sidebarCollaposed', false)

  return (
    <div
      className="fixed right-0 z-20 flex flex-col gap-1.5"
      style={{
        width,
        marginTop,
        marginBottom,
        maxHeight: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
        right: collapsed ? -width : 0,
        transition: '150ms all',
      }}
    >
      <SidebarCollapser collapsed={collapsed} setCollapsed={setCollapsed} />
      <RouteDetails />
      <SharePanel />
      <CollabPanel />
      <Pulls />
    </div>
  )
}
