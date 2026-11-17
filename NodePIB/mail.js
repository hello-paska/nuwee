// Імпортуємо nodemailer
import nodemailer from 'nodemailer';

// Дані для входу беруться зі змінних середовища, щоб не зберігати пароль у коді:
//   PowerShell:  $env:MAIL_USER="you@gmail.com"; $env:MAIL_PASS="abcdabcdabcdabcd"; $env:MAIL_TO="user@ukr.net"; node mail.js
//   bash:        MAIL_USER=you@gmail.com MAIL_PASS=abcdabcdabcdabcd MAIL_TO=user@ukr.net node mail.js
// MAIL_PASS — App Password з https://myaccount.google.com/apppasswords (без пробілів)
const user = process.env.MAIL_USER || 'user@gmail.com'; // Ваш Gmail
const pass = process.env.MAIL_PASS || 'пароль...';      // App Password від Gmail
const to = process.env.MAIL_TO || 'user@ukr.net';       // Отримувач

// Створюємо об'єкт транспорту для відправки пошти
// Тут використовується Gmail, тому потрібно вказати логін та пароль (або app password)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Поштовий сервіс
    auth: {
        user: user,
        pass: pass.replace(/\s+/g, ''), // пароль без пробілів
    },
});

// Параметри листа
const mailOptions = {
    from: user,                       // Відправник
    to: to,                           // Отримувач (для декількох через кому)
    subject: 'Працюємо у NodeJS',     // Тема листа
    html: '<h1>Лист надіслано</h1>',  // HTML тіло листа
};

// Відправка листа
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Помилка при відправці:', error); // Виводимо помилку
    } else {
        console.log('Email надіслано:', info.response); // Підтвердження від сервера
    }
});
