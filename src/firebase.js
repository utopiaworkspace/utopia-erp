import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ✅ 你的 Firebase 项目设定
const firebaseConfig = {
  apiKey: "AIzaSyDMFk8McmXG10FEmlIYEQMvBX8l0rKFa-8",
  authDomain: "utopia-webapp.firebaseapp.com",
  projectId: "utopia-webapp",
  storageBucket: "utopia-webapp.firebasestorage.app",
  messagingSenderId: "981787958950",
  appId: "1:981787958950:web:67c737367e115114589e67",
  measurementId: "G-M0EHC2EPDT"
};

// ✅ 初始化 App 与 Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to handle Google login
export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export { auth };