# AI 에이전트 인수인계서

기준일: 2026-09-20

저장소: `https://github.com/kyuky920/fchinac.git`

기본 브랜치: `main`

## 1. 프로젝트 목적과 절대 조건

기존 안디옥성경사이버선교회 홈페이지를 Next.js로 갱신하는 프로젝트다. 기존 UI와
콘텐츠 정체성을 유지하면서 회원, 게시판, 강의, 관리자, 다국어 기능을 현대화한다.

- WordPress를 사용하지 않는다.
- 물리 서버를 운영하지 않고 iwinv VPS를 사용한다.
- 동영상 파일은 서버에 저장하지 않고 YouTube 임베드를 사용한다.
- 기존 운영 서버는 전환 승인 전까지 절대 변경하지 않는다.
- 현재 IP 기반 사이트는 스테이징이다. 운영 도메인과 TLS 연결은 보류 상태다.
- 운영 자격증명과 개인정보는 이 문서 및 Git에 절대 기록하지 않는다.

## 2. 현재 실행 상태

| 항목 | 현재 값 |
|---|---|
| 스테이징 URL | `http://49.247.201.154` |
| 관리자 URL | `http://49.247.201.154/ko/admin` |
| 서버 | iwinv `vgna_2_n`, Ubuntu 24.04, 2 vCPU, RAM 2 GB, NVMe 50 GB |
| 앱 | Next.js 16.3.1 standalone, Node.js 24, systemd `fchinac.service` |
| 프록시 | Nginx |
| DB | MariaDB 10.11, `fchinac_dev`, 외부 비공개 |
| 업로드 | `/var/lib/fchinac/uploads` |
| 릴리스 | `/opt/fchinac/releases/<git-short-sha>` |
| 현재 앱 릴리스 | `ced2fc9` (YouTube 차시 매핑 배포 전) |
| 현재 링크 | `/opt/fchinac/current` |
| 환경 파일 | `/etc/fchinac/env`, Git 제외 |
| 백업 | `fchinac-backup.timer`, 매일, 로컬 7일 보관 |

2026-09-20 확인 결과 `fchinac`, `nginx`, `mariadb`, `fail2ban`은 모두 active이고
`/api/health`는 애플리케이션과 DB 모두 `ok`다. 디스크 사용률은 14%였다.

현재 데이터 수량:

| 대상 | 수량 |
|---|---:|
| 회원 | 383 |
| 게시판 | 10 |
| 삭제되지 않은 게시물 | 50 |
| 첨부파일 | 38 |
| 활성 언어 | 15 |
| 강좌 | 48 |
| 강의 차시 | 686 |

## 3. 기술 스택과 로컬 실행

- Node.js 24, pnpm 11
- Next.js 16 App Router, React 19, TypeScript 6
- MariaDB, `mysql2`
- Zod, bcryptjs, sanitize-html
- Vitest, ESLint
- GitHub Actions

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

로컬 URL은 기본적으로 `http://127.0.0.1:3000/ko`다. `.env.local`은 Git에서
제외한다. 필요한 환경변수 이름은 `DATABASE_URL`, `UPLOAD_ROOT`,
`SESSION_COOKIE_SECURE`다. 실제 값은 문서화하지 않는다.

릴리스 전 필수 검증:

```sh
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

## 4. 코드 구조

| 영역 | 주요 위치 |
|---|---|
| 공개 홈페이지 | `app/[locale]` |
| 회원가입 | `app/[locale]/membership`, `app/[locale]/register` |
| 로그인·세션 | `app/[locale]/login`, `lib/auth.ts` |
| 회원 관리 | `lib/members.ts`, `app/[locale]/admin/users` |
| 게시판·첨부 | `lib/content.ts`, `lib/admin-content.ts`, `app/api/attachments` |
| 게시판 권한 | `lib/admin-boards.ts` |
| 강의 | `lib/lectures.ts`, `app/[locale]/lectures` |
| 관리자 | `app/[locale]/admin` |
| 언어·번역 | `lib/i18n.ts`, `lib/i18n-server.ts`, `lib/language-admin.ts` |
| 기존 문구 데이터 | `lib/legacy-content.ts` |
| 법률 문구 | `lib/legal-content.ts` |
| DB 변경 | `database/migrations` |
| iwinv 운영 파일 | `deploy/iwinv` |
| 레거시 백업 | `local-test`, Git 제외, 읽기 전용 취급 |

## 5. 구현 완료 범위

- 기존 화면 스타일 기반 반응형 공개 페이지
- 회장 인사말, 연혁, 교수, 가입안내, 강의, 자료 페이지
- 기존 회원 382명 이전과 신규 가입 회원
- MySQL 4.1 비밀번호 호환 및 로그인 성공 시 bcrypt 자동 전환
- 승인형 회원가입, 관리자 승인·차단·권한 변경, 비밀번호 재설정
- 가입안내 페이지 내부 회원가입 폼과 약관·개인정보 모달
- 레거시 게시판 9개와 신규 강의록 게시판, 게시물 50건, 첨부파일 38건
- 회원 전용 파일 다운로드와 파일별 누적 다운로드 횟수
- 게시물·파일·게시판 권한 관리자 기능
- 동영상 강의와 서적 사이의 다국어 강의록 메뉴와 관리자 전용 게시물·첨부 관리
- 6개 강의 분류, 48개 강좌, 686개 차시와 공식 채널 개별 영상 ID 655개 임베드
- 관리자 대시보드, 회원·콘텐츠·강의·언어·감사 이력 화면
- DB 기반 언어와 문구 관리, JSON 일괄 가져오기·내보내기
- 15개 활성 언어와 영어 fallback
- 아랍어·페르시아어 RTL
- Nginx, UFW, Fail2ban, systemd, 일일 DB·업로드 백업

## 6. 지원 언어와 fallback

표시 순서는 한국어, 중국어, 몽골어, 스페인어, 영어, 러시아어, 프랑스어,
포르투갈어, 타갈로그어, 스와힐리어, 아랍어, 페르시아어, 네팔어, 태국어,
베트남어다.

- URL 예: `/ko`, `/en`, `/zh-CN`, `/ar`
- 모든 비한국어 언어의 DB `fallback_code`는 영어다.
- 영어에도 문구가 없을 때 한국어와 코드 기본값을 사용한다.
- 아랍어 `ar`와 페르시아어 `fa`는 `dir="rtl"`이다.
- 관리 URL: `/{locale}/admin/languages`

번역이 실제로 작성되지 않은 언어는 영어 문구를 표시한다. 새 화면 문구를 추가하면
`lib/i18n-catalog.ts`, 코드 기본값, 필요한 DB 마이그레이션을 함께 갱신한다.

## 7. 최근 콘텐츠 결정

- Agreement는 미국 Puritan Reformed University만 표시하고 FATEFE 문구를 제거했다.
- 회장 서명은 `회장 김재현 박사`이며 주요 언어 번역도 동기화했다.
- 선교회 연혁에서 `2015.02.28` FATEFE 항목을 삭제했다.
- `2013.07.15`는 `www.abcts.org 개설`만 표시한다.
- 가락동부교회 연혁 최상단은 `2026.01 ∼ 현재 김재현 목사 시무중`, 다음은
  `2010.12 ∼ 2026.01 박황우 목사 시무`다.
- Family Sites는 기존 4개 배너를 표시하며 가락동부교회 `www.garakdb.org`를 포함한다.
- 연락 이메일은 `ihsihope@gmail.com`, 연락 휴대전화는 `+82-10-6441-7522`다.
- 공지사항 5개는 홈페이지의 ABOUT US 다음, OUR VISION 전에 표시한다.
- 공지사항 아래 회원가입·로그인 버튼은 비로그인 사용자에게만 표시한다.
- 가입안내에는 회원가입 폼이 직접 표시된다. `/{locale}/register`는
  `/{locale}/membership#register`로 리다이렉트한다.

## 8. 인증과 관리자 권한

- 역할: `guest`, `restricted`, `member`, `editor`, `admin`
- 신규 가입: `pending` + `member`, 관리자 승인 후 `active`
- 세션: DB에는 토큰 SHA-256만 저장, 14일, HttpOnly, SameSite=Lax
- 로그인 실패: 식별자 기준 15분 동안 5회 제한
- 관리자 기능은 서버에서 권한을 다시 확인한다.
- 관리자 계정명·암호는 문서에 기록하지 않는다.

관리자 메뉴:

- 대시보드
- 게시물·첨부파일
- 게시판·역할별 권한
- 강의 분류·과목·차시
- 회원 상태·역할·비밀번호 재설정
- 언어·번역
- 관리자 변경 이력

## 9. DB와 마이그레이션

신규 앱은 `fchinac_dev`만 사용한다. `legacy_import`와 레거시 파일은 읽기 전용이다.
마이그레이션 적용 순서는 루트 `README.md`를 따른다. 현재 최신 번호는 `016`이다.

중요 모델:

- 회원: `users`, `member_profiles`, `user_consents`, `roles`, `user_roles`
- 인증: `auth_sessions`, `auth_login_attempts`, `password_reset_tokens`
- 콘텐츠: `boards`, `board_role_permissions`, `posts`, `post_translations`, `attachments`
- 언어: `locales`, `site_translations`
- 강의: `lecture_categories`, `lecture_courses`, `lecture_lessons`
- 감사: `user_audit_logs`, `admin_audit_logs`

마이그레이션은 가능한 한 재실행 가능하게 작성한다. 운영 적용 전 DB 백업을 먼저
확인하고, SQL 덤프나 회원 원문을 Git에 추가하지 않는다.

YouTube 강의 매핑 기준은 `data/youtube-lecture-map.json`이다. 2026-09-20 공식
ABCMISSION Korea 채널의 48개 재생목록을 확인해 655개 공개 영상 ID를 차시 번호에
직접 연결했고, 영상이 없거나 비공개인 31개는 준비 중으로 처리했다. 재생목록 순번을
플레이어 주소에 사용하지 않는다. 다시 점검할 때는 `scripts/audit-youtube-lectures.mjs`,
`scripts/build-youtube-lecture-map.mjs`, `scripts/build-youtube-lecture-migration.mjs`를 사용한다.

## 10. 배포와 롤백

서버에서는 빌드하지 않는다. 로컬 빌드 후 다음 세 디렉터리를 새 릴리스에 전송한다.

- `.next/standalone/`
- `.next/static/`
- `public/`

새 경로는 `/opt/fchinac/releases/<git-short-sha>`다. 업로드가 완전히 끝나고 필요한
DB 마이그레이션을 적용한 뒤에만 `/opt/fchinac/current` 링크를 변경한다.

```sh
sudo ln -sfn /opt/fchinac/releases/<git-short-sha> /opt/fchinac/current
sudo systemctl restart fchinac
curl --fail http://127.0.0.1/api/health
```

문제가 있으면 링크를 직전 릴리스로 되돌리고 서비스를 재시작한다. 상세 절차는
`docs/iwinv-deployment-runbook.md`를 따른다.

## 11. 보안과 운영 주의사항

- 현재 HTTP/IP 스테이징이므로 `SESSION_COOKIE_SECURE=false`다.
- 도메인과 TLS 적용 즉시 `SESSION_COOKIE_SECURE=true`로 변경한다.
- SSH는 공개키 인증만 사용하며 개인키를 저장소에 복사하지 않는다.
- 초기 자료 전달 과정에서 노출된 적이 있는 자격증명은 운영 전 반드시 교체한다.
- 기존 운영 DNS와 서버는 명시적 전환 승인 없이는 변경하지 않는다.
- 로컬 7일 백업만으로는 서버 장애를 보호하지 못한다. 외부 암호화 복제가 필요하다.

## 12. 알려진 미완료·후속 업무

우선순위가 높은 순서다.

1. 운영/스테이징 도메인 결정, DNS 연결, TLS, Secure 쿠키
2. Cloudflare 또는 동등한 WAF·DDoS·rate limit 구성
3. 외부 오브젝트 스토리지 백업과 실제 복원 리허설
4. 운영 전 관리자·서버·DB 자격증명 전면 교체
5. 회원 본인 프로필·비밀번호 변경
6. 이메일 자동 발송과 비밀번호 재설정 전달 자동화
7. 번역 검색·완료율·누락 필터 및 실제 15개 언어 번역 확충
8. 법률 전문가의 이용약관·개인정보 처리방침 최종 검토
9. 회원별 강의 진도·재생 이력과 개인별 다운로드 이력

9번은 사용자가 추후 진행하기로 한 기능이다. 현재는 첨부파일별 총
`download_count`만 있고 사용자별 다운로드 로그와 강의 학습 이력은 없다.

## 13. 작업 시작·종료 체크리스트

시작 시:

1. `git status`, 현재 브랜치, 원격 상태를 확인한다.
2. 이 문서와 변경 영역의 설계·테스트 문서를 읽는다.
3. 기존 운영 서버가 아닌 로컬/스테이징이 대상인지 확인한다.
4. DB 변경이면 다음 마이그레이션 번호와 백업 상태를 확인한다.

종료 시:

1. 테스트·타입·린트·빌드를 실행한다.
2. 관련 문서를 갱신한다.
3. Git 커밋과 GitHub 푸시 상태를 확인한다.
4. 배포했다면 현재 릴리스, systemd, 헬스체크와 변경 URL을 확인한다.
5. 사용한 비밀값이 출력·문서·Git에 남지 않았는지 확인한다.
