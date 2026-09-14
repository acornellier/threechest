import { firestore, type FirestoreRoute } from '../store/firestore.ts'
import { doc, setDoc } from 'firebase/firestore'

const maxLength = 10_000
const sixMonthsInDays = 6 * 30

const shareIdAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz'

/** Unguessable, and never leaves this device except via cloud sync of the owning route. */
export const newShareId = () =>
  Array.from(
    crypto.getRandomValues(new Uint32Array(12)),
    (n) => shareIdAlphabet[n % shareIdAlphabet.length]!,
  ).join('')

export const shareRouteApi = async (mdtString: string, shareId?: string) => {
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

  const docRef = doc(firestore, 'routes', shareId ?? newShareId())
  await setDoc(docRef, firestoreRoute)

  return docRef.id
}
