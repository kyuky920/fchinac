#!/usr/bin/env bash
set -euo pipefail

backup_root=/var/backups/fchinac
backup_stamp=$(date +%Y%m%d-%H%M%S)

umask 077
install -d -m 700 "$backup_root"

mariadb-dump --single-transaction --quick fchinac_dev \
  | gzip -9 > "$backup_root/database-$backup_stamp.sql.gz"

tar -czf "$backup_root/uploads-$backup_stamp.tar.gz" \
  -C /var/lib/fchinac uploads

find "$backup_root" -type f -mtime +7 -delete
