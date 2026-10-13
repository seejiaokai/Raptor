// @vitest-environment jsdom
/* [GLOBAL-UNDO] §6.4 — the Unpublish BUTTON's visibility gate + its §6.6 confirm
   face. The forward command itself is covered in state/unpublish-commit.test.ts;
   this pins the day-header rendering: the button shows only on the edit surface of a
   published day that is not being previewed, and wears the amber confirm face while
   armed. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayApproved, dayCurVer, verLabel } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { initStore } from '../state/store'
import { commitSetDayApproved, commitPublishALDay } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { dayStatHTML } from './html'
import { routeClick } from './interactions'


const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop(); view.setUnpubArm(null)
  view.DPREV.clear()
  initStore()
  _resetDisclosure()
})

describe('the Unpublish button visibility gate (§6.4 / C10) (AM37c)', () => {
  it('appears on the edit surface of a published day (AM32)', () => {
    sign(0); commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    expect(dayStatHTML(0, true)).toContain('data-unpub="0"')
  })

  it('is absent on a still-draft day', () => {
    expect(dayApproved(1)).toBe(false)
    expect(dayStatHTML(1, true)).not.toContain('data-unpub')
  })

  it('is absent on the read-only (view) surface of a published day', () => {
    sign(0); commitSetDayApproved(0, true)
    expect(dayStatHTML(0, false)).not.toContain('data-unpub')
  })

  it('is hidden while previewing an older version of a published day', () => {
    sign(0); commitSetDayApproved(0, true)
    view.setDayPreview(0, dayCurVer(0))          // a preview is up on day 0
    expect(dayStatHTML(0, true)).not.toContain('data-unpub')
  })
})

describe('the §6.6 confirm face', () => {
  it('reads "Unpublish" at rest and "Withdraw — confirm" while armed', () => {
    sign(0); commitSetDayApproved(0, true)
    expect(dayStatHTML(0, true)).toContain('>Unpublish<')

    view.setUnpubArm(0)
    const armed = dayStatHTML(0, true)
    expect(armed).toContain('dunpub warn')
    expect(armed).toContain('Withdraw — confirm')
  })
})

/* WHAT UNPUBLISH SAYS (owner D837, 14 Oct 26 — the passing notes N2 and N3; the words of record:
   docs/superpowers/briefs/2026-10-13-wording-recheck.md). The real button, pressed through the app's own click
   route, and the note it raises read whole: a done thing, then sentences — no dash, no semicolon. (The warning on the
   first of two taps, N4, and the OIL sentence that follows a two-tap withdrawal need a Leave War whose credits are
   spent; their words are pinned where they are written, ui/noteswords.test.ts.) */
describe('what Unpublish says (N2, N3)', () => {
  let said: string[] = []
  const realToast = HOOKS.toast
  let host: HTMLDivElement
  beforeEach(() => {
    said = []
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    view.setPage('editsched')
    host = document.createElement('div'); document.body.appendChild(host)
    host.addEventListener('click', e => routeClick(e as MouseEvent))
  })
  afterEach(() => { HOOKS.toast = realToast; host.remove() })
  const press = () => {
    host.innerHTML = dayStatHTML(0, true)
    ;(host.querySelector('[data-unpub="0"]') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  it('the Original withdrawn: the day is a draft again', () => {
    sign(0); commitSetDayApproved(0, true)
    said = []
    press()
    expect(dayApproved(0), 'it is a draft again').toBe(false)
    expect(said).toEqual(['Monday unpublished. It is a draft again, and publishing reissues the Original.'])
  })

  it('an amendment withdrawn: its changes wait again, and the version before it is the issued schedule', () => {
    sign(0); commitSetDayApproved(0, true)
    const row = (DAYS[0] as any).dutywaves[0].rows[0]
    row.end = row.end === '1700' ? '1730' : '1700'          // a change on the published day
    sign(0); commitPublishALDay(0)
    expect(verLabel(dayCurVer(0)), 'AL1 is out').toBe('AL1')
    said = []
    press()
    expect(said).toEqual([`Monday: AL1 withdrawn. Its changes are back on the working copy as pending, and ${verLabel(dayCurVer(0))} is the issued schedule. Publishing reissues AL1.`])
    expect(verLabel(dayCurVer(0)), 'the Original is the issued schedule again').not.toBe('AL1')
  })
})
