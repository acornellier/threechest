import {
  type EventedProps,
  createElementObject,
  createLayerComponent,
  extendContext,
} from '@react-leaflet/core'
import {
  type LatLngExpression,
  Marker as LeafletMarker,
  DivIcon as LeafletDivIcon,
  type MarkerOptions,
  DivIconOptions,
} from 'leaflet'
import type { ReactNode } from 'react'

export interface MarkerProps extends MarkerOptions, EventedProps {
  children?: ReactNode
  position: LatLngExpression
}

export const DivIcon = createLayerComponent<LeafletMarker, MarkerProps & DivIconOptions>(
  function createElement({ position, ...options }, ctx) {
    const icon = new LeafletDivIcon(options)
    const marker = new LeafletMarker(position, { icon, ...options })
    return createElementObject(marker, extendContext(ctx, { overlayContainer: marker }))
  },

  function updateElement(marker, props, prevProps) {
    if (props.position !== prevProps.position) {
      marker.setLatLng(props.position)
    }
    if (props.icon != null && props.icon !== prevProps.icon) {
      marker.setIcon(props.icon)
    }
    if (props.zIndexOffset != null && props.zIndexOffset !== prevProps.zIndexOffset) {
      marker.setZIndexOffset(props.zIndexOffset)
    }
    if (props.opacity != null && props.opacity !== prevProps.opacity) {
      marker.setOpacity(props.opacity)
    }
    if (marker.dragging != null && props.draggable !== prevProps.draggable) {
      if (props.draggable === true) {
        marker.dragging.enable()
      } else {
        marker.dragging.disable()
      }
    }
  },
)
