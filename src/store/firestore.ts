import { initializeApp } from 'firebase/app'
import { collection, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB_aaDs-FmuJKfo-kxlX2ROviIsurfNOSA',
  authDomain: 'threechest.firebaseapp.com',
  projectId: 'threechest',
  storageBucket: 'threechest.appspot.com',
  messagingSenderId: '181733656278',
  appId: '1:181733656278:web:e1b9cfb71fce95e3182b77',
}

const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)
export const routesCollection = collection(firestore, 'routes')

export type FirestoreRoute = {
  mdtString: string
  expiry: Date
}
