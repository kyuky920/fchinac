# AI agent working agreement

이 저장소에서 작업을 시작하는 AI 에이전트는 먼저 다음 문서를 순서대로 읽는다.

1. `docs/ai-agent-handoff.md`
2. `docs/requirements-specification.md`
3. 변경 영역에 해당하는 설계·테스트 문서

필수 원칙:

- 기존 운영 서버와 기존 `fchinac.org` 서비스는 명시적인 전환 승인 전까지 절대 변경하지 않는다.
- 현재 개발·검증 대상은 iwinv 스테이징 `49.247.201.154`와 로컬 `fchinac_dev`다.
- 비밀번호, SSH 개인키, DB URL, 회원 개인정보, 백업 원문을 Git 또는 문서에 기록하지 않는다.
- 서버에서 소스를 빌드하지 않는다. 로컬에서 `test`, `typecheck`, `lint`, `build`를 통과한 standalone 산출물만 배포한다.
- DB 변경은 다음 번호의 마이그레이션 파일로 남기고, 적용 전 백업과 롤백 영향을 검토한다.
- 화면·문구 변경은 지원 언어 15개와 영어 fallback을 함께 확인한다. 아랍어와 페르시아어는 RTL이다.
- 변경 후 관련 요구사항·설계·테스트·인수인계 문서를 함께 갱신한다.
- 배포 후 `/api/health`, 변경 URL, systemd 서비스와 현재 릴리스 링크를 확인한다.

현재 상태와 알려진 후속 과제는 `docs/ai-agent-handoff.md`를 단일 기준으로 삼는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
