import { Pull } from '../../code/types.ts'
import { Circle, Polygon, Tooltip } from 'react-leaflet'
import { memo, useEffect, useMemo, useState } from 'react'
import { useRoutesSelector } from '../../store/hooks.ts'
import { getPullColor } from '../../code/colors.ts'
import { Point } from '../../data/types.ts'
import { expandPolygon, iconSizeMagicScaling, makeConvexHull } from '../../code/hull.ts'
import { mobScale } from '../../code/mobSpawns.ts'

interface Props {
  pullId: number
  index: number
  isHovered: boolean
  isSelected: boolean
}

interface Outline {
  hull?: Array<Point>
  circle?: { center: Point; radius: number }
}

function createOutline(pull: Pull): Outline {
  if (pull.mobSpawns.length <= 0) return {}

  if (pull.mobSpawns.length === 1) {
    const mobSpawn = pull.mobSpawns[0]
    const scale = mobScale(mobSpawn.mob)
    return {
      circle: {
        center: mobSpawn.spawn.pos,
        radius: scale * iconSizeMagicScaling * (mobSpawn.mob.isBoss ? 1.1 : 1),
      },
    }
  }

  const vertices = pull.mobSpawns.map((mobSpawn) => ({
    pos: mobSpawn.spawn.pos,
    scale: mobScale(mobSpawn.mob),
  }))

  let hull = makeConvexHull(vertices)
  hull = expandPolygon(hull, 10)
  hull = makeConvexHull(hull)

  return { hull: hull.map((m) => m.pos) }
}

function PullOutlineComponent({ pullId, index, isSelected, isHovered }: Props) {
  const pull = useRoutesSelector((state) => state.route.pulls.find((pull) => pull.id === pullId))!
  const { hull, circle } = useMemo(() => createOutline(pull), [pull])
  const pullColor = getPullColor(index)

  // Change key to force re-render
  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((prevKey) => prevKey + 1000)
  }, [isHovered, isSelected, pull])

  return circle ? (
    <Circle
      key={key}
      center={circle.center}
      radius={circle.radius}
      color={pullColor}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip className="pull-number-tooltip" direction="center" permanent offset={[0, -15]}>
        {index + 1}
      </Tooltip>
    </Circle>
  ) : hull ? (
    <Polygon
      key={key}
      positions={hull}
      color={pullColor}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip className="pull-number-tooltip" direction="center" permanent>
        {index + 1}
      </Tooltip>
    </Polygon>
  ) : null
}

export const PullOutline = memo(PullOutlineComponent)
