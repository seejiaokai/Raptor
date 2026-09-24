/* [GLOBAL-UNDO] §6.5 — the UNPUBLISH path: retract a published day to a working
   copy, kept as an immutable retired-issuance snapshot; reissue the SAME label
   (incl. an empty-delta correction, §6.1 GU5-001); readers never pick a retired
   record; disseminated vs silent (issuedDisclosed) governs the `logged` flag. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import {
  SCHED, signOf, dayApproved, dayHasChanges, dayVersions, daySnapOf, dayCurVer, nextSeq, dayDelta,
} from '../engine/publish'
import { txtSet } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { initStore } from './store'
import {
  commitSetDayApproved, commitPublishALDay, commitUnpublish,
} from './sched-commit'
import { issuedDisclosed, discloseIssued, _resetDisclosure } from './disclosure'
import { setSession } from './auth'
import * as view from './view'
import { onCommit } from '../command'
import type { CommitEnvelope } from '../command'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const retiredKeys = () => Object.keys(SCHED.retired || {})

let caught: CommitEnvelope[] = []
let unsub: () => void
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  _resetDisclosure()
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub() })

describe('unpublish an Original → a plain draft, the Original retired', () => {
  it('drops dayOK, retires the Original as its own snapshot, declares an unpublish boundary', () => {
    sign(0); commitSetDayApproved(0, true)
    const origId = (SCHED.orig as any)[0].id
    caught = []
    const r = commitUnpublish(0)
    expect((r as any).ok !== false).toBe(true)
    expect(dayApproved(0)).toBe(false)                 // back to a draft
    // the Original is kept as an immutable retired snapshot, individually keyed
    expect(retiredKeys()).toEqual([`${origId}~1`])
    expect((SCHED.retired as any)[`${origId}~1`].id).toBe(origId)
    // ONE envelope, an unpublish boundary carrying the retracted id
    expect(caught.length).toBe(1)
    const e = caught[0]
    expect(e.type).toBe('sched.unpublish')
    expect(e.boundary!.kind).toBe('unpublish')
    expect(e.boundary!.ids).toEqual([origId])
    // the retired record moved on the stream; the orig record was deleted
    expect(e.changes.some(c => c.collection === 'sched.retired')).toBe(true)
    expect(e.changes.some(c => c.collection === 'sched.orig' && c.op === 'delete')).toBe(true)
  })
})

describe('unpublish an AL → the working copy re-opens, Original stays current', () => {
  it('retracts AL1, re-opens its marks as pending, cur falls back to the Original', () => {
    sign(0); commitSetDayApproved(0, true)
    const origId = (SCHED.orig as any)[0].id
    txtSet('dn:0.0', 'AMENDED NOTE'); sign(0); commitPublishALDay(0)
    const al1 = (SCHED.als as any[])[0].id
    expect(dayCurVer(0)).toBe(al1)
    caught = []
    commitUnpublish(0)
    // AL1 comes off; the Original is current again; the day is still published
    expect(dayApproved(0)).toBe(true)
    expect(dayCurVer(0)).toBe(origId)
    expect((SCHED.als as any[]).length).toBe(0)
    expect(retiredKeys()).toEqual([`${al1}~1`])
    // the amendment's mark re-opened as pending → the day again shows changes
    expect(dayHasChanges(0)).toBe(true)
    // the day is marked as correcting AL1's label
    expect((SCHED.correcting as any)[0]).toBe(al1)
  })
})

/* [HUMAN-RETEST] the amendment system, walk S1 (Fable 5-3, 24 Sep 26). AM20: a pending mark
   means "differs from what was issued", not "was touched". Unpublishing AL1 makes the version
   UNDER it current again, so a change already put back to that version's value must not come
   back as a dotted mark — the head, the sign line and the panel (all the canonical delta) would
   say one thing while the cell said another. */
describe('unpublish re-opens only what still differs from the version under it (walk S1)', () => {
  it('a change put back to the older value leaves no phantom pending mark', () => {
    sign(0); commitSetDayApproved(0, true)                  // Original: VL takes off 12:40
    const was = (DAYS[0] as any).waves[0].formations[0].to
    txtSet('ff:0.0.0.to', '13:10'); txtSet('dn:0.0', 'AL1 NOTE')
    sign(0); commitPublishALDay(0)                          // AL1 carries both
    txtSet('ff:0.0.0.to', was)                              // the time put back to the Original's
    commitUnpublish(0)                                      // AL1 off → the Original is current
    const pend = Object.keys(SCHED.pending)
    expect(pend.some(k => k.startsWith('dn:0.')), 'the note still differs from the Original').toBe(true)
    expect(pend.some(k => /^ff:0\..*\.to$/.test(k)), 'the time equals the Original — no mark').toBe(false)
    expect(dayDelta(0).length).toBe(1)
  })
})

describe('only the LATEST version is unpublishable', () => {
  it('peels AL1 first, then the Original', () => {
    sign(0); commitSetDayApproved(0, true)
    const origId = (SCHED.orig as any)[0].id
    txtSet('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    const al1 = (SCHED.als as any[])[0].id
    commitUnpublish(0)                       // takes AL1
    expect(dayCurVer(0)).toBe(origId)
    commitUnpublish(0)                       // now takes the Original
    expect(dayApproved(0)).toBe(false)
    expect(retiredKeys().sort()).toEqual([`${al1}~1`, `${origId}~1`].sort())
  })
})

describe('same-label reissue + the correcting flag (§6.1 GU5-001)', () => {
  it('reissues AL1 under the SAME label even when the correction nets to no delta', () => {
    txtSet('dn:0.0', 'NOTE-A'); sign(0); commitSetDayApproved(0, true)   // Original froze NOTE-A
    txtSet('dn:0.0', 'NOTE-B'); sign(0); commitPublishALDay(0)           // AL1: NOTE-B
    const al1 = (SCHED.als as any[])[0].id
    commitUnpublish(0)                       // AL1 off; correcting flag set
    txtSet('dn:0.0', 'NOTE-A')               // correct back to EXACTLY the Original → empty delta
    expect(dayHasChanges(0)).toBe(false)     // nets to nothing…
    sign(0)
    commitPublishALDay(0)                    // …but the correcting flag permits reissue
    const reAls = SCHED.als as any[]
    expect(reAls.length).toBe(1)
    expect(reAls[0].id).toBe(al1)            // SAME label
    expect((SCHED.correcting as any)[0]).toBeUndefined()   // flag cleared on reissue
  })
  it('nextSeq frees the retracted seq so a reissue reuses the label', () => {
    sign(0); commitSetDayApproved(0, true)
    txtSet('dn:0.0', 'X'); sign(0); commitPublishALDay(0)
    expect(nextSeq(0)).toBe(2)               // AL1 issued → next is 2
    commitUnpublish(0)
    expect(nextSeq(0)).toBe(1)               // AL1 retracted → the label is free again
  })
})

describe('readers never pick a retired record', () => {
  it('dayVersions excludes the retired issuance; daySnapOf cannot resolve it', () => {
    sign(0); commitSetDayApproved(0, true)
    const origId = (SCHED.orig as any)[0].id
    commitUnpublish(0)
    expect(dayVersions(0).some((v: any) => String(v.id ?? v) === origId)).toBe(false)
    expect(daySnapOf(0, origId)).toBeFalsy()
  })
})

describe('dissemination governs the logged flag (§6.6)', () => {
  it('an undisseminated retract is logged:false (silent)', () => {
    sign(0); commitSetDayApproved(0, true)
    const origId = (SCHED.orig as any)[0].id
    commitUnpublish(0)
    expect((SCHED.retired as any)[`${origId}~1`].logged).toBe(false)
  })
  it('a disseminated retract is logged:true (recorded)', () => {
    sign(0); commitSetDayApproved(0, true)
    const origId = (SCHED.orig as any)[0].id
    discloseIssued([origId])                 // the Step-5 DB adapter acknowledged it
    expect(issuedDisclosed(origId)).toBe(true)
    commitUnpublish(0)
    expect((SCHED.retired as any)[`${origId}~1`].logged).toBe(true)
  })
})
