import { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface LabelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  button?: boolean
  short?: boolean
  bigText?: boolean
}

export function Label({ className, short, button, bigText, ...props }: LabelProps) {
  const shortClass = short ? 'py-1' : 'py-2.5'
  const buttonClass = button
    ? 'cursor-pointer hover:bg-teal-800 hover:dark:bg-teal-700 shadow-lg'
    : ''
  const textClass = bigText ? 'text-base' : 'text-sm'

  return (
    <div
      className={`text-white bg-teal-700 dark:bg-teal-600 font-medium rounded-lg ${textClass} text-center inline-flex items-center select-none px-4 ${shortClass} ${buttonClass} ${className}`}
      {...props}
    />
  )
}
