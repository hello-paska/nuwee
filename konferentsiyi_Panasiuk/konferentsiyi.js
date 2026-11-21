// Частина сервера для сторінок «Конференції» (ЛР 8, 9)
// Переглядають усі (навіть незареєстровані), змінюють — тільки адміністратори
import bodyParser from 'body-parser'; // для парсингу POST-запитів
import { pool, zagolovok, isAdmin } from './db.js';

// Створюємо парсер для обробки POST форм
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Список співробітників для вибору відповідального
const SPIVROBITNYKY_SQL = "SELECT id_spivrobitnyky, \
    concat(prizvyshche,' ',Left(imya,1),'. ',Left(pobatkovi,1),'.') AS prizvyshche \
    FROM spivrobitnyky ORDER BY prizvyshche";

export default function (app) {

    // Форма вибору дат
    app.get("/konferentsiyi", function (req, res) {
        res.render("konferentsiyi.hbs", {
            zagolovok: zagolovok,
            konferentsiyi_visible: false
        });
    });

    // Конференції за вибраний період
    app.post("/konferentsiyi", urlencodedParser, function (req, res) {
        if (!req.body) return res.sendStatus(400);
        const data_pochatku = req.body.data_pochatku;
        const data_zakinchennya = req.body.data_zakinchennya;
        pool.query("SELECT \
            konferentsiyi.id_konferentsiyi, \
            konferentsiyi.nazva_konferentsiyi, \
            concat(spivrobitnyky.prizvyshche,' ',Left(spivrobitnyky.imya,1),'. ', Left(spivrobitnyky.pobatkovi,1),'.') as prizvyshche, \
            DATE_FORMAT(konferentsiyi.data_pochatku,'%d.%m.%Y') AS data_pochatku, \
            DATE_FORMAT(konferentsiyi.data_zakinchennya, '%d.%m.%Y') AS data_zakinchennya, \
            DATEDIFF(konferentsiyi.data_zakinchennya,konferentsiyi.data_pochatku) AS truvalist, \
            konferentsiyi.id_spivrobitnyky \
            FROM \
            konferentsiyi \
            Inner Join spivrobitnyky ON konferentsiyi.id_spivrobitnyky = spivrobitnyky.id_spivrobitnyky \
            WHERE \
            konferentsiyi.data_pochatku >= ? AND \
            konferentsiyi.data_zakinchennya <= ? \
            ORDER BY konferentsiyi.data_pochatku", [data_pochatku, data_zakinchennya], function (err, data) {
            if (err) return console.log(err);
            res.render("konferentsiyi.hbs", {
                konferentsiyi: data,
                zagolovok: zagolovok,
                konferentsiyi_visible: true,
                data_pochatku: data_pochatku.split('-').reverse().join('.'),
                data_zakinchennya: data_zakinchennya.split('-').reverse().join('.')
            });
        });
    });

    // Перехід на форму додавання
    app.get("/konferentsiyi_create", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/konferentsiyi");
        pool.query(SPIVROBITNYKY_SQL, function (err, data) {
            if (err) return console.log(err);
            res.render("konferentsiyi_create.hbs", {
                spivrobitnyky: data,
                zagolovok: zagolovok
            });
        });
    });

    // Виконання запиту на додавання нової конференції
    app.post("/konferentsiyi_create", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/konferentsiyi");
        if (!req.body) return res.sendStatus(400);
        const { id_spivrobitnyky, nazva_konferentsiyi, data_pochatku, data_zakinchennya } = req.body;
        pool.query("INSERT INTO konferentsiyi (id_spivrobitnyky, nazva_konferentsiyi, data_pochatku, data_zakinchennya) VALUES (?,?,?,?)",
            [id_spivrobitnyky, nazva_konferentsiyi, data_pochatku, data_zakinchennya], function (err, data) {
                if (err) return console.log(err);
                res.redirect("/konferentsiyi");
            });
    });

    // Перехід на форму редагування
    app.get("/konferentsiyi_edit/:id_konferentsiyi", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/konferentsiyi");
        const id_konferentsiyi = req.params.id_konferentsiyi;
        pool.query("SELECT \
            konferentsiyi.id_konferentsiyi, \
            konferentsiyi.id_spivrobitnyky, \
            konferentsiyi.nazva_konferentsiyi, \
            DATE_FORMAT(konferentsiyi.data_pochatku,'%Y-%m-%d') AS data_pochatku, \
            DATE_FORMAT(konferentsiyi.data_zakinchennya, '%Y-%m-%d') AS data_zakinchennya \
            FROM konferentsiyi \
            WHERE id_konferentsiyi = ?", [id_konferentsiyi], function (err, data) {
            if (err) return console.log(err);

            pool.query(SPIVROBITNYKY_SQL, function (err, data2) {
                if (err) return console.log(err);
                res.render("konferentsiyi_edit.hbs", {
                    konferentsiyi: data[0],
                    spivrobitnyky: data2,
                    zagolovok: zagolovok
                });
            });
        });
    });

    // Виконання запиту на редагування даних про конференцію
    app.post("/konferentsiyi_edit", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/konferentsiyi");
        if (!req.body) return res.sendStatus(400);
        const { id_konferentsiyi, id_spivrobitnyky, nazva_konferentsiyi, data_pochatku, data_zakinchennya } = req.body;
        pool.query("UPDATE konferentsiyi SET id_spivrobitnyky=?, nazva_konferentsiyi=?, data_pochatku=?, data_zakinchennya=? WHERE id_konferentsiyi=?",
            [id_spivrobitnyky, nazva_konferentsiyi, data_pochatku, data_zakinchennya, id_konferentsiyi], function (err, data) {
                if (err) return console.log(err);
                res.redirect("/konferentsiyi");
            });
    });

    // Виконання запиту на видалення конференції
    app.post("/konferentsiyi_delete/:id_konferentsiyi", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/konferentsiyi");
        const id_konferentsiyi = req.params.id_konferentsiyi;
        pool.query("DELETE FROM konferentsiyi WHERE id_konferentsiyi=?", [id_konferentsiyi], function (err, data) {
            if (err) return console.log(err);
            res.redirect("/konferentsiyi");
        });
    });
}
