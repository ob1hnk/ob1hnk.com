import type { OutputLine } from './output/types';

export type CommandHandler = (
  args: string[],
  flags: Record<string, boolean>
) => OutputLine | OutputLine[];

// Step 5에서 명령어들이 여기 등록됨
export const registry: Record<string, CommandHandler> = {};
