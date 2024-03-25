import { Button } from '../Common/Button.tsx'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  collapsed: boolean
  setCollapsed: Dispatch<SetStateAction<boolean>>
  index?: number
  vertical?: boolean
}

const initialTop = 8
const height = 48
const gap = 8

export function SidebarCollapser({ collapsed, setCollapsed, vertical, index = 0 }: Props) {
  const paddingTop = initialTop + index * (height + gap)

  return (
    <div className="absolute -left-[30px]">
      <Button
        twoDimensional
        Icon={
          vertical
            ? collapsed
              ? ChevronDownIcon
              : ChevronUpIcon
            : collapsed
              ? ChevronLeftIcon
              : ChevronRightIcon
        }
        iconSize={18}
        onClick={() => setCollapsed((prev) => !prev)}
        style={{
          height,
          marginTop: paddingTop,
          padding: `12px 4px 12px 8px`,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
    </div>
  )
}
