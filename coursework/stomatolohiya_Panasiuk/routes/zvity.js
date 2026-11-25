// Вихідна інформація: квитанція про прийом та аналітичні звіти у форматі PDF
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, requireAuth, requireAdmin, wrap } from '../db.js';

const FONTS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fonts');
// Шрифт з кирилицею: fonts/arial.ttf (якщо скопійовано з C:\Windows\Fonts), інакше DejaVuSans
const font = (bold) => {
    const arial = path.join(FONTS, bold ? 'arialbd.ttf' : 'arial.ttf');
    return fs.existsSync(arial) ? arial : path.join(FONTS, bold ? 'DejaVuSans-Bold.ttf' : 'DejaVuSans.ttf');
};
const grn = (v) => Number(v).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' грн';
const dmy = (v) => String(v).slice(0, 10).split('-').reverse().join('.');

// Новий PDF-документ, що передається у відповідь сервера
function newPdf(res, file) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${file}`);
    doc.pipe(res);
    doc.registerFont('R', font(false));
    doc.registerFont('B', font(true));
    doc.font('R');
    return doc;
}

// Шапка документа з назвою закладу
function shapka(doc, title, subtitle) {
    doc.font('B').fontSize(11).fillColor('#0d47a1').text('СТОМАТОЛОГІЧНА ПОЛІКЛІНІКА', { align: 'center' });
    doc.font('R').fontSize(9).fillColor('#555').text('м. Рівне, вул. Соборна, 1 · тел. +380 362 00-00-00', { align: 'center' });
    doc.moveTo(50, doc.y + 6).lineTo(545, doc.y + 6).strokeColor('#0d47a1').stroke();
    doc.moveDown(1.2).fillColor('black').font('B').fontSize(15).text(title, { align: 'center' });
    if (subtitle) doc.font('R').fontSize(10).text(subtitle, { align: 'center' });
    doc.moveDown(1);
}

// Таблиця: columns = [{ title, key, width, align, fmt }]
function tablytsia(doc, columns, rows) {
    let y = doc.y;
    const x0 = 50;
    const row = (cells, bold, fill) => {
        if (fill) doc.rect(x0, y - 4, 495, 20).fill(fill).fillColor('black');
        let x = x0 + 4;
        doc.font(bold ? 'B' : 'R').fontSize(10);
        cells.forEach((c, i) => {
            doc.text(String(c), x, y, { width: columns[i].width - 8, align: columns[i].align || 'left', lineBreak: false, ellipsis: true });
            x += columns[i].width;
        });
        y += 20;
    };
    row(columns.map((c) => c.title), true, '#e3edf9');
    rows.forEach((r, i) => row(columns.map((c) => (c.fmt ? c.fmt(r[c.key], r, i) : r[c.key])), false, i % 2 ? '#f7f7f7' : null));
    doc.y = y + 10;
}

// Горизонтальна стовпчикова діаграма
function diahrama(doc, title, labels, values, fmt = String) {
    const max = Math.max(1, ...values);
    const x0 = 210, w = 270, h = 16;
    let y = doc.y + 10;
    if (y + labels.length * (h + 6) + 30 > 790) { doc.addPage(); y = 60; }
    doc.font('B').fontSize(11).text(title, 50, y);
    y += 24;
    labels.forEach((label, i) => {
        const bw = Math.max(2, (values[i] / max) * w);
        doc.font('R').fontSize(9).fillColor('black').text(label, 50, y + 3, { width: 155, align: 'right', lineBreak: false, ellipsis: true });
        doc.rect(x0, y, bw, h).fill(i === 0 ? '#1565c0' : '#64b5f6');
        doc.fillColor('black').text(fmt(values[i]), x0 + bw + 6, y + 3, { lineBreak: false });
        y += h + 6;
    });
    doc.y = y + 10;
}

// Період звіту з параметрів запиту (за замовчуванням — поточний рік)
function period(req) {
    const y = new Date().getFullYear();
    return { vid: req.query.vid || `${y}-01-01`, do: req.query.do || `${y}-12-31` };
}

export default function (app) {
    const admin = requireAdmin('/');

    // Квитанція про надання послуги (лише для завершених прийомів)
    app.get('/pryyomy/kvytantsiya/:id', requireAuth, wrap(async (req, res) => {
        const [[r]] = await db.query(`
            SELECT r.id_pryyomu, r.data_pryyomu, r.chas_pryyomu, r.diahnoz, r.status,
                   CONCAT(p.prizvyshche, ' ', p.imya, ' ', IFNULL(p.pobatkovi, '')) AS patsiyent,
                   CONCAT(l.prizvyshche, ' ', l.imya, ' ', IFNULL(l.pobatkovi, '')) AS likar,
                   l.spetsializatsiya, v.nazva_viddilennya, s.nazva_poslugy, s.tsina
            FROM pryyomy r
            JOIN patsiyenty p  ON p.id_patsiyenta = r.id_patsiyenta
            JOIN likari l      ON l.id_likarya = r.id_likarya
            JOIN viddilennya v ON v.id_viddilennya = l.id_viddilennya
            JOIN poslugy s     ON s.id_poslugy = r.id_poslugy
            WHERE r.id_pryyomu = ?`, [req.params.id]);
        if (!r || r.status !== 'завершений') return res.redirect('/pryyomy');

        const doc = newPdf(res, `kvytantsiya_${r.id_pryyomu}.pdf`);
        shapka(doc, `КВИТАНЦІЯ № ${String(r.id_pryyomu).padStart(6, '0')}`,
            `про надання стоматологічних послуг від ${dmy(r.data_pryyomu)}`);
        const pole = (k, v) => {
            doc.font('B').fontSize(11).text(k, 50, doc.y, { continued: true }).font('R').text(' ' + v);
            doc.moveDown(0.4);
        };
        pole('Пацієнт:', r.patsiyent);
        pole('Лікар:', `${r.likar} (${r.spetsializatsiya})`);
        pole('Відділення:', r.nazva_viddilennya);
        pole('Дата і час прийому:', `${dmy(r.data_pryyomu)}, ${String(r.chas_pryyomu).slice(0, 5)}`);
        pole('Діагноз / примітка:', r.diahnoz || '—');
        doc.moveDown(0.8);
        tablytsia(doc, [
            { title: '№', key: 'n', width: 35 },
            { title: 'Послуга', key: 'nazva_poslugy', width: 290 },
            { title: 'Кількість', key: 'k', width: 80, align: 'center' },
            { title: 'Сума', key: 'tsina', width: 90, align: 'right', fmt: grn }
        ], [{ n: 1, nazva_poslugy: r.nazva_poslugy, k: 1, tsina: r.tsina }]);
        doc.font('B').fontSize(12).text(`Разом до сплати: ${grn(r.tsina)}`, 50, doc.y, { align: 'right', width: 495 });
        doc.moveDown(3).font('R').fontSize(10);
        const y = doc.y;
        doc.text('Лікар ____________________', 50, y);
        doc.text('Пацієнт ____________________', 320, y);
        doc.end();
    }));

    // Сторінка вибору звіту та періоду
    app.get('/zvity', admin, (req, res) => res.render('zvity', period(req)));

    // Звіт 1. Рейтинг лікарів за кількістю завершених прийомів
    app.get('/zvity/likari', admin, wrap(async (req, res) => {
        const p = period(req);
        const [rows] = await db.query(`
            SELECT CONCAT(l.prizvyshche, ' ', LEFT(l.imya, 1), '. ', LEFT(l.pobatkovi, 1), '.') AS likar,
                   v.nazva_viddilennya, COUNT(r.id_pryyomu) AS kilkist, IFNULL(SUM(s.tsina), 0) AS suma
            FROM likari l
            JOIN viddilennya v ON v.id_viddilennya = l.id_viddilennya
            LEFT JOIN pryyomy r ON r.id_likarya = l.id_likarya AND r.status = 'завершений'
                               AND r.data_pryyomu BETWEEN ? AND ?
            LEFT JOIN poslugy s ON s.id_poslugy = r.id_poslugy
            GROUP BY l.id_likarya
            ORDER BY kilkist DESC, suma DESC
            LIMIT 10`, [p.vid, p.do]);
        const doc = newPdf(res, 'reityng_likariv.pdf');
        shapka(doc, 'Рейтинг лікарів', `за кількістю проведених прийомів, період ${dmy(p.vid)} – ${dmy(p.do)}`);
        tablytsia(doc, [
            { title: '№', key: 'n', width: 30, fmt: (v, r, i) => i + 1 },
            { title: 'Лікар', key: 'likar', width: 145 },
            { title: 'Відділення', key: 'nazva_viddilennya', width: 125 },
            { title: 'Прийомів', key: 'kilkist', width: 80, align: 'center' },
            { title: 'Сума послуг', key: 'suma', width: 115, align: 'right', fmt: grn }
        ], rows);
        diahrama(doc, 'Кількість прийомів', rows.map((r) => r.likar), rows.map((r) => Number(r.kilkist)));
        doc.end();
    }));

    // Звіт 2. Виручка відділень
    app.get('/zvity/viddilennya', admin, wrap(async (req, res) => {
        const p = period(req);
        const [rows] = await db.query(`
            SELECT v.nazva_viddilennya, COUNT(r.id_pryyomu) AS kilkist, IFNULL(SUM(s.tsina), 0) AS suma
            FROM viddilennya v
            LEFT JOIN likari l  ON l.id_viddilennya = v.id_viddilennya
            LEFT JOIN pryyomy r ON r.id_likarya = l.id_likarya AND r.status = 'завершений'
                               AND r.data_pryyomu BETWEEN ? AND ?
            LEFT JOIN poslugy s ON s.id_poslugy = r.id_poslugy
            GROUP BY v.id_viddilennya
            ORDER BY suma DESC`, [p.vid, p.do]);
        const zahalom = rows.reduce((s, r) => s + Number(r.suma), 0);
        const doc = newPdf(res, 'vyruchka_viddilen.pdf');
        shapka(doc, 'Виручка відділень', `за завершеними прийомами, період ${dmy(p.vid)} – ${dmy(p.do)}`);
        tablytsia(doc, [
            { title: '№', key: 'n', width: 30, fmt: (v, r, i) => i + 1 },
            { title: 'Відділення', key: 'nazva_viddilennya', width: 175 },
            { title: 'Прийомів', key: 'kilkist', width: 80, align: 'center' },
            { title: 'Виручка', key: 'suma', width: 120, align: 'right', fmt: grn },
            { title: 'Частка', key: 'suma', width: 90, align: 'right', fmt: (v) => (zahalom ? (100 * v / zahalom).toFixed(1) : '0.0') + ' %' }
        ], rows);
        doc.font('B').fontSize(11).text(`Загальна виручка: ${grn(zahalom)}`, 50, doc.y, { align: 'right', width: 495 });
        diahrama(doc, 'Виручка, грн', rows.map((r) => r.nazva_viddilennya), rows.map((r) => Number(r.suma)), grn);
        doc.end();
    }));

    // Звіт 3. Найпопулярніші послуги
    app.get('/zvity/poslugy', admin, wrap(async (req, res) => {
        const p = period(req);
        const [rows] = await db.query(`
            SELECT s.nazva_poslugy, COUNT(r.id_pryyomu) AS kilkist, IFNULL(SUM(s.tsina), 0) AS suma
            FROM poslugy s
            JOIN pryyomy r ON r.id_poslugy = s.id_poslugy AND r.status = 'завершений'
                          AND r.data_pryyomu BETWEEN ? AND ?
            GROUP BY s.id_poslugy
            ORDER BY kilkist DESC, suma DESC
            LIMIT 10`, [p.vid, p.do]);
        const doc = newPdf(res, 'populiarni_poslugy.pdf');
        shapka(doc, 'Найпопулярніші послуги', `період ${dmy(p.vid)} – ${dmy(p.do)}`);
        tablytsia(doc, [
            { title: '№', key: 'n', width: 30, fmt: (v, r, i) => i + 1 },
            { title: 'Послуга', key: 'nazva_poslugy', width: 270 },
            { title: 'Кількість', key: 'kilkist', width: 75, align: 'center' },
            { title: 'Сума', key: 'suma', width: 120, align: 'right', fmt: grn }
        ], rows);
        diahrama(doc, 'Кількість наданих послуг', rows.map((r) => r.nazva_poslugy), rows.map((r) => Number(r.kilkist)));
        doc.end();
    }));
}
