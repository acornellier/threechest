import { Map } from './Map.tsx'
import { RouteProvider } from './RouteContext/RouteProvider.tsx'
import { Pulls } from './Pulls.tsx'
import { ImportRoute } from './ImportRoute.tsx'

export function Page() {
  return (
    <RouteProvider>
      <div className="page">
        <Map />
        <div className="sidebar">
          <ImportRoute />
          <Pulls />
        </div>
      </div>
    </RouteProvider>
  )
}
