import { Map } from './Map/Map.tsx'
import { RouteProvider } from './RouteContext/RouteProvider.tsx'
import { Pulls } from './Sidebar/Pulls.tsx'
import { ImportRoute } from './Sidebar/ImportRoute.tsx'
import { ExportRoute } from './Sidebar/ExportRoute.tsx'
import { DungeonDropdown } from './DungeonSelect/DungeonDropdown.tsx'

export function Page() {
  return (
    <RouteProvider>
      <div className="flex flex-row">
        <div className="w-full z-10">
          <Map />
        </div>
        <div className="fixed left-2 top-2 z-20">
          <DungeonDropdown />
        </div>
        <div className="fixed right-0 z-20 mt-24 flex flex-col gap-3 w-[276px]">
          <ImportRoute />
          <ExportRoute />
          <Pulls />
        </div>
      </div>
    </RouteProvider>
  )
}
