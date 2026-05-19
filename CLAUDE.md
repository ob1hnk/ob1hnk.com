# ob1hnk.com — CLAUDE.md

> Claude Code가 자동으로 읽는 프로젝트 컨텍스트 파일.
> 항상 최신 상태를 유지할 것.

---

## 프로젝트 개요

한나의 개인 웹사이트. "목적 없는 탐험"이 컨셉인 인터랙티브 공간.
데스크탑 OS 메타포 위에 자유롭게 배치된 아이템들 + 강력한 CLI.
방문자가 발견하고 만지며 경험하는 사이트. 명시적 CTA 없음.

---

## 기술 스택

- **Frontend**: Vite + React + TypeScript
- **Routing**: React Router (lazy loading)
- **Styling**: Tailwind CSS (컴포넌트 라이브러리 사용 지양)
- **State**: Zustand (slices 패턴)
- **Animation**: Framer Motion (드래그 + timeScale)
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **Hosting**: Vercel

---

## 핵심 아키텍처 원칙

1. **Zustand 글로벌 store** — CLI가 만지는 모든 상태가 여기 있음 (`src/store/`)
2. **timeScale 룰** — 모든 Framer Motion 애니메이션은 `useSiteStore().timeScale` 참조
3. **Command Registry 패턴** — 명령어 = 객체의 키 하나 등록 (`src/cli/registry.ts`)
4. **Output Type System** — CLI 출력은 `text | error | table | ascii | component | stream`
5. **GUI와 CLI는 같은 store를 공유** — 드래그 결과를 CLI로 조회 가능하고 반대도 성립

---

## 폴더 구조 (목표)

```
src/
  store/
    index.ts              ✅ 슬라이스 re-export
    slices/
      cli.ts              ✅ CLI 상태 (isOpen, outputLines, history)
      site.ts             ✅ 사이트 상태 (timeScale, theme, cursor, ...)
      floatingItems.ts    🔲 나중에 추가
      auth.ts             🔲 나중에 추가
  cli/
    index.tsx             🔲 CLIWindow 컴포넌트 (드래그 가능한 창)
    parser.ts             ✅ 입력 문자열 → { cmd, args, flags }
    registry.ts           ✅ 명령어 레지스트리 (비어있음)
    history.ts            🔲 ↑↓ 히스토리 탐색
    output/
      types.ts            ✅ OutputLine 타입 정의
      renderer.tsx        🔲 타입별 렌더러
    commands/
      help.ts             🔲
      whoami.ts           🔲
      cowsay.ts           🔲
      clear.ts            🔲 (파일만 있음)
      time.ts             🔲
      theme.ts            🔲
  components/
    FloatingItem.tsx      🔲 드래그 가능한 개별 아이템
    Desktop.tsx           🔲 절대 위치 레이아웃 컨테이너
  pages/
    Home.tsx              ✅
    Admin.tsx             ✅ (Supabase 연결 테스트 포함)
  hooks/
    useGlobalShortcut.ts  🔲 백틱/Ctrl+` → CLI 토글
  lib/
    supabase.ts           ✅
```

---

## 결정된 사항

### 2025-05-19
- CLI UI: **드래그 가능한 창** (하단 바 없이). Framer Motion drag 사용.
  - 이유: 데스크탑 메타포와 컨셉 일관성. 최소화 시 하단 탭으로 전환 가능.
- CLI 구현 순서: Store 골격 + 창 껍데기 → Parser + Registry → Output System
- 백틱(`) 또는 Ctrl+` 로 CLI 토글

---

## 구현 현황 체크리스트

```
✅ Node LTS (nvm)
✅ Vite + React + TypeScript
✅ React Router + BrowserRouter + Home 컴포넌트
✅ 로컬 dev 서버 동작
✅ Git: 홈 디렉토리 잘못된 .git 정리 완료
✅ GitHub push
✅ Tailwind CSS v4 설치
✅ 폴더 구조 정리 (목표 구조로)
✅ Zustand store 골격 (slices 패턴: cli.ts, site.ts)
✅ Supabase 연결 확인 (/admin 페이지)
✅ Vercel 배포 + Analytics
🔲 CLIWindow 컴포넌트 (드래그 가능한 창)
🔲 useGlobalShortcut (백틱 토글)
🔲 Parser + Command Registry
🔲 첫 명령어들 (help, whoami, cowsay, clear, time, theme)
🔲 Desktop + FloatingItem 컴포넌트
🔲 store/slices/floatingItems.ts
🔲 store/slices/auth.ts
```

---

## 작업 스타일 가이드 (Claude Code용)

- 무엇을, 왜인지 짧게 설명 후 구현
- 옵션이 있으면 트레이드오프 명시
- 학습보다 scalability/구현 품질/목적 부합 우선
- 한국어로 대화
- 코드 변경 후 "다음 할 일" 항상 명시

### 업무 종료 시 필수 출력

매 작업이 끝나면 반드시 아래 두 가지를 출력할 것:

1. **Claude Web에서 받아와야 할 정보** — 설계 결정, 컨텐츠, 디자인 방향 등 Claude Code가 혼자 결정하면 안 되는 것들. 없으면 "없음" 명시.
2. **껍데기(TODO) 목록** — 현재 파일은 있지만 내용이 구현되지 않은 것들. 없으면 "없음" 명시.
