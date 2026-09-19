import { describe, expect, it } from "vitest";
import { getDictionary, isLocale, knownLocale } from "../../lib/i18n";
import { translationCatalogKeys } from "../../lib/i18n-catalog";

describe("다국어 기본 정책", () => {
  it("TC-I18N-001 표준 언어 코드 형식을 구분한다", () => {
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("zh-CN")).toBe(true);
    expect(isLocale("invalid_locale")).toBe(false);
  });

  it("TC-I18N-002 코드 기본 문구가 없는 언어는 영어를 사용한다", () => {
    expect(knownLocale("vi")).toBe("en");
    expect(getDictionary("vi").siteName).toBe(getDictionary("en").siteName);
  });

  it("TC-I18N-003 기존 언어의 회원가입 문구를 제공한다", () => {
    expect(getDictionary("ko").register).toBe("회원가입");
    expect(getDictionary("en").register).toBe("Register");
    expect(getDictionary("zh-CN").register).toBe("注册");
  });

  it("TC-I18N-004 번역 키 카탈로그는 중복이 없고 회원 문구를 포함한다", () => {
    expect(new Set(translationCatalogKeys).size).toBe(translationCatalogKeys.length);
    expect(translationCatalogKeys).toContain("common.register");
    expect(translationCatalogKeys).toContain("register.password_confirm");
  });

  it("TC-I18N-005 기존 10개 언어의 표준 URL 코드를 허용한다", () => {
    const legacyCodes = ["ko", "zh-CN", "mn", "es", "en", "ru", "fr", "pt", "tl", "sw"];
    expect(legacyCodes.every(isLocale)).toBe(true);
    expect(getDictionary("ru").siteName).toBe(getDictionary("en").siteName);
    expect(getDictionary("sw").register).toBe("Register");
  });
});
