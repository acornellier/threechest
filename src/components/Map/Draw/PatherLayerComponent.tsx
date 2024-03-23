import { LayerOptions, type LeafletEventHandlerFnMap } from 'leaflet'
import { PropsWithChildren } from 'react'
import { CreatedEvent, Pather, PatherOptions } from '../../Leaflet/Pather/Pather.ts'
import { createLayerComponent } from '@react-leaflet/core'

type Props = LayerOptions &
  PropsWithChildren &
  PatherOptions & {
    eventHandlers?: LeafletEventHandlerFnMap & { created: (event: CreatedEvent) => void }
  }

export const ReactPatherLayerComponent = createLayerComponent<Pather, Props>(
  (props, context) => {
    const instance = new Pather({ ...props })
    return { instance, context: { ...context, overlayContainer: instance } }
  },
  (instance, props, prevProps) => {
    if (props.mode !== prevProps.mode) {
      instance.setMode(props.mode)
    }

    if (props.strokeColor && props.strokeColor !== prevProps.strokeColor) {
      instance.setStrokeColor(props.strokeColor)
    }

    instance.setOptions(props)
  },
)
