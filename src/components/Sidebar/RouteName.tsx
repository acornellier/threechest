import { useEffect, useState } from 'react'
import { useAppDispatch, useRoute } from '../../store/hooks.ts'
import { setName } from '../../store/routesReducer.ts'

export function RouteName() {
  const route = useRoute()
  const dispatch = useAppDispatch()

  const [input, setInput] = useState(route.name)

  useEffect(() => {
    if (input !== route.name) setInput(route.name)
  }, [input, route.name])

  return (
    <input
      className="p-1 w-full bg-gray-100"
      placeholder="Route name"
      onChange={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setInput(e.target.value)
        dispatch(setName(e.target.value))
      }}
      value={input}
    />
  )
}
