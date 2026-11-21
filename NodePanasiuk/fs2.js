import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Отримуємо __filename та __dirname у ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Шлях до файлу
const filePath = path.join(__dirname, 'Panasiuk', 'text.txt');
console.log('Повний шлях до файлу:', filePath);

// Створення файлу (або перезапис, якщо існує)
fs.writeFile(filePath, 'Текст у файлі, що створюється', (err) => {
    if (err) {
        throw err;
    }
    console.log('Файл створено');

    // Додавання тексту до файлу
    fs.appendFile(filePath, '\nТекст 2', (err) => {
        if (err) {
            throw err;
        }
        console.log('Файл дописано');
    });
});
