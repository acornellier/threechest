import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { useRootSelector, useRoute } from './store/hooks.ts'
import { useEffect } from 'react'
import { lastDungeonKey, routeLocalStorageKey } from './store/reducer.ts'
import { ToastProvider } from './components/Toast/ToastProvider.tsx'

function RouteSaver() {
  const route = useRoute()
  useEffect(() => {
    localStorage.setItem(lastDungeonKey, route.dungeonKey)
    localStorage.setItem(routeLocalStorageKey + route.dungeonKey, JSON.stringify(route))
  }, [route])

  return null
}

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <RouteSaver />
        <Page />
      </ToastProvider>
    </Provider>
  )
}
