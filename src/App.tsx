import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { CRS, LatLngBoundsExpression, LatLngExpression, Point } from 'leaflet'

const height = 256
const width = 384
const maxCoords = [-height, width]

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [-height, width],
]

function App() {
  const center: LatLngExpression = [maxCoords[0] / 2, maxCoords[1] / 2]

  return (
    <MapContainer
      crs={CRS.Simple}
      center={center}
      maxBounds={bounds}
      minZoom={1}
      maxZoom={5}
      zoom={1}
      zoomControl={false}
      zoomDelta={0.1}
      zoomSnap={0.1}
    >
      <TileLayer
        attribution="Map data © Blizzard Entertainment"
        bounds={bounds}
        noWrap
        tileSize={new Point(width, height)}
        url="/vp/{z}/{x}_{y}.png"
      />
      <Marker position={[0, 0]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      <Marker position={center}>
        <Popup>center</Popup>
      </Marker>
    </MapContainer>
  )
}

export default App
