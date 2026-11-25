-- Курсова робота: КІС «Стоматологічна поліклініка»
-- База даних stomatolohiya_panasiuk (MySQL 8 / MariaDB)
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS stomatolohiya_panasiuk
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stomatolohiya_panasiuk;

-- Відділення поліклініки
CREATE TABLE viddilennya (
  id_viddilennya    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nazva_viddilennya VARCHAR(100) NOT NULL,
  roztashuvannya    VARCHAR(100),
  PRIMARY KEY (id_viddilennya),
  UNIQUE KEY uq_nazva_viddilennya (nazva_viddilennya)
) ENGINE=InnoDB;

-- Лікарі
CREATE TABLE likari (
  id_likarya       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_viddilennya   INT UNSIGNED NOT NULL,
  prizvyshche      VARCHAR(100) NOT NULL,
  imya             VARCHAR(100) NOT NULL,
  pobatkovi        VARCHAR(100),
  spetsializatsiya VARCHAR(100),
  telefon          VARCHAR(20),
  PRIMARY KEY (id_likarya),
  CONSTRAINT fk_likari_viddilennya FOREIGN KEY (id_viddilennya)
    REFERENCES viddilennya (id_viddilennya) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Пацієнти
CREATE TABLE patsiyenty (
  id_patsiyenta     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  prizvyshche       VARCHAR(100) NOT NULL,
  imya              VARCHAR(100) NOT NULL,
  pobatkovi         VARCHAR(100),
  data_narodzhennya DATE,
  telefon           VARCHAR(20),
  PRIMARY KEY (id_patsiyenta)
) ENGINE=InnoDB;

-- Послуги (прейскурант)
CREATE TABLE poslugy (
  id_poslugy     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_viddilennya INT UNSIGNED NOT NULL,
  nazva_poslugy  VARCHAR(150) NOT NULL,
  tsina          DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_poslugy),
  CONSTRAINT fk_poslugy_viddilennya FOREIGN KEY (id_viddilennya)
    REFERENCES viddilennya (id_viddilennya) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Прийоми пацієнтів
CREATE TABLE pryyomy (
  id_pryyomu    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_likarya    INT UNSIGNED NOT NULL,
  id_patsiyenta INT UNSIGNED NOT NULL,
  id_poslugy    INT UNSIGNED NOT NULL,
  data_pryyomu  DATE NOT NULL,
  chas_pryyomu  TIME NOT NULL,
  diahnoz       VARCHAR(255),
  status        ENUM('запланований','завершений','скасований') NOT NULL DEFAULT 'запланований',
  PRIMARY KEY (id_pryyomu),
  KEY ix_pryyomy_data (data_pryyomu),
  CONSTRAINT fk_pryyomy_likari FOREIGN KEY (id_likarya)
    REFERENCES likari (id_likarya) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pryyomy_patsiyenty FOREIGN KEY (id_patsiyenta)
    REFERENCES patsiyenty (id_patsiyenta) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pryyomy_poslugy FOREIGN KEY (id_poslugy)
    REFERENCES poslugy (id_poslugy) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Користувачі системи (розмежування прав доступу)
CREATE TABLE korystuvachi (
  e_mail VARCHAR(100) NOT NULL,
  parol  VARCHAR(255) NOT NULL,                  -- хеш bcrypt
  prava  ENUM('admin','user') NOT NULL DEFAULT 'user',
  PRIMARY KEY (e_mail)
) ENGINE=InnoDB;

-- ---------- Початкові дані ----------
INSERT INTO viddilennya (nazva_viddilennya, roztashuvannya) VALUES
('Терапевтичне', '1 поверх, каб. 101–105'),
('Хірургічне', '1 поверх, каб. 110–112'),
('Ортопедичне', '2 поверх, каб. 201–204'),
('Ортодонтичне', '2 поверх, каб. 210–211'),
('Дитяче', '3 поверх, каб. 301–303');

INSERT INTO likari (id_viddilennya, prizvyshche, imya, pobatkovi, spetsializatsiya, telefon) VALUES
(1, 'Коваленко', 'Олена', 'Петрівна', 'Лікар-стоматолог-терапевт', '+380671112201'),
(1, 'Бондар', 'Андрій', 'Іванович', 'Лікар-стоматолог-терапевт', '+380671112202'),
(1, 'Шевчук', 'Ірина', 'Олегівна', 'Лікар-ендодонтист', '+380671112203'),
(2, 'Ткаченко', 'Сергій', 'Миколайович', 'Лікар-стоматолог-хірург', '+380671112204'),
(2, 'Мельник', 'Віталій', 'Романович', 'Лікар-імплантолог', '+380671112205'),
(3, 'Кравчук', 'Наталія', 'Василівна', 'Лікар-стоматолог-ортопед', '+380671112206'),
(3, 'Олійник', 'Дмитро', 'Сергійович', 'Лікар-стоматолог-ортопед', '+380671112207'),
(4, 'Лисенко', 'Марія', 'Андріївна', 'Лікар-ортодонт', '+380671112208'),
(5, 'Савчук', 'Оксана', 'Ігорівна', 'Лікар-стоматолог дитячий', '+380671112209'),
(5, 'Руденко', 'Павло', 'Олександрович', 'Лікар-стоматолог дитячий', '+380671112210');

INSERT INTO patsiyenty (prizvyshche, imya, pobatkovi, data_narodzhennya, telefon) VALUES
('Гнатюк', 'Тарас', 'Васильович', '1988-03-14', '+380501234501'),
('Поліщук', 'Анна', 'Сергіївна', '1995-07-22', '+380501234502'),
('Захарчук', 'Віктор', 'Петрович', '1972-11-05', '+380501234503'),
('Яковенко', 'Юлія', 'Олександрівна', '2001-01-30', '+380501234504'),
('Марчук', 'Олег', 'Іванович', '1965-06-18', '+380501234505'),
('Дячук', 'Софія', 'Андріївна', '2015-09-09', '+380501234506'),
('Литвин', 'Роман', 'Миколайович', '1990-12-12', '+380501234507'),
('Кушнір', 'Галина', 'Степанівна', '1958-04-27', '+380501234508'),
('Онищук', 'Максим', 'Дмитрович', '2012-02-15', '+380501234509'),
('Савицька', 'Ірина', 'Володимирівна', '1983-08-03', '+380501234510'),
('Петрук', 'Богдан', 'Ярославович', '1999-05-21', '+380501234511'),
('Федорчук', 'Леся', 'Миколаївна', '1976-10-10', '+380501234512');

INSERT INTO poslugy (id_viddilennya, nazva_poslugy, tsina) VALUES
(1, 'Консультація та огляд', 300.00),
(1, 'Професійна гігієна порожнини рота', 1200.00),
(1, 'Лікування карієсу (фотополімерна пломба)', 1500.00),
(1, 'Лікування пульпіту (1 канал)', 2200.00),
(2, 'Видалення зуба (просте)', 900.00),
(2, 'Видалення зуба мудрості', 2500.00),
(2, 'Встановлення імпланта', 18000.00),
(3, 'Металокерамічна коронка', 5500.00),
(3, 'Цирконієва коронка', 9000.00),
(4, 'Встановлення брекет-системи (1 щелепа)', 16000.00),
(4, 'Корекція брекет-системи', 800.00),
(5, 'Лікування молочного зуба', 900.00),
(5, 'Герметизація фісур', 600.00);

INSERT INTO pryyomy (id_likarya, id_patsiyenta, id_poslugy, data_pryyomu, chas_pryyomu, diahnoz, status) VALUES
(1, 1, 1, '2026-10-01', '09:00', 'Огляд, план лікування', 'завершений'),
(1, 1, 3, '2026-10-06', '10:00', 'Середній карієс 36', 'завершений'),
(2, 2, 2, '2026-10-02', '11:30', 'Зубний наліт, гінгівіт', 'завершений'),
(3, 3, 4, '2026-10-03', '12:00', 'Гострий пульпіт 46', 'завершений'),
(4, 5, 5, '2026-10-07', '09:30', 'Хронічний періодонтит 17', 'завершений'),
(5, 7, 7, '2026-10-09', '14:00', 'Вторинна адентія 36', 'завершений'),
(6, 8, 8, '2026-10-13', '10:30', 'Дефект коронки 25', 'завершений'),
(8, 4, 10, '2026-10-14', '15:00', 'Скупченість зубів', 'завершений'),
(9, 6, 12, '2026-10-15', '09:00', 'Карієс 75', 'завершений'),
(10, 9, 13, '2026-10-16', '10:00', 'Профілактика', 'завершений'),
(2, 10, 3, '2026-10-20', '13:00', 'Поверхневий карієс 14', 'завершений'),
(4, 11, 6, '2026-10-21', '11:00', 'Ретинований 38', 'завершений'),
(7, 12, 9, '2026-10-23', '12:30', 'Дефект коронки 11', 'завершений'),
(1, 2, 3, '2026-10-27', '09:30', 'Середній карієс 24', 'завершений'),
(3, 3, 4, '2026-10-29', '16:00', 'Повторне відвідування 46', 'скасований'),
(5, 7, 7, '2026-11-03', '14:00', 'Імплантація 46', 'завершений'),
(8, 4, 11, '2026-11-11', '15:00', 'Плановий огляд брекетів', 'завершений'),
(1, 5, 2, '2026-11-17', '10:00', 'Гігієна', 'завершений'),
(6, 8, 8, '2026-11-24', '11:00', 'Дефект коронки 26', 'завершений'),
(9, 9, 12, '2026-11-26', '09:00', 'Карієс 84', 'запланований'),
(2, 1, 1, '2026-12-01', '10:30', 'Контрольний огляд', 'запланований'),
(4, 11, 5, '2026-12-03', '12:00', NULL, 'запланований');
