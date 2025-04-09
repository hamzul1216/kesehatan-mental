// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyDkzTI_DGEL36gsElHHVNfzs01u8ITYPMk",
  authDomain: "psikotes-poltekes.firebaseapp.com",
  projectId: "psikotes-poltekes",
  storageBucket: "psikotes-poltekes.firebasestorage.app",
  messagingSenderId: "126101407135",
  appId: "1:126101407135:web:218ceead80d9e7c2e4e9aa",
  measurementId: "G-350KLVSRL9",
  databaseURL:
    "https://psikotes-poltekes-default-rtdb.asia-southeast1.firebasedatabase.app", // Tambahkan URL ini
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
