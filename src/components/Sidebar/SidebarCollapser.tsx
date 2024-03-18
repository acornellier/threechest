import { Button } from '../Common/Button.tsx'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  collapsed: boolean
  setCollapsed: Dispatch<SetStateAction<boolean>>
  height: number
}

export function SidebarCollapser({ collapsed, setCollapsed, height }: Props) {
  return (
    <div className="absolute -left-[30px] top-[8px]">
      <Button
        twoDimensional
        Icon={collapsed ? ChevronLeftIcon : ChevronRightIcon}
        iconSize={18}
        onClick={() => setCollapsed((prev) => !prev)}
        style={{
          height,
          padding: '12px 4px 12px 8px',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
    </div>
  )
}
