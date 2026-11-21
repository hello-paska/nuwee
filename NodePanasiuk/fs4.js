import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Отримуємо __filename та __dirname у ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Шлях до файлу
const filePath = path.join(__dirname, 'Panasiuk', 'text.txt');

// Читання файлу з кодуванням 'utf-8'
fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
        throw err; // кидання помилки
    }
    console.log('Контент:', content);
});
