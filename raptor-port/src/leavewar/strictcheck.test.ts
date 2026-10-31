/* STRICT CHECKING STAYS STRICT IN THE LEAVE WAR (his D1537, 31 Oct 26 — built with the Leave War's small-fixes batch). Every
   value in the Leave War's code has its real type: no "anything goes" mark — `: any`, `as any`, `any[]`, `<any>`,
   `Record<string, any>`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`. This test reads every non-test file under
   src/leavewar/ and fails on a new one, so the area cannot drift back (the M365 plan's point 16: "no new mark added"). A mark
   that truly cannot go stays only with its reason on the line above, a comment starting `// any:` — the one way through. Tests
   are not read (a test may build a loose fixture). Comments are skipped, so the word "any" in prose never counts. */
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const MARK = /:\s*any\b|\bas any\b|<any>|\bany\[\]|Record<string,\s*any>|@ts-ignore|@ts-nocheck|@ts-expect-error/

function files(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name)
    if (statSync(p).isDirectory()) out.push(...files(p))
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) && name !== 'testkit.ts' && name !== 'more-testkit.ts') out.push(p)
  }
  return out
}

/** each line's code with its comments taken out — a block comment may run over many lines; a `//` ends the line's code.
 *  The ts-* switches live in comments, so they are looked for in the raw line. */
export function looseMarks(src: string): Array<{ line: number; text: string }> {
  const lines = src.split(/\r?\n/)
  const hits: Array<{ line: number; text: string }> = []
  let inBlock = false
  lines.forEach((raw, i) => {
    let code = ''
    let k = 0
    while (k < raw.length) {
      if (inBlock) {
        const end = raw.indexOf('*/', k)
        if (end < 0) { k = raw.length; break }
        inBlock = false; k = end + 2; continue
      }
      const open = raw.indexOf('/*', k), line = raw.indexOf('//', k)
      if (line >= 0 && (open < 0 || line < open)) { code += raw.slice(k, line); k = raw.length; break }
      if (open >= 0) { code += raw.slice(k, open); inBlock = true; k = open + 2; continue }
      code += raw.slice(k); k = raw.length
    }
    const tsSwitch = /@ts-(ignore|nocheck|expect-error)/.test(raw)
    if (!MARK.test(code) && !tsSwitch) return
    if (i > 0 && /^\s*\/\/ any:\s*\S/.test(lines[i - 1]!)) return
    hits.push({ line: i + 1, text: raw.trim() })
  })
  return hits
}

describe('the Leave War has no "anything goes" mark (D1537)', () => {
  it('the reader finds a mark in code, and skips the word in comments and a mark with its reason', () => {
    expect(looseMarks('const a: any = 1')).toHaveLength(1)
    expect(looseMarks('f(x as any)')).toHaveLength(1)
    expect(looseMarks('// @ts-ignore\nf()')).toHaveLength(1)
    expect(looseMarks('/* as any group\n   any row */\nconst b = 1 // any day')).toHaveLength(0)
    expect(looseMarks('// any: the engine hands it untyped\nconst c: any = 1')).toHaveLength(0)
  })
  it('none in the Leave War’s own code', () => {
    const found = files(ROOT).flatMap(f => looseMarks(readFileSync(f, 'utf8')).map(h => `${path.relative(ROOT, f)}:${h.line}  ${h.text}`))
    expect(found, 'give each value its real type, or write its reason on the line above as `// any: …`').toEqual([])
  })
})
