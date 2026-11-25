// Довідник «Пацієнти»: пошук, картка пацієнта з історією прийомів
import { db, requireAuth, requireAdmin, showError, wrap } from '../db.js';

export default function (app) {
    const admin = requireAdmin('/patsiyenty');

    // Список пацієнтів з пошуком за прізвищем або телефоном
    app.get('/patsiyenty', requireAuth, wrap(async (req, res) => {
        const q = (req.query.q || '').trim();
        const [patsiyenty] = await db.query(`
            SELECT p.*, TIMESTAMPDIFF(YEAR, p.data_narodzhennya, CURDATE()) AS vik
            FROM patsiyenty p
            WHERE (? = '' OR p.prizvyshche LIKE CONCAT(?, '%') OR p.telefon LIKE CONCAT('%', ?, '%'))
            ORDER BY p.prizvyshche, p.imya`, [q, q, q]);
        res.render('patsiyenty/list', { patsiyenty, q });
    }));

    // Картка пацієнта: дані та історія прийомів
    app.get('/patsiyenty/card/:id', requireAuth, wrap(async (req, res) => {
        const [[p]] = await db.query('SELECT * FROM patsiyenty WHERE id_patsiyenta = ?', [req.params.id]);
        if (!p) return res.redirect('/patsiyenty');
        const [pryyomy] = await db.query(`
            SELECT r.id_pryyomu, r.data_pryyomu, r.chas_pryyomu, r.diahnoz, r.status,
                   CONCAT(l.prizvyshche, ' ', LEFT(l.imya, 1), '. ', LEFT(l.pobatkovi, 1), '.') AS likar,
                   s.nazva_poslugy, s.tsina
            FROM pryyomy r
            JOIN likari l ON l.id_likarya = r.id_likarya
            JOIN poslugy s ON s.id_poslugy = r.id_poslugy
            WHERE r.id_patsiyenta = ?
            ORDER BY r.data_pryyomu DESC, r.chas_pryyomu DESC`, [p.id_patsiyenta]);
        const suma = pryyomy.filter((r) => r.status === 'завершений').reduce((s, r) => s + Number(r.tsina), 0);
        res.render('patsiyenty/card', { p, pryyomy, suma });
    }));

    app.get('/patsiyenty/create', admin, (req, res) => {
        res.render('patsiyenty/form', { title: 'новий запис', action: '/patsiyenty/create', p: {} });
    });

    app.post('/patsiyenty/create', admin, wrap(async (req, res) => {
        const { prizvyshche, imya, pobatkovi, data_narodzhennya, telefon } = req.body;
        await db.query(`INSERT INTO patsiyenty (prizvyshche, imya, pobatkovi, data_narodzhennya, telefon)
                        VALUES (?, ?, ?, ?, ?)`,
            [prizvyshche, imya, pobatkovi, data_narodzhennya || null, telefon]);
        res.redirect('/patsiyenty');
    }));

    app.get('/patsiyenty/edit/:id', admin, wrap(async (req, res) => {
        const [[p]] = await db.query('SELECT * FROM patsiyenty WHERE id_patsiyenta = ?', [req.params.id]);
        if (!p) return res.redirect('/patsiyenty');
        res.render('patsiyenty/form', { title: 'редагування', action: '/patsiyenty/edit/' + p.id_patsiyenta, p });
    }));

    app.post('/patsiyenty/edit/:id', admin, wrap(async (req, res) => {
        const { prizvyshche, imya, pobatkovi, data_narodzhennya, telefon } = req.body;
        await db.query(`UPDATE patsiyenty SET prizvyshche = ?, imya = ?, pobatkovi = ?, data_narodzhennya = ?, telefon = ?
                        WHERE id_patsiyenta = ?`,
            [prizvyshche, imya, pobatkovi, data_narodzhennya || null, telefon, req.params.id]);
        res.redirect('/patsiyenty/card/' + req.params.id);
    }));

    app.post('/patsiyenty/delete/:id', admin, wrap(async (req, res) => {
        try {
            await db.query('DELETE FROM patsiyenty WHERE id_patsiyenta = ?', [req.params.id]);
        } catch (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return showError(res, 'Неможливо видалити пацієнта, який має записи прийомів.', '/patsiyenty');
            }
            throw err;
        }
        res.redirect('/patsiyenty');
    }));
}
