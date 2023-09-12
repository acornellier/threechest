import { useState } from 'react'
import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { MdtRoute } from '../code/types.ts'

export function ImportRoute() {
  const { dispatch } = useRouteContext()

  const [input, setInput] = useState('')

  const handleClick = () => {
    fetch('http://localhost:3456/api/v1', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ str: input }),
    })
      .then((res) => res.json())
      .then((mdtRoute: MdtRoute) => {
        console.log(mdtRoute)
        dispatch({ type: 'import', mdtRoute })
      })
  }

  return (
    <div className="import-route">
      <input
        placeholder="paste mdt string"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <button onClick={handleClick}>IMPORT</button>
    </div>
  )
}
