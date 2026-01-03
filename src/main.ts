import { checkSession, login, logout } from "./auth/auth-logic";
import { initBookingLogic } from "./booking/booking-ui";
import "./style.css";

async function bootstrap() {
  const user = await checkSession();

  const loginSection = document.getElementById("login-section");
  const bookingSection = document.getElementById("booking-section");
  const logoutBtn = document.getElementById("logout-btn");
  const loginForm = document.getElementById("login-form") as HTMLFormElement;

  // 1. UI Router Logic
  if (user) {
    loginSection?.classList.add("hidden");
    bookingSection?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");

    // Start the booking logic (Room loading, grid updates, submit)
    initBookingLogic(user);
  } else {
    loginSection?.classList.remove("hidden");
    bookingSection?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
  }

  // 2. Login Event Listener
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("login-email") as HTMLInputElement)
      .value;
    const pass = (document.getElementById("login-pass") as HTMLInputElement)
      .value;

    try {
      await login(email, pass);
      location.reload(); // Reload to bootstrap with the new session
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  });

  // 3. Logout Event Listener
  logoutBtn?.addEventListener("click", async () => {
    await logout();
  });
}

// PWA Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("PWA Ready"))
      .catch((err) => console.error("PWA Error", err));

    let deferredPrompt: any;

    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      const installBtn = document.getElementById("pwa-install");
      installBtn?.classList.remove("hidden");

      installBtn?.addEventListener("click", () => {
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the PWA prompt");
          }
          deferredPrompt = null;
          installBtn.classList.add("hidden");
        });
      });
    });
  });
}

bootstrap();
