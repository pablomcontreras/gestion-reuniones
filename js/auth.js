import { auth, googleProvider } from "./firebase.js";
import { moduleConfig } from "./config.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Verifica que el email pertenezca al dominio autorizado
export function isAllowedEmail(email) {
  if (!email || !moduleConfig.allowedDomain) return false;
  return email.toLowerCase().endsWith(moduleConfig.allowedDomain.toLowerCase());
}

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

// Guard: resuelve con el usuario si esta autenticado y tiene dominio correcto
// Si no esta autenticado → redirige a login
// Si el dominio no coincide → cierra sesion y redirige a login con error
export function requireAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = "./login.html";
        reject(new Error("No autenticado"));
        return;
      }
      if (!isAllowedEmail(user.email)) {
        await signOut(auth);
        window.location.href = "./login.html?error=domain";
        reject(new Error("Dominio no autorizado"));
        return;
      }
      resolve(user);
    });
  });
}
