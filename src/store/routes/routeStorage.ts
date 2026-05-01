import * as localforage from 'localforage'
import type { Route } from '../../util/types.ts'

const savedRouteKey = 'savedRoute'
export const getSavedRouteKey = (routeId: string) => [savedRouteKey, routeId].join('-')
export const saveRoute = (route: Route) => localforage.setItem(getSavedRouteKey(route.uid), route)
