/* [ARCH-STACK] Step 2 phase 2b — the scheduler PUBLISH path routed through the
   command gate (design §3.4, §5.1, §8 item 2). ADDITIVE: the engine
   setDayApproved / publishALDay / discardPending run UNCHANGED inside commit();
   this proves the publish path now
     - emits the issued records (sched.orig on first publish, sched.als on an AL),
     - declares the publish boundary {kind:'publish', ids, crossable} (§3.4),
     - records the monotonic disclosure signal that flips `crossable` for Step 3,
     - and that the envelope stream RECONSTRUCTS the persisted week byte-for-byte
       vs the legacy serializer (completeness, §7 / Codex R4-004).
   A refused/no-op publish mints nothing → no boundary, no envelope. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayApproved, dayHasChanges } from '../engine/publish'
import { txtSet } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { initStore, writeText } from './store'
import {
  commitSetDayApproved, commitPublishALDay, commitDiscardPending,
  currentIssuedIds, discloseCurrentIssued, schedStore,
} from './sched-commit'
import { issuedDisclosed, _resetDisclosure } from './disclosure'
import { histSnap } from './history'
import { setSession } from './auth'
import * as view from './view'
import { onCommit } from '../command'
import type { CommitEnvelope } from '../command'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)

/* sign all four roles on a day so it is publishable */
const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}

let caught: CommitEnvelope[] = []
let unsub: () => void

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  /* warm the per-day sign objects, exactly as rendering the edit page's sign
     strip does before any publish button exists: signOf()/daySigned() lazily
     materialize an empty SCHED.sign[di] the first time they read it, so on a
     COLD test model a refused (unsigned) publish would "change" the book only by
     that lazy-init. Warming here matches the live app, where the strip is always
     rendered first — so a refused publish truly records nothing (decision #5). */
  DAYS.forEach((_: any, di: number) => signOf(di))
  _resetDisclosure()
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub() })

const cols = (e: CommitEnvelope) => e.changes.map(c => c.collection)

describe('first publish (setDayApproved) emits the Original + a publish boundary', () => {
  it('commitSetDayApproved -> ONE envelope, a sched.orig change, boundary crossable', () => {
    sign(0)
    commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    expect(caught.length).toBe(1)
    const e = caught[0]
    expect(e.type).toBe('sched.approve')
    expect(e.scope).toEqual({ module: 'sched', weekId: CURWEEK })
    // the Original is emitted as its own append-only record
    expect(e.changes.some(c => c.collection === 'sched.orig' && c.id === `${CURWEEK}:0`)).toBe(true)
    // the mutable book moved too (dayOK / cur / pending cleared)
    expect(cols(e)).toContain('sched.book')
    // the publish boundary carries the new issued id, crossable (nothing disclosed)
    expect(e.boundary).toBeTruthy()
    expect(e.boundary!.kind).toBe('publish')
    expect(e.boundary!.crossable).toBe(true)
    expect(e.boundary!.ids.length).toBe(1)
    expect(e.boundary!.ids[0]).toBe((SCHED.orig as any)[0].id)
  })

  it('a refused first-publish (unsigned) mints nothing and emits nothing', () => {
    // not signed -> setDayApproved toasts and returns without stamping
    commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(false)
    expect(caught.length).toBe(0)
  })
})

describe('an amendment (publishALDay) appends a sched.als record + boundary', () => {
  it('commitPublishALDay -> a sched.als change and the new AL id in the boundary', () => {
    sign(0)
    commitSetDayApproved(0, true)
    caught = []
    txtSet('dn:0.0', 'AMENDED NOTE')     // a real change vs the issued Original
    expect(dayHasChanges(0)).toBe(true)
    sign(0)
    commitPublishALDay(0)
    expect(caught.length).toBe(1)
    const e = caught[0]
    expect(e.type).toBe('sched.publishAL')
    expect(e.changes.some(c => c.collection === 'sched.als')).toBe(true)
    expect(e.boundary).toBeTruthy()
    expect(e.boundary!.ids.length).toBe(1)
    const newAl = (SCHED.als as any[])[(SCHED.als as any[]).length - 1]
    expect(e.boundary!.ids[0]).toBe(newAl.id)
  })

  it('publishALDay with no changes mints nothing and emits nothing', () => {
    sign(0)
    commitSetDayApproved(0, true)
    caught = []
    sign(0)
    commitPublishALDay(0)                // nothing changed since the Original
    expect(caught.length).toBe(0)
  })
})

describe('discardPending routes through commit with no boundary', () => {
  it('commitDiscardPending emits a book change and declares no publish boundary', () => {
    txtSet('dn:0.0', 'DRAFT NOTE')       // a draft-day pending mark, never published
    caught = []
    commitDiscardPending()
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.discard')
    expect(caught[0].boundary).toBeUndefined()
  })
})

describe('the disclosure signal flips crossable for Step 3 (§3.4)', () => {
  it('an export/print/session-end discloses the issued ids the publish recorded', () => {
    sign(0)
    commitSetDayApproved(0, true)
    const issuedId = caught[0].boundary!.ids[0]
    expect(issuedDisclosed(issuedId)).toBe(false)   // fresh publish: crossable
    expect(currentIssuedIds()).toContain(issuedId)
    discloseCurrentIssued()                          // the export/print/session-end path
    expect(issuedDisclosed(issuedId)).toBe(true)     // Step 3 would now forbid a silent reverse
    // monotonic: it never un-discloses
    discloseCurrentIssued()
    expect(issuedDisclosed(issuedId)).toBe(true)
  })
})

describe('completeness — the stream reconstructs the persisted week (§7 / R4-004)', () => {
  /* invert schedRecords(): fold the change stream onto a pre-command snapshot of
     the logical records and re-assemble the legacy histSnap shape from them. */
  function recordsToHist(m: Map<string, { collection: string; id: string; value: any }>): any {
    const wk = CURWEEK
    const d: any[] = []
    for (let di = 0; ; di++) { const e = m.get(`days/${wk}#${di}`); if (!e) break; d.push(e.value) }
    const book: any = m.get(`sched.book/${wk}`)!.value
    const mutes: any = m.get(`sched.mutes/${wk}`)!.value
    const orig: any = {}
    const als: any[] = []
    const inputs: any[] = []
    for (const [k, e] of m) {
      if (k.startsWith('sched.orig/')) orig[k.slice(k.lastIndexOf(':') + 1)] = e.value
      else if (k.startsWith('sched.als/')) als[+k.slice(k.lastIndexOf(':') + 1)] = e.value
      else if (k.startsWith('inputs/')) inputs.push(e.value)
    }
    const plan: any = m.get('plan/all')!.value
    return {
      d, i: inputs,
      c: book.c, p: book.p, ad: book.ad, a: als.filter(x => x !== undefined), al: book.al,
      ok: book.ok, sg: book.sg, sb: book.sb, o: orig, cv: book.cv, dr: book.dr, cd: book.cd,
      v: book.v, am: book.am, wo: mutes, pp: plan.pp, dm: plan.dm,
    }
  }

  it('a publish + amendment sequence reconstructs byte-identically to histSnap()', () => {
    // snapshot the logical records BEFORE any command (deep copy)
    const base = new Map<string, { collection: string; id: string; value: any }>()
    for (const [k, e] of schedStore.records()) {
      base.set(k, { collection: e.collection, id: e.id, value: JSON.parse(JSON.stringify(e.value)) })
    }
    // a realistic sequence: publish day 0, amend it (through a command so the
    // edit is on the stream too), publish the AL
    sign(0); commitSetDayApproved(0, true)
    writeText('dn:0.0', 'AMENDED NOTE'); sign(0); commitPublishALDay(0)
    // fold every emitted change onto the snapshot
    for (const env of caught) for (const c of env.changes) {
      const key = `${c.collection}/${c.id}`
      if (c.op === 'delete') base.delete(key)
      else base.set(key, { collection: c.collection as string, id: c.id, value: c.after })
    }
    // the reconstruction must equal the legacy serializer's live output
    expect(recordsToHist(base)).toEqual(JSON.parse(histSnap()))
  })
})
