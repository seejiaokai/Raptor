/* EVERY MARK A LIVE WARNING RAISES IS FILED LIVE — read off the validator's own source ([LEAVE-LATE-PUBLISHED], Fable's
   second read #4, 26 Sep 26). A published face lays the warnings that stay live (validate.ts LIVE_ON_FACE — owner D183,
   D184, D185) over the frozen ones WITH their rings and flags, which the day loop files by the code its mark site names
   (`fz` / `lv`). A future mark site of a live warning that forgot its code would file its ring as frozen: stored with the
   version, compared, and a published day would read pending for a change the ruling made live — and the behaviour pins
   (latepub.test "every ring a live warning raises …") only catch the codes their fixture raises. This one reads every
   mark site: the warning it belongs to is the next one the source raises after it, and its code must be named exactly
   when that warning is live — never on a frozen warning's mark. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { LIVE_ON_FACE } from './validate'

const SRC = readFileSync(new URL('./validate.ts', import.meta.url), 'utf8').split('\n')
const MARK = /\bmark(Ring|Chip|Dash)\(([^()]*)\)/g
const ADD = /\badd\('(?:hard|adv|note)','([A-Z_0-9]+)'/

describe('the mark sites name their warning exactly when it stays live', () => {
  const sites: Array<{ line: number, calls: string[], code: string | null }> = []
  SRC.forEach((l, i) => {
    if (/const mark(Ring|Chip|Dash)=/.test(l)) return                       // the definitions
    const calls = [...l.matchAll(MARK)].map(m => m[2]!)
    if (!calls.length) return
    let code: string | null = null
    for (let j = i; j < Math.min(SRC.length, i + 25) && !code; j++) {
      const m = ADD.exec(SRC[j]!.slice(j === i ? SRC[i]!.search(MARK) : 0)); if (m) code = m[1]!
    }
    sites.push({ line: i + 1, calls, code })
  })

  it('reads a mark site for every live code that marks (the pin looks at real sites)', () => {
    const seen = new Set(sites.map(s => s.code))
    for (const c of ['CREW_REST', 'CREW_TIGHT', 'DAYS_RUN', 'QUAL', 'SC_QUAL', 'AAR_QUAL', 'AAR_INSTR']) expect(seen.has(c), c).toBe(true)
    expect(sites.length, 'the validator\'s mark sites').toBeGreaterThan(30)
  })

  it('a live warning\'s marks name its code; a frozen warning\'s marks name no live code', () => {
    for (const s of sites) {
      const live = !!s.code && LIVE_ON_FACE.has(s.code)
      for (const args of s.calls) {
        const last = (/,\s*'([A-Z_0-9]+)'\s*$/.exec(args) || [])[1] || null
        const named = !!last && LIVE_ON_FACE.has(last)
        if (live) expect(last, `validate.ts:${s.line} — a ${s.code} mark must name '${s.code}' (${args})`).toBe(s.code)
        else expect(named, `validate.ts:${s.line} — a mark of ${s.code || 'no warning'} names a live code (${args})`).toBe(false)
      }
    }
  })
})
