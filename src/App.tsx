import 'leaflet/dist/leaflet.css'
import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { persistor, store } from './store/store.ts'
import '@fontsource-variable/roboto-slab'
import { PersistGate } from 'redux-persist/integration/react'
import { ErrorBoundary } from './components/Common/ErrorBoundary.tsx'
import { useEffect } from 'react'
import { isMac } from './util/dev.ts'

export default function App() {
  useEffect(() => {
    // need this style only on windows to fix grid lines
    if (isMac) return
    const style = document.createElement('style')
    style.textContent = 'img.leaflet-tile { mix-blend-mode: normal !important; }'
    document.head.appendChild(style)
  }, [])

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
