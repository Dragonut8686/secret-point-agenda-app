
// FIXME: Замените это на ваш актуальный ID мероприятия из таблицы 'events' в Supabase.
export const EVENT_ID = "00000000-0000-0000-0000-000000000000"; // Пример UUID

if (EVENT_ID === "00000000-0000-0000-0000-000000000000") {
  console.warn(
    "Используется EVENT_ID по умолчанию. Пожалуйста, замените его в src/config.ts на ваш актуальный ID мероприятия."
  );
  // Вы можете также показать это предупреждение в UI для удобства разработки
}

// Типы для theme_json, чтобы было удобнее работать с данными
export interface ThemeContact {
  name: string;
  phone?: string;
  email?: string;
  icon?: string; // Для HotelServicesPage, если иконки будут в theme_json
}

export interface ThemeMainButton {
  label: string; // Изменено с title на label
  page: string;  // Изменено с path на page (будет хранить, например, "SchedulePage")
  icon?: string; // Можно добавить иконки для кнопок главного меню
}

export interface ThemeJson {
  banner_url?: string;
  logo_url?: string;
  main_buttons?: ThemeMainButton[];
  hotel_info?: string;
  map_url?: string;
  contacts?: ThemeContact[];
}

