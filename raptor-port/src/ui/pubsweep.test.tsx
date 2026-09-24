// @vitest-environment jsdom
/* A CORRECTNESS SWEEP OF THE WHOLE PUBLISHING STORY (owner ask, 16 Aug 26 —
   "test the publishing, changes, etc and what the edit schedule, scheduler
   board and view schedule will show — and if it's correct").

   The existing publish tests each pin one mechanism from one side: publish.ts's
   own tests drive the engine with no surfaces, html.test.ts byte-compares the
   day builder, draftsui.test.tsx drives the drafts UI through the real App.
   What none of them do is walk a DAY THROUGH ITS LIFE — unpublished, signed,
   issued, amended, reverted, re-drafted, rolled onto the working copy,
   reopened, unpublished — and ask, at every step, what all THREE surfaces say
   about it. That is what this file does, one describe per stage.

   Why three surfaces and not one: the same publish state is rendered by two
   different code paths (html.ts's own day head, and board.ts's sign strip
   which re-uses dayStatHTML but wraps it itself), and read by a third builder
   for the view-only page (dayIssuedHTML's frozen face). docs/feature-impact.md
   calls that a drift-seam, and it is where this app's publishing bugs have
   come from. Every scenario therefore asserts what each relevant surface
   SHOWS — exact strings and exact counts, never truthiness.

   The surfaces are built the way their real callers build them, headlessly:
     · edit week  — dayHTML(di, true, true)        (EditWeek.tsx:38)
     · view week  — dayIssuedHTML / dayHTML(di,false) per VWORK
                                                    (ViewWeek.tsx:47-53)
     · board      — boardSignHTML(di)               (SchedBoard.tsx:221)
   Writes go through the store's one write path (state/store.ts) and, for the
   structural ones, through the board's own delegated click handler
   (boardMbtn), so nothing here bypasses the mutation funnel.

   NOT reachable headlessly, and therefore NOT asserted here (stated rather
   than skipped silently): the BOARD's own version <select>, which is React
   markup inside SchedBoard.tsx rather than a string builder — draftsui.test.tsx
   drives that one through the mounted App. Everything else on the board's
   publish strip is boardSignHTML, which is a string builder and is asserted. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { ridKey } from '../engine/rowids'
import {
  SCHED, signOf, setDayApproved, dayApproved, dayPendCount, dayCurVer,
  daySnapOf, publishALDay, isDeleteKey,
} from '../engine/publish'
import { verSeq } from '../engine/verid'
import { setSlotVal, slotVal, txtGet } from '../engine/slots'
import { validate } from '../engine/validate'
import { initStore, writeText, writeSlot, writeFill } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, toggleViewWork, afterSchedMutate } from '../state/view'
import { dayHTML, dayStatHTML, viewDayHTML } from './html'
import { boardSignHTML, boardMbtn, addWave } from './board'
import { dayDrafts, draftDup, draftSelect, loadVersionToWorkingCopy } from '../engine/drafts'
import { HOOKS } from '../engine/hooks'

/* One day carries the whole sweep. Monday is the seed week's densest day —
   two flying waves, two duty blocks, sims, ground rows — so every key family
   the amendment machinery walks is present on it. */
const DI = 0
let pristine: any
const rk = (k: string) => ridKey(k, DAYS)
/* Phase 2: versions are immutable verIds now, not 'orig' | n. These resolve the
   day's current record ids from the book so the tests can name them. */
const origId = (di: number) => SCHED.orig[di].id
const alId = (di: number, seq: number) => (SCHED.als.find((a: any) => +a.di === di && +a.seq === seq) as any).id

beforeAll(() => {
  initStore()
  setSession({ user: 'a', role: 'admin' } as any)   // canEditSched(), so editMode() follows CURPAGE
  pristine = JSON.parse(JSON.stringify(DAYS[DI]))
})

/* the day is swapped wholesale by drafts and by load-onto-working-copy, so
   every test starts from the pristine day and an empty publishing book — the
   same per-test discipline drafts.test.ts and restore.test.ts use */
beforeEach(() => {
  DAYS[DI] = JSON.parse(JSON.stringify(pristine))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}
  DPREV.clear(); VWORK.clear()
  setPage('editsched')
  validate()
})

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}
const publishDay = (di: number) => { sign(di); setDayApproved(di, true) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }

/* ---- the three surfaces, built exactly as their real callers build them ---- */
const weekEdit = (di: number) => { setPage('editsched'); return dayHTML(di, true, true) }
const boardStrip = (di: number) => { setPage('editsched'); return boardSignHTML(di) }
/* ViewWeek.tsx's own branch: a published day renders the frozen issued
   document unless the viewer chose the working copy (VWORK); an unpublished
   day renders live. CURPAGE has to BE 'viewsched' while it builds — the
   working-draft stamp is scoped to that page inside the shared dayStatHTML —
   so the page is flipped for the build and put back. */
const weekView = (di: number) => {
  setPage('viewsched')
  try { return viewDayHTML(di) }   // the SAME dispatch ViewWeek.tsx calls (no mirror to drift)
  finally { setPage('editsched') }
}

/* what a surface SAYS about publish state, read off its rendered markup (the
   plans-selector redesign, owner 15 Sep 26). What a scheduler looks at: which
   plan is live (the selector label), the green title tag naming the issued
   version (or dashed DRAFT), how many edits are ahead of the issued document,
   the Publish-day button while draft, and the per-day "Publish ALn" button.
   `beak` is the non-AL publish button/stamp: "Publish day" (draft, edit),
   "Draft"/"Working draft" (read-only stamps), or null once published on an edit
   surface (the "✓ Published" stamp is retired — its info is the `ver` tag). */
const pubState = (html: string) => {
  const r = el(html)
  const btn = r.querySelector('.dalpub')
  // `beak` is the publish-day button/stamp — NOT the AL-publish button (.dalpub) and
  // NOT the [GLOBAL-UNDO] Unpublish button (.dunpub), which are separate controls.
  const nonAlBeak = r.querySelector('.dbeak:not(.dalpub):not(.dunpub)')
  return {
    plan: r.querySelector('.planselbtn .psl')?.textContent ?? null,
    ver: r.querySelector('.verchip')?.textContent ?? null,
    pend: r.querySelector('.dpend')?.textContent ?? null,
    beak: nonAlBeak ? nonAlBeak.textContent : null,
    alpub: btn ? btn.textContent : null,
  }
}
const withToasts = (fn: () => void) => {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { said.push(String(m)) }
  try { fn() } finally { HOOKS.toast = real }
  return said
}
/* the board's own delegated click handler, reached the way board.test.tsx
   reaches it at the function level: a synthetic .mbtn carrying the data
   attribute the real button carries. This is the structural write path — the
   splice, the key renumbering and markDeletion/markStructuralAdd all live
   inside it, so driving it is what makes a structural test honest. */
const mbtn = (data: Record<string, string>) => {
  const b = document.createElement('button')
  b.className = 'mbtn'
  Object.keys(data).forEach(k => { b.dataset[k] = data[k] })
  boardMbtn({ target: b } as any)
}

/* ===================================================================== 1 */
describe('1 · lifecycle: unpublished day → sign → publish the Original', () => {
  it('an unsigned day offers a LOCKED Publish button, and a dashed DRAFT tag', () => {
    /* dayStatHTML's beak is a button while the day is draft, disabled until the
       four sign-offs are in. The green title tag (verTagHTML) reads a dashed
       "DRAFT" until the day is published — no ORIG/ALn version to name yet. */
    const e = el(weekEdit(DI))
    const beak = e.querySelector('.dbeak') as HTMLButtonElement
    expect(beak.textContent).toBe('Publish day')
    expect(beak.hasAttribute('disabled')).toBe(true)
    expect(beak.className).toContain('locked')
    expect(e.querySelector('.dal')).toBeNull()                        // the old chip is gone
    expect(e.querySelector('.verchip')!.textContent).toBe('DRAFT')    // the new title tag
    /* the view page calls the same day "Draft", as a plain read-only stamp */
    expect(el(weekView(DI)).querySelector('.dbeak')!.textContent).toBe('Draft')
  })

  it('signing unlocks the button; publishing shows the green ORIG tag; the viewer picker names it', () => {
    sign(DI)
    expect((el(weekEdit(DI)).querySelector('.dbeak') as HTMLButtonElement).hasAttribute('disabled')).toBe(false)
    setDayApproved(DI, true)
    /* first publish stamps the Original (engine-rules §Version snapshots), so
       dayCurVer resolves to 'orig' and the edit surfaces name ORIG via the green
       title tag; the "✓ Published" stamp itself is retired (owner, 15 Sep 26). */
    expect(verSeq(dayCurVer(DI))).toBe(0)   // the Original (seq 0)
    expect(pubState(weekEdit(DI)).ver).toBe('ORIG')
    expect(pubState(boardStrip(DI)).ver).toBe('ORIG')
    expect(pubState(weekEdit(DI)).beak).toBeNull()          // no "✓ Published" stamp any more
    /* the view page names the issued version through its own picker */
    expect((el(weekView(DI)).querySelector('select[data-vwork]') as HTMLSelectElement).options[0]!.text)
      .toBe('Original — as issued')
    /* ORIG is grey by design — the .verchip.orig tag */
    expect(el(weekEdit(DI)).querySelector('.verchip')!.className).toBe('verchip orig')
  })

  it('the view week defaults to the FROZEN issued face, with no pending anywhere', () => {
    publishDay(DI)
    /* the issued default is not dressed as a preview: section class `issued`,
       no banner, no write control. Since the published-schedule flagging build
       (§5.4/§8) it DOES carry the warning overlay: a published day shows the flags
       of its OFFICIAL (signed) version on top of byte-frozen content — reversing
       the old "a snapshot is never validated" rule at the render layer. The seed
       Monday's issued content carries warnings, so the header renders here; the
       byte-frozen guarantee is pinned by the next test. */
    const v = el(weekView(DI))
    const sec = v.querySelector('section.day')!
    expect(sec.className).toContain('issued')
    expect(sec.className).not.toContain('preview')
    expect(v.querySelector('.dprev-bar')).toBeNull()
    expect(v.querySelector('[data-restore]')).toBeNull()
    expect(v.querySelector('.daywarn'), 'the OFFICIAL flags now overlay the frozen face').not.toBeNull()
    /* the viewer's one control is the two-option issued/working picker */
    const sel = v.querySelector('select[data-vwork="0"]') as HTMLSelectElement
    expect([...sel.options].map(o => [o.value, o.text])).toEqual([
      ['issued', 'Original — as issued'],
      ['working', 'Working draft — not issued'],
    ])
    /* publishing spends the day's pending marks — the day went out as it
       stood, so nothing is "ahead of" the issued document yet */
    expect(dayPendCount(DI)).toBe(0)
    expect(pubState(weekEdit(DI)).pend).toBeNull()
    expect(pubState(weekEdit(DI)).alpub).toBeNull()
    expect(pubState(boardStrip(DI)).pend).toBeNull()
    expect(el(weekView(DI)).querySelector('.dpend')).toBeNull()
  })
})

/* ===================================================================== 2 */
describe('2 · editing after publish: pending on the edit surfaces, frozen for the viewer', () => {
  it('one note edit reads as exactly one pending item on the edit week and the board (AM9)', () => {
    publishDay(DI)
    writeText('dn:0.0', 'SCHEDULER WIP')
    expect(dayPendCount(DI)).toBe(1)
    /* the chip is "N pending" with a non-breaking space, and the per-day
       publish button names the AL the edit will go out as (nextAL) */
    expect(pubState(weekEdit(DI)).pend).toBe('1 pending')
    expect(pubState(weekEdit(DI)).alpub).toBe('Publish AL1')
    expect(pubState(boardStrip(DI)).pend).toBe('1 pending')
    expect(pubState(boardStrip(DI)).alpub).toBe('Publish AL1')
    /* and the cell itself is marked pending-toward-AL1, not issued */
    const cell = el(weekEdit(DI)).querySelector('[data-alp]')!
    expect(cell.getAttribute('data-aln')).toBe('1')
    expect(cell.getAttribute('data-alc')).toBeNull()
  })

  it('the ISSUED FACE is byte-identical after an edit — no content and no "Not Yet Signed" marker leak (AM5)', () => {
    /* the strong guarantee: the viewer does not see the scheduler's work in progress —
       not one byte of the issued face moves (withDaySnap swaps DAYS/changes/pending for
       the frozen snapshot, so even the pending count in the day head cannot leak). Since
       16 Sep 26 the "Not Yet Signed" marker is a WORKING-COPY affordance only (owner: the
       published schedule stays TRUE until it is published), so it never appears on the
       issued face either — the two renders are byte-for-byte identical. */
    publishDay(DI)
    const before = weekView(DI)
    expect(before).not.toContain('Not yet signed')          // clean at publish
    writeText('dn:0.0', 'SCHEDULER WIP')
    const after = weekView(DI)
    expect(el(after).textContent).not.toContain('SCHEDULER WIP')   // the edit never leaks
    expect(el(after).querySelector('[data-alp]')).toBeNull()       // no pending marks on the issued face
    expect(after).not.toContain('Not yet signed')                  // the marker is working-copy only
    expect(after, 'the issued face is byte-identical — the viewer sees the published truth').toBe(before)
  })

  it('the WORKING choice shows the edit, under a banner and an amber Working-draft stamp (AM5)', () => {
    publishDay(DI)
    writeText('dn:0.0', 'SCHEDULER WIP')
    toggleViewWork(DI, true)
    const v = el(weekView(DI))
    expect(v.textContent).toContain('SCHEDULER WIP')
    expect(v.querySelector('.dprev-bar.work')!.textContent)
      .toBe('Viewing Working draft — not issued · the issued schedule is Original')
    /* the issued clothes come off: the ✓ Published stamp and its AL chip are
       both replaced, so live-but-unissued content can never read as issued */
    expect(v.querySelector('.dbeak.ro.work')!.textContent).toBe('Working draft')
    expect(v.textContent).not.toContain('✓ Published')
    expect(v.querySelector('.dal')).toBeNull()
  })

  it('that working stamp is scoped to the view PAGE — a read-only board render never inherits it', () => {
    /* VWORK is a view-page choice, and dayStatHTML is shared with the board's
       sign strip. The guard is CURPAGE==='viewsched', not the bare !ed
       "read-only render", and this is the drift-seam that check exists for. */
    publishDay(DI)
    toggleViewWork(DI, true)
    setPage('editsched')
    /* the working-draft STAMP must not bleed onto a read-only editsched render */
    expect(el(dayStatHTML(DI, false)).querySelector('.dbeak.ro.work')).toBeNull()
    expect(pubState(boardStrip(DI)).ver).toBe('ORIG')
  })

  it('Publish AL1 moves the edit into the issued document, tints it, and clears pending', () => {
    publishDay(DI)
    writeText('dn:0.0', 'AMENDED NOTE')
    sign(DI)
    publishALDay(DI)
    /* the key leaves pending and gains its AL number in the changes slice —
       that number is what paints the tint */
    expect(SCHED.pending['dn:0.0']).toBeUndefined()
    expect(SCHED.changes['dn:0.0']).toBe(1)
    expect(dayPendCount(DI)).toBe(0)
    expect(verSeq(dayCurVer(DI))).toBe(1)
    /* every surface now names AL1 */
    expect(pubState(weekEdit(DI)).ver).toBe('AL1')
    expect(pubState(weekEdit(DI)).pend).toBeNull()
    expect(pubState(boardStrip(DI)).ver).toBe('AL1')
    /* and the viewer's default face IS AL1 now — content and tint both, the
       tint read off the snapshot's own changes slice, not the live one */
    const v = el(weekView(DI))
    expect(v.textContent).not.toContain('✓ Published')      // the stamp is retired
    expect(v.textContent).toContain('AMENDED NOTE')
    expect(v.querySelector('.ah-note')!.getAttribute('data-alc')).toBe('1')
    expect((v.querySelector('select[data-vwork="0"]') as HTMLSelectElement).options[0]!.text)
      .toBe('AL1 — as issued')
  })
})

/* ===================================================================== 3 */
describe('3 · edit-and-revert: a round trip must leave NOTHING pending (AM20)', () => {
  /* The owner's own complaint, 16 Aug 26: "if original was 0830, I change to
     0835 you show an edit dotted line, but when I switch back to 0830 it
     shouldn't register as a change". A pending mark means "differs from the
     issued document", not "was touched" — noteChange raises it on every write
     because it runs before the value lands, and reconcileIssuedMarks (called
     from afterSchedMutate, after the write) drops it again once the live value
     matches the issued one. These three families are the three shapes that
     round trip: a text/time field, a two-seat exchange, and a body appended to
     an occupied row and taken off again. */
  const quiet = (di: number) => {
    /* what "no AL is due" looks like on both edit surfaces */
    expect(dayPendCount(di)).toBe(0)
    expect(pubState(weekEdit(di)).pend).toBeNull()
    expect(pubState(weekEdit(di)).alpub).toBeNull()
    expect(pubState(boardStrip(di)).pend).toBeNull()
    expect(pubState(boardStrip(di)).alpub).toBeNull()
  }

  it('(a) a text field changed and changed back', () => {
    publishDay(DI)
    const was = txtGet('dn:0.0')
    writeText('dn:0.0', 'CHANGED')
    expect(Object.keys(SCHED.pending)).toEqual(['dn:0.0'])
    writeText('dn:0.0', was)
    quiet(DI)
    expect(Object.keys(SCHED.pending)).toEqual([])
  })

  it('(a) a TIME cell changed and changed back — the owner’s 0830→0835→0830 (AM9)', () => {
    publishDay(DI)
    writeText('ff:0.0.0.to', '12:45')
    expect(Object.keys(SCHED.pending)).toEqual(['ff:0.0.0.to'].map(rk))
    writeText('ff:0.0.0.to', '12:40')
    quiet(DI)
    /* and the publish path agrees with the chips: there is nothing to issue */
    expect(withToasts(() => publishALDay(DI))).toEqual(['No changes to publish on Monday'])
    expect(SCHED.als.length).toBe(0)
  })

  /* This sweep FOUND this one (16 Aug 26): dayKeys folded PERSON cells
     canonically but TIME cells compared raw, while txtSet normalises every
     time it writes (parseHM → hhmm, '0700' stored as '07:00') and a day
     published straight off the seed week has the UNNORMALISED spelling frozen
     in its snapshot. Typing the duty start back to the "0700" the issued
     document itself displays therefore left the field permanently pending —
     and Publish AL would then mint an amendment whose only content is
     0700 → 07:00. dayKeys' T() fold (restore.ts) closed it the same hour. */
  it('(a) reverting a duty start to the time the ISSUED document shows clears its mark', () => {
    publishDay(DI)
    expect(daySnapOf(DI, origId(DI))!.d.dutywaves[0].rows[0].str).toBe('0700')   // as issued
    writeText('dr:0.0.0.str', '0730')
    writeText('dr:0.0.0.str', '0700')                                        // back to what is shown
    expect(dayPendCount(DI)).toBe(0)
    expect(pubState(weekEdit(DI)).pend).toBeNull()
  })

  it('(b) two flying seats exchanged, then exchanged back', () => {
    publishDay(DI)
    const A = '0.0.0.0.p', B = '0.0.0.1.p'
    const a0 = slotVal(A), b0 = slotVal(B)
    /* drag.ts:182's own swap shape — two setSlotVal writes, ONE
       afterSchedMutate, because one drag is one undo step */
    setSlotVal(A, b0); setSlotVal(B, a0); afterSchedMutate()
    expect(Object.keys(SCHED.pending).sort()).toEqual([A, B].map(rk).sort())
    setSlotVal(A, a0); setSlotVal(B, b0); afterSchedMutate()
    quiet(DI)
  })

  it('(c) a man dropped onto an occupied DUTY row, then dragged back to his seat', () => {
    publishDay(DI)
    const seat = '0.0.0.0.p'
    const who = slotVal(seat)
    /* drag.ts:191 — a puck dropped on a CELL (not a puck) leaves its seat and
       goes through fillSlot: the duty row's primary seat is taken, so he lands
       at the overflow address d:0.0.0.x0, which the issued day has no key for */
    setSlotVal(seat, ''); writeFill('d:0.0.0.+', who)
    expect(Object.keys(SCHED.pending).sort()).toEqual(['0.0.0.0.p', 'd:0.0.0.x0'].map(rk).sort())
    /* and back: the overflow entry is trimmed away entirely, so the key is
       gone from the live walk as well as the issued one. Before the 16 Aug 26
       fix that phantom kept the day reading edited over a net no-op. */
    setSlotVal('d:0.0.0.x0', ''); writeSlot(seat, who)
    expect(txtGet('dr:0.0.0.role')).toBe('SDO')      // the row itself is untouched
    quiet(DI)
  })

  it('(c) the same round trip on a GROUND row', () => {
    publishDay(DI)
    const who = 'wolf'
    writeFill('g:0.0.+', who)                         // ground row 0 already has "dj"
    expect(Object.keys(SCHED.pending)).toEqual(['g:0.0.x0'].map(rk))
    writeSlot('g:0.0.x0', '')
    quiet(DI)
  })
})

/* ===================================================================== 4 */
describe('4 · structural round trip on a published day: add then delete nets out (AM21)', () => {
  it('+ Wave then ✕ Wave leaves no pending item and no false removal', () => {
    /* engine-rules §Publishing: "a row added after issue, reordered, and
       deleted again before its AL is a net no-op: its pending add key is
       removed and no false removal is published". The add's identity key
       lives in SCHED.added; the delete asks deletionWasIssued, sees the
       identity, and mints no tombstone, while shiftKeys drops the add key
       itself as the address disappears. */
    publishDay(DI)
    const n = DAYS[DI].waves.length
    /* addWave is the write the board's + Wave menu performs; it carries the
       same markStructuralAdd + afterSchedMutate epilogue every other
       structural add on that surface carries */
    addWave(DI, null)
    expect(DAYS[DI].waves.length).toBe(n + 1)
    expect(Object.keys(SCHED.pending)).toEqual([`wl:${DI}.${n}`].map(rk))
    expect(Object.keys(SCHED.added)).toEqual([`wl:${DI}.${n}`].map(rk))
    expect(pubState(weekEdit(DI)).pend).toBe('1 pending')

    mbtn({ gdel: `${DI}.${n}` })
    expect(DAYS[DI].waves.length).toBe(n)
    expect(Object.keys(SCHED.pending)).toEqual([])
    expect(Object.keys(SCHED.added)).toEqual([])
    /* the surfaces agree: nothing is ahead of the issued document */
    expect(pubState(weekEdit(DI)).pend).toBeNull()
    expect(pubState(weekEdit(DI)).alpub).toBeNull()
    expect(pubState(boardStrip(DI)).pend).toBeNull()
  })

  it('a duty ROW added then deleted nets out the same way', () => {
    publishDay(DI)
    const n = DAYS[DI].dutywaves[0].rows.length
    mbtn({ dradd: `${DI}.0` })
    expect(Object.keys(SCHED.pending)).toEqual([`dr:${DI}.0.${n}.role`].map(rk))
    mbtn({ drdel: `${DI}.0.${n}` })
    expect(DAYS[DI].dutywaves[0].rows.length).toBe(n)
    expect(Object.keys(SCHED.pending)).toEqual([])
    expect(pubState(weekEdit(DI)).pend).toBeNull()
  })

  it('CONTROL: deleting a row the day was ISSUED with does mint a tombstone', () => {
    /* without this the two tests above would pass just as well if deletions
       never marked anything at all. An issued row's removal has no cell left
       to tint, so it goes out as an inert del: item and reads as one pending
       edit on both edit surfaces. */
    publishDay(DI)
    mbtn({ drdel: `${DI}.0.2` })
    const keys = Object.keys(SCHED.pending)
    expect(keys.length).toBe(1)
    expect(isDeleteKey(keys[0]!)).toBe(true)
    expect(keys[0]).toMatch(/^del:0\.\d+\.duty$/)
    expect(pubState(weekEdit(DI)).pend).toBe('1 pending')
    expect(pubState(boardStrip(DI)).pend).toBe('1 pending')
  })
})

/* ===================================================================== 5 */
describe('5 · drafts on a published day: the diff is rebased against the ISSUED document', () => {
  it('duplicate → edit → switch away → switch back reads as a clean A→B→A round trip', () => {
    publishDay(DI)
    /* a dup changes no content, so nothing may go pending for it */
    draftDup(DI); afterSchedMutate()
    expect(dayPendCount(DI)).toBe(0)
    const [d1, d2] = dayDrafts(DI).map((t: any) => t.id)
    /* the edit surfaces now name which plan is live via the selector label — the
       view page never does, it has its own picker */
    expect(pubState(weekEdit(DI)).plan).toBe('Plan B')
    expect(pubState(boardStrip(DI)).plan).toBe('Plan B')
    expect(el(weekView(DI)).querySelector('.planselbtn')).toBeNull()

    writeText('dn:0.0', 'PLAN B NOTE')                 // diverge Draft 2
    expect(dayPendCount(DI)).toBe(1)

    /* switching re-marks the day from scratch against the issued snapshot
       (rebaseDayPending). Draft 1 IS the day as it was issued, so the rebase
       must come out empty — not "wiped", but genuinely equal. */
    draftSelect(DI, d1); afterSchedMutate()
    expect(dayPendCount(DI)).toBe(0)
    expect(pubState(weekEdit(DI)).pend).toBeNull()
    expect(pubState(boardStrip(DI)).pend).toBeNull()
    expect(pubState(weekEdit(DI)).plan).toBe('Plan A')

    /* and back — the stow kept Draft 2's edit, and the diff reappears */
    draftSelect(DI, d2); afterSchedMutate()
    expect(Object.keys(SCHED.pending)).toEqual(['dn:0.0'])
    expect(pubState(weekEdit(DI)).pend).toBe('1 pending')
    expect(txtGet('dn:0.0')).toBe('PLAN B NOTE')
  })

  it('after Draft 2 is published as AL1, Draft 1’s diff is measured against AL1 — not the Original', () => {
    publishDay(DI)
    draftDup(DI); afterSchedMutate()
    const [d1] = dayDrafts(DI).map((t: any) => t.id)
    const orig = txtGet('dn:0.0')
    writeText('dn:0.0', 'PLAN B NOTE')
    sign(DI); publishALDay(DI)
    /* AL1 IS Draft 2 now: the issued document says PLAN B NOTE */
    expect(verSeq(dayCurVer(DI))).toBe(1)
    expect(daySnapOf(DI, alId(DI, 1))!.d.notes[0].t).toBe('PLAN B NOTE')
    expect(dayPendCount(DI)).toBe(0)

    draftSelect(DI, d1); afterSchedMutate()
    /* Draft 1 is identical to the ORIGINAL. If the rebase were measured
       against the Original this would come out at zero; measured against the
       current issued version (AL1) it is one real difference, which is the
       amendment a scheduler owes the squadron. */
    expect(txtGet('dn:0.0')).toBe(orig)
    expect(Object.keys(SCHED.pending)).toEqual(['dn:0.0'])
    expect(pubState(weekEdit(DI)).pend).toBe('1 pending')
    expect(pubState(weekEdit(DI)).alpub).toBe('Publish AL2')
    /* the issued face has not moved under any of it */
    expect(el(weekView(DI)).textContent).toContain('PLAN B NOTE')
    expect((el(weekView(DI)).querySelector('select[data-vwork]') as HTMLSelectElement).options[0]!.text).toBe('AL1 — as issued')
  })
})

/* ===================================================================== 6 */
describe('6 · load a version onto the working copy: the viewer keeps seeing the issued AL', () => {
  it('loading the Original after AL1 leaves SCHED.cur at AL1 and pends the difference (AM6)', () => {
    /* owner, 16 Aug 26 — "the view only schedule should still see AL1, it
       shouldn't go to Original without me publishing the working copy". This
       is the whole reason "Restore this version" became "Load onto working
       copy": it is NOT a rollback. */
    publishDay(DI)
    const orig = txtGet('dn:0.0')
    const oid = origId(DI)
    writeText('dn:0.0', 'AMENDED NOTE')
    sign(DI); publishALDay(DI)
    expect(verSeq(dayCurVer(DI))).toBe(1)

    expect(loadVersionToWorkingCopy(DI, oid)).toBe(true)
    afterSchedMutate()
    /* the working copy is the Original's content … */
    expect(txtGet('dn:0.0')).toBe(orig)
    /* … but the issued pointer never moved, so the view page still answers AL1 */
    expect(verSeq(SCHED.cur[DI])).toBe(1)
    expect(verSeq(dayCurVer(DI))).toBe(1)
    const v = el(weekView(DI))
    expect((v.querySelector('select[data-vwork]') as HTMLSelectElement).options[0]!.text).toBe('AL1 — as issued')
    expect(v.textContent).toContain('AMENDED NOTE')
    expect(v.textContent).not.toContain(orig)
    /* and the pending set is the diff of the loaded content against the still
       issued AL1 — one field, heading for AL2 */
    expect(Object.keys(SCHED.pending)).toEqual(['dn:0.0'])
    expect(pubState(weekEdit(DI)).ver).toBe('AL1')
    expect(pubState(weekEdit(DI)).pend).toBe('1 pending')
    expect(pubState(weekEdit(DI)).alpub).toBe('Publish AL2')
    expect(pubState(boardStrip(DI)).alpub).toBe('Publish AL2')
  })

  it('loading the version the day is already at, with nothing pending, marks nothing', () => {
    publishDay(DI)
    expect(loadVersionToWorkingCopy(DI, origId(DI))).toBe(true)
    afterSchedMutate()
    expect(dayPendCount(DI)).toBe(0)
    expect(pubState(weekEdit(DI)).pend).toBeNull()
    /* and an unknown version is refused outright */
    expect(loadVersionToWorkingCopy(DI, 9)).toBe(false)
  })
})

/* ===================================================================== 7 */
describe('7 · the ordinary amendment flow never rewrites the Original', () => {
  /* Phase 2 (§9): a published day can NEVER be reopened — setDayApproved(di,false)
     is a no-op and reissueReopened is gone, so the old reopen → re-issue-in-place
     tests went with the feature. What stands is the guarantee that issuing an AL
     freezes a NEW immutable snapshot and leaves the Original untouched. */
  it('issuing an AL freezes a new version and never rewrites the Original', () => {
    publishDay(DI)
    const origSnap = JSON.stringify(daySnapOf(DI, origId(DI)))
    writeText('dn:0.0', 'AMENDED NOTE')
    sign(DI); publishALDay(DI)
    expect(JSON.stringify(daySnapOf(DI, origId(DI)))).toBe(origSnap)
    expect(daySnapOf(DI, alId(DI, 1))!.d.notes[0].t).toBe('AMENDED NOTE')
  })
})

/* Phase 2: unpublishing an AL is GONE (undo-across-publish is Phase 3). The old
   "8 . unpublishing an AL ." describe -- every assertion pinned unpublishAL /
   nextAL -- was removed with the feature. */

/* ===================================================================== 9 */
describe('9 · cross-surface agreement: the week and the board read one state', () => {
  /* html.ts builds the week's day head and board.ts builds the board's publish
     strip; they share dayStatHTML but wrap it themselves, and the view page
     resolves its version through a third path (dayIssuedHTML → daySnapOf).
     Two copies of one rule is exactly where this app's publishing bugs live,
     so the agreement is asserted directly rather than assumed. */
  /* the view page names its issued version through its picker (it has no green
     title tag — that is an edit-surface thing); read the issued option, mapping
     "Original" back to the ORIG label the edit tag uses. */
  const verOf = (html: string) => {
    const sel = el(html).querySelector('select[data-vwork]') as HTMLSelectElement | null
    if (!sel) return null
    const t = sel.options[0]!.text.replace(' — as issued', '')
    return t === 'Original' ? 'ORIG' : t
  }

  it('an amended, unpublished-edit state reads the same on the week, the board and the view page', () => {
    publishDay(DI)
    writeText('dn:0.0', 'AMENDED NOTE')
    sign(DI); publishALDay(DI)
    writeText('dn:0.1', 'SECOND EDIT')
    writeText('ff:0.0.0.to', '12:55')

    const week = pubState(weekEdit(DI)), board = pubState(boardStrip(DI))
    expect(week).toEqual(board)
    expect(week.pend).toBe('2 pending')
    expect(week.alpub).toBe('Publish AL2')
    expect(week.ver).toBe('AL1')
    /* the view page names the same issued version — through its own resolver,
       and with none of the pending count (that is scheduler state) */
    expect(verOf(weekView(DI))).toBe('AL1')
    expect(el(weekView(DI)).querySelector('.dpend')).toBeNull()
    expect((el(weekView(DI)).querySelector('select[data-vwork="0"]') as HTMLSelectElement)
      .options[0]!.text).toBe('AL1 — as issued')
  })

  it('a draft state reads the same on the week and the board', () => {
    publishDay(DI)
    draftDup(DI); afterSchedMutate()
    writeText('dn:0.0', 'PLAN B NOTE')
    const week = pubState(weekEdit(DI)), board = pubState(boardStrip(DI))
    expect(week).toEqual(board)
    expect(week.plan).toBe('Plan B')
    expect(week.pend).toBe('1 pending')
    expect(week.ver).toBe('ORIG')
    /* the view page shows the issued document and says nothing about drafts —
       stored alternatives are the scheduler's business once a day is out */
    const view = weekView(DI)
    const v = el(view)
    expect(v.querySelector('.planselbtn')).toBeNull()   // no plans selector on the view page
    expect(v.querySelector('select[data-dver]')).toBeNull()
    expect(v.textContent).not.toContain('PLAN B NOTE')
    expect(verOf(view)).toBe('ORIG')
  })
})

describe('the sign-off status line is robust to a missing snapshot (Fable #3)', () => {
  it('an approved day whose snapshot cannot resolve reads "Signed", never "ALNaN"', () => {
    publishDay(DI)                                  // approved at ORIG
    /* corrupt to a probe/import state: approved but no resolvable current version */
    delete SCHED.orig[DI]; delete SCHED.cur[DI]; SCHED.als = []
    sign(DI)                                        // re-sign (publish spent them); unbound → daySigned true
    expect(dayApproved(DI)).toBe(true)
    expect(dayCurVer(DI) == null).toBe(true)
    const state = el(dayHTML(DI, true, true)).querySelector('.so-state')!.textContent!
    expect(state).not.toContain('NaN')
    expect(state).toContain('Signed')
  })
})
