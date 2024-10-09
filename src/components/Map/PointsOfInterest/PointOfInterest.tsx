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
  type: PointOfInterestType['type']
  itemType?: PointOfInterestType['itemType']
  label: string
  src: string
}

const configs: PoiConfig[] = [
  {
    type: 'dungeonEntrance',
    label: 'Entrance',
    src: '/images/dungeon_start.png',
  },
  {
    type: 'graveyard',
    label: 'Graveyard',
    src: '/images/graveyard.png',
  },
  {
    type: 'nwItem',
    itemType: 1,
    label: 'Bloody Javelin',
    src: '/images/bloody_javelin.jpg',
  },
  {
    type: 'nwItem',
    itemType: 2,
    label: 'Discharged Anima',
    src: '/images/discharged_anima.jpg',
  },
  {
    type: 'nwItem',
    itemType: 3,
    label: 'Discarded Shield',
    src: '/images/discarded_shield.jpg',
  },
  {
    type: 'cityOfThreadsItem',
    label: 'Stolen Power: 15% damage and healing',
    src: '/images/stolen_power.jpg',
  },
  {
    type: 'stonevaultItem',
    label: 'Imbued Iron Energy',
    src: '/images/imbued_iron_energy.jpg',
  },
  {
    type: 'mistsItem',
    itemType: 1,
    label: 'Overgrown Roots: usable by Night Elves, Tauren, Druids, and Herbalists',
    src: '/images/overgrown_roots.jpg',
  },
  {
    type: 'mistsItem',
    itemType: 2,
    label: 'Depleted Anima Seed: updates graveyard location',
    src: '/images/anima_seed.jpg',
  },
  {
    type: 'mistsItem',
    itemType: 5,
    label: 'Depleted Anima Seed: updates graveyard location',
    src: '/images/anima_seed.jpg',
  },
]

function getConfig(poi: PointOfInterestType): PoiConfig | null {
  return (
    configs.find(
      (config) => config.type === poi.type && (!config.itemType || config.itemType == poi.itemType),
    ) ?? null
  )
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
