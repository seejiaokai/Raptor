// @vitest-environment jsdom
/* THE SCHEDULE-MUTATION QUARANTINE GATES (P2-REV2-02, P2-REV2-03). The read-only
   quarantine (an unsupported / wrong-week book is frozen) was enforced at the
   per-field mutation funnel (HOOKS.editMode → !protectedWeek) and the input
   paths, but the STRUCTURAL mutators that bypass the field funnel each leaked:
     · draft activation (draftSelect) and recovery (loadVersionToWorkingCopy)
       replaced DAYS[di] wholesale and reported success, but persistence writes
       the preserved original blob back, so the switch VANISHED on reload;
     · a whole-day template replace (applyDayTpl) did the same;
     · publication (setDayApproved / publishALDay / alIssue) proceeded on an
       unsupported book whose verIds happened to resolve (unsupported ≠
       unresolvable ids), pushing an AL the preserved-blob writeback then lost.
   Each structural mutator now refuses on protectedWeek(). And dayIssuedHTML
   classifies authority by the WEEK/BOOK, not by whether ids resolve. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore } from '../state/store'
import { DAYS } from './data'
import { SCHED, protectedWeek, setDayApproved, publishALDay, alIssue, dayApproved, signOf, resetSched } from './publish'
import { draftSelect, draftDup, loadVersionToWorkingCopy, dayDrafts, curDraftId } from './drafts'
import { applyDayTpl, addDayTpl, dayTplReset } from './daytpl'
import { dayIssuedHTML } from '../ui/html'
import { HOOKS } from './hooks'

let said: string[] = []
const realToast = HOOKS.toast
const clone = (o: any) => JSON.parse(JSON.stringify(o))
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
/* flip the LOADED book to a PRE-Phase-2 (unsupported → read-only) shape */
const protect = () => { SCHED.amV = undefined; SCHED.cur = { ...(SCHED.cur || {}), 0: SCHED.cur?.[0] ?? 'orig' } }

/* resetSched() clears SCHED (dayOK/als/drafts/orig…) which otherwise carries
   across initStore() calls in one process — a prior test's approval would make a
   later "not approved" assertion read stale state, not the guard's effect. */
beforeEach(() => { initStore(); resetSched(); said = []; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any })
afterEach(() => { HOOKS.toast = realToast; SCHED.amV = 1 })

describe('draft activation refuses on a protected week (P2-REV2-02)', () => {
  it('draftSelect does not swap the live day and reports failure', () => {
    const di = 0
    SCHED.drafts = { [di]: [
      { id: 'dr1', name: 'Draft 1', d: clone(DAYS[di]) },
      { id: 'dr2', name: 'Draft 2', d: { ...clone(DAYS[di]), marker: 'B' } },
    ] }
    SCHED.curDraft = { [di]: 'dr1' }
    const before = JSON.stringify(DAYS[di])
    protect()
    expect(protectedWeek()).toBe(true)
    expect(draftSelect(di, 'dr2'), 'the switch is refused').toBe(false)
    expect(JSON.stringify(DAYS[di]), 'the live day is untouched').toBe(before)
    expect(curDraftId(di), 'the selection did not move').toBe('dr1')
  })

  it('draftDup neither stows nor mints on a protected week', () => {
    const di = 1
    const before = JSON.stringify(DAYS[di])
    protect()
    expect(draftDup(di), 'no draft minted').toBe(null)
    expect(dayDrafts(di).length, 'the draft list is untouched').toBe(0)
    expect(JSON.stringify(DAYS[di]), 'the live day is untouched').toBe(before)
  })
})

describe('recovery + whole-day replace refuse on a protected week (P2-REV2-02)', () => {
  it('loadVersionToWorkingCopy will not roll a resolvable issued version over a frozen day', () => {
    const di = 0
    sign(di); setDayApproved(di, true)                 // publish Original → SCHED.orig[di], cur[di] resolvable
    const ver = SCHED.cur[di]
    const before = JSON.stringify(DAYS[di])
    protect()
    expect(protectedWeek()).toBe(true)
    expect(loadVersionToWorkingCopy(di, ver), 'refused even though the version resolves').toBe(false)
    expect(JSON.stringify(DAYS[di]), 'the day was not rolled back over').toBe(before)
  })

  it('applyDayTpl will not replace a frozen day', () => {
    const di = 2
    // a REAL template captured from a DIFFERENT day, so without the guard this
    // would genuinely rewrite day 2 — the guard, not a missing template, refuses
    const t = addDayTpl(0)!
    expect(t, 'the template was captured').toBeTruthy()
    const before = JSON.stringify(DAYS[di])
    protect()
    expect(applyDayTpl(di, t.id), 'refused').toBe(false)
    expect(JSON.stringify(DAYS[di]), 'the day is untouched').toBe(before)
    dayTplReset()
  })
})

describe('publication refuses on a protected week (P2-REV2-03)', () => {
  it('setDayApproved will not first-publish a day on an unsupported book', () => {
    const di = 0
    sign(di)                                            // signed, so only the quarantine can block it
    protect()
    setDayApproved(di, true)
    expect(dayApproved(di), 'the day was not approved').toBe(false)
  })

  it('publishALDay refuses and says the week is locked', () => {
    const di = 0
    protect()
    const before = SCHED.als.length
    publishALDay(di)
    expect(SCHED.als.length, 'no AL was issued').toBe(before)
    expect(said.join(' ')).toMatch(/locked/i)
  })

  it('alIssue is the backstop — it pushes no record on a protected week', () => {
    const di = 0
    protect()
    const before = SCHED.als.length
    alIssue(di)
    expect(SCHED.als.length, 'no AL record pushed').toBe(before)
  })
})

describe('authoritative rendering classifies by the week, not by id resolution (P2-REV2-03)', () => {
  it('an approved day on an unsupported book shows the unavailable notice even when its verId resolves', () => {
    const di = 0
    sign(di); setDayApproved(di, true)                 // day 0 approved, cur[di] a resolvable verId
    protect()                                           // book now unsupported, but cur[di] still resolves
    const html = dayIssuedHTML(di)
    expect(html, 'renders the unsupported notice, not the live snapshot').toMatch(/older version of the app/i)
  })
})
