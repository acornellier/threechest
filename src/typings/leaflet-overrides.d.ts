import 'leaflet'

declare module 'leaflet' {
  export type LeafletTouchEventHandlerFn = (event: LeafletTouchEvent) => void

  export interface LeafletTouchEvent {
    latlng: LatLng
    layerPoint: Point
    containerPoint: Point
    originalEvent: TouchEvent
  }

  interface LeafletEventHandlerFnMap {
    boxselectstart?: (() => void) | undefined
    boxselectmove?: ((event: { bounds: LatLngBounds; inverse: boolean }) => void) | undefined
    boxselectend?: ((event: { bounds: LatLngBounds; inverse: boolean }) => void) | undefined

    touchstart?: LeafletTouchEventHandlerFn | undefined
    touchmove?: LeafletTouchEventHandlerFn | undefined
    touchend?: LeafletEventHandlerFn | undefined
  }

  interface MapOptions {
    smoothWheelZoom?: boolean
    smoothSensitivity?: number
    boxSelect?: boolean
  }
}
