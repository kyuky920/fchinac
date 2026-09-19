USE fchinac_dev;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS lecture_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_lecture_categories_key (category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lecture_category_translations (
  category_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(150) NOT NULL,
  PRIMARY KEY (category_id, locale_code),
  CONSTRAINT fk_lecture_category_i18n_category FOREIGN KEY (category_id) REFERENCES lecture_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_lecture_category_i18n_locale FOREIGN KEY (locale_code) REFERENCES locales(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lecture_courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id CHAR(26) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  course_code VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  youtube_playlist_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_lecture_courses_public_id (public_id),
  UNIQUE KEY uq_lecture_courses_code (course_code),
  KEY ix_lecture_courses_category_sort (category_id, sort_order, id),
  CONSTRAINT fk_lecture_courses_category FOREIGN KEY (category_id) REFERENCES lecture_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lecture_course_translations (
  course_id BIGINT UNSIGNED NOT NULL,
  locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(200) NOT NULL,
  PRIMARY KEY (course_id, locale_code),
  CONSTRAINT fk_lecture_course_i18n_course FOREIGN KEY (course_id) REFERENCES lecture_courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_lecture_course_i18n_locale FOREIGN KEY (locale_code) REFERENCES locales(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lecture_lessons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id CHAR(26) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_number SMALLINT UNSIGNED NOT NULL,
  youtube_video_id VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL,
  title VARCHAR(250) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_lecture_lessons_public_id (public_id),
  UNIQUE KEY uq_lecture_lessons_course_number (course_id, lesson_number),
  KEY ix_lecture_lessons_course_sort (course_id, sort_order, id),
  CONSTRAINT fk_lecture_lessons_course FOREIGN KEY (course_id) REFERENCES lecture_courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED NULL,
  entity_type VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  entity_key VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  action VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  details JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY ix_admin_audit_entity (entity_type, entity_key, created_at),
  KEY ix_admin_audit_actor (actor_user_id, created_at),
  CONSTRAINT fk_admin_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO lecture_categories (category_key, sort_order) VALUES
('guyak',0),('sinyak',1),('yuksa',2),('jojik',3),('silchun',4),('sungyo',5);

INSERT INTO lecture_category_translations (category_id,locale_code,name)
SELECT id,'ko',CASE category_key WHEN 'guyak' THEN '구약신학' WHEN 'sinyak' THEN '신약신학' WHEN 'yuksa' THEN '역사신학' WHEN 'jojik' THEN '조직신학' WHEN 'silchun' THEN '실천신학' ELSE '선교신학' END FROM lecture_categories
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO lecture_category_translations (category_id,locale_code,name)
SELECT id,'zh-CN',CASE category_key WHEN 'guyak' THEN '旧约神学' WHEN 'sinyak' THEN '新约神学' WHEN 'yuksa' THEN '历史神学' WHEN 'jojik' THEN '系统神学' WHEN 'silchun' THEN '实践神学' ELSE '宣教神学' END FROM lecture_categories
ON DUPLICATE KEY UPDATE name=VALUES(name);

CREATE TEMPORARY TABLE lecture_seed (
  course_code VARCHAR(40), category_key VARCHAR(40), sort_order INT,
  playlist_id VARCHAR(100), lesson_count INT, ko_name VARCHAR(200), zh_name VARCHAR(200)
);
INSERT INTO lecture_seed VALUES
('OT4001','guyak',0,'PL5K0l8RAAgIOpbjYBP85UfnlMOJ6OfZ8J',15,'히브리어','希伯来语'),
('OT3003','guyak',1,'PL5K0l8RAAgIOhywazddNaZfSoG9RgveXp',15,'성경신학','圣经神学'),
('OT3005','guyak',2,'PL5K0l8RAAgINAUeK4lpYksFzIF-AbowEl',20,'구약개론','旧约概论'),
('OT1001','guyak',3,'PL5K0l8RAAgIObDE-sQC_Iq--GDdOcMVRn',20,'모세오경Ⅰ(창)','摩西五经Ⅰ(创)'),
('OT1002','guyak',4,'PL5K0l8RAAgIP0qGKm8hGb-zvNT3G8DuSg',20,'모세오경Ⅱ(출)','摩西五经 Ⅱ(出)'),
('OT1003','guyak',5,'PL5K0l8RAAgIPGKpLuWJdjx8d8GIrpq6z7',14,'모세오경Ⅲ(레)','摩西五经 Ⅲ(利)'),
('OT1005','guyak',6,'PL5K0l8RAAgINVPx4Sz7duvWsLvbtbVxM6',20,'모세오경Ⅳ(신)','摩西五经 Ⅳ(申)'),
('OT1006','guyak',7,'PL5K0l8RAAgIOd5bdxU94f6DOPeBsy2yN-',20,'여호수아연구','约书亚记'),
('OT1008','guyak',8,'PL5K0l8RAAgINifUEeWT8Ru07kjYtTnv81',4,'룻기연구','路得记'),
('OT1009','guyak',9,'PL5K0l8RAAgIMo-i26-0nU0h2DTlAj-opf',17,'사무엘상하연구','撒母耳记上下'),
('OT1010','guyak',10,'PL5K0l8RAAgIP9FvN_VGuCk9f04lPcEDLQ',20,'열왕기상하연구','列王纪上下'),
('OT1011','guyak',11,'PL5K0l8RAAgIPpW6riZfB0kS6-GlxHOug-',16,'에스라느헤미야연구','以斯拉尼希米记'),
('OT1012','guyak',12,'PL5K0l8RAAgIMqQ5-oMQBKBNSiIUn4RhVr',15,'시가서연구Ⅰ(시)','诗歌书Ⅰ(诗)'),
('OT1014','guyak',13,'PL5K0l8RAAgIOQry1n4luP1LanNimypXHr',20,'시가서연구Ⅱ(전,아)','诗歌书Ⅱ(传,歌)'),
('OT1015','guyak',14,'PL5K0l8RAAgIPFupAWwjKUGNhJ3Z1tQeuF',16,'대선지서Ⅰ(사)','大先知书Ⅰ(赛)'),
('OT1016','guyak',15,'PL5K0l8RAAgIOTUTNhWx8ijE-7lEK-fHk0',20,'대선지서Ⅱ(렘)','大先知书Ⅱ(耶)'),
('OT1017','guyak',16,'PL5K0l8RAAgIMpnO2nK0VQvRhJojUiqu_u',13,'다니엘연구','但以现书'),
('OT1018','guyak',17,'PL5K0l8RAAgINSUIZBIqX8mqcXZI7jvtwx',18,'소선지서Ⅰ','小先知书Ⅰ'),
('OT1019','guyak',18,'PL5K0l8RAAgIOvCdwBRDeKSkYCo3FAl6nN',11,'소선지서Ⅱ','小先知书Ⅱ'),
('NT4002','sinyak',0,'PL5K0l8RAAgIOjYMEQqrl-LbTCcDDcnDYx',15,'헬라어','希腊语'),
('NT3006','sinyak',1,'PL5K0l8RAAgIPBchLRRumdGEx8xtnLm7sr',20,'신약개론','新约概论'),
('NT3018','sinyak',2,'PL5K0l8RAAgIPHlu8HnRvRRv-3N8T3FdL3',6,'성경해석학','释经学'),
('NT2001','sinyak',3,'PL5K0l8RAAgIMI3snY8yFc5mlIO5tr_T47',20,'공관복음Ⅰ(마)','共观福音Ⅰ(太)'),
('NT2002','sinyak',4,'PL5K0l8RAAgIORzUEbH7xy070cSVSVsQ20',20,'공관복음Ⅱ(눅)','共观福音 Ⅱ(路)'),
('NT2003','sinyak',5,'PL5K0l8RAAgIOJBgrywQjKi1-ozfXUtWvF',19,'요한신학','约翰神学'),
('NT2004','sinyak',6,'PL5K0l8RAAgIOr0VmPVAxUeyt03QrQPc8W',20,'사도행전연구','使徒行传'),
('NT2005','sinyak',7,'PL5K0l8RAAgIO8_p6aqP-HBG1o_8gk-FTu',16,'바울신학(롬)','保罗神学(罗)'),
('NT2006','sinyak',8,'PL5K0l8RAAgIMyXxx5l1X4W8kdeCGaL9_A',22,'고린도전후서연구','哥林多前后书'),
('NT2007','sinyak',9,'PL5K0l8RAAgIN411NAwVyOMS0zx46Vdi6q',6,'갈라디아서연구','加拉太书'),
('NT2008','sinyak',10,'PL5K0l8RAAgINWst-bSuly6qo5hMxydYWW',18,'옥중서신','狱中书信'),
('NT2009','sinyak',11,'PL5K0l8RAAgIOJfcZRUacMebgpj01f3v6A',6,'바울서신(살전후)','保罗书信(帖前后)'),
('NT2010','sinyak',12,'PL5K0l8RAAgIMQeCo9gksCxmEvji5E8cN1',14,'목회서신(딤전후)','教牧书信(提前后)'),
('NT2011','sinyak',13,'PL5K0l8RAAgIOurXi49SG1UVbsPZT7LfMm',14,'히브리서연구','希伯来书'),
('NT2012','sinyak',14,'PL5K0l8RAAgIO6OPFtxHB4aCeQBipEz1Yh',5,'공동서신Ⅰ(약)','普通书信Ⅰ(雅)'),
('NT2013','sinyak',15,'PL5K0l8RAAgIPH3biYVOSb-lQAkloxtrbq',12,'공동서신Ⅱ(벧전후)','普通书信Ⅱ(彼前后)'),
('NT2014','sinyak',16,'PL5K0l8RAAgIOGoFKYiqiPbnI4Ea4UtUs8',9,'공동서신Ⅲ(요일이삼)','普通书信Ⅲ(约一二三)'),
('NT2015','sinyak',17,'PL5K0l8RAAgIOCi-SJ2_m3PMcuE0eHfpRA',2,'유다서연구','犹大书'),
('NT2016','sinyak',18,'PL5K0l8RAAgIO2KC_26o1nymn30uc5Ai1_',18,'요한계시록연구','约翰启示录'),
('CH3002','yuksa',0,'PL5K0l8RAAgIOBlh7h4tQrkeZ4aqgcoXUb',20,'교회사','教会史'),
('ST3001','jojik',0,'PL5K0l8RAAgIO7zypEqdb7d0ynqAbPZDj1',20,'조직신학','系统神学'),
('ST3010','jojik',1,'PL5K0l8RAAgIM0LyoxcqoIVfta74Nczbbb',9,'기독교윤리','基督教伦理'),
('ST3012','jojik',2,'PL5K0l8RAAgIN6Jkng651PzYxRwSGPSXfx',9,'현대신학비판','现代神学批判'),
('PT3007','silchun',0,'PL5K0l8RAAgINyCBn0wPsLlBXcgeoSv1Hz',7,'교회정치(헌법)','教会行政(宪法)'),
('PT3008','silchun',1,'PL5K0l8RAAgIMKI-peSA6aZUvSgtAANqLM',8,'목회학','教牧学'),
('PT3011','silchun',2,'PL5K0l8RAAgIMqc7-6GDQHwzobKB1yBlk_',14,'설교학','讲道学'),
('MT3013','silchun',3,'PL5K0l8RAAgINOQ1_EDAccc45j1AvGJWjP',6,'전도학','传道学'),
('MT3009','sungyo',0,'PL5K0l8RAAgIN7LjepXJddW_qKmWc6IZQX',8,'비교종교학','比較宗教学'),
('MT3017','sungyo',1,'PL5K0l8RAAgIOBO1rwNn29XS4avUOIXPUP',9,'선교학','宣教学');

INSERT INTO lecture_courses (public_id,course_code,category_id,youtube_playlist_id,sort_order)
SELECT UPPER(SUBSTRING(SHA2(CONCAT('lecture-course:',s.course_code),256),1,26)),s.course_code,c.id,s.playlist_id,s.sort_order
FROM lecture_seed s JOIN lecture_categories c ON c.category_key=s.category_key
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id),youtube_playlist_id=VALUES(youtube_playlist_id),sort_order=VALUES(sort_order);

INSERT INTO lecture_course_translations (course_id,locale_code,name)
SELECT c.id,'ko',s.ko_name FROM lecture_seed s JOIN lecture_courses c ON c.course_code=s.course_code
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO lecture_course_translations (course_id,locale_code,name)
SELECT c.id,'zh-CN',s.zh_name FROM lecture_seed s JOIN lecture_courses c ON c.course_code=s.course_code
ON DUPLICATE KEY UPDATE name=VALUES(name);

CREATE TEMPORARY TABLE lecture_numbers (n INT PRIMARY KEY);
INSERT INTO lecture_numbers VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22);
INSERT INTO lecture_lessons (public_id,course_id,lesson_number,sort_order,is_visible,is_available)
SELECT UPPER(SUBSTRING(SHA2(CONCAT('lecture-lesson:',s.course_code,':',n.n),256),1,26)),c.id,n.n,n.n,
       NOT ((s.course_code='OT3005' AND n.n IN (2,5,7,17)) OR (s.course_code='ST3012' AND n.n IN (3,6,8))),
       NOT ((s.course_code='CH3002' AND n.n>17) OR (s.course_code='NT2014' AND n.n>6))
FROM lecture_seed s JOIN lecture_courses c ON c.course_code=s.course_code JOIN lecture_numbers n ON n.n<=s.lesson_count
ON DUPLICATE KEY UPDATE sort_order=VALUES(sort_order),is_visible=VALUES(is_visible),is_available=VALUES(is_available);

DROP TEMPORARY TABLE lecture_numbers;
DROP TEMPORARY TABLE lecture_seed;
