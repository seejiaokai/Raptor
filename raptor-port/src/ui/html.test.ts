/* UI markup parity: the ported day/legend builders must produce byte-identical
   markup to the untouched reference for every day of the seed week. Combined
   with the verbatim stylesheet, what the React app paints is what the
   reference paints. */
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { JSDOM, VirtualConsole } from 'jsdom'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'
import { dayHTML, dayPreviewHTML, withDaySnap, legendHTML } from './html'
import { SCHED, signOf, setDayApproved, alIssue } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { txtSet, txtGet } from '../engine/slots'
import { setDayPreview, DPREV } from '../state/view'

let w: any

beforeAll(async () => {
  const html = readFileSync('reference/scheduler.html', 'utf8')
  const vc = new VirtualConsole()
  vc.on('jsdomError', () => {})
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true })
  w = dom.window
  w.URL.createObjectURL = () => 'blob:x'
  w.HTMLElement.prototype.scrollIntoView = () => {}
  await new Promise(r => setTimeout(r, 300))
  w.eval('validate()')
  validate()
})

describe('view-week markup parity with the reference', () => {
  it('every day of the read-only week is byte-identical (minus Available/Office)', () => {
    /* deliberate divergence #2: the view page drops the Available group, the
       Office group and the Available-crew strip (owner request, Aug 26 — they
       are scheduling tools, not part of the issued programme). Excise them
       from the reference string; the blocks nest divs, so anchor the cut on
       the ALWAYS-rendered Leave group instead of a lazy close-tag match. The
       replace is a no-op on the port string, and the pins below assert the
       divergence rather than just tolerating it. */
    const noAvail = (s: string) => s.replace(
      /<div class="(?:sub plist one sec sec-avail|availpuck sec sec-avail)"[\s\S]*?(?=<div class="sub plist one sec sec-leave")/, '')
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},false)`)
      expect(noAvail(dayHTML(di, false)), 'day ' + di).toBe(noAvail(ref))
    })
  })

  it('view mode drops Available/Office/Available-crew; edit mode keeps them', () => {
    /* day 0 is the only demo day carrying Available and Office inputs */
    const v = dayHTML(0, false)
    expect(v).not.toContain('sec sec-avail')
    expect(v).not.toContain('sec-off')
    expect(v).not.toContain('availpuck')
    const e = dayHTML(0, true)
    expect(e).toContain('sub plist one sec sec-avail')
    expect(e).toContain('sec-off')
    expect(e).toContain('availpuck')
  })

  it('the edit-mode markup is byte-identical too (minus the sign-off strip)', () => {
    /* THE one deliberate divergence from the reference: the sign-off pills
       carry an extra .v value span so the select can stretch invisibly over
       the whole pill (iPhone Safari won't open a select from a label tap —
       owner request, Aug 26). Excise the strip from both sides — signoffHTML
       nests no <div>, so the lazy match ends at the strip's own close — and
       pin the new pill structure separately below. */
    const noSign = (s: string) => s.replace(/<div class="signoff day-sign"[\s\S]*?<\/div>/, '')
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},true)`)
      expect(noSign(dayHTML(di, true)), 'day ' + di).toBe(noSign(ref))
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
