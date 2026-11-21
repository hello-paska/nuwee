# АІС «Конференції» — ЛР 3-4 … 10

Web-сайт обліку конференцій закладів вищої освіти (Node.js + Express + Handlebars + Bootstrap + MySQL).
Автор: Панасюк Михайло, група ІТБ-51м.

## Запуск на своєму ПК (Windows + Laragon)

1. Встановіть **Node.js** (LTS) та **Laragon**, запустіть Laragon → **Start All** (MySQL).
2. Імпортуйте базу даних (одна з команд, або через Navicat/Workbench: *Execute SQL File*):
   - `sql/konferentsiyi_panasiuk_full.sql` — готова БД з усіма даними та учасниками (рекомендовано);
   - або по лабораторних: `sql/lab3-4_konferentsiyi_panasiuk.sql`, потім `sql/lab9_uchasnyky.sql`.
3. Відкрийте каталог `konferentsiyi_Panasiuk` у VS Code, в терміналі:
   ```
   npm i
   npm run dev
   ```
   (або подвійний клік по `run-site.bat`)
4. Відкрийте http://localhost:3000/

### Облікові записи (п. 13–15 ЛР 9)

| Логін | Пароль | Права |
|---|---|---|
| admin@gmail.com | admin123 | admin |
| user@gmail.com | password123 | user |

Новий учасник: `node user.js email пароль`, права адміністратора — вручну в БД:
`UPDATE uchasnyky SET prava='admin' WHERE e_mail='...';`

## Структура

| Файл | ЛР | Призначення |
|---|---|---|
| `sql/lab3-4_*.sql` | 3-4 | Створення БД, таблиць, зв'язків, даних; дамп БД |
| `index.js` | 5–10 | Головний файл сервера: налаштування, авторизація, звіти pdf |
| `db.js` | 5, 7 | Підключення до MySQL (`pool`) та заголовок сайту |
| `views/index.hbs`, `header`, `menu`, `footer`, `start` | 5, 9 | Макет сайту, форма авторизації |
| `kafedry.js`, `views/kafedry.hbs`, `create.hbs`, `edit.hbs` | 6, 7, 9 | Кафедри (головна таблиця) |
| `spivrobitnyky.js`, `views/spivrobitnyky*.hbs` | 7, 9 | Співробітники (підпорядкована таблиця) |
| `konferentsiyi.js`, `views/konferentsiyi*.hbs` | 8, 9 | Конференції (дати) |
| `user.js`, `sql/lab9_uchasnyky.sql` | 9 | Учасники, хешування паролів bcrypt |
| `sql/lab10_rating_queries.sql`, `fonts/` | 10 | Запити рейтингів, шрифт для pdf |

## Права доступу (ЛР 9)

- Кафедри: переглядають авторизовані, змінюють — адміністратори.
- Конференції: переглядають усі (навіть незареєстровані), змінюють — адміністратори.
- Співробітники та звіти: тільки адміністратори.

## Відмінності від прикладів у методичці

- `pool` і `zagolovok` винесено в `db.js`: у прикладі `kafedry.js` імпортує їх з `index.js`, а `index.js` імпортує `kafedry.js` — через циклічний імпорт `global.zagolovok` у `kafedry.js` був би `undefined`. `index.js` і далі експортує `pool`.
- Права користувача зберігаються в сесії (`req.session.prava`), а не в `global.prava`: глобальна змінна спільна для всіх відвідувачів, тож після входу адміністратора права адміністратора отримав би будь-хто.
- Права перевіряються і на POST-маршрутах (додавання/редагування/видалення), а не лише на сторінках з формами.
- Якщо кафедру чи співробітника не можна видалити через зв'язки (ON DELETE RESTRICT), показується повідомлення, а не «зависає» сторінка.
- Для pdf використовується `fonts/arial.ttf`, якщо його скопіювати з `C:\Windows\Fonts` (п. 5 ЛР 10); інакше — вкладений вільний шрифт `fonts/DejaVuSans.ttf`.
- `img/favicon.ico` та `img/header.jpg` — згенеровані зображення; за бажанням замініть своїми (п. 12, 16 ЛР 5).

## GitHub (ЛР 10, п. 13–26)

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<ваш_логін>/konferentsiyi_node_2025.git
git push -u origin main
```
