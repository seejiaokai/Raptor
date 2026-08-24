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
  it('a normal flying day draws the in-time note and at least one blue suggestion', () => {
    const h = boardHTML(0)
    expect(h, 'the in-time · N ac note is on an ordinary wave header').toContain('class="asd">in-time')
    expect(h, 'a blank-B flying line offers the blue suggested brief').toContain('class="bsug"')
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
    expect(h).not.toContain('in-time ')
  })
  it('no blue suggested-brief ghost on its lines', () => {
    expect(boardHTML(0)).not.toContain('class="bsug"')
  })
  it('the B box itself is still there to type an in-time into', () => {
    expect(boardHTML(0), 'the SC line keeps its editable B input').toContain('data-bfld="ff:0.0.0.br"')
  })
})
