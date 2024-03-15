import { useAppDispatch, useRoute } from './hooks.ts'
import { useEffect } from 'react'
import { getSavedRouteKey, updateSavedRoutes } from './routesReducer.ts'
import * as localforage from 'localforage'
import { importRoute } from './importReducer.ts'

export function RouteSaver() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  // initial import from URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mdtString = urlParams.get('mdt')
    if (mdtString) {
      dispatch(importRoute({ mdtString }))
      window.history.pushState(null, '', window.location.origin)
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name])

  useEffect(() => {
    localforage.setItem(getSavedRouteKey(route.uid), route)
  }, [route])

  return null
}
