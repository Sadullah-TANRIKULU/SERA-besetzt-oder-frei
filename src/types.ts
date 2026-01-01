// src/types.ts
export type Language = 'de' | 'tr' | 'en';

export interface Place {
    id: string;
    name: string; // e.g., "Classroom A"
    type: 'classroom' | 'saloon';
    is_active: boolean; // Admin confirmation flag
}

export interface Booking {
    id?: string;
    place_id: string;
    user_id: string;
    user_name: string; // To show "who" booked it
    start_time: string; // ISO string
    end_time: string;   // ISO string
    description: string;
}