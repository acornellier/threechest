import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  innerClass?: string
  outline?: boolean
  short?: boolean
  twoDimensional?: boolean
}

export function Button({
  innerClass,
  outline,
  short,
  twoDimensional,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`fancy-button 
                  ${outline ? 'outline-button' : ''} 
                  ${short ? 'short' : ''} 
                  ${twoDimensional ? 'two-d' : ''} 
                  ${className ?? ''}`}
      {...props}
    >
      <div className="fancy-button-hover flex-1 z-[1]" />
      <div className={`fancy-button-inner z-[2] ${innerClass ?? ''}`}>{children}</div>
    </button>
  )
}
