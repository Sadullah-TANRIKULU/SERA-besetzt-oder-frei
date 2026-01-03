export function toggleAuthUI(user: any) {
  const loginSec = document.getElementById("login-section");
  const bookingSec = document.getElementById("booking-section");
  const logoutBtn = document.getElementById("logout-btn");
  const userSpan = document.getElementById("display-user");

  if (user) {
    loginSec?.classList.add("hidden");
    bookingSec?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");
    if (userSpan) userSpan.textContent = user.email;
  } else {
    loginSec?.classList.remove("hidden");
    bookingSec?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
  }
}
