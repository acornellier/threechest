import { Rectangle, Tooltip } from 'react-leaflet'
import { Point } from '../../data/types.ts'
import { getPullColor } from '../../util/colors.ts'

const wclPoints = [
  { x: -138398, y: 52060 }, // 1
  { x: -137777, y: 57263 },
  { x: -138608, y: 60608 },
  { x: -142866, y: 40042 },
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
  { x: 122041, y: 96375 },
]

const pulls = [
  {
    boundingBox: {
      minX: -140663,
      maxX: -135945,
      minY: 50163,
      maxY: 58267,
    },
  },
  {
    boundingBox: {
      minX: -140536,
      maxX: -136338,
      minY: 51289,
      maxY: 65315,
    },
  },
  {
    boundingBox: {
      minX: -143949,
      maxX: -137651,
      minY: 45248,
      maxY: 61407,
    },
  },
  {
    boundingBox: {
      minX: -146948,
      maxX: -142029,
      minY: 39542,
      maxY: 49673,
    },
  },
  {
    boundingBox: {
      minX: -153294,
      maxX: -146952,
      minY: 36518,
      maxY: 41927,
    },
  },
  {
    boundingBox: {
      minX: -156095,
      maxX: -150325,
      minY: 33506,
      maxY: 39490,
    },
  },
  {
    boundingBox: {
      minX: -164035,
      maxX: -152199,
      minY: 38023,
      maxY: 50465,
    },
  },
  {
    boundingBox: {
      minX: -162129,
      maxX: -157394,
      minY: 41177,
      maxY: 48733,
    },
  },
  {
    boundingBox: {
      minX: -164908,
      maxX: -156047,
      minY: 38794,
      maxY: 47482,
    },
  },
  {
    boundingBox: {
      minX: -149863,
      maxX: -139628,
      minY: 61212,
      maxY: 72418,
    },
  },
  {
    boundingBox: {
      minX: -146992,
      maxX: -140915,
      minY: 69647,
      maxY: 77167,
    },
  },
  {
    boundingBox: {
      minX: -156467,
      maxX: -149090,
      minY: 63954,
      maxY: 68246,
    },
  },
  {
    boundingBox: {
      minX: -157526,
      maxX: -150538,
      minY: 61146,
      maxY: 65437,
    },
  },
  {
    boundingBox: {
      minX: -163024,
      maxX: -156890,
      minY: 61772,
      maxY: 65454,
    },
  },
  {
    boundingBox: {
      minX: -162576,
      maxX: -152551,
      minY: 59402,
      maxY: 66732,
    },
  },
  {
    boundingBox: {
      minX: 119992,
      maxX: 126447,
      minY: 92147,
      maxY: 99078,
    },
  },
]

const a = 0.00268
const b = 258
const c = 0.002688
const d = 634
const rectSize = 2

const wclPointToLeafletPoint = ({ x, y }: { x: number; y: number }) =>
  [a * y - b, c * x + d] as Point

export function WclCoordinateTest() {
  // return wclPoints.map(wclPointToLeafletPoint).map((point, idx) => (
  //   <Rectangle
  //     key={Math.random()}
  //     bounds={[
  //       [point[0] - rectSize, point[1] - rectSize],
  //       [point[0] + rectSize, point[1] + rectSize],
  //     ]}
  //     color="white"
  //     fillOpacity={1}
  //     fillColor="#333333"
  //   >
  //     <Tooltip className={`pull-number-tooltip [&]:text-lg`} direction="center" permanent>
  //       {idx + 1}
  //     </Tooltip>
  //   </Rectangle>
  // ))

  return pulls
    .map(({ boundingBox }) => [
      wclPointToLeafletPoint({ x: boundingBox.minX, y: boundingBox.minY }),
      wclPointToLeafletPoint({ x: boundingBox.maxX, y: boundingBox.maxY }),
    ])
    .map((box, idx) => (
      <Rectangle key={Math.random()} bounds={box} color={getPullColor(idx)}>
        <Tooltip className={`pull-number-tooltip`} direction="center" permanent>
          {idx + 1}
        </Tooltip>
      </Rectangle>
    ))
}
