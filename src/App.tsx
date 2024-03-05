import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { persistor, store } from './store/store.ts'
import { ToastProvider } from './components/Toast/ToastProvider.tsx'
import '@fontsource-variable/roboto-slab'
import { RouteSaver } from './store/RouteSaver.tsx'
import { PersistGate } from 'redux-persist/integration/react'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <RouteSaver />
          <Page />
        </ToastProvider>
      </PersistGate>
    </Provider>
  )
}
