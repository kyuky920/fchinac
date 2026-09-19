import { z } from "zod";

export const usernameSchema = z.string().trim().min(4).max(64).regex(/^[A-Za-z0-9_.-]+$/);
export const passwordSchema = z.string().min(10).max(200).regex(/[A-Za-z]/).regex(/[0-9]/);
export const managedRoleSchema = z.enum(["member", "editor", "admin"]);
export const memberStatusSchema = z.enum(["pending", "active", "blocked", "withdrawn"]);
export const passwordResetTokenPattern = /^[A-Za-z0-9_-]{40,100}$/;

export const registrationSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().toLowerCase().email().max(254),
  displayName: z.string().trim().min(2).max(100),
  password: passwordSchema,
  passwordConfirm: z.string(),
  preferredLocaleCode: z.string().min(2).max(10),
  residenceCountry: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().max(100).optional()),
  gender: z.preprocess((value) => value === "" ? undefined : value, z.enum(["male", "female", "other"]).optional()),
  ageConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
  privacyAccepted: z.literal(true),
  emailMarketing: z.boolean().default(false),
}).refine((value) => value.password === value.passwordConfirm, { path: ["passwordConfirm"], message: "비밀번호가 일치하지 않습니다." });

export function assertMemberUpdateAllowed(input: {
  actorId: number;
  targetId: number;
  targetIsAdmin: boolean;
  nextStatus: z.infer<typeof memberStatusSchema>;
  nextRoles: Array<z.infer<typeof managedRoleSchema>>;
  activeAdminCount: number;
}): void {
  if (input.actorId === input.targetId && (input.nextStatus !== "active" || !input.nextRoles.includes("admin"))) {
    throw new Error("자신의 관리자 권한이나 활성 상태는 변경할 수 없습니다.");
  }
  if (input.targetIsAdmin && (!input.nextRoles.includes("admin") || input.nextStatus !== "active") && input.activeAdminCount <= 1) {
    throw new Error("마지막 활성 관리자의 권한은 제거할 수 없습니다.");
  }
}
