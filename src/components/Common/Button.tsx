import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  outline?: boolean
  short?: boolean
  twoDimensional?: boolean
}

export function Button({
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
      {children}
    </button>
  )
}
