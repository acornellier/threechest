import { ReactNode } from 'react'

interface Props {
  open?: boolean
  title: ReactNode
  contents: ReactNode
  buttons: ReactNode
}

export function Modal({ open, title, contents, buttons }: Props) {
  if (open === false) return null

  return (
    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full">
      <div className="fixed w-full h-full opacity-80 bg-neutral-800" />
      <div className="relative z-10 w-[400px] flex rounded-lg border-2 border-gray-600 text-white">
        <div className="gritty absolute z-[-10] w-full h-full bg-[#24293f] rounded-lg" />
        <div className="flex flex-col w-full h-full justify-center gap-5 p-5">
          <h3 className="text-xl font-semibold text-center">{title}</h3>

          <div className="leading-relaxed">{contents}</div>

          <div className="flex justify-center items-center gap-2">{buttons}</div>
        </div>
      </div>
    </div>
  )
}
