import { Map } from './Map/Map.tsx'
import { DungeonDropdown } from './DungeonSelect/DungeonDropdown.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'

export function Page() {
  return (
    <div className="flex flex-row">
      <div className="w-full z-10">
        <Map />
      </div>
      <div className="fixed left-2 top-2 z-20">
        <DungeonDropdown />
      </div>
      <Sidebar />
    </div>
  )
}
