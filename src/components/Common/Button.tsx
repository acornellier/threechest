import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  short?: boolean
  twoDimensional?: boolean
}

export function Button({ short, twoDimensional, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={`fancy-button ${short ? 'short' : ''} ${twoDimensional ? 'two-d' : ''} 
                  ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
