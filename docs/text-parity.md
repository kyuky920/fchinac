# 기존 홈페이지 문구 정합성 기준

## 기준과 우선순위

1. 로컬에 복제한 `legacy_import.multi_lang_dtl`, `legacy_import.video_path`
2. `local-test/source/theme/antioch/*.php`의 표시 순서와 정적 문구
3. 백업에 없는 신규 언어는 영어를 대체 언어로 사용하고, 영어에도 없는 원본 콘텐츠만 한국어를 유지

운영 서버는 대조·수정·테스트 대상으로 사용하지 않는다.

## 적용 범위

| 화면 | 원본 기준 | 적용 내용 |
|---|---|---|
| 메인 | `index.php`, `multi_lang_dtl` | 성경구절 3개, ABOUT US 5개, OUR VISION 5개, WE ARE 4개, 연락처 |
| 선교회 소개 | `introduce.php`, `multi_lang_dtl` | 소개 성경구절, 제목, 본문, 서명 |
| 연혁 | `history.php`, `multi_lang_dtl` | 선교회 15건, 가락동부교회 6건 |
| 교수 소개 | `professor.php` | 21명의 영문 이름과 약력 전체 |
| 가입안내 | `join.php`, `multi_lang_dtl` | 제목과 공지 8개, 회원가입 연결 |
| 동영상강의 | `video_direct.php`, `video_path` | 6개 분류, 48개 강좌의 강의명과 차수 |
| 공통 푸터 | `tail.php`, `multi_lang_dtl` | 주소, 전화, 팩스, 이메일, 무단 사용 경고 |

## 관리 규칙

- 정적 원본 데이터는 `lib/legacy-content.ts`에서 건수와 순서를 관리한다.
- 화면은 `site_translations` 값을 우선하고, 없으면 원본 기본값을 표시한다.
- 언어 관리자가 JSON을 내보낼 때 `catalogKeys`에 모든 현재 화면 키가 포함되어야 한다.
- 이메일 오타 `ture323@naver.com`은 푸터의 정상 표기 `true323@naver.com`으로 통일한다.
