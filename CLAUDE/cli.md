# CLI — Architecture & Reference

---

## 폴더 구조

```
src/cli/
  index.tsx          CLIWindow 컴포넌트 (Framer Motion drag, input, output)
  parser.ts          입력 문자열 → { cmd, args, flags }
  registry.ts        명령어 레지스트리 + argCompletions
  completion.ts      Tab 자동완성 (getCompletions, applyCompletion)
  output/
    types.ts         OutputLine 타입 정의
    renderer.tsx     색상 팔레트(C) + Line 렌더러
  commands/
    help.ts
    whoami.ts
    cowsay.ts
    clear.ts
    time.ts
    theme.ts
```

---

## 아키텍처 원칙

**Command Registry 패턴** — 명령어 추가 = `registry.ts`에 키 하나 등록

```ts
export type CommandHandler = (
  args: string[],
  flags: Record<string, boolean>,
) => OutputLine | OutputLine[] | void;

export const registry: Record<string, CommandHandler> = {
  help, whoami, cowsay, clear, time, theme,
};

export const argCompletions: Record<string, string[]> = {
  theme: ['dark', 'light'],
};
```

**OutputLine 타입** — 현재 쓰이는 것만 정의. 새 명령어 추가 시 그때 확장.

```ts
export type OutputLine =
  | { type: 'text';  content: string }
  | { type: 'error'; content: string }
  | { type: 'ascii'; content: string };  // <pre>로 렌더, cowsay 등
```

---

## CLIWindow 주요 특징

- `<div tabIndex={0}>` 기반 입력 (not `<input>`) — block cursor 구현 위해
- `data-cli-input` 속성 — `useGlobalShortcut`이 터미널 내부 타이핑 시 toggle 방지
- 드래그: Framer Motion `useDragControls`, title bar만 drag handle (`dragListener=false`)
- 블록 커서: 깜빡임 없는 정적 흰색 사각형 `<span>`
- Tab 자동완성: 후보 1개면 즉시 적용, 복수면 인라인 목록 표시 + Tab으로 순환
- ↑↓ 히스토리 탐색: `onKeyDown` 인라인 처리 (별도 파일 불필요)

---

## 색상 팔레트 (`C` in renderer.tsx)

```ts
export const C = {
  bg:      '#000000',
  text:    '#f2f2f2',
  dim:     'rgba(242,242,242,0.4)',
  prompt:  'rgba(242,242,242,0.6)',
  error:   '#ff5f5f',
  titleBg: '#1a1a1a',
  border:  '#333333',
  cursor:  '#f2f2f2',
} as const;
```

---

## 현재 명령어

| 명령어 | 동작 |
|--------|------|
| `help` | 사용 가능한 명령어 목록 출력 |
| `whoami` | 현재 role 출력 (현재 'visitor' 하드코딩) |
| `cowsay [text]` | ASCII cow 출력 |
| `clear` | 출력 초기화 (void 반환, store 직접 호출) |
| `time` | 브라우저 로케일 기준 현재 시각 |
| `theme [dark\|light]` | 사이트 테마 변경 |

---

## CLI 토글

- 백틱(`` ` ``) 또는 `Ctrl+`` ` `` — `useGlobalShortcut.ts`
- **하단바 완성 후 제거 예정** — 이후 하단바 버튼으로만 열도록 변경

---

## 백로그

- `whoami`: 현재 'visitor' 하드코딩 → 추후 role(guest/admin) 기반으로 수정
- 다른 기능(Desktop, FloatingItem 등) 구현 후 그에 맞는 명령어 추가 예정
- Tab 자동완성: 새 명령어 추가 시 `argCompletions`에도 등록 필요
