# Проект A-K Project - Образовательная платформа

Этот проект настроен для развертывания на Vercel с бэкендом на Flask и email сервисом на Node.js.

## Структура проекта

```
project/
├── backend/                 # Flask бэкенд
│   ├── api/
│   │   └── index.py        # Точка входа для Vercel
│   ├── src/                # Исходный код приложения
│   │   ├── main.py         # Основное Flask приложение
│   │   ├── models/         # Модели базы данных
│   │   └── routes/         # API маршруты
│   ├── requirements.txt    # Python зависимости
│   └── server.py          # Локальный сервер для разработки
├── email-service/          # Email сервис
│   ├── api/
│   │   └── index.js       # Точка входа для Vercel
│   ├── index.js           # Основной email сервис
│   ├── package.json       # Node.js зависимости
│   └── .env              # Переменные окружения
└── vercel.json           # Конфигурация Vercel
```

## Развертывание на Vercel

### 1. Подготовка

1. Установите Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Войдите в аккаунт Vercel:
   ```bash
   vercel login
   ```

### 2. Настройка переменных окружения

В панели управления Vercel добавьте следующие переменные окружения:

- `EMAIL_USER` - Gmail адрес для отправки писем
- `EMAIL_PASS` - Пароль приложения Gmail
- `FLASK_ENV` - production

### 3. Развертывание

1. Перейдите в корневую директорию проекта
2. Выполните команду:
   ```bash
   vercel
   ```

### 4. API Endpoints

После развертывания будут доступны следующие endpoints:

#### Backend API (Flask)
- `GET /api/health` - Проверка состояния бэкенда
- `POST /api/auth/login` - Авторизация
- `POST /api/auth/register` - Регистрация
- И другие API маршруты...

#### Email Service
- `POST /email/send-verification` - Отправка кода подтверждения
- `POST /email/send-new-assignment` - Уведомление о новом задании
- `POST /email/send-grade-notification` - Уведомление об оценке
- `GET /email/health` - Проверка состояния email сервиса

## Локальная разработка

### Backend
```bash
cd backend
python server.py
```
Сервер будет доступен на http://localhost:5000

### Email Service
```bash
cd email-service
npm install
npm start
```
Сервис будет доступен на http://localhost:3001

## Особенности конфигурации для Vercel

1. **База данных**: Используется in-memory SQLite для совместимости с Vercel
2. **CORS**: Настроен для работы с любыми доменами
3. **Статические файлы**: Обслуживаются через Flask
4. **Email сервис**: Экспортируется как модуль для Vercel

## Примечания

- Убедитесь, что все зависимости указаны в requirements.txt и package.json
- Проверьте, что переменные окружения правильно настроены в Vercel
- Для production использования рекомендуется настроить внешнюю базу данных

