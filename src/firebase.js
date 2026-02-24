// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnFvGMImnUQoe8dGtq32Yz-a8_6bMtjFQ",
  authDomain: "projectyelamudhram.firebaseapp.com",
  databaseURL: "https://projectyelamudhram-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projectyelamudhram",
  storageBucket: "projectyelamudhram.firebasestorage.app",
  messagingSenderId: "583393678546",
  appId: "1:583393678546:web:4c877bbfba740ed375890b"
};

// ✅ Initialize ONCE
const app = initializeApp(firebaseConfig);

// ✅ Export services
export const db = getDatabase(app);