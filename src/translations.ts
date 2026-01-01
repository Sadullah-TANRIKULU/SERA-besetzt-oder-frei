// src/translations.ts
import { type Language } from './types';

export const translations: Record<Language, Record<string, string>> = {
    de: {
        app_title: "SERA - Besetzt oder Frei",
        install_btn: "App Herunterladen",
        current_status: "Aktueller Status",
        book_room: "Raum Buchen",
        room_label: "Raum auswählen",
        start_label: "Beginn",
        end_label: "Ende",
        why_placeholder: "Warum? (z.B. Deutschunterricht)",
        submit_booking: "Jetzt Reservieren",
        loading: "Laden...",
        status_free: "Frei",
        status_busy: "Besetzt von",
        classroom: "Klassenzimmer",
        saloon: "Salon"
    },
    tr: {
        app_title: "SERA - Dolu mu Boş mu?",
        install_btn: "Uygulamayı Yükle",
        current_status: "Mevcut Durum",
        book_room: "Yer Ayırt",
        room_label: "Oda seçiniz",
        start_label: "Başlangıç",
        end_label: "Bitiş",
        why_placeholder: "Neden? (örn. Almanca dersi)",
        submit_booking: "Rezerve Et",
        loading: "Yükleniyor...",
        status_free: "Boş",
        status_busy: "Kullanan:",
        classroom: "Derslik",
        saloon: "Salon"
    },
    en: {
        app_title: "SERA - Busy or Free?",
        install_btn: "Install App",
        current_status: "Current Status",
        book_room: "Book a Room",
        room_label: "Select Room",
        start_label: "Start",
        end_label: "End",
        why_placeholder: "Why? (e.g. German class)",
        submit_booking: "Reserve Now",
        loading: "Loading...",
        status_free: "Free",
        status_busy: "Occupied by",
        classroom: "Classroom",
        saloon: "Saloon"
    }
};