import { useEffect } from 'react'
import { saveRoute, updateSavedRoutes } from './routesReducer.ts'
import { importMdtRoute } from '../reducers/importReducer.ts'
import { useIsGuestCollab } from '../collab/collabReducer.ts'

import { useActualRoute } from './routeHooks.ts'
import { useAppDispatch } from '../storeUtil.ts'

export function RouteSaver() {
  const dispatch = useAppDispatch()
  const route = useActualRoute()
  const isGuestCollab = useIsGuestCollab()

  // initial import from URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const text = urlParams.get('mdt')
    if (text) {
      dispatch(importMdtRoute({ text }))
      window.history.pushState(null, '', window.location.origin)
    }
  }, [dispatch])

  // Whenever route UID or name changes, update saved routes, unless guest
  useEffect(() => {
    if (!isGuestCollab) dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name, isGuestCollab])

  // Whenever route changes, save it, unless guest
  useEffect(() => {
    if (!isGuestCollab) saveRoute(route)
  }, [isGuestCollab, route])

  return null
}
