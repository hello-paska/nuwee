// Облік прийомів пацієнтів: відбір за період і лікарем, додавання, редагування, видалення
import { db, requireAuth, requireAdmin, showError, wrap } from '../db.js';

const STATUSY = ['запланований', 'завершений', 'скасований'];
const iso = (d) => d.toISOString().slice(0, 10);

// Списки для полів вибору у формах
async function dovidnyky() {
    const [likari] = await db.query(`
        SELECT l.id_likarya, l.id_viddilennya,
               CONCAT(l.prizvyshche, ' ', l.imya, ' (', v.nazva_viddilennya, ')') AS nazva
        FROM likari l JOIN viddilennya v ON v.id_viddilennya = l.id_viddilennya
        ORDER BY l.prizvyshche`);
    const [patsiyenty] = await db.query(`
        SELECT id_patsiyenta, CONCAT(prizvyshche, ' ', imya, ' ', IFNULL(pobatkovi, '')) AS nazva
        FROM patsiyenty ORDER BY prizvyshche, imya`);
    const [poslugy] = await db.query(`
        SELECT s.id_poslugy, s.id_viddilennya, CONCAT(s.nazva_poslugy, ' — ', s.tsina, ' грн') AS nazva
        FROM poslugy s ORDER BY s.id_viddilennya, s.nazva_poslugy`);
    return { likari, patsiyenty, poslugy, statusy: STATUSY };
}

// Перевірка бізнес-правил перед збереженням прийому. Повертає текст помилки або null
async function perevirka(r, id = 0) {
    if (!r.id_likarya || !r.id_patsiyenta || !r.id_poslugy || !r.data_pryyomu || !r.chas_pryyomu) {
        return 'Заповніть усі обов’язкові поля.';
    }
    if (!STATUSY.includes(r.status)) return 'Невідомий статус прийому.';
    // послуга має належати відділенню лікаря
    const [[zbig]] = await db.query(`
        SELECT l.id_viddilennya = s.id_viddilennya AS ok
        FROM likari l, poslugy s WHERE l.id_likarya = ? AND s.id_poslugy = ?`, [r.id_likarya, r.id_poslugy]);
    if (!zbig || !zbig.ok) return 'Вибрана послуга не надається у відділенні цього лікаря.';
    // лікар не може мати два активні прийоми на той самий час
    if (r.status !== 'скасований') {
        const [zainiato] = await db.query(`
            SELECT id_pryyomu FROM pryyomy
            WHERE id_likarya = ? AND data_pryyomu = ? AND chas_pryyomu = ?
              AND status <> 'скасований' AND id_pryyomu <> ?`,
            [r.id_likarya, r.data_pryyomu, r.chas_pryyomu, id]);
        if (zainiato.length) return 'У лікаря вже є прийом на цей день і час.';
    }
    return null;
}

export default function (app) {
    const admin = requireAdmin('/pryyomy');

    // Прийоми за період (за замовчуванням — найближчі 7 днів), з фільтром за лікарем
    app.get('/pryyomy', requireAuth, wrap(async (req, res) => {
        const today = new Date();
        const vid = req.query.vid || iso(today);
        const doData = req.query.do || iso(new Date(today.getTime() + 7 * 86400000));
        const likar = req.query.likar || '';
        const [pryyomy] = await db.query(`
            SELECT r.id_pryyomu, r.data_pryyomu, r.chas_pryyomu, r.diahnoz, r.status,
                   CONCAT(p.prizvyshche, ' ', p.imya) AS patsiyent, p.id_patsiyenta,
                   CONCAT(l.prizvyshche, ' ', LEFT(l.imya, 1), '. ', LEFT(l.pobatkovi, 1), '.') AS likar,
                   v.nazva_viddilennya, s.nazva_poslugy, s.tsina
            FROM pryyomy r
            JOIN patsiyenty p  ON p.id_patsiyenta = r.id_patsiyenta
            JOIN likari l      ON l.id_likarya = r.id_likarya
            JOIN viddilennya v ON v.id_viddilennya = l.id_viddilennya
            JOIN poslugy s     ON s.id_poslugy = r.id_poslugy
            WHERE r.data_pryyomu BETWEEN ? AND ? AND (? = '' OR r.id_likarya = ?)
            ORDER BY r.data_pryyomu, r.chas_pryyomu`, [vid, doData, likar, likar]);
        const zavershenykh = pryyomy.filter((r) => r.status === 'завершений');
        res.render('pryyomy/list', {
            pryyomy, vid, do: doData, likar,
            likari: (await dovidnyky()).likari,
            kilkist: pryyomy.length,
            suma: zavershenykh.reduce((s, r) => s + Number(r.tsina), 0)
        });
    }));

    app.get('/pryyomy/create', admin, wrap(async (req, res) => {
        res.render('pryyomy/form', {
            title: 'новий запис', action: '/pryyomy/create',
            r: { status: 'запланований', data_pryyomu: iso(new Date()), id_patsiyenta: req.query.patsiyent },
            ...(await dovidnyky())
        });
    }));

    app.post('/pryyomy/create', admin, wrap(async (req, res) => {
        const r = req.body;
        const err = await perevirka(r);
        if (err) return showError(res, err, '/pryyomy/create');
        await db.query(`
            INSERT INTO pryyomy (id_likarya, id_patsiyenta, id_poslugy, data_pryyomu, chas_pryyomu, diahnoz, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [r.id_likarya, r.id_patsiyenta, r.id_poslugy, r.data_pryyomu, r.chas_pryyomu, r.diahnoz || null, r.status]);
        res.redirect(`/pryyomy?vid=${r.data_pryyomu}&do=${r.data_pryyomu}`);
    }));

    app.get('/pryyomy/edit/:id', admin, wrap(async (req, res) => {
        const [[r]] = await db.query(`
            SELECT id_pryyomu, id_likarya, id_patsiyenta, id_poslugy, diahnoz, status,
                   DATE_FORMAT(data_pryyomu, '%Y-%m-%d') AS data_pryyomu,
                   TIME_FORMAT(chas_pryyomu, '%H:%i') AS chas_pryyomu
            FROM pryyomy WHERE id_pryyomu = ?`, [req.params.id]);
        if (!r) return res.redirect('/pryyomy');
        res.render('pryyomy/form', { title: 'редагування', action: '/pryyomy/edit/' + r.id_pryyomu, r, ...(await dovidnyky()) });
    }));

    app.post('/pryyomy/edit/:id', admin, wrap(async (req, res) => {
        const r = req.body;
        const err = await perevirka(r, req.params.id);
        if (err) return showError(res, err, '/pryyomy/edit/' + req.params.id);
        await db.query(`
            UPDATE pryyomy SET id_likarya = ?, id_patsiyenta = ?, id_poslugy = ?, data_pryyomu = ?,
                   chas_pryyomu = ?, diahnoz = ?, status = ?
            WHERE id_pryyomu = ?`,
            [r.id_likarya, r.id_patsiyenta, r.id_poslugy, r.data_pryyomu, r.chas_pryyomu, r.diahnoz || null, r.status, req.params.id]);
        res.redirect(`/pryyomy?vid=${r.data_pryyomu}&do=${r.data_pryyomu}`);
    }));

    app.post('/pryyomy/delete/:id', admin, wrap(async (req, res) => {
        await db.query('DELETE FROM pryyomy WHERE id_pryyomu = ?', [req.params.id]);
        res.redirect('/pryyomy');
    }));
}
