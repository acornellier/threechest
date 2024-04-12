import type { SVGProps } from 'react';
import { forwardRef } from 'react'
import type { IconComponent } from '../../../util/types.ts'

export const CursorIcon: IconComponent = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        transform="scale(-1 1)"
        viewBox="-26.65 -26.65 319.8 319.8"
        {...props}
      >
        <path
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={35.71}
          d="M150.036 266.494c-.264 0-.517-.006-.792-.018a14.407 14.407 0 0 1-13.046-10.347l-26.067-89.027-95.203-18.867a14.432 14.432 0 0 1-11.476-12.123 14.418 14.418 0 0 1 7.65-14.832L242.143 1.617C247.5-1.175 254.057-.29 258.518 3.8a14.399 14.399 0 0 1 3.562 16.146l-98.743 237.655a14.38 14.38 0 0 1-13.301 8.893z"
        />
        <path d="M150.036 266.494c-.264 0-.517-.006-.792-.018a14.407 14.407 0 0 1-13.046-10.347l-26.067-89.027-95.203-18.867a14.432 14.432 0 0 1-11.476-12.123 14.418 14.418 0 0 1 7.65-14.832L242.143 1.617C247.5-1.175 254.057-.29 258.518 3.8a14.399 14.399 0 0 1 3.562 16.146l-98.743 237.655a14.38 14.38 0 0 1-13.301 8.893z" />
      </svg>
    )
  },
)

CursorIcon.displayName = 'CursorIcon'
