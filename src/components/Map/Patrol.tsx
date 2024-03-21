import { Polygon } from 'react-leaflet'
import { Spawn } from '../../data/types.ts'
import { useEffect, useState } from 'react'

import { useMapObjectsHidden } from '../../store/reducers/mapReducer.ts'

interface Props {
  spawn: Spawn
  isGroupHovered: boolean
}

export function Patrol({ spawn, isGroupHovered }: Props) {
  // Change key to force re-render
  const [patrolKey, setPatrolKey] = useState(0)
  const hidden = useMapObjectsHidden(200)

  useEffect(() => {
    setPatrolKey((prevKey) => prevKey + 1000)
  }, [isGroupHovered, hidden])

  if (!spawn.patrol.length) return null

  return (
    <Polygon
      key={patrolKey}
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
