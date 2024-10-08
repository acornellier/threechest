import { doc, getDoc } from 'firebase/firestore'
import { firestore, type FirestoreRoute } from '../store/firestore.ts'

export const getFirestoreRouteApi = async (routeId: string): Promise<FirestoreRoute> => {
  const docRef = await getDoc(doc(firestore, 'routes', routeId))

  return docRef.data() as FirestoreRoute
}
