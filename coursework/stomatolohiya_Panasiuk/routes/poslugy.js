// Довідник «Послуги» (прейскурант): переглядають усі відвідувачі, змінює адміністратор
import { db, requireAdmin, showError, wrap } from '../db.js';

const viddilennyaList = async () =>
    (await db.query('SELECT id_viddilennya, nazva_viddilennya FROM viddilennya ORDER BY nazva_viddilennya'))[0];

export default function (app) {
    const admin = requireAdmin('/poslugy');

    // Прейскурант, згрупований за відділеннями
    app.get('/poslugy', wrap(async (req, res) => {
        const [rows] = await db.query(`
            SELECT s.id_poslugy, s.nazva_poslugy, s.tsina, v.id_viddilennya, v.nazva_viddilennya
            FROM poslugy s
            JOIN viddilennya v ON v.id_viddilennya = s.id_viddilennya
            ORDER BY v.id_viddilennya, s.tsina`);
        const grupy = [];
        for (const r of rows) {
            let g = grupy.find((x) => x.id === r.id_viddilennya);
            if (!g) grupy.push(g = { id: r.id_viddilennya, nazva: r.nazva_viddilennya, poslugy: [] });
            g.poslugy.push(r);
        }
        res.render('poslugy/list', { grupy });
    }));

    app.get('/poslugy/create', admin, wrap(async (req, res) => {
        res.render('poslugy/form', { title: 'новий запис', action: '/poslugy/create', s: {}, viddilennya: await viddilennyaList() });
    }));

    app.post('/poslugy/create', admin, wrap(async (req, res) => {
        const { id_viddilennya, nazva_poslugy, tsina } = req.body;
        await db.query('INSERT INTO poslugy (id_viddilennya, nazva_poslugy, tsina) VALUES (?, ?, ?)',
            [id_viddilennya, nazva_poslugy, tsina]);
        res.redirect('/poslugy');
    }));

    app.get('/poslugy/edit/:id', admin, wrap(async (req, res) => {
        const [[s]] = await db.query('SELECT * FROM poslugy WHERE id_poslugy = ?', [req.params.id]);
        if (!s) return res.redirect('/poslugy');
        res.render('poslugy/form', { title: 'редагування', action: '/poslugy/edit/' + s.id_poslugy, s, viddilennya: await viddilennyaList() });
    }));

    app.post('/poslugy/edit/:id', admin, wrap(async (req, res) => {
        const { id_viddilennya, nazva_poslugy, tsina } = req.body;
        await db.query('UPDATE poslugy SET id_viddilennya = ?, nazva_poslugy = ?, tsina = ? WHERE id_poslugy = ?',
            [id_viddilennya, nazva_poslugy, tsina, req.params.id]);
        res.redirect('/poslugy');
    }));

    app.post('/poslugy/delete/:id', admin, wrap(async (req, res) => {
        try {
            await db.query('DELETE FROM poslugy WHERE id_poslugy = ?', [req.params.id]);
        } catch (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return showError(res, 'Неможливо видалити послугу, яка вже використовувалась у прийомах.', '/poslugy');
            }
            throw err;
        }
        res.redirect('/poslugy');
    }));
}
