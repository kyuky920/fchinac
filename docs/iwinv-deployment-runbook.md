# iwinv 배포·운영 안내

## 현재 스테이징 환경

- 서버: iwinv `vgna_2_n` (2 vCPU, 2 GB RAM, NVMe 50 GB)
- 운영체제: Ubuntu 24.04 LTS
- 공개 주소: `http://49.247.201.154`
- 애플리케이션: Node.js 24 standalone Next.js, systemd
- 프록시: Nginx
- 데이터베이스: MariaDB 10.11, 로컬 소켓/루프백 전용
- 파일: `/var/lib/fchinac/uploads`
- 릴리스: `/opt/fchinac/releases/<git-commit>`
- 현재 릴리스 링크: `/opt/fchinac/current`
- 비밀 환경변수: `/etc/fchinac/env` (Git 제외)

운영 도메인을 연결하기 전까지 HTTP와 IP 주소를 사용한다. 따라서 스테이징의
`SESSION_COOKIE_SECURE`는 `false`다. 도메인과 TLS를 적용할 때 반드시 `true`로
바꾼다.

## 네트워크와 보안

- iwinv ELCAP 인바운드: TCP 22, 80, 443
- iwinv ELCAP 아웃바운드: DNS TCP/UDP 53, HTTP 80, HTTPS 443
- UFW 인바운드: OpenSSH, Nginx Full
- SSH: 공개키 인증, 비밀번호·키보드 대화식 인증 차단
- Fail2ban: SSH 실패 5회, 1시간 차단
- ICMP: ELCAP에서 차단
- OS 보안 업데이트: `unattended-upgrades`

SSH 22번 포트는 현재 공개키 인증을 전제로 모든 IP에서 접근할 수 있다. 고정된
관리자 IP가 확보되면 ELCAP의 SSH 소스를 해당 CIDR로 제한한다.

## 로컬 빌드와 배포

서버에서는 빌드하지 않는다. Mac에서 검증하고 standalone 결과물만 보낸다.

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

새 릴리스 디렉터리에 `.next/standalone`, `.next/static`, `public`을 전송한 다음
`/opt/fchinac/current` 심볼릭 링크를 원자적으로 바꾸고 서비스를 재시작한다.

```sh
sudo ln -sfn /opt/fchinac/releases/<git-commit> /opt/fchinac/current
sudo systemctl restart fchinac
curl --fail http://127.0.0.1/api/health
```

문제가 생기면 `current`를 직전 릴리스로 되돌리고 다시 시작한다.

## 서비스 확인

```sh
systemctl status fchinac nginx mariadb fail2ban
journalctl -u fchinac --since "30 minutes ago"
curl --fail http://127.0.0.1/api/health
```

정상 헬스 응답은 애플리케이션과 DB가 모두 `ok`여야 한다.

## 백업

`fchinac-backup.timer`가 매일 03:30 KST 전후에 DB와 첨부파일을 백업한다.
파일은 `/var/backups/fchinac`에 7일간 보관하며 권한은 root 전용이다.

```sh
systemctl list-timers fchinac-backup.timer
systemctl start fchinac-backup.service
journalctl -u fchinac-backup.service
```

이 백업은 서버 디스크 장애를 막지 못한다. 운영 전환 전에는 별도 오브젝트
스토리지로 암호화 복제하고 정기 복구 테스트를 추가한다.

## 운영 전환 전 필수 작업

1. 별도의 스테이징 서브도메인을 새 IP로 연결한다.
2. TLS 인증서를 적용하고 HTTP를 HTTPS로 전환한다.
3. `SESSION_COOKIE_SECURE=true`로 변경한다.
4. 관리자 암호를 새 강력한 암호로 교체하고 불필요한 레거시 계정을 잠근다.
5. 외부 백업과 복구 테스트를 설정한다.
6. 기존 운영 도메인의 DNS 전환은 최종 인수 테스트 후 별도로 진행한다.

기존 운영 서버에는 이 절차로 접근하거나 변경하지 않는다.
