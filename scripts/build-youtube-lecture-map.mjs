import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const inputPath = args.get("--input");
const outputPath = args.get("--output");
if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/build-youtube-lecture-map.mjs --input <audit.json> --output <map.json>");
}

const root = process.cwd();
const source = await readFile(path.join(root, "lib", "lecture-media.ts"), "utf8");
const expectedByCourse = new Map(
  [...source.matchAll(/\n\s*([A-Z]{2}\d{4}):\s*\{[^\n]*lessonNumbers:\s*lessons\((\d+)/g)].map(
    ([, courseCode, total]) => [courseCode, Number(total)],
  ),
);
const playlists = JSON.parse(await readFile(path.resolve(inputPath), "utf8"));
const chineseDigits = new Map([
  ["〇", 0], ["零", 0], ["一", 1], ["二", 2], ["三", 3], ["四", 4],
  ["五", 5], ["六", 6], ["六", 6], ["七", 7], ["八", 8], ["九", 9],
]);

function parseChineseNumber(value) {
  const normalized = value.replace(/\s/g, "");
  if (normalized.includes("十")) {
    const [tens, ones] = normalized.split("十");
    return (tens ? chineseDigits.get(tens) : 1) * 10 + (ones ? chineseDigits.get(ones) : 0);
  }
  let result = 0;
  for (const character of normalized) {
    const digit = chineseDigits.get(character);
    if (digit === undefined) return null;
    result = result * 10 + digit;
  }
  return result || null;
}

function parseLessonNumber(title) {
  if (!title) return null;
  const english = title.match(/Lecture\s*0*(\d+)/i);
  if (english) return Number(english[1]);
  const chinese = title.match(/第\s*([〇零一二三四五六六七八九十\s]+)\s*课/);
  return chinese ? parseChineseNumber(chinese[1]) : null;
}

const result = playlists.map((playlist) => {
  const totalLessons = expectedByCourse.get(playlist.courseCode);
  if (!totalLessons) throw new Error(`Unknown course ${playlist.courseCode}`);

  let entries = playlist.entries.map((entry) => ({
    lessonNumber: parseLessonNumber(entry.title),
    videoId: entry.id,
    title: entry.title,
  }));

  // This playlist contains 1 John, 2 John and 3 John. Their source titles restart
  // at lesson 1 for each book, so the chronological playlist order is authoritative.
  if (playlist.courseCode === "NT2014") {
    entries = [...entries].reverse().map((entry, index) => ({ ...entry, lessonNumber: index + 1 }));
  }

  const videos = entries
    .filter((entry) => entry.videoId && entry.title && entry.lessonNumber)
    .filter((entry) => entry.lessonNumber >= 1 && entry.lessonNumber <= totalLessons)
    .sort((left, right) => left.lessonNumber - right.lessonNumber);
  const duplicates = videos
    .filter((entry, index) => videos.findIndex((candidate) => candidate.lessonNumber === entry.lessonNumber) !== index)
    .map((entry) => entry.lessonNumber);
  if (duplicates.length) {
    throw new Error(`${playlist.courseCode} has duplicate lesson numbers: ${[...new Set(duplicates)].join(", ")}`);
  }

  const mapped = new Set(videos.map((entry) => entry.lessonNumber));
  return {
    courseCode: playlist.courseCode,
    playlistId: playlist.playlistId,
    playlistTitle: playlist.title,
    channelId: playlist.channelId,
    totalLessons,
    videos,
    unavailableLessonNumbers: Array.from({ length: totalLessons }, (_, index) => index + 1).filter(
      (lessonNumber) => !mapped.has(lessonNumber),
    ),
    ignoredEntries: entries.filter((entry) => !entry.title || !entry.lessonNumber),
  };
});

await writeFile(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, "utf8");
for (const course of result) {
  process.stdout.write(
    `${course.courseCode}\t${course.videos.length}/${course.totalLessons}\tmissing:${course.unavailableLessonNumbers.join(",") || "-"}\tignored:${course.ignoredEntries.length}\n`,
  );
}
