import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  development: {
    apiKey: "AIzaSyBb1414czI8JHzEa9QPsmUsFKIvJBYV-1A",
    authDomain: "documentz-chat.firebaseapp.com",
    projectId: "documentz-chat",
    storageBucket: "documentz-chat.firebasestorage.app",
    messagingSenderId: "387161300332",
    appId: "1:387161300332:web:6905b44ea4c80fac296749",
  },
  production: {
    apiKey: "AIzaSyCoXnkg8LayxwXnJPtCVBenHoT9SGCwhTQ",
    authDomain: "documentz-chat-prod.firebaseapp.com",
    projectId: "documentz-chat-prod",
    storageBucket: "documentz-chat-prod.firebasestorage.app",
    messagingSenderId: "682877007610",
    appId: "1:682877007610:web:22368c253878cacd2a3b43",
  },
};

const config =
  process.env.NODE_ENV === "production"
    ? firebaseConfig.production
    : firebaseConfig.development;

// initialize db - only initialize a new app if we don't have one yet (avoid duplicate records due to duplicate connections)
const app = getApps().length === 0 ? initializeApp(config) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
