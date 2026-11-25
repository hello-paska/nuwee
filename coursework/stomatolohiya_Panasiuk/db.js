// Спільні налаштування: підключення до БД MySQL, заголовок сайту, перевірка прав доступу
import mysql from 'mysql2';

// Пул з'єднань з базою даних. pool.promise() дозволяє використовувати async/await
const pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stomatolohiya_panasiuk',
    dateStrings: true // дати повертаються рядком 'YYYY-MM-DD', без зсуву часового поясу
});
export const db = pool.promise();

export const zagolovok = 'Стоматологічна поліклініка';

// Користувач авторизований / є адміністратором
export const isAuth = (req) => Boolean(req.session.username);
export const isAdmin = (req) => isAuth(req) && req.session.prava === 'admin';

// Middleware: доступ лише авторизованим користувачам
export function requireAuth(req, res, next) {
    if (isAuth(req)) return next();
    res.redirect('/');
}

// Middleware: доступ лише адміністраторам; інакше — на сторінку `back`
export const requireAdmin = (back) => (req, res, next) => {
    if (isAdmin(req)) return next();
    res.redirect(back);
};

// Сторінка з повідомленням про помилку (наприклад, порушення зовнішнього ключа)
export function showError(res, message, back) {
    res.status(400).render('error', { zagolovok, message, back });
}

// Обгортка для async-обробників: помилка передається в обробник помилок Express
export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
