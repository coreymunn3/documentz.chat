import { initializeApp, getApps, App, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceKeyDev = require("@/service_key_dev.json");
const serviceKeyProd = require("@/service_key_prod.json");

const serviceKey =
  process.env.NODE_ENV === "production" ? serviceKeyProd : serviceKeyDev;

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceKey),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const storage = getStorage(app);

export { app as adminApp, adminDb };
export { storage as adminStorage };
