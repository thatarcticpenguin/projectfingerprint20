import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnFvGMImnUQoe8dGtq32Yz-a8_6bMtjFQ",
  authDomain: "projectyelamudhram.firebaseapp.com",
  databaseURL:
    "https://projectyelamudhram-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projectyelamudhram",
  storageBucket: "projectyelamudhram.firebasestorage.app",
  messagingSenderId: "583393678546",
  appId: "1:583393678546:web:4c877bbfba740ed375890b"
};

// Ensure we only ever initialize once, even under React StrictMode double-invokes
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app);


