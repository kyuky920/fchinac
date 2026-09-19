import { describe, expect, it } from "vitest";
import {
  legacyChurchHistoryDates,
  legacyChurchHistoryEvents,
  legacyContact,
  legacyHistoryDates,
  legacyHistoryEvents,
  legacyLectureCategories,
  legacyLectures,
  legacyProfessors,
} from "../../lib/legacy-content";

describe("기존 홈페이지 문구 정합성", () => {
  it("TC-TXT-001 선교회 연혁 15건의 날짜와 순서를 유지한다", () => {
    expect(legacyHistoryDates).toHaveLength(15);
    expect(legacyHistoryEvents.ko).toHaveLength(15);
    expect(legacyHistoryEvents["zh-CN"]).toHaveLength(15);
    expect(legacyHistoryDates).toEqual([
      "2015.10.22", "2015.02.28", "2013.07.15", "2012.10.25", "2010.06.01",
      "2010.03.02", "2002.04.12", "2018.09.20", "2000.03", "1999.12.09",
      "1990.03.05", "1969.04.01", "1960", "1952.09", "1946.09.20",
    ]);
  });

  it("TC-TXT-002 가락동부교회 연혁 6건을 누락하지 않는다", () => {
    expect(legacyChurchHistoryDates).toHaveLength(6);
    expect(legacyChurchHistoryEvents.ko).toHaveLength(6);
    expect(legacyChurchHistoryEvents["zh-CN"]).toHaveLength(6);
  });

  it("TC-TXT-003 교수 21명의 이름과 약력을 유지한다", () => {
    expect(legacyProfessors).toHaveLength(21);
    expect(legacyProfessors[1][1]).toContain("Kyeyak Graduate School of Theology Professor");
    expect(legacyProfessors[6][1]).toContain("R.S.A. University of Pretoria(Ph.D.)");
    expect(legacyProfessors[16][1]).toContain("Reformed Faith Theological College Seminary(D.Miss)");
  });

  it("TC-TXT-004 백업 DB의 강의 48개와 차수를 유지한다", () => {
    const allCourses = legacyLectureCategories.flatMap((category) => legacyLectures[category.slug]);
    expect(allCourses).toHaveLength(48);
    expect(legacyLectures["old-testament"][0]).toEqual(["OT4001", "히브리어", "希伯来语", 8]);
    expect(legacyLectures["new-testament"].find(([code]) => code === "NT2006")?.[3]).toBe(11);
  });

  it("TC-TXT-005 주소·이메일·표기 기준을 유지한다", () => {
    expect(legacyContact.ko.address).toBe("서울 송파구 오금로 34길 46");
    expect(legacyContact.ko.disclaimer).toContain("민형사상 책임");
  });
});
