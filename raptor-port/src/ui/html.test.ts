/* UI markup parity: the ported day/legend builders must produce byte-identical
   markup to the untouched reference for every day of the seed week. Combined
   with the verbatim stylesheet, what the React app paints is what the
   reference paints. */
import { beforeAll, describe, expect, it } from 'vitest'
import { refWindow } from '../testing/refwin'
import { DAYS } from '../engine/data'
import { INPUTS, inputCoversDate, isUnavail } from '../engine/inputs'
import { validate, CHIP_LABEL, chipText } from '../engine/validate'
import { dayHTML, dayPreviewHTML, withDaySnap, legendHTML } from './html'
import { SCHED, signOf, setDayApproved, alIssue } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { txtSet, txtGet } from '../engine/slots'
import { parseHM } from '../engine/time'
import { setDayPreview, DPREV } from '../state/view'
import { setSession } from '../state/auth'
import { acceptInput, unacceptInput } from '../engine/slots'

let w: any

/* The port's week runs Mon..SUN; the reference stops at Friday and is
   read-only, so byte-comparison is bounded to the days it actually has. The
   weekend days are pinned positively in their own block below. */
let REFN = 0
beforeAll(async () => {
  w = await refWindow()          // syncs the port's seed INPUTS into the reference
  REFN = w.eval('DAYS.length')
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
   sides. The cut starts at the first input group OR the Available-crew strip,
   whichever comes first, and runs to the end of the day body: the two builds
   interleave the strip differently (port: inputs → strip → unavailable;
   reference: strip → input groups), and since the reference now receives only
   inputFlags-filtered inputs its personal group can be empty and skipped,
   which would otherwise leave its strip inside the comparison while the
   port's was cut. The strip's structure is pinned separately below. */
const noInpGrp = (s: string) => s.replace(
  /<div class="(?:sub plist one sec sec-(?:inp|avail|off|leave|dnco|unav)|availpuck sec sec-avail)"[\s\S]*(?=<\/div><\/section>)/, '')

/* Divergence #4: the sim "planning notes" block became one of four per-section
   "Scheduler notes" blocks, and they are edit-only now. .blknote nests no
   <div> — its body is esc()'d and alAttr emits no raw '>' — so the lazy match
   ends at the note's own close, the same reasoning noSign documents. The
   reference renders class="blknote" (not "blknote ed"): this file never calls
   setSession, so canEditSched() is false on both sides. */
const noNotes = (s: string) => s.replace(
  /<div class="blknote-h">[^<]*<\/div><div class="blknote[^>]*>[\s\S]*?<\/div>/g, '')

/* Divergence #5: the port titles the block "Ground Programme" (owner casing,
   Aug 26) with the "· scheduler" qualifier in edit mode only; the reference
   says "Ground programme · scheduler" in both. Normalise the title on both
   sides rather than excising the block, which keeps every ground ROW under
   byte comparison. */
const grndTitle = (s: string) => s.replace(
  /<div class="sub-h">Ground [Pp]rogramme(?: · scheduler)?<\/div>/, '<div class="sub-h">GRND</div>')

/* Divergence #6 (owner, Aug 26): the port renders Ground Programme rows in
   start-time order; the reference keeps model order. After noInpGrp the ground
   block is the day body's last content, so sort its row substrings
   LEXICOGRAPHICALLY on both sides — each row stays byte-pinned as a set
   member, only the order is excised. The port's real time-ordering is pinned
   positively in the structure block below. */
const sortGrnd = (s: string) => {
  const i = s.indexOf('sec sec-grnd">')
  const SUF = '</div></div></section>'
  if (i < 0 || !s.endsWith(SUF)) return s
  const parts = s.slice(i, -SUF.length).split('<div class="pl-row')
  const head = s.slice(0, i) + parts.shift()
  return head + parts.sort().map(p => '<div class="pl-row' + p).join('') + SUF
}

/* View only: the port also drops the Available-crew puck strip. In EDIT mode
   the port keeps it, so it must NOT be cut there or it silently falls out of
   comparison. */
const noAvailPuck = (s: string) => s.replace(
  /<div class="availpuck sec sec-avail"[\s\S]*?(?=<div class="sub plist one sec sec-)/, '')

/* Divergence #7 (owner, Aug 26): the fixed 2TK/TPOD/NAV store toggles became an
   additive, squadron-editable NAV/N/C/3 TKS/CL list (a "C" button that opens a
   popup listing every store, plus the on-chips — 7 Aug 26), so the
   .stores span diverges from the reference in BOTH view and edit mode. Excise
   the whole span from both sides — it always sits last in the rmkcell, closing
   right before that cell's </div>, so the lazy match ends at that boundary. The
   new store markup and its funnel behaviour are pinned positively in
   interact.test.tsx. Bombs live inside .stores and ride along in the cut; the
   bombs commit is pinned there too. */
const noStores = (s: string) => s.replace(
  /<span class="stores">[\s\S]*?<\/span>(?=<\/div>)/g, '')

/* Divergence #9 (owner, 6 Aug 26): the brief time is now typed (f.br), shown
   through ted() so it is editable, with a click-to-accept suggestion ghost
   above the box when it is blank — see ui/html.ts's .bto cell and .bsug. The
   reference has no typed-brief concept at all: it always prints the bare
   computed <b>brief</b> it always has, none of ted()'s wrapping (a class
   attribute, alAttr's data-alc/data-alp, or the accept ghost). This file
   never calls setSession, so canEditSched() is false throughout and ted()'s
   own gate (`!ed||!canEditSched()`) takes the plain-text branch on both
   dayHTML(di,false) and dayHTML(di,true) here — the port's brief node is the
   same shape in both, just like the reference's. Excise the brief node (and
   the ghost, when present — it never is in this file, but the regex covers
   it so a future canEditSched()-aware call here would not silently pass) from
   both sides, leaving the div wrapper and the TO span — still byte-compared —
   untouched. The new structure is pinned positively in brieftime-ui.test.tsx. */
const noBrief = (s: string) => s.replace(
  /(<div class="fcell bto"[^>]*>)(?:<span class="bsug"[^>]*>[^<]*<\/span>)?<b[^>]*>[^<]*<\/b>/g, '$1')

/* Divergence #8 (owner, Aug 5, extended Aug 5 '26): the qual ladder itself.
   CI left the ladder first; then the generic I tier and the `ip` flag went
   too, replaced by the four instructor CATs (IW/IP/IR/FI). This used to be a
   catCI excision helper here; it is now closed AT THE SOURCE by refwin's
   remap(), which migrates the in-memory reference's ladder tables, isInstr,
   puck builder, PEOPLE literals and legend to the port's world before boot —
   so every byte of every puck is back under comparison. The ladder and the
   seed migration are pinned positively in quals.test.tsx. */

/* Divergence #10 (owner, 6 Aug 26): the previous-day trace is now a STANDING
   mark. A crew-rest breach is raised on the day the man is told to report, and
   the day that caused it — the only one a scheduler can still change — carries
   a dotted ring, a CR label and a cross-day row from the moment the week
   renders. The seed week fires exactly one of these (casper, Tue, traced back
   to Mon), so it lands inside the byte comparison on day 0. The reference has
   no trace concept at all: it looks at Monday and says nothing.
   Excised rather than patched into refwin, unlike the matrix and the OFT brief
   lead: those two changed what the ENGINE decides, so the reference had to be
   taught them or the two engines would disagree about the schedule itself.
   This changes only what the previous day DRAWS about a warning both engines
   already raise identically — parity.test.ts still compares every field of it
   — so there is nothing to teach, only a decoration to lift off. The three
   pieces are pinned positively in crewrest-ui.test.ts. */
const noTrace = (s: string) => s
  /* the CR chip and the title text, both distinguishable from a REAL crew-rest
     flag by their wording: the trace says "Crew rest — <day> is broken by...",
     the flag on the day of the breach says "Crew rest breach (<12h)". The
     genuine one on Tuesday stays under comparison. */
  .replace(/<span class="lchip l-cr" title="Crew rest — [^"]*">[^<]*<\/span>/g, '')
  .replace(/ · Crew rest — [^"]*(?=")/g, '')
  .replace(/ boxdot/g, '')
  /* the cross-day strip: drop its rows first (each ends at the one
     `</span></div>` that closes it), then the container they leave empty */
  .replace(/<div class="witem hard wtr[^"]*"[^>]*>[\s\S]*?<\/span><\/div>/g, '')
  .replace(/<div class="dwtrace"><\/div>/g, '')

describe('view-week markup parity with the reference', () => {
  it('every day of the read-only week is byte-identical (minus the input blocks)', () => {
    const V = (s: string) => noTrace(noBrief(noStores(sortGrnd(grndTitle(noInpGrp(noAvailPuck(noNotes(s))))))))
    DAYS.slice(0, REFN).forEach((_: any, di: number) => {
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
    /* The Available-crew strip sits inside noInpGrp's cut on both sides (the
       port's first input group precedes it, the reference's strip is the cut's
       own start), so it is not byte-compared here; the pins below assert the
       port keeps it in edit mode. */
    const E = (s: string) => noTrace(noBrief(noStores(sortGrnd(grndTitle(noInpGrp(noNotes(noSign(s))))))))
    DAYS.slice(0, REFN).forEach((_: any, di: number) => {
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

  /* Divergence #8 (owner, Aug 26): the break-day flag is a rule the reference
     does not have, so its legend swatch is excised from both sides — a no-op
     on the reference — and pinned positively just below. */
  const noRunKey = (s: string) => s.replace(
    /\n\s*<span><span class="qk"[^>]*>7<\/span>no break day<\/span>/, '')

  /* Same treatment for the crew-pairing key (owner, 7 Aug 26). CP is a
     port-only flag, so both of its swatches come out of the comparison — a
     no-op on the reference — and are pinned positively just below. */
  const noCP = (s: string) => s.replace(
    /\n\s*<span><span class="qk"[^>]*>CP<\/span>crew pairing — [^<]*<\/span>/g, '')

  /* Divergence (owner, 10 Aug 26): "B, should be amber, they are advisories".
     The reference drew both brief swatches RED while raising the rules as adv,
     so its puck contradicted its own checks list. The port grades the swatch by
     the tier the rule is actually raised at, which makes these two rows differ
     by colour alone. Excised from both sides — NOT a no-op on the reference
     this time, which is why the positive pin below ('the legend swatch matches
     the tier the rule is raised at') carries the real assertion. */
  /* NB: named noBriefKey, not noBrief — there is already a module-level
     noBrief for the brief-time CELL (line ~117), and shadowing it here made
     the day-parity tests fail on an unrelated `class=""` difference. */
  const noBriefKey = (s: string) => s.replace(
    /\n\s*<span><span class="qk"[^>]*>B<\/span>no (?:flight|sim) brief<\/span>/g, '')

  /* Personnel (ground crew, owner Aug 26): a category the reference does not
     have, so its seat swatch is port-only — excised from both sides (a no-op on
     the reference) and pinned positively just below. */
  const noPers = (s: string) => s.replace(
    /<span data-leg="pers">.*?<\/span>/, '')

  it('the legend is byte-identical', () => {
    expect(noPers(noBriefKey(noCP(noRunKey(legendHTML()))))).toBe(noPers(noBriefKey(noCP(noRunKey(w.eval('legendHTML()'))))))
  })

  it('the legend names the Personnel category', () => {
    const l = legendHTML()
    expect(l).toContain('data-leg="pers"')
    expect(l).toContain('Personnel (ground crew)')
  })

  /* The chip shipped on 5 Aug 26 and the legend was never told about it, so
     the squadron met a flag on a puck with nothing on the page explaining it
     (owner, from the deployed site, 7 Aug 26). It needs TWO rows because CP is
     two codes printing one glyph: the colour is the only thing separating "get
     a signature" from "this pairing is not allowed", so a single row would
     explain the letters and hide the distinction that matters. */
  it('the legend explains BOTH crew-pairing flags, and by colour', () => {
    const l = legendHTML()
    expect(l).toContain('>CP</span>crew pairing — needs approval')
    expect(l).toContain('>CP</span>crew pairing — not authorised')
    /* the swatches must be the puck's own colours, or the legend teaches a
       colour code the pucks do not use: amber advisory, red hard */
    expect(l).toContain('background:#E5A83B;color:#12100a">CP</span>crew pairing — needs approval')
    expect(l).toContain('background:#F0555F">CP</span>crew pairing — not authorised')
  })

  /* THE COLOUR IS THE SEVERITY, and nothing else (owner, 10 Aug 26 — "7 should
     be red, its a warning. B, should be amber, they are advisories").
     The two legends and the puck used to disagree: the week said the 7 was red,
     the Logic tab drew it amber, and both drew the brief chips red over an
     amber ring. Red here means the rule is raised hard; amber means adv. */
  it('the legend swatch matches the tier the rule is raised at', () => {
    const l = legendHTML()
    const RED = '#F0555F', AMBER = '#E5A83B'
    const swatch = (label: string) => {
      const i = l.indexOf('</span>' + label)
      expect(i, 'legend has a row for ' + label).toBeGreaterThan(-1)
      return l.slice(Math.max(0, i - 90), i).includes(RED) ? 'hard' : 'adv'
    }
    expect(swatch('no break day'), 'a break day is due — a Warning').toBe('hard')
    expect(swatch('crew rest'), 'crew rest is a Warning').toBe('hard')
    expect(swatch('conflict'), 'two places at once is a Warning').toBe('hard')
    expect(swatch('no flight brief'), 'an eaten brief is an Advisory').toBe('adv')
    expect(swatch('no sim brief'), 'and so is an eaten sim brief').toBe('adv')
    expect(swatch('no flight debrief')).toBe('adv')
    expect(swatch('tight turn')).toBe('adv')
    expect(l, 'and the amber ones carry the dark text that goes with amber')
      .toContain(AMBER + ';color:#12100a">B</span>no flight brief')
  })

  /* Every chip the engine can put on a puck should be findable in the legend.
     CP was missed for two days because nothing checked; this is the check. */
  it('every chip code has a legend row', () => {
    const l = legendHTML()
    const missing = Object.keys(CHIP_LABEL).filter(c => !l.includes(`>${chipText(c)}</span>`))
    expect(missing, 'chips with no legend row: ' + missing.join(',')).toEqual([])
  })

  it('the legend explains the break-day flag', () => {
    expect(legendHTML()).toContain('no break day')
    expect(legendHTML()).toContain('>7</span>no break day')
  })

  it('the legend names the four instructor CATs and the bare I swatch is gone', () => {
    const l = legendHTML()
    expect(l).toContain('>IW</span>IWSO')
    expect(l).toContain('>IP</span>IP')
    expect(l).toContain('>IR</span>IR exmr')
    expect(l).toContain('>FI</span>FWI')
    expect(l).not.toContain('>I</span>IP / instr')
  })

  /* ---- what the excised region above is replaced by ---------------------
     noInpGrp stops byte-comparing the input blocks, so their new structure is
     pinned here instead. Read-only assertions, so they are safe inside the
     parity block. */

  it('the day carries the three blocks, in order, on the scheduler side', () => {
    const e = dayHTML(0, true)
    const at = (m: string) => e.indexOf(m)
    expect(at('>Ground Programme · scheduler<')).toBeGreaterThan(-1)
    expect(at('>Personal Inputs<')).toBeGreaterThan(at('>Ground Programme · scheduler<'))
    expect(at('>Unavailable<')).toBeGreaterThan(at('>Personal Inputs<'))
  })

  it('the view page shows the scheduler ground block and Unavailable only', () => {
    const v = dayHTML(0, false)
    expect(v).toContain('>Ground Programme<')       // no "· scheduler" qualifier
    expect(v).toContain('>Unavailable<')
    expect(v).not.toContain('>Personal Inputs<')
    expect(v).not.toContain('data-acc=')            // and no accept controls
  })


  it('Unavailable gathers detachment, leave and downchit', () => {
    /* day 2 carries overseas duty (pike, Jul 15–17) and an OL (j_lee) */
    const v = dayHTML(2, false)
    const blk = v.slice(v.indexOf('sec-unav'))
    expect(blk).toContain('OD')
    expect(blk).toContain('OL')
    expect(dayHTML(0, false)).toMatch(/sec-unav[\s\S]*OML/)
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

  /* the render-time sort (owner, Aug 26): rows read in start-time order while
     their keys keep the MODEL index — reordering the array would rot every
     pending mark and published AL address that points into it. Sits in this
     signed-in block because the key check reads data-txt attributes. */
  it('ground rows render in start-time order, keys pinned to the model', () => {
    const d: any = DAYS[0]
    /* the seed must actually be out of order for this to prove anything */
    const mtimes = d.ground.map((r: any) => parseHM(r.str))
    expect(mtimes.some((t: any, i: number) => i && t != null && mtimes[i - 1] != null && t < mtimes[i - 1]),
      'seed day 0 ground is already sorted — pick a day that is not').toBe(true)
    const rows = dayHTML(0, true).slice(dayHTML(0, true).indexOf('sec-grnd'))
      .split('<div class="pl-row').slice(1)
      .map(p => ({ ri: +(p.match(/data-txt="gr:0\.(\d+)\.str"/) || [])[1] }))
      .filter(r => !isNaN(r.ri))
    expect(rows.length).toBe(d.ground.length)
    const rtimes = rows.map(r => parseHM(d.ground[r.ri].str))
    const timed = rtimes.filter((t: any) => t != null)
    expect(timed).toEqual([...timed].sort((a: any, b: any) => a - b))
    /* time-less rows sink to the bottom */
    rtimes.forEach((t: any, i: number) => {
      if (t == null) expect(rtimes.slice(i).every((x: any) => x == null)).toBe(true)
    })
    /* a fresh, still-blank row lands at the bottom of the render too */
    d.ground.push({ prog: '', str: '', end: '', who: '' })
    const e2 = dayHTML(0, true)
    const gblk = e2.slice(e2.indexOf('sec-grnd'), e2.indexOf('sec-inp'))
    expect(gblk.slice(gblk.lastIndexOf('<div class="pl-row'))).toContain(`gr:0.${d.ground.length - 1}.str`)
    d.ground.pop()
  })

  /* finding #2 (whole-branch review, 9 Aug 26): groundOrder(grd,man) gained a
     second parameter so a day frozen in manual order (moveGroundRow sets
     d.gman) stops time-sorting at render — but this call site never passed
     it, so the freeze-then-move machinery a scheduler just used was silently
     undone by the very next redraw. Asserts the RENDERED order, not the
     model array: the model is already permuted the moment gman is set, so a
     model-only assertion (as engine/reorder.test.ts already has) cannot
     catch a render call site that forgot the flag. */
  it('a day frozen in manual ground order (gman) renders that order, not time order', () => {
    const d: any = DAYS[0]
    const savedGround = d.ground, savedGman = d.gman
    d.ground = [{ prog: 'GMAN-C', str: '1000' }, { prog: 'GMAN-A', str: '0800' }, { prog: 'GMAN-B', str: '0900' }]
    d.gman = true
    try {
      const e = dayHTML(0, true)
      const gblk = e.slice(e.indexOf('sec-grnd'), e.indexOf('sec-inp'))
      const progs = [...gblk.matchAll(/data-txt="gr:0\.\d+\.prog"[^>]*>([^<]*)</g)].map(m => m[1])
      expect(progs).toEqual(['GMAN-C', 'GMAN-A', 'GMAN-B'])
    } finally {
      d.ground = savedGround; d.gman = savedGman
    }
  })
})

/* The two days the bounded byte-comparison above stops covering. */
describe('the weekend days render (owner, Aug 26)', () => {
  it('build on both surfaces, read as non-flying, and carry their duty crew', () => {
    DAYS.slice(REFN).forEach((d: any, i: number) => {
      const di = REFN + i
      for (const ed of [false, true]) {
        const h = dayHTML(di, ed)
        expect(h, `${d.dow} ed=${ed}`).toContain(`data-day="${di}"`)
        expect(h).toContain(d.dow)
        expect(h).toContain('No flying')          // the .nobox stands in for the waves
        expect(h).not.toContain('undefined')
      }
      // the duty block is real, so it addresses through the ordinary grammar
      expect(dayHTML(di, true)).toContain(`d:${di}.0.0`)
    })
  })

  it('Saturday and Sunday are the last two, in order', () => {
    const week = DAYS.map((_: any, di: number) => dayHTML(di, false))
    expect(week.length).toBe(7)
    expect(week[5]).toContain('Saturday')
    expect(week[6]).toContain('Sunday')
  })
})
