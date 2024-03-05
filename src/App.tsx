import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { ToastProvider } from './components/Toast/ToastProvider.tsx'
import '@fontsource-variable/roboto-slab'
import { RouteSaver } from './store/RouteSaver.tsx'

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
