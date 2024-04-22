import { memo, useRef } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import { divIcon } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import type { PointOfInterest as PointOfInterestType } from '../../../data/types.ts'

interface Props {
  poi: PointOfInterestType
  index: number
  iconScaling: number
}

interface PoiConfig {
  label: string
  src: string
}

const graveyardConfig: PoiConfig = {
  label: 'Graveyard',
  src: '/images/graveyard.png',
}

const cageConfig: PoiConfig = {
  label: 'Cage',
  src: '/images/cage.png',
}

function getConfig(poi: PointOfInterestType): PoiConfig | null {
  if (poi.type === 'graveyard') {
    return graveyardConfig
  } else if (poi.type === 'brackenhideCage') {
    return cageConfig
  } else {
    return null
  }
}

function PointOfInterestComponent({ poi, iconScaling }: Props) {
  const iconSize = iconScaling
  const hidden = useMapObjectsHidden()
  const markerRef = useRef<LeafletMarker>(null)

  const config = getConfig(poi)
  if (!config) return null

  return (
    <>
      <Marker
        ref={markerRef}
        position={poi.pos}
        icon={divIcon({
          className: `poi-icon fade-in-map-object ${hidden ? 'opacity-0' : 'opacity-1'}`,
          tooltipAnchor: [20 + (iconScaling - 40) / 2, 0],
          iconSize: [iconSize, iconSize],
          html: renderToString(
            <div className="poi w-full h-full flex items-center justify-center text-black border-none">
              <img
                alt={config.label}
                src={config.src}
                style={{ height: iconSize, width: iconSize }}
              />
            </div>,
          ),
        })}
      >
        <Tooltip
          key={iconScaling}
          direction="right"
          className="no-arrow min-h-8 w-64 p-0 bg-transparent border-none shadow-none"
        >
          <div className="relative w-fit border border-gray-400 rounded-md">
            <div className="absolute w-full h-full bg-slate-800 opacity-85 -z-10 rounded-md" />
            <div className="p-2 whitespace-normal text-white text-xs">{config.label}</div>
          </div>
        </Tooltip>
      </Marker>
    </>
  )
}

export const PointOfInterest = memo(PointOfInterestComponent)
