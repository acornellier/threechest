import { forwardRef, SVGProps } from 'react'
import { IconComponent } from '../../../util/types.ts'

export const CursorIcon: IconComponent = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M22 10.2069L3 3L10.2069 22L13.4828 13.4828L22 10.2069Z"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

CursorIcon.displayName = 'CursorIcon'
