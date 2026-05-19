/**
 * Completion helpers for the CLI input.
 *
 * getCompletions — given the current input string, returns a list of candidates.
 *   - If the user is still typing the command name (no space yet), it matches
 *     against all registered command names.
 *   - If the user has typed a command + space, it matches against that command's
 *     argCompletions entries.
 *
 * applyCompletion — splices the chosen completion back into the input string,
 *   preserving any already-typed tokens before the last one.
 */

import { registry, argCompletions } from './registry';

export function getCompletions(val: string): string[] {
  const tokens = val.trimStart().split(/\s+/);

  if (tokens.length <= 1) {
    // Completing the command name
    const partial = tokens[0] ?? '';
    if (!partial) return [];
    const all = Object.keys(registry); // registry already includes 'clear' now
    return all.filter((c) => c.startsWith(partial) && c !== partial);
  }

  // Completing an argument for a known command
  const argList = argCompletions[tokens[0]] ?? [];
  const partial  = tokens[tokens.length - 1];
  return argList.filter((a) => a.startsWith(partial) && a !== partial);
}

export function applyCompletion(val: string, comp: string): string {
  const tokens = val.trimStart().split(/\s+/);
  // Replace the last token with the completed value
  return tokens.length <= 1 ? comp : tokens.slice(0, -1).join(' ') + ' ' + comp;
}
