import { useContext } from 'react'
import { RouteContext } from './RouteProvider.tsx'

export const useRouteContext = () => useContext(RouteContext)!
