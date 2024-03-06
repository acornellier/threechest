import { Pulls } from './Pulls.tsx'
import { RouteDetails } from './RouteDetails.tsx'
import { SharePanel } from './SharePanel.tsx'
import { Button } from '../Common/Button.tsx'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

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
      <div className="absolute -left-[28px] top-[4px]">
        <Button
          onClick={() => setCollapsed((prev) => !prev)}
          style={{
            padding: '12px 4px 12px 8px',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          {collapsed ? (
            <ChevronLeftIcon width={16} height={16} />
          ) : (
            <ChevronRightIcon width={16} height={16} />
          )}
        </Button>
      </div>
      <RouteDetails />
      <SharePanel />
      <Pulls />
    </div>
  )
}
