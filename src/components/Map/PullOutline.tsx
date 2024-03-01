import { Pull } from '../../code/types.ts'
import { Polygon, Tooltip } from 'react-leaflet'
import { useRoute } from '../RouteContext/UseRoute.ts'
import { useEffect, useState } from 'react'

interface Props {
  pull: Pull
  hull: Array<[number, number]>
  idx: number
}

export function PullOutline({ pull, hull, idx }: Props) {
  const {
    route: { selectedPull },
    hoveredPull,
  } = useRoute()

  const isHovered = hoveredPull === idx
  const isSelected = selectedPull === idx

  // Change key to force re-render
  const [foo, setFoo] = useState(0)
  useEffect(() => {
    setFoo((foo) => foo + 1000)
  }, [isHovered, isSelected, pull])

  return (
    <Polygon
      key={foo}
      positions={hull}
      color={pull.color}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip className="pull-number-tooltip" direction="center" permanent>
        {idx + 1}
      </Tooltip>
    </Polygon>
  )
}
