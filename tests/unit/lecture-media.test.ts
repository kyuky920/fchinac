import { describe, expect, it } from "vitest";
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

  it("TC-LECTURE-003 YouTube에 없는 차시는 재생 대상으로 선택하지 않는다", () => {
    expect(lectureMediaByCourse.CH3002.availableLessonNumbers).toEqual(Array.from({ length: 17 }, (_, index) => index + 1));
    expect(lectureMediaByCourse.NT2014.availableLessonNumbers).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
