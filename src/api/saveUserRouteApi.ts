import { doc, writeBatch } from 'firebase/firestore'
import { firestore } from '../store/firestore.ts'
import type { Route } from '../util/types.ts'

export async function saveRouteToCloud(uid: string, route: Route): Promise<string | null> {
  if (route.pulls.every((route) => route.spawns.length === 0)) {
    return null
  }

  const syncedAt = new Date().toISOString()
  const batch = writeBatch(firestore)

  batch.set(doc(firestore, 'users', uid, 'routes', route.uid), { ...route, updatedAt: syncedAt })
  batch.set(doc(firestore, 'users', uid), { routes: { [route.uid]: syncedAt } }, { merge: true })

  await batch.commit()
  return syncedAt
}
