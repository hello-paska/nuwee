import s1 from 'chalk'; // імпорт модуля chalk; s1 - змінна
import s2 from './data.js'; // імпорт свого створеного модуля data.js

console.log('NUWM');
console.log(s1.blue('NUWM')); // виводить синім кольором в консоль
console.log(s1.rgb(34, 208, 95)('NUWM'));

// Прізвище (п. 19) — замініть на своє
const surname = 'Прізвище';
console.log(s1.magenta.bold(surname));

console.log(s1.blue(s2)); // буде НУВГП
