import { supabase } from "./supabase";
import { type Booking } from "./types";

// Check which rooms are currently busy
export async function getCurrentOccupancy() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
            *,
            places (*)
        `
    )
    .lte("start_time", now) // started before or at now
    .gte("end_time", now); // ends after or at now

  if (error) {
    console.error("Error fetching occupancy:", error);
    return [];
  }
  return data;
}

// Create a new booking
export async function bookRoom(booking: Omit<Booking, "id">) {
  const { data, error } = await supabase.from("bookings").insert([booking]);

  if (error) throw error;
  return data;
}

// Fetch all approved rooms (Classrooms and Saloons)
export async function getAllPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching places:", error);
    return [];
  }
  return data;
}

export async function isRoomAvailable(
  placeId: string,
  start: string,
  end: string
) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("place_id", placeId)
    // This logic finds OVERLAPS:
    // (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
    .lt("start_time", end)
    .gt("end_time", start);

  if (error) return false;
  return data.length === 0; // Returns true if no overlaps found
}

export async function getMonthlyBookings() {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 30);

  const { data, error } = await supabase
    .from("bookings")
    .select("place_id, start_time, end_time")
    .gt("end_time", start.toISOString())
    .lt("start_time", end.toISOString())
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}
