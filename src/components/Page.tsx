import { Map } from './Map/Map.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'
import { Toasts } from './Toast/Toasts.tsx'
import { TopBar } from './TopBar/TopBar.tsx'

export function Page() {
  return (
    <div className="flex flex-row">
      <Map />
      <TopBar />
      <Sidebar />
      <Toasts />
    </div>
  )
}
