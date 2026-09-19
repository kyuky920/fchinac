-- fchinac renewed site schema
-- Target: MariaDB 11.4+, InnoDB, utf8mb4

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS locales (
    code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    native_name VARCHAR(80) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(26) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(254) NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_scheme VARCHAR(32) NOT NULL DEFAULT 'bcrypt',
    display_name VARCHAR(100) NOT NULL,
    preferred_locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'ko',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified_at DATETIME(3) NULL,
    last_login_at DATETIME(3) NULL,
    password_changed_at DATETIME(3) NULL,
    joined_at DATETIME(3) NOT NULL,
    withdrawn_at DATETIME(3) NULL,
    blocked_at DATETIME(3) NULL,
    legacy_member_no INT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_users_public_id (public_id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_legacy_member_no (legacy_member_no),
    KEY ix_users_status_created (status, created_at),
    CONSTRAINT fk_users_locale FOREIGN KEY (preferred_locale_code) REFERENCES locales(code),
    CONSTRAINT ck_users_status CHECK (status IN ('pending', 'active', 'blocked', 'withdrawn')),
    CONSTRAINT ck_users_password_scheme CHECK (password_scheme IN ('bcrypt', 'argon2id', 'mysql41', 'reset_required'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS member_profiles (
    user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    full_name VARCHAR(100) NULL,
    nickname VARCHAR(100) NULL,
    gender VARCHAR(20) NULL,
    birth_date DATE NULL,
    mobile_phone VARCHAR(40) NULL,
    telephone VARCHAR(40) NULL,
    postal_code VARCHAR(20) NULL,
    address_line1 VARCHAR(255) NULL,
    address_line2 VARCHAR(255) NULL,
    address_line3 VARCHAR(255) NULL,
    homepage_url VARCHAR(500) NULL,
    biography TEXT NULL,
    signature TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_member_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_consents (
    user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    email_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    sms_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    profile_public BOOLEAN NOT NULL DEFAULT FALSE,
    consented_at DATETIME(3) NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_user_consents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_key VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(255) NULL,
    UNIQUE KEY uq_roles_key (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id SMALLINT UNSIGNED NOT NULL,
    granted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    granted_by BIGINT UNSIGNED NULL,
    PRIMARY KEY (user_id, role_id),
    KEY ix_user_roles_role (role_id, user_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS board_groups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_board_groups_key (group_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS board_group_translations (
    board_group_id BIGINT UNSIGNED NOT NULL,
    locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (board_group_id, locale_code),
    CONSTRAINT fk_board_group_i18n_group FOREIGN KEY (board_group_id) REFERENCES board_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_group_i18n_locale FOREIGN KEY (locale_code) REFERENCES locales(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS boards (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    board_group_id BIGINT UNSIGNED NULL,
    board_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    default_locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'ko',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    max_attachments SMALLINT UNSIGNED NOT NULL DEFAULT 5,
    max_attachment_bytes BIGINT UNSIGNED NOT NULL DEFAULT 10485760,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_boards_key (board_key),
    KEY ix_boards_group_sort (board_group_id, sort_order),
    CONSTRAINT fk_boards_group FOREIGN KEY (board_group_id) REFERENCES board_groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_boards_locale FOREIGN KEY (default_locale_code) REFERENCES locales(code),
    CONSTRAINT ck_boards_status CHECK (status IN ('active', 'archived', 'hidden')),
    CONSTRAINT ck_boards_visibility CHECK (visibility IN ('public', 'member', 'private'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS board_translations (
    board_id BIGINT UNSIGNED NOT NULL,
    locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (board_id, locale_code),
    CONSTRAINT fk_board_i18n_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_i18n_locale FOREIGN KEY (locale_code) REFERENCES locales(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS board_role_permissions (
    board_id BIGINT UNSIGNED NOT NULL,
    role_id SMALLINT UNSIGNED NOT NULL,
    can_list BOOLEAN NOT NULL DEFAULT FALSE,
    can_read BOOLEAN NOT NULL DEFAULT FALSE,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_comment BOOLEAN NOT NULL DEFAULT FALSE,
    can_upload BOOLEAN NOT NULL DEFAULT FALSE,
    can_download BOOLEAN NOT NULL DEFAULT FALSE,
    can_moderate BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (board_id, role_id),
    CONSTRAINT fk_board_permissions_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    board_id BIGINT UNSIGNED NOT NULL,
    category_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_categories_board_key (board_id, category_key),
    CONSTRAINT fk_categories_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_translations (
    category_id BIGINT UNSIGNED NOT NULL,
    locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (category_id, locale_code),
    CONSTRAINT fk_category_i18n_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_category_i18n_locale FOREIGN KEY (locale_code) REFERENCES locales(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(26) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    board_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NULL,
    author_user_id BIGINT UNSIGNED NULL,
    parent_post_id BIGINT UNSIGNED NULL,
    guest_name VARCHAR(100) NULL,
    guest_password_hash VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    view_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    like_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    dislike_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_ip_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    published_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    legacy_board_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    legacy_write_id INT NULL,
    UNIQUE KEY uq_posts_public_id (public_id),
    UNIQUE KEY uq_posts_legacy (legacy_board_key, legacy_write_id),
    KEY ix_posts_board_feed (board_id, status, is_pinned, published_at, id),
    KEY ix_posts_author (author_user_id, created_at),
    KEY ix_posts_parent (parent_post_id),
    KEY ix_posts_category (category_id, published_at),
    CONSTRAINT fk_posts_board FOREIGN KEY (board_id) REFERENCES boards(id),
    CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_parent FOREIGN KEY (parent_post_id) REFERENCES posts(id) ON DELETE SET NULL,
    CONSTRAINT ck_posts_status CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
    CONSTRAINT ck_posts_visibility CHECK (visibility IN ('public', 'member', 'private'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_translations (
    post_id BIGINT UNSIGNED NOT NULL,
    locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT NULL,
    body LONGTEXT NOT NULL,
    body_format VARCHAR(20) NOT NULL DEFAULT 'html',
    translation_status VARCHAR(20) NOT NULL DEFAULT 'original',
    translated_by BIGINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (post_id, locale_code),
    KEY ix_post_i18n_locale (locale_code, updated_at),
    CONSTRAINT fk_post_i18n_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_i18n_locale FOREIGN KEY (locale_code) REFERENCES locales(code),
    CONSTRAINT fk_post_i18n_translator FOREIGN KEY (translated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_post_i18n_format CHECK (body_format IN ('html', 'markdown', 'plain')),
    CONSTRAINT ck_post_i18n_status CHECK (translation_status IN ('original', 'draft', 'review', 'published'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(26) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    post_id BIGINT UNSIGNED NOT NULL,
    parent_comment_id BIGINT UNSIGNED NULL,
    author_user_id BIGINT UNSIGNED NULL,
    locale_code VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'ko',
    guest_name VARCHAR(100) NULL,
    guest_password_hash VARCHAR(255) NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    created_ip_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    legacy_board_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    legacy_write_id INT NULL,
    UNIQUE KEY uq_comments_public_id (public_id),
    UNIQUE KEY uq_comments_legacy (legacy_board_key, legacy_write_id),
    KEY ix_comments_post (post_id, status, created_at, id),
    KEY ix_comments_parent (parent_comment_id),
    KEY ix_comments_author (author_user_id, created_at),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_comments_locale FOREIGN KEY (locale_code) REFERENCES locales(code),
    CONSTRAINT ck_comments_status CHECK (status IN ('published', 'hidden', 'deleted'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attachments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(26) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    post_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    storage_provider VARCHAR(20) NOT NULL DEFAULT 'local',
    storage_key VARCHAR(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    extension VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL,
    mime_type VARCHAR(150) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
    size_bytes BIGINT UNSIGNED NOT NULL,
    checksum_sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    width_px INT UNSIGNED NULL,
    height_px INT UNSIGNED NULL,
    caption VARCHAR(500) NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    download_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    legacy_board_key VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    legacy_write_id INT NULL,
    legacy_file_no SMALLINT NULL,
    UNIQUE KEY uq_attachments_public_id (public_id),
    UNIQUE KEY uq_attachments_storage_key (storage_key),
    UNIQUE KEY uq_attachments_legacy (legacy_board_key, legacy_write_id, legacy_file_no),
    KEY ix_attachments_post_sort (post_id, sort_order, id),
    CONSTRAINT fk_attachments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachments_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_attachments_provider CHECK (storage_provider IN ('local', 's3', 'r2'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_embeds (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_key VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NULL,
    source_url VARCHAR(1000) NOT NULL,
    title VARCHAR(500) NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    KEY ix_media_embeds_post_sort (post_id, sort_order, id),
    CONSTRAINT fk_media_embeds_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT ck_media_embeds_provider CHECK (provider IN ('youtube', 'vimeo', 'external'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS migration_map (
    source_table VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    source_key VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    target_table VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    target_id BIGINT UNSIGNED NOT NULL,
    migrated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (source_table, source_key),
    KEY ix_migration_map_target (target_table, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS migration_issues (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(60) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    source_table VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    source_key VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning',
    details JSON NULL,
    resolved_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    KEY ix_migration_issues_open (resolved_at, severity, issue_type),
    CONSTRAINT ck_migration_issues_severity CHECK (severity IN ('info', 'warning', 'error'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO locales (code, name, native_name, is_active, sort_order) VALUES
    ('ko', 'Korean', '한국어', TRUE, 10),
    ('en', 'English', 'English', TRUE, 20),
    ('zh-CN', 'Simplified Chinese', '简体中文', TRUE, 30),
    ('mn', 'Mongolian', 'Монгол', TRUE, 40),
    ('es', 'Spanish', 'Español', TRUE, 50)
ON DUPLICATE KEY UPDATE
    name = VALUES(name), native_name = VALUES(native_name), is_active = VALUES(is_active), sort_order = VALUES(sort_order);

INSERT INTO roles (role_key, name, description) VALUES
    ('guest', 'Guest', 'Unauthenticated visitor policy'),
    ('restricted', 'Restricted', 'Withdrawn or restricted legacy member'),
    ('member', 'Member', 'Authenticated member'),
    ('editor', 'Editor', 'Content editor and board manager'),
    ('admin', 'Administrator', 'Site administrator')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
