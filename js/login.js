import { signInWithGoogle } from "./auth.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const btn = document.getElementById("googleSignInBtn");
const errorEl = document.getElementById("loginError");

// Si ya hay sesion activa, ir directo a la app
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "./index.html";
});

btn?.addEventListener("click", async () => {
  btn.disabled = true;
  btn.textContent = "Conectando…";
  errorEl.textContent = "";

  try {
    await signInWithGoogle();
    // onAuthStateChanged se encarga del redirect
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Ingresar con Google";
    errorEl.textContent = "No se pudo iniciar sesion. Intenta de nuevo.";
    console.error(err);
  }
});
