import { Route } from '../../code/types.ts'
import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react'
import { emptyRoute, RouterAction, routeReducer } from './RouteReducer.ts'

type Props = {
  children: ReactNode
}

export type RouteContextValue = {
  route: Route
  dispatch: Dispatch<RouterAction>
}

export const RouteContext = createContext<RouteContextValue | null>(null)

export function RouteProvider({ children }: Props) {
  const [route, dispatch] = useReducer(routeReducer, emptyRoute)

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      dispatch,
    }),
    [route, dispatch],
  )

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}
