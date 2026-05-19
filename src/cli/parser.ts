export type ParsedCommand = {
  cmd: string;
  args: string[];
  flags: Record<string, boolean>;
};

export function parse(input: string): ParsedCommand {
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0] ?? '';
  const args: string[] = [];
  const flags: Record<string, boolean> = {};

  for (const token of tokens.slice(1)) {
    if (token.startsWith('--')) flags[token.slice(2)] = true;
    else args.push(token);
  }

  return { cmd, args, flags };
}
