export const TERMS_VERSION = "2026-08-23";
export const PRIVACY_VERSION = "2026-08-23";

export type LegalSection = { title: string; paragraphs: string[] };

export type LegalContent = {
  termsTitle: string;
  privacyTitle: string;
  effectiveDateLabel: string;
  viewFull: string;
  close: string;
  privacyNoticeTitle: string;
  privacyNotice: Array<{ label: string; value: string }>;
  termsSummary: string;
  privacySummary: string;
  terms: LegalSection[];
  privacy: LegalSection[];
};

const ko: LegalContent = {
  termsTitle: "이용약관",
  privacyTitle: "개인정보 처리방침 및 수집·이용 안내",
  effectiveDateLabel: "시행일",
  viewFull: "보기",
  close: "닫기",
  privacyNoticeTitle: "개인정보 수집·이용 안내",
  privacyNotice: [
    { label: "수집 목적", value: "회원 가입·관리, 학습 기록, 문의 처리" },
    { label: "필수 항목", value: "아이디, 이메일, 이름, 비밀번호 해시, 기본 언어" },
    { label: "보유 기간", value: "회원 탈퇴 처리 시까지" },
    { label: "거부 권리", value: "동의를 거부할 수 있으나 회원가입은 제한됩니다." },
  ],
  termsSummary: "아래 이용약관 전문을 확인한 후 동의해 주세요.",
  privacySummary: "수집 목적, 항목, 보유기간과 동의 거부 권리를 확인해 주세요.",
  terms: [
    { title: "제1조 목적", paragraphs: ["이 약관은 안디옥성경사이버선교회(이하 ‘선교회’)가 비영리 목적으로 운영하는 홈페이지와 온라인 성경·신학 학습 서비스의 이용 조건 및 선교회와 회원의 권리·의무를 정함을 목적으로 합니다."] },
    { title: "제2조 약관의 효력과 변경", paragraphs: ["약관은 가입 화면과 홈페이지에 게시하고 회원이 동의함으로써 효력이 발생합니다. 선교회가 약관을 변경할 때에는 시행일과 변경 사유를 시행 7일 전부터 공지합니다. 회원에게 불리한 중대한 변경은 30일 전에 공지하고 필요한 경우 다시 동의를 받습니다."] },
    { title: "제3조 회원가입과 승인", paragraphs: ["이용자는 정확한 정보를 입력하고 가입을 신청해야 합니다. 가입 신청은 관리자 승인 후 완료되며, 허위 정보 입력, 타인 명의 사용, 서비스 운영을 방해할 우려가 있는 경우 승인을 보류하거나 거절할 수 있습니다. 만 14세 미만은 이 홈페이지에 가입할 수 없습니다."] },
    { title: "제4조 계정 관리", paragraphs: ["회원은 계정과 비밀번호를 안전하게 관리하고 타인에게 양도하거나 공유해서는 안 됩니다. 계정 도용 또는 무단 사용을 알게 된 경우 즉시 선교회에 알려야 합니다."] },
    { title: "제5조 서비스 이용", paragraphs: ["선교회는 성경·신학 강의, 학습 기록, 게시판과 자료 열람 등의 서비스를 제공합니다. 점검, 장애, 천재지변 또는 운영상 필요한 경우 서비스를 일시 중단할 수 있으며 가능한 경우 사전에 알립니다."] },
    { title: "제6조 금지행위", paragraphs: ["회원은 타인의 권리를 침해하거나 계정을 도용하는 행위, 불법 정보 또는 악성코드를 게시하는 행위, 서비스의 정상 운영을 방해하는 행위, 허가 없이 콘텐츠를 복제·배포·판매하는 행위를 해서는 안 됩니다."] },
    { title: "제7조 게시물과 콘텐츠", paragraphs: ["회원은 자신이 게시한 콘텐츠에 필요한 권리를 보유해야 합니다. 선교회는 법령 위반, 권리 침해 또는 운영 정책 위반 게시물을 필요한 범위에서 숨기거나 삭제할 수 있습니다. 선교회 콘텐츠의 저작권은 각 권리자에게 있습니다."] },
    { title: "제8조 이용 제한과 탈퇴", paragraphs: ["약관 또는 법령을 위반한 회원은 사전 통지 후 이용이 제한될 수 있습니다. 긴급한 보안·권리 침해 상황에서는 먼저 제한하고 사후 통지할 수 있습니다. 회원은 선교회 연락처를 통해 탈퇴를 요청할 수 있습니다."] },
    { title: "제9조 책임", paragraphs: ["선교회는 고의 또는 중대한 과실이 없는 한 무료로 제공되는 서비스의 일시적 중단이나 회원의 귀책사유로 발생한 손해에 책임을 지지 않습니다. 이 조항은 관계 법령에 따른 선교회의 책임을 배제하지 않습니다."] },
    { title: "제10조 준거법과 문의", paragraphs: ["이 약관은 대한민국 법령을 따릅니다. 문의는 안디옥성경사이버선교회(전화 02-402-4169, 이메일 true323@naver.com)로 접수할 수 있습니다."] },
  ],
  privacy: [
    { title: "1. 개인정보처리자", paragraphs: ["안디옥성경사이버선교회는 회원 개인정보를 처리하는 개인정보처리자입니다. 개인정보 보호 담당 부서 연락처는 02-402-4169, true323@naver.com입니다."] },
    { title: "2. 수집·이용 목적", paragraphs: ["회원 식별과 가입 승인, 계정 및 보안 관리, 학습 기록 제공, 회원 문의 처리와 공지 전달을 위해 개인정보를 처리합니다."] },
    { title: "3. 수집 항목", paragraphs: ["필수: 아이디, 이메일, 이름 또는 표시 이름, 비밀번호의 일방향 해시, 기본 언어, 필수 동의 기록", "선택: 거주 국가, 성별, 이메일 안내 수신 여부", "자동 생성: 로그인 세션 정보, 로그인 시도 식별자의 일방향 해시, 접속·변경 시각"] },
    { title: "4. 보유 및 이용 기간", paragraphs: ["회원정보는 회원 탈퇴 처리 시까지 보유합니다. 탈퇴 후에는 지체 없이 삭제 또는 익명화하되, 분쟁 처리나 법령상 보존 의무가 있는 정보는 해당 목적에 필요한 기간 동안 분리 보관할 수 있습니다. 로그인 실패 기록과 만료된 세션은 보안 목적 달성 후 정기적으로 삭제해야 합니다."] },
    { title: "5. 동의 거부 권리", paragraphs: ["필수 개인정보의 수집·이용 동의를 거부할 수 있으나, 이 경우 회원가입과 회원 전용 서비스를 이용할 수 없습니다. 거주 국가, 성별, 이메일 안내 수신은 선택 항목이며 제공하거나 동의하지 않아도 회원가입에 불이익이 없습니다."] },
    { title: "6. 제3자 제공 및 처리위탁", paragraphs: ["선교회는 개인정보를 제3자에게 판매하거나 제공하지 않습니다. 호스팅 등 처리를 위탁하는 경우 수탁자와 업무 내용을 개인정보 처리방침에 공개하고 계약을 통해 보호조치를 요구합니다. 실제 운영 호스팅 사업자가 확정되면 공개 내용도 함께 갱신해야 합니다."] },
    { title: "7. 파기", paragraphs: ["보유 목적이 끝난 전자정보는 복구하기 어려운 방법으로 삭제하고, 출력물은 파쇄 또는 소각합니다."] },
    { title: "8. 정보주체의 권리", paragraphs: ["회원은 개인정보의 열람, 정정, 삭제, 처리정지 및 동의 철회를 요청할 수 있습니다. 본인 확인 후 지체 없이 처리하며, 법령에 따라 제한되는 경우 그 사유를 안내합니다."] },
    { title: "9. 안전성 확보조치", paragraphs: ["비밀번호 일방향 해시, 전송구간 암호화, 최소권한 접근통제, 세션 만료, 로그인 시도 제한, 접속기록 보호, 백업과 보안 업데이트 등의 기술적·관리적 조치를 적용합니다."] },
    { title: "10. 쿠키와 자동수집", paragraphs: ["로그인 유지에 필요한 필수 세션 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 차단할 수 있으나 로그인 기능이 동작하지 않을 수 있습니다."] },
    { title: "11. 방침 변경", paragraphs: ["처리방침을 변경할 때에는 시행일과 주요 변경사항을 홈페이지에 공개합니다."] },
  ],
};

const en: LegalContent = {
  termsTitle: "Terms of Use",
  privacyTitle: "Privacy Policy and Collection Notice",
  effectiveDateLabel: "Effective date",
  viewFull: "View",
  close: "Close",
  privacyNoticeTitle: "Personal data collection summary",
  privacyNotice: [
    { label: "Purposes", value: "Membership management, learning records, and inquiries" },
    { label: "Required data", value: "Username, email, name, password hash, and preferred language" },
    { label: "Retention", value: "Until membership withdrawal is processed" },
    { label: "Right to refuse", value: "You may refuse, but registration and member-only services will be unavailable." },
  ],
  termsSummary: "Please read the full Terms of Use before agreeing.",
  privacySummary: "Please review the purposes, data items, retention period, and your right to refuse consent.",
  terms: [
    { title: "1. Purpose", paragraphs: ["These Terms govern the nonprofit website and online Bible and theological learning services operated by Antioch Bible Cyber Mission (the “Mission”)."] },
    { title: "2. Effect and changes", paragraphs: ["The Terms take effect when posted and accepted during registration. Changes will normally be announced at least 7 days before taking effect, or 30 days before a materially unfavorable change. Renewed consent will be obtained when required."] },
    { title: "3. Registration", paragraphs: ["Applicants must provide accurate information. Membership becomes available after administrator approval. Applications may be rejected for impersonation, false information, or risks to the service. Persons under 14 may not register."] },
    { title: "4. Account security", paragraphs: ["Members must protect their credentials and may not transfer or share accounts. Suspected unauthorized use must be reported promptly."] },
    { title: "5. Service", paragraphs: ["The Mission provides lectures, learning records, boards, and resources. Service may be temporarily suspended for maintenance, failures, force majeure, or operational necessity."] },
    { title: "6. Prohibited conduct", paragraphs: ["Members may not infringe rights, misuse accounts, post illegal or malicious content, disrupt the service, or reproduce, distribute, or sell protected content without permission."] },
    { title: "7. Content", paragraphs: ["Members must have the rights needed for content they post. Content that violates law, rights, or policy may be restricted or removed. Copyright remains with the respective owner."] },
    { title: "8. Restriction and withdrawal", paragraphs: ["Use may be restricted after notice for violations. Urgent security or rights risks may be addressed first and notified afterward. Members may request withdrawal through the Mission’s contact details."] },
    { title: "9. Liability", paragraphs: ["To the extent permitted by law, the Mission is not liable for interruptions to free services or losses caused by a member. Nothing excludes liability that cannot lawfully be excluded."] },
    { title: "10. Law and contact", paragraphs: ["Korean law applies. Contact the Mission at +82-2-402-4169 or true323@naver.com."] },
  ],
  privacy: [
    { title: "1. Controller", paragraphs: ["Antioch Bible Cyber Mission is the data controller. Contact the privacy function at +82-2-402-4169 or true323@naver.com."] },
    { title: "2. Purposes", paragraphs: ["Data is processed for identification, membership approval, account security, learning records, inquiries, and notices."] },
    { title: "3. Data collected", paragraphs: ["Required: username, email, name or display name, one-way password hash, preferred language, and consent records.", "Optional: country of residence, gender, and email update preference.", "Generated: login session data, one-way hashes of login identifiers, and access/change timestamps."] },
    { title: "4. Retention", paragraphs: ["Member data is retained until withdrawal is processed, then deleted or anonymized without undue delay unless a legal or dispute-related retention duty applies. Security logs and expired sessions must be deleted periodically when no longer needed."] },
    { title: "5. Right to refuse", paragraphs: ["You may refuse required consent, but registration and member-only services will then be unavailable. Optional profile data and email updates are not conditions of membership."] },
    { title: "6. Sharing and processors", paragraphs: ["The Mission does not sell or disclose personal data to third parties. Hosting or other processors will be disclosed and contractually protected. This policy must be updated when the production hosting provider is finalized."] },
    { title: "7. Deletion", paragraphs: ["Electronic data is securely deleted and paper records are shredded or destroyed when retention ends."] },
    { title: "8. Your rights", paragraphs: ["You may request access, correction, deletion, restriction, or withdrawal of consent. Requests are handled after identity verification, subject to applicable law."] },
    { title: "9. Security", paragraphs: ["Safeguards include password hashing, encryption in transit, least-privilege access, session expiry, login rate limiting, protected logs, backups, and security updates."] },
    { title: "10. Cookies", paragraphs: ["An essential session cookie is used for sign-in. Blocking it may prevent account features from working."] },
    { title: "11. Changes", paragraphs: ["The effective date and material changes will be published on the website."] },
  ],
};

export function getLegalContent(locale: string): LegalContent {
  return locale === "ko" ? ko : en;
}
