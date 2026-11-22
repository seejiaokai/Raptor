// @vitest-environment jsdom
/* ADMIN → SQUADRON CONFIG FOLLOWS THE SQUADRON IN VIEW (his D2317, 22 Nov 26; the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §9 F1; the approved drawings
   docs/mock/2026-11-22-msq-b1-screens/img/f1a-d.png, f1a-p.png, f1b-d.png — draw-f.mjs f1). Its templates and default
   arrangement are the schedule in view's (they load with that squadron's settings); its heading names the squadron
   ("Squadron config · 149"); only an admin of that squadron changes it (the "schedule" kind of step A — perms.ts
   maySchedEditPage, read through auth.ts canEditSched); anyone else sees every control greyed under the line "This is
   149's set-up. Only an admin of 149 can change it." Hunter (142's admin, View of 149 given by Saber) picks 149: greyed,
   the line; picks 142 again: his to change, "· 142", no line. Kestrel (149's admin) on 149: his to change.
   Red first: before the fix the heading read "Squadron config" and only the list's end arrows were greyed. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { pickSquadron } from '../state/pick'
import { notify } from '../state/store'
import { UNIT } from '../engine/unitview'
import { secDefault } from '../engine'
import { AdminPage } from './AdminPage'

useMsqWorld()
afterEach(() => cleanup())

const LINE = "This is 149's set-up. Only an admin of 149 can change it."
function openConfig() {
  const page = render(<AdminPage />)
  const c = page.container
  const cat = [...c.querySelectorAll('button.adm-cat')].find(b => /Squadron config/.test(b.textContent || '')) as HTMLElement
  act(() => { fireEvent.click(cat) })
  const sec = c.querySelector('#admConfig') as HTMLElement
  const ctl = [...sec.querySelectorAll('button, input, select, textarea')] as HTMLButtonElement[]
  return {
    c, sec, ctl,
    head: (c.querySelector('.adm-pane-head h3') as HTMLElement).textContent,
    line: (c.querySelector('#admCfgRo') as HTMLElement | null)?.textContent ?? null,
    greyed: ctl.filter(b => b.disabled).length,
  }
}
function hunterViewOf149() {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } }), 'View of 149 given').toBeNull()
  signInAs('hunter')
  expect(UNIT).toBe('u142')
}

describe('Admin → Squadron config follows the squadron in view (D2317)', () => {
  it('f1a — Hunter with View of 149, 149 picked: "· 149", the line, every control greyed', () => {
    hunterViewOf149()
    act(() => { void pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    const p = openConfig()
    expect(p.head).toBe('Squadron config · 149')
    expect(p.line).toBe(LINE)
    expect(p.ctl.length, 'the arrows, the reset and the three template buttons').toBeGreaterThanOrEqual(10)
    expect(p.greyed, 'every control greyed').toBe(p.ctl.length)
    /* the line is the panel's first thing, above "Default arrangement", as drawn */
    expect(p.sec.firstElementChild!.id).toBe('admCfgRo')
    /* and a press does nothing: the order stays 149's own */
    const before = secDefault().join()
    const down = p.sec.querySelector('#admSecDefault [aria-label^="Move"][aria-label$="down"]') as HTMLButtonElement
    act(() => { fireEvent.click(down) })
    expect(secDefault().join()).toBe(before)
  })
  it('f1b — the same Hunter with 142 picked again: "· 142", no line, his to change', () => {
    hunterViewOf149()
    act(() => { void pickSquadron('u149') })
    act(() => { void pickSquadron('u142') })
    expect(UNIT).toBe('u142')
    act(() => { notify() })
    const p = openConfig()
    expect(p.head).toBe('Squadron config · 142')
    expect(p.line).toBeNull()
    /* only the list's own end arrows are greyed (the first row's ▲ and the last row's ▼ of each list) */
    expect(p.greyed).toBeLessThanOrEqual(4)
    for (const id of ['#admDutyTpl', '#admDayTpl', '#admWaveTpl', '#admSecDefReset']) {
      expect((p.c.querySelector(id) as HTMLButtonElement).disabled, id).toBe(false)
    }
  })
  it('Kestrel, 149\'s own admin, on 149: "· 149" and his to change', () => {
    signInAs('kestrel')
    expect(UNIT).toBe('u149')
    const p = openConfig()
    expect(p.head).toBe('Squadron config · 149')
    expect(p.line).toBeNull()
    expect((p.c.querySelector('#admDutyTpl') as HTMLButtonElement).disabled).toBe(false)
  })
})
