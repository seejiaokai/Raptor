/* A HIDDEN SANS LINE IS ITS OWN SIM, NOT ITS WORDS (Astra's code read in the warning-list piece's bug check, chat 207,
   27 Nov 26 — his D469 / D475: a hide is tied to that exact warning and comes back by itself when the situation changes).
   Since D2584 2a the mismatch line names what he DID offer ("SANS: offered Fly only today. Planned on Sim EP-9 …"), so an
   OFT and an AMT of one name and hours read word for word the same — and a hide keyed by the words carried from the OFT
   to the AMT: the new line arrived struck, uncounted, with no ring or "A". The event is now part of the line's identity
   (validate.ts `sansDomain`, warnhide.ts hideKey, dropflag.ts warnKey, validate.ts add's dedupe); the words are unchanged. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { validate, workingWarn, WARN } from './validate'
import { hideKey } from './warnhide'
import { SCHED } from './publish'
import * as view from '../state/view'
import { setSession } from '../state/auth'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  setSession({ user: 'a', role: 'admin' } as any)
  view.WARNOFF.clear(); validate()
})
afterEach(() => { view.WARNOFF.clear() })

const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul, on nothing that day
const fileFly = () => { const r: any = { person: ID, date: 'Jul 13', endDate: undefined, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' }; inpId(r); INPUTS.push(r) }
const sim = (kind: 'oft' | 'amt', label: string, str: string, end: string) => {
  const rows = DAYS[0].sims[kind]; rows.push({ label, str, end, p: ID, w: '' }); return rows.length - 1
}
const his = () => (workingWarn().byDay[0].warns || []).filter((w: any) => w.code === 'SANS_AVAIL' && (w.who || []).includes(ID))

describe('a hidden OFT line does not hide the AMT line that replaces it', () => {
  it('Fly only filed; on an OFT EP-9 10:00–11:00, hidden; the OFT row goes and an AMT EP-9 10:00–11:00 takes him: the AMT line shows', () => {
    fileFly()
    const oi = sim('oft', 'EP-9', '10:00', '11:00'); validate()
    const [w] = his()
    expect(w.msg).toBe('SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:00')   // D2754: the sim named OFT
    view.WARNOFF.add(hideKey(w)); validate()
    expect(his()[0].off, 'the OFT line is hidden').toBe(true)
    DAYS[0].sims.oft.splice(oi, 1)
    sim('amt', 'EP-9', '10:00', '11:00'); validate()
    const after = his()
    expect(after).toHaveLength(1)
    expect(after[0].off, 'the AMT line is a different situation, so it shows (D469)').toBeFalsy()
    expect(WARN.chip[0][ID], 'his "A" is back').toBe('A')
  })
  it('both at once, one name and hours: two lines, and hiding the OFT one leaves the AMT one showing', () => {
    fileFly()
    sim('oft', 'EP-9', '10:00', '11:00'); sim('amt', 'EP-9', '10:00', '11:00'); validate()
    const two = his()
    expect(two, 'one line a seat (as built)').toHaveLength(2)
    const oft = two.find((w: any) => /^s:0\.oft\./.test(String(w.key)))
    view.WARNOFF.add(hideKey(oft)); validate()
    const now = his()
    expect(now.filter((w: any) => w.off)).toHaveLength(1)
    expect(now.find((w: any) => /^s:0\.amt\./.test(String(w.key))).off).toBeFalsy()
  })
})
