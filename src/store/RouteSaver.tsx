import { useAppDispatch, useRoute } from './hooks.ts'
import { useEffect } from 'react'
import { getSavedRouteKey, updateSavedRoutes } from './routesReducer.ts'
import * as localforage from 'localforage'
import { MdtRoute } from '../code/types.ts'
import { importRoute } from '../api/importRoute.ts'
import { importRoute as importRouteAction } from '../store/routesReducer.ts'

export function RouteSaver() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  // initial import from URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mdtString = urlParams.get('mdt')
    if (mdtString) {
      importRoute(mdtString).then((mdtRoute: MdtRoute) => {
        dispatch(importRouteAction(mdtRoute))
      })
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
