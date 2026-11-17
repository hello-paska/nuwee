import path from 'path';
import { fileURLToPath } from 'url';

// Отримуємо __filename та __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Приклади використання
console.log('Розширення:', path.extname(__filename));
console.log('Інфо:', path.parse(__filename));
