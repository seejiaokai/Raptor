// @vitest-environment jsdom
/* opus1 — the whole-draft who-door (C6) asked of an ALL AVAIL draft: the draft image carries no stamp and no filer, so
   the who-rule reads the placeholder's squadron as the home of '' (the fallback), never the squadron it is filed on. */
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { offersFor, whoDoorRefusal, draftImage, commitInput } from './inputedit'
import { switchUnit } from '../state/store'
import { UNIT } from '../engine/unitview'
import { INPUTS } from '../engine/inputs'

useMsqWorld()

const meeting = { type: 'Meeting', start: '2026-07-20', end: '', allday: true, remarks: '149 brief' }

describe('opus1 — ALL AVAIL draft at the who-door', () => {
  it("Kestrel (149's admin) is offered ALL AVAIL and his ALL AVAIL meeting passes the save door", () => {
    signInAs('kestrel')
    expect(UNIT).toBe('u149')
    expect(whoDoorRefusal(null, draftImage(null, meeting, ['allavail'])), 'save door').toBeNull()
  })
  it("Kestrel's one-person Person list offers ALL AVAIL", () => {
    signInAs('kestrel')
    expect(offersFor(null, meeting, [])('allavail'), 'picker offers ALL AVAIL').toBe(true)
  })
  it("(the fix's shape) the image with the stamp the save writes passes for Kestrel and is refused for Hunter", () => {
    signInAs('kestrel')
    expect(whoDoorRefusal(null, { ...draftImage(null, meeting, ['allavail']), u: 'u149' })).toBeNull()
    signInAs('hunter')
    expect(whoDoorRefusal(null, { ...draftImage(null, meeting, ['allavail']), u: 'u149' })).not.toBeNull()
  })
  it("Osprey (149's member) may file an ALL AVAIL meeting for 149 at the door", () => {
    signInAs('osprey')
    expect(whoDoorRefusal(null, draftImage(null, meeting, ['allavail'])), 'member door').toBeNull()
  })
  it("the real save of Kestrel's 149 ALL AVAIL meeting goes through (control: the gate)", () => {
    signInAs('kestrel')
    const n = INPUTS.length
    expect(commitInput(null, { ...meeting, u: 'u149' }, ['allavail'])).toBe(true)
    expect(INPUTS.length).toBe(n + 1)
  })
  it("Hunter (142's admin), 149 not his, is NOT offered ALL AVAIL for a draft opened on 149's schedule", () => {
    signInAs('hunter')
    /* (control for the other direction: the image never says which squadron it is filed on) */
    switchUnit('u149')
    expect(whoDoorRefusal(null, draftImage(null, { ...meeting, u: 'u149' }, ['allavail'])), 'door for a 149 filing').not.toBeNull()
  })
})
