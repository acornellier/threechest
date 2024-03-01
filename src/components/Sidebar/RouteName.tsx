import { useEffect, useState } from 'react'
import { useRoute } from '../RouteContext/UseRoute.ts'

export function RouteName() {
  const { route, dispatch } = useRoute()

  const [input, setInput] = useState(route.name)

  useEffect(() => {
    if (input !== route.name) setInput(route.name)
  }, [input, route.name])

  return (
    <div className="p-2 bg-gray-900 border-2 border-gray-700 rounded-md flex gap-2">
      <input
        className="p-1 w-full"
        placeholder="Route name"
        onChange={(e) => {
          setInput(e.target.value)
          dispatch({ type: 'set_route', route: { ...route, name: e.target.value } })
        }}
        value={input}
      />
    </div>
  )
}
