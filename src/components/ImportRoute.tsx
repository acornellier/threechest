import { useState } from 'react'
import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { MdtRoute } from '../code/types.ts'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/importRoute'
    : '/api/importRoute'

export function ImportRoute() {
  const { dispatch } = useRouteContext()

  const [input, setInput] = useState('')

  const handleClick = () => {
    fetch(importUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ str: input }),
    })
      .then((res) => res.json())
      .then((mdtRoute: MdtRoute) => {
        dispatch({ type: 'import', mdtRoute })
      })
  }

  return (
    <div className="import-route">
      <input
        placeholder="Paste mdt string"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <button onClick={handleClick}>Import</button>
    </div>
  )
}
