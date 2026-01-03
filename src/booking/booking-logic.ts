import { supabase } from "../db/supabase";

export async function getPlaces() {
  const { data } = await supabase.from("places").select("*").order("name");
  return data || [];
}

export async function getOccupiedVakits(date: string, placeId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("vakit, user_name, description")
    .eq("booking_date", date)
    .eq("place_id", placeId);

  if (error) throw error;
  return data; // Returns [{vakit: 'fajr', user_name: 'Ahmet', description: 'Note'}, ...]
}

export async function createBooking(payload: {
  placeId: string;
  date: string; // Format: 'YYYY-MM-DD'
  vakit: string; // 'fajr', 'dhuhr', etc.
  fullName: string;
  note: string;
  userId: string;
}) {
  const { error } = await supabase.from("bookings").insert([
    {
      place_id: payload.placeId,
      user_id: payload.userId,
      user_name: payload.fullName,
      booking_date: payload.date,
      vakit: payload.vakit,
      description: payload.note,
    },
  ]);

  if (error) throw error;
}

export async function cancelBooking(
  date: string,
  placeId: string,
  vakit: string
) {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("booking_date", date)
    .eq("place_id", placeId)
    .eq("vakit", vakit);

  if (error) throw error;
}
