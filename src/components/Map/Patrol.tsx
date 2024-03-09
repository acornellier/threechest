import { Polygon } from 'react-leaflet'
import { Spawn } from '../../data/types.ts'
import { useEffect, useState } from 'react'

interface Props {
  spawn: Spawn
  isGroupHovered: boolean
}

export function Patrol({ spawn, isGroupHovered }: Props) {
  // Change key to force re-render
  const [patrolKey, setPatrolKey] = useState(0)

  useEffect(() => {
    setPatrolKey((prevKey) => prevKey + 1000)
  }, [isGroupHovered])

  if (!spawn.patrol.length) return null

  return (
    <Polygon
      key={patrolKey}
      positions={spawn.patrol}
      color="#1d1db0"
      fillOpacity={0}
      weight={isGroupHovered ? 6 : 2}
      dashArray={isGroupHovered ? undefined : [4, 10]}
      opacity={isGroupHovered ? 1 : 0.5}
    />
  )
}
