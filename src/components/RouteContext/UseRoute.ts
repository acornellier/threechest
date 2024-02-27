import { useContext } from 'react'
import { RouteContext } from './RouteProvider.tsx'

export const useRoute = () => useContext(RouteContext)!
