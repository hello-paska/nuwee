// Частина сервера для сторінок «Кафедри» (ЛР 6, 7, 9)
import bodyParser from 'body-parser'; // для парсингу POST-запитів
import { pool, zagolovok, isAuth, isAdmin } from './db.js';

// Створюємо парсер для обробки POST форм
const urlencodedParser = bodyParser.urlencoded({ extended: false });

export default function (app) {

    // Відображення даних про кафедри — тільки авторизованим користувачам
    app.get("/kafedry", function (req, res) {
        if (!isAuth(req)) return res.redirect("/"); // якщо не авторизувався — на головну
        pool.query("SELECT\n" +
            "kafedry.id_kafedry,\n" +
            "kafedry.nazva_kafedry,\n" +
            "kafedry.roztashuvannya\n" +
            "FROM\n" +
            "kafedry", function (err, data) {
                if (err) return console.log(err);
                res.render("kafedry.hbs", {
                    kafedry: data,
                    zagolovok: zagolovok
                });
            });
    });

    // Перехід на форму додавання — тільки адміністраторам
    app.get("/create", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/kafedry"); // якщо не адміністратор — на сторінку кафедри
        res.render("create.hbs", {
            zagolovok: zagolovok
        });
    });

    // Виконання запиту на додавання
    app.post("/create", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/kafedry");
        if (!req.body) return res.sendStatus(400);
        const nazva_kafedry = req.body.nazva_kafedry;
        const roztashuvannya = req.body.roztashuvannya;
        pool.query("INSERT INTO kafedry (nazva_kafedry, roztashuvannya) VALUES (?,?)",
            [nazva_kafedry, roztashuvannya], function (err, data) {
                if (err) return console.log(err);
                res.redirect("/kafedry");
            });
    });

    // Перехід на форму редагування
    app.get("/edit/:id_kafedry", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/kafedry");
        const id_kafedry = req.params.id_kafedry;
        pool.query("SELECT\n" +
            "kafedry.id_kafedry,\n" +
            "kafedry.nazva_kafedry,\n" +
            "kafedry.roztashuvannya\n" +
            "FROM\n" +
            "kafedry WHERE id_kafedry=?", [id_kafedry], function (err, data) {
                if (err) return console.log(err);
                res.render("edit.hbs", {
                    kafedry: data[0],
                    zagolovok: zagolovok
                });
            });
    });

    // Виконання запиту на редагування
    app.post("/edit", urlencodedParser, function (req, res) {
        if (!isAdmin(req)) return res.redirect("/kafedry");
        if (!req.body) return res.sendStatus(400);
        const nazva_kafedry = req.body.nazva_kafedry;
        const roztashuvannya = req.body.roztashuvannya;
        const id_kafedry = req.body.id_kafedry;

        pool.query("UPDATE kafedry SET nazva_kafedry=?, roztashuvannya=? WHERE id_kafedry=?",
            [nazva_kafedry, roztashuvannya, id_kafedry], function (err, data) {
                if (err) return console.log(err);
                res.redirect("/kafedry");
            });
    });

    // Виконання запиту на видалення
    app.post("/delete/:id_kafedry", function (req, res) {
        if (!isAdmin(req)) return res.redirect("/kafedry");
        const id_kafedry = req.params.id_kafedry;
        pool.query("DELETE FROM kafedry WHERE id_kafedry=?", [id_kafedry], function (err, data) {
            if (err) {
                // ON DELETE RESTRICT: не можна видалити кафедру, що має співробітників
                console.log(err.code);
                return res.render("error.hbs", {
                    zagolovok: zagolovok,
                    message: "Неможливо видалити кафедру, до якої прив'язані співробітники.",
                    back: "/kafedry"
                });
            }
            res.redirect("/kafedry");
        });
    });
}
