import { Map } from './Map/Map.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'
import { Toasts } from './Modals/Toasts.tsx'
import { ConfirmImportModal } from './Modals/ConfirmImportModal.tsx'
import { RouteSaver } from '../store/routes/RouteSaver.tsx'
import { MobInfo } from './MobInfo.tsx'
import { Header } from './Header/Header.tsx'
import { Footer } from './Header/Footer.tsx'
import { useAppDispatch, useDungeon } from '../store/hooks.ts'
import { useEffect } from 'react'
import { defaultDungeonKey, setDungeon } from '../store/routes/routesReducer.ts'

export function Page() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()

  useEffect(() => {
    if (!dungeon) dispatch(setDungeon(defaultDungeonKey))
  }, [dispatch, dungeon])

  if (!dungeon) return null

  return (
    <div className="flex flex-row bg-[#241c15]">
      <Map />
      <Header />
      <Sidebar />
      <Footer />
      <MobInfo />
      <Toasts />
      <ConfirmImportModal />
      <RouteSaver />
    </div>
  )
}
