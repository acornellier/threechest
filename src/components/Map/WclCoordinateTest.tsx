import { Rectangle, Tooltip } from 'react-leaflet'
import type { Point } from '../../data/types.ts'
import { mapHeight, mapWidth } from '../../util/map.ts'

const wclPoints = [
  { x: -138398, y: 52060 },
  { x: -137777, y: 57263 },
  { x: -138608, y: 60608 },
  { x: -142866, y: 40042 }, // 4
  { x: -149003, y: 39816 },
  { x: -150705, y: 37326 },
  { x: -158859, y: 40062 }, // 7
  { x: -158102, y: 48733 },
  { x: -157928, y: 43345 },
  { x: -148480, y: 67824 },
  { x: -142605, y: 73348 },
  { x: -153119, y: 67604 },
  { x: -155763, y: 63805 },
  { x: -160704, y: 64658 },
  { x: -159568, y: 62891 },
]

const a = 0.00268
const b = 258
const c = 0.002688
const d = 634
const rectSize = 2

const wclPointToLeafletPoint = ({ x, y }: { x: number; y: number }) =>
  [a * y - b, c * x + d] as Point

const yMin = 10.416015625
const yMax = 935.4169921875
const xMin = 956.25
const xMax = 2354.1669921875

export const wclPointToLeafletPoint2 = ({ x, y }: { x: number; y: number }) =>
  [
    -mapHeight + ((y / 100 - yMin) / (yMax - yMin)) * mapHeight,
    mapWidth - ((-x / 100 - xMin) / (xMax - xMin)) * mapWidth,
  ] as Point

export function WclCoordinateTest() {
  console.log(wclPoints)
  console.log(wclPoints.map(wclPointToLeafletPoint))
  console.log(wclPoints.map(wclPointToLeafletPoint2))

  const points1 = wclPoints.map(wclPointToLeafletPoint).map((point, idx) => (
    <Rectangle
      key={Math.random()}
      bounds={[
        [point[0] - rectSize, point[1] - rectSize],
        [point[0] + rectSize, point[1] + rectSize],
      ]}
      color="white"
      fillOpacity={1}
      fillColor="#333333"
    >
      <Tooltip className={`pull-number-tooltip [&]:text-lg`} direction="center" permanent>
        {idx + 1}
      </Tooltip>
    </Rectangle>
  ))

  const points2 = wclPoints.map(wclPointToLeafletPoint2).map((point, idx) => (
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

  return (
    <>
      {...points1}
      {...points2}
    </>
  )
}
