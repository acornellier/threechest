import { ReactNode } from 'react'

interface Props {
  row?: boolean
  children: ReactNode
  className?: string
}

export function Panel({ row, children, className }: Props) {
  return (
    <div className={`relative border-2 border-gray-500 rounded-md flex gap-2 ${className ?? ''}`}>
      <div className="gritty absolute w-full h-full bg-gray-950 opacity-80 z-[-1]" />
      <div className={`flex ${row ? '' : 'flex-col'} gap-2 p-2 w-full ${className ?? ''}`}>
        {children}
      </div>
    </div>
  )
}
