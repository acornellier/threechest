import { useEffect } from 'react'
import { getSavedRouteKey, updateSavedRoutes } from './routesReducer.ts'
import * as localforage from 'localforage'
import { importRoute } from '../reducers/importReducer.ts'
import { useIsGuestCollab } from '../collab/collabReducer.ts'

import { useActualRoute } from './routeHooks.ts'
import { useAppDispatch } from '../hooks.ts'

export function RouteSaver() {
  const dispatch = useAppDispatch()
  const route = useActualRoute()
  const isGuestCollab = useIsGuestCollab()

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
    if (!isGuestCollab) dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name, isGuestCollab])

  useEffect(() => {
    if (!isGuestCollab) localforage.setItem(getSavedRouteKey(route.uid), route)
  }, [isGuestCollab, route])

  return null
}
