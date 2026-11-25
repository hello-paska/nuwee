// Довідник «Лікарі»: вибір відділення та картки лікарів
import { db, requireAuth, requireAdmin, showError, wrap } from '../db.js';

const viddilennyaList = async () =>
    (await db.query('SELECT id_viddilennya, nazva_viddilennya FROM viddilennya ORDER BY nazva_viddilennya'))[0];

export default function (app) {
    const admin = requireAdmin('/likari');

    // Лікарі вибраного відділення (або всі) з кількістю завершених прийомів
    app.get('/likari', requireAuth, wrap(async (req, res) => {
        const id = req.query.viddilennya || '';
        const [likari] = await db.query(`
            SELECT l.*, v.nazva_viddilennya,
                   (SELECT COUNT(*) FROM pryyomy p
                     WHERE p.id_likarya = l.id_likarya AND p.status = 'завершений') AS pryyomiv
            FROM likari l
            JOIN viddilennya v ON v.id_viddilennya = l.id_viddilennya
            WHERE (? = '' OR l.id_viddilennya = ?)
            ORDER BY v.nazva_viddilennya, l.prizvyshche`, [id, id]);
        res.render('likari/list', { likari, viddilennya: await viddilennyaList(), vybrane: id });
    }));

    app.get('/likari/create', admin, wrap(async (req, res) => {
        res.render('likari/form', {
            title: 'новий запис', action: '/likari/create',
            l: { id_viddilennya: req.query.viddilennya }, viddilennya: await viddilennyaList()
        });
    }));

    app.post('/likari/create', admin, wrap(async (req, res) => {
        const { id_viddilennya, prizvyshche, imya, pobatkovi, spetsializatsiya, telefon } = req.body;
        await db.query(`INSERT INTO likari (id_viddilennya, prizvyshche, imya, pobatkovi, spetsializatsiya, telefon)
                        VALUES (?, ?, ?, ?, ?, ?)`,
            [id_viddilennya, prizvyshche, imya, pobatkovi, spetsializatsiya, telefon]);
        res.redirect('/likari?viddilennya=' + id_viddilennya);
    }));

    app.get('/likari/edit/:id', admin, wrap(async (req, res) => {
        const [[l]] = await db.query('SELECT * FROM likari WHERE id_likarya = ?', [req.params.id]);
        if (!l) return res.redirect('/likari');
        res.render('likari/form', {
            title: 'редагування', action: '/likari/edit/' + l.id_likarya, l, viddilennya: await viddilennyaList()
        });
    }));

    app.post('/likari/edit/:id', admin, wrap(async (req, res) => {
        const { id_viddilennya, prizvyshche, imya, pobatkovi, spetsializatsiya, telefon } = req.body;
        await db.query(`UPDATE likari SET id_viddilennya = ?, prizvyshche = ?, imya = ?, pobatkovi = ?,
                        spetsializatsiya = ?, telefon = ? WHERE id_likarya = ?`,
            [id_viddilennya, prizvyshche, imya, pobatkovi, spetsializatsiya, telefon, req.params.id]);
        res.redirect('/likari?viddilennya=' + id_viddilennya);
    }));

    app.post('/likari/delete/:id', admin, wrap(async (req, res) => {
        try {
            await db.query('DELETE FROM likari WHERE id_likarya = ?', [req.params.id]);
        } catch (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return showError(res, 'Неможливо видалити лікаря, який має записи прийомів.', '/likari');
            }
            throw err;
        }
        res.redirect('/likari');
    }));
}
