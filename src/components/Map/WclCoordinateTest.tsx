import { Rectangle, Tooltip } from 'react-leaflet'
import { wclPointToLeafletPoint } from '../../util/wclCalc.ts'

const wclPoints = [
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: -18247,
    y: -1862,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: -9666,
    y: -121,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: -2094,
    y: -7223,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 5417,
    y: -3353,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 11736,
    y: -9,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 20694,
    y: 73,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 20694,
    y: 73,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 14566,
    y: -2260,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 26983,
    y: -8683,
  },
  {
    maps: [
      {
        id: 2082,
      },
    ],
    x: 37266,
    y: -23873,
  },
  {
    maps: [
      {
        id: 2082,
      },
      {
        id: 2083,
      },
    ],
    x: 27622,
    y: -24158,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: 16163,
    y: -36426,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: 16961,
    y: -34898,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: 5439,
    y: -40710,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: 4647,
    y: -41925,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: -1604,
    y: -42677,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: -9726,
    y: -37927,
  },
  {
    maps: [
      {
        id: 2083,
      },
    ],
    x: -20295,
    y: -32045,
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
