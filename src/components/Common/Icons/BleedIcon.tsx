import type { Ref, SVGProps } from 'react'
import { forwardRef } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={3}
    viewBox="-0.36 -0.36 36.72 36.72"
    ref={ref}
    {...props}
  >
    <path
      fill="#DA2F47"
      d="M28.344 17.768 18.148 1.09 8.7 17.654c-2.2 3.51-2.392 8.074-.081 11.854 3.285 5.373 10.363 7.098 15.811 3.857 5.446-3.24 7.199-10.22 3.914-15.597z"
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
export { ForwardRef as BleedIcon }
