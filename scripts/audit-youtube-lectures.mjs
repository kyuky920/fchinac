import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const source = await readFile(path.join(root, "lib", "lecture-media.ts"), "utf8");
const courses = [...source.matchAll(/\n\s*([A-Z]{2}\d{4}):\s*\{\s*playlistId:\s*"([^"]+)"/g)].map(
  ([, courseCode, playlistId]) => ({ courseCode, playlistId }),
);

if (courses.length === 0) {
  throw new Error("No lecture playlists found in lib/lecture-media.ts");
}

const concurrency = 4;
const results = new Array(courses.length);
let nextIndex = 0;

async function worker() {
  while (nextIndex < courses.length) {
    const index = nextIndex++;
    const course = courses[index];
    const url = `https://www.youtube.com/playlist?list=${course.playlistId}`;

    try {
      const { stdout } = await execFileAsync(
        "yt-dlp",
        ["--flat-playlist", "--dump-single-json", "--ignore-errors", "--no-warnings", url],
        { maxBuffer: 32 * 1024 * 1024 },
      );
      const playlist = JSON.parse(stdout);
      results[index] = {
        ...course,
        title: playlist.title ?? null,
        uploader: playlist.uploader ?? null,
        channelId: playlist.channel_id ?? null,
        entries: (playlist.entries ?? []).filter(Boolean).map((entry) => ({
          id: entry.id ?? null,
          title: entry.title ?? null,
          availability: entry.availability ?? null,
        })),
      };
    } catch (error) {
      results[index] = {
        ...course,
        error: error instanceof Error ? error.message : String(error),
        entries: [],
      };
    }

    process.stderr.write(`[${index + 1}/${courses.length}] ${course.courseCode}\n`);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const outputPathIndex = process.argv.indexOf("--output");
const serialized = `${JSON.stringify(results, null, 2)}\n`;
if (outputPathIndex >= 0 && process.argv[outputPathIndex + 1]) {
  await writeFile(path.resolve(process.argv[outputPathIndex + 1]), serialized, "utf8");
} else {
  process.stdout.write(serialized);
}
