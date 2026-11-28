// @vitest-environment jsdom
/* THE SCHEDULES MENU (batch 1's second half, the plan docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §3
   items 1–3, 10; his D2301 — the list, a tick, a short grey label; D2304 — rows 38 high; D2132 — one squadron, no menu;
   D2253 — the member view reads "View only"; the drawing docs/mock/2026-11-22-msq-b1-screens/img/mA1-d.png, f5d-p.png).
   - Who gets it: whoever may read two squadrons or more (perms.ts readableUnits — his home, each View or Plan holding
     today, every squadron for a master admin); the rows exactly those, each with its label.
   - A pick brings the squadron into view (enterSquadron): the mark reads its number, the schedule pages follow it, his
     own pages only where he holds Plan of it or is a master admin; nothing saved, the Undo list untouched (D148).
   - Its keys: Escape and an outside press close it, focus back on the button; the arrows move along the rows.
   Red first: before the change the mark was never a button. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act, fireEvent } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { addUnit, placeOfOn, todayIso } from '../state/units'
import { readableUnits, menuSquadrons, pageUnit } from '../state/perms'
import { switchRoleView } from '../state/store'
import { UNIT } from '../engine/unitview'
import { _timelineEntries } from '../undo/timeline'
import { SqnMark } from './topbits'

useMsqWorld()
afterEach(() => cleanup())

function give(acct: string, unit: string, level: 'plan' | 'view'): void {
  signInAs('saber')
  expect(saveAccess(acct, { grants: { [unit]: level } }), `${level} of ${unit} given`).toBeNull()
}
const btn = (c: HTMLElement) => c.querySelector<HTMLButtonElement>('#sqnMenuBtn')
const rowsOf = () => [...document.querySelectorAll<HTMLElement>('#sqnMenu .sqm-row')].map(r =>
  `${r.querySelector('.sqm-num')!.textContent} ${r.querySelector('.sqm-lbl')!.textContent}${r.getAttribute('aria-checked') === 'true' ? ' ✓' : ''}`)
const num = (c: HTMLElement) => c.querySelector('.mark .k')!.textContent

describe('who gets the menu, and its rows', () => {
  it('Ranger (142\'s member) and Hunter (142\'s admin, no access elsewhere): the plain mark, no menu (D2132)', () => {
    for (const who of ['ranger', 'hunter', 'osprey'] as const) {
      signInAs(who)
      const { container, unmount } = render(<SqnMark />)
      expect(btn(container), who).toBeNull()
      expect(container.querySelector('.mark.menu'), who).toBeNull()
      expect(readableUnits(), who).toHaveLength(1)
      unmount()
    }
  })
  it('Saber, the master admin: 142 "Your squadron" ticked, 149 "Full access"', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    expect(btn(container)).not.toBeNull()
    expect(num(container)).toBe('142')
    expect(container.querySelector('.mark.menu')).not.toBeNull()
    fireEvent.click(btn(container)!)
    expect(rowsOf()).toEqual(['142 Your squadron ✓', '149 Full access'])
    expect(btn(container)!.getAttribute('aria-expanded')).toBe('true')
  })
  it('Hunter with View of 149: 149 "View only"; with Plan of 149: "Full access"; in the member view "View only" again (D2253)', () => {
    give(ACCT.hunter, 'u149', 'view')
    signInAs('hunter')
    expect(menuSquadrons().map(r => `${r.num} ${r.label}`)).toEqual(['142 Your squadron', '149 View only'])
    give(ACCT.hunter, 'u149', 'plan')
    signInAs('hunter')
    expect(menuSquadrons().map(r => `${r.num} ${r.label}`)).toEqual(['142 Your squadron', '149 Full access'])
    act(() => { switchRoleView() })
    expect(menuSquadrons().map(r => `${r.num} ${r.label}`)).toEqual(['142 Your squadron', '149 View only'])
  })
  /* RE-POINTED 26 Nov 26 to his D2730 Q1 — "home squadron first, then the rest by number, in every list of squadrons":
     the menu stood by number (142 before 149) for Kestrel too; his own 149 now stands first */
  it('Kestrel, 149\'s admin, with View of 142: 149 "Your squadron" first, then 142 "View only" — his home first (D2730 Q1)', () => {
    give(ACCT.kestrel, 'u142', 'view')
    signInAs('kestrel')
    expect(menuSquadrons().map(r => `${r.num} ${r.label}`)).toEqual(['149 Your squadron', '142 View only'])
  })
  it('eight squadrons: Saber\'s menu has eight rows; Hunter, first admin of 150–155, has his home and those six', () => {
    signInAs('saber')
    const place = placeOfOn('u142', todayIso())!.id
    for (let n = 150; n <= 155; n++) expect(addUnit(String(n), place, ACCT.hunter), `${n} made`).toMatchObject({ ok: true })
    const { container, unmount } = render(<SqnMark />)
    fireEvent.click(btn(container)!)
    expect(rowsOf()).toEqual(['142 Your squadron ✓', '149 Full access', ...[150, 151, 152, 153, 154, 155].map(n => `${n} Full access`)])
    unmount()
    signInAs('hunter')
    expect(menuSquadrons().map(r => r.num)).toEqual(['142', '150', '151', '152', '153', '154', '155'])
  })
})

describe('a pick', () => {
  it('Saber picks 149: the mark reads 149, the tick moves, every page follows; nothing enters the Undo list', () => {
    signInAs('saber')
    const undo0 = _timelineEntries().length
    const { container } = render(<SqnMark />)
    fireEvent.click(btn(container)!)
    act(() => { fireEvent.click(document.querySelector<HTMLElement>('#sqnMenu .sqm-row[data-unit="u149"]')!) })
    expect(UNIT).toBe('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(num(container)).toBe('149')
    expect(document.querySelector('#sqnMenu'), 'the menu closes on a pick').toBeNull()
    expect(document.activeElement).toBe(btn(container))
    fireEvent.click(btn(container)!)
    expect(rowsOf()).toEqual(['142 Your squadron', '149 Full access ✓'])
    act(() => { fireEvent.click(document.querySelector<HTMLElement>('#sqnMenu .sqm-row[data-unit="u142"]')!) })
    expect(UNIT).toBe('u142')
    expect(_timelineEntries().length, 'a pick and back leaves the Undo list as it was').toBe(undo0)
  })
  it('Hunter with View of 149 picks it: the schedule pages show 149, his own pages stay 142\'s', () => {
    give(ACCT.hunter, 'u149', 'view')
    signInAs('hunter')
    const { container } = render(<SqnMark />)
    fireEvent.click(btn(container)!)
    act(() => { fireEvent.click(document.querySelector<HTMLElement>('#sqnMenu .sqm-row[data-unit="u149"]')!) })
    expect(pageUnit('schedule')).toBe('u149')
    expect(pageUnit('own')).toBe('u142')
    expect(num(container)).toBe('149')
  })
})

describe('its keys', () => {
  it('opened from the keys: the row in view takes the focus; the arrows move; Escape closes, focus back on the button', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    btn(container)!.focus()
    fireEvent.keyDown(btn(container)!, { key: 'ArrowDown' })
    const rows = [...document.querySelectorAll<HTMLElement>('#sqnMenu .sqm-row')]
    expect(document.activeElement).toBe(rows[0])
    fireEvent.keyDown(rows[0]!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(rows[1])
    fireEvent.keyDown(rows[1]!, { key: 'ArrowDown' })
    expect(document.activeElement, 'the arrows wrap round').toBe(rows[0])
    fireEvent.keyDown(rows[0]!, { key: 'End' })
    expect(document.activeElement).toBe(rows[1])
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(document.querySelector('#sqnMenu')).toBeNull()
    expect(document.activeElement).toBe(btn(container))
  })
  it('an outside press closes it, nothing picked', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    fireEvent.click(btn(container)!)
    expect(document.querySelector('#sqnMenu')).not.toBeNull()
    fireEvent.pointerDown(document.body)
    expect(document.querySelector('#sqnMenu')).toBeNull()
    expect(UNIT).toBe('u142')
  })
  /* [MSQ-TOPBAR-LIST-KEYS] (the re-walk of 23 Nov 26, N4): the list is hidden until it is placed, and a real browser will
     not focus a hidden row, so opened from the keys the focus stayed on the button. jsdom focuses it anyway, so the test
     reads what a browser reads: was the list still hidden when the row was asked to take the focus? Red first: 'hidden'. */
  it('opened by Enter, Space or an arrow: the ticked row is asked to take the focus only once the list is placed', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    const real = HTMLElement.prototype.focus
    const seen: string[] = []
    HTMLElement.prototype.focus = function (this: HTMLElement, o?: FocusOptions) {
      if (this.classList.contains('sqm-row')) seen.push(this.closest<HTMLElement>('#sqnMenu')!.style.visibility)
      real.call(this, o)
    }
    try {
      for (const open of [() => fireEvent.click(btn(container)!), () => fireEvent.keyDown(btn(container)!, { key: 'ArrowDown' }), () => fireEvent.keyDown(btn(container)!, { key: 'ArrowUp' })]) {
        seen.length = 0
        btn(container)!.focus()
        open()
        expect(seen.length, 'a row was asked to take the focus').toBeGreaterThan(0)
        expect(seen, 'never while the list is still hidden').not.toContain('hidden')
        expect(document.activeElement).toBe(document.querySelector('#sqnMenu .sqm-row[aria-checked="true"]'))
        fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
      }
    } finally { HTMLElement.prototype.focus = real }
  })
  it('Shift+Tab out past the page\'s start closes the list (the focus goes nowhere in the page)', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    btn(container)!.focus()
    fireEvent.keyDown(btn(container)!, { key: 'ArrowDown' })
    const row = document.querySelector<HTMLElement>('#sqnMenu .sqm-row[aria-checked="true"]')!
    fireEvent.keyDown(row, { key: 'Tab', shiftKey: true })
    act(() => { row.blur() })
    expect(document.querySelector('#sqnMenu'), 'the list closed').toBeNull()
  })
  it('the window losing the focus, with no Tab pressed, leaves the list open', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    btn(container)!.focus()
    fireEvent.keyDown(btn(container)!, { key: 'ArrowDown' })
    const row = document.querySelector<HTMLElement>('#sqnMenu .sqm-row[aria-checked="true"]')!
    act(() => { row.blur() })
    expect(document.querySelector('#sqnMenu'), 'still open').not.toBeNull()
  })
  it('a Tab finished inside the list, then the window losing the focus: still open', () => {
    signInAs('saber')
    const { container } = render(<SqnMark />)
    btn(container)!.focus()
    fireEvent.keyDown(btn(container)!, { key: 'ArrowDown' })
    const row = document.querySelector<HTMLElement>('#sqnMenu .sqm-row[aria-checked="true"]')!
    fireEvent.keyDown(row, { key: 'Tab' })
    fireEvent.keyUp(row, { key: 'Tab' })
    act(() => { row.blur() })
    expect(document.querySelector('#sqnMenu')).not.toBeNull()
  })
})
