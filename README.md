
# 🎪 Secret Point Agenda App

Современное веб-приложение для конференций с поддержкой Telegram Bot API, мобильных устройств и Telegram Mini Apps. Полнофункциональная система для управления мероприятиями с возможностью задавать вопросы спикерам, голосовать за проекты и получать актуальную информацию о событии.

## 🚀 Технологический стек

### Frontend
- **React 18** - современная библиотека для создания пользовательских интерфейсов
- **TypeScript** - строгая типизация для надежности кода
- **Vite** - быстрый сборщик проектов
- **Tailwind CSS** - утилитарный CSS-фреймворк для стилизации
- **Shadcn/ui** - готовые компоненты интерфейса
- **Framer Motion** - библиотека для анимаций
- **React Router** - маршрутизация страниц
- **TanStack Query** - управление состоянием и кешированием данных

### Backend
- **Supabase** - backend-сервис (база данных, аутентификация, Edge Functions)
- **Deno** - runtime для Edge Functions
- **Telegram Bot API** - интеграция с Telegram ботом
- **PostgreSQL** - база данных через Supabase

## 🏗️ Архитектура системы

### База данных
```
📊 Database Schema:
├── events - основная информация о мероприятиях
├── speakers - спикеры конференции
├── sessions - доклады и сессии
├── participants - участники из Telegram
├── questions - вопросы спикерам
├── works - проекты для голосования
└── votes - голоса участников
```

### Edge Functions
```
🔧 Supabase Edge Functions:
├── notify_speaker - уведомления спикерам в Telegram
└── register_user - регистрация пользователей через бота
```

## 📁 Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── ui/             # UI компоненты из shadcn/ui
│   └── Layout.tsx      # Основной макет приложения
├── pages/              # Страницы приложения
│   ├── HomePage.tsx    # Главная страница с меню
│   ├── SchedulePage.tsx # Программа мероприятия
│   ├── QuestionsPage.tsx # Вопросы спикерам ⭐
│   ├── VotePage.tsx    # Конкурс/голосование
│   ├── HotelServicesPage.tsx # Услуги отеля
│   ├── HotelMapPage.tsx # Карта отеля
│   ├── ContactsPage.tsx # Контакты
│   └── NotFound.tsx    # Страница 404
├── integrations/       # Интеграции с внешними сервисами
│   └── supabase/       # Настройки Supabase
├── lib/                # Утилиты
├── types/              # TypeScript типы
└── config.ts           # Конфигурация приложения

supabase/
├── functions/          # Edge Functions
│   ├── notify_speaker/ # Уведомления спикерам
│   └── register_user/  # Регистрация через бота
└── config.toml        # Конфигурация Supabase
```

## ⚙️ Настройка и конфигурация

### 1. Event ID
В файле `src/config.ts` укажите ID вашего мероприятия:
```typescript
export const EVENT_ID = "ваш-uuid-события";
```

### 2. База данных Supabase
Приложение работает с расширенной схемой базы данных:

#### Основные таблицы:
- **events** - информация о мероприятиях с JSON конфигурацией
- **speakers** - спикеры с Telegram ID для уведомлений
- **participants** - участники из Telegram бота
- **questions** - система вопросов с анонимностью
- **works** - проекты для голосования
- **votes** - система голосования

### 3. Структура theme_json
```json
{
  "banner_url": "https://example.com/banner.jpg",
  "logo_url": "https://example.com/logo.png",
  "main_buttons": [
    {
      "label": "Программа",
      "page": "SchedulePage"
    },
    {
      "label": "Вопросы спикерам",
      "page": "QuestionsPage"
    },
    {
      "label": "Голосование",
      "page": "VotePage"
    }
  ],
  "hotel_info": "🏨 Отель\\n🍽️ Ресторан: Завтрак включен\\n🅿️ Парковка: Бесплатная",
  "map_url": "https://example.com/map.jpg",
  "contacts": [
    {
      "name": "Иван Иванов",
      "phone": "+7 (999) 123-45-67",
      "email": "ivan@example.com"
    }
  ]
}
```

### 4. Telegram Bot конфигурация
В `supabase/config.toml` настройте переменные окружения:
```toml
[functions.env]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
BOT_TOKEN = "your-telegram-bot-token"
```

## 🤖 Telegram Bot интеграция

### Функциональность бота:
1. **Автоматическая регистрация** - участники регистрируются через `/start`
2. **Уведомления спикерам** - вопросы отправляются в личные сообщения
3. **Telegram Mini App** - полноценное веб-приложение в Telegram

### Edge Functions:

#### `register_user`
- Обрабатывает команду `/start` от пользователей
- Автоматически регистрирует участников в базе данных
- Сохраняет `telegram_id`, `username`, `full_name`

#### `notify_speaker`
- Отправляет уведомления спикерам о новых вопросах
- Форматирует сообщения с информацией об авторе
- Поддерживает анонимные вопросы
- Красиво оформляет сообщения с HTML разметкой

## 🎨 Система дизайна

### Цветовая схема
```css
:root {
  --app-bg: #0D0C1D;      /* Темно-синий фон */
  --app-primary: #3F2B96;  /* Фиолетовый основной */
  --app-text: #FFFFFF;     /* Белый текст */
}
```

### Современный UI:
- **Glassmorphism** - полупрозрачные элементы с blur эффектом
- **Градиенты** - красивые переходы цветов
- **Анимации** - плавные переходы и hover эффекты
- **Адаптивность** - оптимизация для всех устройств

## 📱 Ключевые страницы

### 🏠 HomePage
- Динамическое меню из `theme_json.main_buttons`
- Отображение баннера мероприятия
- Красивые кнопки с градиентами

### ❓ QuestionsPage ⭐ (Обновлена!)
**Новый современный дизайн:**
- Компактная форма с glassmorphism эффектом
- Удобный выбор спикеров через Select компонент
- Счетчик символов для текста вопроса
- Checkbox для анонимных вопросов
- Адаптивность для мобильных устройств
- Интеграция с Telegram user data

**Функциональность:**
- Отправка вопросов с информацией об авторе
- Поддержка анонимных вопросов
- Автоматические уведомления спикерам в Telegram
- Сохранение в базе данных

### 🗳️ VotePage
- Система голосования за проекты
- Отображение результатов в реальном времени
- Ограничение на один голос на участника

### 🏨 HotelServicesPage & HotelMapPage
- Информация об услугах отеля
- Интерактивная карта

### 📞 ContactsPage
- Контакты организаторов
- Кнопки для звонков и email

## 🔧 Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Работа с Supabase локально
```bash
# Запуск локального Supabase
supabase start

# Применение миграций
supabase db reset
```

### Сборка для продакшена
```bash
npm run build
```

## 📊 Управление состоянием

### TanStack Query
```typescript
// Пример запроса данных
const { data: speakers, isLoading } = useQuery({
  queryKey: ['speakers', EVENT_ID],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('speakers')
      .select('id, name, telegram_id')
      .eq('event_id', EVENT_ID);
    if (error) throw error;
    return data;
  },
});
```

### Автоматическая регистрация участников
```typescript
// В App.tsx - автоматическая регистрация из Telegram WebApp
const useRegisterParticipant = () => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    
    if (user) {
      // Регистрация в базе данных
      supabase.from("participants").upsert({
        telegram_id: user.id.toString(),
        full_name: `${user.first_name} ${user.last_name}`.trim(),
        username: user.username
      });
    }
  }, []);
};
```

## 🔐 Безопасность

### Row Level Security (RLS)
- Все таблицы защищены политиками RLS
- Участники видят только свои данные
- Спикеры получают только свои вопросы

### Edge Functions Security
- CORS headers для веб-приложений
- Проверка токенов Telegram
- Валидация входящих данных

## 🌐 Деплой

### Через Lovable
1. Нажмите "Publish" в интерфейсе
2. Приложение автоматически развернется

### Настройка Telegram Bot
1. Создайте бота через @BotFather
2. Получите токен бота
3. Добавьте токен в Supabase secrets
4. Настройте webhook на ваш Edge Function

### Переменные окружения
Убедитесь, что настроены:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 
- `BOT_TOKEN`

## 🎯 Особенности UX/UI

### Анимации и переходы
- Framer Motion для плавных переходов
- Staggered анимации для списков
- Hover эффекты с трансформациями
- Loading состояния с skeleton

### Адаптивность
- Mobile-first подход
- Оптимизация для Telegram Mini Apps
- Поддержка различных разрешений экрана

### Обратная связь пользователю
- Toast уведомления для действий
- Визуальные индикаторы состояния
- Обработка ошибок с понятными сообщениями

## 🐛 Отладка и мониторинг

### Логирование
- Подробные логи в Edge Functions
- Отслеживание ошибок Telegram API
- Мониторинг запросов к базе данных

### Telegram Bot отладка
```bash
# Проверка статуса бота
curl https://api.telegram.org/bot<BOT_TOKEN>/getMe

# Просмотр логов Edge Functions в Supabase Dashboard
```

## 🔮 Roadmap

### Ближайшие планы:
- [ ] Push уведомления для веб-приложения
- [ ] Система модерации вопросов
- [ ] Расширенная аналитика голосований
- [ ] Интеграция с календарем событий
- [ ] Многоязычная поддержка

### Долгосрочные цели:
- [ ] Система рейтингов докладов
- [ ] Live чат во время докладов  
- [ ] Интеграция с системами видеоконференций
- [ ] Marketplace для мероприятий
- [ ] AI ассистент для участников

## 📚 Документация

### Полезные ссылки:
- [Supabase Documentation](https://supabase.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [React Router](https://reactrouter.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)

### API Endpoints:
```
POST /functions/v1/register_user   # Регистрация через бота
POST /functions/v1/notify_speaker  # Уведомления спикерам
```

## 🤝 Поддержка

При возникновении проблем:

1. **Проверьте конфигурацию:**
   - EVENT_ID в config.ts
   - Переменные окружения в Supabase
   - Токен Telegram бота

2. **Проверьте логи:**
   - Консоль браузера
   - Логи Edge Functions в Supabase
   - Статус бота через Telegram API

3. **Типичные проблемы:**
   - Спикер не написал боту `/start`
   - Неправильный telegram_id в базе
   - CORS ошибки (проверьте headers)

## 📄 Лицензия

MIT License - свободное использование для коммерческих и некоммерческих проектов.

---

**🎪 Secret Point Agenda App** - создано с ❤️ для современных конференций и мероприятий.
