USE fchinac_dev;
SET NAMES utf8mb4;

-- Preserve the ten-language selector from the legacy multi_lang table while
-- using standard BCP 47 language codes in the renewed application.
INSERT INTO locales
  (code, name, native_name, flag_emoji, fallback_code, is_active, is_default, sort_order)
VALUES
  ('ko',    'Korean',             '한국어',       '🇰🇷', NULL, TRUE, TRUE,  10),
  ('zh-CN', 'Simplified Chinese', '中国语',       '🇨🇳', 'ko', TRUE, FALSE, 20),
  ('mn',    'Mongolian',          'Монгол хэл', '🇲🇳', 'ko', TRUE, FALSE, 30),
  ('es',    'Spanish',            'Español',     '🇪🇸', 'ko', TRUE, FALSE, 40),
  ('en',    'English',            'English',     '🇺🇸', 'ko', TRUE, FALSE, 50),
  ('ru',    'Russian',            'русский',     '🇷🇺', 'en', TRUE, FALSE, 60),
  ('fr',    'French',             'Français',    '🇫🇷', 'en', TRUE, FALSE, 70),
  ('pt',    'Portuguese',         'Portugal',    '🇵🇹', 'en', TRUE, FALSE, 80),
  ('tl',    'Tagalog',            'Tagalog',     '🇵🇭', 'en', TRUE, FALSE, 90),
  ('sw',    'Swahili',            'Swahili',     '🇹🇿', 'en', TRUE, FALSE, 100)
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  native_name=VALUES(native_name),
  flag_emoji=VALUES(flag_emoji),
  fallback_code=VALUES(fallback_code),
  is_active=VALUES(is_active),
  is_default=VALUES(is_default),
  sort_order=VALUES(sort_order);
