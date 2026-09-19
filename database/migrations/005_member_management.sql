USE fchinac_dev;
SET NAMES utf8mb4;

ALTER TABLE user_consents
    ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE AFTER user_id,
    ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE AFTER terms_accepted;

CREATE TABLE IF NOT EXISTS user_audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT UNSIGNED NULL,
    target_user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    details JSON NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    KEY ix_user_audit_target_created (target_user_id, created_at),
    KEY ix_user_audit_actor_created (actor_user_id, created_at),
    CONSTRAINT fk_user_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_audit_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS ix_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS ix_users_last_login ON users(last_login_at);
