USE fchinac_dev;
SET NAMES utf8mb4;

ALTER TABLE users DROP CONSTRAINT ck_users_password_scheme;
ALTER TABLE users
  ADD CONSTRAINT ck_users_password_scheme
  CHECK (password_scheme IN ('bcrypt', 'argon2id', 'mysql41', 'reset_required'));

UPDATE users
   SET password_scheme = CASE
     WHEN password_hash REGEXP '^\\*[0-9A-Fa-f]{40}$' THEN 'mysql41'
     WHEN password_hash REGEXP '^\\$2[aby]\\$' THEN 'bcrypt'
     ELSE 'reset_required'
   END;

