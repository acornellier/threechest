import { useAppDispatch, useRoute, useSavedRoutes } from './hooks.ts'
import { useEffect } from 'react'
import { getSavedRouteKey, lastRouteKeyKey, savedRoutesKey, updateSavedRoutes } from './reducer.ts'

export function RouteSaver() {
  const dispatch = useAppDispatch()

  const route = useRoute()
  console.log(route)
  useEffect(() => {
    localStorage.setItem(lastRouteKeyKey, route.uid)
    dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name])

  useEffect(() => {
    localStorage.setItem(getSavedRouteKey(route.uid), JSON.stringify(route))
  }, [route])

  const savedRoutes = useSavedRoutes()
  useEffect(() => {
    localStorage.setItem(savedRoutesKey, JSON.stringify(savedRoutes))
  }, [savedRoutes])

  return null
}
