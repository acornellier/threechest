import { doc, writeBatch } from 'firebase/firestore'
import { firestore } from '../store/firestore.ts'
import type { Route } from '../util/types.ts'

export async function saveRouteToCloud(uid: string, route: Route): Promise<string | null> {
  console.log('saveRouteToCloude', route)
  if (route.pulls.every((route) => route.spawns.length === 0)) {
    return null
  }

  const syncedAt = new Date().toISOString()
  const batch = writeBatch(firestore)

  // Firestore does not support nested arrays, so Drawing.positions (Point[][])
  // can't be stored directly. Serialize drawings to a JSON string instead.
  // TODO: stringify the whole route object
  const { drawings, ...rest } = route
  batch.set(doc(firestore, 'users', uid, 'routes', route.uid), {
    ...rest,
    drawingsJson: JSON.stringify(drawings ?? []),
    updatedAt: syncedAt,
  })
  batch.set(doc(firestore, 'users', uid), { routes: { [route.uid]: syncedAt } }, { merge: true })

  await batch.commit()
  return syncedAt
}
