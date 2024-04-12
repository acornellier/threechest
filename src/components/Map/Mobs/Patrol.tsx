import { Polygon } from 'react-leaflet'
import type { Spawn } from '../../../data/types.ts'

interface Props {
  spawn: Spawn
  isGroupHovered: boolean
  hidden: boolean
}

export function Patrol({ spawn, isGroupHovered, hidden }: Props) {
  if (!spawn.patrol || spawn.patrol.length === 0) return null

  return (
    <Polygon
      key={`${isGroupHovered}-${hidden}`}
      className="patrol fade-in-map-object"
      positions={spawn.patrol}
      color="#1e2e8c"
      fillOpacity={0}
      weight={isGroupHovered ? 6 : 2}
      dashArray={isGroupHovered ? undefined : [4, 10]}
      opacity={hidden ? 0 : isGroupHovered ? 1 : 0.5}
    />
  )
}
