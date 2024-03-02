import { Map } from './Map/Map.tsx'
import { Pulls } from './Sidebar/Pulls.tsx'
import { ImportRoute } from './Sidebar/ImportRoute.tsx'
import { ExportRoute } from './Sidebar/ExportRoute.tsx'
import { DungeonDropdown } from './DungeonSelect/DungeonDropdown.tsx'
import { RouteName } from './Sidebar/RouteName.tsx'

export function Page() {
  return (
    <div className="flex flex-row">
      <div className="w-full z-10">
        <Map />
      </div>
      <div className="fixed left-2 top-2 z-20">
        <DungeonDropdown />
      </div>
      <div className="fixed right-0 z-20 mt-4 flex flex-col gap-3 w-[276px]">
        <RouteName />
        <ImportRoute />
        <ExportRoute />
        <Pulls />
      </div>
    </div>
  )
}
