import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtsBsWVbtf1EKc-R-9DZETqEabhMPnqU8",
  authDomain: "dandelion-reuniones.firebaseapp.com",
  databaseURL: "https://dandelion-reuniones-default-rtdb.firebaseio.com",
  projectId: "dandelion-reuniones",
  storageBucket: "dandelion-reuniones.firebasestorage.app",
  messagingSenderId: "1027448778688",
  appId: "1:1027448778688:web:5c1c879c12f39ba6b6a225",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
