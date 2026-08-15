/* Per-day alternate drafts (owner, 15 Aug 26) — the engine half. The live
   DAYS[di] IS the selected draft's working copy: duplicating stows and mints,
   switching stows and reloads, and publishing needs no change at all because
   setDayApproved publishes whatever is live. Undo carries the blobs because
   histSnap/histApply serialize SCHED.drafts/SCHED.curDraft explicitly. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED, signOf, setDayApproved, dayApproved, daySnapOf } from './publish'
import { txtSet, txtGet } from './slots'
import {
  dayDrafts, curDraftId, draftDup, draftSelect, draftRename, draftDelete,
  draftVerLabel, isDraftVer, MAX_DRAFT_NAME,
} from './drafts'
import { HIST, histInit, histApply, histPush, histSnap } from '../state/history'

/* drafts swap DAYS[0] wholesale — every test starts from the pristine day,
   same discipline daytpl.test.ts and restore.test.ts use */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))

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
    expect(JSON.stringify(list[0].d)).toBe(JSON.stringify(DAYS[0]))
    /* the live day itself is untouched by duplicating */
    expect(JSON.stringify(DAYS[0])).toBe(JSON.stringify(D0))
  })

  it('a later dup stows live into the selected entry and mints Draft N', () => {
    draftDup(0)                                     // Draft 1 + Draft 2 (selected)
    txtSet('dn:0.0', 'PLAN B NOTE')                 // edit while Draft 2 is live
    const t = draftDup(0)                           // stow into Draft 2, mint Draft 3
    expect(t!.name).toBe('Draft 3')
    expect(curDraftId(0)).toBe(t!.id)
    const d2 = dayDrafts(0).find((x: any) => x.name === 'Draft 2')
    expect(d2.d.notes[0]).toBe('PLAN B NOTE')       // the stow caught the edit
    expect(t!.d.notes[0]).toBe('PLAN B NOTE')       // the new draft copies live
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

  it('refuses a published day — drafts are pre-publish by definition', () => {
    sign(0); setDayApproved(0, 1)
    expect(dayApproved(0)).toBe(true)
    expect(draftDup(0)).toBeNull()
    expect(dayDrafts(0)).toEqual([])
  })
})

describe('switching drafts', () => {
  it('edits made while Draft 2 is selected survive a switch away and back', () => {
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    txtSet('dn:0.0', 'DRAFT 2 EDIT')
    expect(draftSelect(0, d1.id)).toBe(true)
    expect(curDraftId(0)).toBe(d1.id)
    expect(txtGet('dn:0.0')).toBe(D0.notes[0])      // Draft 1 is the day as it stood
    expect(draftSelect(0, d2.id)).toBe(true)
    expect(txtGet('dn:0.0')).toBe('DRAFT 2 EDIT')   // the stow held the edit
    /* and the installed blob is a clone — editing live must not reach the stowed copy */
    txtSet('dn:0.0', 'LATER STILL')
    expect(dayDrafts(0).find((x: any) => x.id === d2.id).d.notes[0]).toBe('DRAFT 2 EDIT')
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

  it('refuses an unknown id, the already-selected id, and a published day', () => {
    draftDup(0)
    const [d1, d2] = dayDrafts(0)
    expect(draftSelect(0, 'nope')).toBe(false)
    expect(draftSelect(0, d2.id)).toBe(false)       // already live
    sign(0); setDayApproved(0, 1)
    expect(draftSelect(0, d1.id)).toBe(false)
    expect(txtGet('dn:0.0')).toBe(D0.notes[0])      // nothing moved
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
    expect(SCHED.orig[0].d.notes[0]).toBe('THE WET PLAN')
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
    expect(draftVerLabel(0, 'd:' + d1.id)).toBe('Wet weather')
    expect(draftVerLabel(0, 'd:nope')).toBe('Draft')
    expect(draftVerLabel(0, 'live')).toBe('Live')
    expect(draftVerLabel(0, 'orig')).toBe('Original')
    expect(draftVerLabel(0, 3)).toBe('AL3')
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
    expect(HIST.stack.length).toBe(1)
    draftDup(0)
    histPush()                                      // the UI caller's afterSchedMutate step
    expect(HIST.stack.length).toBe(2)
    histApply(0)
    expect(dayDrafts(0)).toEqual([])
    expect(curDraftId(0)).toBeUndefined()
    expect(JSON.stringify(DAYS[0])).toBe(JSON.stringify(D0))
    histApply(1)                                    // redo brings both drafts back
    expect(dayDrafts(0).map((x: any) => x.name)).toEqual(['Draft 1', 'Draft 2'])
  })
})
