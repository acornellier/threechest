import { forwardRef, SVGProps } from 'react'
import { IconComponent } from '../../../util/types.ts'

export const WeightIcon: IconComponent = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        data-name="Layer 138"
        viewBox="0 0 100 100"
        {...props}
      >
        <title>{'Artboard 2 copy 86'}</title>
        <path
          d="M89.38 72.5H10.62A5.63 5.63 0 0 0 5 78.13v11.25A5.62 5.62 0 0 0 10.62 95h78.76A5.62 5.62 0 0 0 95 89.38V78.13a5.63 5.63 0 0 0-5.62-5.63Zm0-28.13H10.62A5.63 5.63 0 0 0 5 50v5.63a5.62 5.62 0 0 0 5.62 5.62h78.76A5.62 5.62 0 0 0 95 55.63V50a5.63 5.63 0 0 0-5.62-5.63Zm0-22.5H10.62a5.63 5.63 0 0 0 0 11.25h78.76a5.63 5.63 0 0 0 0-11.25ZM7.81 10.62h84.38a2.81 2.81 0 1 0 0-5.62H7.81a2.81 2.81 0 0 0 0 5.62Z"
          style={{
            fillRule: 'evenodd',
          }}
        />
      </svg>
    )
  },
)

WeightIcon.displayName = 'WeightIcon'
