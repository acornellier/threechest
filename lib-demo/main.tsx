import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouteMap } from '../dist-lib/route-map.js'
import '../dist-lib/style.css'

const params = new URLSearchParams(window.location.search)
const sampleMdtString =
  '!~MDT2~XVBLTxNRFHbudGb6mLaAED8WarUqKqJtLUJ9QaEVERNRHgqKCbT34ugwlc4Mj8SFd6ASjbpgb2IaKf4HE0P8Cy7FjTHGvWHVjSmCrS7P+Z7nlFIWXbBGhh/QUI+uGVnNmA6NTuo01BqLpuYpfSRcy2qMaRlbtxZJr61lB+YzejTW2Z5oi8bSc5O6TUsDGTufp4Y1aOv6nhs7w5A9pdM5qgs3dxYp25imOaM/u4Biv0l1mrG0nPE0/djWdfPlulBQ/Q17AfIaB3AQIRxCDGdxC0MYxghGcRt3MCYue0WXx8WJxD0yV9KZnJ7L94UZi0cYKwlOYxN5gS50I4ke9CKFNK6gD1dFrkhckR1vcFdSESRYkTxDAudxARdxCZdr/eKRkrAUrKsnqziKY2jBcZzASbTiFNpwGmcQQRRxtOMcOtApOpLs4qLsSJ5qwlRnpRQPEAdhHPFzIcCFIBeqKZWc9wJHMylgHHdxDxO4Lzo+1cUliXsVXufmNX4VerGh1iAeSbA1t+Pzewp/39bidbw+1XFJtULGSm6uepZxGOHKPXVcaORCU61XgsUj64Lj9pAVr0/1B9we0fEHlCVJVlQu7qtSK79hbE1YIdgvuiRZIc+RhwmLbE+yQ0SVk112YvvKYv2/tRkbpAadWUyapjZtzFDDMt/25aYe0oxlLhWT2UK5e+Ldh5+hzVfljcmxza9vfq0KW6nrtmklja0/+OKXj9R+0lvesD7J4fGWz//jsx1dqdnvQ+WN2R/qN6NZrOK/AQ=='

// Pass ?mdt=<export string> to show another route.
const mdtString = params.get('mdt') || sampleMdtString

function Demo() {
  const [selectedPull, setSelectedPull] = useState(0)

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18 }}>Host page</h1>
      <p>
        Selected pull: {selectedPull + 1}{' '}
        <button onClick={() => setSelectedPull((pull) => Math.max(0, pull - 1))}>Prev</button>{' '}
        <button onClick={() => setSelectedPull((pull) => pull + 1)}>Next</button>
      </p>
      <RouteMap
        mdtString={mdtString}
        selectedPull={selectedPull}
        onPullSelect={setSelectedPull}
        style={{ width: 900, height: 600 }}
      />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Demo />)
