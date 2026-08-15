/* Ported from reference/tfin.js — the per-day sign-off / publish-day /
   amendment-level flow (B22/B26/B47/B49) and the B53 #14 history stamp.
   The reference drives these through buttons; the same model contracts are
   driven here through the engine (with the UI hooks left as no-ops). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE, isScheduler } from './people'
import { SCHED, signOf, signMissing, daySigned, signClear, signNames, signPeople, setDayApproved, dayApproved, publishableKeys, pendDays, dayPendCount, canPublishAL, alUnsignedDays, publishAL, publishALDay, unpublishAL, discardPending, alIssue, alCount, alDays, alUsed, nextAL, markEdit, markStructuralAdd, markDeletion, deletionWasIssued, isDeleteKey, deleteCount, pendCount, alColor, alAttr, daySnapOf, dayVersions, verLabel, dayCurVer } from './publish'
import { noteChange, txtSet, txtGet } from './slots'
import { keyDay, shiftKeys } from './keys'
import { moveNote } from './reorder'
import { restoreDayVersion } from './restore'

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}

beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
})

describe('per-day sign-off (tfin B22/B24)', () => {
  it('the strip has the four roles', () => {
    expect(signMissing(0)).toEqual(['CUR CK', 'SKED CK', 'PLANNED BY', 'APPROVED BY'])
  })

  it('the three scheduling roles offer ONLY appointed schedulers', () => {
    expect(signPeople(true).every(id => isScheduler(id))).toBe(true)
  })

  it('CUR CK stays open to everyone', () => {
    const cur = signPeople(false), sk = signPeople(true)
    expect(cur.length).toBeGreaterThan(sk.length)
    expect(cur.some(id => !isScheduler(id))).toBe(true)
    expect(sk.length > 0 && sk.every(v => cur.includes(v))).toBe(true)
  })

  it('some schedulers are appointed', () => {
    expect(signPeople(true).length).toBeGreaterThan(3)
  })

  it('a name already signed stays offered even if the appointment was withdrawn', () => {
    const keep = PEOPLE.ignite.quals.sched
    PEOPLE.ignite.quals.sched = false
    expect(signPeople(true, 'ignite')).toContain('ignite')
    PEOPLE.ignite.quals.sched = keep
  })

  it('nor through the model — a locked day cannot be published', () => {
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(false)
  })

  it('three of four is still locked', () => {
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['APPROVED BY'])
  })

  it('all four unlocks the day, and signing one day leaves the others locked', () => {
    sign(0)
    expect(daySigned(0)).toBe(true)
    expect(daySigned(1)).toBe(false)
  })

  it('a withdrawn appointment invalidates the signature', () => {
    sign(0)
    const keep = PEOPLE.pump.quals.sched
    PEOPLE.pump.quals.sched = false
    expect(daySigned(0)).toBe(false)
    expect(signMissing(0)).toEqual(['APPROVED BY'])
    PEOPLE.pump.quals.sched = keep
  })
})

describe('publishing a day (tfin B26/B47)', () => {
  it('a signed day publishes, spends its signature, and takes only its own pending', () => {
    noteChange('0.0.0.0.p'); noteChange('dn:1.0')
    sign(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    /* the signature is spent on the issue */
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
    /* day 0's pending went out with the day; day 1's is untouched */
    expect(SCHED.pending['0.0.0.0.p']).toBeUndefined()
    expect(SCHED.pending['dn:1.0']).toBe(1)
  })

  it('reopening a day voids its signature too', () => {
    sign(0); setDayApproved(0, true); sign(0)
    setDayApproved(0, false)
    expect(dayApproved(0)).toBe(false)
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
  })

  it('signNames records callsigns for the record', () => {
    sign(0)
    expect(signNames(0)).toEqual({ cur: 'Ignite', sked: 'Bane', plan: 'Stiff', appr: 'Pump' })
  })
})

describe('publishing an AL (tfin B49 / B26)', () => {
  it('pending edits only become publishable once their day is published', () => {
    noteChange('dn:0.0'); noteChange('dn:1.0')
    expect(publishableKeys()).toEqual([])
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0')
    expect(publishableKeys()).toEqual(['dn:0.0'])
    expect(pendDays()).toEqual([0, 1])
    expect(dayPendCount(0)).toBe(1)
  })

  it('publishing an AL needs that day signed', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0')
    expect(canPublishAL()).toBe(false)            // the publish spent the signature
    expect(alUnsignedDays()).toEqual([0])
    sign(0)
    expect(canPublishAL()).toBe(true)
    publishAL(1)
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(SCHED.pending['dn:0.0']).toBeUndefined()
    expect(alUsed()).toEqual([1])
  })

  it('a per-day AL takes only that day\'s keys', () => {
    sign(0); setDayApproved(0, true)
    sign(1); setDayApproved(1, true)
    noteChange('dn:0.0'); noteChange('dn:1.0')
    sign(0)
    publishALDay(0)
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(SCHED.pending['dn:1.0']).toBe(1)       // held on the other day
    expect(pendCount()).toBe(1)
  })

  it('the published AL records a name per day and spends the signature again', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0'); sign(0)
    publishALDay(0)
    const rec = SCHED.als[0]
    expect(rec.n).toBe(1)
    expect(rec.sign[0].appr).toBe('Pump')
    expect(Object.values(signOf(0)).every(v => v === '')).toBe(true)
    expect(dayApproved(0)).toBe(true)             // the day stays published
  })

  it('unpublish clears the AL marks back to pending', () => {
    sign(0); setDayApproved(0, true)
    noteChange('dn:0.0'); sign(0); publishALDay(0)
    unpublishAL(1)
    expect(SCHED.als).toEqual([])
    expect(SCHED.changes['dn:0.0']).toBeUndefined()
    expect(SCHED.pending['dn:0.0']).toBe(1)
    expect(SCHED.al).toBe(0)
  })

  it('discardPending clears the marks', () => {
    noteChange('dn:0.0'); discardPending()
    expect(pendCount()).toBe(0)
  })

  it('nextAL is the lowest unused number', () => {
    expect(nextAL()).toBe(1)
    SCHED.als = [{ n: 1, keys: [], sign: {} }, { n: 3, keys: [], sign: {} }]
    expect(nextAL()).toBe(2)
  })

  it('markEdit with no key re-marks nothing', () => {
    markEdit()
    expect(pendCount()).toBe(0)
  })

  it('alAttr marks pending and published items apart', () => {
    noteChange('dn:0.0')
    expect(alAttr('dn:0.0')).toContain('data-alp')
    SCHED.changes['dn:0.1'] = 2
    expect(alAttr('dn:0.1')).toContain('data-alc="2"')
    expect(alAttr('dn:9.9')).toBe('')
    expect(alAttr('')).toBe('')
  })

  /* the AL preview: a pending edit on a PUBLISHED day carries the number it
     will go out as (data-aln), so the edit surfaces can paint it in that AL's
     colour before the AL exists. Draft-day pending must NOT carry it — an edit
     on an unpublished day is draft work and will not ride the next AL. */
  it('pending on a published day previews the AL it will go out as', () => {
    sign(0); setDayApproved(0, 1)
    noteChange('dn:0.0')
    expect(alAttr('dn:0.0')).toContain('data-aln="1"')
    noteChange('dn:1.0')                          // day 1 still draft
    expect(alAttr('dn:1.0')).toContain('data-alp')
    expect(alAttr('dn:1.0')).not.toContain('data-aln')
  })

  it('the preview number tracks nextAL as amendments are issued', () => {
    sign(0); setDayApproved(0, 1)
    noteChange('dn:0.0')
    SCHED.als = [{ n: 1, keys: [], sign: {} }, { n: 3, keys: [], sign: {} }]
    expect(alAttr('dn:0.0')).toContain('data-aln="2"')
    expect(alAttr('dn:0.0')).toContain('AL2')     // the tooltip names it too
  })

  it('AL colours follow the fixed sequence', () => {
    expect(alColor(1)).toBe('#3BC6E8')
    expect(alColor(3)).toBe('#3DE86B')
    expect(alColor(4)).toBe('#FFFFFF')
    expect(alColor(5)).toBe('#B388FF')   // purple
    expect(alColor(6)).toBe('#FF7FC4')   // pink
    expect(alColor(7)).toBe('#E5872B')   // orange
  })

  /* every colour is also a background the ALn tag is printed on in #08131b, so a
     dark entry makes its own tag unreadable — the AL5 magenta this replaced sat
     at 3.5:1. Pin the floor rather than the hexes alone, or the next recolour
     re-introduces the fault the recolour was for. */
  it('every AL colour carries its own tag in dark ink', () => {
    const lum = (hex: string) => {
      const ch = [1, 3, 5].map(i => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
    }
    const ink = lum('#08131b')
    for (let n = 1; n <= 7; n++) {
      const ratio = (lum(alColor(n)) + 0.05) / (ink + 0.05)
      expect(ratio, `AL${n} ${alColor(n)}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('an issued AL is history (tfin B53 #14)', () => {
  it('the issue stamps its own day list and item count', () => {
    sign(0)
    const { days } = alIssue(1, ['dn:0.0', 'dn:0.1'])
    expect(days).toEqual([0])
    expect(SCHED.als[0].n0).toBe(2)
    expect(SCHED.als[0].days).toEqual([0])
  })

  it('a delete cannot shrink an amendment that already went out', () => {
    SCHED.als = [{ n: 1, keys: ['dn:0.0', 'dn:0.1'], sign: {}, days: [0], n0: 2 }]
    const rec = SCHED.als[0]; rec.keys = []
    expect(alCount(rec)).toBe(2)
    expect(alDays(rec).join(',')).toBe('0')
  })
})

describe('structural-deletion tombstones', () => {
  it('uses unique inert keys that keep the day parseable without naming a live row', () => {
    const a = markDeletion(0, 'ground'), b = markDeletion(0, 'ground')
    expect(a).not.toBe(b)
    expect(isDeleteKey(a)).toBe(true)
    expect(keyDay(a)).toBe(0)
    expect(deleteCount(Object.keys(SCHED.pending))).toBe(2)
    expect(a.startsWith('g:')).toBe(false)
    expect(a.startsWith('gr:')).toBe(false)
  })

  it('publishes, snapshots and unpublishes a removal like any other AL item', () => {
    sign(0); setDayApproved(0, 1)
    const key = markDeletion(0, 'note')
    expect(publishableKeys()).toEqual([key])
    sign(0); publishALDay(0)
    expect(SCHED.pending[key]).toBeUndefined()
    expect(SCHED.changes[key]).toBe(1)
    expect(SCHED.als[0].keys).toEqual([key])
    expect(daySnapOf(0, 1).c[key]).toBe(1)
    unpublishAL(1)
    expect(SCHED.changes[key]).toBeUndefined()
    expect(SCHED.pending[key]).toBe(1)
  })

  it('does not publish a false removal when a draft-only row is added, reordered, then deleted', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length
    DAYS[0].notes.push('temporary')
    markStructuralAdd(`dn:0.${ni}`)
    expect(moveNote(0, ni, 0)).toBe(true)
    const issued = deletionWasIssued(0, 'note', 0)
    DAYS[0].notes.splice(0, 1); shiftKeys('dn:0.', 0, 0)
    markDeletion(0, 'note', issued)
    expect(SCHED.pending).toEqual({})
    expect(SCHED.added).toEqual({})
  })

  it('restores draft-add identity when the AL that issued it is unpublished', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length
    DAYS[0].notes.push('new issued note')
    const key = markStructuralAdd(`dn:0.${ni}`)
    sign(0); publishALDay(0)
    expect(SCHED.added[key]).toBeUndefined()
    unpublishAL(1)
    expect(SCHED.added[key]).toBe(1)
    expect(SCHED.pending[key]).toBe(1)
  })

  it('does not restore an old add marker while a later AL still owns that row', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length
    DAYS[0].notes.push('new note')
    const key = markStructuralAdd(`dn:0.${ni}`)
    sign(0); publishALDay(0)                  // AL1 adds it
    DAYS[0].notes[ni] = 'new note, revised'; markEdit(key)
    sign(0); publishALDay(0)                  // AL2 now owns the key
    unpublishAL(1)
    expect(SCHED.changes[key]).toBe(2)
    expect(SCHED.added[key]).toBeUndefined()
    expect(deletionWasIssued(0, 'note', ni)).toBe(true)
  })

  it('keeps structural ownership when the later AL changed a different field', () => {
    sign(0); setDayApproved(0, 1)
    const ri = DAYS[0].allhands.length
    DAYS[0].allhands.push({ prog: 'NEW', sub: '', str: '', end: '', who: [] })
    const addKey = markStructuralAdd(`ap:0.${ri}.prog`)
    sign(0); publishALDay(0)                  // AL1 adds the row
    DAYS[0].allhands[ri].sub = 'detail'; markEdit(`ap:0.${ri}.sub`)
    sign(0); publishALDay(0)                  // AL2 owns the current row snapshot
    unpublishAL(1)
    expect(SCHED.pending[addKey]).toBe(1)     // field history returns, identity does not
    expect(SCHED.added[addKey]).toBeUndefined()
    expect(deletionWasIssued(0, 'programme', ri)).toBe(true)
    unpublishAL(2)                            // the last snapshot carrying the row goes
    expect(SCHED.added[addKey]).toBe(1)
    for (let i = 0; i < ri; i++) {
      expect(deletionWasIssued(0, 'programme', 0)).toBe(true)
      DAYS[0].allhands.splice(0, 1); shiftKeys('ap:0.', 0, 0)
    }
    expect(SCHED.added['ap:0.0.prog']).toBe(1)
    expect(deletionWasIssued(0, 'programme', 0), 'the draft row stays identifiable after shifting onto an Original address').toBe(false)
  })

  it('rollback clears draft-add identities that collide with restored issued rows', () => {
    sign(0); setDayApproved(0, 1)
    const ni = DAYS[0].notes.length - 1
    const issued = deletionWasIssued(0, 'note', ni)
    DAYS[0].notes.splice(ni, 1); shiftKeys('dn:0.', 0, ni); markDeletion(0, 'note', issued)
    sign(0); publishALDay(0)
    DAYS[0].notes.push('temporary replacement')
    const key = markStructuralAdd(`dn:0.${ni}`)
    expect(SCHED.added[key]).toBe(1)
    expect(restoreDayVersion(0, 'orig')).not.toBe(false)
    expect(SCHED.added[key]).toBeUndefined()
    expect(deletionWasIssued(0, 'note', ni)).toBe(true)
  })
})

describe('per-day version snapshots', () => {
  it('first publish stamps the Original; a reopen+republish re-issues it (owner, 15 Aug 26)', () => {
    const note0 = DAYS[0].notes[0]
    sign(0); setDayApproved(0, 1)
    expect(daySnapOf(0, 'orig')).toBeTruthy()
    expect(daySnapOf(0, 'orig').d.notes[0]).toBe(note0)
    /* reopen, change the model, republish — the Original now CATCHES UP to the
       re-issued content (was: frozen). A deliberate reopen+republish is a
       re-issue, and the view page must show what was just published; the
       ordinary amendment flow, which never reopens, still leaves the Original
       frozen (its own test below). */
    setDayApproved(0, 0)
    DAYS[0].notes[0] = 'CHANGED AFTER REOPEN'
    sign(0); setDayApproved(0, 1)
    expect(daySnapOf(0, 'orig').d.notes[0]).toBe('CHANGED AFTER REOPEN')
    DAYS[0].notes[0] = note0
  })

  it('the snapshot is a deep clone — later edits cannot reach back into it', () => {
    const note0 = DAYS[0].notes[0]
    sign(0); setDayApproved(0, 1)
    DAYS[0].notes[0] = 'LIVE EDIT'
    expect(daySnapOf(0, 'orig').d.notes[0]).toBe(note0)
    DAYS[0].notes[0] = note0
  })

  it('alIssue freezes every covered day wearing its own new marks', () => {
    sign(0); setDayApproved(0, 1)
    sign(1); setDayApproved(1, 1)
    sign(0); sign(1)
    alIssue(2, ['dn:0.0', 'dn:1.0'])
    const s0 = daySnapOf(0, 2), s1 = daySnapOf(1, 2)
    expect(s0 && s1).toBeTruthy()
    expect(s0.c['dn:0.0']).toBe(2)         // the AL's own mark is IN the snapshot
    expect(s0.c['dn:1.0']).toBeUndefined() // and only this day's slice
    expect(s1.c['dn:1.0']).toBe(2)
    /* the record's issued fields are untouched by the stamp */
    expect(SCHED.als[0].n0).toBe(2)
    expect(SCHED.als[0].days).toEqual([0, 1])
  })

  it('dayVersions lists live, orig and snapshot-bearing ALs; unpublish drops one', () => {
    expect(dayVersions(0)).toEqual(['live'])
    sign(0); setDayApproved(0, 1)
    sign(0); alIssue(1, ['dn:0.0'])
    expect(dayVersions(0)).toEqual(['live', 'orig', 1])
    /* a record from before snapshots existed offers no version and breaks nothing */
    SCHED.als.push({ n: 2, keys: ['dn:0.1'], sign: {}, days: [0], n0: 1 })
    expect(dayVersions(0)).toEqual(['live', 'orig', 1])
    expect(daySnapOf(0, 2)).toBeNull()
    unpublishAL(1)
    expect(dayVersions(0)).toEqual(['live', 'orig'])
    expect(verLabel('live') + verLabel('orig') + verLabel(1)).toBe('LiveOriginalAL1')
  })
})

describe('dayCurVer — the version a day is currently showing', () => {
  it('null before publish, orig after the first publish, n after an issue', () => {
    expect(dayCurVer(0)).toBeNull()
    sign(0); setDayApproved(0, 1)
    expect(dayCurVer(0)).toBe('orig')
    sign(0); alIssue(1, ['dn:0.0'])
    expect(dayCurVer(0)).toBe(1)
  })

  it('falls back by ISSUE ORDER, not AL number, when the stamp is gone', () => {
    sign(0); setDayApproved(0, 1)
    /* AL2 goes out first, then AL1 fills the freed lower number — legal via
       the AL panel's number picker. The most recent ISSUE is AL1. */
    sign(0); alIssue(2, ['dn:0.0'])
    sign(0); alIssue(1, ['dn:0.1'])
    expect(dayCurVer(0)).toBe(1)          // stamped by the later issue
    delete SCHED.cur[0]
    expect(dayCurVer(0)).toBe(1)          // derived: newest issue, not max n
  })

  it('an unpublished cur AL falls back to the remaining newest issue, then orig', () => {
    sign(0); setDayApproved(0, 1)
    sign(0); alIssue(1, ['dn:0.0'])
    sign(0); alIssue(2, ['dn:0.1'])
    expect(dayCurVer(0)).toBe(2)
    unpublishAL(2)                         // its snapshot vanishes with the record
    expect(dayCurVer(0)).toBe(1)
    unpublishAL(1)
    expect(dayCurVer(0)).toBe('orig')
  })
})

/* RE-PUBLISHING A REOPENED DAY refreshes what the view page shows (owner,
   15 Aug 26). Reopen keeps the version history, but the frozen snapshot the
   view page reads was captured before the reopen — so without this, a viewer
   keeps seeing pre-reopen content after the scheduler re-publishes. Pins the
   content refresh AND that the ordinary amendment flow never rewrites the
   Original. */
describe('re-publishing a reopened day re-issues the current version in place', () => {
  const D0 = JSON.parse(JSON.stringify(DAYS[0]))
  beforeEach(() => { DAYS[0] = JSON.parse(JSON.stringify(D0)) })
  const issuedNote = (di: number) => { const cv = dayCurVer(di); const s = cv != null ? daySnapOf(di, cv) : null; return s ? s.d.notes[0] : '(none)' }

  it('a day at the Original: reopen, hand-edit, re-publish — the issued view catches up', () => {
    sign(0); setDayApproved(0, 1)                 // first publish → Original
    setDayApproved(0, 0)                          // reopen
    txtSet('dn:0.0', 'NEW BY HAND')
    sign(0); setDayApproved(0, 1)                 // Publish day again
    expect(dayCurVer(0)).toBe('orig')             // same version label
    expect(issuedNote(0)).toBe('NEW BY HAND')     // but the document caught up
    expect(issuedNote(0)).toBe(txtGet('dn:0.0'))  // issued == live, no split
  })

  it('a day at AL1: reopen, edit, re-publish — AL1’s document catches up', () => {
    sign(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'AMENDED'); sign(0); publishALDay(0)   // AL1
    expect(dayCurVer(0)).toBe(1)
    setDayApproved(0, 0)                          // reopen
    txtSet('dn:0.0', 'NEW AFTER REOPEN')
    sign(0); setDayApproved(0, 1)                 // Publish day again
    expect(dayCurVer(0)).toBe(1)
    expect(issuedNote(0)).toBe('NEW AFTER REOPEN')
  })

  it('the ordinary amendment flow (no reopen) never rewrites the Original', () => {
    const orig = D0.notes[0]
    sign(0); setDayApproved(0, 1)                 // Original = seed note
    txtSet('dn:0.0', 'AMENDED'); sign(0); publishALDay(0)   // AL1 — no reopen
    expect(daySnapOf(0, 'orig').d.notes[0]).toBe(orig)      // Original frozen as first issued
    expect(daySnapOf(0, 1).d.notes[0]).toBe('AMENDED')
  })
})
