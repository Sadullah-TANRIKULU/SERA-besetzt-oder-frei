import {
  getOccupiedVakits,
  createBooking,
  getPlaces,
  cancelBooking,
} from "./booking-logic";
import { t } from "../i18n/translations";

const VAKITS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export async function initBookingLogic(user: any) {
  const roomSelect = document.getElementById(
    "room-select"
  ) as HTMLSelectElement;
  const dateInput = document.getElementById("booking-date") as HTMLInputElement;
  const bookingForm = document.getElementById(
    "booking-form"
  ) as HTMLFormElement;

  // 1. Populate Rooms
  const places = await getPlaces();
  if (roomSelect) {
    roomSelect.innerHTML =
      '<option value="" disabled selected>Raum wählen...</option>';
    places.forEach((p) => {
      const translatedName = t(p.name);
      const opt = new Option(translatedName, p.id);
      roomSelect.add(opt);
    });
  }

  // 2. Refresh Grid Logic
  const refreshGrid = async () => {
    const grid = document.getElementById("vakit-grid");
    const selectedVakitInput = document.getElementById(
      "selected-vakit"
    ) as HTMLInputElement;

    if (!dateInput.value || !roomSelect.value || !grid) return;

    // Clear current selection so user must pick again for the new date/room
    if (selectedVakitInput) selectedVakitInput.value = "";

    grid.innerHTML = "<p class='loading'>Laden...</p>";

    try {
      // Calling the correct function name from booking-logic.ts
      const occupied = await getOccupiedVakits(
        dateInput.value,
        roomSelect.value
      );

      grid.innerHTML = ""; // Clear loader

      VAKITS.forEach((vakit) => {
        const booking = occupied.find(
          (b) => b.vakit.toLowerCase() === vakit.toLowerCase()
        );
        const isBusy = !!booking;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `vakit-selector ${isBusy ? "busy" : "available"}`;
        btn.disabled = isBusy;

        btn.innerHTML = `
  <strong>${vakit}</strong>
  ${
    isBusy
      ? `
    <div class="booking-details">
      <span class="booked-user">👤 ${booking.user_name}</span>
      ${
        booking.description
          ? `<blockquote class="booking-note">"${booking.description}"</blockquote>`
          : ""
      }
      <span class="delete-btn" title="Löschen">🗑️</span>
    </div>
  `
      : `<span>${t("free")}</span>`
  }
`;

        if (isBusy) {
          const delIcon = btn.querySelector(".delete-btn");
          delIcon?.addEventListener("click", async (e) => {
            e.stopPropagation(); // Prevents selecting the vakit
            if (confirm(t("confirm_delete") || "Delete?")) {
              try {
                await cancelBooking(dateInput.value, roomSelect.value, vakit);
                refreshGrid(); // Refresh immediately to show it's free
              } catch (err) {
                alert("Error deleting");
              }
            }
          });
        }

        if (!isBusy) {
          btn.onclick = () => {
            document
              .querySelectorAll(".vakit-selector")
              .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            if (selectedVakitInput) selectedVakitInput.value = vakit;
          };
        }
        grid.appendChild(btn);
      });
    } catch (error) {
      grid.innerHTML = "<p class='error'>Fehler beim Laden.</p>";
      console.error(error);
    }
  };

  roomSelect?.addEventListener("change", refreshGrid);
  dateInput?.addEventListener("change", refreshGrid);
  // 3. Submit Logic
  bookingForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const vakit = (
      document.getElementById("selected-vakit") as HTMLInputElement
    ).value;
    const fullName = (document.getElementById("full-name") as HTMLInputElement)
      .value;
    const note = (
      document.getElementById("booking-note") as HTMLTextAreaElement
    ).value;

    if (!vakit) return alert("Select a Vakit!");

    try {
      await createBooking({
        placeId: roomSelect.value,
        date: dateInput.value,
        vakit,
        fullName,
        note,
        userId: user.id,
      });
      alert("Erfolgreich reserviert!");
      location.reload();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  });
}
