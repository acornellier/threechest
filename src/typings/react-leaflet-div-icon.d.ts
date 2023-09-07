declare module 'react-leaflet-div-icon' {
  import { DivIconOptions } from 'leaflet'
  import { MarkerProps } from 'react-leaflet'

  const DivIcon: React.FC<DivIconOptions & MarkerProps>

  export default DivIcon
}
