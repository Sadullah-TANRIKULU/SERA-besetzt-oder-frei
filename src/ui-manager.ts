import { translations } from "./translations";
import { type Language, type Place } from "./types";

let currentLang: Language = (localStorage.getItem("lang") as Language) || "de";
let deferredPrompt: any = null;

export const ui = {
  // 1. Initialize the UI
  init() {
    this.setupEventListeners();
    this.applyTranslations();
    this.handlePWAInstallation();
  },

  // 2. Multi-language Logic
  applyTranslations() {
    // Update all text elements
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && translations[currentLang][key]) {
        el.textContent = translations[currentLang][key];
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      if (key && translations[currentLang][key]) {
        input.placeholder = translations[currentLang][key];
      }
    });

    document.documentElement.lang = currentLang;
  },

  setLanguage(lang: Language) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    this.applyTranslations();
    // Refresh the occupancy list to update names/status labels
    this.renderStatus();
  },

  // 3. PWA Install Logic
  handlePWAInstallation() {
    const installBtn = document.getElementById("install-btn");

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) installBtn.style.display = "block";
    });

    installBtn?.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          installBtn.style.display = "none";
        }
        deferredPrompt = null;
      }
    });

    window.addEventListener("appinstalled", () => {
      if (installBtn) installBtn.style.display = "none";
      deferredPrompt = null;
    });
  },

  // 4. Render the "Besetzt oder Frei" List
  renderStatus(occupancyData: any[] = [], allPlaces: Place[] = []) {
    const listContainer = document.getElementById("status-list");
    if (!listContainer) return;

    listContainer.innerHTML = ""; // Clear current view

    allPlaces.forEach((place) => {
      const isBusy = occupancyData.find((o) => o.place_id === place.id);
      const card = document.createElement("div");
      card.className = `status-card ${isBusy ? "busy" : "free"}`;

      card.innerHTML = `
                <strong>${place.name}</strong>: 
                <span>${
                  isBusy
                    ? `${translations[currentLang].status_busy} ${isBusy.user_name}`
                    : translations[currentLang].status_free
                }
                </span>
                ${isBusy ? `<p class="desc">${isBusy.description}</p>` : ""}
            `;
      listContainer.appendChild(card);
    });
  },

  setupEventListeners() {
    // We'll attach the form submit listener here in the next step
  },
};
