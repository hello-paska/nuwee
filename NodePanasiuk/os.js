import os1 from 'os';

console.log('Операційна система ', os1.platform());
console.log('Розрядність ЦП ', os1.arch());
console.log('ЦП ', os1.cpus());
console.log('Вільна память ОЗУ, Байт', os1.freemem());
console.log('Всього ОЗУ', os1.totalmem());
console.log('папка Документи', os1.homedir());
console.log('Час безвідмовної роботи ОС (від перезагрузки), сек', os1.uptime());
console.log('Назва хоста в мережі', os1.hostname());
