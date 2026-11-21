// Частина сервера для сторінок «Співробітники» (ЛР 7, 9)
// Доступ до всіх сторінок співробітників — тільки адміністраторам
import bodyParser from 'body-parser'; // для парсингу POST-запитів
import { pool, zagolovok, isAdmin } from './db.js';

// Створюємо парсер для обробки POST форм
const urlencodedParser = bodyParser.urlencoded({ extended: false });

export default function (app) {

    // Форма вибору кафедри
    app.get("/spivrobitnyky", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        pool.query("SELECT nazva_kafedry FROM kafedry " +
            "ORDER BY nazva_kafedry", function (err, data) {
                if (err) return console.log(err);
                res.render("spivrobitnyky.hbs", {
                    spivrobitnyky: data,
                    zagolovok: zagolovok,
                    spivrobitnyky_visible: false
                });
            });
    });

    // Співробітники вибраної кафедри
    app.post("/spivrobitnyky", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        if (!req.body) return res.sendStatus(400);
        const nazva_kafedry = req.body.nazva_kafedry;
        pool.query("SELECT \
            spivrobitnyky.id_spivrobitnyky, \
            spivrobitnyky.id_kafedry, \
            spivrobitnyky.prizvyshche, \
            spivrobitnyky.imya, \
            spivrobitnyky.pobatkovi, \
            kafedry.nazva_kafedry \
            FROM \
            spivrobitnyky \
            Inner Join kafedry ON spivrobitnyky.id_kafedry = kafedry.id_kafedry \
            WHERE \
            kafedry.nazva_kafedry = ?", [nazva_kafedry], function (err, data) {
            if (err) return console.log(err);
            res.render("spivrobitnyky.hbs", {
                spivrobitnyky: data,
                zagolovok: zagolovok,
                spivrobitnyky_visible: true,
                nazva_kafedry: nazva_kafedry
            });
        });
    });

    // Перехід на форму додавання
    app.get("/spivrobitnyky_create", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        pool.query("SELECT\n" +
            "kafedry.id_kafedry,\n" +
            "kafedry.nazva_kafedry\n" +
            "FROM\n" +
            "kafedry", function (err, data) {
                if (err) return console.log(err);
                res.render("spivrobitnyky_create.hbs", {
                    kafedry: data,
                    zagolovok: zagolovok
                });
            });
    });

    // Виконання запиту на додавання нового співробітника
    app.post("/spivrobitnyky_create", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        if (!req.body) return res.sendStatus(400);
        const { id_kafedry, prizvyshche, imya, pobatkovi } = req.body;
        pool.query("INSERT INTO spivrobitnyky (id_kafedry, prizvyshche, imya, pobatkovi) VALUES (?,?,?,?)",
            [id_kafedry, prizvyshche, imya, pobatkovi], function (err, data) {
                if (err) return console.log(err);
                res.redirect("/spivrobitnyky");
            });
    });

    // Перехід на форму редагування
    app.get("/spivrobitnyky_edit/:id_spivrobitnyky", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        const id_spivrobitnyky = req.params.id_spivrobitnyky;
        pool.query("SELECT \
            id_spivrobitnyky, \
            id_kafedry, \
            prizvyshche, \
            imya, \
            pobatkovi \
            FROM \
            spivrobitnyky \
            WHERE \
            id_spivrobitnyky= ?", [id_spivrobitnyky], function (err, data) {
            if (err) return console.log(err);

            pool.query("SELECT \
                kafedry.id_kafedry, \
                kafedry.nazva_kafedry \
                FROM \
                kafedry", function (err, data2) {
                if (err) return console.log(err);

                res.render("spivrobitnyky_edit.hbs", {
                    spivrobitnyky: data[0],
                    kafedry: data2,
                    zagolovok: zagolovok
                });
            });
        });
    });

    // Виконання запиту на редагування даних про співробітника
    app.post("/spivrobitnyky_edit", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        if (!req.body) return res.sendStatus(400);
        const { id_spivrobitnyky, id_kafedry, prizvyshche, imya, pobatkovi } = req.body;
        pool.query("UPDATE spivrobitnyky SET id_kafedry=?, prizvyshche=?, imya=?, pobatkovi=? WHERE id_spivrobitnyky=?",
            [id_kafedry, prizvyshche, imya, pobatkovi, id_spivrobitnyky], function (err, data) {
                if (err) return console.log(err);
                res.redirect("/spivrobitnyky");
            });
    });

    // Виконання запиту на видалення
    app.post("/spivrobitnyky_delete/:id_spivrobitnyky", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/");
        const id_spivrobitnyky = req.params.id_spivrobitnyky;
        pool.query("DELETE FROM spivrobitnyky WHERE id_spivrobitnyky=?", [id_spivrobitnyky], function (err, data) {
            if (err) {
                // ON DELETE RESTRICT: співробітник відповідає за конференції
                console.log(err.code);
                return res.render("error.hbs", {
                    zagolovok: zagolovok,
                    message: "Неможливо видалити співробітника, який відповідає за конференції.",
                    back: "/spivrobitnyky"
                });
            }
            res.redirect("/spivrobitnyky");
        });
    });
}
