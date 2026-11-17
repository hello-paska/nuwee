import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Отримуємо __filename та __dirname у ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Шлях до файлу
const filePath = path.join(__dirname, 'PIB', 'text.txt');

// Читання файлу асинхронно
fs.readFile(filePath, (err, content) => {
    if (err) {
        throw err; // кидання помилки
    }

    console.log('Контент у форматі буферу:', content);

    // Перетворення буфера у рядок
    const s1 = Buffer.from(content);
    console.log('Контент:', s1.toString());
});
