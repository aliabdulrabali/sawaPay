// Firebase configuration for SawaPay MVP
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDptZqlEN3bBeBOLzx4-EWI5sdThYUyohA",
  authDomain: "sawapay-999ac.firebaseapp.com",
  projectId: "sawapay-999ac",
  storageBucket: "sawapay-999ac.firebasestorage.app",
  messagingSenderId: "352052602247",
  appId: "1:352052602247:web:ea0d6a6cb14f48e3151f22",
  measurementId: "G-MCV015XSZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
