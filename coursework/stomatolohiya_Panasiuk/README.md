# КІС «Стоматологічна поліклініка»

Курсова робота з дисципліни «Корпоративні інформаційні системи». Автор: Панасюк Михайло, група ІТБ-51м.

Node.js (Express 5, Handlebars, Bootstrap 4) + MySQL.

## Запуск (Windows + Laragon)

1. Laragon → **Start All**.
2. Navicat: підключення до `localhost` → правою кнопкою → **Execute SQL File…** → `sql/stomatolohiya_panasiuk_full.sql`.
3. У VS Code відкрийте цей каталог, у терміналі:
   ```
   npm i
   npm run dev
   ```
   (або подвійний клік по `run-site.bat`)
4. http://localhost:3000/

| Логін | Пароль | Права |
|---|---|---|
| admin@stomat.ua | admin123 | admin |
| likar@stomat.ua | likar123 | user |

Новий користувач: `node user.js e-mail пароль [admin|user]`.

## Структура

| Файл | Призначення |
|---|---|
| `index.js` | Налаштування сервера, сесії, CSRF, авторизація |
| `db.js` | Пул з'єднань MySQL, перевірка прав (`requireAuth`, `requireAdmin`) |
| `routes/viddilennya.js`, `likari.js`, `patsiyenty.js`, `poslugy.js` | Довідники |
| `routes/pryyomy.js` | Облік прийомів, перевірка бізнес-правил |
| `routes/zvity.js` | Квитанція та звіти у PDF (PDFKit) |
| `views/` | Шаблони Handlebars (`layouts`, `partials`, сторінки) |
| `sql/stomatolohiya_panasiuk.sql` | Створення БД з початковими даними |
| `sql/stomatolohiya_panasiuk_full.sql` | Дамп БД (з користувачами) |
| `user.js` | Додавання користувача з хешуванням пароля bcrypt |

## Права доступу

| Розділ | Гість | user | admin |
|---|---|---|---|
| Послуги та ціни | перегляд | перегляд | перегляд, зміна |
| Відділення, лікарі, пацієнти | – | перегляд | перегляд, зміна |
| Прийоми, квитанції | – | перегляд | перегляд, зміна |
| Звіти | – | – | перегляд |

## Бізнес-правила прийому

- послуга має належати відділенню вибраного лікаря;
- у лікаря не може бути двох активних прийомів на той самий день і час;
- квитанція формується лише для завершеного прийому;
- не можна видалити відділення, лікаря, пацієнта чи послугу, які мають пов'язані записи (ON DELETE RESTRICT).

Шрифт для PDF: `fonts/arial.ttf` (можна скопіювати з `C:\Windows\Fonts`), інакше вкладений DejaVuSans.
