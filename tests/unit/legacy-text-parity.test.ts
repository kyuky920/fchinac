import { describe, expect, it } from "vitest";
import {
  legacyChurchHistoryDates,
  legacyChurchHistoryEvents,
  legacyContact,
  legacyEmails,
  legacyFamilySites,
  legacyPhoneNumbers,
  legacyPresidentSigners,
  legacyHistoryDates,
  legacyHistoryEvents,
  legacyLectureCategories,
  legacyLectures,
  legacyProfessors,
  membershipNoticeCopy,
} from "../../lib/legacy-content";
import { getLegalContent, PRIVACY_VERSION, TERMS_VERSION } from "../../lib/legal-content";

describe("기존 홈페이지 문구 정합성", () => {
  it("TC-TXT-001 수정된 선교회 연혁 14건의 날짜와 순서를 유지한다", () => {
    expect(legacyHistoryDates).toHaveLength(14);
    expect(legacyHistoryEvents.ko).toHaveLength(14);
    expect(legacyHistoryEvents["zh-CN"]).toHaveLength(14);
    expect(legacyHistoryDates).toEqual([
      "2015.10.22", "2013.07.15", "2012.10.25", "2010.06.01",
      "2010.03.02", "2002.04.12", "2018.09.20", "2000.03", "1999.12.09",
      "1990.03.05", "1969.04.01", "1960", "1952.09", "1946.09.20",
    ]);
    expect(legacyHistoryEvents.ko[1]).toBe("www.abcts.org 개설");
    expect(legacyHistoryEvents.ko.join(" ")).not.toContain("FATEFE");
    expect(legacyHistoryEvents.ko.join(" ")).not.toContain("abctsm.org");
  });

  it("TC-TXT-002 가락동부교회 연혁 7건과 현 시무자를 표시한다", () => {
    expect(legacyChurchHistoryDates).toHaveLength(7);
    expect(legacyChurchHistoryEvents.ko).toHaveLength(7);
    expect(legacyChurchHistoryEvents["zh-CN"]).toHaveLength(7);
    expect(legacyChurchHistoryDates.slice(0, 2)).toEqual(["2026.01 ∼", "2010.12 ∼ 2026.01"]);
    expect(legacyChurchHistoryEvents.ko.slice(0, 2)).toEqual(["김재현 목사 시무중", "박황우 목사 시무"]);
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
    expect(legacyContact.ko.address).toBe("경기도 용인시 수지구 대지로3번길 31-1, 죽전리베니움 102동 302호");
    expect(legacyContact.ko.disclaimer).toContain("민형사상 책임");
    expect(legacyPhoneNumbers.local).toBe("010-2480-7673");
    expect(legacyPhoneNumbers.international).toBe("+82-10-2480-7673");
    expect(legacyPhoneNumbers.secondaryLocal).toBe("010-3930-5915");
    expect(legacyPhoneNumbers.secondaryInternational).toBe("+82-10-3930-5915");
    expect(legacyEmails).toEqual({ primary: "true323@naver.com", secondary: "dlwjdgod1004@naver.com" });
    expect(legacyPresidentSigners).toMatchObject({
      ko: "회장 박황우 박사",
      en: "President Dr. Hwang-Woo Park",
      "zh-CN": "会长 朴滉雨 博士",
    });
  });

  it("TC-TXT-006 Family Sites에 요청된 신학원 사이트만 제공한다", () => {
    expect(legacyFamilySites).toHaveLength(1);
    expect(legacyFamilySites.map((site) => site.href)).toEqual(["http://www.fchinac.org/"]);
    expect(legacyFamilySites[0]).toMatchObject({
      image: "/legacy/images/linksite_03.png",
      displayName: "안디옥성경사이버신학원",
      displayUrl: "www.fchinac.org",
    });
  });

  it("TC-TXT-007 첫 화면 공지사항은 언어별 5개 항목을 유지한다", () => {
    expect(membershipNoticeCopy.ko).toHaveLength(5);
    expect(membershipNoticeCopy.en).toHaveLength(5);
    expect(membershipNoticeCopy["zh-CN"]).toHaveLength(5);
    expect(membershipNoticeCopy.ko[0]).toBe("로그인하고 공부하시오.");
  });

  it("TC-TXT-008 이용약관과 개인정보 처리방침도 새 연락처를 사용한다", () => {
    const ko = getLegalContent("ko");
    const en = getLegalContent("en");
    const combined = JSON.stringify([ko.terms, ko.privacy, en.terms, en.privacy]);
    expect(TERMS_VERSION).toBe("2026-11-01");
    expect(PRIVACY_VERSION).toBe("2026-11-01");
    expect(combined).toContain("010-2480-7673");
    expect(combined).toContain("010-3930-5915");
    expect(combined).toContain("dlwjdgod1004@naver.com");
    expect(combined).not.toContain("02-402-4169");
  });
});
