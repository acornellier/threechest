import { Button } from '../Common/Button.tsx'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  collapsed: boolean
  setCollapsed: Dispatch<SetStateAction<boolean>>
}

export function SidebarCollapser({ collapsed, setCollapsed }: Props) {
  return (
    <div className="absolute -left-[28px] top-[6px]">
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
  )
}
