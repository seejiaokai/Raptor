import { describe, it, expect, beforeEach } from 'vitest'
import { WARNOFF, warnMuteKey, warnShown, toggleWarnOff } from './view'
import { setSession } from './auth'
import { histInit, histPush, undo, redo } from './history'

/* Muting a board warning (owner, Aug 26 — "turn off that specific warning
   advisory … but if things change that warning will appear again"). The mute is
   keyed by the warning's CONTENT, so the auto-rearm is a property of the key,
   not a timer: change the day / code / people / message and the key changes. */
beforeEach(() => { WARNOFF.clear(); setSession({ user: 'a', role: 'admin' }) })

describe('a muted board warning', () => {
  it('hides the exact warning but re-appears the moment its content changes', () => {
    const w = { di: 0, code: 'INPUT_FLY', who: ['bane'], msg: 'on a Meeting' }
    expect(warnShown(w)).toBe(true)
    toggleWarnOff(warnMuteKey(w))
    expect(warnShown(w), 'now muted').toBe(false)
    /* the same problem, unchanged → stays muted (the scheduler acknowledged it) */
    expect(warnShown({ di: 0, code: 'INPUT_FLY', who: ['bane'], msg: 'on a Meeting' })).toBe(false)
    /* different PEOPLE → a different warning → shown again */
    expect(warnShown({ di: 0, code: 'INPUT_FLY', who: ['bane', 'kestrel'], msg: 'on a Meeting' })).toBe(true)
    /* different MESSAGE → shown */
    expect(warnShown({ di: 0, code: 'INPUT_FLY', who: ['bane'], msg: 'no brief' })).toBe(true)
    /* different DAY → shown */
    expect(warnShown({ di: 1, code: 'INPUT_FLY', who: ['bane'], msg: 'on a Meeting' })).toBe(true)
  })

  it('tapping again un-mutes, and only a scheduler may mute', () => {
    const k = warnMuteKey({ di: 0, code: 'C', who: ['x'], msg: 'clash' })
    expect(toggleWarnOff(k), 'first tap hides (returns shown=false)').toBe(false)
    expect(WARNOFF.has(k)).toBe(true)
    expect(toggleWarnOff(k), 'second tap shows (returns shown=true)').toBe(true)
    expect(WARNOFF.has(k)).toBe(false)
    /* a member is refused at the write path — nothing is muted */
    setSession({ user: 'user', role: 'main' })
    expect(toggleWarnOff(k)).toBe(false)
    expect(WARNOFF.has(k), 'a member cannot mute').toBe(false)
  })

  /* Undo reverts a mute now (owner, Aug 26 — "when I click undo I should revert
     my hidden warning changes"). WARNOFF rides the history snapshot and the mute
     handler pushes a step, so undo/redo walk over it like any other edit. */
  it('is an undo step — undo brings the check back, redo hides it again', () => {
    const k = warnMuteKey({ di: 0, code: 'C', who: ['x'], msg: 'clash' })
    histInit()                                    // baseline: nothing muted
    toggleWarnOff(k); histPush()                  // the mute handler's two steps
    expect(WARNOFF.has(k), 'muted').toBe(true)
    undo()
    expect(WARNOFF.has(k), 'undo un-mutes').toBe(false)
    redo()
    expect(WARNOFF.has(k), 'redo re-mutes').toBe(true)
  })
})
