USE fchinac_dev;
SET NAMES utf8mb4;

UPDATE locales
SET fallback_code='en'
WHERE code NOT IN ('ko', 'en');
