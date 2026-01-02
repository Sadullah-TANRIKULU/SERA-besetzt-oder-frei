import { translations } from "./translations";
import { type Language, type Place } from "./types";

let currentLang: Language = (localStorage.getItem("lang") as Language) || "de";
let deferredPrompt: any = null;

let lastOccupancy: any[] = [];
let lastPlaces: Place[] = [];

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
    // Use the stored data to refresh the labels (Besetzt/Frei)
    this.renderStatus(lastOccupancy, lastPlaces);
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
    // Update the cache so setLanguage can use it later
    if (occupancyData.length > 0 || allPlaces.length > 0) {
      lastOccupancy = occupancyData;
      lastPlaces = allPlaces;
    }

    const listContainer = document.getElementById("status-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    lastPlaces.forEach((place) => {
      const isBusy = lastOccupancy.find((o) => o.place_id === place.id);
      const card = document.createElement("div");
      card.className = `status-card ${isBusy ? "busy" : "free"}`;

      // Added a check: only show quotes if there is a description
      const descHtml = isBusy?.description
        ? `<p class="desc">"${isBusy.description}"</p>`
        : "";

      card.innerHTML = `
                <div class="card-header">
                    <strong>${place.name}</strong>
                    <span class="badge">${
                      isBusy
                        ? translations[currentLang].status_busy
                        : translations[currentLang].status_free
                    }</span>
                </div>
                ${
                  isBusy
                    ? `<p class="user-info">👤 ${isBusy.user_name}</p>`
                    : ""
                }
                ${descHtml}
            `;
      listContainer.appendChild(card);
    });
  },

  renderMonthlyTable(bookings: any[], places: Place[]) {
    const container = document.getElementById("monthly-view");
    if (!container) return;

    let html = `<table><thead><tr><th>Date</th>`;
    places.forEach((p) => (html += `<th>${p.name}</th>`));
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < 30; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      const dateStr = day.toLocaleDateString(currentLang, {
        day: "2-digit",
        month: "2-digit",
      });

      html += `<tr><td><strong>${dateStr}</strong></td>`;

      places.forEach((place) => {
        const dayBookings = bookings.filter(
          (b) =>
            b.place_id === place.id &&
            new Date(b.start_time).toDateString() === day.toDateString()
        );

        const status =
          dayBookings.length > 0
            ? `<span class="cell-busy">🔴 ${dayBookings.length}</span>`
            : `<span class="cell-free">✅</span>`;

        html += `<td>${status}</td>`;
      });
      html += `</tr>`;
    }

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  setupEventListeners() {
    // We'll attach the form submit listener here in the next step
  },
};
