import './roboto-slab.css'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.scss'
import 'leaflet/dist/leaflet.css'
import TagManager from 'react-gtm-module'
// import { StrictMode } from 'react'

if (process.env.NODE_ENV === 'production') TagManager.initialize({ gtmId: 'G-VZFWC5SP1E' })

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
)
