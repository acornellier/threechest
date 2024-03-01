import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { useRoute } from './store/hooks.ts'
import { useEffect } from 'react'
import { routeLocalStorageKey } from './store/reducer.ts'

function RouteSaver() {
  const route = useRoute()
  useEffect(() => {
    localStorage.setItem(routeLocalStorageKey, JSON.stringify(route))
  }, [route])

  return null
}

export default function App() {
  return (
    <Provider store={store}>
      <RouteSaver />
      <Page />
    </Provider>
  )
}
