import { auth, googleProvider } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Devuelve el ID token del usuario actual (se auto-renueva antes de expirar)
export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("No autenticado");
  return user.getIdToken();
}

// Inicia sesion con Google via popup
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

// Cierra sesion y redirige al login
export async function logout() {
  await signOut(auth);
  window.location.href = "./login.html";
}

// Guard: resuelve con el usuario si esta autenticado, sino redirige a login
export function requireAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        window.location.href = "./login.html";
        reject(new Error("No autenticado"));
      }
    });
  });
}
