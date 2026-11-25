// Головний файл сервера КІС «Стоматологічна поліклініка»
import express from 'express';                 // веб-фреймворк
import bodyParser from 'body-parser';          // обробка даних форм і JSON
import { engine } from 'express-handlebars';   // шаблонізатор Handlebars
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';      // cookie
import session from 'express-session';         // сесії користувачів
import csurf from 'csurf';                     // захист форм від CSRF-атак
import bcrypt from 'bcrypt';                   // перевірка хешованих паролів

import { db, zagolovok, isAuth, isAdmin, wrap } from './db.js';
import viddilennya from './routes/viddilennya.js';
import likari from './routes/likari.js';
import patsiyenty from './routes/patsiyenty.js';
import poslugy from './routes/poslugy.js';
import pryyomy from './routes/pryyomy.js';
import zvity from './routes/zvity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Статичні файли (favicon, зображення шапки)
app.use(express.static(path.join(__dirname, 'img')));

// Шаблонізатор: макет views/layouts/main.hbs, блоки views/partials
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => String(a) === String(b),
        concat: (...args) => args.slice(0, -1).join(''),
        money: (v) => Number(v).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        date: (v) => (v ? String(v).slice(0, 10).split('-').reverse().join('.') : ''),
        time: (v) => (v ? String(v).slice(0, 5) : '')
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Сесії, розбір форм і CSRF-захист
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'stomatolohiya-secret',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csurf());

// Дані, доступні в усіх шаблонах
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.username = req.session.username;
    res.locals.isAuth = isAuth(req);
    res.locals.isAdmin = isAdmin(req);
    res.locals.zagolovok = zagolovok;
    next();
});

// Головна сторінка: форма авторизації та коротка статистика
app.get('/', wrap(async (req, res) => {
    const [[stat]] = await db.query(`
        SELECT (SELECT COUNT(*) FROM likari)     AS likari,
               (SELECT COUNT(*) FROM patsiyenty) AS patsiyenty,
               (SELECT COUNT(*) FROM poslugy)    AS poslugy,
               (SELECT COUNT(*) FROM pryyomy WHERE data_pryyomu >= CURDATE()
                                              AND status = 'запланований') AS zaplanovano`);
    res.render('start', { stat });
}));

// Авторизація: пошук користувача та перевірка пароля bcrypt
app.post('/login', wrap(async (req, res) => {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT e_mail, parol, prava FROM korystuvachi WHERE e_mail = ?', [username]);
    if (rows.length === 0 || !(await bcrypt.compare(password || '', rows[0].parol))) {
        return res.status(401).send('Неправильний логін або пароль');
    }
    // логін і права зберігаються в сесії конкретного користувача
    req.session.username = rows[0].e_mail;
    req.session.prava = rows[0].prava;
    res.send(rows[0].e_mail);
}));

// Вихід
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// Модулі сервера
viddilennya(app);
likari(app);
patsiyenty(app);
poslugy(app);
pryyomy(app);
zvity(app);

// Обробка помилок
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') return res.status(403).send('Недійсний CSRF-токен. Оновіть сторінку.');
    console.error(err);
    res.status(500).render('error', { message: 'Помилка сервера: ' + err.message, back: '/' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Сервер: http://localhost:' + PORT));
