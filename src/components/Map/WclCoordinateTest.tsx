import { Rectangle, Tooltip } from 'react-leaflet'
import { wclPointToLeafletPoint } from '../../util/wclCalc.ts'

const wclPoints = [
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -120848,
    y: -125665,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -121089,
    y: -115764,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -119936,
    y: -111378,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -127958,
    y: -117322,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -123400,
    y: -115600,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -260923,
    y: -250886,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -269098,
    y: -254355,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -268182,
    y: -242205,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -271297,
    y: -238988,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -256541,
    y: -237553,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -264127,
    y: -244607,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -404756,
    y: -188074,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -413053,
    y: -188138,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -424768,
    y: -195545,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -411262,
    y: -205594,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -417630,
    y: -200387,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -2147483648,
    y: -2147483648,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -413434,
    y: -195620,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -429883,
    y: -203853,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -428389,
    y: -70620,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -418609,
    y: -52287,
  },
  {
    maps: [
      {
        id: 2093,
      },
    ],
    x: -409845,
    y: -51883,
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
