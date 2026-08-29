/* Muting a check is available on the EDIT WEEK too, and shares the board's
   mute set so the two stay in sync (owner, 29 Aug 26 — "the hide warning
   option should be available on edit schedule too … and both are in sync").
   dayWarnHTML draws the ✕ / ↺ controls and the "N hidden" reveal only in
   edit mode; View-only Sched stays the honest full record with no controls,
   and reads view.WARNOFF — the very set the board's boardWarnHTML reads —
   so a check hidden on one surface is hidden on the other with no extra
   wiring. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { dayWarnHTML } from './html'
import { WARN } from '../engine/validate'
import { DWOPEN, WMOPEN, WARNOFF, warnMuteKey, toggleWarnOff } from '../state/view'
import { setSession } from '../state/auth'
import { HOOKS } from '../engine/hooks'

let realEdit: any
const warns = () => [
  { di: 0, sev: 'hard', code: 'C', who: [], msg: 'first clash' },
  { di: 0, sev: 'adv', code: 'X', who: [], msg: 'second advisory' },
]
beforeEach(() => {
  realEdit = HOOKS.editMode
  setSession({ user: 'a', role: 'admin' } as any)
  WARN.byDay = []
  WARN.byDay[0] = { di: 0, warns: warns() } as any
  DWOPEN.clear(); DWOPEN.add(0)
  WMOPEN.clear(); WARNOFF.clear()
})
afterEach(() => { HOOKS.editMode = realEdit })

describe('muting a check on the edit week', () => {
  it('draws a ✕ mute button on every open warning row in edit mode', () => {
    HOOKS.editMode = () => true
    const h = dayWarnHTML(0)
    expect(h).toContain('data-woff="0.0"')
    expect(h).toContain('data-woff="0.1"')
    expect(h).toContain('class="witem-mute"')
    expect(h).toContain('first clash')
    expect(h).toContain('second advisory')
    /* nothing muted yet → no reveal */
    expect(h).not.toContain('data-wmtog')
    expect(h).not.toContain('hidden')
  })

  it('drops a muted check out of the list into a "N hidden" reveal, header count unchanged', () => {
    HOOKS.editMode = () => true
    toggleWarnOff(warnMuteKey(WARN.byDay[0].warns[0]))
    const h = dayWarnHTML(0)
    /* the visible list drops the muted one; the reveal counts it */
    expect(h).toContain('1 hidden')
    expect(h).toContain('data-wmtog="0"')
    /* header still tells the TRUE total — muting declutters, it doesn't lie */
    expect(h).toContain('⚠ 2 issues')
    /* the muted row is only rendered once the reveal is opened */
    const muteRow = /class="witem hard muted"/
    expect(muteRow.test(h)).toBe(false)
    WMOPEN.add(0)
    expect(muteRow.test(dayWarnHTML(0))).toBe(true)
  })

  it('view-only draws no controls and shows every check, even a muted one', () => {
    HOOKS.editMode = () => false
    toggleWarnOff(warnMuteKey(WARN.byDay[0].warns[0]))
    const h = dayWarnHTML(0)
    expect(h).not.toContain('witem-mute')
    expect(h).not.toContain('data-woff')
    expect(h).not.toContain('data-wmtog')
    /* the record stays whole: both checks render as plain rows */
    expect(h).toContain('first clash')
    expect(h).toContain('second advisory')
    expect(h).not.toContain('hidden')
  })

  it('reads the same WARNOFF set the board mute writes — one hide, both surfaces', () => {
    /* the board hides a check by writing view.WARNOFF via toggleWarnOff; the
       edit week reads it through warnShown inside dayWarnHTML, so the hide the
       board made shows up here with no second store. */
    HOOKS.editMode = () => true
    const before = dayWarnHTML(0)
    expect(before).toContain('first clash')
    toggleWarnOff(warnMuteKey(WARN.byDay[0].warns[0]))   // the board's write path
    const after = dayWarnHTML(0)
    expect(after).toContain('1 hidden')                  // now hidden on the week
  })
})
