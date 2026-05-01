import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../store/firestore.ts'
import type { Route } from '../util/types.ts'

export type UserManifest = {
  routes: Record<string, string>
}

export async function getUserManifest(uid: string): Promise<UserManifest> {
  const snap = await getDoc(doc(firestore, 'users', uid))
  return (snap.data() as UserManifest) ?? { routes: {} }
}

export async function getRouteFromCloud(uid: string, routeId: string): Promise<Route | null> {
  const snap = await getDoc(doc(firestore, 'users', uid, 'routes', routeId))
  if (!snap.exists()) return null
  return snap.data() as Route
}
