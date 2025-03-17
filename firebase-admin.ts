import {
  initializeApp,
  getApps,
  App,
  getApp,
  cert,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// const serviceKeyDev = require("@/service_key_dev.json");
// const serviceKeyProd = require("@/service_key_prod.json");

if (
  !process.env.FIREBASE_TYPE ||
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_PRIVATE_KEY_ID ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_CLIENT_ID ||
  !process.env.FIREBASE_AUTH_URI ||
  !process.env.FIREBASE_TOKEN_URI ||
  !process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
  !process.env.FIREBASE_CLIENT_X509_CERT_URL ||
  !process.env.FIREBASE_UNIVERSE_DOMAIN
) {
  throw new Error("Missing Firebase Credentials from env");
}

const firebaseConfig: ServiceAccount = {
  // type: process.env.FIREBASE_TYPE,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Unescape newlines
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // clientId: process.env.FIREBASE_CLIENT_ID,
  // authUri: process.env.FIREBASE_AUTH_URI,
  // tokenUri: process.env.FIREBASE_TOKEN_URI,
  // authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  // clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  // universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// const serviceKey =
//   process.env.NODE_ENV === "production" ? serviceKeyProd : serviceKeyDev;

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    // credential: cert(serviceKey),
    credential: cert(firebaseConfig),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const storage = getStorage(app);

export { app as adminApp, adminDb };
export { storage as adminStorage };
