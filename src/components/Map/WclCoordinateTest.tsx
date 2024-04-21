import { Rectangle, Tooltip } from 'react-leaflet'
import { wclPointToLeafletPoint, type WclResult } from '../../util/wclCalc.ts'
import wclTestData from '../../util/wclTestData.json'

const wclData = wclTestData as WclResult

const wclPoints = wclData.events
  .map((point) => ({
    x: point.x!,
    y: point.y!,
    mapID: point.mapID!,
  }))
  .filter((point) => point.x && point.y && point.mapID)

const rectSize = 2

export function WclCoordinateTest() {
  return wclPoints.map(wclPointToLeafletPoint).map((point, idx) => (
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
      </Tooltip>
    </Rectangle>
  ))
}
