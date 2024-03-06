import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { persistor, store } from './store/store.ts'
import '@fontsource-variable/roboto-slab'
import { RouteSaver } from './store/RouteSaver.tsx'
import { PersistGate } from 'redux-persist/integration/react'
import { ConfirmImportModal } from './components/ConfirmImportModal.tsx'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouteSaver />
        <ConfirmImportModal />
        <Page />
      </PersistGate>
    </Provider>
  )
}
