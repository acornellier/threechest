import { deleteField, doc, writeBatch } from 'firebase/firestore'
import { firestore } from '../store/firestore.ts'

export async function deleteUserRoute(uid: string, routeId: string) {
  const batch = writeBatch(firestore)
  batch.delete(doc(firestore, 'users', uid, 'routes', routeId))
  batch.update(doc(firestore, 'users', uid), { [`routes.${routeId}`]: deleteField() })
  await batch.commit()
}
