import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAn5QFh6RjOxXeFplA6MRejmWHyHlll87c",
  authDomain: "the-glorious-church.firebaseapp.com",
  projectId: "the-glorious-church",
  storageBucket: "the-glorious-church.firebasestorage.app",
  messagingSenderId: "262634622804",
  appId: "1:262634622804:web:230d7750f52fa63f2582c1",
  measurementId: "G-609S19MN7Q"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export const storage = getStorage(app);

export const analytics = isSupported().then((supported) => (
  supported ? getAnalytics(app) : null
));
