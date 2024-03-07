import { Map } from './Map/Map.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'
import { Toasts } from './Modals/Toasts.tsx'
import { TopBar } from './TopBar/TopBar.tsx'
import { ConfirmImportModal } from './Modals/ConfirmImportModal.tsx'
import { RouteSaver } from '../store/RouteSaver.tsx'

export function Page() {
  return (
    <div className="flex flex-row">
      <Map />
      <TopBar />
      <Sidebar />
      <Toasts />
      <ConfirmImportModal />
      <RouteSaver />
    </div>
  )
}
