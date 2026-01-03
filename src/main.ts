import { checkSession, login, logout } from "./auth/auth-logic";
import { initBookingLogic } from "./booking/booking-ui";
import "./style.css";
import { translations } from "./i18n/translations";

const lang = localStorage.getItem("lang") || "de";

export function getTranslation(key: string) {
  return translations[lang][key] || translations["de"][key];
}

function applyI18n(isLoggedIn: boolean) {
  // Translate all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el: any) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = getTranslation(key);
  });

  const installBtn = document.getElementById("pwa-install");
  if (installBtn) {
    installBtn.textContent = getTranslation("install_btn");
  }

  // Only update placeholders if the elements exist in the DOM (when logged in)
  if (isLoggedIn) {
    const nameInput = document.getElementById("full-name") as HTMLInputElement;
    const noteInput = document.getElementById(
      "booking-note"
    ) as HTMLTextAreaElement;
    const reserveBtn = document.getElementById(
      "reserve-btn"
    ) as HTMLButtonElement;

    if (nameInput) nameInput.placeholder = getTranslation("name_placeholder");
    if (noteInput) noteInput.placeholder = getTranslation("note_placeholder");
    if (reserveBtn) reserveBtn.textContent = getTranslation("reserve_btn");
  }
}

(window as any).setLanguage = (newLang: string) => {
  localStorage.setItem("lang", newLang);
  location.reload();
};

async function bootstrap() {
  const user = await checkSession();
  const isLoggedIn = !!user;

  const loginSection = document.getElementById("login-section");
  const bookingSection = document.getElementById("booking-section");
  const logoutBtn = document.getElementById("logout-btn");
  const loginForm = document.getElementById("login-form") as HTMLFormElement;

  // 1. Apply Translations first
  applyI18n(isLoggedIn);

  // 2. UI Router Logic
  if (isLoggedIn) {
    loginSection?.classList.add("hidden");
    bookingSection?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");
    initBookingLogic(user);
  } else {
    loginSection?.classList.remove("hidden");
    bookingSection?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
  }

  // 3. Login Event Listener
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("login-email") as HTMLInputElement)
      .value;
    const pass = (document.getElementById("login-pass") as HTMLInputElement)
      .value;

    try {
      await login(email, pass);
      location.reload();
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  });

  // 4. Logout Event Listener
  logoutBtn?.addEventListener("click", async () => {
    await logout();
  });
}

// --- PWA LOGIC ---

// Register SW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("PWA Error", err));
  });
}

// Handle Install Prompt (Outside of SW registration)
let deferredPrompt: any;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById("pwa-install");
  if (installBtn) {
    installBtn.classList.remove("hidden");
    installBtn.onclick = () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        installBtn.classList.add("hidden");
      });
    };
  }
});

bootstrap();
