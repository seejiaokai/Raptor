/* OIL IS EARNED LEAVE, NOT PAY — ON SCREEN (owner, D25, 22 Sep 26: "say it that way").
   [OIL-WORDS] ([DB-READINESS] group A, phase 7) was filed as a comments-only tidy, on the 22 Sep 26 check that no
   user-facing string said paid, pay or money. Running it found four that do — three sentences on the Logic page and the
   message a drag gets inside OIL Earn — written since, or missed then. They are reworded, and pinned here: every sentence
   the Logic page draws, and the mode's own messages, are read for the words D25 rules out.

   NOT a scan of the source: a scan cannot tell a comment from a sentence a person reads, and the comments are a
   separate, mechanical pass. This reads what is DRAWN. */
import { describe, expect, it } from 'vitest'
import { lgSettings, lgChecks } from './logic-html'
import { OIL_NO_MOVE, OIL_OPEN_END, OIL_NO_START, OIL_NO_LENGTH, OIL_FROM_ISSUED, OIL_FROM_LIVE } from './oilmode'

const PAY = /\b(money|monies|pay|pays|paid|paying|unpaid|payment|payments)\b/i
/* every string a rules group can draw: its own fields, and each item's — a function is called, as the page calls it */
const texts = (v: any, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v)
  else if (typeof v === 'function') { try { texts(v(), out) } catch { /* a field that needs an argument is not prose */ } }
  else if (Array.isArray(v)) v.forEach(x => texts(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach(x => texts(x, out))
  return out
}
const plain = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('no sentence a person reads calls OIL pay or money (D25)', () => {
  it('the Logic page — every setting and every check, its fold included', () => {
    const all = texts([lgSettings(), lgChecks()]).map(plain)
    expect(all.length, 'the page has sentences to read').toBeGreaterThan(40)
    const bad = all.filter(s => PAY.test(s)).map(s => { const m = PAY.exec(s)!; return `…${s.slice(Math.max(0, m.index - 60), m.index + 40)}…` })
    expect(bad).toEqual([])
  })

  /* the page was rewritten for its reader on 15 Oct 26 (owner D928-D931): its OIL lines are shorter, and say the same
     rules — what earns, what a published day keeps, the nought-minute sortie — in the words D25 asks for */
  it('the OIL rule still says what it said, in the words D25 asks for', () => {
    const all = texts([lgSettings(), lgChecks()]).map(plain).join(' ')
    expect(all).toContain('A published day keeps its OIL until it is published again')
    expect(all).toContain('A row with no times, or no end time, earns nothing')
    /* [OIL-ZERO-SPAN-SORTIE] (20 Oct 26): the line says when a nought-minute sortie earns nothing too (D932) */
    expect(all).toContain('A flying line still earns its OIL from the report before it and the debrief after it, and none if it has neither; a standby shift with no length earns none')
  })

  it('the mode\'s own messages', () => {
    for (const s of [OIL_NO_MOVE, OIL_OPEN_END, OIL_NO_START, OIL_NO_LENGTH, OIL_FROM_ISSUED, OIL_FROM_LIVE]) expect(s).not.toMatch(PAY)
    expect(OIL_NO_MOVE).toBe('Leave OIL Earn before moving anyone — the day cannot change while you are deciding what it earns')
  })
})
