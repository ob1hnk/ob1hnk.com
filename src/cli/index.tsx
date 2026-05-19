import { useRef, useState, type KeyboardEvent } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useCLIStore } from '../store';
import { parse } from './parser';
import { registry } from './registry';
import type { OutputLine } from './output/types';

export function CLIWindow() {
  const { isOpen, outputLines, inputHistory, appendOutput, clearOutput, pushHistory, close } =
    useCLIStore();
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  if (!isOpen) return null;

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    appendOutput({ type: 'text', content: `$ ${trimmed}` });
    pushHistory(trimmed);
    setInput('');
    setHistIdx(-1);

    const { cmd, args, flags } = parse(trimmed);

    if (cmd === 'clear') {
      clearOutput();
      return;
    }

    const handler = registry[cmd];
    if (!handler) {
      appendOutput({ type: 'error', content: `command not found: ${cmd}` });
      return;
    }

    const result = handler(args, flags);
    if (!result) return;
    const lines = Array.isArray(result) ? result : [result];
    lines.forEach((l) => appendOutput(l));
    setTimeout(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
    }, 0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      className="fixed z-50 flex flex-col rounded-lg overflow-hidden"
      style={{
        width: 600,
        height: 400,
        left: 'calc(50% - 300px)',
        top: '20vh',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Titlebar — drag handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-4 h-9 shrink-0 select-none cursor-grab active:cursor-grabbing"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-mono text-xs text-(--text)">ob1hnk ~ terminal</span>
        <button
          onClick={close}
          className="w-5 h-5 flex items-center justify-center rounded text-(--text) hover:text-(--text-h) hover:bg-[var(--border)]"
        >
          ×
        </button>
      </div>

      {/* Output area */}
      <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-sm space-y-0.5">
        {outputLines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
      </div>

      {/* Input */}
      <div
        className="flex items-center px-4 h-9 shrink-0 font-mono text-sm"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="mr-2" style={{ color: 'var(--accent)' }}>$</span>
        <input
          autoFocus
          className="flex-1 bg-transparent outline-none text-(--text-h) caret-[var(--accent)]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </motion.div>
  );
}

function Line({ line }: { line: OutputLine }) {
  if (line.type === 'ascii') {
    return <pre className="text-(--text-h) leading-tight">{line.content}</pre>;
  }
  if (line.type === 'table') {
    // TODO: table renderer
    return <span className="text-(--text)">[table]</span>;
  }
  if (line.type === 'component') {
    return <>{line.content}</>;
  }
  const isPrompt = line.type === 'text' && line.content.startsWith('$ ');
  return (
    <span
      className={
        line.type === 'error' ? 'text-red-400' : isPrompt ? 'text-(--text)' : 'text-(--text-h)'
      }
    >
      {line.content}
    </span>
  );
}
