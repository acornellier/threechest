import { firestore, type FirestoreRoute } from '../store/firestore.ts'
import { doc, setDoc } from 'firebase/firestore'

export const shareRouteApi = async (routeId: string, mdtString: string) => {
  const nextWeek = new Date()
  nextWeek.setDate(new Date().getDate() + 7)

  const firestoreRoute: FirestoreRoute = {
    mdtString,
    expiry: nextWeek,
  }

  const docRef = doc(firestore, 'routes', routeId)
  await setDoc(docRef, firestoreRoute)

  return docRef.id
}
