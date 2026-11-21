-- Лабораторна робота № 3-4
-- База даних АІС «Конференції»: konferentsiyi_panasiuk
-- Виконати у MySQL Workbench або Navicat (Query -> New Query -> Run)

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS konferentsiyi_panasiuk
  CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci;
USE konferentsiyi_panasiuk;

-- Таблиця «Кафедри»
CREATE TABLE kafedry (
  id_kafedry      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nazva_kafedry   VARCHAR(100),
  roztashuvannya  VARCHAR(200),
  PRIMARY KEY (id_kafedry)
) ENGINE=InnoDB;

-- Таблиця «Співробітники»
CREATE TABLE spivrobitnyky (
  id_spivrobitnyky INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_kafedry       INT UNSIGNED NULL DEFAULT NULL,
  prizvyshche      VARCHAR(100),
  imya             VARCHAR(100),
  pobatkovi        VARCHAR(100),
  PRIMARY KEY (id_spivrobitnyky),
  CONSTRAINT kafedry FOREIGN KEY (id_kafedry)
    REFERENCES kafedry (id_kafedry) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Таблиця «Конференції»
CREATE TABLE konferentsiyi (
  id_konferentsiyi   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_spivrobitnyky   INT UNSIGNED NULL DEFAULT NULL,
  nazva_konferentsiyi VARCHAR(255),
  data_pochatku      DATE NULL DEFAULT NULL,
  data_zakinchennya  DATE NULL DEFAULT NULL,
  PRIMARY KEY (id_konferentsiyi),
  CONSTRAINT spivrobitnyky FOREIGN KEY (id_spivrobitnyky)
    REFERENCES spivrobitnyky (id_spivrobitnyky) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Дані: кафедри (п. 23)
INSERT INTO kafedry (nazva_kafedry, roztashuvannya) VALUES
('Економічна кібернетика', '247 ауд.'),
('Економіки підприємства', '255 ауд.'),
('Маркетингу', '275 ауд.'),
('Менеджменту', '262 ауд.'),
('Міжнародної економіки', '272 ауд.'),
('Обліку і аудиту', '240 ауд.');

-- Дані: співробітники (п. 25)
INSERT INTO spivrobitnyky (id_kafedry, prizvyshche, imya, pobatkovi) VALUES
(1, 'Іванов', 'Іван', 'Іванович'),
(1, 'Павлюк', 'Сергій', 'Миколайович'),
(1, 'Новак', 'Оксана', 'Миколаївна'),
(4, 'Нагорна', 'Світлана', 'Володимирівна'),
(5, 'Сидорук', 'Олексій', 'Вікторович'),
(4, 'Кушнір', 'Олена', 'Іванівна'),
(6, 'Прокопович', 'Володимир', 'Іванович'),
(5, 'Куць', 'Ніна', 'Олексіївна'),
(1, 'Короткий', 'Віктор', 'Петрович'),
(3, 'Сорока', 'Петро', 'Вікторович');

-- Дані: конференції (п. 27)
INSERT INTO konferentsiyi (id_spivrobitnyky, nazva_konferentsiyi, data_pochatku, data_zakinchennya) VALUES
(1, 'Розвиток економічної кібернетики', '2016-09-26', '2016-09-27'),
(1, 'Кібернетика: перспективи розвитку', '2016-11-01', '2016-11-03'),
(3, 'Сучасний стан інформатизації', '2016-10-03', '2016-10-04'),
(6, 'Економіка: сьогодення', '2016-10-17', '2016-10-19'),
(1, 'Менеджмент туризму', '2016-11-15', '2016-11-16'),
(3, 'Підприємництво в Україні', '2016-09-01', '2016-09-02');
