// @vitest-environment jsdom
/* opus1 — the gate's 7c never judges a squadron stamp `u` on an input that names anyone (inputSquadrons reads named men
   first), so a stamp written onto such an input passes; once its last man takes himself out (his own take-out keeps a
   stamp it finds — ui/inputedit.tsx commitInput, engine/inputs.ts settleStamp) the meeting is that stamp's squadron's. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { INPUTS, inputBelongs, idsOf } from '../engine/inputs'
import { commitInput, draftOf } from '../ui/inputedit'
import { writeInputsBatch } from './store'

useMsqWorld()

const byIid = (iid: any): any => INPUTS.find((x: any) => x && x.iid === iid)

describe('opus1 — a stamp written onto a named input', () => {
  it("Hunter (142's plain admin, no rights in 149) cannot put 149's stamp on 142's meeting", () => {
    signInAs('hunter')
    const had = new Set(INPUTS.map((x: any) => x.iid))
    expect(commitInput(null, { type: 'Meeting', start: '2026-07-20', allday: true, remarks: 'h brief', u: 'u142' }, ['allavail', PID.ranger])).toBe(true)
    const iid = INPUTS.find((x: any) => !had.has(x.iid) && x.remarks === 'h brief')!.iid
    const forged = writeInputsBatch(() => { byIid(iid).u = 'u149' })
    signInAs('ranger')
    const r = byIid(iid)
    commitInput(r, draftOf(r), idsOf(r).map(String).filter(p => p !== PID.ranger))
    expect(inputBelongs(byIid(iid), 'u149'), `forged write ${forged ? 'passed' : 'refused'}: 142's meeting now on 149's schedule`).toBe(false)
    expect(forged, 'the gate refuses a stamp of a squadron he holds no rights in').toBeFalsy()
  })
})
