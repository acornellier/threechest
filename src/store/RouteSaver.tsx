import { useAppDispatch, useRoute } from './hooks.ts'
import { useEffect } from 'react'
import { getSavedRouteKey, updateSavedRoutes } from './routesReducer.ts'
import * as localforage from 'localforage'

export function RouteSaver() {
  const dispatch = useAppDispatch()

  const route = useRoute()
  useEffect(() => {
    dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name])

  useEffect(() => {
    localforage.setItem(getSavedRouteKey(route.uid), route)
  }, [route])

  return null
}
