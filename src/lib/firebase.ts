import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * True when all required Vite env vars are present (set in Vercel → Project → Settings → Environment Variables).
 * Do not throw at module load — missing vars caused a blank page on Vercel before React could mount.
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

let firebaseApp: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/** Returns null if env is not configured (site still renders; CMS calls must check). */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (firebaseApp) return firebaseApp;
  if (getApps().length) {
    firebaseApp = getApp();
    return firebaseApp;
  }
  firebaseApp = initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}
