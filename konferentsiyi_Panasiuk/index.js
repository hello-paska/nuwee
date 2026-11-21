// Імпортуємо потрібні модулі
import express from 'express';                  // веб-фреймворк
import bodyParser from 'body-parser';           // для парсингу POST-запитів
import hbs from 'hbs';                          // шаблонізатор Handlebars
import { engine } from 'express-handlebars';    // розширені можливості Handlebars
import path from 'path';                        // робота з шляхами
import { fileURLToPath } from 'url';            // для __dirname у ESM
import cookieParser from 'cookie-parser';       // для роботи з cookie (ЛР 6)
import session from 'express-session';          // для роботи з сесіями (ЛР 6)
import csurf from 'csurf';                      // захист форм (ЛР 6)
import bcrypt from 'bcrypt';                    // для хешування паролів (ЛР 9)
import PDFDocument from 'pdfkit';               // формування pdf (ЛР 10)
import fs from 'fs';                            // робота з файлами (ЛР 10)

import { pool, zagolovok, isAdmin } from './db.js';
export { pool };

// Окремі частини сервера (ЛР 7, 8)
import kafedry from './kafedry.js';
import spivrobitnyky from './spivrobitnyky.js';
import konferentsiyi from './konferentsiyi.js';

// Отримуємо __dirname у ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ініціалізуємо Express
const app = express();

// Статичний шлях до зображень (favicon.ico, header.jpg)
app.use(express.static(path.join(__dirname, 'img')));

// Налаштування блочної структури шаблонізатора hbs
app.engine("hbs", engine({
    layoutsDir: path.join(__dirname, 'views'),    // каталог layout
    defaultLayout: 'index',                       // головний layout
    extname: 'hbs',                               // розширення файлів
    partialsDir: path.join(__dirname, 'views')
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, 'views'));

// Сесії (ЛР 6)
app.use(cookieParser());
app.use(session({
    secret: 'supersecret',     // рядок для підпису cookie
    resave: false,             // не зберігати сесію, якщо вона не змінювалася
    saveUninitialized: true    // зберігати нову сесію, навіть якщо вона порожня
}));

// Body parser для HTML форм та JSON (форма авторизації)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CSRF middleware — токен зберігається в сесії
app.use(csurf({ cookie: false }));

// Передаємо токен та дані про користувача у всі шаблони
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.username = req.session.username;
    res.locals.isAdmin = isAdmin(req);
    next();
});

// Головна сторінка (ЛР 5)
app.get("/", function (req, res) {
    res.render("start.hbs", { // start.hbs імпортується в index.hbs в параметр {{{body}}}
        zagolovok: zagolovok
    });
});

// Авторизація (ЛР 9)
app.post("/login", function (req, res) {
    const e_mail = req.body.username;
    const parol = req.body.password;

    // Запит до бази даних для отримання користувача за його email
    pool.query(`
        SELECT uchasnyky.e_mail, uchasnyky.parol, uchasnyky.prava
        FROM uchasnyky
        WHERE uchasnyky.e_mail = ?
    `, [e_mail], function (err, data) {
        if (err) {
            console.log(err);
            return res.status(500).send('Помилка сервера');
        }
        if (data.length === 0) {
            // Якщо користувача не знайдено
            return res.status(401).send('Неправильний логін або пароль');
        }

        // Отримуємо знайденого користувача
        const foundUser = data[0];

        // Порівнюємо введений пароль з хешованим паролем з бази даних
        bcrypt.compare(parol || '', foundUser.parol, function (err, isMatch) {
            if (err) {
                console.log(err);
                return res.status(500).send('Помилка порівняння паролів');
            }
            if (isMatch) {
                // Якщо пароль правильний — зберігаємо логін і права в сесії
                // (в сесії, а не в global, щоб права одного користувача
                //  не поширювалися на інших відвідувачів сайту)
                req.session.username = foundUser.e_mail;
                req.session.prava = foundUser.prava;
                console.log(req.session.username, req.session.prava);
                res.send(req.session.username); // Відправляємо ім'я користувача
            } else {
                // Якщо пароль неправильний
                return res.status(401).send('Неправильний логін або пароль');
            }
        });
    });
});

// Вихід з акаунту (ЛР 9)
app.get("/logout", function (req, res) {
    req.session.username = '';
    req.session.prava = '';
    res.redirect("/");
});

// Маршрути окремих частин сервера (ЛР 7, 8)
kafedry(app);
spivrobitnyky(app);
konferentsiyi(app);

// ---------- Звіти у форматі pdf (ЛР 10) ----------

// Шрифт з підтримкою кирилиці: fonts/arial.ttf (скопіювати з C:\Windows\Fonts),
// якщо його немає — використовується DejaVuSans.ttf з каталогу fonts
function fontPath() {
    const arial = path.join(__dirname, 'fonts', 'arial.ttf');
    return fs.existsSync(arial) ? arial : path.join(__dirname, 'fonts', 'DejaVuSans.ttf');
}

// Формування pdf-звіту: таблиця + стовпчикова діаграма
function pdfReport(res, rows, opts) {
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Disposition", `attachment; filename=${opts.file}`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.registerFont("Arial", fontPath());
    doc.font("Arial");

    // Заголовок
    doc.fontSize(18).text(opts.title, { align: "center" });
    doc.moveDown();

    // Початкові координати
    let y = doc.y + 10;
    const col1 = 50;   // №
    const col2 = 100;  // Назва
    const col3 = 450;  // Кількість конференцій

    // Шапка таблиці
    doc.fontSize(12).text("№", col1, y);
    doc.text(opts.column, col2, y);
    doc.text("Кількість конференцій", col3, y);

    // Додаємо трохи відступу перед лінією
    y += 40;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Дані таблиці
    let index = 1;
    rows.forEach((row) => {
        doc.text(index.toString(), col1, y);
        doc.text(row.nazva, col2, y, { width: 330 });
        doc.text(row.count_k.toString(), col3, y, { align: "right", width: 80 });
        y += 20;

        // Перехід на нову сторінку при потребі
        if (y > 750) {
            doc.addPage();
            y = 50;
        }
        index++;
    });

    // ---- Діаграма ----
    const chartX = 50;
    const chartY = y + 40;     // у після таблиці
    const chartHeight = 200;
    const barWidth = 40;
    const gap = 10;            // відступ між стовпчиками

    // Знаходимо максимальне значення для масштабування
    const maxCount = Math.max(1, ...rows.map(r => r.count_k));

    rows.forEach((row, i) => {
        const barHeight = (row.count_k / maxCount) * chartHeight;
        const x = chartX + i * (barWidth + gap);
        const yBar = chartY + (chartHeight - barHeight);

        // Сірий заштрихований стовпчик
        doc.fillColor('#808080');
        doc.save();
        doc.dash(2, { space: 2 });
        doc.rect(x, yBar, barWidth, barHeight).fill();
        doc.undash();
        doc.restore();

        // Підпис під стовпчиком
        doc.fillColor('black')
            .fontSize(7)
            .text(row.nazva, x, chartY + chartHeight + 5, { width: barWidth + 4, align: 'center' });

        // Значення зверху стовпчика
        doc.fontSize(10).text(row.count_k.toString(), x, yBar - 12, { width: barWidth, align: 'center' });
    });

    doc.end();
}

// Рейтинг кафедр: 10 кафедр з найбільшою кількістю проведених конференцій
app.get("/rating_kaf", (req, res) => {
    if (!isAdmin(req)) return res.redirect("/"); // звіт — тільки адміністраторам
    const sql = `
        SELECT kafedry.nazva_kafedry AS nazva,
               COUNT(konferentsiyi.id_konferentsiyi) AS count_k
        FROM kafedry
        LEFT JOIN spivrobitnyky ON spivrobitnyky.id_kafedry = kafedry.id_kafedry
        LEFT JOIN konferentsiyi ON konferentsiyi.id_spivrobitnyky = spivrobitnyky.id_spivrobitnyky
        GROUP BY kafedry.id_kafedry, kafedry.nazva_kafedry
        ORDER BY count_k DESC, kafedry.nazva_kafedry
        LIMIT 10
    `;
    pool.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Помилка при формуванні PDF-звіту");
        }
        pdfReport(res, rows, {
            file: "rating_kafedr.pdf",
            title: "Рейтинг кафедр за кількістю конференцій",
            column: "Назва кафедри"
        });
    });
});

// Рейтинг співробітників: 10 співробітників з найбільшою кількістю конференцій
app.get("/rating_spiv", (req, res) => {
    if (!isAdmin(req)) return res.redirect("/"); // звіт — тільки адміністраторам
    const sql = `
        SELECT CONCAT(spivrobitnyky.prizvyshche, ' ', LEFT(spivrobitnyky.imya, 1), '. ',
                      LEFT(spivrobitnyky.pobatkovi, 1), '.') AS nazva,
               COUNT(konferentsiyi.id_konferentsiyi) AS count_k
        FROM spivrobitnyky
        LEFT JOIN konferentsiyi ON konferentsiyi.id_spivrobitnyky = spivrobitnyky.id_spivrobitnyky
        GROUP BY spivrobitnyky.id_spivrobitnyky
        ORDER BY count_k DESC, spivrobitnyky.prizvyshche
        LIMIT 10
    `;
    pool.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Помилка при формуванні PDF-звіту");
        }
        pdfReport(res, rows, {
            file: "rating_spivrobitnykiv.pdf",
            title: "Рейтинг співробітників за кількістю конференцій",
            column: "Співробітник"
        });
    });
});

// Помилка CSRF-токена (наприклад, застаріла сторінка)
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') return res.status(403).send('Недійсний CSRF-токен. Оновіть сторінку.');
    next(err);
});

// Запуск сервера
const PORT = process.env.PORT || 3000; // якщо порт є то його, інакше ставимо 3000
app.listen(PORT, function () {
    console.log("Сервер: http://localhost:" + PORT);
});
