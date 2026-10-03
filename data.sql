-- MySQL dump 10.13  Distrib 8.4.4, for Linux (x86_64)
--
-- Host: localhost    Database: db
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` smallint DEFAULT NULL,
  `class_id` tinyint DEFAULT NULL,
  `student_id` tinyint DEFAULT NULL,
  `date` varchar(10) DEFAULT NULL,
  `status` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,1,'2026-07-22','present'),(6,1,1,'2026-08-30','present'),(10,4,2,'2026-08-30','absent'),(12,1,1,'2026-09-01','absent'),(26,2,19,'2026-09-04','absent'),(29,2,1,'2026-09-04','present'),(30,2,4,'2026-09-04','present'),(31,2,3,'2026-09-04','present'),(35,2,12,'2026-09-04','present'),(36,2,9,'2026-09-04','present'),(38,2,8,'2026-09-04','absent'),(39,2,7,'2026-09-04','absent'),(40,2,2,'2026-09-04','absent'),(41,2,6,'2026-09-04','absent'),(42,4,2,'2026-09-04','absent'),(43,4,10,'2026-09-04','present'),(44,4,20,'2026-09-04','present'),(45,4,23,'2026-09-04','present'),(46,4,24,'2026-09-04','absent'),(47,4,22,'2026-09-04','present'),(48,4,21,'2026-09-04','present'),(49,4,2,'2026-09-05','absent'),(50,4,20,'2026-09-05','present'),(51,4,10,'2026-09-05','present'),(52,4,23,'2026-09-05','present'),(53,4,24,'2026-09-05','present'),(54,4,21,'2026-09-05','present'),(55,4,22,'2026-09-05','present'),(56,1,24,'2026-09-06','present'),(57,1,2,'2026-09-06','present'),(58,1,6,'2026-09-06','present'),(59,3,25,'2026-09-06','present'),(60,3,28,'2026-09-06','present'),(61,3,26,'2026-09-06','present'),(62,3,29,'2026-09-06','present'),(63,3,30,'2026-09-06','present'),(64,3,27,'2026-09-06','present'),(68,3,31,'2026-09-06','present'),(69,3,19,'2026-09-06','present'),(71,1,1,'2026-09-07','present'),(72,1,2,'2026-09-07','present'),(73,1,6,'2026-09-07','present'),(74,1,7,'2026-09-07','present'),(75,1,4,'2026-09-07','present'),(76,2,9,'2026-09-08','present'),(77,2,12,'2026-09-08','present'),(78,2,11,'2026-09-08','present'),(79,2,17,'2026-09-08','present'),(80,2,24,'2026-09-08','present'),(81,2,3,'2026-09-08','present'),(82,2,18,'2026-09-08','present'),(83,2,5,'2026-09-08','present'),(84,3,19,'2026-09-10','present'),(85,3,29,'2026-09-10','present'),(87,3,26,'2026-09-10','present'),(88,3,31,'2026-09-10','present'),(89,2,3,'2026-09-11','present'),(90,2,9,'2026-09-11','present'),(91,2,11,'2026-09-11','present'),(92,2,12,'2026-09-11','present'),(93,2,24,'2026-09-11','present'),(94,2,9,'2026-09-15','present'),(95,2,11,'2026-09-15','present'),(96,2,24,'2026-09-15','present'),(97,2,11,'2026-09-18','present'),(98,2,3,'2026-09-18','present'),(99,2,9,'2026-09-18','present'),(100,2,12,'2026-09-18','present'),(101,1,2,'2026-09-13','present'),(102,1,6,'2026-09-13','present'),(103,1,4,'2026-09-13','present'),(104,1,1,'2026-09-13','present'),(105,1,1,'2026-09-20','present'),(106,1,4,'2026-09-20','present'),(107,1,7,'2026-09-20','present'),(108,1,2,'2026-09-20','present'),(109,1,14,'2026-09-20','present'),(111,3,28,'2026-09-20','present'),(113,3,19,'2026-09-20','present'),(114,3,25,'2026-09-20','present'),(115,3,29,'2026-09-20','present'),(116,3,26,'2026-09-20','present'),(117,3,30,'2026-09-20','present'),(118,3,27,'2026-09-20','present'),(119,3,24,'2026-09-20','present'),(120,1,27,'2026-09-14','present'),(121,1,30,'2026-09-14','present'),(122,1,1,'2026-09-14','present'),(123,1,14,'2026-09-14','present'),(124,1,7,'2026-09-14','present'),(125,1,2,'2026-09-14','present'),(126,1,6,'2026-09-14','present'),(127,1,3,'2026-09-14','present'),(128,4,22,'2026-09-11','present'),(129,4,10,'2026-09-11','present'),(130,4,23,'2026-09-11','present'),(131,4,20,'2026-09-11','present'),(132,4,21,'2026-09-11','present'),(133,4,17,'2026-09-11','present'),(134,4,21,'2026-09-12','present'),(135,4,10,'2026-09-12','present'),(136,4,22,'2026-09-12','present'),(137,4,17,'2026-09-12','present'),(138,4,23,'2026-09-12','present'),(139,4,20,'2026-09-12','present'),(140,4,10,'2026-09-18','present'),(141,4,21,'2026-09-18','present'),(142,4,22,'2026-09-18','present'),(143,4,17,'2026-09-18','present'),(144,4,23,'2026-09-18','present'),(145,4,20,'2026-09-18','present'),(146,4,10,'2026-09-19','present'),(147,4,21,'2026-09-19','present'),(148,4,22,'2026-09-19','present'),(149,4,23,'2026-09-19','present'),(150,4,17,'2026-09-19','present'),(151,4,20,'2026-09-19','present'),(152,3,26,'2026-09-13','present'),(153,3,29,'2026-09-13','present'),(154,3,30,'2026-09-13','present'),(155,3,31,'2026-09-13','present'),(156,3,19,'2026-09-13','present'),(157,3,26,'2026-09-17','present'),(158,3,29,'2026-09-17','present'),(159,3,31,'2026-09-17','present'),(160,3,19,'2026-09-17','present'),(161,5,26,'2026-09-19','present'),(162,5,29,'2026-09-19','present'),(163,5,28,'2026-09-19','present'),(164,5,25,'2026-09-19','present'),(165,5,24,'2026-09-19','present'),(166,5,22,'2026-09-19','present'),(167,5,27,'2026-09-19','present'),(168,5,21,'2026-09-19','present'),(169,8,33,'2026-09-20','present'),(170,8,32,'2026-09-20','present'),(171,8,34,'2026-09-20','present'),(172,8,35,'2026-09-20','present'),(173,1,6,'2026-09-20','present'),(174,4,2,'2026-09-22','absent'),(175,4,24,'2026-09-22','absent'),(179,2,9,'2026-09-22','present'),(180,2,11,'2026-09-22','present'),(181,2,24,'2026-09-22','present');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_students`
--

DROP TABLE IF EXISTS `class_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_students` (
  `id` tinyint DEFAULT NULL,
  `class_id` tinyint DEFAULT NULL,
  `student_id` tinyint DEFAULT NULL,
  `enrolledAt` varchar(0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_students`
--

LOCK TABLES `class_students` WRITE;
/*!40000 ALTER TABLE `class_students` DISABLE KEYS */;
INSERT INTO `class_students` VALUES (1,1,1,''),(2,4,2,''),(3,1,15,''),(4,2,1,''),(5,2,12,''),(6,2,4,''),(7,2,6,''),(8,2,19,''),(9,2,3,''),(10,2,9,''),(11,2,2,''),(12,2,8,''),(13,2,7,''),(14,4,10,''),(15,4,22,''),(16,4,20,''),(17,4,21,''),(18,4,23,''),(19,4,24,''),(20,1,11,''),(21,1,17,''),(22,1,13,''),(23,1,14,''),(24,1,19,''),(25,1,12,''),(26,1,2,''),(27,1,24,''),(28,1,6,''),(29,3,30,''),(30,3,28,''),(31,3,29,''),(32,3,27,''),(33,3,26,''),(34,3,25,''),(35,3,31,''),(36,3,19,''),(37,1,7,''),(38,1,4,''),(39,2,11,''),(40,2,17,''),(41,2,24,''),(42,2,18,''),(43,2,5,''),(44,3,24,''),(45,1,27,''),(46,1,30,''),(47,1,3,''),(48,4,17,''),(49,5,26,''),(50,5,29,''),(51,5,28,''),(52,5,27,''),(53,5,22,''),(54,5,24,''),(55,5,21,''),(56,5,25,''),(57,8,35,''),(58,8,34,''),(59,8,32,''),(60,8,33,'');
/*!40000 ALTER TABLE `class_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` tinyint DEFAULT NULL,
  `name` varchar(14) DEFAULT NULL,
  `teacher` varchar(19) DEFAULT NULL,
  `schedule` varchar(47) DEFAULT NULL,
  `room` varchar(1) DEFAULT NULL,
  `capacity` varchar(2) DEFAULT NULL,
  `ta` varchar(19) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'KID 2','Phan Đình Phát','Thứ 2 (17:15 - 19:15), Chủ nhật (07:00 - 09:00)','2','15','Trần Phương Nhi'),(2,'KID 1','Trần Thị Phương Nhi','Thứ 3 (17:15 - 19:15), Thứ 6 (17:15 - 19:15)','1','10','Phan Thị Hồng Quỳnh'),(3,'KID 3','Phan Thị Hồng Quỳnh','Chủ nhật (09:00 - 11:00), Thứ 5 (17:15 - 19:15)','1','10','Trần Thị Phương Nhi'),(4,'KID 5','Phan Thị Hồng Quỳnh','Thứ 6 (19:15 - 21:15), Thứ 7 (17:15 - 19:15)','1','10',''),(5,'Tự luyện','Đặng Hoàng Nghĩa','','1','10','Đặng Hoàng Nghĩa'),(6,'KID 1 dự phòng','Đặng Hoàng Nghĩa','Thứ 7 (09:00 - 11:00)','','','Đặng Hoàng Nghĩa'),(7,'KID 2 dự phòng','Đặng Hoàng Nghĩa','Thứ 7 (07:00 - 09:00)','','','Đặng Hoàng Nghĩa'),(8,'KID 7','Nhữ Thị Khánh Linh','Thứ 7 (09:00 - 11:00), Chủ nhật (15:15 - 17:15)','','','');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` tinyint DEFAULT NULL,
  `invoice_code` varchar(13) DEFAULT NULL,
  `student_id` tinyint DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `status` varchar(7) DEFAULT NULL,
  `createdAt` varchar(0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-2026-2551',1,400000,'pending',''),(2,'INV-2026-3253',1,2000000,'pending',''),(3,'INV-2026-1214',1,100000,'paid','');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sqlite_sequence`
--

DROP TABLE IF EXISTS `sqlite_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sqlite_sequence` (
  `name` varchar(14) DEFAULT NULL,
  `seq` smallint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sqlite_sequence`
--

LOCK TABLES `sqlite_sequence` WRITE;
/*!40000 ALTER TABLE `sqlite_sequence` DISABLE KEYS */;
INSERT INTO `sqlite_sequence` VALUES ('classes',8),('students',35),('class_students',60),('invoices',3),('attendance',181),('teachers',6);
/*!40000 ALTER TABLE `sqlite_sequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` tinyint DEFAULT NULL,
  `name` varchar(21) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `parentName` varchar(21) DEFAULT NULL,
  `parentPhone` varchar(10) DEFAULT NULL,
  `createdAt` varchar(0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'Võ Ngọc Minh Hằng','','Võ Văn Hiền','0945995214',''),(2,'Huỳnh Minh Quân','','Huỳnh Kim Cương','0777465050',''),(3,'Hồ Nguyễn Minh Thư','','Nguyễn Thị Bích Trâm','0901175843',''),(4,'Đặng Hoàng Vũ Minh','','Nguyễn Thị Hoài Trang','0935320747',''),(5,'Đặng Hoàng Tuyết Mẫn','','Nguyễn Thị Hoài Trang','0935320747',''),(6,'Nguyễn Thành Gia Hưng','','Đào Thanh Hiền','0818785149',''),(7,'Đăng Khôi','','Chị Chi','',''),(8,'Thiện Nhân','','Chị Hương','',''),(9,'Phạm Văn Ánh Dương','','Chị Thu','0386369763',''),(10,'Nguyễn Ngọc Bảo Trân','10/03/2016','Chị Lào','0935160020',''),(11,'Võ Trần Khải Phong','','Võ Văn Thành','0935160386',''),(12,'Chánh Hưng','','Chị Thu','',''),(13,'Trí Hưng','','Nguyễn Văn Tân','0935728572',''),(14,'Võ Hoàng Nhật Long','','Võ Văn Nhân','0946875237',''),(15,'DAVID','','Anh Thy','',''),(16,'LINDAN','','Anh Thy','',''),(17,'Bảo Châu','','Chị Phúc','0796687870',''),(18,'Khánh Toàn','','Chị Phúc','0796687870',''),(19,'Phan Thế Thiện Ngôn','','Chị Thanh','0798184914',''),(20,'Trần Thị Thanh Thảo','','','',''),(21,'Nguyễn Hữu Minh Thiện','','','',''),(22,'Nguyễn Ngọc Khánh Đan','','','',''),(23,'Nguyễn Huỳnh Bảo Nhi','','','',''),(24,' Nguyễn Thiên Ân','','','',''),(25,'Trần Đông Quân','','','',''),(26,'Trần Hồ Anh Thư','','','',''),(27,'Phạm Tuấn Kiệt','','','',''),(28,'Phạm Thanh Trúc','','','',''),(29,'Nguyễn Võ Tuệ Nhi','','','',''),(30,'Dương Ngọc Kiều My','','','',''),(31,'Nguyễn Quang Nhật','','','',''),(32,'Nguyễn Thanh Thảo','','','',''),(33,'Đặng Văn Việt Quốc','','','',''),(34,'Dương Phước','','','',''),(35,'Nguyễn Minh Kiên','','','','');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_attendance`
--

DROP TABLE IF EXISTS `teacher_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_attendance` (
  `id` varchar(0) DEFAULT NULL,
  `class_id` varchar(0) DEFAULT NULL,
  `teacher_name` varchar(0) DEFAULT NULL,
  `role` varchar(0) DEFAULT NULL,
  `date` varchar(0) DEFAULT NULL,
  `status` varchar(0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_attendance`
--

LOCK TABLES `teacher_attendance` WRITE;
/*!40000 ALTER TABLE `teacher_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` tinyint DEFAULT NULL,
  `name` varchar(19) DEFAULT NULL,
  `role` tinyint DEFAULT NULL,
  `phone` bigint DEFAULT NULL,
  `createdAt` varchar(0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'Phan Đình Phát',1,392082052,''),(2,'Trần Thị Phương Nhi',1,966207605,''),(3,'Đặng Hoàng Nghĩa',1,1234567890,''),(4,'Nguyễn Đăng Phát',1,378267948,''),(5,'Phan Thị Hồng Quỳnh',1,352299485,''),(6,'Nhữ Thị Khánh Linh',1,347105357,'');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-11 13:29:59
