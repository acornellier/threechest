import { useEffect, useRef } from 'react'
import type { Route } from '../../util/types.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { selectUser, setSyncState } from '../../store/reducers/cloudReducer.ts'
import { useActualRoute } from '../../store/routes/routeHooks.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { saveRouteToCloud } from '../../api/saveUserRouteApi.ts'
import { setCloudSyncedAt } from '../../store/routes/routesReducer.ts'
import type { AppDispatch } from '../../store/store.ts'

const DEBOUNCE_MS = 2_000

async function pushRoute(uid: string, route: Route, dispatch: AppDispatch) {
  const syncedAt = await saveRouteToCloud(uid, route)
  if (syncedAt) dispatch(setCloudSyncedAt({ routeId: route.uid, syncedAt }))
}

export function RouteCloudSync() {
  const dispatch = useAppDispatch()
  const user = useRootSelector(selectUser)
  const route = useActualRoute()
  const isGuestCollab = useIsGuestCollab()
  const savedRoutes = useRootSelector((state) => state.routes.present.savedRoutes)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousRouteRef = useRef<Route | null>(null)
  const savedRoutesRef = useRef(savedRoutes)
  savedRoutesRef.current = savedRoutes

  useEffect(() => {
    if (!user || isGuestCollab) return

    // Route switched: flush the outgoing route immediately, unless it was deleted
    if (previousRouteRef.current && previousRouteRef.current.uid !== route.uid) {
      const previousRoute = previousRouteRef.current
      const wasDeleted = !savedRoutesRef.current.some((r) => r.uid === previousRoute.uid)
      if (!wasDeleted) {
        pushRoute(user.uid, previousRoute, dispatch).catch(console.error)
      }
    }
    previousRouteRef.current = route

    if (timerRef.current) clearTimeout(timerRef.current)
    dispatch(setSyncState('dirty'))
    timerRef.current = setTimeout(() => {
      dispatch(setSyncState('syncing'))
      pushRoute(user.uid, route, dispatch)
        .then(() => dispatch(setSyncState('idle')))
        .catch(console.error)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [dispatch, user, route, isGuestCollab])

  return null
}
