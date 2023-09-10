import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Pull } from './Pull.tsx'
import { useState } from 'react'
import parser from 'node-weakauras-parser'

export function Pulls() {
  const { route, dispatch } = useRouteContext()

  const [importText, setImportText] = useState('')

  const importRoute = async () => {
    const decoded = await parser.decode(importText)
    console.log(decoded)
  }

  return (
    <div className="pulls">
      <input value={importText} onChange={(e) => setImportText(e.target.value)} />
      <button onClick={importRoute}> IMPORT </button>
      {route.pulls.map((pull, idx) => (
        <Pull key={idx} pullIndex={idx} pull={pull} />
      ))}
      <button onClick={() => dispatch({ type: 'add_pull' })}> ADD PULL </button>
    </div>
  )
}
