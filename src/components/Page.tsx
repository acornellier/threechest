import { Map } from './Map/Map.tsx'
import { DungeonDropdown } from './DungeonSelect/DungeonDropdown.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'
import { Toasts } from './Toast/Toasts.tsx'
import { UndoRedo } from './UndoRedo.tsx'

export function Page() {
  return (
    <div className="flex flex-row">
      <Map />
      <DungeonDropdown />
      <UndoRedo />
      <Sidebar />
      <Toasts />
    </div>
  )
}
