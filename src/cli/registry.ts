/**
 * Command registry — the single source of truth for what the CLI can do.
 *
 * To add a new command:
 *   1. Create src/cli/commands/<name>.ts and export a CommandHandler.
 *   2. Import it here and add it to `registry`.
 *   3. If the command takes fixed arguments, add them to `argCompletions`.
 */

import type { OutputLine } from './output/types';
import { help }   from './commands/help';
import { whoami } from './commands/whoami';
import { cowsay } from './commands/cowsay';
import { clear }  from './commands/clear';
import { time }   from './commands/time';
import { theme }  from './commands/theme';

/**
 * A command handler receives the parsed args/flags and returns:
 * - OutputLine   — a single line to append
 * - OutputLine[] — multiple lines to append
 * - void         — for side-effect-only commands (e.g. clear, theme)
 */
export type CommandHandler = (
  args: string[],
  flags: Record<string, boolean>,
) => OutputLine | OutputLine[] | void;

export const registry: Record<string, CommandHandler> = {
  help,
  whoami,
  cowsay,
  clear,
  time,
  theme,
};

/**
 * Tab-completion candidates for each command's first argument.
 * Add an entry here whenever a command has a fixed set of valid values.
 */
export const argCompletions: Record<string, string[]> = {
  theme: ['dark', 'light'],
};
