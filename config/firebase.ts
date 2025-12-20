import { getApp, getApps, initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCHoDOoOB_cJq4WrneGQjzah0Qbm2-ubwQ",
  authDomain: "moniva-67e0b.firebaseapp.com",
  projectId: "moniva-67e0b",
  storageBucket: "moniva-67e0b.firebasestorage.app",
  messagingSenderId: "990486735182",
  appId: "1:990486735182:web:d1138be2bbd81d9795961f",
  measurementId: "G-NVLLL34P7H",
};

// 1. Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize and EXPORT Auth with Persistence
// We use initializeAuth to explicitly tell Firebase to save the token to the device disk.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// 3. Initialize and EXPORT Firestore
export const db = getFirestore(app);

export default app;
