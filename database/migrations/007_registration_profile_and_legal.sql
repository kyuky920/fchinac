USE fchinac_dev;
SET NAMES utf8mb4;

ALTER TABLE member_profiles
    ADD COLUMN IF NOT EXISTS residence_country VARCHAR(100) NULL AFTER gender;

ALTER TABLE user_consents
    ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN NOT NULL DEFAULT FALSE AFTER privacy_accepted,
    ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER profile_public,
    ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER terms_version;
