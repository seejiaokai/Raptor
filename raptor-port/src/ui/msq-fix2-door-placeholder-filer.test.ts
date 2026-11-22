// @vitest-environment jsdom
/* Fable, share 1 — proof: the save door (ui/inputedit.tsx whoDoorRefusal over draftImage) and the commit gate disagree
   for an existing input changed to ALL AVAIL alone. The door's image carries no stamp yet (the stamp is settled only
   inside the save — settleStamp), so the door reads the image by its FILER's squadron; the save itself stamps the
   squadron the input stood on, and the gate passes it. Where the filer is another squadron's (a master admin, a Plan
   holder, a filer who has moved), the squadron's own admin is refused at the door for a save the gate accepts. */
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { writeInputsBatch } from '../state/store'
import { whoDoorRefusal, draftImage, draftOf, commitInput, offersFor } from '../ui/inputedit'

useMsqWorld()

describe("149's own admin changes a 149 man's meeting, filed by the master admin, to ALL AVAIL", () => {
  const file = () => {
    signInAs('saber')
    expect(writeInputsBatch(() => { INPUTS.push({ people: [{ p: PID.osprey, by: PID.saber, at: Date.now() }], date: 'Jul 20', yr: 2026, allday: true, type: 'Meeting', remarks: 'f1 149 brief', by: PID.saber, at: Date.now(), iid: 'f1door', ord: 99960 } as any) })).toBeTruthy()
    signInAs('kestrel')
    return INPUTS.find((x: any) => x.iid === 'f1door') as any
  }
  it('(control) the gate accepts the save: it is stamped 149, the squadron it stood on', () => {
    const r = file()
    expect(commitInput(r, draftOf(r), ['allavail'])).toBe(true)
    const now = INPUTS.find((x: any) => x.iid === 'f1door') as any
    expect(now.people.map((e: any) => e.p)).toEqual(['allavail'])
    expect(now.u).toBe('u149')
  })
  it('the door, asked of the same save, lets it go on', () => {
    const r = file()
    expect(whoDoorRefusal(r, draftImage(r, draftOf(r), ['allavail']))).toBeNull()
  })
  it('(control) the door lets him change it while it still names Osprey', () => {
    const r = file()
    expect(whoDoorRefusal(r, draftImage(r, { ...draftOf(r), remarks: 'changed' }, [PID.osprey]))).toBeNull()
    expect(offersFor(r, draftOf(r), [PID.osprey], false)(PID.kestrel)).toBe(true)
  })
})
