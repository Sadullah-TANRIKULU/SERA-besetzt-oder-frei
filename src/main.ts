import { ui } from "./ui-manager";
import {
  getCurrentOccupancy,
  bookRoom,
  getAllPlaces,
  isRoomAvailable,
  getMonthlyBookings,
} from "./db-actions";
import { type Language } from "./types";
import { getCurrentUser, signOut, signIn } from "./auth";

// 1. App State & Initialization
async function bootstrap() {
  ui.init(); // Sets up translations and PWA logic

  // 1. Auth State Check
  const user = await getCurrentUser();
  const loginSection = document.getElementById("login-section");
  const userProfile = document.getElementById("user-profile");
  const userEmailSpan = document.getElementById("user-email");

  if (user) {
    if (loginSection) loginSection.classList.add("hidden");
    if (userProfile) userProfile.style.display = "flex";
    if (userEmailSpan) userEmailSpan.textContent = user.email || "";
  } else {
    if (loginSection) loginSection.classList.remove("hidden");
    if (userProfile) userProfile.style.display = "none";
  }

  // 2. Setup Login Event
  const loginBtn = document.getElementById("login-btn");
  const emailInput = document.getElementById("login-email") as HTMLInputElement;

  loginBtn?.addEventListener("click", async () => {
    const email = emailInput.value;
    if (!email) return alert("Bitte Email eingeben / Lütfen e-posta girin");

    try {
      loginBtn.textContent = "..."; // Simple loading feedback
      await signIn(email);
    } catch (err: any) {
      alert("Error: " + err.message);
      loginBtn.textContent = "Login";
    }
  });

  // 3. Setup Logout Event
  document.getElementById("logout-btn")?.addEventListener("click", signOut);

  // 4. Load Data (Places and Occupancy)
  try {
    const [places, occupancy, monthly] = await Promise.all([
      getAllPlaces(),
      getCurrentOccupancy(),
      getMonthlyBookings(),
    ]);

    ui.renderStatus(occupancy, places);
    ui.renderMonthlyTable(monthly, places);
    populateRoomSelect(places);
  } catch (err) {
    console.error("Data load error:", err);
  }
}

// 2. Helper: Fill the dropdown with available rooms
function populateRoomSelect(places: any[]) {
  const select = document.getElementById("room-select") as HTMLSelectElement;
  if (!select) return;

  select.innerHTML = ""; // Clear existing options

  places.forEach((place) => {
    const option = document.createElement("option");
    option.value = place.id;
    option.textContent = place.name;
    select.appendChild(option);
  });
}

function setButtonLoading(isLoading: boolean) {
  const btn = document.getElementById("submit-btn") as HTMLButtonElement;
  const spinner = document.getElementById("btn-spinner");
  const btnText = document.getElementById("btn-text");

  if (btn && spinner && btnText) {
    btn.disabled = isLoading;
    if (isLoading) {
      spinner.classList.remove("hidden");
      // Optional: Change text to "Processing..."
    } else {
      spinner.classList.add("hidden");
    }
  }
}

// 3. Form Submission Logic
const bookingForm = document.getElementById("booking-form") as HTMLFormElement;
bookingForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(bookingForm);
  const startVal = formData.get("start-time") as string;
  const endVal = formData.get("end-time") as string;
  const placeId = formData.get("room-select") as string;
  const description = (formData.get("description") as string) || "";

  // 1. Immediate Validation (Before Loading)
  if (!placeId) return alert("Error: No room selected!");

  const startDate = new Date(startVal);
  const endDate = new Date(endVal);
  const now = new Date();

  if (isNaN(startDate.getTime()) || endDate <= startDate) {
    return alert("Invalid time range! End must be after start.");
  }

  if (startDate < now) {
    return alert("Cannot book in the past!");
  }

  // 2. Start Loading
  setButtonLoading(true);

  try {
    // Re-verify User
    const user = await getCurrentUser(); // Use your existing helper
    if (!user) throw new Error("Authentication required!");

    const newBooking = {
      place_id: placeId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      description: description,
      user_name: user.email?.split("@")[0] || "User",
      user_id: user.id,
    };

    console.log("desc:  ", description);

    // 3. Availability Check
    const available = await isRoomAvailable(
      newBooking.place_id,
      newBooking.start_time,
      newBooking.end_time
    );

    if (!available) {
      alert("Room already booked! / Zimmer belegt!");
      setButtonLoading(false);
      return;
    }

    // 4. Execution
    await bookRoom(newBooking as any);
    alert("Success! / Başarılı!");
    window.location.reload();
  } catch (err: any) {
    console.error(err);
    alert("Error: " + (err.message || "Booking failed"));
    setButtonLoading(false);
  }
});

// 4. Expose Global Functions for HTML buttons
(window as any).app = {
  setLanguage: (lang: Language) => ui.setLanguage(lang),
};

// Start the app
bootstrap();
