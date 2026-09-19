import { describe, expect, it } from "vitest";
import { isMysql41Hash, mysql41PasswordHash, verifyStoredPassword } from "../../lib/password";

describe("이전 회원 비밀번호 호환", () => {
  it("TC-AUTH-005 MySQL 4.1 PASSWORD 해시를 정확히 계산한다", () => {
    expect(mysql41PasswordHash("test")).toBe("*94BDCEBE19083CE2A1F959FD02F964C7AF4CFC29");
    expect(isMysql41Hash(mysql41PasswordHash("test"))).toBe(true);
  });

  it("TC-AUTH-006 올바른 구형 비밀번호만 승인한다", async () => {
    const hash = mysql41PasswordHash("LegacyPassword2026!");
    await expect(verifyStoredPassword("LegacyPassword2026!", hash)).resolves.toBe(true);
    await expect(verifyStoredPassword("wrong", hash)).resolves.toBe(false);
  });

  it("TC-AUTH-007 bcrypt 비밀번호 검증을 유지한다", async () => {
    const hash = "$2b$12$5F8xgdidgoqx4MUgfYUCROaeVoQ9L.96Sb.FZtvcsN7Q0o4nrOrQW";
    await expect(verifyStoredPassword("wrong", hash)).resolves.toBe(false);
  });
});
