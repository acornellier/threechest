import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { persistor, store } from './store/store.ts'
import '@fontsource-variable/roboto-slab'
import { PersistGate } from 'redux-persist/integration/react'
import { ErrorBoundary } from './components/Common/ErrorBoundary.tsx'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <Page />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  )
}
