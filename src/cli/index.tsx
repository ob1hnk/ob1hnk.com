import { useRef, useState, useEffect, type KeyboardEvent } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useCLIStore } from '../store';
import { parse } from './parser';
import { registry, argCompletions } from './registry';
import type { OutputLine } from './output/types';

const C = {
  bg:      '#0c0c0c',
  text:    '#33ff33',
  dim:     'rgba(51,255,51,0.45)',
  error:   '#ff4444',
  titleBg: '#111111',
  border:  '#2a2a2a',
} as const;

export function CLIWindow() {
  const { isOpen, outputLines, inputHistory, appendOutput, clearOutput, pushHistory, close } =
    useCLIStore();
  const [input, setInput]       = useState('');
  const [histIdx, setHistIdx]   = useState(-1);
  const [tabComps, setTabComps] = useState<string[]>([]);
  const [tabIdx, setTabIdx]     = useState(-1);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();

  // Always scroll to keep the prompt visible
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [outputLines.length, tabComps.length]);

  if (!isOpen) return null;

  // --- Completion helpers ---
  const getCompletions = (val: string): string[] => {
    const tokens = val.trimStart().split(/\s+/);
    if (tokens.length <= 1) {
      const partial = tokens[0] ?? '';
      if (!partial) return [];
      const all = ['clear', ...Object.keys(registry)];
      return all.filter((c) => c.startsWith(partial) && c !== partial);
    }
    const argList = argCompletions[tokens[0]] ?? [];
    const partial  = tokens[tokens.length - 1];
    return argList.filter((a) => a.startsWith(partial) && a !== partial);
  };

  const applyCompletion = (val: string, comp: string): string => {
    const tokens = val.trimStart().split(/\s+/);
    return tokens.length <= 1 ? comp : tokens.slice(0, -1).join(' ') + ' ' + comp;
  };

  // --- Submit ---
  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    pushHistory(trimmed);
    setInput('');
    setHistIdx(-1);
    setTabComps([]);
    setTabIdx(-1);

    const { cmd, args, flags } = parse(trimmed);

    // clear is handled before echoing anything
    if (cmd === 'clear') {
      clearOutput();
      return;
    }

    // Blank separator before each new command (except the very first)
    if (useCLIStore.getState().outputLines.length > 0) {
      appendOutput({ type: 'text', content: '' });
    }
    appendOutput({ type: 'text', content: `$ ${trimmed}` });

    const handler = registry[cmd];
    if (!handler) {
      appendOutput({ type: 'error', content: `command not found: ${cmd}` });
      return;
    }
    const result = handler(args, flags);
    if (!result) return;
    const lines = Array.isArray(result) ? result : [result];
    lines.forEach((l) => appendOutput(l));
  };

  // --- Keyboard ---
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (tabComps.length === 0) {
        const comps = getCompletions(input);
        if (comps.length === 1) {
          setInput(applyCompletion(input, comps[0]));
        } else if (comps.length > 1) {
          setTabComps(comps);
          setTabIdx(0);
          setInput(applyCompletion(input, comps[0]));
        }
      } else {
        const next = (tabIdx + 1) % tabComps.length;
        setTabIdx(next);
        setInput(applyCompletion(input, tabComps[next]));
      }
      return;
    }

    // Any "real" key clears completions
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
      setTabComps([]);
      setTabIdx(-1);
    }

    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, inputHistory.length - 1);
      setHistIdx(next);
      setInput(inputHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : (inputHistory[next] ?? ''));
    }
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="fixed z-50 flex flex-col"
      style={{
        width: 640,
        height: 420,
        left: 40,
        top: 40,
        textAlign: 'left',
        background: C.bg,
        border: `1px solid ${C.border}`,
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 13,
        lineHeight: '1.55',
      }}
    >
      {/* Titlebar — drag handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-3 shrink-0 select-none cursor-grab active:cursor-grabbing"
        style={{ height: 28, background: C.titleBg, borderBottom: `1px solid ${C.border}` }}
      >
        <span style={{ color: C.dim }}>ob1hnk@terminal ~ $</span>
        <button
          onClick={close}
          style={{ color: C.dim, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
        >
          [x]
        </button>
      </div>

      {/* Terminal body: output + inline prompt */}
      <div
        className="flex-1 overflow-y-auto p-3"
        style={{ color: C.text }}
        onClick={() => inputRef.current?.focus()}
      >
        {outputLines.map((line, i) => (
          <Line key={i} line={line} />
        ))}

        {/* Prompt line */}
        <div style={{ marginTop: outputLines.length > 0 ? '0.5rem' : 0 }}>
          <div className="flex">
            <span style={{ color: C.dim, marginRight: 6, userSelect: 'none' }}>$</span>
            <input
              ref={inputRef}
              autoFocus
              className="flex-1 outline-none"
              style={{
                background: 'transparent',
                color: C.text,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                border: 'none',
                caretColor: C.text,
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {/* Tab completions shown below the prompt */}
          {tabComps.length > 0 && (
            <div style={{ paddingLeft: 18, marginTop: 2 }}>
              {tabComps.map((c, i) => (
                <span
                  key={c}
                  style={{ marginRight: 16, color: i === tabIdx ? C.text : C.dim }}
                >
                  {i === tabIdx ? `[${c}]` : c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}

function Line({ line }: { line: OutputLine }) {
  if (line.type === 'ascii') {
    return <pre style={{ color: C.text, lineHeight: 1.3, margin: 0 }}>{line.content}</pre>;
  }
  if (line.type === 'table') {
    return <span style={{ color: C.dim }}>[table]</span>;
  }
  if (line.type === 'component') {
    return <>{line.content}</>;
  }
  if (line.content === '') {
    return <div style={{ height: '0.5rem' }} />;
  }
  const isPrompt = line.type === 'text' && line.content.startsWith('$ ');
  return (
    <div style={{ color: line.type === 'error' ? C.error : isPrompt ? C.dim : C.text }}>
      {line.content}
    </div>
  );
}
