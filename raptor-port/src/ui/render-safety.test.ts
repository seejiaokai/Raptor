/* Two rendering contracts that nothing else pins: user-typed text reaching
   innerHTML must be escaped, and a printed clock derived from a RULE must use
   the live rule rather than a number frozen into the builder. Both were real
   defects (owner bug sweep, 5 Aug 26). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PEOPLE, renameCallsign } from '../engine'
import { VCONF } from '../engine/rules'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'
import { puck, dayHTML } from './html'
import { schedRows } from './export'
import { minus } from '../engine/time'

beforeAll(() => { validate() })

describe('a callsign is user text, so every puck escapes it', () => {
  const ID = 'bane'
  let orig = ''
  beforeAll(() => { orig = PEOPLE[ID].cs })
  afterAll(() => { PEOPLE[ID].cs = orig })

  /* renameCallsign only trims and de-duplicates — it accepts any characters —
     so this is one admin rename away, and puck() renders on every surface. */
  it('markup in a callsign renders as text, in the name AND the title', () => {
    PEOPLE[ID].cs = 'X"><b>Z'
    /* no flag: the flag chip carries a title of its own, and this assertion is
       about the PUCK's title being the only one */
    const h = puck(ID, 'hard', false, null)
    expect(h, 'the raw angle bracket never reaches the markup').not.toContain('<b>')
    expect(h).toContain('&lt;b&gt;')
    /* the title carries the callsign too — an unescaped quote there closed the
       attribute early and turned the rest of the tooltip into attributes */
    expect(h).toContain('&quot;')
    expect(h.match(/title="/g) || [], 'exactly one title attribute').toHaveLength(1)
    /* and with a flag, the chip's title is the only additional one */
    expect((puck(ID, 'hard', false, 'C').match(/title="/g) || [])).toHaveLength(2)
  })

  it('the sentinel puck escapes too (it always did — pinned so it stays)', () => {
    const sentinel = Object.keys(PEOPLE).find((id: any) => PEOPLE[id].special)
    if (!sentinel) return
    const before = PEOPLE[sentinel].cs
    PEOPLE[sentinel].cs = '<i>ALL</i>'
    expect(puck(sentinel, null, false, null)).not.toContain('<i>')
    PEOPLE[sentinel].cs = before
  })
})

describe('the printed brief time follows the Brief-lead rule', () => {
  const orig = VCONF.briefLead
  afterAll(() => { VCONF.briefLead = orig })

  /* validate() reads VCONF.briefLead live, so a hard-coded 140 in the builders
     left the engine flagging against the edited rule while the B column and the
     CSV kept printing the old one. */
  it('the board B column and the CSV Brief column both move with it', () => {
    const f = DAYS[0].waves[0].formations[0]
    VCONF.briefLead = 90
    const want = minus(f.to, 90)
    expect(want, 'sanity: 90 min gives a different clock than 140').not.toBe(minus(f.to, 140))
    expect(dayHTML(0, false)).toContain(want)
    const row = schedRows().find((r: any) => r[3] === f.cs)
    expect(row && row[5], 'the CSV Brief field').toBe(want)
  })
})
