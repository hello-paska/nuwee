// Довідник «Відділення»: перегляд — авторизовані користувачі, зміна — адміністратор
import { db, requireAuth, requireAdmin, showError, wrap } from '../db.js';

export default function (app) {
    const admin = requireAdmin('/viddilennya');

    // Список відділень з кількістю лікарів і послуг
    app.get('/viddilennya', requireAuth, wrap(async (req, res) => {
        const [viddilennya] = await db.query(`
            SELECT v.id_viddilennya, v.nazva_viddilennya, v.roztashuvannya,
                   (SELECT COUNT(*) FROM likari l WHERE l.id_viddilennya = v.id_viddilennya) AS likariv,
                   (SELECT COUNT(*) FROM poslugy p WHERE p.id_viddilennya = v.id_viddilennya) AS poslug
            FROM viddilennya v
            ORDER BY v.id_viddilennya`);
        res.render('viddilennya/list', { viddilennya });
    }));

    // Форма додавання
    app.get('/viddilennya/create', admin, (req, res) => {
        res.render('viddilennya/form', { title: 'новий запис', action: '/viddilennya/create', v: {} });
    });

    app.post('/viddilennya/create', admin, wrap(async (req, res) => {
        const { nazva_viddilennya, roztashuvannya } = req.body;
        try {
            await db.query('INSERT INTO viddilennya (nazva_viddilennya, roztashuvannya) VALUES (?, ?)',
                [nazva_viddilennya, roztashuvannya]);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return showError(res, 'Відділення з такою назвою вже існує.', '/viddilennya');
            throw err;
        }
        res.redirect('/viddilennya');
    }));

    // Форма редагування
    app.get('/viddilennya/edit/:id', admin, wrap(async (req, res) => {
        const [[v]] = await db.query('SELECT * FROM viddilennya WHERE id_viddilennya = ?', [req.params.id]);
        if (!v) return res.redirect('/viddilennya');
        res.render('viddilennya/form', { title: 'редагування', action: '/viddilennya/edit/' + v.id_viddilennya, v });
    }));

    app.post('/viddilennya/edit/:id', admin, wrap(async (req, res) => {
        const { nazva_viddilennya, roztashuvannya } = req.body;
        await db.query('UPDATE viddilennya SET nazva_viddilennya = ?, roztashuvannya = ? WHERE id_viddilennya = ?',
            [nazva_viddilennya, roztashuvannya, req.params.id]);
        res.redirect('/viddilennya');
    }));

    // Видалення (заборонене, якщо у відділенні є лікарі або послуги — ON DELETE RESTRICT)
    app.post('/viddilennya/delete/:id', admin, wrap(async (req, res) => {
        try {
            await db.query('DELETE FROM viddilennya WHERE id_viddilennya = ?', [req.params.id]);
        } catch (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return showError(res, 'Неможливо видалити відділення, у якому є лікарі або послуги.', '/viddilennya');
            }
            throw err;
        }
        res.redirect('/viddilennya');
    }));
}
