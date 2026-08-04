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
  it('every day of the read-only week is byte-identical', () => {
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},false)`)
      expect(dayHTML(di, false), 'day ' + di).toBe(ref)
    })
  })

  it('the edit-mode markup is byte-identical too', () => {
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},true)`)
      expect(dayHTML(di, true), 'day ' + di).toBe(ref)
    })
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
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}
    DPREV.clear()
  })
})
