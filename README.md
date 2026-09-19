# fchinac.org renewal

Next.js 기반의 안디옥성경사이버선교회 홈페이지 갱신 프로젝트다. 기존 운영
서버와 분리된 로컬 MariaDB의 마이그레이션 데이터만 사용한다.

## Documentation

- [개발 문서 안내](docs/README.md)
- [요구사항 명세서](docs/requirements-specification.md)
- [시스템 설계서](docs/system-design.md)
- [데이터베이스 설계서](docs/database-design.md)
- [테스트 계획서](docs/test-plan.md)
- [테스트 케이스 명세서](docs/test-cases.md)
- [최근 기본 테스트 결과](docs/test-results/2026-08-20.md)

## Runtime

- Node.js 24
- pnpm 11
- Next.js 16 App Router
- MariaDB 11.4+ (`mysql2`)
- standalone production output

## Local development

MariaDB 서비스와 로컬 데이터가 준비된 상태에서 다음 명령을 실행한다.

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

브라우저에서 <http://127.0.0.1:3000/ko>를 연다. 환경변수는 Git에서 제외된
`.env.local`에 저장된다.

## Database

적용 순서:

1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/003_auth_schema.sql`
3. 로컬 레거시 데이터가 있을 때 `database/migrate-legacy-local.sh`
4. `database/migrations/004_language_management.sql`
5. `database/migrations/005_member_management.sql`
6. `database/migrations/006_legacy_supported_locales.sql`
7. `database/migrations/007_registration_profile_and_legal.sql`
8. `database/migrations/008_legacy_password_scheme.sql`
9. `database/migrations/009_admin_content_and_lectures.sql`
10. `database/migrations/010_additional_supported_locales.sql`
11. `database/migrations/011_update_english_agreement_copy.sql`

`legacy_import`는 조회 전용이며 신규 애플리케이션은 `fchinac_dev`만 사용한다.

## Implemented MVP

- 기존 10개 언어와 추가 5개 언어(아랍어, 페르시아어, 네팔어, 태국어, 베트남어) URL
- 기존 MySQL 4.1 회원 로그인 호환과 성공 시 bcrypt 자동 업그레이드
- DB 기반 14일 세션과 15분/5회 로그인 실패 제한
- 역할 기반 게시판 목록·읽기·다운로드 권한
- 이전 게시물 50건과 첨부파일 38건 조회
- 레거시 HTML 서버 측 정화
- 관리자 공통 콘솔과 대시보드, 게시물 수정·삭제·공지·첨부파일 관리
- 게시판 생성·설정과 역할별 접근 권한 관리
- DB 기반 6개 강의 분류, 48개 과목, 686개 차시 및 YouTube 재생 설정 관리
- 콘텐츠 관리자 변경 이력
- 관리자 전용 언어 추가·수정, 문구별 번역, JSON 일괄 가져오기·내보내기
- DB 기반 활성 언어 선택과 대체 언어(fallback) 처리
- 승인형 회원가입, 회원 검색·상태·권한 관리, 30분 일회용 비밀번호 재설정
- 회원 관리 감사 로그와 차단 시 전체 세션 자동 종료
- GitHub Actions의 Node.js 24 / MariaDB 11.4 빌드 검증

## Language management

관리자 계정으로 `/{locale}/admin/languages`에 접속한다. 언어 코드를 새로
등록하면 별도 코드 배포 없이 URL과 상단 언어 선택기에 반영된다. 개별 문구는
키 단위로 수정할 수 있으며, JSON 형식으로 여러 언어와 번역 전체를 원자적으로
가져올 수 있다. 내보내기 JSON의 `catalogKeys`가 현재 화면에서 지원하는 전체
문구 키 목록이다. 번역이 없는 문구는 해당 언어의 `fallbackCode`, 영어,
한국어 순서로 표시된다. 신규 언어의 기본 `fallbackCode`는 영어다.

## Production build

```sh
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

실행 시 `.env.local`을 배포 산출물에 복사하지 않는다. Cafe24에서는
`/etc/fchinac/env` 같은 서버 전용 파일을 PM2가 읽어 환경변수로 주입한다.
