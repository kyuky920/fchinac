import { describe, expect, it } from "vitest";
import { assertMemberUpdateAllowed, passwordResetTokenPattern, registrationSchema } from "../../lib/member-validation";

const validRegistration = {
  username: "mission_user",
  email: "Member@Example.com",
  displayName: "테스트 회원",
  password: "MissionTest2026!",
  passwordConfirm: "MissionTest2026!",
  preferredLocaleCode: "ko",
  residenceCountry: "대한민국",
  gender: "male",
  ageConfirmed: true,
  termsAccepted: true,
  privacyAccepted: true,
  emailMarketing: false,
};

describe("회원가입 입력 검증", () => {
  it("TC-MEM-001 유효한 가입 신청을 정규화한다", () => {
    const result = registrationSchema.parse(validRegistration);
    expect(result.email).toBe("member@example.com");
    expect(result.username).toBe("mission_user");
  });

  it("TC-MEM-002 영문이나 숫자가 없는 비밀번호를 거절한다", () => {
    expect(() => registrationSchema.parse({ ...validRegistration, password: "abcdefghij", passwordConfirm: "abcdefghij" })).toThrow();
    expect(() => registrationSchema.parse({ ...validRegistration, password: "1234567890", passwordConfirm: "1234567890" })).toThrow();
  });

  it("TC-MEM-003 서로 다른 비밀번호 확인값을 거절한다", () => {
    expect(() => registrationSchema.parse({ ...validRegistration, passwordConfirm: "Different2026!" })).toThrow("비밀번호가 일치하지 않습니다.");
  });

  it("TC-MEM-004 필수 동의가 없으면 가입을 거절한다", () => {
    expect(() => registrationSchema.parse({ ...validRegistration, privacyAccepted: false })).toThrow();
  });

  it("TC-MEM-005 허용되지 않은 아이디 문자를 거절한다", () => {
    expect(() => registrationSchema.parse({ ...validRegistration, username: "사용자 아이디" })).toThrow();
  });

  it("TC-MEM-006 만 14세 이상 확인이 없으면 가입을 거절한다", () => {
    expect(() => registrationSchema.parse({ ...validRegistration, ageConfirmed: false })).toThrow();
  });

  it("TC-MEM-007 허용되지 않은 성별 값은 거절한다", () => {
    expect(() => registrationSchema.parse({ ...validRegistration, gender: "invalid" })).toThrow();
  });
});

describe("관리자 회원 변경 정책", () => {
  it("TC-ADM-001 관리자가 자신의 활성 상태를 해제하지 못하게 한다", () => {
    expect(() => assertMemberUpdateAllowed({ actorId: 1, targetId: 1, targetIsAdmin: true, nextStatus: "blocked", nextRoles: ["admin"], activeAdminCount: 2 })).toThrow("자신의 관리자 권한");
  });

  it("TC-ADM-002 관리자가 자신의 관리자 역할을 제거하지 못하게 한다", () => {
    expect(() => assertMemberUpdateAllowed({ actorId: 1, targetId: 1, targetIsAdmin: true, nextStatus: "active", nextRoles: ["member"], activeAdminCount: 2 })).toThrow("자신의 관리자 권한");
  });

  it("TC-ADM-003 마지막 활성 관리자를 보호한다", () => {
    expect(() => assertMemberUpdateAllowed({ actorId: 2, targetId: 1, targetIsAdmin: true, nextStatus: "active", nextRoles: ["member"], activeAdminCount: 1 })).toThrow("마지막 활성 관리자");
  });

  it("TC-ADM-004 관리자가 두 명 이상이면 다른 관리자의 역할 변경을 허용한다", () => {
    expect(() => assertMemberUpdateAllowed({ actorId: 2, targetId: 1, targetIsAdmin: true, nextStatus: "active", nextRoles: ["member"], activeAdminCount: 2 })).not.toThrow();
  });

  it("TC-AUTH-001 재설정 토큰 형식을 검증한다", () => {
    expect(passwordResetTokenPattern.test("A".repeat(43))).toBe(true);
    expect(passwordResetTokenPattern.test("short-token")).toBe(false);
  });
});
