import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAn5QFh6RjOxXeFplA6MRejmWHyHlll87c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "the-glorious-church.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "the-glorious-church",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "the-glorious-church.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "262634622804",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:262634622804:web:230d7750f52fa63f2582c1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-609S19MN7Q"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const storage = getStorage(app);

const useEmulator = import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true';

if (useEmulator) {
  const emulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const emulatorPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8085);
  connectFirestoreEmulator(db, emulatorHost, emulatorPort);
  console.info(`Firebase initialized for project: ${firebaseConfig.projectId} (emulator mode @ ${emulatorHost}:${emulatorPort})`);
} else {
  console.info(`Firebase initialized for project: ${firebaseConfig.projectId} (production mode)`);
}

// NOTE: To switch the app to a different Firebase project, update the VITE_FIREBASE_* values in .env.local

export const analytics = isSupported().then((supported) => (
  supported ? getAnalytics(app) : null
));
