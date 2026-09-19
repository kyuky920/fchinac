USE fchinac_dev;
SET NAMES utf8mb4;

-- New languages use English until administrators register translated strings.
INSERT INTO locales
  (code, name, native_name, flag_emoji, fallback_code, is_active, is_default, sort_order)
VALUES
  ('ar', 'Arabic',     'العربية',    '🇸🇦', 'en', TRUE, FALSE, 110),
  ('fa', 'Persian',    'فارسی',      '🇮🇷', 'en', TRUE, FALSE, 120),
  ('ne', 'Nepali',     'नेपाली',      '🇳🇵', 'en', TRUE, FALSE, 130),
  ('th', 'Thai',       'ไทย',        '🇹🇭', 'en', TRUE, FALSE, 140),
  ('vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳', 'en', TRUE, FALSE, 150)
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  native_name=VALUES(native_name),
  flag_emoji=VALUES(flag_emoji),
  fallback_code=VALUES(fallback_code),
  is_active=VALUES(is_active),
  is_default=VALUES(is_default),
  sort_order=VALUES(sort_order);
