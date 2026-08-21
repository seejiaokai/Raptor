/* The late-input mark on screen (owner, 9 Aug 26): "this late input will be
   visible throughout and it sticks with that input even though it's on view
   schedule."

   That sentence is the whole contract, and the last clause is the hard half —
   the view-only page is the one surface a scheduler cannot reach to annotate,
   and the one the squadron actually reads. So every assertion below that says
   `false` for the edit flag is load-bearing, not padding.

   Markup-level, like crewrest-ui.test.ts: jsdom cannot measure the badge, but
   it can prove which builder emitted it. The colour and the box are in
   scheduler.css and covered by the geometry gate. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, isLateInput, inputDueISO } from '../engine/inputs'
import { acceptInput, inpKey } from '../engine/slots'
import { validate, WARN } from '../engine/validate'
import { VCONF, rulesReset } from '../engine/rules'
import { dayHTML } from './html'
import { boardHTML } from './board'
import { PIOPEN } from '../state/view'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  PIOPEN.add(0); PIOPEN.add(1)   // Personal Inputs folds by default now — expand the days this file inspects
  rulesReset()
  validate()
})

/* Day 1 (Jul 14) is the day that shows the mark on the VIEW page: nasty's LL
   and shrek's OIL are both stamped after the deadline and both are Unavailable
   types, so they render to everyone with nothing accepted. Day 0's Unavailable
   block is the counter-case — its only two rows are DOWNCHITS, which are
   exempt (owner, 9 Aug 26), so that day stays clean however late they are. */
const late = () => INPUTS.find((i: any) => i.person === 'nasty')
const onTime = () => INPUTS.find((i: any) => i.person === 'bruise')
const marks = (h: string) => (h.match(/class="latetag"/g) || []).length
/* The mark lives in the REMARKS cell (owner, 9 Aug 26 — moved there out of the
   name and type cells). These two count the badges that are actually in that
   cell, so a mark that drifts back into `.nm` or the type chip fails the count
   rather than passing on a bare "contains a badge somewhere". */
const rmkMarks = (h: string) => (h.match(/class="rmk[^"]*has-late"><span class="latetag"/g) || []).length
const sbRmkMarks = (h: string) => (h.match(/class="sbi-rm"[^>]*><span class="latetag"/g) || []).length

describe('the week', () => {
  it('marks a late input in the Unavailable block, on the view-only page', () => {
    expect(isLateInput(late()), 'sanity: the fixture really is late').toBe(true)
    const v = dayHTML(1, false)
    expect(v, 'the view page draws Unavailable for everyone').toContain('sec-unav')
    expect(marks(v), 'nasty and shrek, both late leave').toBe(2)
    expect(rmkMarks(v), 'and both are in the remarks cell').toBe(2)
    expect(v, 'the name cell no longer opens on a badge').not.toContain('class="nm"><span class="latetag"')
  })

  it('leaves a day whose only late inputs are downchits completely clean', () => {
    /* day 0's Unavailable block is divot and sufa, both downchits, both
       stamped 12 Jul — the latest stamps in the seed. The exemption is what
       makes this day read clean, so this is the test that goes red if
       someone drops the downchit check out of isLateInput. */
    const v = dayHTML(0, false)
    expect(v).toContain('sec-unav')
    expect(v).toContain('OML')
    expect(marks(v), 'no mark on the view page for day 0').toBe(0)
  })

  it('does not mark an input that met the deadline', () => {
    /* bruise's Fly is stamped 20 Jun, well inside the 29 Jun deadline. It is a
       personal input, so it shows on the EDIT page — and must show clean. */
    expect(isLateInput(onTime())).toBe(false)
    const e = dayHTML(0, true)
    const row = e.slice(e.indexOf('sec-inp'), e.indexOf('sec-unav'))
    expect(row).toContain('Fly with')
    /* the block carries exactly ONE mark — yeti's appointment, the next test —
       so bruise's row being clean is the same as that count not moving. Slicing
       around the type label was the old shape of this and it stopped meaning
       anything the moment the badge moved out of that cell. */
    expect(marks(row), 'only yeti is marked in this block, not bruise').toBe(1)
  })

  it('marks it on the edit page too — the mark is not a view-only courtesy', () => {
    /* day 0's mark lives on the scheduler-only Personal Inputs block: yeti's
       appointment, stamped 6 Jul against a 29 Jun deadline. */
    expect(marks(dayHTML(0, true))).toBe(1)
  })

  it('is computed from the setting, not baked into the seed', () => {
    /* relax the deadline past every stamp and the marks clear; tighten it and
       they come back. This is what proves the Rules tab drives the badge. */
    expect(marks(dayHTML(1, false))).toBeGreaterThan(0)
    VCONF.inputLead = 0
    expect(inputDueISO()).toBe('2026-07-13')
    expect(INPUTS.some(isLateInput), 'nothing is late against a Monday deadline').toBe(false)
    expect(marks(dayHTML(1, false)), 'so the week draws no mark at all').toBe(0)
    VCONF.inputLead = 28
    expect(marks(dayHTML(1, false)), 'a four-week deadline marks them again').toBeGreaterThan(0)
  })
})

describe('a personal input promoted onto the programme', () => {
  it('carries the mark onto the VIEW page with it — the point of the ask', () => {
    /* A personal input never reaches view-only on its own; accepting it onto
       the ground programme is the only route. If the mark did not survive
       that promotion it would vanish exactly where the squadron reads the
       day, which is the one thing the owner asked for by name.
       Counted, not merely detected: Jul 14 already carries nasty's and
       shrek's marks, so "contains a mark" was true before the accept and
       would have passed for the wrong reason. */
    const inp = INPUTS.find((i: any) => i.person === 'salsa')
    expect(isLateInput(inp), 'sanity: salsa booked after the deadline').toBe(true)
    const di = 1                                    // salsa's input is Jul 14
    const before = marks(dayHTML(di, false))
    expect(acceptInput(di, inp, 'g')).toBe(true)
    const row = DAYS[di].ground[DAYS[di].ground.length - 1]
    expect(row.src, 'the promoted row keeps the source key').toBe(inpKey(inp))
    const after = dayHTML(di, false)
    expect(marks(after), 'the view page gained exactly one').toBe(before + 1)
    /* and it landed in the promoted row's REMARKS cell like every other
       surface — plRow resolves `src` back to the input for it */
    expect(rmkMarks(after)).toBe(before + 1)
  })

  it('leaves an on-time promotion unmarked', () => {
    const inp = INPUTS.find((i: any) => i.person === 'bruise')
    expect(isLateInput(inp), 'sanity: bruise met the deadline').toBe(false)
    const before = marks(dayHTML(0, false))
    expect(acceptInput(0, inp, 'g')).toBe(true)
    expect(marks(dayHTML(0, false)), 'no mark added').toBe(before)
  })
})

describe('the board', () => {
  it('marks the input in its own panels, in the remarks cell', () => {
    const h = boardHTML(1)
    expect(h).toContain('class="latetag"')
    expect(sbRmkMarks(h), 'the badge leads the remarks cell').toBeGreaterThan(0)
    expect(h, 'and no longer sits inside the type chip').not.toMatch(/class="sbi-ty [^"]*"[^>]*><span class="latetag"/)
  })

  it('drops the empty-remark dash where the badge is, and keeps it where it is not', () => {
    /* "LATE —" would read as a remark that says nothing, so the placeholder
       gives way to the badge. Both halves asserted: the dash must still print
       on the unmarked rows, or this would pass by the board simply dropping
       the placeholder everywhere. */
    /* every seed input on Jul 14 happens to carry a remark, so the case is
       built rather than found: salsa is marked, sufa is an exempt downchit. */
    const salsa = INPUTS.find((i: any) => i.person === 'salsa')
    const sufa = INPUTS.find((i: any) => i.person === 'sufa')
    expect(isLateInput(salsa), 'sanity: salsa is marked').toBe(true)
    expect(isLateInput(sufa), 'sanity: sufa is exempt').toBe(false)
    salsa.remarks = ''; sufa.remarks = ''
    const h = boardHTML(1)
    expect(h, 'the unmarked empty remark still shows the dash').toContain('>—</span>')
    expect(h, 'the marked one shows the badge alone').toContain('LATE</span></span>')
    expect(h, 'and never pairs the badge with the placeholder').not.toContain('LATE</span>—')
  })

  it('leaves the downchit rows clean there too, beside a marked one', () => {
    /* the exemption has to hold on this surface as well as on the week — and
       day 0's board is the sharpest case, because its Unavailable panel (two
       downchits, the latest stamps in the seed) sits a few rows below a
       Personal Inputs panel that DOES carry a mark. Both halves asserted, so
       this cannot pass by the board simply drawing nothing. */
    const h = boardHTML(0)
    const unav = h.slice(h.indexOf('sb-panel unav'))
    expect(unav).toContain('OML')
    expect(unav, 'no mark on either downchit').not.toContain('class="latetag"')
    const pinp = h.slice(h.indexOf('sb-panel pinp'), h.indexOf('sb-panel unav'))
    expect(pinp, 'while the panel above it is marked — proving the render works')
      .toContain('class="latetag"')
  })

  it('marks a promoted ground row without adding a grid item to it', () => {
    /* the c6r row is a SEVEN-track template whose header reserves exactly
       seven items — an eighth would walk every field one track left of its
       own heading, which is the register bug found once already. So this row
       wears a class, not a chip, and this test is what stops a later hand
       "improving" it into a chip. */
    const inp = INPUTS.find((i: any) => i.person === 'salsa')
    acceptInput(1, inp, 'g')
    const h = boardHTML(1)
    const row = h.slice(h.indexOf('sb-arow c6r'))
    expect(row).toContain('lateinp')
    const item = row.slice(0, row.indexOf('</div>'))
    expect(item, 'the row itself carries no badge element').not.toContain('latetag')
  })
})

describe('what it deliberately does NOT do', () => {
  it('raises no warning — a paperwork deadline is not a flying fault', () => {
    /* the owner chose "just the note" over an entry in the checks list, so a
       week full of late inputs must leave the warning count untouched. */
    validate()
    const w = JSON.stringify(WARN.all)
    expect(w).not.toContain('LATE')
    expect(w.toLowerCase()).not.toContain('late input')
    /* and tightening the deadline until every input is late must not move the
       warning count by one */
    const n = WARN.all.length
    VCONF.inputLead = 60
    validate()
    /* every input except the exempt downchits */
    expect(INPUTS.filter(isLateInput).length, 'sanity: all but the downchits are late now').toBe(INPUTS.length - 2)
    expect(WARN.all.length, 'the checks list is untouched').toBe(n)
  })
})
