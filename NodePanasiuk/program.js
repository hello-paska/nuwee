// Імпортуємо необхідні модулі
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EventEmitter from 'events';

// Отримуємо __dirname для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Створюємо каталог logs, якщо він ще не існує
// (синхронно, щоб каталог гарантовано існував до першого запису)
const logsDir = path.join(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });

// Повний шлях до файлу журналу
const logFile = path.join(logsDir, 'events.txt');

// Створюємо або відкриваємо файл журналу (flag 'a' — не стирає вміст)
fs.closeSync(fs.openSync(logFile, 'a'));

// Створюємо екземпляр EventEmitter
const eventEmitter = new EventEmitter();

// Підписка на подію 'logEvent'
// data — текст повідомлення для журналу
eventEmitter.on('logEvent', (data) => {
    const timestamp = new Date().toISOString(); // поточний час
    const logMessage = `[${timestamp}] ${data}\n`;

    // Додаємо повідомлення у файл (append)
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) throw err;
        console.log('Подія зареєстрована:', data);
    });
});

// Викликаємо подію кілька разів
eventEmitter.emit('logEvent', 'Система запущена');
eventEmitter.emit('logEvent', 'Користувач увійшов');

// Виклик події через таймер
setTimeout(() => {
    eventEmitter.emit('logEvent', 'Дані збережено');
}, 1000);

// Додатково: через 2 секунди читаємо файл і виводимо вміст
setTimeout(() => {
    fs.readFile(logFile, 'utf-8', (err, content) => {
        if (err) throw err;
        console.log('\nВміст журналу:\n', content);
    });
}, 2000);
