#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
MARIADB_BIN=${MARIADB_BIN:-mariadb}
SOURCE_ROOT=${SOURCE_ROOT:-$PROJECT_DIR/local-test/source/data/file}
DEST_ROOT=${DEST_ROOT:-$PROJECT_DIR/local-test/migrated-uploads}

umask 077

"$MARIADB_BIN" --protocol=socket fchinac_dev < "$SCRIPT_DIR/migrations/002_migrate_legacy_data.sql"
mkdir -p "$DEST_ROOT"

"$MARIADB_BIN" --protocol=socket -N -e \
  "DELETE FROM fchinac_dev.migration_issues WHERE issue_type IN ('missing_attachment_file','attachment_size_mismatch');"

"$MARIADB_BIN" --protocol=socket -N -e \
  "SELECT a.public_id,a.storage_key,a.legacy_board_key,f.bf_file,f.bf_filesize,a.legacy_write_id,a.legacy_file_no
   FROM fchinac_dev.attachments a
   JOIN legacy_import.g5_board_file f
     ON f.bo_table=a.legacy_board_key
    AND f.wr_id=a.legacy_write_id
    AND f.bf_no=a.legacy_file_no
   WHERE a.legacy_board_key IS NOT NULL
   ORDER BY a.id" |
while IFS="$(printf '\t')" read -r public_id storage_key board stored_name expected_size write_id file_no; do
  source_file="$SOURCE_ROOT/$board/$stored_name"
  destination_file="$DEST_ROOT/$storage_key"

  if [ ! -f "$source_file" ]; then
    "$MARIADB_BIN" --protocol=socket -e \
      "INSERT INTO fchinac_dev.migration_issues
       (issue_type,source_table,source_key,severity,details)
       VALUES ('missing_attachment_file','g5_board_file','${board}:${write_id}:${file_no}','error',
               JSON_OBJECT('board','${board}','writeId',${write_id},'fileNo',${file_no}));"
    continue
  fi

  mkdir -p "$(dirname -- "$destination_file")"
  cp -p "$source_file" "$destination_file"

  actual_size=$(stat -f %z "$source_file" 2>/dev/null || stat -c %s "$source_file")
  checksum=$(shasum -a 256 "$source_file" | awk '{print $1}')

  "$MARIADB_BIN" --protocol=socket -e \
    "UPDATE fchinac_dev.attachments
        SET size_bytes=${actual_size}, checksum_sha256='${checksum}'
      WHERE public_id='${public_id}';"

  if [ "$actual_size" -ne "$expected_size" ]; then
    "$MARIADB_BIN" --protocol=socket -e \
      "INSERT INTO fchinac_dev.migration_issues
       (issue_type,source_table,source_key,severity,details)
       VALUES ('attachment_size_mismatch','g5_board_file','${board}:${write_id}:${file_no}','warning',
               JSON_OBJECT('recordedBytes',${expected_size},'actualBytes',${actual_size}));"
  fi
done

"$MARIADB_BIN" --protocol=socket --batch --raw -e \
  "SELECT 'users' entity,COUNT(*) count FROM fchinac_dev.users
   UNION ALL SELECT 'boards',COUNT(*) FROM fchinac_dev.boards
   UNION ALL SELECT 'posts',COUNT(*) FROM fchinac_dev.posts
   UNION ALL SELECT 'post_translations',COUNT(*) FROM fchinac_dev.post_translations
   UNION ALL SELECT 'comments',COUNT(*) FROM fchinac_dev.comments
   UNION ALL SELECT 'attachments',COUNT(*) FROM fchinac_dev.attachments
   UNION ALL SELECT 'migration_issues',COUNT(*) FROM fchinac_dev.migration_issues;"

