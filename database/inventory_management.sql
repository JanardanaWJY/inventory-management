/*!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: inventory_management
-- ------------------------------------------------------
-- Server version	11.4.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `product_sn` varchar(20) NOT NULL,
  `purchase_date` datetime DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `price` float NOT NULL,
  `vendor` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`product_sn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
('ABCDE123','2023-07-10 10:00:00','Product 1',100.5,'Vendor A','Description for Product 1'),
('ABCDE1234','2023-07-20 12:35:00','Product 11',600,'Vendor K','Description for Product 11'),
('EFGHI3456','2023-07-26 16:40:00','Product 17',900.5,'Vendor Q','Description for Product 17'),
('EFGHI901','2023-07-16 15:10:00','Product 7',400,'Vendor G','Description for Product 7'),
('FGHIJ456','2023-07-11 11:30:00','Product 2',150.75,'Vendor B','Description for Product 2'),
('FGHIJ5678','2023-07-21 10:25:00','Product 12',650.25,'Vendor L','Description for Product 12'),
('JKLMN234','2023-07-17 08:30:00','Product 8',450.25,'Vendor H','Description for Product 8'),
('JKLMN6789','2023-07-27 13:55:00','Product 18',950.75,'Vendor R','Description for Product 18'),
('KLMNO789','2023-07-12 14:45:00','Product 3',200,'Vendor C','Description for Product 3'),
('KLMNO9012','2023-07-22 14:10:00','Product 13',700.5,'Vendor M','Description for Product 13'),
('OPQRS0123','2023-07-28 10:50:00','Product 19',1000,'Vendor S','Description for Product 19'),
('OPQRS567','2023-07-18 11:00:00','Product 9',500.5,'Vendor I','Description for Product 9'),
('PQRST012','2023-07-13 09:15:00','Product 4',250.25,'Vendor D','Description for Product 4'),
('PQRST3456','2023-07-23 15:55:00','Product 14',750.75,'Vendor N','Description for Product 14'),
('TUVWX3456','2023-07-29 14:30:00','Product 20',1050.25,'Vendor T','Description for Product 20'),
('TUVWX890','2023-07-19 17:45:00','Product 10',550.75,'Vendor J','Description for Product 10'),
('UVWXY345','2023-07-14 16:50:00','Product 5',300.5,'Vendor E','Description for Product 5'),
('UVWXY6789','2023-07-24 09:45:00','Product 15',800,'Vendor O','Description for Product 15'),
('ZABCD0123','2023-07-25 11:20:00','Product 16',850.25,'Vendor P','Description for Product 16'),
('ZABCD678','2023-07-15 13:20:00','Product 6',350.75,'Vendor F','Description for Product 6');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rentals` (
  `product_sn` varchar(20) NOT NULL,
  `start_date` datetime NOT NULL,
  `transaction_type` int(11) NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `qty` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`product_sn`,`start_date`),
  CONSTRAINT `fk_product` FOREIGN KEY (`product_sn`) REFERENCES `products` (`product_sn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` VALUES
('ABCDE123','2024-07-19 17:19:10',4,'2024-07-20 18:00:00',1,'');
/*!40000 ALTER TABLE `rentals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Password` varchar(255) NOT NULL,
  `Last_Login_Date` datetime DEFAULT NULL,
  `Name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'$2a$08$Tu2qNaSkzkU04fLrFFekyuJV/fmuro/JAugOGO1f3nMTDvVO5KqQy','2024-07-14 23:41:27','admin_1'),
(2,'$2a$08$toylCQ7P9v1Mc6Xbx.JZ8.VQWyGa3nApDVqL2U3QIzaF.bqWYNVa6','2024-07-12 23:19:46','admin_2');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2024-07-19 18:23:44
