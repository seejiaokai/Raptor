// @vitest-environment jsdom
/* ADMIN → USERS — A PERSON'S OPENED ROW BY SQUADRON (batch 1's second half §4 items 3–5; his D2303 — design B, pictures
   rB1–rB4; D2305 the Role box's short words; D2306 "Plan is for admins only."; D2336 "Only an admin of 149 can give
   access to 149."; D2320 no sign-in; D2211 Plan's line; pictures p2a/p2b "· also plans 149").
   - Role: Member, Admin, Master admin — "Master admin" greyed for anyone but a master admin.
   - One line per squadron: "142 Home squadron"; "149 None · View · Plan"; Master admin picked: "Full access", no buttons.
   - A line not his to change greyed with its reason; a man of another squadron found by search shows his squadron's
     number by his name, the rest of his row greyed (D2191).
   - The row's Save is ONE command through saveAccess: one Undo step takes it all back.
   Red first: before the change the row had no squadron lines and the Role box read the long words. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { accountOfPid, levelIn, saveAccess } from '../state/accounts'
import { todayIso } from '../state/units'
import { rosterOf } from '../engine/roster'
import { globalUndo } from '../undo/timeline'

useMsqWorld()
afterEach(() => cleanup())

function panel() {
  const page = render(<UsersPanel shown />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const open = async (pid: string) => { await act(async () => { fireEvent.click($(`#accList [data-person="${pid}"] .acc-tap`)!) }) }
  const find = async (q: string) => { await act(async () => { fireEvent.change($('#accFind')!, { target: { value: q } }) }) }
  const lines = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => {
    const u = n.dataset.unit!
    const next = n.nextElementSibling as HTMLElement
    const btns = [...next.querySelectorAll<HTMLButtonElement>('button')]
    const what = btns.length
      ? btns.map(b => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? '*' : ''}${b.disabled ? '(off)' : ''}`).join(' ')
      : next.textContent
    const note = $(`[data-note-unit="${u}"]`)?.textContent ?? null
    return { n: n.textContent, what, note }
  })
  const pick = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  const save = async () => { await act(async () => { fireEvent.click($('#accEdSave')!) }) }
  return { $, $$, open, find, lines, pick, save }
}
const roleOptions = (box: HTMLSelectElement) => [...box.options].map(o => `${o.textContent}${o.disabled ? '(off)' : ''}`)

describe('R1 — a master admin opens a 142 admin', () => {
  it('Saber opens Hunter: Member · Admin · Master admin; 142 his home; Plan of 149 picked says what it gives; one Save, one Undo', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.hunter)
    expect(roleOptions(p.$('#accEdRole') as HTMLSelectElement)).toEqual(['Member', 'Admin', 'Master admin'])
    expect(p.lines()).toEqual([
      { n: '142', what: 'Home squadron', note: null },
      { n: '149', what: 'None* View Plan', note: null },
    ])
    await p.pick('u149', 'plan')
    expect(p.lines()[1]!.note).toBe('Full access to 149, every page: its schedule and publishing, its settings, its people and their sign-ins.')
    await p.save()
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('admin')
    act(() => { globalUndo() })
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'one Undo takes the Save back').toBeNull()
  })
  it('Master admin picked: every other squadron reads "Full access", no buttons (R4)', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.hunter)
    await act(async () => { fireEvent.change(p.$('#accEdRole')!, { target: { value: 'master' } }) })
    expect(p.lines()).toEqual([
      { n: '142', what: 'Home squadron', note: null },
      { n: '149', what: 'Full access', note: null },
    ])
  })
})

describe('R2, R3 — another squadron\'s admin opens a 142 member found by search', () => {
  /* (re-pointed at section 2's U1, 26 Nov 26 — his D2625, D2655 D5: the rest of his row is no longer drawn greyed but not
     drawn at all — the short row opens to the page's squadron's one line, Save and Cancel; the line itself, and its Save,
     as before. The full rule: msq-s2-row.test.tsx) */
  it('Kestrel finds Ranger: "142" by his name, the rest of his row not drawn; View his to give, Plan greyed "Plan is for admins only."', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('ranger')
    expect(p.$(`[data-testid="sqn-${PID.ranger}"]`)?.textContent).toBe('142')
    await p.open(PID.ranger)
    for (const id of ['#accEdName', '#accEdRole', '#accEdOnOff', '#accEdArchive', '#accEdDel']) expect(p.$(id), id).toBeNull()
    expect((p.$('#accEdSave') as HTMLButtonElement).disabled).toBe(false)
    expect(p.lines()).toEqual([
      { n: '149', what: 'None* View Plan(off)', note: 'Plan is for admins only.' },
    ])
    await p.pick('u149', 'view')
    await p.save()
    expect(levelIn(ACCT.ranger, 'u149', todayIso())).toBe('view')
  })
})

describe('R5 — a line not his to give', () => {
  it('Hunter (142\'s admin, nothing in 149) opens Ranger: 149 greyed whole, "Only an admin of 149 can give access to 149."; Master admin greyed', async () => {
    signInAs('hunter')
    const p = panel()
    await p.open(PID.ranger)
    expect(roleOptions(p.$('#accEdRole') as HTMLSelectElement)).toEqual(['Member', 'Admin', 'Master admin(off)'])
    expect(p.lines()[1]).toEqual({ n: '149', what: 'None*(off) View(off) Plan(off)', note: 'Only an admin of 149 can give access to 149.' })
  })
  it('149\'s own admin opening a 142 admin: View and Plan both his to give (D2626)', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('hunter')
    await p.open(PID.hunter)
    /* (re-pointed at U1: on 149's page a 142 man's row opens to 149's line alone — D2625, D2655 D5; the line as before)
       (re-pointed at U2's Pass C: Plan of 149 is given and ended by 149's own admins or a master admin — his D2626 — so
       Kestrel, 149's own admin, gives it; the old master-only sentence is gone. Who may not give it, and
       its new sentence: msq-s2-u2-row.test.tsx) */
    expect(p.lines()).toEqual([{ n: '149', what: 'None* View Plan', note: null }])
  })
})

describe('D2320 — no sign-in, no access', () => {
  it('a 142 man with no sign-in: 149 greyed, "Give him a sign-in first to give access."', async () => {
    signInAs('saber')
    const pid = rosterOf('u142', todayIso()).find(x => !accountOfPid(x))!
    expect(pid, 'setup: a 142 man with no sign-in').toBeTruthy()
    const p = panel()
    await p.open(pid)
    expect(p.lines()[1]).toEqual({ n: '149', what: 'None*(off) View(off) Plan(off)', note: 'Give him a sign-in first to give access.' })
  })
})

describe('"· also plans 149" (p2a, p2b)', () => {
  it('Hunter with Plan of 149: his grey line ends "· also plans 149" on 142\'s list and on 149\'s', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    let p = panel()
    expect(p.$(`[data-testid="plans-${PID.hunter}"]`)?.textContent).toBe(' · also plans 149')
    cleanup()
    signInAs('kestrel')
    p = panel()
    expect(p.$(`[data-testid="plans-${PID.hunter}"]`)?.textContent).toBe(' · also plans 149')
    expect(p.$(`[data-testid="sqn-${PID.hunter}"]`)?.textContent).toBe('142')
  })
})
