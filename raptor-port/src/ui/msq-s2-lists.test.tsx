// @vitest-environment jsdom
/* EVERY LIST OF SQUADRONS IN ONE ORDER (his D2730 Q1: "home squadron first, then the rest by number, in every list of
   squadrons — one order everywhere"; "his" — the signed-in person's home that day). Section 2's step re-points the
   lists of this section's files at the one order (state/units-model.ts squadronOrder, through state/perms.ts
   inSquadronOrder): the Schedules menu and the ☰ menu's squadron rows (perms.ts readableUnits / menuSquadrons), Admin →
   Squadrons' rows and each place's grey line (ui/squadrons-model.ts), Admin → Users' Filter squadron ticks
   (ui/UsersFilter.tsx), its grouped headings (ui/usersfilter-model.ts usersView), Add a person's "Home squadron"
   choices after the page's own (addHomeChoices), and an opened row's squadron lines (ui/UserAccess.tsx).

   The world: three squadrons (withThird), Wed 15 Jul 26. To reach every list for a person whose home is not the lowest
   number, Kestrel (149's admin) and Mako (150's admin) are each made a master admin by Saber — a master admin reads every
   squadron, sees the Squadrons page and the Filter's Squadron ticks. Saber, home 142, sees 142, 149, 150 as before. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, type Who } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { setMaster, accountsLoad } from '../state/accounts'
import { unitsLoad, todayIso, unitById } from '../state/units'
import { readableUnits, menuSquadrons } from '../state/perms'
import { squadronRows, placeRows } from './squadrons-model'
import { addHomeChoices } from './usersfilter-model'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => cleanup())
beforeEach(() => {
  signInAs('saber')
  expect(setMaster(ACCT.kestrel, true), 'Kestrel made a master admin').toEqual({ ok: true })
  expect(setMaster(ACCT.mako, true), 'Mako made a master admin').toEqual({ ok: true })
  unitsLoad(); accountsLoad()
})

const num = (u: string) => String(unitById(u)?.num ?? u)
const nums = (ids: string[]) => ids.map(num)
/* each person, and the order of squadrons he should see */
const CASES: [Who, string[]][] = [
  ['kestrel', ['149', '142', '150']],
  ['mako', ['150', '142', '149']],
  ['saber', ['142', '149', '150']],
]

function Live() { useVersion(); return <UsersPanel shown /> }
function panel() {
  const page = render(<Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const openFilter = async () => { if (!$('#accFilterPanel')) await act(async () => { fireEvent.click($('#accFilter')!) }) }
  const tick = async (k: string) => { await openFilter(); await act(async () => { fireEvent.click($(`#accFilterPanel [data-ftick="${k}"]`)!) }) }
  const chips = (g: string) => $$(`#accFilterPanel [data-fgroup="${g}"] .fchip`).map(c => c.textContent)
  const heads = () => $$('[data-testid="acc-groups"] h4.adm-sub').map(h => (h.textContent ?? '').split(' · ')[0])
  const find = async (q: string) => { await act(async () => { fireEvent.change($('#accFind')!, { target: { value: q } }) }) }
  const open = async (pid: string) => {
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"] .acc-tap`)!) })
  }
  const lines = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => n.textContent)
  return { openFilter, tick, chips, heads, find, open, lines }
}

describe('the Schedules menu and the ☰ menu: his home first, then by number (perms.ts readableUnits / menuSquadrons)', () => {
  for (const [who, want] of CASES) {
    it(`${who}: ${want.join(', ')}`, () => {
      signInAs(who)
      expect(nums(readableUnits()), 'the squadrons he may pick').toEqual(want)
      expect(menuSquadrons().map(r => r.num), 'the menu rows').toEqual(want)
      expect(menuSquadrons()[0]!.label, 'the first row is his own').toBe('Your squadron')
    })
  }
})

describe('Admin → Squadrons: the squadron rows and each place\'s grey line (ui/squadrons-model.ts)', () => {
  for (const [who, want] of CASES) {
    it(`${who}: the rows ${want.join(', ')}; a place holding all three lists them ${want.join(' · ')}`, () => {
      signInAs(who)
      expect(squadronRows(todayIso()).map(r => r.num), 'the rows').toEqual(want)
      const all = placeRows(todayIso()).find(p => p.at.length === 3)
      expect(all, 'one place holds all three squadrons').toBeTruthy()
      expect(nums(all!.at), 'the place\'s squadrons').toEqual(want)
      expect(all!.sub.startsWith(want.join(' · ')), all!.sub).toBe(true)
    })
  }
})

describe('Admin → Users: the Filter\'s Squadron ticks and the grouped headings (ui/UsersFilter.tsx, usersfilter-model.ts)', () => {
  for (const [who, want] of CASES) {
    it(`${who}: the ticks ${want.join(', ')}; every squadron ticked, the headings ${want.join(', ')}`, async () => {
      signInAs(who)
      const p = panel()
      await p.openFilter()
      expect(p.chips('sqn'), 'the Squadron ticks').toEqual(want)
      for (const u of ['u142', 'u149', third.u150]) await p.tick(`sqn:${u}`)
      expect(p.heads(), 'the group headings').toEqual(want)
    })
  }
})

describe('Add a person\'s "Home squadron": the page\'s own first, then his home, then by number (addHomeChoices)', () => {
  it('Kestrel on 150\'s page: 150, then his own 149, then 142', () => {
    signInAs('kestrel')
    expect(nums(addHomeChoices(third.u150))).toEqual(['150', '149', '142'])
  })
  it('Mako on 142\'s page: 142, then his own 150, then 149', () => {
    signInAs('mako')
    expect(nums(addHomeChoices('u142'))).toEqual(['142', '150', '149'])
  })
  it('Saber on 150\'s page: 150, then 142, 149, as before', () => {
    signInAs('saber')
    expect(nums(addHomeChoices(third.u150))).toEqual(['150', '142', '149'])
  })
})

describe('an opened row\'s squadron lines: the signed-in person\'s home first, then by number (ui/UserAccess.tsx)', () => {
  it('Kestrel opens Osprey, a man of his own 149: 149, 142, 150', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('osprey')
    await p.open(PID.osprey)
    expect(p.lines()).toEqual(['149', '142', '150'])
  })
  it('Saber opens Ranger, a man of his own 142: 142, 149, 150, as before', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.ranger)
    expect(p.lines()).toEqual(['142', '149', '150'])
  })
})
