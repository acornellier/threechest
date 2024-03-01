import { useEffect, useState } from 'react'
import { useAppDispatch, useRoute } from '../../store/hooks.ts'
import { setName } from '../../store/reducer.ts'

export function RouteName() {
  const route = useRoute()
  const dispatch = useAppDispatch()

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
          dispatch(setName(e.target.value))
        }}
        value={input}
      />
    </div>
  )
}
