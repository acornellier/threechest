import { firestore, type FirestoreRoute } from '../store/firestore.ts'
import { doc, setDoc } from 'firebase/firestore'

const maxLength = 10_000
const sixMonthsInDays = 6 * 30

export const shareRouteApi = async (routeId: string, mdtString: string) => {
  if (mdtString.length > maxLength) {
    throw new Error(
      `Route export string is too long to share - ${mdtString.length}/${maxLength} bytes. Try removing drawings.`,
    )
  }

  const nextWeek = new Date()
  nextWeek.setDate(new Date().getDate() + sixMonthsInDays)

  const firestoreRoute: FirestoreRoute = {
    mdtString,
    expiry: nextWeek,
  }

  const docRef = doc(firestore, 'routes', routeId)
  await setDoc(docRef, firestoreRoute)

  return docRef.id
}
