/* UI markup parity: the ported day/legend builders must produce byte-identical
   markup to the untouched reference for every day of the seed week. Combined
   with the verbatim stylesheet, what the React app paints is what the
   reference paints. */
import { beforeAll, describe, expect, it } from 'vitest'
import { refWindow } from '../testing/refwin'
import { DAYS } from '../engine/data'
import { INPUTS, inputCoversDate, isUnavail } from '../engine/inputs'
import { validate } from '../engine/validate'
import { dayHTML, dayPreviewHTML, withDaySnap, legendHTML } from './html'
import { SCHED, signOf, setDayApproved, alIssue } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { txtSet, txtGet } from '../engine/slots'
import { setDayPreview, DPREV } from '../state/view'
import { setSession } from '../state/auth'
import { acceptInput, unacceptInput } from '../engine/slots'

let w: any

beforeAll(async () => {
  w = await refWindow()          // syncs the port's seed INPUTS into the reference
  validate()
})

/* ---- the deliberate divergences from the reference ----------------------
   Each helper is applied to BOTH strings and is a no-op on one of them, the
   same idiom noSign has always used. Everything they do NOT cut — waves,
   duties, sims, ground, the Available-crew strip, the sign-off block — stays
   under full byte comparison. The pins in the next describe assert the new
   structure positively, so nothing is merely tolerated. */

/* Divergence #3 (owner request, Aug 26): the whole input-group run was
   restructured. Five reference blocks — personal inputs, Available, Office,
   Leave, Downchit — became two: a scheduler-only "Personal inputs" and an
   everyone-sees-it "Unavailable". Titles, membership, order and visibility all
   moved, so this region can no longer be byte-compared and is cut from both
   sides. The cut starts at the first input group and runs to the end of the
   day body. */
const noInpGrp = (s: string) => s.replace(
  /<div class="sub plist one sec sec-(?:inp|avail|off|leave|dnco|unav)"[\s\S]*(?=<\/div><\/section>)/, '')

/* Divergence #4: the sim "planning notes" block became one of four per-section
   "Scheduler notes" blocks, and they are edit-only now. .blknote nests no
   <div> — its body is esc()'d and alAttr emits no raw '>' — so the lazy match
   ends at the note's own close, the same reasoning noSign documents. The
   reference renders class="blknote" (not "blknote ed"): this file never calls
   setSession, so canEditSched() is false on both sides. */
const noNotes = (s: string) => s.replace(
  /<div class="blknote-h">[^<]*<\/div><div class="blknote[^>]*>[\s\S]*?<\/div>/g, '')

/* Divergence #5: on the view page the scheduler's ground block is just "Ground
   programme" — there is no personal-inputs block beside it to distinguish it
   from, so the qualifier is noise. Normalise the title rather than excising the
   block, which keeps every ground ROW under byte comparison. A no-op in edit
   mode, where the port emits the qualifier too. */
const grndTitle = (s: string) => s.replace(
  '<div class="sub-h">Ground programme · scheduler</div>', '<div class="sub-h">Ground programme</div>')

/* View only: the port also drops the Available-crew puck strip. In EDIT mode
   the port keeps it, so it must NOT be cut there or it silently falls out of
   comparison. */
const noAvailPuck = (s: string) => s.replace(
  /<div class="availpuck sec sec-avail"[\s\S]*?(?=<div class="sub plist one sec sec-)/, '')

describe('view-week markup parity with the reference', () => {
  it('every day of the read-only week is byte-identical (minus the input blocks)', () => {
    const V = (s: string) => grndTitle(noInpGrp(noAvailPuck(noNotes(s))))
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},false)`)
      expect(V(dayHTML(di, false)), 'day ' + di).toBe(V(ref))
    })
  })

  it('view drops personal inputs and the crew strip; edit keeps both', () => {
    const v = dayHTML(0, false)
    expect(v).not.toContain('sec-inp')        // personal inputs are scheduler-side
    expect(v).not.toContain('availpuck')
    expect(v).toContain('sec-unav')           // Unavailable is for everyone
    const e = dayHTML(0, true)
    expect(e).toContain('sec-inp')
    expect(e).toContain('availpuck')
    expect(e).toContain('sec-unav')
    /* Available and Office are gone from every mode */
    for (const s of [v, e]) {
      expect(s).not.toContain('sec-off')
      expect(s).not.toContain('sub plist one sec sec-avail')
      expect(s).not.toContain('>Leave</div>')
      expect(s).not.toContain('>Downchit</div>')
    }
  })

  it('the edit-mode markup is byte-identical too (minus the sign-off strip)', () => {
    /* THE one deliberate divergence from the reference: the sign-off pills
       carry an extra .v value span so the select can stretch invisibly over
       the whole pill (iPhone Safari won't open a select from a label tap —
       owner request, Aug 26). Excise the strip from both sides — signoffHTML
       nests no <div>, so the lazy match ends at the strip's own close — and
       pin the new pill structure separately below. */
    const noSign = (s: string) => s.replace(/<div class="signoff day-sign"[\s\S]*?<\/div>/, '')
    /* NB: noAvailPuck is deliberately NOT applied here — the port keeps the
       Available-crew strip in edit mode, so it stays byte-compared. */
    const E = (s: string) => noInpGrp(noNotes(noSign(s)))
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},true)`)
      expect(E(dayHTML(di, true)), 'day ' + di).toBe(E(ref))
    })
  })

  it('the sign-off pill: label + visible value + the full-pill select', () => {
    const h = dayHTML(0, true)
    /* each of the four pills wraps k-label, v-value and its select, in order */
    const pills = h.match(/<label class="sgn[^"]*"[^>]*><span class="k">[^<]*<\/span><span class="v">[^<]*<\/span><select data-sign=/g) || []
    expect(pills.length).toBe(4)
    expect(h).toContain('<span class="v">— name —</span>')   // unsigned placeholder
  })

  it('the legend is byte-identical', () => {
    expect(legendHTML()).toBe(w.eval('legendHTML()'))
  })

  /* ---- what the excised region above is replaced by ---------------------
     noInpGrp stops byte-comparing the input blocks, so their new structure is
     pinned here instead. Read-only assertions, so they are safe inside the
     parity block. */

  it('the day carries the three blocks, in order, on the scheduler side', () => {
    const e = dayHTML(0, true)
    const at = (m: string) => e.indexOf(m)
    expect(at('>Ground programme · scheduler<')).toBeGreaterThan(-1)
    expect(at('>Personal inputs<')).toBeGreaterThan(at('>Ground programme · scheduler<'))
    expect(at('>Unavailable<')).toBeGreaterThan(at('>Personal inputs<'))
  })

  it('the view page shows the scheduler ground block and Unavailable only', () => {
    const v = dayHTML(0, false)
    expect(v).toContain('>Ground programme<')       // no "· scheduler" qualifier
    expect(v).toContain('>Unavailable<')
    expect(v).not.toContain('>Personal inputs<')
    expect(v).not.toContain('data-acc=')            // and no accept controls
  })

  it('Unavailable gathers detachment, leave and downchit', () => {
    /* day 2 carries a Detachment (pike, Jul 15–17) and an OL (j_lee) */
    const v = dayHTML(2, false)
    const blk = v.slice(v.indexOf('sec-unav'))
    expect(blk).toContain('Detachment')
    expect(blk).toContain('OL')
    expect(dayHTML(0, false)).toMatch(/sec-unav[\s\S]*Downchit/)
  })

  it('Unavailable prints Nil rather than going missing', () => {
    const d: any = DAYS[3]
    const v = dayHTML(3, false)
    expect(v).toContain('sec-unav')
    if (!INPUTS.some((i: any) => inputCoversDate(i, d.dt) && isUnavail(i.type)))
      expect(v.slice(v.indexOf('sec-unav'))).toContain('Nil')
  })

  /* NB: this file never signs anyone in, so canEditSched() is false and the
     notes render as read-only divs. The contenteditable/data-txt form is pinned
     in the scheduler-session block further down. */
  it('scheduler notes are edit-side only, one per scheduler-owned section', () => {
    const e = dayHTML(0, true), v = dayHTML(0, false)
    expect((e.match(/blknote-h/g) || []).length).toBe(4)
    /* the issued programme carries no working notes at all, even populated ones */
    expect(v).not.toContain('blknote')
  })

  it('each note sits at the foot of its own section box', () => {
    const e = dayHTML(0, true)
    for (const cls of ['sec-prog', 'sec-duty', 'sec-sim', 'sec-grnd']) {
      const secAt = e.indexOf(cls)
      expect(secAt, cls).toBeGreaterThan(-1)
      /* the first note after the section opens must arrive before the NEXT
         section does — i.e. it belongs to this box, not a later one */
      const noteAt = e.indexOf('blknote-h', secAt)
      const nextSec = e.indexOf('<div class="sub plist', secAt + 1)
      expect(noteAt, cls).toBeGreaterThan(-1)
      if (nextSec > -1 && cls !== 'sec-grnd') expect(noteAt, cls).toBeLessThan(nextSec)
    }
  })
})

/* runs AFTER the parity block — it publishes and edits, which the byte-parity
   assertions above must never see */
describe('version dropdown and preview build', () => {
  const sgn = (di: number) => {
    const g = signOf(di)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  }

  it('the dropdown appears only when versions exist AND only when asked for', () => {
    expect(dayHTML(0, true, true)).not.toContain('data-dver')   // no versions yet
    sgn(0); setDayApproved(0, 1)
    txtSet('dn:0.0', 'LIVE CHANGE'); sgn(0); alIssue(1, ['dn:0.0'])
    expect(dayHTML(0, true, true)).toContain('data-dver="0"')
    expect(dayHTML(0, false)).not.toContain('data-dver')        // the ViewWeek signature
    setDayPreview(0, 'orig')
    expect(dayHTML(0, true, true)).toMatch(/value="orig" selected/)
    setDayPreview(0, null)
  })

  it('the day head wears ONE chip — the current version, on view and edit alike', () => {
    /* state from the previous test: day 0 published, AL1 issued */
    for (const ed of [false, true]) {
      const h = dayHTML(0, ed)
      expect((h.match(/class="dal[ "]/g) || []).length).toBe(1)
      expect(h).toContain('data-alc="1"')
    }
    /* a second AL replaces the chip, it does not join it */
    txtSet('dn:0.1', 'AL2 CHANGE'); sgn(0); alIssue(2, ['dn:0.1'])
    const h2 = dayHTML(0, false)
    expect((h2.match(/class="dal[ "]/g) || []).length).toBe(1)
    expect(h2).toContain('>AL2<')
    expect(h2).not.toContain('>AL1<')
    /* rolled back to the Original while ALs exist → the grey ORIG chip */
    restoreDayVersion(0, 'orig')
    const h3 = dayHTML(0, false)
    expect(h3).toContain('class="dal orig"')
    expect(h3).toContain('>ORIG<')
    /* roll forward again so the next tests see AL1's world */
    restoreDayVersion(0, 1)
  })

  it('a published day with no ALs anywhere shows no chip at all', () => {
    sgn(1); setDayApproved(1, 1)
    expect(dayHTML(1, false)).not.toContain('class="dal')
    setDayApproved(1, 0)
  })

  it('the preview shows the frozen day, read-only, wearing its frozen marks', () => {
    txtSet('dn:0.0', 'EVEN LATER')          // live pending edit after AL1
    const orig = dayPreviewHTML(0, 'orig', true)
    expect(orig).toContain('EP: AB BURN THROUGH ON TAKE OFF')
    expect(orig).not.toContain('EVEN LATER')
    expect(orig).toContain('dprev-bar')
    expect(orig).toContain('data-restore="0"')
    expect(orig).not.toContain('data-slot=')  // no write surfaces
    expect(orig).not.toContain('dwbox')       // no live warnings
    expect(orig).not.toContain('data-alp')    // pending is live-only state
    const al1 = dayPreviewHTML(0, 1, true)
    expect(al1).toContain('LIVE CHANGE')
    expect(al1).toContain('data-alc="1"')     // the mark it wore as issued
  })

  it('withDaySnap restores the globals after the build — and after a throw', () => {
    const d0 = DAYS[0], c0 = SCHED.changes, p0 = SCHED.pending
    withDaySnap(0, 'orig', () => { expect(DAYS[0]).not.toBe(d0) })
    expect(DAYS[0]).toBe(d0)
    expect(() => withDaySnap(0, 'orig', () => { throw new Error('boom') })).toThrow('boom')
    expect(DAYS[0]).toBe(d0)
    expect(SCHED.changes).toBe(c0)
    expect(SCHED.pending).toBe(p0)
    expect(dayHTML(0, false)).not.toContain('dprev-bar')   // PV flag came back down
    /* leave the file's shared state as the next suite expects */
    txtSet('dn:0.0', 'EP: AB BURN THROUGH ON TAKE OFF')
    SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    DPREV.clear()
  })
})

/* Signed in as a scheduler — the notes become editable and the personal-input
   rows grow their accept controls. Runs last: setSession is module state, and
   the byte-parity block above must never see a signed-in world. */
describe('the scheduler-side controls', () => {
  beforeAll(() => { setSession({ user: 'a', role: 'admin' }) })

  it('each note is a contenteditable on its own funnel key', () => {
    const e = dayHTML(0, true)
    for (const k of ['pn:0', 'dtn:0', 'sn:0', 'gn:0']) {
      expect(e).toContain(`data-txt="${k}"`)
      expect(e).toContain('class="blknote ed"')
    }
  })

  it('personal inputs carry an accept control; Other offers both destinations', () => {
    const e = dayHTML(0, true)
    const blk = e.slice(e.indexOf('sec-inp'), e.indexOf('sec-unav'))
    expect(blk).toContain('data-acc="g"')
    /* Unavailable is automatic — nothing there is accepted by anyone */
    expect(e.slice(e.indexOf('sec-unav'))).not.toContain('data-acc=')
  })

  it('an accepted input stays put, faded, and offers Undo', () => {
    const inp: any = INPUTS.find((i: any) => i.type === 'Meeting' && i.date === 'Jul 13')
    acceptInput(0, inp, 'g')
    const e = dayHTML(0, true)
    expect(e).toContain('pl-row accd')
    expect(e).toContain('data-acc="x"')
    unacceptInput(0, inp)
    expect(dayHTML(0, true)).not.toContain('pl-row accd')
  })

  it('an input filed under Unavailable moves blocks', () => {
    const inp: any = INPUTS.find((i: any) => i.type === 'Fly' && i.date === 'Jul 13')
    acceptInput(0, inp, 'u')
    const e = dayHTML(0, true)
    expect(e.slice(e.indexOf('sec-inp'), e.indexOf('sec-unav'))).not.toContain('>Fly<')
    expect(e.slice(e.indexOf('sec-unav'))).toContain('>Fly<')
    unacceptInput(0, inp)
  })

  it('the view page never grows a control, signed in or not', () => {
    expect(dayHTML(0, false)).not.toContain('data-acc=')
    expect(dayHTML(0, false)).not.toContain('blknote')
  })
})
