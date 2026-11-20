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
   singletons as strings) — and every import line, which names a list without walking it. A template string loses only
   its literal text: the code in its `${…}` holes is KEPT and counted (C9 of the reshape — the html builders walk lists
   inside those holes, and a guard that emptied the whole template counted none of it). The literal text's newlines are
   kept, so each hole's code stays on the line it stands on for the `exempt` test. */
export const bare = (s: string): string => quotesOut(code(s)).replace(/^\s*import\s[\s\S]*?\sfrom\s*''/gm, '')

/* One pass: a '…' or "…" string becomes '' ; a `…` template keeps only its holes' code, each scanned the same way (a
   string or a template inside a hole). Braces are counted inside a hole, so an object literal's } never closes it. */
function quotesOut(s: string): string {
  let i = 0
  const n = s.length
  /* code up to the end — or, inside a hole, up to the } that closes it (left unread) */
  const codeUntil = (inHole: boolean): string => {
    let out = ''
    let depth = 0
    while (i < n) {
      const c = s[i]
      if (c === "'" || c === '"') {
        i++
        while (i < n && s[i] !== c && s[i] !== '\n') i += s[i] === '\\' ? 2 : 1
        i++
        out += "''"
      } else if (c === '`') out += templateText()
      else if (c === '{') { depth++; out += c; i++ }
      else if (c === '}') {
        if (inHole && depth === 0) return out
        depth--; out += c; i++
      } else { out += c; i++ }
    }
    return out
  }
  /* from an opening backtick to its closing one: the literal text dropped (its newlines kept), each hole's code kept */
  const templateText = (): string => {
    let out = '`'
    i++
    while (i < n) {
      const c = s[i]
      if (c === '\\') i += 2
      else if (c === '`') { i++; return out + '`' }
      else if (c === '$' && s[i + 1] === '{') { i += 2; out += '${' + codeUntil(true) + '}'; i++ }
      else { if (c === '\n') out += '\n'; i++ }
    }
    return out
  }
  return codeUntil(false)
}

/* the app's source: test files, this folder and test-support/ (test worlds, which no file of the app may import —
   test-support/no-app-import.test.ts) are not the app, so a test world putting the roster back is no walk */
export function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) { if (f !== 'testing' && f !== 'test-support') sourceFiles(p, out) }
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
