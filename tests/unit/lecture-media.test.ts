import { describe, expect, it } from "vitest";
import youtubeLectureMap from "../../data/youtube-lecture-map.json";
import { legacyLectureCategories, legacyLectures } from "../../lib/legacy-content";
import { lectureMediaByCourse } from "../../lib/lecture-media";

describe("기존 동영상 강의 구조", () => {
  const courseCodes = legacyLectureCategories
    .flatMap((category) => legacyLectures[category.slug])
    .map(([courseCode]) => courseCode)
    .sort();

  it("TC-LECTURE-001 기존 48개 과목을 모두 YouTube 재생목록과 연결한다", () => {
    expect(Object.keys(lectureMediaByCourse).sort()).toEqual(courseCodes);
    for (const media of Object.values(lectureMediaByCourse)) {
      expect(media.playlistId).toMatch(/^PL[A-Za-z0-9_-]+$/);
      expect(media.lessonNumbers.length).toBeGreaterThan(0);
    }
  });

  it("TC-LECTURE-002 백업에서 비공개 처리된 차시는 목록에서 제외한다", () => {
    expect(lectureMediaByCourse.OT3005.lessonNumbers).not.toEqual(expect.arrayContaining([2, 5, 7, 17]));
    expect(lectureMediaByCourse.ST3012.lessonNumbers).not.toEqual(expect.arrayContaining([3, 6, 8]));
  });

  it("TC-LECTURE-003 공식 채널의 개별 영상 ID를 모든 재생 가능 차시에 고정 연결한다", () => {
    expect(youtubeLectureMap.map((course) => course.courseCode).sort()).toEqual(courseCodes);
    expect(new Set(youtubeLectureMap.map((course) => course.channelId))).toEqual(
      new Set(["UCJlyzUTZCMtGla6IwHG4RVw"]),
    );

    const videos = youtubeLectureMap.flatMap((course) => course.videos);
    expect(videos).toHaveLength(655);
    expect(new Set(videos.map((video) => video.videoId)).size).toBe(655);
    expect(videos.every((video) => /^[A-Za-z0-9_-]{11}$/.test(video.videoId))).toBe(true);
    expect(youtubeLectureMap.reduce((sum, course) => sum + course.totalLessons, 0)).toBe(686);
    expect(youtubeLectureMap.reduce((sum, course) => sum + course.unavailableLessonNumbers.length, 0)).toBe(31);

    for (const course of youtubeLectureMap) {
      expect(course.playlistId).toBe(lectureMediaByCourse[course.courseCode].playlistId);
      const covered = [
        ...course.videos.map((video) => video.lessonNumber),
        ...course.unavailableLessonNumbers,
      ].sort((left, right) => left - right);
      expect(covered).toEqual(Array.from({ length: course.totalLessons }, (_, index) => index + 1));
    }
  });

  it("TC-LECTURE-004 재생목록 순서와 무관하게 차시 제목의 번호를 사용한다", () => {
    const hebrew = youtubeLectureMap.find((course) => course.courseCode === "OT4001");
    expect(hebrew?.videos.find((video) => video.lessonNumber === 1)?.videoId).toBe("gmuquoLSsW0");
    expect(hebrew?.videos.find((video) => video.lessonNumber === 15)?.videoId).toBe("iiuaa1OTdHw");
  });
});
