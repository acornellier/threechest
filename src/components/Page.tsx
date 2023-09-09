import { Map } from './Map.tsx'
import { RouteProvider } from './RouteContext/RouteProvider.tsx'
import { Pulls } from './Pulls.tsx'

export function Page() {
  return (
    <RouteProvider>
      <div className="page">
        <Map />
        <Pulls />
      </div>
    </RouteProvider>
  )
}
