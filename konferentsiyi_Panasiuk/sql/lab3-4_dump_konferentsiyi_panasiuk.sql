-- SQL dump: база даних АІС «Конференції» (konferentsiyi_panasiuk)
--
-- Host: localhost    Database: konferentsiyi_panasiuk
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
-- Current Database: `konferentsiyi_panasiuk`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `konferentsiyi_panasiuk` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci */;

USE `konferentsiyi_panasiuk`;

--
-- Table structure for table `kafedry`
--

DROP TABLE IF EXISTS `kafedry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kafedry` (
  `id_kafedry` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nazva_kafedry` varchar(100) DEFAULT NULL,
  `roztashuvannya` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_kafedry`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kafedry`
--

LOCK TABLES `kafedry` WRITE;
/*!40000 ALTER TABLE `kafedry` DISABLE KEYS */;
INSERT INTO `kafedry` VALUES
(1,'Економічна кібернетика','247 ауд.'),
(2,'Економіки підприємства','255 ауд.'),
(3,'Маркетингу','275 ауд.'),
(4,'Менеджменту','262 ауд.'),
(5,'Міжнародної економіки','272 ауд.'),
(6,'Обліку і аудиту','240 ауд.');
/*!40000 ALTER TABLE `kafedry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `konferentsiyi`
--

DROP TABLE IF EXISTS `konferentsiyi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `konferentsiyi` (
  `id_konferentsiyi` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_spivrobitnyky` int(10) unsigned DEFAULT NULL,
  `nazva_konferentsiyi` varchar(255) DEFAULT NULL,
  `data_pochatku` date DEFAULT NULL,
  `data_zakinchennya` date DEFAULT NULL,
  PRIMARY KEY (`id_konferentsiyi`),
  KEY `spivrobitnyky` (`id_spivrobitnyky`),
  CONSTRAINT `spivrobitnyky` FOREIGN KEY (`id_spivrobitnyky`) REFERENCES `spivrobitnyky` (`id_spivrobitnyky`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `konferentsiyi`
--

LOCK TABLES `konferentsiyi` WRITE;
/*!40000 ALTER TABLE `konferentsiyi` DISABLE KEYS */;
INSERT INTO `konferentsiyi` VALUES
(1,1,'Розвиток економічної кібернетики','2016-09-26','2016-09-27'),
(2,1,'Кібернетика: перспективи розвитку','2016-11-01','2016-11-03'),
(3,3,'Сучасний стан інформатизації','2016-10-03','2016-10-04'),
(4,6,'Економіка: сьогодення','2016-10-17','2016-10-19'),
(5,1,'Менеджмент туризму','2016-11-15','2016-11-16'),
(6,3,'Підприємництво в Україні','2016-09-01','2016-09-02');
/*!40000 ALTER TABLE `konferentsiyi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spivrobitnyky`
--

DROP TABLE IF EXISTS `spivrobitnyky`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `spivrobitnyky` (
  `id_spivrobitnyky` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_kafedry` int(10) unsigned DEFAULT NULL,
  `prizvyshche` varchar(100) DEFAULT NULL,
  `imya` varchar(100) DEFAULT NULL,
  `pobatkovi` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_spivrobitnyky`),
  KEY `kafedry` (`id_kafedry`),
  CONSTRAINT `kafedry` FOREIGN KEY (`id_kafedry`) REFERENCES `kafedry` (`id_kafedry`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spivrobitnyky`
--

LOCK TABLES `spivrobitnyky` WRITE;
/*!40000 ALTER TABLE `spivrobitnyky` DISABLE KEYS */;
INSERT INTO `spivrobitnyky` VALUES
(1,1,'Іванов','Іван','Іванович'),
(2,1,'Павлюк','Сергій','Миколайович'),
(3,1,'Новак','Оксана','Миколаївна'),
(4,4,'Нагорна','Світлана','Володимирівна'),
(5,5,'Сидорук','Олексій','Вікторович'),
(6,4,'Кушнір','Олена','Іванівна'),
(7,6,'Прокопович','Володимир','Іванович'),
(8,5,'Куць','Ніна','Олексіївна'),
(9,1,'Короткий','Віктор','Петрович'),
(10,3,'Сорока','Петро','Вікторович');
/*!40000 ALTER TABLE `spivrobitnyky` ENABLE KEYS */;
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
