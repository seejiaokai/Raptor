// @vitest-environment jsdom
/* [UNPUB-WARN-AL-RESTORES] (built 20 Oct 26) — what the Unpublish button SAYS when an amendment comes off a day whose OIL
   is already spent. The Original withdrawn makes the day a draft and its credits go (N4 and N2's OIL sentence, the words
   of record — owner D837, 14 Oct 26); an amendment withdrawn brings the version before it back, and THAT version's OIL
   pays, so it says so — and warns only when that version credits less than has been spent. The real button, pressed
   through the app's own click route, on a Leave War whose credits the pass landed; the notes read whole. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayCurVer, verLabel, setDayApproved } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore } from '../state/store'
import { commitPublishALDay } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass } from './sync'
import { dayStatHTML } from '../ui/html'
import { routeClick } from '../ui/interactions'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5                                   // the seed Saturday (2026-07-18): plasma stands SDO
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const sdo = () => (DAYS[SAT] as any).dutywaves[0].rows[0]
const times = (str: string, end: string) => { sdo().str = str; sdo().end = end }

let said: string[] = []
const realToast = HOOKS.toast
let host: HTMLDivElement
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop(); view.setUnpubArm(null); view.DPREV.clear()
  initStore()
  lwInitStore(memoryBackend()); setPeople(projectPeople()); setRole('admin')
  _resetDisclosure()
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  view.setPage('editsched')
  host = document.createElement('div'); document.body.appendChild(host)
  host.addEventListener('click', e => routeClick(e as MouseEvent))
})
afterEach(() => { HOOKS.toast = realToast; host.remove() })
const press = () => {
  host.innerHTML = dayStatHTML(SAT, true)
  ;(host.querySelector(`[data-unpub="${SAT}"]`) as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
}
const publishTwice = (orig: [string, string], al: [string, string]) => {
  times(...orig); sign(SAT); setDayApproved(SAT, true); runOilPass()
  times(...al); sign(SAT); commitPublishALDay(SAT); runOilPass()
  expect(verLabel(dayCurVer(SAT))).toBe('AL1')
}
const spendOneDay = () => { setCell('plasma', '2026-07-20', 'OIL'); setBidState('plasma', '2026-07-20', 'approved') }
const cell = () => getState().wars[0].grid['plasma']?.['2026-07-18']
/* the armed button's own words (its title — html.ts), read off the day header the click route draws */
const armedTitle = () => { const h = document.createElement('div'); h.innerHTML = dayStatHTML(SAT, true); return h.querySelector('[data-unpub]')!.getAttribute('title') }

describe('Unpublish of an amendment whose OIL is spent', () => {
  it('to a version that credits more: one tap, no warning, and the Original\'s full day is credited again', () => {
    publishTwice(['0800', '1800'], ['0800', '1200'])
    spendOneDay(); said = []
    press()
    expect(verLabel(dayCurVer(SAT)), 'one tap withdrew it').toBe('Original')
    expect(said).toEqual(['Saturday: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1.'])
    runOilPass()
    expect(cell()).toBe('FO')
  })

  it('to a version that credits less: the first tap warns in the amendment\'s words, the second withdraws and says what the war now credits', () => {
    publishTwice(['0800', '1200'], ['0800', '1800'])
    spendOneDay(); said = []
    press()
    expect(verLabel(dayCurVer(SAT)), 'the first tap only warns').toBe('AL1')
    expect(said).toEqual(['Withdrawing AL1 brings back the Original’s OIL for Saturday. Some of AL1’s OIL credits are already spent on the Leave War, and the Original credits less. Tap again to confirm.'])
    expect(armedTitle(), 'the armed button says the same case').toBe('Withdraw AL1 on Saturday. The Original’s OIL comes back, and some of AL1’s is already spent on the Leave War. Tap to confirm.')
    said = []
    press()
    expect(verLabel(dayCurVer(SAT))).toBe('Original')
    expect(said).toEqual(['Saturday: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1. The Leave War credits the Original’s OIL for the day until AL1 is republished.'])
    runOilPass()
    expect(cell(), 'the half day the warning reckoned').toBe('HO')
  })

  it('the Original withdrawn keeps N4 and N2\'s words, as ruled', () => {
    times('0800', '1800'); sign(SAT); setDayApproved(SAT, true); runOilPass()
    spendOneDay(); said = []
    press()
    expect(said).toEqual(['Some of Saturday’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm.'])
    expect(armedTitle()).toBe('Withdraw Original on Saturday. Its OIL credits are already spent on the Leave War, and republishing restores them. Tap to confirm.')
    said = []
    press()
    expect(said).toEqual(['Saturday unpublished. It is a draft again, and publishing reissues the Original. Its OIL credits are withdrawn from the Leave War until it is republished.'])
  })
})
