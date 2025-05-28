// src/config.ts

// FIXME: Замените это на ваш актуальный ID мероприятия из таблицы 'events' в Supabase.
export const EVENT_ID = "00000000-0000-0000-0000-000000000000"; // <-- вставьте сюда ваш UUID

// Токен вашего Telegram-бота
export const BOT_TOKEN = "8001709362:AAEemeq8ZA4F1sBHaGBl2Um32lHhBOihl0k";

if (EVENT_ID === "00000000-0000-0000-0000-000000000000") {
  console.warn(
    "Используется EVENT_ID по умолчанию. Пожалуйста, замените его в src/config.ts на ваш актуальный ID мероприятия."
  );
}

// Типы для theme_json
export interface ThemeContact {
  name: string;
  phone?: string;
  email?: string;
  icon?: string;
}

export interface ThemeMainButton {
  label: string;
  page: string;
  icon?: string;
}

export interface ThemeJson {
  banner_url?: string;
  logo_url?: string;
  main_buttons?: ThemeMainButton[];
  hotel_info?: string;
  map_url?: string;
  contacts?: ThemeContact[];
}