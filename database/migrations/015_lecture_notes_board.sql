USE fchinac_dev;
SET NAMES utf8mb4;

INSERT INTO boards
  (board_key, default_locale_code, status, visibility, allow_comments,
   max_attachments, max_attachment_bytes, sort_order)
VALUES
  ('lecture_notes', 'ko', 'active', 'public', FALSE, 10, 20971520, 45)
ON DUPLICATE KEY UPDATE
  status=VALUES(status),
  visibility=VALUES(visibility),
  allow_comments=VALUES(allow_comments),
  max_attachments=VALUES(max_attachments),
  max_attachment_bytes=VALUES(max_attachment_bytes),
  sort_order=VALUES(sort_order);

INSERT INTO board_translations (board_id, locale_code, name, description)
SELECT b.id, labels.locale_code, labels.name, labels.description
FROM boards b
CROSS JOIN (
  SELECT 'ko' locale_code, '강의록' name, '동영상 강의와 함께 사용할 강의록 및 첨부파일입니다.' description
  UNION ALL SELECT 'en', 'Lecture Notes', 'Lecture notes and files for use with video lectures.'
  UNION ALL SELECT 'zh-CN', '讲义', '与视频讲座配套使用的讲义和附件。'
  UNION ALL SELECT 'mn', 'Лекцийн тэмдэглэл', 'Видео хичээлтэй хамт ашиглах лекцийн тэмдэглэл болон файлууд.'
  UNION ALL SELECT 'es', 'Apuntes de clase', 'Apuntes y archivos para utilizar con las videoclases.'
  UNION ALL SELECT 'ru', 'Конспекты лекций', 'Конспекты и файлы для использования с видеолекциями.'
  UNION ALL SELECT 'fr', 'Notes de cours', 'Notes et fichiers à utiliser avec les cours vidéo.'
  UNION ALL SELECT 'pt', 'Notas de aula', 'Notas e arquivos para uso com as videoaulas.'
  UNION ALL SELECT 'tl', 'Mga Tala sa Leksyon', 'Mga tala at file na gagamitin kasama ng mga video lecture.'
  UNION ALL SELECT 'sw', 'Maelezo ya Mihadhara', 'Maelezo na faili za kutumia pamoja na mihadhara ya video.'
  UNION ALL SELECT 'ar', 'مذكرات المحاضرات', 'مذكرات وملفات للاستخدام مع محاضرات الفيديو.'
  UNION ALL SELECT 'fa', 'جزوه‌های درسی', 'جزوه‌ها و فایل‌های قابل استفاده همراه با ویدئوهای آموزشی.'
  UNION ALL SELECT 'ne', 'व्याख्यान नोटहरू', 'भिडियो व्याख्यानसँग प्रयोग गर्ने नोटहरू र फाइलहरू।'
  UNION ALL SELECT 'th', 'เอกสารประกอบการบรรยาย', 'เอกสารและไฟล์สำหรับใช้ร่วมกับวิดีโอการบรรยาย'
  UNION ALL SELECT 'vi', 'Bài giảng', 'Bài giảng và tệp sử dụng cùng với các bài giảng video.'
) labels
WHERE b.board_key='lecture_notes'
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  description=VALUES(description);

INSERT INTO board_role_permissions
  (board_id, role_id, can_list, can_read, can_create, can_comment,
   can_upload, can_download, can_moderate)
SELECT
  b.id,
  r.id,
  TRUE,
  TRUE,
  r.role_key='admin',
  FALSE,
  r.role_key='admin',
  r.role_key IN ('member', 'editor', 'admin'),
  r.role_key='admin'
FROM boards b
CROSS JOIN roles r
WHERE b.board_key='lecture_notes'
ON DUPLICATE KEY UPDATE
  can_list=VALUES(can_list),
  can_read=VALUES(can_read),
  can_create=VALUES(can_create),
  can_comment=VALUES(can_comment),
  can_upload=VALUES(can_upload),
  can_download=VALUES(can_download),
  can_moderate=VALUES(can_moderate);

INSERT INTO site_translations (locale_code, message_key, value)
SELECT bt.locale_code, translation_keys.message_key, bt.name
FROM board_translations bt
JOIN boards b ON b.id=bt.board_id AND b.board_key='lecture_notes'
CROSS JOIN (
  SELECT 'menu.lecture_notes' message_key
  UNION ALL SELECT 'page.notes.title'
) translation_keys
WHERE TRUE
ON DUPLICATE KEY UPDATE value=VALUES(value);
