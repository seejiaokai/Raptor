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

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  rulesReset()
  validate()
})

/* divot's downchit sits on day 0 and is stamped after the deadline; pike's
   detachment is stamped weeks early. Both are Unavailable types, so both
   render on the VIEW page with nothing accepted. */
const late = () => INPUTS.find((i: any) => i.person === 'divot')
const onTime = () => INPUTS.find((i: any) => i.person === 'bruise')

describe('the week', () => {
  it('marks a late input in the Unavailable block, on the view-only page', () => {
    expect(isLateInput(late()), 'sanity: the fixture really is late').toBe(true)
    const v = dayHTML(0, false)
    expect(v, 'the view page draws Unavailable for everyone').toContain('sec-unav')
    expect(v).toContain('class="latetag"')
  })

  it('does not mark an input that met the deadline', () => {
    /* bruise's Fly is stamped 1 Jul, well inside the 6 Jul deadline. It is a
       personal input, so it shows on the EDIT page — and must show clean. */
    expect(isLateInput(onTime())).toBe(false)
    const e = dayHTML(0, true)
    const row = e.slice(e.indexOf('sec-inp'), e.indexOf('sec-unav'))
    expect(row).toContain('Fly')
    expect(row.slice(row.indexOf('Fly') - 120, row.indexOf('Fly'))).not.toContain('latetag')
  })

  it('marks it on the edit page too — the mark is not a view-only courtesy', () => {
    expect(dayHTML(0, true)).toContain('class="latetag"')
  })

  it('is computed from the setting, not baked into the seed', () => {
    /* relax the deadline to the Monday itself and every seed mark clears —
       nothing in the seed is stamped later than 12 Jul. Tighten it and they
       come back. This is what proves the Rules tab really drives the badge. */
    expect(dayHTML(0, false)).toContain('class="latetag"')
    VCONF.inputLead = 0
    expect(inputDueISO()).toBe('2026-07-13')
    expect(INPUTS.some(isLateInput), 'nothing is late against a Monday deadline').toBe(false)
    expect(dayHTML(0, false), 'so the week draws no mark at all').not.toContain('class="latetag"')
    VCONF.inputLead = 21
    expect(dayHTML(0, false), 'a three-week deadline marks them again').toContain('class="latetag"')
  })
})

describe('a personal input promoted onto the programme', () => {
  const marks = (h: string) => (h.match(/class="latetag"/g) || []).length

  it('carries the mark onto the VIEW page with it — the point of the ask', () => {
    /* A personal input never reaches view-only on its own; accepting it onto
       the ground programme is the only route. If the mark did not survive
       that promotion it would vanish exactly where the squadron reads the
       day, which is the one thing the owner asked for by name.
       Counted, not merely detected: Jul 14 is already covered by sufa's late
       multi-day downchit, so "contains a mark" was true before the accept and
       would have passed for the wrong reason. */
    const inp = INPUTS.find((i: any) => i.person === 'salsa')
    expect(isLateInput(inp), 'sanity: salsa booked after the deadline').toBe(true)
    const di = 1                                    // salsa's input is Jul 14
    const before = marks(dayHTML(di, false))
    expect(acceptInput(di, inp, 'g')).toBe(true)
    const row = DAYS[di].ground[DAYS[di].ground.length - 1]
    expect(row.src, 'the promoted row keeps the source key').toBe(inpKey(inp))
    expect(marks(dayHTML(di, false)), 'the view page gained exactly one').toBe(before + 1)
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
  it('marks the input in its own panels', () => {
    expect(boardHTML(0)).toContain('class="latetag"')
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
    expect(INPUTS.every(isLateInput), 'sanity: everything is late now').toBe(true)
    expect(WARN.all.length, 'the checks list is untouched').toBe(n)
  })
})
