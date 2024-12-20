import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBb1414czI8JHzEa9QPsmUsFKIvJBYV-1A",
    authDomain: "documentz-chat.firebaseapp.com",
    projectId: "documentz-chat",
    storageBucket: "documentz-chat.firebasestorage.app",
    messagingSenderId: "387161300332",
    appId: "1:387161300332:web:6905b44ea4c80fac296749"
  };

// initialize db - only initialize a new app if we don't have one yet (avoid duplicate records due to duplicate connections)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app)
export const storage = getStorage(app)