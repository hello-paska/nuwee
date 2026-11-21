import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Отримуємо __filename та __dirname для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Створюємо каталог "Panasiuk"
fs.mkdir(path.join(__dirname, 'Panasiuk'), { recursive: true }, (err) => {
    if (err) {
        console.error('Помилка при створенні каталогу:', err);
        return;
    }
    console.log('Каталог "Panasiuk" створено або вже існує');
});
