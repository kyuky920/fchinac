USE fchinac_dev;
SET NAMES utf8mb4;

INSERT INTO site_translations (locale_code, message_key, value)
VALUES
  ('ko', 'common.address', '경기도 용인시 수지구 대지로3번길 31-1, 죽전리베니움 102동 302호'),
  ('en', 'common.address', 'Unit 302, Building 102, Jukjeon Ribenium, 31-1 Daeji-ro 3beon-gil, Suji-gu, Yongin-si, Gyeonggi-do, Republic of Korea'),
  ('zh-CN', 'common.address', '韩国京畿道龙仁市水枝区大地路3街31-1，竹田Ribenium 102栋302号'),
  ('ko', 'about.signer', '회장 박황우 박사'),
  ('en', 'about.signer', 'President Dr. Hwang-Woo Park'),
  ('zh-CN', 'about.signer', '会长 朴滉雨 博士'),
  ('mn', 'about.signer', 'Тэргүүн Dr. Hwang-Woo Park'),
  ('es', 'about.signer', 'Presidente Dr. Hwang-Woo Park')
ON DUPLICATE KEY UPDATE value=VALUES(value);
