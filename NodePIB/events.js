// Імпортуємо клас EventEmitter з модуля 'events'
import EventEmitter from 'events';

// Створюємо новий екземпляр EventEmitter
const eventEmitter1 = new EventEmitter();

// Встановлюємо обробник події 'name1'
// data1 – дані, які будуть передані при виклику події
eventEmitter1.on('name1', (data1) => {
    console.log('Повідомлення:', data1); // виводимо дані в консоль
});

// Викликаємо подію 'name1' і передаємо об’єкт {a: 1}
// Метод emit активує всі обробники, підписані на цю подію
eventEmitter1.emit('name1', { a: 1 });

// Виклик події через таймер setTimeout
// Поставлений 0 мс, щоб функція виконалася після поточного стека викликів
setTimeout(() => {
    eventEmitter1.emit('name1', { c: 3 }); // передаємо інший об’єкт
}, 0);

// Ще один виклик події 'name1' з об’єктом {b: 2}
eventEmitter1.emit('name1', { b: 2 });
