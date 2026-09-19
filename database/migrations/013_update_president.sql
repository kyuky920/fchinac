USE fchinac_dev;
SET NAMES utf8mb4;

INSERT INTO site_translations (locale_code, message_key, value)
VALUES
  ('ko', 'about.signer', '회장 김재현 박사'),
  ('en', 'about.signer', 'President Dr. Jae-Hyun Kim'),
  ('zh-CN', 'about.signer', '会长 金在贤 博士'),
  ('mn', 'about.signer', 'Тэргүүн Dr. Jae-Hyun Kim'),
  ('es', 'about.signer', 'Presidente Dr. Jae-Hyun Kim')
ON DUPLICATE KEY UPDATE value=VALUES(value);
