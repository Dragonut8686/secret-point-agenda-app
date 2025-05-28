// src/utils/getTelegramId.ts
export function getTelegramId(): string | null {
  try {
    const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return typeof id === 'number' ? id.toString() : null;
  } catch {
    return null;
  }
}