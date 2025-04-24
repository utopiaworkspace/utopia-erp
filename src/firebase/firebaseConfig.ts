import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore


const app = initializeApp({
    apiKey: "AIzaSyDMFk8McmXG10FEmlIYEQMvBX8l0rKFa-8",
    authDomain: "utopia-webapp.firebaseapp.com",
    projectId: "utopia-webapp",
    storageBucket: "utopia-webapp.firebasestorage.app",
    messagingSenderId: "981787958950",
    appId: "1:981787958950:web:67c737367e115114589e67",
    measurementId: "G-M0EHC2EPDT"
});

export const firebaseAuth = getAuth(app);
export const db = getFirestore(app); // Export Firestore instance

export default app;
