import type { OutputLine } from './output/types';
import { help } from './commands/help';
import { whoami } from './commands/whoami';
import { cowsay } from './commands/cowsay';
import { time } from './commands/time';
import { theme } from './commands/theme';

export type CommandHandler = (
  args: string[],
  flags: Record<string, boolean>,
) => OutputLine | OutputLine[] | void;

export const registry: Record<string, CommandHandler> = {
  help,
  whoami,
  cowsay,
  time,
  theme,
};

// Tab completion candidates for each command's arguments
export const argCompletions: Record<string, string[]> = {
  theme: ['dark', 'light'],
};
