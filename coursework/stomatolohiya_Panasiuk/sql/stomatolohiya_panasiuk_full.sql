-- SQL dump: база даних КІС «Стоматологічна поліклініка» (stomatolohiya_panasiuk)
--
-- Host: localhost    Database: stomatolohiya_panasiuk
-- ------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `stomatolohiya_panasiuk`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `stomatolohiya_panasiuk` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `stomatolohiya_panasiuk`;

--
-- Table structure for table `korystuvachi`
--

DROP TABLE IF EXISTS `korystuvachi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `korystuvachi` (
  `e_mail` varchar(100) NOT NULL,
  `parol` varchar(255) NOT NULL,
  `prava` enum('admin','user') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`e_mail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `korystuvachi`
--

LOCK TABLES `korystuvachi` WRITE;
/*!40000 ALTER TABLE `korystuvachi` DISABLE KEYS */;
INSERT INTO `korystuvachi` VALUES
('admin@stomat.ua','$2b$10$roxi2tVPJKb1MBvBzPAByOPhj3zgIq0n22nNzYCvAKLRGNffn3LAy','admin'),
('likar@stomat.ua','$2b$10$KQPFyagrAt7Q8pYH9b79T.7TAoLHaM2J/yEPSy9M3hPhD7iY/B/7K','user');
/*!40000 ALTER TABLE `korystuvachi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likari`
--

DROP TABLE IF EXISTS `likari`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `likari` (
  `id_likarya` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_viddilennya` int(10) unsigned NOT NULL,
  `prizvyshche` varchar(100) NOT NULL,
  `imya` varchar(100) NOT NULL,
  `pobatkovi` varchar(100) DEFAULT NULL,
  `spetsializatsiya` varchar(100) DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_likarya`),
  KEY `fk_likari_viddilennya` (`id_viddilennya`),
  CONSTRAINT `fk_likari_viddilennya` FOREIGN KEY (`id_viddilennya`) REFERENCES `viddilennya` (`id_viddilennya`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likari`
--

LOCK TABLES `likari` WRITE;
/*!40000 ALTER TABLE `likari` DISABLE KEYS */;
INSERT INTO `likari` VALUES
(1,1,'Коваленко','Олена','Петрівна','Лікар-стоматолог-терапевт','+380671112201'),
(2,1,'Бондар','Андрій','Іванович','Лікар-стоматолог-терапевт','+380671112202'),
(3,1,'Шевчук','Ірина','Олегівна','Лікар-ендодонтист','+380671112203'),
(4,2,'Ткаченко','Сергій','Миколайович','Лікар-стоматолог-хірург','+380671112204'),
(5,2,'Мельник','Віталій','Романович','Лікар-імплантолог','+380671112205'),
(6,3,'Кравчук','Наталія','Василівна','Лікар-стоматолог-ортопед','+380671112206'),
(7,3,'Олійник','Дмитро','Сергійович','Лікар-стоматолог-ортопед','+380671112207'),
(8,4,'Лисенко','Марія','Андріївна','Лікар-ортодонт','+380671112208'),
(9,5,'Савчук','Оксана','Ігорівна','Лікар-стоматолог дитячий','+380671112209'),
(10,5,'Руденко','Павло','Олександрович','Лікар-стоматолог дитячий','+380671112210'),
(11,6,'Гриценко','Василь','Петрович','Лікар-пародонтолог','+380671112211');
/*!40000 ALTER TABLE `likari` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patsiyenty`
--

DROP TABLE IF EXISTS `patsiyenty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `patsiyenty` (
  `id_patsiyenta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `prizvyshche` varchar(100) NOT NULL,
  `imya` varchar(100) NOT NULL,
  `pobatkovi` varchar(100) DEFAULT NULL,
  `data_narodzhennya` date DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_patsiyenta`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patsiyenty`
--

LOCK TABLES `patsiyenty` WRITE;
/*!40000 ALTER TABLE `patsiyenty` DISABLE KEYS */;
INSERT INTO `patsiyenty` VALUES
(1,'Гнатюк','Тарас','Васильович','1988-03-14','+380501234501'),
(2,'Поліщук','Анна','Сергіївна','1995-07-22','+380501234502'),
(3,'Захарчук','Віктор','Петрович','1972-11-05','+380501234503'),
(4,'Яковенко','Юлія','Олександрівна','2001-01-30','+380501234504'),
(5,'Марчук','Олег','Іванович','1965-06-18','+380501234505'),
(6,'Дячук','Софія','Андріївна','2015-09-09','+380501234506'),
(7,'Литвин','Роман','Миколайович','1990-12-12','+380501234507'),
(8,'Кушнір','Галина','Степанівна','1958-04-27','+380501234508'),
(9,'Онищук','Максим','Дмитрович','2012-02-15','+380501234509'),
(10,'Савицька','Ірина','Володимирівна','1983-08-03','+380501234510'),
(11,'Петрук','Богдан','Ярославович','1999-05-21','+380501234511'),
(12,'Федорчук','Леся','Миколаївна','1976-10-10','+380501234512'),
(13,'Карпенко','Оксана','Іванівна','1992-04-12','+380501234513');
/*!40000 ALTER TABLE `patsiyenty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poslugy`
--

DROP TABLE IF EXISTS `poslugy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `poslugy` (
  `id_poslugy` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_viddilennya` int(10) unsigned NOT NULL,
  `nazva_poslugy` varchar(150) NOT NULL,
  `tsina` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_poslugy`),
  KEY `fk_poslugy_viddilennya` (`id_viddilennya`),
  CONSTRAINT `fk_poslugy_viddilennya` FOREIGN KEY (`id_viddilennya`) REFERENCES `viddilennya` (`id_viddilennya`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poslugy`
--

LOCK TABLES `poslugy` WRITE;
/*!40000 ALTER TABLE `poslugy` DISABLE KEYS */;
INSERT INTO `poslugy` VALUES
(1,1,'Консультація та огляд',300.00),
(2,1,'Професійна гігієна порожнини рота',1200.00),
(3,1,'Лікування карієсу (фотополімерна пломба)',1500.00),
(4,1,'Лікування пульпіту (1 канал)',2200.00),
(5,2,'Видалення зуба (просте)',900.00),
(6,2,'Видалення зуба мудрості',2500.00),
(7,2,'Встановлення імпланта',18000.00),
(8,3,'Металокерамічна коронка',5500.00),
(9,3,'Цирконієва коронка',9000.00),
(10,4,'Встановлення брекет-системи (1 щелепа)',16000.00),
(11,4,'Корекція брекет-системи',800.00),
(12,5,'Лікування молочного зуба',900.00),
(13,5,'Герметизація фісур',600.00),
(14,6,'Лікування пародонтиту (1 сеанс)',1800.00);
/*!40000 ALTER TABLE `poslugy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pryyomy`
--

DROP TABLE IF EXISTS `pryyomy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pryyomy` (
  `id_pryyomu` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_likarya` int(10) unsigned NOT NULL,
  `id_patsiyenta` int(10) unsigned NOT NULL,
  `id_poslugy` int(10) unsigned NOT NULL,
  `data_pryyomu` date NOT NULL,
  `chas_pryyomu` time NOT NULL,
  `diahnoz` varchar(255) DEFAULT NULL,
  `status` enum('запланований','завершений','скасований') NOT NULL DEFAULT 'запланований',
  PRIMARY KEY (`id_pryyomu`),
  KEY `ix_pryyomy_data` (`data_pryyomu`),
  KEY `fk_pryyomy_likari` (`id_likarya`),
  KEY `fk_pryyomy_patsiyenty` (`id_patsiyenta`),
  KEY `fk_pryyomy_poslugy` (`id_poslugy`),
  CONSTRAINT `fk_pryyomy_likari` FOREIGN KEY (`id_likarya`) REFERENCES `likari` (`id_likarya`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pryyomy_patsiyenty` FOREIGN KEY (`id_patsiyenta`) REFERENCES `patsiyenty` (`id_patsiyenta`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pryyomy_poslugy` FOREIGN KEY (`id_poslugy`) REFERENCES `poslugy` (`id_poslugy`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pryyomy`
--

LOCK TABLES `pryyomy` WRITE;
/*!40000 ALTER TABLE `pryyomy` DISABLE KEYS */;
INSERT INTO `pryyomy` VALUES
(1,1,1,1,'2026-10-01','09:00:00','Огляд, план лікування','завершений'),
(2,1,1,3,'2026-10-06','10:00:00','Середній карієс 36','завершений'),
(3,2,2,2,'2026-10-02','11:30:00','Зубний наліт, гінгівіт','завершений'),
(4,3,3,4,'2026-10-03','12:00:00','Гострий пульпіт 46','завершений'),
(5,4,5,5,'2026-10-07','09:30:00','Хронічний періодонтит 17','завершений'),
(6,5,7,7,'2026-10-09','14:00:00','Вторинна адентія 36','завершений'),
(7,6,8,8,'2026-10-13','10:30:00','Дефект коронки 25','завершений'),
(8,8,4,10,'2026-10-14','15:00:00','Скупченість зубів','завершений'),
(9,9,6,12,'2026-10-15','09:00:00','Карієс 75','завершений'),
(10,10,9,13,'2026-10-16','10:00:00','Профілактика','завершений'),
(11,2,10,3,'2026-10-20','13:00:00','Поверхневий карієс 14','завершений'),
(12,4,11,6,'2026-10-21','11:00:00','Ретинований 38','завершений'),
(13,7,12,9,'2026-10-23','12:30:00','Дефект коронки 11','завершений'),
(14,1,2,3,'2026-10-27','09:30:00','Середній карієс 24','завершений'),
(15,3,3,4,'2026-10-29','16:00:00','Повторне відвідування 46','скасований'),
(16,5,7,7,'2026-11-03','14:00:00','Імплантація 46','завершений'),
(17,8,4,11,'2026-11-11','15:00:00','Плановий огляд брекетів','завершений'),
(18,1,5,2,'2026-11-17','10:00:00','Гігієна','завершений'),
(19,6,8,8,'2026-11-24','11:00:00','Дефект коронки 26','завершений'),
(20,9,9,12,'2026-11-26','09:00:00','Карієс 84','запланований'),
(21,2,1,1,'2026-12-01','10:30:00','Контрольний огляд','запланований'),
(23,11,13,14,'2026-11-27','10:00:00','Хронічний генералізований пародонтит','завершений');
/*!40000 ALTER TABLE `pryyomy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viddilennya`
--

DROP TABLE IF EXISTS `viddilennya`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `viddilennya` (
  `id_viddilennya` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nazva_viddilennya` varchar(100) NOT NULL,
  `roztashuvannya` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_viddilennya`),
  UNIQUE KEY `uq_nazva_viddilennya` (`nazva_viddilennya`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viddilennya`
--

LOCK TABLES `viddilennya` WRITE;
/*!40000 ALTER TABLE `viddilennya` DISABLE KEYS */;
INSERT INTO `viddilennya` VALUES
(1,'Терапевтичне','1 поверх, каб. 101–105'),
(2,'Хірургічне','1 поверх, каб. 110–112'),
(3,'Ортопедичне','2 поверх, каб. 201–204'),
(4,'Ортодонтичне','2 поверх, каб. 210–211'),
(5,'Дитяче','3 поверх, каб. 301–303'),
(6,'Пародонтологічне','3 поверх, каб. 310');
/*!40000 ALTER TABLE `viddilennya` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
