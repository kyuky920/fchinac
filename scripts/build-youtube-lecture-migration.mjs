import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/youtube-lecture-map.json";
const outputPath = process.argv[3] ?? "database/migrations/016_map_youtube_lecture_videos.sql";
const courses = JSON.parse(await readFile(path.resolve(inputPath), "utf8"));
const rows = courses.flatMap((course) => {
  const videos = new Map(course.videos.map((video) => [video.lessonNumber, video.videoId]));
  return Array.from({ length: course.totalLessons }, (_, index) => ({
    courseCode: course.courseCode,
    lessonNumber: index + 1,
    videoId: videos.get(index + 1) ?? null,
  }));
});

const chunks = [];
for (let index = 0; index < rows.length; index += 100) {
  const values = rows.slice(index, index + 100).map(({ courseCode, lessonNumber, videoId }) =>
    `('${courseCode}',${lessonNumber},${videoId ? `'${videoId}'` : "NULL"})`,
  );
  chunks.push(`INSERT INTO youtube_lecture_video_map (course_code,lesson_number,video_id) VALUES\n${values.join(",\n")};`);
}

const sql = `USE fchinac_dev;
SET NAMES utf8mb4;

-- Verified against the ABCMISSION Korea channel on 2026-09-20.
-- Explicit IDs avoid relying on a playlist's mutable order.
CREATE TEMPORARY TABLE youtube_lecture_video_map (
  course_code VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lesson_number SMALLINT UNSIGNED NOT NULL,
  video_id VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (course_code, lesson_number)
);

${chunks.join("\n\n")}

UPDATE lecture_lessons lesson
JOIN lecture_courses course ON course.id=lesson.course_id
JOIN youtube_lecture_video_map source
  ON source.course_code=course.course_code AND source.lesson_number=lesson.lesson_number
SET lesson.youtube_video_id=source.video_id,
    lesson.is_available=(source.video_id IS NOT NULL);

DROP TEMPORARY TABLE youtube_lecture_video_map;
`;

await writeFile(path.resolve(outputPath), sql, "utf8");
process.stdout.write(`Generated ${outputPath} with ${rows.length} lesson mappings.\n`);
