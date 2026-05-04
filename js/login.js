import { signInWithGoogle, isAllowedEmail, logout } from "./auth.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { moduleConfig } from "./config.js";

const btn = document.getElementById("googleSignInBtn");
const errorEl = document.getElementById("loginError");

// Mostrar error de dominio si viene redirigido desde requireAuth
const params = new URLSearchParams(window.location.search);
if (params.get("error") === "domain") {
  errorEl.textContent = `Solo pueden ingresar cuentas ${moduleConfig.allowedDomain}`;
}

// Si ya hay sesion activa valida, ir directo a la app
onAuthStateChanged(auth, (user) => {
  if (user && isAllowedEmail(user.email)) {
    window.location.href = "./index.html";
  }
});

btn?.addEventListener("click", async () => {
  btn.disabled = true;
  btn.textContent = "Conectando…";
  errorEl.textContent = "";

  try {
    const result = await signInWithGoogle();
    const email = result.user?.email || "";

    if (!isAllowedEmail(email)) {
      // Cerrar sesion inmediatamente y mostrar error
      await logout();
      errorEl.textContent = `Solo pueden ingresar cuentas ${moduleConfig.allowedDomain}`;
      btn.disabled = false;
      btn.textContent = "Ingresar con Google";
      return;
    }
    // isAllowedEmail OK → onAuthStateChanged se encarga del redirect
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Ingresar con Google";
    if (err.code !== "auth/popup-closed-by-user") {
      errorEl.textContent = "No se pudo iniciar sesion. Intenta de nuevo.";
    }
    console.error(err);
  }
});
