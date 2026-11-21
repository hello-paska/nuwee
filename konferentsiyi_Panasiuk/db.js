// Спільні дані для всіх частин сервера: підключення до БД та заголовок сайту.
// Винесено в окремий файл, щоб kafedry.js, spivrobitnyky.js та konferentsiyi.js
// не імпортували index.js (циклічний імпорт: на момент виконання цих файлів
// змінна global.zagolovok у index.js ще не встановлена).
import mysql from 'mysql2'; // для роботи з MySQL

// Підключення до БД MySQL локального сервера (ЛР 5, п. 23)
export const pool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    database: "konferentsiyi_panasiuk",
    password: ""
});

// Однотипний текст заголовку у шапці (ЛР 5, п. 20)
export const zagolovok = "Облік конференцій";
global.zagolovok = zagolovok;

// Перевірки прав доступу (ЛР 9)
export const isAuth = (req) => Boolean(req.session.username);
export const isAdmin = (req) => isAuth(req) && req.session.prava === 'admin';
