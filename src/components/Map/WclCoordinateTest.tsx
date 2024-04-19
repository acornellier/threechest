import { Rectangle, Tooltip } from 'react-leaflet'
import { wclPointToLeafletPoint } from '../../util/wclCalc.ts'

const wclPoints = [
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -108160,
    y: -506595,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -114499,
    y: -509243,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -120008,
    y: -507057,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -118364,
    y: -506566,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -121532,
    y: -509868,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -129331,
    y: -510267,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -125847,
    y: -508135,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -125330,
    y: -512939,
  },
  {
    maps: [
      {
        id: 2073,
      },
    ],
    x: -125330,
    y: -512939,
  },
  {
    maps: [
      {
        id: 2074,
      },
    ],
    x: -125158,
    y: -529708,
  },
  {
    maps: [
      {
        id: 2074,
      },
    ],
    x: -108564,
    y: -526713,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -110485,
    y: -528679,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -104834,
    y: -528410,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -88065,
    y: -534407,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -82883,
    y: -531101,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -72489,
    y: -537465,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -79225,
    y: -533706,
  },
  {
    maps: [
      {
        id: 2075,
      },
    ],
    x: -79225,
    y: -533706,
  },
  {
    maps: [
      {
        id: 2076,
      },
    ],
    x: -99503,
    y: -541817,
  },
  {
    maps: [
      {
        id: 2076,
      },
    ],
    x: -110647,
    y: -535865,
  },
  {
    maps: [
      {
        id: 2077,
      },
    ],
    x: -108226,
    y: -534482,
  },
  {
    maps: [
      {
        id: 2077,
      },
    ],
    x: -108226,
    y: -534482,
  },
].map((point) => ({
  x: point.x,
  y: point.y,
  mapID: point.maps[0]!.id,
}))

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
