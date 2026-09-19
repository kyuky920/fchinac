USE fchinac_dev;
SET NAMES utf8mb4;

ALTER TABLE locales
    ADD COLUMN IF NOT EXISTS flag_emoji VARCHAR(16) NULL AFTER native_name,
    ADD COLUMN IF NOT EXISTS fallback_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER flag_emoji,
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE AFTER is_active,
    ADD COLUMN IF NOT EXISTS created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER sort_order,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) AFTER created_at;

UPDATE locales SET flag_emoji='🇰🇷', is_default=TRUE WHERE code='ko';
UPDATE locales SET flag_emoji='🇺🇸', fallback_code='ko' WHERE code='en';
UPDATE locales SET flag_emoji='🇨🇳', fallback_code='ko' WHERE code='zh-CN';
UPDATE locales SET flag_emoji='🇲🇳', fallback_code='ko' WHERE code='mn';
UPDATE locales SET flag_emoji='🇪🇸', fallback_code='ko' WHERE code='es';

CREATE TABLE IF NOT EXISTS site_translations (
    locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    message_key VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    value LONGTEXT NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (locale_code, message_key),
    KEY ix_site_translations_key (message_key, locale_code),
    CONSTRAINT fk_site_translations_locale FOREIGN KEY (locale_code) REFERENCES locales(code) ON DELETE CASCADE,
    CONSTRAINT fk_site_translations_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_translations (locale_code, message_key, value) VALUES
('ko','menu.about','선교회 소개'),('ko','menu.professors','교수 소개'),('ko','menu.membership','가입안내'),('ko','menu.lectures','동영상강의'),('ko','menu.resources','서적과 자료'),
('en','menu.about','About Us'),('en','menu.professors','Professors'),('en','menu.membership','Membership'),('en','menu.lectures','Video Lectures'),('en','menu.resources','Books & Resources'),
('zh-CN','menu.about','宣教会介绍'),('zh-CN','menu.professors','教授介绍'),('zh-CN','menu.membership','加入指南'),('zh-CN','menu.lectures','视频讲座'),('zh-CN','menu.resources','书籍与资料'),
('mn','menu.about','Танилцуулга'),('mn','menu.professors','Багш нар'),('mn','menu.membership','Гишүүнчлэл'),('mn','menu.lectures','Видео хичээл'),('mn','menu.resources','Ном ба материал'),
('es','menu.about','Quiénes somos'),('es','menu.professors','Profesores'),('es','menu.membership','Membresía'),('es','menu.lectures','Videoclases'),('es','menu.resources','Libros y recursos')
ON DUPLICATE KEY UPDATE value=VALUES(value);
