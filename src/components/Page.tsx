import { Map } from './Map/Map.tsx'
import { DungeonDropdown } from './DungeonSelect/DungeonDropdown.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'
import { Toasts } from './Toast/Toasts.tsx'

export function Page() {
  return (
    <div className="flex flex-row">
      <Map />
      <Sidebar />
      <DungeonDropdown />
      <Toasts />
    </div>
  )
}
