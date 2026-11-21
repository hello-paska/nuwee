-- Лабораторна робота № 9: таблиця «Учасники» для розмежування прав доступу
SET NAMES utf8mb4;
USE konferentsiyi_panasiuk;

CREATE TABLE IF NOT EXISTS uchasnyky (
  e_mail  VARCHAR(100) NOT NULL,                 -- логін (електронна пошта)
  parol   VARCHAR(255) NOT NULL,                 -- хеш пароля (bcrypt)
  prava   VARCHAR(10)  NOT NULL DEFAULT 'user',  -- 'admin' або 'user' (за замовчуванням user)
  PRIMARY KEY (e_mail)
) ENGINE=InnoDB;

-- Після додавання учасників командою «node user.js ...»
-- вручну встановлюємо права адміністратора:
-- UPDATE uchasnyky SET prava = 'admin' WHERE e_mail = 'admin@gmail.com';
