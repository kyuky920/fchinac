import { describe, expect, it } from "vitest";
import { shouldShowGuestActions } from "../../lib/home-access";

describe("첫 화면 회원 진입 버튼", () => {
  it("TC-HOME-AUTH-001 비로그인 사용자에게만 버튼을 표시한다", () => {
    expect(shouldShowGuestActions(null)).toBe(true);
    expect(shouldShowGuestActions({ id: 1 })).toBe(false);
  });
});
