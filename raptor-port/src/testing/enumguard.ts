/* THE COUNTER BEHIND THE TWO MULTI-SQUADRON GUARDS (batch 1, step 3 — engine/roster-readers.test.ts for the people,
   engine/inputsfor-readers.test.ts for the inputs). It counts ENUMERATIONS, not files: how many times each source file
   walks a whole list, after its comments, its quoted strings and its import lines are taken out — so a second loop added
   to a file already allowed one turns its guard red as surely as a first loop in a new file.

   In the `testing` folder on purpose: the guards' own file walk skips it, as it skips every test file. */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/* a line, a block and a JSX comment out (the same stripper as engine/inputs-readers.test.ts) */
export const code = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
/* …then every quoted string emptied — a name spelt inside quotes reaches nothing (storage/keyowner.ts names the
   singletons as strings) — and every import line, which names a list without walking it. A template string keeps its
   `${…}` holes' code out too: none of the lists is ever walked inside one. */
export const bare = (s: string): string => code(s)
  .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''")
  .replace(/^\s*import\s[\s\S]*?\sfrom\s*''/gm, '')

export function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) { if (f !== 'testing') sourceFiles(p, out) }
    else if (/\.(ts|tsx|js|jsx)$/.test(f) && !/\.test\.|\.spec\.|test-setup|testkit/.test(f)) out.push(p)
  }
  return out
}

/* every file's count of `re`'s matches (only files with one or more), keyed by its path under `root` with forward
   slashes. A match the `exempt` test accepts — handed the whole line it stands on — is not counted. */
export function countAll(root: string, re: RegExp, exempt?: (line: string) => boolean): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of sourceFiles(root)) {
    const n = countIn(readFileSync(p, 'utf8'), re, exempt)
    if (n) out[relative(root, p).replace(/\\/g, '/')] = n
  }
  return out
}
export function countIn(src: string, re: RegExp, exempt?: (line: string) => boolean): number {
  let n = 0
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  for (const line of bare(src).split('\n')) for (const _m of line.matchAll(g)) { if (!exempt || !exempt(line)) n++ }
  return n
}
