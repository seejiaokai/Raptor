// @vitest-environment jsdom
/* THE BELL'S "SHOW" BUTTONS AND ITS GREY SQUADRON MARK (batch 1's second half — night job 4, 23 Nov 26; the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §7 item 3 (8a, 8b, 8c), §15 D5, D6, §16 D1′a, D5′ / D6′;
   his D2198, D2202, D2319, D2321; the approved drawings docs/mock/2026-11-22-msq-b1-screens/img/p3a-*, p3b-*, p3c-d,
   f5a-p).
   - Whoever's bell may show lines of more than one squadron (state/bellsqn.ts bellSquadrons — his home, and every
     squadron whose admin lines reach him: a master admin all, a Plan holder his Plan squadrons) gets "Show" and a button
     per squadron at the list's foot, in the filter chip's own look, on / off from bellShows; a press is his own saved
     choice (setBellSquadron), never an Undo step, and the lines follow at once. One squadron: no row.
   - A line of a squadron other than his home wears the grey squadron number after its name; his home's lines and his
     own account's lines (§15 D5, D2319) none.
   Red first on the code before the change (the host's run). The world: test-support/msq-world.ts — Wed 15 Jul 26. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, cleanup, act, fireEvent } from '@testing-library/react'
import { useMsqWorld, signInAs, signOut, ACCT, PID, on, mem } from '../test-support/msq-world'
import { postOut } from '../leavewar/sync'
import { saveAccess } from '../state/accounts'
import { addUnit, placeOfOn, todayIso } from '../state/units'
import { NOTICES, isAcctNotice } from '../state/notices'
import { bellChoices } from '../state/bellsqn'
import { _timelineEntries } from '../undo/timeline'
import { setBellList } from './pops'
import { BellList } from './topbits'

useMsqWorld()
beforeEach(() => { NOTICES.length = 0 })
afterEach(() => { cleanup(); setBellList(false) })

/* the bell's list, open (as a tap on the bell opens it when nothing else waits) */
function openList() {
  setBellList(true)
  return render(<BellList />)
}
const showRow = () => document.querySelector<HTMLElement>('[data-testid="bell-show"]')
const chips = () => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="bell-show"] button')]
  .map(b => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? ' on' : ''}`)
const chip = (num: string) => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="bell-show"] button')].find(b => b.textContent === num)!
/* each listed line: its name, then its grey mark where it has one */
const lines = () => [...document.querySelectorAll<HTMLElement>('[data-testid="bell-list"] .bl-line')].map(l => {
  const m = l.querySelector('.bl-sqn')
  return `${l.querySelector('.bl-name')!.textContent}${m ? ' [' + m.textContent + ']' : ''}`
})

/* one line of each squadron on the admins' bells: Hunter posts Ranger (142) out, Kestrel posts Osprey (149) out — each
   from today, each runs at once, each squadron's admins told (a master admin is one of every squadron's) */
function postBoth() {
  on(15, 9)
  signInAs('hunter')
  expect(postOut(PID.ranger, todayIso(), 'overseas'), "142's posting").toBe(true)
  on(15, 9, 30)
  signInAs('kestrel')
  expect(postOut(PID.osprey, todayIso(), 'overseas'), "149's posting").toBe(true)
}
const name = (pid: string) => (pid === PID.ranger ? 'Ranger' : 'Osprey')

describe('the Show buttons (p3a, p3b, D2198)', () => {
  it("Saber, the master admin: \"Show 142 149\", 142 on and 149 off as it starts; only 142's line is listed, unmarked", () => {
    postBoth()
    signInAs('saber')
    openList()
    expect(showRow(), 'the row').not.toBeNull()
    expect(showRow()!.textContent!.startsWith('Show'), 'its word').toBe(true)
    expect(chips()).toEqual(['142 on', '149'])
    const ls = lines()
    expect(ls.some(l => l.startsWith(name(PID.ranger))), "142's line listed").toBe(true)
    expect(ls.some(l => l.startsWith(name(PID.osprey))), "149's line not listed").toBe(false)
    expect(ls.filter(l => l.includes('[')), 'no mark on his home\'s lines').toEqual([])
  })
  it("he presses 149: 149's line shows at once, marked \"149\"; 142's stays unmarked; saved as his own choice, no Undo step", () => {
    postBoth()
    signInAs('saber')
    openList()
    const steps = _timelineEntries().length
    act(() => { fireEvent.click(chip('149')) })
    expect(chips()).toEqual(['142 on', '149 on'])
    const ls = lines()
    const osp = ls.find(l => l.startsWith(name(PID.osprey)))
    expect(osp, "149's line listed").toBeTruthy()
    expect(osp!.endsWith('[149]'), 'the grey 149 mark').toBe(true)
    expect(ls.find(l => l.startsWith(name(PID.ranger)))!.includes('['), "142's line unmarked").toBe(false)
    expect(bellChoices(PID.saber)).toEqual({ u149: true })
    expect(_timelineEntries().length, 'not an Undo step (§15 D6)').toBe(steps)
    /* and off again: gone at once */
    act(() => { fireEvent.click(chip('149')) })
    expect(chips()).toEqual(['142 on', '149'])
    expect(lines().some(l => l.startsWith(name(PID.osprey)))).toBe(false)
  })
  it('the switch survives a reload: it is saved, and read again at the next sign-in', () => {
    postBoth()
    signInAs('saber')
    const r = openList()
    act(() => { fireEvent.click(chip('149')) })
    expect(Object.keys(mem).some(k => k.endsWith(`bellsqn:${PID.saber}`)), 'the row is in the store').toBe(true)
    r.unmount(); setBellList(false)
    signOut()
    signInAs('saber')
    openList()
    expect(chips()).toEqual(['142 on', '149 on'])
    expect(lines().some(l => l.startsWith(name(PID.osprey)) && l.endsWith('[149]'))).toBe(true)
  })
})

describe('a Plan holder (p3c, D2202)', () => {
  it("Hunter with Plan of 149: 149 on as it starts, 149's line marked; his own account's line carries no mark (§15 D5)", () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } }), 'Plan of 149 given').toBeNull()
    postBoth()
    signInAs('hunter')
    openList()
    expect(chips()).toEqual(['142 on', '149 on'])
    expect(lines().find(l => l.startsWith(name(PID.osprey)))!.endsWith('[149]')).toBe(true)
    const acct = NOTICES.filter(n => n.to === PID.hunter && isAcctNotice(n))
    expect(acct.length, 'his own account line is on his bell').toBeGreaterThan(0)
    for (const n of acct) {
      const el = document.querySelector(`[data-testid="bell-line-${n.id}"]`)
      expect(el, 'listed').not.toBeNull()
      expect(el!.querySelector('.bl-sqn'), 'no squadron mark on his own account line').toBeNull()
    }
  })
})

describe('one squadron: no row', () => {
  it('Ranger (142\'s member), Hunter (142\'s admin, nothing elsewhere) and Kestrel (149\'s admin): no Show buttons', () => {
    postBoth()
    for (const who of ['ranger', 'hunter', 'kestrel'] as const) {
      signInAs(who)
      const r = openList()
      expect(showRow(), who).toBeNull()
      expect(lines().filter(l => l.includes('[')), `${who}: no mark on his own squadron's lines`).toEqual([])
      r.unmount(); setBellList(false)
    }
  })
})

describe('eight squadrons (f5a, D2321)', () => {
  it('Saber: eight buttons, in one row, by number, only 142 on', () => {
    signInAs('saber')
    const place = placeOfOn('u142', todayIso())!.id
    for (let n = 150; n <= 155; n++) expect(addUnit(String(n), place, ACCT.hunter), `${n} made`).toMatchObject({ ok: true })
    openList()
    expect(chips()).toEqual(['142 on', '149', '150', '151', '152', '153', '154', '155'])
    /* one row: every button a child of the one row element */
    const row = showRow()!
    expect([...row.querySelectorAll('button')].every(b => b.parentElement === row)).toBe(true)
  })
})
