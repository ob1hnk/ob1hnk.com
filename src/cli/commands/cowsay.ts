import type { CommandHandler } from '../registry';

function render(msg: string): string {
  const len = msg.length;
  return [
    ` ${'_'.repeat(len + 2)}`,
    `< ${msg} >`,
    ` ${'-'.repeat(len + 2)}`,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ].join('\n');
}

export const cowsay: CommandHandler = (args) => ({
  type: 'ascii',
  content: render(args.join(' ') || 'moo'),
});
