import { Map } from './Map/Map.tsx'
import { Sidebar } from './Sidebar/Sidebar.tsx'
import { Toasts } from './Modals/Toasts.tsx'
import { ConfirmImportModal } from './Modals/ConfirmImportModal.tsx'
import { RouteSaver } from '../store/routes/RouteSaver.tsx'
import { Header } from './Header/Header.tsx'
import { useEffect } from 'react'
import { defaultDungeonKey, setDungeon } from '../store/routes/routesReducer.ts'
import { useDungeon } from '../store/routes/routeHooks.ts'
import { useAppDispatch } from '../store/storeUtil.ts'
import { TailwindBreakpoint } from './Common/TailwindBreakpoint.tsx'
import { CollabSyncWrapper } from './Collab/CollabSync.tsx'
import { BackgroundImage } from './Common/BackgroundImage.tsx'
import { Footer } from './Header/Footer.tsx'
import { isDev } from '../util/isDev.ts'
import { BottomLeft } from './Modals/BottomLeft/BottomLeft.tsx'

export function Page() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()

  useEffect(() => {
    if (!dungeon) dispatch(setDungeon(defaultDungeonKey))
  }, [dispatch, dungeon])

  if (!dungeon) return null

  return (
    <div className="flex flex-row">
      <BackgroundImage />
      <Map />
      <Header />
      <Sidebar />
      <Footer />
      <BottomLeft />
      <Toasts />
      <ConfirmImportModal />
      <RouteSaver />
      <CollabSyncWrapper />
      {isDev && <TailwindBreakpoint />}
    </div>
  )
}
