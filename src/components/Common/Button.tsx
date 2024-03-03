import { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button className={`fancy-button gritty ${className}`} {...props}>
      {children}
    </button>
  )
}
