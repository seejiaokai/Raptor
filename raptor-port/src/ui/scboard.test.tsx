// @vitest-environment jsdom
/* SC on the phone board (owner, 24 Aug 26). Two things go from an SC wave:
   the "in-time · N ac" note top-right of its header, and the blue click-to-
   accept suggested-brief ghost on its lines — both read as sortie furniture on
   what is really a shift. The B box itself STAYS, empty, so a real in-time can
   still be typed when one is wanted ("we will hardly have a brief time"); only
   the suggestion goes. AVALON/BB are untouched — the owner named SC. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import * as view from '../state/view'
import { boardHTML } from './board'
import { makeStandalone } from '../engine/waves'

beforeAll(() => {
  initStore()
  setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); notify()
})
afterAll(() => { setSession(null); notify() })

describe('the seed still shows the header note and the suggestion (positive control)', () => {
  /* the In-time / Rally · N ac note left EVERY wave header in round 1b (owner D947, 16 Oct 26) — the control here is the
     suggestion alone */
  it('a normal flying day draws at least one blue suggestion (and, since D947, no In-time / Rally note)', () => {
    const h = boardHTML(0)
    expect(h, 'no wave header carries the In-time / Rally · N ac note').not.toContain('class="asd">In-time / Rally')
    /* inside its own empty box since D1028 / D1030, never on a line above it */
    expect(h, 'a blank-B flying line offers the suggested brief inside its box').toMatch(/class="tm sugbox" data-bfld="ff:0\.\d+\.\d+\.br"[^>]* placeholder="\d\d:\d\d"/)
    expect(h, 'no suggestion on a line of its own').not.toContain('class="bsug"')
  })
})

describe('an SC wave drops the note and the suggestion but keeps the B box', () => {
  /* render a day that is ONLY the SC wave, so the whole flying markup can be
     asserted clean without scoping to one block inside a mixed day. */
  const saved = (DAYS[0] as any).waves
  beforeAll(() => {
    const sc: any = makeStandalone('sc')          // AM + PM, MAIN and SPARE, blank B
    ;(DAYS[0] as any).waves = [sc]
    notify()
  })
  afterAll(() => { (DAYS[0] as any).waves = saved; notify() })

  it('no "in-time · N ac" header note', () => {
    const h = boardHTML(0)
    expect(h).not.toContain('class="asd"')
    expect(h).not.toContain('In-time / Rally ')
  })
  it('no suggested brief on its lines, and no rally box (D1026: a standby line carries no rally)', () => {
    const h = boardHTML(0)
    expect(h, 'the SC B box is drawn').toContain('data-bfld="ff:0.0.0.br"')
    expect(h).not.toContain('sugbox')
    expect(h, 'the B box shows no suggested time').not.toMatch(/data-bfld="ff:0\.0\.\d+\.br"[^>]*placeholder=/)
    expect(h).not.toContain('.rl"')
  })
  it('the B box itself is still there to type an in-time into', () => {
    expect(boardHTML(0), 'the SC line keeps its editable B input').toContain('data-bfld="ff:0.0.0.br"')
  })
})
