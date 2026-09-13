/* Per-day alternate drafts (owner, 15 Aug 26) — the engine half. The live
   DAYS[di] IS the selected draft's working copy: duplicating stows and mints,
   switching stows and reloads, and publishing needs no change at all because
   setDayApproved publishes whatever is live. Undo carries the blobs because
   histSnap/histApply serialize SCHED.drafts/SCHED.curDraft explicitly. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import {
  SCHED, signOf, setDayApproved, dayApproved, daySnapOf, dayCurVer,
  publishALDay, deleteCount, deletionWasIssued, alAttr, markStructuralAdd, markEdit, dayHasChanges,
} from './publish'
import { txtSet, txtGet, setSlotVal, fillSlot } from './slots'
import { moveDutyRow, moveGroundRow } from './reorder'
import { keyDay } from './keys'
import { dayKeys } from './restore'
import {
  dayDrafts, curDraftId, draftDup, draftSelect, draftRename, draftDelete,
  draftVerLabel, isDraftVer, MAX_DRAFT_NAME,
  loadVersionToWorkingCopy, reconcileIssuedMarks,
} from './drafts'
import { HIST, histInit, histApply, histPush, histSnap } from '../state/history'
import { rowsOf, ridKey, ensureRowIds } from './rowids'
import { verSeq, verId, dayIso } from './verid'
import { CURWEEK } from './waves'

/* a ROW key is stored rid-anchored once its row carries a rid (a funnel write
   self-heals one in); wrap a raw stored-key expectation so it reads that form.
   dn:/del:/inp: are NONROW and unchanged, so they need no wrap. */
const rk = (k: string) => ridKey(k, DAYS)

/* drafts swap DAYS[0] wholesale — every test starts from the pristine day,
   same discipline daytpl.test.ts and restore.test.ts use */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))
/* DRAFTS KEEP THEIR IDS (11 Sep 26, addressing-by-rid): a parked draft is an
   alternate VERSION of the same day, so draftDup no longer strips/re-mints —
   both blobs are plain clones of the live day, byte-identical to it (ids and
   all). draftDup ALSO mints any missing id on the live day before cloning (the
   stow-hardening, Astra RID-IR-05), so after a dup the live day and both blobs
   share one rid-space. `ridless` strips rid to compare CONTENT alone. */
const ridless = (_k: string, v: any) => (_k === 'rid' ? undefined : v)

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}

beforeEach(() => {
  DAYS[0] = JSON.parse(JSON.stringify(D0))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}
})

describe('duplicating a day', () => {
  it('a day starts with no drafts, and dayDrafts always answers an array', () => {
    expect(dayDrafts(0)).toEqual([])
    expect(curDraftId(0)).toBeUndefined()
  })

  it('the first dup stows the live day as Draft 1 AND mints Draft 2, selected', () => {
    const t = draftDup(0)
    const list = dayDrafts(0)
    expect(list.map((x: any) => x.name)).toEqual(['Draft 1', 'Draft 2'])
    expect(t!.name).toBe('Draft 2')
    expect(curDraftId(0)).toBe(t!.id)
    /* both blobs are the day as it stood — deep clones, not references */
    expect(list[0].d).not.toBe(DAYS[0])
    expect(list[1].d).not.toBe(DAYS[0])
    /* KEEP-IDS + stow-hardening: both blobs are plain clones, byte-identical to
       the live day (ids and all), and share its rids — which the dup minted */
    expect(JSON.stringify(list[0].d)).toBe(JSON.stringify(DAYS[0]))
    expect(JSON.stringify(list[1].d)).toBe(JSON.stringify(DAYS[0]))
    expect(rowsOf(list[0].d).map((r: any) => r.rid)).toEqual(rowsOf(DAYS[0]).map((r: any) => r.rid))   // one shared id-space
    expect(rowsOf(DAYS[0]).every((r: any) => typeof r.rid === 'string')).toBe(true)                    // the stow-hardening mint ran
    /* the live day's CONTENT is untouched by duplicating (ids aside) */
    expect(JSON.stringify(DAYS[0], ridless)).toBe(JSON.stringify(D0, ridless))
  })

  it('a later dup stows live into the selected entry and mints Draft N', () => {
    draftDup(0)                                     // Draft 1 + Draft 2 (selected)
    txtSet('dn:0.0', 'PLAN B NOTE')                 // edit while Draft 2 is live
    const t = draftDup(0)                           // stow into Draft 2, mint Draft 3
    expect(t!.name).toBe('Draft 3')
    expect(curDraftId(0)).toBe(t!.id)
    const d2 = dayDrafts(0).find((x: any) => x.name === 'Draft 2')
    expect(d2.d.notes[0].t).toBe('PLAN B NOTE')       // the stow caught the edit
    expect(t!.d.notes[0].t).toBe('PLAN B NOTE')       // the new draft copies live
  })

  it('default numbering is highest existing Draft N + 1, surviving renames and deletes', () => {
    draftDup(0)                                     // Draft 1, Draft 2
    draftDup(0)                                     // Draft 3
    const d1 = dayDrafts(0)[0]
    draftRename(0, d1.id, 'Wet weather')            // Draft 1 is gone by name
    const d2 = dayDrafts(0).find((x: any) => x.name === 'Draft 2')
    draftDelete(0, d2.id)
    const t = draftDup(0)
    expect(t!.name).toBe('Draft 4')                 // 3 is the highest left, not the count
  })

  it('a published day duplicates too, and its pending marks ride along untouched', () => {
    /* dup changes no content — live is stowed and an identical copy selected —
       so whatever was already pending toward the next AL stays exactly as it
       was (15 Aug 26; the old refusal moved to the rebase in draftSelect) */
    sign(0); setDayApproved(0, 1)
    expect(dayApproved(0)).toBe(true)
    txtSet('dn:0.0', 'AMEND ME')
    expect(SCHED.pending['dn:0.0']).toBe(1)
    const t = draftDup(0)
    expect(t!.name).toBe('Draft 2')
    expect(dayDrafts(0).length).toBe(2)
    expect(SCHED.pending['dn:0.0']).toBe(1)
  })
})

describe('switching drafts', () => {
  it('edits made while Draft 2 is selected survive a switch away and back', () => {
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.0', 'DRAFT 2 EDIT')
    expect(draftSelect(0, d1.id)).toBe(true)
    expect(curDraftId(0)).toBe(d1.id)
    expect(txtGet('dn:0.0')).toBe(D0.notes[0].t)      // Draft 1 is the day as it stood
    expect(draftSelect(0, d2.id)).toBe(true)
    expect(txtGet('dn:0.0')).toBe('DRAFT 2 EDIT')   // the stow held the edit
    /* and the installed blob is a clone — editing live must not reach the stowed copy */
    txtSet('dn:0.0', 'LATER STILL')
    expect(dayDrafts(0).find((x: any) => x.id === d2.id).d.notes[0].t).toBe('DRAFT 2 EDIT')
  })

  it('re-stamps .today from the live day — the calendar, not the document', () => {
    /* seed day 0 IS today, so both blobs stow today:true */
    expect(D0.today).toBeTruthy()
    draftDup(0)
    const [d1] = dayDrafts(0)
    DAYS[0].today = false                           // the calendar moved after the stow
    draftSelect(0, d1.id)
    expect(DAYS[0].today).toBe(false)               // re-stamped from live, not the blob
    expect(dayDrafts(0).find((x: any) => x.id === d1.id).d.today).toBeTruthy()
  })

  it('retires the day\'s own pending/added keys and leaves other days\' alone', () => {
    draftDup(0)
    const [d1] = dayDrafts(0)
    SCHED.pending['dn:0.0'] = 1; SCHED.pending['dn:1.0'] = 1
    SCHED.added['wl:0.9'] = 1; SCHED.added['wl:1.9'] = 1
    draftSelect(0, d1.id)
    expect(SCHED.pending['dn:0.0']).toBeUndefined()
    expect(SCHED.pending['dn:1.0']).toBe(1)
    expect(SCHED.added['wl:0.9']).toBeUndefined()
    expect(SCHED.added['wl:1.9']).toBe(1)
  })

  it('refuses an unknown id and the already-selected id', () => {
    draftDup(0)
    const [, d2] = dayDrafts(0)
    expect(draftSelect(0, 'nope')).toBe(false)
    expect(draftSelect(0, d2.id)).toBe(false)       // already live
    expect(txtGet('dn:0.0')).toBe(D0.notes[0].t)      // nothing moved
  })
})

/* SWITCHING DRAFTS ON A PUBLISHED DAY (owner, 15 Aug 26 — "change to draft 1
   to publish as AL1 but make some edits prior"). The old "Reopen the day
   first" refusal is gone: the issued snapshots are immutable, so nothing the
   squadron holds can change under a switch — what CHANGES is the live working
   copy, and the rebase recomputes the day's pending set as the true diff
   between it and the issued document, so the next AL carries exactly what a
   hand-edit to the same result would have carried. */
describe('switching drafts on a PUBLISHED day — the pending rebase', () => {
  const dayPend = () => Object.keys(SCHED.pending).filter((k: any) => keyDay(k) === 0).sort()
  /* mint ids BEFORE publishing, exactly as boot does (initStore → ensureRowIds
     → then the day is approved), so the frozen snapshot and the live day share
     one rid-space — the production invariant the rebase's rid join relies on.
     Without it the snapshot is id-less while a stow mints the live day, and the
     structural diff (identity = rid) would read every row as removed+added. */
  const pub = () => { ensureRowIds(DAYS); sign(0); setDayApproved(0, 1) }

  it('switching to a draft that matches the issued day leaves zero pending', () => {
    pub()
    draftDup(0)                                     // Draft 1 = issued content, Draft 2 live
    const [d1] = dayDrafts(0)
    txtSet('dn:0.0', 'PLAN B')                      // diverge Draft 2
    expect(dayPend()).toEqual(['dn:0.0'])
    expect(draftSelect(0, d1.id)).toBe(true)
    expect(dayPend()).toEqual([])                   // Draft 1 IS the issued day
    expect(txtGet('dn:0.0')).toBe(D0.notes[0].t)
  })

  it('switching back to the edited draft re-marks exactly the differences', () => {
    pub()
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.0', 'PLAN B')
    draftSelect(0, d1.id)
    draftSelect(0, d2.id)
    expect(dayPend()).toEqual(['dn:0.0'])
    expect(SCHED.changes['dn:0.0']).toBeUndefined()
    expect(txtGet('dn:0.0')).toBe('PLAN B')
  })

  it('a cell matching the issued day keeps its AL tint; only divergence goes pending', () => {
    pub()
    txtSet('dn:0.0', 'AMENDED NOTE')
    sign(0)                                         // publish spent the first signature
    publishALDay(0)                                 // AL1 — changes['dn:0.0']=1
    expect(SCHED.changes['dn:0.0']).toBe(1)
    draftDup(0)                                     // both drafts carry the AL1 content
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.1', 'SECOND NOTE B')               // diverge a DIFFERENT cell on Draft 2
    draftSelect(0, d1.id)                           // Draft 1 == AL1 content exactly
    expect(dayPend()).toEqual([])
    expect(SCHED.changes['dn:0.0']).toBe(1)         // the matching cell wears its issued mark
    draftSelect(0, d2.id)
    expect(dayPend()).toEqual(['dn:0.1'])
    expect(SCHED.changes['dn:0.0']).toBe(1)         // Draft 2 carries the AL1 note too — still matching
    expect(SCHED.changes['dn:0.1']).toBeUndefined()
  })

  it('an extra row goes pending AND carries a draft-add identity', () => {
    pub()
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    DAYS[0].notes.push('NEW NOTE')                  // structural add while Draft 2 is live
    draftSelect(0, d1.id)
    expect(dayPend()).toEqual([])
    expect(SCHED.added['dn:0.2']).toBeUndefined()
    draftSelect(0, d2.id)
    expect(dayPend()).toEqual(['dn:0.2'])
    expect(SCHED.added['dn:0.2']).toBe(1)
    /* add-then-delete before the AL stays a net no-op, exactly like a hand add */
    expect(deletionWasIssued(0, 'note', 2)).toBe(false)
  })

  it('a missing row mints one inert deletion tombstone, not a field-by-field trail', () => {
    pub()
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    DAYS[0].notes.splice(1, 1)                      // Draft 2 drops the last note
    draftSelect(0, d1.id)
    expect(dayPend()).toEqual([])
    draftSelect(0, d2.id)
    expect(dayPend()).toEqual(['del:0.1.note'])
    expect(deleteCount(dayPend())).toBe(1)
  })

  it('a shrunk who list marks the emptied hole on the surviving row', () => {
    DAYS[0].allhands[1].who = ['nact', 'xtra']      // grow the roster BEFORE publish
    pub()
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    DAYS[0].allhands[1].who = ['nact']              // Draft 2 drops the extra body
    draftSelect(0, d1.id)
    expect(dayPend()).toEqual([])
    draftSelect(0, d2.id)
    expect(dayPend()).toEqual([rk('a:0.1.1')])      // the hole, rid-anchored to the row that survives
  })

  it('an A→B→A round trip ends clean — no pending, no added, no tombstones', () => {
    pub()
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.0', 'PLAN B')
    DAYS[0].notes.push('EXTRA')
    draftSelect(0, d1.id)
    draftSelect(0, d2.id)
    draftSelect(0, d1.id)
    expect(dayPend()).toEqual([])
    expect(Object.keys(SCHED.added)).toEqual([])
  })

  it('an inp: pending key survives the rebase — it addresses INPUTS, not the day blob', () => {
    pub()
    draftDup(0)
    const [d1] = dayDrafts(0)
    SCHED.pending['inp:0.leave%2Dabc'] = 1
    draftSelect(0, d1.id)
    expect(SCHED.pending['inp:0.leave%2Dabc']).toBe(1)
    expect(dayPend()).toEqual(['inp:0.leave%2Dabc'])
  })

  /* Phase 2 removed unpublishAL (undo-across-publish is Phase 3, no take-back),
     so the "unpublishing returns it to pending" tail is gone; the rebase→publish
     flow it led with is repointed here to the verId contract. */
  it('publishing the rebased diff issues it as the AL', () => {
    pub()
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.0', 'PLAN B')
    draftSelect(0, d1.id)
    draftSelect(0, d2.id)                           // pending = the rebase's diff
    sign(0)
    publishALDay(0)
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(dayPend()).toEqual([])
    const al1 = dayCurVer(0)
    expect(verSeq(al1)).toBe(1)
    expect(daySnapOf(0, al1).d.notes[0].t).toBe('PLAN B')
  })

  it('other days\' pending and added keys are untouched by the rebase', () => {
    pub()
    draftDup(0)
    const [d1] = dayDrafts(0)
    SCHED.pending['dn:1.0'] = 1
    SCHED.added['wl:1.9'] = 1
    draftSelect(0, d1.id)
    expect(SCHED.pending['dn:1.0']).toBe(1)
    expect(SCHED.added['wl:1.9']).toBe(1)
  })
})

/* THE RID-NATIVE PATH (addressing-by-rid, 11 Sep 26). The pins above run
   id-less (this file never boots), so they exercise the positional fallback.
   These mint rids first — production reality, where the live day, its drafts
   and its issued snapshots share ONE rid-space — and pin the behaviours that
   only the rid join gets right. */
describe('switching drafts on a PUBLISHED day — rid-native', () => {
  const dayPend = () => Object.keys(SCHED.pending).filter((k: any) => keyDay(k) === 0)
  const twoWaves = () => { while (DAYS[0].waves.length < 2) DAYS[0].waves.push({ formations: [], label: '', night: false, kind: 'sc' }) }

  /* Phase 2 removed unpublishAL — the "unpublish returns the mark" tail is gone;
     the core pin (the AL tint survives a published-day draft switch) stays. */
  it('AL tint survives a published-day draft switch (the core pin)', () => {
    ensureRowIds(DAYS)
    twoWaves(); ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)                       // Original
    txtSet('wl:0.0', 'AMENDED WAVE'); sign(0); publishALDay(0)   // AL1 on a ROW key
    const cs = rk('wl:0.0')
    expect(SCHED.changes[cs]).toBe(1)
    draftDup(0)
    const [d1] = dayDrafts(0)
    draftSelect(0, d1.id)                               // Draft 1 == AL1 content
    expect(alAttr('wl:0.0')).toContain('data-alc="1"')  // the switched draft carries the issued ids — the tint paints
  })

  it('draftDup keeps ids; a genuinely new row still gets a fresh one (the decision pin)', () => {
    ensureRowIds(DAYS)
    const src = rowsOf(DAYS[0]).map((r: any) => r.rid)
    draftDup(0)
    const [d1] = dayDrafts(0)
    expect(rowsOf(d1.d).map((r: any) => r.rid)).toEqual(src)   // the parked draft KEEPS the source ids
    DAYS[0].waves.push({ formations: [], label: 'NEW', night: false, kind: 'sc' })
    ensureRowIds(DAYS)                                   // the next mint
    const added = DAYS[0].waves[DAYS[0].waves.length - 1].rid
    expect(src.includes(added)).toBe(false)             // a real add is never confused with a survivor
  })

  it('a reorder-only draft swap still records a mov: (Fable #1)', () => {
    ensureRowIds(DAYS)
    twoWaves()
    DAYS[0].waves[0].label = 'SAME'; DAYS[0].waves[1].label = 'SAME'   // equal values hide the move from a value diff
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    const w = DAYS[0].waves;[w[0], w[1]] = [w[1], w[0]]  // swap the two waves in the live draft
    draftSelect(0, d1.id); draftSelect(0, d2.id)         // away and back → rebase
    expect(dayPend().some((k: any) => /^mov:0\./.test(String(k)))).toBe(true)
  })

  it('reorder + edit does NOT lose the edit (Astra RID-R5-01)', () => {
    DAYS[0].ground = [
      { prog: 'A', str: '08:30', end: '', who: '', rmks: '' },
      { prog: 'B', str: '09:00', end: '', who: '', rmks: '' },
    ]
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)                        // issue [A(08:30), B(09:00)]
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    const g = DAYS[0].ground;[g[0], g[1]] = [g[1], g[0]]  // reorder → [B, A]
    g[0].str = '08:30'                                    // and edit B's time to match A's
    draftSelect(0, d1.id); draftSelect(0, d2.id)          // away and back → rebase
    /* B now sits at index 0 with 08:30 vs its ISSUED 09:00 — a positional diff
       would compare index-0 08:30 to index-0 08:30 (A) and miss it; the rid
       join finds B's real change */
    expect(SCHED.pending[rk('gr:0.0.str')]).toBe(1)
  })

  it('add → reorder → delete both the add and an issued neighbour: attribution is by id (Astra RID-02)', () => {
    DAYS[0].ground = [
      { prog: 'A', str: '', end: '', who: '', rmks: '' },
      { prog: 'B', str: '', end: '', who: '', rmks: '' },
    ]
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)                        // issue [A, B]
    draftDup(0)
    const [, d2] = dayDrafts(0)
    /* add X, then reorder so the ADD is NOT at the tail — the case the old
       length+tail diff mis-attributed */
    DAYS[0].ground.push({ prog: 'X', str: '', end: '', who: '', rmks: '' })
    ensureRowIds(DAYS)
    const g = DAYS[0].ground;[g[0], g[2]] = [g[2], g[0]]  // [X, B, A]
    draftSelect(0, dayDrafts(0)[0].id); draftSelect(0, d2.id)   // rebase
    const xRid = DAYS[0].ground.findIndex((r: any) => r.prog === 'X')
    expect(SCHED.added[rk(`gr:0.${xRid}.prog`)], 'the ADD is credited to X, wherever it sits').toBe(1)
    expect(deletionWasIssued(0, 'ground', DAYS[0].ground.findIndex((r: any) => r.prog === 'A')),
      'A was issued, so deleting it is a real removal').toBe(true)
  })

  /* ---- the build bug-check's regression cases (Astra RID-IR-01/04/05) ---- */

  it('an add whose field values equal an issued row keeps its mark after a move (RID-IR-01)', () => {
    DAYS[0].dutywaves = [{ label: 'D', rows: [{ role: 'SDO', id: '', str: '0700', end: '1300' }] }]
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)                                  // issue [A]
    /* add B with IDENTICAL field values, then move it ABOVE A on the published
       day — the case where a positional fallback would compare B against the
       matching issued A at index 0 and wrongly drop B's mark */
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: '', str: '0700', end: '1300' })
    ensureRowIds(DAYS)
    markStructuralAdd('dr:0.0.1.role')                            // B added at index 1
    moveDutyRow(0, 0, 1, 0)                                       // B moves to index 0 (above A)
    reconcileIssuedMarks()
    expect(SCHED.added[rk('dr:0.0.0.role')], 'B keeps its structural add').toBe(1)
    expect(SCHED.pending[rk('dr:0.0.0.role')], 'and its field mark survives reconcile — it is genuinely absent from the issued day, not a positional match').toBe(1)
  })

  it('a mark on a row deleted in a draft is not reinstated on switch-back (RID-IR-04)', () => {
    DAYS[0].ground = [{ prog: 'A', str: '', end: '', who: '', rmks: '' }, { prog: 'B', str: '', end: '', who: '', rmks: '' }]
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)
    txtSet('gr:0.1.prog', 'B-AMENDED'); sign(0); publishALDay(0)  // AL1 tints B.prog
    const bKey = rk('gr:0.1.prog')
    expect(SCHED.changes[bKey]).toBe(1)
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    DAYS[0].ground.splice(1, 1)                                   // delete B in the live draft
    draftSelect(0, d1.id)                                         // away (d1 still has B)
    draftSelect(0, d2.id)                                         // back to the B-deleted draft → rebase
    expect(SCHED.changes[bKey], 'B is gone from the draft, so its AL1 tint is not resurrected into the live map').toBeUndefined()
    expect(Object.keys(SCHED.pending).some((k: any) => k === bKey), 'and no dangling B field key is pending').toBe(false)
  })

  it('a formation-level AREA override edit survives reconcile (Astra RID-REV-02)', () => {
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)                                  // issue with the derived area
    const f = DAYS[0].waves[0].formations[0]
    f.area = 'D99X'; markEdit('ar:0.0.0')                          // a FORMATION override (ui/textedit writes f.area)
    reconcileIssuedMarks()
    expect(SCHED.pending[rk('ar:0.0.0')], 'the override differs from the issued day — kept').toBe(1)
    f.area = null; reconcileIssuedMarks()                          // back to the derived value
    expect(SCHED.pending[rk('ar:0.0.0')], 'reverted → cleared').toBeUndefined()
  })

  /* DELETED (Phase 2): this scenario's terminal assertions all read state AFTER
     unpublishAL(3) — the row returns to draft-added only because AL3 is retracted.
     unpublishAL is gone (undo-across-publish is Phase 3, no take-back), so the
     asserted state is no longer reachable. */

  it('a manual ground move whose model order equals the issued model still records a mov: (Astra RID-REV-03)', () => {
    /* issued auto-ordered [Late, Early] → displays [Early, Late] */
    DAYS[0].ground = [{ prog: 'Late', str: '10:00', end: '', who: '', rmks: '' }, { prog: 'Early', str: '08:00', end: '', who: '', rmks: '' }]
    ensureRowIds(DAYS)
    sign(0); setDayApproved(0, 1)
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    moveGroundRow(0, 0, 1)                                         // drag Late below — freezes display order, sets gman
    draftSelect(0, d1.id); draftSelect(0, d2.id)                   // away and back → rebase
    expect(Object.keys(SCHED.pending).some((k: any) => /^mov:0\.\d+\.ground$/.test(String(k))), 'the display-order move is recorded').toBe(true)
  })

  it('a stow mints ids first, so no id-less row is ever parked (RID-IR-05)', () => {
    /* an id-less row (as applyDayTpl leaves one) then a dup BEFORE any histPush */
    DAYS[0].ground = [{ prog: 'X', str: '', end: '', who: '', rmks: '' }]   // no rid minted
    expect(rowsOf(DAYS[0]).some((r: any) => !r.rid)).toBe(true)
    draftDup(0)
    const [d1] = dayDrafts(0)
    expect(rowsOf(DAYS[0]).every((r: any) => typeof r.rid === 'string'), 'the stow minted the live day first').toBe(true)
    expect(rowsOf(d1.d).every((r: any) => typeof r.rid === 'string'), 'so the parked blob carries no id-less row').toBe(true)
    expect(rowsOf(d1.d).map((r: any) => r.rid)).toEqual(rowsOf(DAYS[0]).map((r: any) => r.rid))   // shared identities
  })
})

describe('rename and delete', () => {
  it('rename trims, clamps to 24, and refuses empty or a duplicate in the day', () => {
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    expect(draftRename(0, d1.id, '  Wet weather  ')).toBe(true)
    expect(d1.name).toBe('Wet weather')
    expect(draftRename(0, d2.id, '   ')).toBe(false)
    expect(d2.name).toBe('Draft 2')
    expect(draftRename(0, d2.id, 'Wet weather')).toBe(false)   // dup in the day
    expect(draftRename(0, d1.id, 'Wet weather')).toBe(true)    // its own name is not a dup
    expect(draftRename(0, d1.id, 'x'.repeat(40))).toBe(true)
    expect(d1.name.length).toBe(MAX_DRAFT_NAME)
    expect(draftRename(0, 'nope', 'x')).toBe(false)
  })

  it('delete refuses the selected draft; anything else goes, down to one entry', () => {
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    expect(draftDelete(0, d2.id)).toBe(false)       // selected — the live day
    expect(dayDrafts(0).length).toBe(2)
    expect(draftDelete(0, d1.id)).toBe(true)
    expect(dayDrafts(0).length).toBe(1)             // a one-entry list is legal
    expect(curDraftId(0)).toBe(d2.id)
    expect(draftDelete(0, 'nope')).toBe(false)
  })
})

describe('publish — unchanged, and that is the point', () => {
  it('setDayApproved publishes whatever is live, which is the selected draft', () => {
    draftDup(0)
    txtSet('dn:0.0', 'THE WET PLAN')                // Draft 2 is live; edit it
    sign(0); setDayApproved(0, 1)
    expect(dayApproved(0)).toBe(true)
    /* the Original froze the SELECTED draft's content, not Draft 1's */
    expect(SCHED.orig[0].d.notes[0].t).toBe('THE WET PLAN')
    /* and the day's pending marks were spent on the issue as always */
    expect(Object.keys(SCHED.pending).filter(k => k.indexOf(':0.') > 0 || /^dn:0\./.test(k))).toEqual([])
  })
})

describe('daySnapOf resolves d:<id>', () => {
  it('answers the draft blob with an empty changes slice, and null once deleted', () => {
    draftDup(0)
    const [d1] = dayDrafts(0)
    const snap = daySnapOf(0, 'd:' + d1.id)
    expect(snap).toBeTruthy()
    expect(snap.d).toBe(d1.d)                       // the blob itself, like an AL's rec.snap
    expect(snap.c).toEqual({})                      // a draft wears no issued marks
    expect(daySnapOf(0, 'd:nope')).toBeNull()
    draftSelect(0, d1.id)
    const d2 = dayDrafts(0).find((x: any) => x.id !== d1.id)
    draftDelete(0, d2.id)
    expect(daySnapOf(0, 'd:' + d2.id)).toBeNull()   // deleted — prunePreviews' test
    expect(isDraftVer('d:' + d1.id)).toBe(true)
    expect(isDraftVer('orig')).toBe(false)
    expect(isDraftVer(2)).toBe(false)
  })

  it('draftVerLabel names the draft, and defers everything else to verLabel', () => {
    draftDup(0)
    const [d1] = dayDrafts(0)
    draftRename(0, d1.id, 'Wet weather')
    /* Phase 2: draftVerLabel defers a non-draft ver to verLabel, which speaks
       verIds — the Original is `iso#0`, an AL is `iso#seq`, never 'orig'/a number. */
    const iso = dayIso(CURWEEK, 0)
    expect(draftVerLabel(0, 'd:' + d1.id)).toBe('Wet weather')
    expect(draftVerLabel(0, 'd:nope')).toBe('Draft')
    expect(draftVerLabel(0, 'live')).toBe('Live')
    expect(draftVerLabel(0, verId(iso, 0))).toBe('Original')
    expect(draftVerLabel(0, verId(iso, 3))).toBe('AL3')
  })
})

describe('undo carries the drafts', () => {
  it('a histSnap/histApply round trip preserves drafts and the selection', () => {
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.0', 'DRAFT 2 EDIT')
    HIST.stack = [histSnap()]; HIST.ix = 0
    SCHED.drafts = {}; SCHED.curDraft = {}
    histApply(0)
    expect(dayDrafts(0).map((x: any) => x.id)).toEqual([d1.id, d2.id])
    expect(curDraftId(0)).toBe(d2.id)
    expect(txtGet('dn:0.0')).toBe('DRAFT 2 EDIT')
  })

  it('a draftDup is ONE undoable step, and undoing it removes the blobs', () => {
    histInit()
    /* histInit's own mint (engine/rowids.ts) already ran, so DAYS[0] carries
       its rids from here on — capture the byte string AFTER that, not
       before, so the compare below also proves undo hands back the SAME
       ids, not merely the same content. */
    const init = JSON.stringify(DAYS[0])
    expect(HIST.stack.length).toBe(1)
    draftDup(0)
    histPush()                                      // the UI caller's afterSchedMutate step
    expect(HIST.stack.length).toBe(2)
    histApply(0)
    expect(dayDrafts(0)).toEqual([])
    expect(curDraftId(0)).toBeUndefined()
    expect(JSON.stringify(DAYS[0])).toBe(init)
    histApply(1)                                    // redo brings both drafts back
    expect(dayDrafts(0).map((x: any) => x.name)).toEqual(['Draft 1', 'Draft 2'])
  })
})

describe('loadVersionToWorkingCopy — an issued version onto the working copy (owner, 16 Aug 26)', () => {
  it('loads the content but leaves the issued version (viewers) unchanged', () => {
    const key = 'dn:0.0'
    const orig = txtGet(key)
    sign(0); setDayApproved(0, 1)                    // issued at the Original
    const origVer = (SCHED.orig[0] as any).id        // the Original verId
    txtSet(key, 'AMENDED'); sign(0); publishALDay(0) // now issued at AL1
    const al1 = dayCurVer(0)
    expect(verSeq(al1)).toBe(1)
    txtSet(key, 'IN PROGRESS')                       // a working-copy edit
    const ok = loadVersionToWorkingCopy(0, origVer)  // bring the Original back
    expect(ok).toBe(true)
    expect(txtGet(key), 'the working copy took the Original content').toBe(orig)
    expect(dayCurVer(0), 'the issued version stays AL1 — viewers are untouched').toBe(al1)
    /* the working copy now differs from AL1, so it carries a pending mark that a
       future AL2 would issue */
    expect(SCHED.pending[key], 'the difference from AL1 shows as pending').toBe(1)
  })
})

describe('a canonical-only field change survives reconcile — the mark system sees it now (P2-REREVIEW-10)', () => {
  it('changing a dutyblock sa keeps its mark on the block composite and is publishable', () => {
    sign(0); setDayApproved(0, 1)                          // issue the Original
    const block = DAYS[0].dutywaves[0]
    block.sa = (block.sa === 'sc') ? '' : 'sc'             // a canonical-only field change
    markEdit('dl:0.0')                                     // marked on the block header
    reconcileIssuedMarks()
    expect(SCHED.pending[rk('dl:0.0')], 'the sa change is a real diff on the composite → mark survives reconcile').toBe(1)
    expect(dayHasChanges(0)).toBe(true)
  })
})

describe('reconcileIssuedMarks — an undone edit clears its own mark (owner, 16 Aug 26)', () => {
  it('editing a field away from the issued value marks it; editing it back clears the mark', () => {
    const key = 'dn:0.0'
    const issued = txtGet(key)
    sign(0); setDayApproved(0, 1)                    // issued at the Original
    txtSet(key, issued + ' CHANGED'); reconcileIssuedMarks()
    expect(SCHED.pending[key], 'a real change stays marked').toBe(1)
    txtSet(key, issued); reconcileIssuedMarks()
    expect(SCHED.pending[key], 'restoring the issued value clears the mark').toBeUndefined()
  })

  it('restoring a value that was issued at AL1 brings the AL1 tint back, not a pending mark', () => {
    const key = 'dn:0.0'
    sign(0); setDayApproved(0, 1)
    txtSet(key, 'AMENDED AT AL1'); sign(0); publishALDay(0)   // AL1 issues it; changes[key]=1
    expect(SCHED.changes[key]).toBe(1)
    txtSet(key, 'WORKING EDIT'); reconcileIssuedMarks()       // move away from AL1
    expect(SCHED.pending[key]).toBe(1)
    expect(SCHED.changes[key], 'the tint is dropped while it differs').toBeUndefined()
    txtSet(key, 'AMENDED AT AL1'); reconcileIssuedMarks()     // back to what AL1 issued
    expect(SCHED.pending[key], 'no longer a pending change').toBeUndefined()
    expect(SCHED.changes[key], 'the AL1 tint is restored').toBe(1)
  })
})

/* A MARK STRANDED AT AN ADDRESS IN NEITHER DOCUMENT (owner, 16 Aug 26 — "swap
   the pucks and swap it back… it shouldn't register as a change"). A drop onto
   an OCCUPIED row (ui/drag.ts's cell branch, via fillSlot) parks the dropped
   man at the row's more[] overflow address — 'd:0.0.0.x0' on day 0's SDO row,
   which already holds mamba — an address the issued day never had. Dragging
   him back off (setSlotVal to '') trims the entry away again, so the address
   is gone from BOTH the issued snapshot and the live day. Before the fix that
   left a phantom pending mark nothing could ever clear: the day read edited
   and would have minted an AL over a net no-op. */
describe('reconcileIssuedMarks — a mark stranded at an address in neither document (owner, 16 Aug 26)', () => {
  const pub = () => { sign(0); setDayApproved(0, 1) }
  const dayPend = () => Object.keys(SCHED.pending).filter((k: any) => keyDay(k) === 0).sort()

  it('the owner\'s gesture: drop onto an occupied row, then drag the man back off — no phantom mark survives', () => {
    pub()
    const key = 'd:0.0.0.x0'
    fillSlot('d:0.0.0.+', 'razer')                  // SDO row already holds mamba — parks razer at .x0
    reconcileIssuedMarks()
    expect(SCHED.pending[rk(key)], 'mid-flight this is a genuine add').toBe(1)
    setSlotVal(key, '')                             // drag him back off — the trailing trim deletes the entry
    reconcileIssuedMarks()
    expect(SCHED.pending[rk(key)], 'the phantom mark clears — the address is gone from both documents').toBeUndefined()
    expect(dayPend(), 'the day reads unedited — publishing would not mint an AL').toEqual([])
  })

  it('a genuine add — no revert — keeps its mark', () => {
    pub()
    fillSlot('d:0.0.0.+', 'razer')
    reconcileIssuedMarks()
    expect(SCHED.pending[rk('d:0.0.0.x0')], 'live-only = a genuine add, not a phantom').toBe(1)
  })

  it('a del: tombstone and an inp: key are inert marks — reconcile never touches them by name', () => {
    pub()
    SCHED.pending['del:0.1.note'] = 1
    SCHED.pending['inp:0.leave%2Dabc'] = 1
    reconcileIssuedMarks()
    expect(SCHED.pending['del:0.1.note'], 'a deletion tombstone survives').toBe(1)
    expect(SCHED.pending['inp:0.leave%2Dabc'], 'an input-filing mark survives — it addresses INPUTS, not the day').toBe(1)
  })

  it('id-vs-callsign round trip: the same person back in a different spelling still clears the mark', () => {
    /* MET + NOTAM BRIEF's who[0] — the seed holds the id form ('nact') */
    const key = 'a:0.1.0'
    expect(dayKeys(DAYS[0], 0).get(key), 'the fresh seed holds the id spelling').toBe('nact')
    pub()
    setSlotVal(key, 'razer')                         // overwrite — a genuine change
    reconcileIssuedMarks()
    expect(SCHED.pending[rk(key)]).toBe(1)
    setSlotVal(key, 'nact')                          // back to the same man — setSlotVal stores his callsign 'Warden'
    reconcileIssuedMarks()
    expect(SCHED.pending[rk(key)], 'canonical compare: callsign live vs id issued still match').toBeUndefined()
  })

  it('an ⓘ info-only flip on a published day is a real amendment — reconcile keeps the mark, and drops it when flipped back', () => {
    pub()
    DAYS[0].ground[0].info = true
    SCHED.pending['gr:0.0.prog'] = 1                  // what board.ts marks on the ⓘ tap
    reconcileIssuedMarks()
    expect(SCHED.pending['gr:0.0.prog'], 'the flip differs from the issued day').toBe(1)
    DAYS[0].ground[0].info = false
    reconcileIssuedMarks()
    expect(SCHED.pending['gr:0.0.prog'], 'flipped back = nothing to publish').toBeUndefined()
  })
})
