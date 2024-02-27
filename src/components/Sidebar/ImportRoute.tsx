import { useState } from 'react'
import { useRoute } from '../RouteContext/UseRoute.ts'
import { MdtRoute } from '../../code/types.ts'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/importRoute'
    : '/api/importRoute'

export function ImportRoute() {
  const { dispatch } = useRoute()

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
    <div className="p-2 bg-gray-900 border-2 border-gray-700 rounded-md flex gap-2">
      <input
        className="p-1"
        placeholder="Paste mdt string"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <button className="bg-gray-200 px-2" onClick={handleClick}>
        Import
      </button>
    </div>
  )
}
