import type { ReactNode } from 'react';
import { forwardRef } from 'react'

interface Props {
  row?: boolean
  children: ReactNode
  className?: string
  innerClass?: string
  blue?: boolean
  noRightBorder?: boolean
  absolute?: boolean
}

export const Panel = forwardRef<HTMLDivElement, Props>(
  ({ row, children, className, innerClass, blue, noRightBorder }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative border-2 border-gray-500 rounded-md flex gap-2
                  ${noRightBorder ? 'rounded-r-none border-r-0' : ''} 
                  ${className ?? ''}`}
      >
        <div
          className={`gritty absolute w-full h-full bg-gray-950 opacity-85 z-[-1] rounded-md
                    ${blue ? 'bg-fancy-blue opacity-95' : ''}`}
        />
        <div className={`flex ${row ? '' : 'flex-col'} gap-2 p-2 w-full ${innerClass ?? ''}`}>
          {children}
        </div>
      </div>
    )
  },
)

Panel.displayName = 'Panel'
