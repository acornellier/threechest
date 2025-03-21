import { Rectangle, Tooltip } from 'react-leaflet'
import {
  urlToWclInfo,
  type WclEventSimplified,
  type WclPoint,
  wclPointToLeafletPoint,
  type WclResult,
} from '../../util/wclCalc.ts'
import { useEffect, useState } from 'react'

const url = ''

const rectSize = 2

export function WclCoordinateTest() {
  const [points, setPoints] = useState<WclEventSimplified[]>([])

  useEffect(() => {
    try {
      const { code, fightId } = urlToWclInfo(url)
      import(`../../../server/cache/wclRoute/${code}-${fightId}.json`)
        .then((res: WclResult) => {
          setPoints(res.events.filter((point) => point.x && point.y && point.mapID))
        })
        .catch((_) => setPoints([]))
    } catch (_) {
      setPoints([])
    }
  }, [])

  if (!points.length) return null

  return points.map((event, idx) => {
    // if (idx > 40) return null
    const point = wclPointToLeafletPoint(event as WclPoint)
    return (
      <Rectangle
        key={Math.random()}
        bounds={[
          [point[0] - rectSize, point[1] - rectSize],
          [point[0] + rectSize, point[1] + rectSize],
        ]}
        color="red"
        fillOpacity={1}
        fillColor="blue"
      >
        <Tooltip className={`pull-number-tooltip [&]:text-lg`} direction="center" permanent>
          {idx + 1}
          {/* <span className="-mr-9 text-xs">{event.timestamp}</span>*/}
        </Tooltip>
      </Rectangle>
    )
  })
}
