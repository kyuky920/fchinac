-- Initial repeatable migration from legacy_import into fchinac_dev.
-- The legacy database is read only. Existing rows carrying legacy identifiers
-- are rebuilt so this migration can be safely rerun during development.

USE fchinac_dev;
SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

DELETE FROM migration_map;
DELETE FROM migration_issues;
DELETE FROM attachments WHERE legacy_board_key IS NOT NULL;
DELETE FROM comments WHERE legacy_board_key IS NOT NULL;
DELETE FROM posts WHERE legacy_board_key IS NOT NULL;
DELETE b FROM boards b JOIN legacy_import.g5_board lb ON lb.bo_table = b.board_key;
DELETE bg FROM board_groups bg JOIN legacy_import.g5_group lg ON lg.gr_id = bg.group_key;
DELETE FROM users WHERE legacy_member_no IS NOT NULL;

INSERT INTO users (
    public_id, username, email, password_hash, password_scheme, display_name,
    preferred_locale_code, status, email_verified_at, last_login_at,
    joined_at, withdrawn_at, blocked_at, legacy_member_no
)
SELECT
    UPPER(SUBSTRING(SHA2(CONCAT('legacy-user:', m.mb_no), 256), 1, 26)),
    m.mb_id,
    NULLIF(LOWER(TRIM(m.mb_email)), ''),
    m.mb_password,
    CASE
        WHEN m.mb_password REGEXP '^\\*[0-9A-Fa-f]{40}$' THEN 'mysql41'
        WHEN m.mb_password REGEXP '^\\$2[aby]\\$' THEN 'bcrypt'
        ELSE 'reset_required'
    END,
    COALESCE(NULLIF(TRIM(m.mb_nick), ''), NULLIF(TRIM(m.mb_name), ''), m.mb_id),
    'ko',
    CASE
        WHEN m.mb_leave_date <> '' THEN 'withdrawn'
        WHEN m.mb_intercept_date <> '' THEN 'blocked'
        ELSE 'active'
    END,
    NULLIF(m.mb_email_certify, '0000-00-00 00:00:00'),
    NULLIF(m.mb_today_login, '0000-00-00 00:00:00'),
    m.mb_datetime,
    CASE WHEN m.mb_leave_date REGEXP '^[0-9]{8}$' THEN STR_TO_DATE(m.mb_leave_date, '%Y%m%d') ELSE NULL END,
    CASE WHEN m.mb_intercept_date REGEXP '^[0-9]{8}$' THEN STR_TO_DATE(m.mb_intercept_date, '%Y%m%d') ELSE NULL END,
    m.mb_no
FROM legacy_import.g5_member m;

INSERT INTO member_profiles (
    user_id, full_name, nickname, gender, birth_date, mobile_phone, telephone,
    postal_code, address_line1, address_line2, address_line3, homepage_url,
    biography, signature
)
SELECT
    u.id,
    NULLIF(TRIM(m.mb_name), ''),
    NULLIF(TRIM(m.mb_nick), ''),
    CASE UPPER(TRIM(m.mb_sex)) WHEN 'M' THEN 'male' WHEN 'F' THEN 'female' ELSE NULL END,
    CASE WHEN m.mb_birth REGEXP '^[0-9]{8}$' THEN STR_TO_DATE(m.mb_birth, '%Y%m%d') ELSE NULL END,
    NULLIF(TRIM(m.mb_hp), ''),
    NULLIF(TRIM(m.mb_tel), ''),
    NULLIF(TRIM(CONCAT_WS('-', NULLIF(TRIM(m.mb_zip1), ''), NULLIF(TRIM(m.mb_zip2), ''))), ''),
    NULLIF(TRIM(m.mb_addr1), ''),
    NULLIF(TRIM(m.mb_addr2), ''),
    NULLIF(TRIM(COALESCE(NULLIF(m.mb_addr3, ''), NULLIF(m.mb_addr_jibeon, ''))), ''),
    NULLIF(TRIM(m.mb_homepage), ''),
    NULLIF(m.mb_profile, ''),
    NULLIF(m.mb_signature, '')
FROM legacy_import.g5_member m
JOIN users u ON u.legacy_member_no = m.mb_no;

INSERT INTO user_consents (user_id, email_marketing, sms_marketing, profile_public, consented_at)
SELECT
    u.id,
    m.mb_mailling <> 0,
    m.mb_sms <> 0,
    m.mb_open <> 0,
    CASE WHEN m.mb_open_date <> '0000-00-00' THEN m.mb_open_date ELSE NULL END
FROM legacy_import.g5_member m
JOIN users u ON u.legacy_member_no = m.mb_no;

INSERT INTO user_roles (user_id, role_id)
SELECT
    u.id,
    r.id
FROM legacy_import.g5_member m
JOIN users u ON u.legacy_member_no = m.mb_no
JOIN roles r ON r.role_key = CASE
    WHEN m.mb_leave_date <> '' OR m.mb_intercept_date <> '' OR m.mb_level <= 1 THEN 'restricted'
    WHEN m.mb_level >= 10 THEN 'admin'
    WHEN m.mb_level >= 5 THEN 'editor'
    ELSE 'member'
END;

INSERT INTO board_groups (group_key, sort_order, is_active)
SELECT g.gr_id, GREATEST(g.gr_order, 0), TRUE
FROM legacy_import.g5_group g;

INSERT INTO board_group_translations (board_group_id, locale_code, name)
SELECT bg.id, 'ko', g.gr_subject
FROM legacy_import.g5_group g
JOIN board_groups bg ON bg.group_key = g.gr_id;

INSERT INTO boards (
    board_group_id, board_key, default_locale_code, status, visibility,
    allow_comments, max_attachments, max_attachment_bytes, sort_order
)
SELECT
    bg.id,
    b.bo_table,
    'ko',
    'active',
    CASE WHEN b.bo_read_level <= 1 THEN 'public' WHEN b.bo_read_level <= 2 THEN 'member' ELSE 'private' END,
    b.bo_comment_level > 0,
    GREATEST(b.bo_upload_count, 0),
    GREATEST(b.bo_upload_size, 0),
    GREATEST(b.bo_order, 0)
FROM legacy_import.g5_board b
LEFT JOIN board_groups bg ON bg.group_key = b.gr_id;

INSERT INTO board_translations (board_id, locale_code, name)
SELECT nb.id, 'ko', b.bo_subject
FROM legacy_import.g5_board b
JOIN boards nb ON nb.board_key = b.bo_table;

INSERT INTO board_role_permissions (
    board_id, role_id, can_list, can_read, can_create, can_comment,
    can_upload, can_download, can_moderate
)
SELECT
    nb.id,
    r.id,
    policy.legacy_level >= b.bo_list_level,
    policy.legacy_level >= b.bo_read_level,
    policy.role_key IN ('editor', 'admin') OR policy.legacy_level >= b.bo_write_level,
    policy.legacy_level >= b.bo_comment_level,
    policy.role_key IN ('editor', 'admin') OR policy.legacy_level >= b.bo_upload_level,
    policy.legacy_level >= b.bo_download_level,
    policy.role_key IN ('editor', 'admin')
FROM legacy_import.g5_board b
JOIN boards nb ON nb.board_key = b.bo_table
JOIN (
    SELECT 'guest' role_key, 1 legacy_level
    UNION ALL SELECT 'restricted', 1
    UNION ALL SELECT 'member', 2
    UNION ALL SELECT 'editor', 5
    UNION ALL SELECT 'admin', 10
) policy
JOIN roles r ON r.role_key = policy.role_key;

DROP TEMPORARY TABLE IF EXISTS tmp_legacy_writes;
CREATE TEMPORARY TABLE tmp_legacy_writes AS
SELECT 'book_data' board_key, wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR) wr_option, wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last
FROM legacy_import.g5_write_book_data
UNION ALL SELECT 'book_faith', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_book_faith
UNION ALL SELECT 'book_faith2', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_book_faith2
UNION ALL SELECT 'book_old', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_book_old
UNION ALL SELECT 'free', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_free
UNION ALL SELECT 'gallery', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_gallery
UNION ALL SELECT 'korean_reference', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_korean_reference
UNION ALL SELECT 'notice', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_notice
UNION ALL SELECT 'qa', wr_id, wr_parent, wr_is_comment, wr_comment_reply, ca_name, CAST(wr_option AS CHAR), wr_subject, wr_content, wr_link1, wr_link2, wr_hit, wr_good, wr_nogood, mb_id, wr_password, wr_name, wr_datetime, wr_last FROM legacy_import.g5_write_qa;

ALTER TABLE tmp_legacy_writes
    ADD KEY ix_tmp_legacy_writes (board_key, wr_id),
    ADD KEY ix_tmp_legacy_parent (board_key, wr_parent),
    ADD KEY ix_tmp_legacy_member (mb_id);

INSERT INTO posts (
    public_id, board_id, author_user_id, guest_name, guest_password_hash,
    status, visibility, is_pinned, view_count, like_count, dislike_count,
    published_at, created_at, updated_at, legacy_board_key, legacy_write_id
)
SELECT
    UPPER(SUBSTRING(SHA2(CONCAT('legacy-post:', w.board_key, ':', w.wr_id), 256), 1, 26)),
    b.id,
    u.id,
    CASE WHEN u.id IS NULL THEN NULLIF(w.wr_name, '') ELSE NULL END,
    CASE WHEN u.id IS NULL THEN NULLIF(w.wr_password, '') ELSE NULL END,
    'published',
    CASE WHEN FIND_IN_SET('secret', w.wr_option) > 0 THEN 'private' ELSE 'public' END,
    FIND_IN_SET(w.wr_id, REPLACE(COALESCE(lb.bo_notice, ''), '\n', ',')) > 0,
    GREATEST(w.wr_hit, 0),
    GREATEST(w.wr_good, 0),
    GREATEST(w.wr_nogood, 0),
    NULLIF(w.wr_datetime, '0000-00-00 00:00:00'),
    NULLIF(w.wr_datetime, '0000-00-00 00:00:00'),
    COALESCE(STR_TO_DATE(NULLIF(w.wr_last, ''), '%Y-%m-%d %H:%i:%s'), NULLIF(w.wr_datetime, '0000-00-00 00:00:00')),
    w.board_key,
    w.wr_id
FROM tmp_legacy_writes w
JOIN boards b ON b.board_key = w.board_key
JOIN legacy_import.g5_board lb ON lb.bo_table = w.board_key
LEFT JOIN users u ON u.username = w.mb_id
WHERE w.wr_is_comment = 0;

UPDATE posts child
JOIN tmp_legacy_writes w ON w.board_key = child.legacy_board_key AND w.wr_id = child.legacy_write_id
JOIN posts parent ON parent.legacy_board_key = w.board_key AND parent.legacy_write_id = w.wr_parent
SET child.parent_post_id = parent.id
WHERE w.wr_is_comment = 0 AND w.wr_parent <> w.wr_id;

INSERT INTO post_translations (
    post_id, locale_code, title, body, body_format, translation_status,
    created_at, updated_at
)
SELECT
    p.id,
    'ko',
    w.wr_subject,
    w.wr_content,
    CASE WHEN FIND_IN_SET('html1', w.wr_option) > 0 OR FIND_IN_SET('html2', w.wr_option) > 0 THEN 'html' ELSE 'plain' END,
    'original',
    p.created_at,
    p.updated_at
FROM tmp_legacy_writes w
JOIN posts p ON p.legacy_board_key = w.board_key AND p.legacy_write_id = w.wr_id
WHERE w.wr_is_comment = 0;

INSERT INTO comments (
    public_id, post_id, author_user_id, locale_code, guest_name,
    guest_password_hash, body, status, created_at, updated_at,
    legacy_board_key, legacy_write_id
)
SELECT
    UPPER(SUBSTRING(SHA2(CONCAT('legacy-comment:', w.board_key, ':', w.wr_id), 256), 1, 26)),
    p.id,
    u.id,
    'ko',
    CASE WHEN u.id IS NULL THEN NULLIF(w.wr_name, '') ELSE NULL END,
    CASE WHEN u.id IS NULL THEN NULLIF(w.wr_password, '') ELSE NULL END,
    w.wr_content,
    'published',
    NULLIF(w.wr_datetime, '0000-00-00 00:00:00'),
    COALESCE(STR_TO_DATE(NULLIF(w.wr_last, ''), '%Y-%m-%d %H:%i:%s'), NULLIF(w.wr_datetime, '0000-00-00 00:00:00')),
    w.board_key,
    w.wr_id
FROM tmp_legacy_writes w
JOIN posts p ON p.legacy_board_key = w.board_key AND p.legacy_write_id = w.wr_parent
LEFT JOIN users u ON u.username = w.mb_id
WHERE w.wr_is_comment = 1;

INSERT INTO attachments (
    public_id, post_id, uploaded_by, storage_provider, storage_key,
    original_filename, extension, mime_type, size_bytes, width_px, height_px,
    caption, sort_order, download_count, created_at,
    legacy_board_key, legacy_write_id, legacy_file_no
)
SELECT
    UPPER(SUBSTRING(SHA2(CONCAT('legacy-file:', f.bo_table, ':', f.wr_id, ':', f.bf_no), 256), 1, 26)),
    p.id,
    p.author_user_id,
    'local',
    CONCAT('legacy/', f.bo_table, '/', f.bf_file),
    f.bf_source,
    CASE WHEN f.bf_source LIKE '%.%' THEN LOWER(SUBSTRING_INDEX(f.bf_source, '.', -1)) ELSE NULL END,
    CASE LOWER(SUBSTRING_INDEX(f.bf_source, '.', -1))
        WHEN 'pdf' THEN 'application/pdf'
        WHEN 'doc' THEN 'application/msword'
        WHEN 'hwp' THEN 'application/x-hwp'
        ELSE 'application/octet-stream'
    END,
    GREATEST(f.bf_filesize, 0),
    NULLIF(f.bf_width, 0),
    NULLIF(f.bf_height, 0),
    NULLIF(f.bf_content, ''),
    GREATEST(f.bf_no, 0),
    GREATEST(f.bf_download, 0),
    NULLIF(f.bf_datetime, '0000-00-00 00:00:00'),
    f.bo_table,
    f.wr_id,
    f.bf_no
FROM legacy_import.g5_board_file f
JOIN posts p ON p.legacy_board_key = f.bo_table AND p.legacy_write_id = f.wr_id;

INSERT INTO migration_issues (issue_type, source_table, source_key, severity, details)
SELECT
    'orphan_attachment',
    'g5_board_file',
    CONCAT(f.bo_table, ':', f.wr_id, ':', f.bf_no),
    'warning',
    JSON_OBJECT('board', f.bo_table, 'writeId', f.wr_id, 'fileNo', f.bf_no)
FROM legacy_import.g5_board_file f
LEFT JOIN posts p ON p.legacy_board_key = f.bo_table AND p.legacy_write_id = f.wr_id
WHERE p.id IS NULL;

INSERT INTO migration_issues (issue_type, source_table, source_key, severity, details)
SELECT
    'invalid_birth_date',
    'g5_member',
    CAST(m.mb_no AS CHAR),
    'info',
    JSON_OBJECT('reason', 'Unsupported legacy date format')
FROM legacy_import.g5_member m
WHERE m.mb_birth <> '' AND m.mb_birth NOT REGEXP '^[0-9]{8}$';

INSERT INTO migration_map (source_table, source_key, target_table, target_id)
SELECT 'g5_member', CAST(legacy_member_no AS CHAR), 'users', id
FROM users WHERE legacy_member_no IS NOT NULL;

INSERT INTO migration_map (source_table, source_key, target_table, target_id)
SELECT 'g5_group', group_key, 'board_groups', id FROM board_groups
WHERE group_key IN (SELECT gr_id FROM legacy_import.g5_group);

INSERT INTO migration_map (source_table, source_key, target_table, target_id)
SELECT 'g5_board', board_key, 'boards', id FROM boards
WHERE board_key IN (SELECT bo_table FROM legacy_import.g5_board);

INSERT INTO migration_map (source_table, source_key, target_table, target_id)
SELECT CONCAT('g5_write_', legacy_board_key), CAST(legacy_write_id AS CHAR), 'posts', id
FROM posts WHERE legacy_board_key IS NOT NULL;

INSERT INTO migration_map (source_table, source_key, target_table, target_id)
SELECT CONCAT('g5_write_', legacy_board_key), CAST(legacy_write_id AS CHAR), 'comments', id
FROM comments WHERE legacy_board_key IS NOT NULL;

INSERT INTO migration_map (source_table, source_key, target_table, target_id)
SELECT 'g5_board_file', CONCAT(legacy_board_key, ':', legacy_write_id, ':', legacy_file_no), 'attachments', id
FROM attachments WHERE legacy_board_key IS NOT NULL;

DROP TEMPORARY TABLE tmp_legacy_writes;
COMMIT;
