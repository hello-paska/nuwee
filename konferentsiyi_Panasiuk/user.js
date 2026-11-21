// Додавання учасника з командного рядка (ЛР 9)
// Приклад: node user.js user@gmail.com password123

// Імпорт модулів через import замість require
import mysql from 'mysql2';  // для роботи з MySQL
import bcrypt from 'bcrypt'; // для хешування паролів

// Підключення до бази даних MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'konferentsiyi_panasiuk'
});

function addUser(email, password) { // функція для хешування пароля та додавання користувача в базу даних
    // Хешування пароля з використанням bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Помилка хешування пароля:', err);
            return connection.end();
        }

        // SQL-запит для додавання логіну та хешованого пароля
        const query = 'INSERT INTO uchasnyky (e_mail, parol) VALUES (?, ?)';

        connection.execute(query, [email, hash], (err, results) => {
            if (err) {
                console.error('Помилка додавання користувача до бази даних:', err.message);
            } else {
                console.log('Користувача успішно додано:', results);
            }
            connection.end();
        });
    });
}

// Отримання аргументів з командного рядка терміналу
const email = process.argv[2];
const password = process.argv[3];

if (email && password) {
    addUser(email, password);
} else {
    console.log('Будь ласка, введіть логін та пароль. Приклад:');
    console.log('node user.js user@example.com password123');
    connection.end();
}
