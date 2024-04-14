import type { Ref, SVGProps } from 'react'
import { forwardRef } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-2 0 20 20"
    fill="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8 18c-3.308 0-6-2.692-6-6 0-3.219 4.302-8.821 6-9.896C9.698 3.179 14 8.781 14 12c0 3.308-2.692 6-6 6M8 0C6 0 0 7.582 0 12a8 8 0 0 0 16 0c0-4.418-6-12-8-12"
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
export { ForwardRef as BleedIcon }
