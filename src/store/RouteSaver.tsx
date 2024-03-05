import { useAppDispatch, useRoute, useSavedRoutes } from './hooks.ts'
import { useEffect } from 'react'
import { lastRouteKeyKey, savedRouteKey, savedRoutesKey, updateSavedRoutes } from './reducer.ts'

export function RouteSaver() {
  const dispatch = useAppDispatch()

  const route = useRoute()
  useEffect(() => {
    localStorage.setItem(lastRouteKeyKey, route.uid)
    dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name])

  useEffect(() => {
    localStorage.setItem([savedRouteKey, route.uid].join('-'), JSON.stringify(route))
  }, [route])

  const savedRoutes = useSavedRoutes()
  useEffect(() => {
    localStorage.setItem(savedRoutesKey, JSON.stringify(savedRoutes))
  }, [savedRoutes])

  return null
}
