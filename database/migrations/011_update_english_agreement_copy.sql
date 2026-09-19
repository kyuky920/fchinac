USE fchinac_dev;
SET NAMES utf8mb4;

INSERT INTO site_translations (locale_code, message_key, value)
VALUES ('en', 'home.about.5', 'Concluded agreement with the U.S. Puritan Reformed University.')
ON DUPLICATE KEY UPDATE value=VALUES(value);
