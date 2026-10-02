SET FOREIGN_KEY_CHECKS=0;
START TRANSACTION;
CREATE TABLE students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      parentName TEXT,
      parentPhone TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO students VALUES(1,'V├╡ Ngß╗ìc Minh Hß║▒ng','','V├╡ V─ân Hiß╗ün','0945995214','2026-07-22 12:20:59');
INSERT INTO students VALUES(2,'Huß╗│nh Minh Qu├ón','','Huß╗│nh Kim C╞░╞íng','0777465050','2026-08-30 02:52:12');
INSERT INTO students VALUES(3,'Hß╗ô Nguyß╗àn Minh Th╞░','','Nguyß╗àn Thß╗ï B├¡ch Tr├óm','0901175843','2026-08-30 10:13:02');
INSERT INTO students VALUES(4,'─Éß║╖ng Ho├áng V┼⌐ Minh','','Nguyß╗àn Thß╗ï Ho├ái Trang','0935320747','2026-08-30 10:13:38');
INSERT INTO students VALUES(5,'─Éß║╖ng Ho├áng Tuyß║┐t Mß║½n','','Nguyß╗àn Thß╗ï Ho├ái Trang','0935320747','2026-08-30 10:14:19');
INSERT INTO students VALUES(6,'Nguyß╗àn Th├ánh Gia H╞░ng','','─É├áo Thanh Hiß╗ün','0818785149','2026-08-30 10:17:34');
INSERT INTO students VALUES(7,'─É─âng Kh├┤i','','Chß╗ï Chi','','2026-08-30 10:18:35');
INSERT INTO students VALUES(8,'Thiß╗çn Nh├ón','','Chß╗ï H╞░╞íng','','2026-08-30 10:19:11');
INSERT INTO students VALUES(9,'Phß║ím V─ân ├ünh D╞░╞íng','','Chß╗ï Thu','0386369763','2026-08-30 10:19:47');
INSERT INTO students VALUES(10,'Nguyß╗àn Ngß╗ìc Bß║úo Tr├ón','10/03/2016','Chß╗ï L├áo','0935160020','2026-08-30 10:20:51');
INSERT INTO students VALUES(11,'V├╡ Trß║ºn Khß║úi Phong','','V├╡ V─ân Th├ánh','0935160386','2026-08-30 10:22:00');
INSERT INTO students VALUES(12,'Ch├ính H╞░ng','','Chß╗ï Thu','','2026-08-30 10:22:52');
INSERT INTO students VALUES(13,'Tr├¡ H╞░ng','','Nguyß╗àn V─ân T├ón','0935728572','2026-08-30 10:23:24');
INSERT INTO students VALUES(14,'V├╡ Ho├áng Nhß║¡t Long','','V├╡ V─ân Nh├ón','0946875237','2026-08-30 10:24:28');
INSERT INTO students VALUES(15,'DAVID','','Anh Thy','','2026-08-30 10:24:51');
INSERT INTO students VALUES(16,'LINDAN','','Anh Thy','','2026-08-30 10:25:12');
INSERT INTO students VALUES(17,'Bß║úo Ch├óu','','Chß╗ï Ph├║c','0796687870','2026-08-30 10:25:58');
INSERT INTO students VALUES(18,'Kh├ính To├án','','Chß╗ï Ph├║c','0796687870','2026-08-30 10:26:35');
INSERT INTO students VALUES(19,'Phan Thß║┐ Thiß╗çn Ng├┤n','','Chß╗ï Thanh','0798184914','2026-08-30 10:27:28');
INSERT INTO students VALUES(20,'Trß║ºn Thß╗ï Thanh Thß║úo','','','','2026-09-04 12:24:27');
INSERT INTO students VALUES(21,'Nguyß╗àn Hß╗»u Minh Thiß╗çn','','','','2026-09-04 12:25:17');
INSERT INTO students VALUES(22,'Nguyß╗àn Ngß╗ìc Kh├ính ─Éan','','','','2026-09-04 12:25:42');
INSERT INTO students VALUES(23,'Nguyß╗àn Huß╗│nh Bß║úo Nhi','','','','2026-09-04 12:26:40');
INSERT INTO students VALUES(24,' Nguyß╗àn Thi├¬n ├én','','','','2026-09-04 12:27:42');
INSERT INTO students VALUES(25,'Trß║ºn ─É├┤ng Qu├ón','','','','2026-09-06 02:04:08');
INSERT INTO students VALUES(26,'Trß║ºn Hß╗ô Anh Th╞░','','','','2026-09-06 02:04:29');
INSERT INTO students VALUES(27,'Phß║ím Tuß║Ñn Kiß╗çt','','','','2026-09-06 02:05:06');
INSERT INTO students VALUES(28,'Phß║ím Thanh Tr├║c','','','','2026-09-06 02:05:28');
INSERT INTO students VALUES(29,'Nguyß╗àn V├╡ Tuß╗ç Nhi','','','','2026-09-06 02:05:52');
INSERT INTO students VALUES(30,'D╞░╞íng Ngß╗ìc Kiß╗üu My','','','','2026-09-06 02:06:28');
INSERT INTO students VALUES(31,'Nguyß╗àn Quang Nhß║¡t','','','','2026-09-06 02:12:57');
INSERT INTO students VALUES(32,'Nguyß╗àn Thanh Thß║úo','','','','2026-09-20 08:21:27');
INSERT INTO students VALUES(33,'─Éß║╖ng V─ân Viß╗çt Quß╗æc','','','','2026-09-20 08:22:47');
INSERT INTO students VALUES(34,'D╞░╞íng Ph╞░ß╗¢c','','','','2026-09-20 08:23:16');
INSERT INTO students VALUES(35,'Nguyß╗àn Minh Ki├¬n','','','','2026-09-20 08:24:50');
CREATE TABLE classes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      teacher TEXT,
      schedule TEXT,
      room TEXT,
      capacity INTEGER
    , ta TEXT);
INSERT INTO classes VALUES(1,'KID 2','Phan ─É├¼nh Ph├ít','Thß╗⌐ 2 (17:15 - 19:15), Chß╗º nhß║¡t (07:00 - 09:00)','2',15,'Trß║ºn Ph╞░╞íng Nhi');
INSERT INTO classes VALUES(2,'KID 1','Trß║ºn Thß╗ï Ph╞░╞íng Nhi','Thß╗⌐ 3 (17:15 - 19:15), Thß╗⌐ 6 (17:15 - 19:15)','1',10,'Phan Thß╗ï Hß╗ông Quß╗│nh');
INSERT INTO classes VALUES(3,'KID 3','Phan Thß╗ï Hß╗ông Quß╗│nh','Chß╗º nhß║¡t (09:00 - 11:00), Thß╗⌐ 5 (17:15 - 19:15)','1',10,'Trß║ºn Thß╗ï Ph╞░╞íng Nhi');
INSERT INTO classes VALUES(4,'KID 5','Phan Thß╗ï Hß╗ông Quß╗│nh','Thß╗⌐ 6 (19:15 - 21:15), Thß╗⌐ 7 (17:15 - 19:15)','1',10,'');
INSERT INTO classes VALUES(5,'Tß╗▒ luyß╗çn','─Éß║╖ng Ho├áng Ngh─⌐a','','1',10,'─Éß║╖ng Ho├áng Ngh─⌐a');
INSERT INTO classes VALUES(6,'KID 1 dß╗▒ ph├▓ng','─Éß║╖ng Ho├áng Ngh─⌐a','Thß╗⌐ 7 (09:00 - 11:00)','','','─Éß║╖ng Ho├áng Ngh─⌐a');
INSERT INTO classes VALUES(7,'KID 2 dß╗▒ ph├▓ng','─Éß║╖ng Ho├áng Ngh─⌐a','Thß╗⌐ 7 (07:00 - 09:00)','','','─Éß║╖ng Ho├áng Ngh─⌐a');
INSERT INTO classes VALUES(8,'KID 7','Nhß╗» Thß╗ï Kh├ính Linh','Thß╗⌐ 7 (09:00 - 11:00), Chß╗º nhß║¡t (15:15 - 17:15)','','','');
CREATE TABLE class_students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INTEGER,
      student_id INTEGER,
      enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(class_id, student_id)
    );
INSERT INTO class_students VALUES(1,1,1,'2026-07-22 12:27:46');
INSERT INTO class_students VALUES(2,4,2,'2026-08-30 02:52:24');
INSERT INTO class_students VALUES(3,1,15,'2026-09-01 07:33:37');
INSERT INTO class_students VALUES(4,2,1,'2026-09-04 10:30:42');
INSERT INTO class_students VALUES(5,2,12,'2026-09-04 10:31:21');
INSERT INTO class_students VALUES(6,2,4,'2026-09-04 10:31:55');
INSERT INTO class_students VALUES(7,2,6,'2026-09-04 10:32:10');
INSERT INTO class_students VALUES(8,2,19,'2026-09-04 10:32:34');
INSERT INTO class_students VALUES(9,2,3,'2026-09-04 10:33:05');
INSERT INTO class_students VALUES(10,2,9,'2026-09-04 10:34:30');
INSERT INTO class_students VALUES(11,2,2,'2026-09-04 10:34:43');
INSERT INTO class_students VALUES(12,2,8,'2026-09-04 10:35:12');
INSERT INTO class_students VALUES(13,2,7,'2026-09-04 10:35:24');
INSERT INTO class_students VALUES(14,4,10,'2026-09-04 12:23:10');
INSERT INTO class_students VALUES(15,4,22,'2026-09-04 12:26:04');
INSERT INTO class_students VALUES(16,4,20,'2026-09-04 12:26:14');
INSERT INTO class_students VALUES(17,4,21,'2026-09-04 12:26:24');
INSERT INTO class_students VALUES(18,4,23,'2026-09-04 12:27:04');
INSERT INTO class_students VALUES(19,4,24,'2026-09-04 12:27:57');
INSERT INTO class_students VALUES(20,1,11,'2026-09-05 13:23:46');
INSERT INTO class_students VALUES(21,1,17,'2026-09-05 13:23:57');
INSERT INTO class_students VALUES(22,1,13,'2026-09-05 13:24:09');
INSERT INTO class_students VALUES(23,1,14,'2026-09-05 13:24:19');
INSERT INTO class_students VALUES(24,1,19,'2026-09-05 13:24:29');
INSERT INTO class_students VALUES(25,1,12,'2026-09-05 13:25:14');
INSERT INTO class_students VALUES(26,1,2,'2026-09-06 00:24:48');
INSERT INTO class_students VALUES(27,1,24,'2026-09-06 00:25:24');
INSERT INTO class_students VALUES(28,1,6,'2026-09-06 00:26:10');
INSERT INTO class_students VALUES(29,3,30,'2026-09-06 02:06:49');
INSERT INTO class_students VALUES(30,3,28,'2026-09-06 02:06:55');
INSERT INTO class_students VALUES(31,3,29,'2026-09-06 02:07:00');
INSERT INTO class_students VALUES(32,3,27,'2026-09-06 02:07:12');
INSERT INTO class_students VALUES(33,3,26,'2026-09-06 02:07:32');
INSERT INTO class_students VALUES(34,3,25,'2026-09-06 02:07:42');
INSERT INTO class_students VALUES(35,3,31,'2026-09-06 02:13:10');
INSERT INTO class_students VALUES(36,3,19,'2026-09-06 02:13:25');
INSERT INTO class_students VALUES(37,1,7,'2026-09-07 11:39:16');
INSERT INTO class_students VALUES(38,1,4,'2026-09-07 11:39:40');
INSERT INTO class_students VALUES(39,2,11,'2026-09-08 11:32:38');
INSERT INTO class_students VALUES(40,2,17,'2026-09-08 11:33:08');
INSERT INTO class_students VALUES(41,2,24,'2026-09-08 11:33:44');
INSERT INTO class_students VALUES(42,2,18,'2026-09-08 11:34:28');
INSERT INTO class_students VALUES(43,2,5,'2026-09-08 11:35:03');
INSERT INTO class_students VALUES(44,3,24,'2026-09-20 02:16:09');
INSERT INTO class_students VALUES(45,1,27,'2026-09-20 02:57:16');
INSERT INTO class_students VALUES(46,1,30,'2026-09-20 02:57:32');
INSERT INTO class_students VALUES(47,1,3,'2026-09-20 02:58:20');
INSERT INTO class_students VALUES(48,4,17,'2026-09-20 03:00:13');
INSERT INTO class_students VALUES(49,5,26,'2026-09-20 03:14:54');
INSERT INTO class_students VALUES(50,5,29,'2026-09-20 03:15:16');
INSERT INTO class_students VALUES(51,5,28,'2026-09-20 03:17:48');
INSERT INTO class_students VALUES(52,5,27,'2026-09-20 03:18:02');
INSERT INTO class_students VALUES(53,5,22,'2026-09-20 03:18:12');
INSERT INTO class_students VALUES(54,5,24,'2026-09-20 03:18:23');
INSERT INTO class_students VALUES(55,5,21,'2026-09-20 03:18:35');
INSERT INTO class_students VALUES(56,5,25,'2026-09-20 03:18:53');
INSERT INTO class_students VALUES(57,8,35,'2026-09-20 08:25:14');
INSERT INTO class_students VALUES(58,8,34,'2026-09-20 08:25:25');
INSERT INTO class_students VALUES(59,8,32,'2026-09-20 08:25:41');
INSERT INTO class_students VALUES(60,8,33,'2026-09-20 08:25:49');
CREATE TABLE attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INTEGER,
      student_id INTEGER,
      date TEXT,
      status TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(class_id, student_id, date)
    );
INSERT INTO attendance VALUES(1,1,1,'2026-07-22','present');
INSERT INTO attendance VALUES(6,1,1,'2026-08-30','present');
INSERT INTO attendance VALUES(10,4,2,'2026-08-30','absent');
INSERT INTO attendance VALUES(12,1,1,'2026-09-01','absent');
INSERT INTO attendance VALUES(26,2,19,'2026-09-04','absent');
INSERT INTO attendance VALUES(29,2,1,'2026-09-04','present');
INSERT INTO attendance VALUES(30,2,4,'2026-09-04','present');
INSERT INTO attendance VALUES(31,2,3,'2026-09-04','present');
INSERT INTO attendance VALUES(35,2,12,'2026-09-04','present');
INSERT INTO attendance VALUES(36,2,9,'2026-09-04','present');
INSERT INTO attendance VALUES(38,2,8,'2026-09-04','absent');
INSERT INTO attendance VALUES(39,2,7,'2026-09-04','absent');
INSERT INTO attendance VALUES(40,2,2,'2026-09-04','absent');
INSERT INTO attendance VALUES(41,2,6,'2026-09-04','absent');
INSERT INTO attendance VALUES(42,4,2,'2026-09-04','absent');
INSERT INTO attendance VALUES(43,4,10,'2026-09-04','present');
INSERT INTO attendance VALUES(44,4,20,'2026-09-04','present');
INSERT INTO attendance VALUES(45,4,23,'2026-09-04','present');
INSERT INTO attendance VALUES(46,4,24,'2026-09-04','absent');
INSERT INTO attendance VALUES(47,4,22,'2026-09-04','present');
INSERT INTO attendance VALUES(48,4,21,'2026-09-04','present');
INSERT INTO attendance VALUES(49,4,2,'2026-09-05','absent');
INSERT INTO attendance VALUES(50,4,20,'2026-09-05','present');
INSERT INTO attendance VALUES(51,4,10,'2026-09-05','present');
INSERT INTO attendance VALUES(52,4,23,'2026-09-05','present');
INSERT INTO attendance VALUES(53,4,24,'2026-09-05','present');
INSERT INTO attendance VALUES(54,4,21,'2026-09-05','present');
INSERT INTO attendance VALUES(55,4,22,'2026-09-05','present');
INSERT INTO attendance VALUES(56,1,24,'2026-09-06','present');
INSERT INTO attendance VALUES(57,1,2,'2026-09-06','present');
INSERT INTO attendance VALUES(58,1,6,'2026-09-06','present');
INSERT INTO attendance VALUES(59,3,25,'2026-09-06','present');
INSERT INTO attendance VALUES(60,3,28,'2026-09-06','present');
INSERT INTO attendance VALUES(61,3,26,'2026-09-06','present');
INSERT INTO attendance VALUES(62,3,29,'2026-09-06','present');
INSERT INTO attendance VALUES(63,3,30,'2026-09-06','present');
INSERT INTO attendance VALUES(64,3,27,'2026-09-06','present');
INSERT INTO attendance VALUES(68,3,31,'2026-09-06','present');
INSERT INTO attendance VALUES(69,3,19,'2026-09-06','present');
INSERT INTO attendance VALUES(71,1,1,'2026-09-07','present');
INSERT INTO attendance VALUES(72,1,2,'2026-09-07','present');
INSERT INTO attendance VALUES(73,1,6,'2026-09-07','present');
INSERT INTO attendance VALUES(74,1,7,'2026-09-07','present');
INSERT INTO attendance VALUES(75,1,4,'2026-09-07','present');
INSERT INTO attendance VALUES(76,2,9,'2026-09-08','present');
INSERT INTO attendance VALUES(77,2,12,'2026-09-08','present');
INSERT INTO attendance VALUES(78,2,11,'2026-09-08','present');
INSERT INTO attendance VALUES(79,2,17,'2026-09-08','present');
INSERT INTO attendance VALUES(80,2,24,'2026-09-08','present');
INSERT INTO attendance VALUES(81,2,3,'2026-09-08','present');
INSERT INTO attendance VALUES(82,2,18,'2026-09-08','present');
INSERT INTO attendance VALUES(83,2,5,'2026-09-08','present');
INSERT INTO attendance VALUES(84,3,19,'2026-09-10','present');
INSERT INTO attendance VALUES(85,3,29,'2026-09-10','present');
INSERT INTO attendance VALUES(87,3,26,'2026-09-10','present');
INSERT INTO attendance VALUES(88,3,31,'2026-09-10','present');
INSERT INTO attendance VALUES(89,2,3,'2026-09-11','present');
INSERT INTO attendance VALUES(90,2,9,'2026-09-11','present');
INSERT INTO attendance VALUES(91,2,11,'2026-09-11','present');
INSERT INTO attendance VALUES(92,2,12,'2026-09-11','present');
INSERT INTO attendance VALUES(93,2,24,'2026-09-11','present');
INSERT INTO attendance VALUES(94,2,9,'2026-09-15','present');
INSERT INTO attendance VALUES(95,2,11,'2026-09-15','present');
INSERT INTO attendance VALUES(96,2,24,'2026-09-15','present');
INSERT INTO attendance VALUES(97,2,11,'2026-09-18','present');
INSERT INTO attendance VALUES(98,2,3,'2026-09-18','present');
INSERT INTO attendance VALUES(99,2,9,'2026-09-18','present');
INSERT INTO attendance VALUES(100,2,12,'2026-09-18','present');
INSERT INTO attendance VALUES(101,1,2,'2026-09-13','present');
INSERT INTO attendance VALUES(102,1,6,'2026-09-13','present');
INSERT INTO attendance VALUES(103,1,4,'2026-09-13','present');
INSERT INTO attendance VALUES(104,1,1,'2026-09-13','present');
INSERT INTO attendance VALUES(105,1,1,'2026-09-20','present');
INSERT INTO attendance VALUES(106,1,4,'2026-09-20','present');
INSERT INTO attendance VALUES(107,1,7,'2026-09-20','present');
INSERT INTO attendance VALUES(108,1,2,'2026-09-20','present');
INSERT INTO attendance VALUES(109,1,14,'2026-09-20','present');
INSERT INTO attendance VALUES(111,3,28,'2026-09-20','present');
INSERT INTO attendance VALUES(113,3,19,'2026-09-20','present');
INSERT INTO attendance VALUES(114,3,25,'2026-09-20','present');
INSERT INTO attendance VALUES(115,3,29,'2026-09-20','present');
INSERT INTO attendance VALUES(116,3,26,'2026-09-20','present');
INSERT INTO attendance VALUES(117,3,30,'2026-09-20','present');
INSERT INTO attendance VALUES(118,3,27,'2026-09-20','present');
INSERT INTO attendance VALUES(119,3,24,'2026-09-20','present');
INSERT INTO attendance VALUES(120,1,27,'2026-09-14','present');
INSERT INTO attendance VALUES(121,1,30,'2026-09-14','present');
INSERT INTO attendance VALUES(122,1,1,'2026-09-14','present');
INSERT INTO attendance VALUES(123,1,14,'2026-09-14','present');
INSERT INTO attendance VALUES(124,1,7,'2026-09-14','present');
INSERT INTO attendance VALUES(125,1,2,'2026-09-14','present');
INSERT INTO attendance VALUES(126,1,6,'2026-09-14','present');
INSERT INTO attendance VALUES(127,1,3,'2026-09-14','present');
INSERT INTO attendance VALUES(128,4,22,'2026-09-11','present');
INSERT INTO attendance VALUES(129,4,10,'2026-09-11','present');
INSERT INTO attendance VALUES(130,4,23,'2026-09-11','present');
INSERT INTO attendance VALUES(131,4,20,'2026-09-11','present');
INSERT INTO attendance VALUES(132,4,21,'2026-09-11','present');
INSERT INTO attendance VALUES(133,4,17,'2026-09-11','present');
INSERT INTO attendance VALUES(134,4,21,'2026-09-12','present');
INSERT INTO attendance VALUES(135,4,10,'2026-09-12','present');
INSERT INTO attendance VALUES(136,4,22,'2026-09-12','present');
INSERT INTO attendance VALUES(137,4,17,'2026-09-12','present');
INSERT INTO attendance VALUES(138,4,23,'2026-09-12','present');
INSERT INTO attendance VALUES(139,4,20,'2026-09-12','present');
INSERT INTO attendance VALUES(140,4,10,'2026-09-18','present');
INSERT INTO attendance VALUES(141,4,21,'2026-09-18','present');
INSERT INTO attendance VALUES(142,4,22,'2026-09-18','present');
INSERT INTO attendance VALUES(143,4,17,'2026-09-18','present');
INSERT INTO attendance VALUES(144,4,23,'2026-09-18','present');
INSERT INTO attendance VALUES(145,4,20,'2026-09-18','present');
INSERT INTO attendance VALUES(146,4,10,'2026-09-19','present');
INSERT INTO attendance VALUES(147,4,21,'2026-09-19','present');
INSERT INTO attendance VALUES(148,4,22,'2026-09-19','present');
INSERT INTO attendance VALUES(149,4,23,'2026-09-19','present');
INSERT INTO attendance VALUES(150,4,17,'2026-09-19','present');
INSERT INTO attendance VALUES(151,4,20,'2026-09-19','present');
INSERT INTO attendance VALUES(152,3,26,'2026-09-13','present');
INSERT INTO attendance VALUES(153,3,29,'2026-09-13','present');
INSERT INTO attendance VALUES(154,3,30,'2026-09-13','present');
INSERT INTO attendance VALUES(155,3,31,'2026-09-13','present');
INSERT INTO attendance VALUES(156,3,19,'2026-09-13','present');
INSERT INTO attendance VALUES(157,3,26,'2026-09-17','present');
INSERT INTO attendance VALUES(158,3,29,'2026-09-17','present');
INSERT INTO attendance VALUES(159,3,31,'2026-09-17','present');
INSERT INTO attendance VALUES(160,3,19,'2026-09-17','present');
INSERT INTO attendance VALUES(161,5,26,'2026-09-19','present');
INSERT INTO attendance VALUES(162,5,29,'2026-09-19','present');
INSERT INTO attendance VALUES(163,5,28,'2026-09-19','present');
INSERT INTO attendance VALUES(164,5,25,'2026-09-19','present');
INSERT INTO attendance VALUES(165,5,24,'2026-09-19','present');
INSERT INTO attendance VALUES(166,5,22,'2026-09-19','present');
INSERT INTO attendance VALUES(167,5,27,'2026-09-19','present');
INSERT INTO attendance VALUES(168,5,21,'2026-09-19','present');
INSERT INTO attendance VALUES(169,8,33,'2026-09-20','present');
INSERT INTO attendance VALUES(170,8,32,'2026-09-20','present');
INSERT INTO attendance VALUES(171,8,34,'2026-09-20','present');
INSERT INTO attendance VALUES(172,8,35,'2026-09-20','present');
INSERT INTO attendance VALUES(173,1,6,'2026-09-20','present');
INSERT INTO attendance VALUES(174,4,2,'2026-09-22','absent');
INSERT INTO attendance VALUES(175,4,24,'2026-09-22','absent');
INSERT INTO attendance VALUES(179,2,9,'2026-09-22','present');
INSERT INTO attendance VALUES(180,2,11,'2026-09-22','present');
INSERT INTO attendance VALUES(181,2,24,'2026-09-22','present');
CREATE TABLE invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_code TEXT UNIQUE,
      student_id INTEGER,
      amount INTEGER,
      status TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
INSERT INTO invoices VALUES(1,'INV-2026-2551',1,400000,'pending','2026-07-22 12:28:04');
INSERT INTO invoices VALUES(2,'INV-2026-3253',1,2000000,'pending','2026-07-22 13:00:58');
INSERT INTO invoices VALUES(3,'INV-2026-1214',1,100000,'paid','2026-07-22 13:17:10');
CREATE TABLE teachers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      role INTEGER NOT NULL,
      phone TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO teachers VALUES(1,'Phan ─É├¼nh Ph├ít',1,'0392082052','2026-08-30 01:30:33');
INSERT INTO teachers VALUES(2,'Trß║ºn Thß╗ï Ph╞░╞íng Nhi',1,'0966207605','2026-08-30 01:30:42');
INSERT INTO teachers VALUES(3,'─Éß║╖ng Ho├áng Ngh─⌐a',1,'1234567890','2026-08-30 01:30:49');
INSERT INTO teachers VALUES(4,'Nguyß╗àn ─É─âng Ph├ít',1,'0378267948','2026-08-30 01:30:55');
INSERT INTO teachers VALUES(5,'Phan Thß╗ï Hß╗ông Quß╗│nh',1,'0352299485','2026-08-30 01:31:02');
INSERT INTO teachers VALUES(6,'Nhß╗» Thß╗ï Kh├ính Linh',1,'0347105357','2026-09-08 11:31:38');
CREATE TABLE teacher_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INTEGER,
      teacher_name TEXT,
      role TEXT,
      date TEXT,
      status TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id),
      UNIQUE(class_id, role, date)
    );
DELETE FROM ignore_sqlite_sequence;
INSERT INTO ignore_sqlite_sequence VALUES('classes',8);
INSERT INTO ignore_sqlite_sequence VALUES('students',35);
INSERT INTO ignore_sqlite_sequence VALUES('class_students',60);
INSERT INTO ignore_sqlite_sequence VALUES('invoices',3);
INSERT INTO ignore_sqlite_sequence VALUES('attendance',181);
INSERT INTO ignore_sqlite_sequence VALUES('teachers',6);
COMMIT; SET FOREIGN_KEY_CHECKS=1;
