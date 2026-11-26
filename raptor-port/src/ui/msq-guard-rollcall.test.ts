/* THE GUARD RAIL'S ROLL-CALL TESTS — they read the source; no app is mounted (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.4). Step 0 (K0) writes R9 alone; R1–R8 are written red
   first in the steps that build what they hold (§3.4's table).

   R9 "every test file of the guard and of part V sets up three squadrons" (his D2630; §10 step 0 (b); §21's ranges
   table): every test file under src/ whose name starts `msq-guard-`, `msq-s2-` or `msq-s3-` — those three prefixes
   EXACTLY, never a looser match, which would catch the eight existing `msq-users-*` and `msq-bell-*` files that stay on
   two squadrons — calls `withThird()` (test-support/msq-world.ts) in its set-up: a line of its own, at the start of the
   line, not inside a comment. `msq-s4-` (the posting sheet) has its own set-up (§21.4) and is not read here.
   This file is one of those it reads, so it calls `withThird()` itself. */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { withThird } from '../test-support/msq-world'

withThird()

const SRC = join(__dirname, '..')
export const R9_PREFIXES = ['msq-guard-', 'msq-s2-', 'msq-s3-'] as const

function testFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'node_modules') testFiles(p, out) }
    else if (/\.test\.tsx?$/.test(name)) out.push(p)
  }
  return out
}
/* the files R9 reads: a test file whose own name starts with one of the three prefixes */
export const r9Caught = (file: string): boolean => R9_PREFIXES.some(px => basename(file).startsWith(px))
/* a call of withThird() on a line of its own — not a mention in a comment or a string */
export const callsWithThird = (src: string): boolean => /^withThird\(\)/m.test(src)

describe('R9 — every test file of the guard and of part V sets up three squadrons', () => {
  it('each msq-guard-, msq-s2- and msq-s3- test file calls withThird() in its set-up', () => {
    const caught = testFiles(SRC).filter(r9Caught)
    expect(caught.length, 'the guard\'s own files are found (this one among them)').toBeGreaterThan(0)
    const missing = caught.filter(f => !callsWithThird(readFileSync(f, 'utf8'))).map(f => f.slice(SRC.length + 1).replace(/\\/g, '/'))
    expect(missing, 'a test file of the guard rail or part V that does not set up the third squadron — add withThird() (his D2630)').toEqual([])
  })
  it('the match is the three prefixes exactly: the eight two-squadron files (msq-users-*, msq-bell-*) are not caught', () => {
    const two = testFiles(SRC).filter(f => /^msq-(users|bell)-/.test(basename(f)))
    expect(two.length, 'the eight existing files').toBe(8)
    expect(two.filter(r9Caught)).toEqual([])
    /* …nor a name that only contains a prefix, nor the posting sheet's own */
    for (const n of ['x-msq-guard-a.test.ts', 'msq-guardian.test.ts', 'msq-s4-posting.test.tsx', 'msq-s20-a.test.ts', 'msq-users-x.test.tsx'])
      expect(r9Caught(join(SRC, 'ui', n)), n).toBe(false)
    for (const n of ['msq-guard-a.test.ts', 'msq-s2-users.test.tsx', 'msq-s3-bell.test.tsx'])
      expect(r9Caught(join(SRC, 'ui', n)), n).toBe(true)
  })
  it('a mention in a comment is not a call', () => {
    expect(callsWithThird('/* withThird() */\nuseMsqWorld()\n')).toBe(false)
    expect(callsWithThird('import { withThird } from "x"\n// withThird()\n')).toBe(false)
    expect(callsWithThird('import { withThird } from "x"\n\nwithThird()\n')).toBe(true)
  })
})
