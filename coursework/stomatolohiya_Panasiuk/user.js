// Додавання користувача системи: node user.js e-mail пароль [admin|user]
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const [email, password, prava = 'user'] = process.argv.slice(2);
if (!email || !password || !['admin', 'user'].includes(prava)) {
    console.log('Використання: node user.js e-mail пароль [admin|user]');
    process.exit(1);
}

const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'stomatolohiya_panasiuk' });
try {
    const hash = await bcrypt.hash(password, 10); // пароль зберігається лише у вигляді хешу
    await conn.execute('INSERT INTO korystuvachi (e_mail, parol, prava) VALUES (?, ?, ?)', [email, hash, prava]);
    console.log(`Користувача ${email} (${prava}) додано`);
} catch (err) {
    console.error('Помилка:', err.code === 'ER_DUP_ENTRY' ? 'такий користувач уже існує' : err.message);
    process.exitCode = 1;
} finally {
    await conn.end();
}
