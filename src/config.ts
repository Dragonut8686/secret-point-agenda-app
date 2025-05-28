// src/config.ts

// UUID вашего мероприятия из таблицы events
export const EVENT_ID: string = "00000000-0000-0000-0000-000000000000";

// Токен вашего Telegram-бота (BotFather)
export const BOT_TOKEN: string = "8001709362:AAEemeq8ZA4F1sBHaGBl2Um32lHhBOihl0k";

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
