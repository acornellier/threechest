import { ReactNode } from 'react'

interface Props {
  row?: boolean
  children: ReactNode
  className?: string
  innerClass?: string
  blue?: boolean
  noRightBorder?: boolean
  absolute?: boolean
}

export function Panel({ row, children, className, innerClass, blue, noRightBorder }: Props) {
  return (
    <div
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
}
