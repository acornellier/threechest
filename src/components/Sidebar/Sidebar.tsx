import { Pulls } from './Pulls.tsx'
import { RouteDetails } from './RouteDetails.tsx'
import { SharePanel } from './SharePanel.tsx'

const margin = 8

export function Sidebar() {
  return (
    <div
      className="fixed right-0 z-20 flex flex-col gap-3 w-[276px]"
      style={{
        margin: `${margin}px 0`,
        maxHeight: `calc(100% - 2*${margin}px)`,
      }}
    >
      <RouteDetails />
      <SharePanel />
      <Pulls />
    </div>
  )
}
