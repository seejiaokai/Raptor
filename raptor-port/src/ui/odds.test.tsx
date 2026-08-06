// @vitest-environment jsdom
/* The remaining odds — the mobile drawer, Manage users, fast-sync toggle,
   Export to Excel (schedRows), the airspace/traffic popup (the tr: funnel)
   and the board's roster resize grip. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK, setCurWeek, WEEKS } from '../engine/waves'
import { SCHED } from '../engine/publish'
import { USERS } from '../state/users'
import { schedRows } from './export'
import { openScheduler, closeScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

describe('the mobile drawer', () => {
  it('the burger opens it; the Logic page is reachable from both navs', async () => {
    await click($('#burger'))
    expect($('#drawer').classList.contains('open')).toBe(true)
    expect(/Logic/.test($('#drawerNav').textContent!)).toBe(true)
    expect($('.nav a[data-page="logic"]')).toBeTruthy()
  })

  it('an admin sees the Edit tab in the drawer, and a nav tap switches page and closes it', async () => {
    expect($('#drawerNav a[data-page="editsched"]')).toBeTruthy()
    await click($('#drawerNav a[data-page="quals"]'))
    expect($('#drawer').classList.contains('open')).toBe(false)
    expect($('#page-quals').classList.contains('on')).toBe(true)
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
  })

  it('a week chip re-labels the week and closes the drawer', async () => {
    const other = WEEKS.find((w: any) => w.v !== CURWEEK)!
    await click($('#burger'))
    await click($(`#drawerWeeks [data-wk="${other.v}"]`))
    expect(CURWEEK === other.v || (await import('../engine/waves')).CURWEEK === other.v).toBe(true)
    expect($('#drawer').classList.contains('open')).toBe(false)
    expect(($('#dateVField') as HTMLInputElement).value).toBe(other.v)
    /* every chip pair follows the choice */
    expect($$(`[data-wk="${other.v}"]`).every(x => x.classList.contains('on'))).toBe(true)
    setCurWeek('13/07/2026'); await act(async () => { notify() })
  })

  it('a member drawer hides the Edit tab', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    await click($('#burger'))
    expect($('#drawerNav a[data-page="editsched"]')).toBeFalsy()
    expect($('#drawerNav a[data-page="logic"]')).toBeTruthy()   // a squadron member sees it too
    await click($('#drawer'))    // tap the backdrop
    expect($('#drawer').classList.contains('open')).toBe(false)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})

describe('Manage users', () => {
  it('opens from the topbar, lists the users with their roles', async () => {
    await click($('#manageUsers'))
    expect($('#userModal')).toBeTruthy()
    expect(($('#userModal') as any).hidden).toBeFalsy()
    expect($$('#userList .urow').length).toBe(USERS.length)
    expect(/Admin/.test($('#userList').textContent!)).toBe(true)
  })

  it('adds a user from the fields, removes one by row', async () => {
    const n = USERS.length
    ;($('#newName') as HTMLInputElement).value = 'Viper'
    ;($('#newRole') as HTMLSelectElement).value = 'main'
    await click($('#userAdd'))
    expect(USERS.length).toBe(n + 1)
    expect(USERS[USERS.length - 1].name).toBe('Viper')
    expect($$('#userList .urow').length).toBe(n + 1)
    await click($(`#userList [data-deluser="${n}"]`))
    expect(USERS.length).toBe(n)
    await click($('#userCancel'))
    expect(($('#userModal') as any).hidden).toBe(true)
  })
})

describe('fast sync + export', () => {
  it('the fast-sync toggle flips its label', async () => {
    expect($('#syncLbl').textContent).toBe('Sync · slow')
    await click($('#fastSync'))
    expect($('#syncLbl').textContent).toBe('Sync · 1 s')
    expect($('#fastSync').classList.contains('on')).toBe(true)
    await click($('#fastSync'))
    expect($('#syncLbl').textContent).toBe('Sync · slow')
  })

  it('schedRows flattens every aircraft with a brief 140 min before T/O', () => {
    const rows = schedRows()
    const nAc = DAYS.reduce((n: number, d: any) => n + (d.waves || []).reduce((m: number, w: any) =>
      m + w.formations.reduce((k: number, f: any) => k + f.aircraft.length, 0), 0), 0)
    expect(rows.length).toBe(nAc + 1)                            // + the header
    expect(rows[0]![0]).toBe('Day')
    const r = rows[1]!
    expect(r[6]).toMatch(/^\d\d:\d\d$/)                          // TO
    expect(r[5]).toMatch(/^\d\d:\d\d$/)                          // Brief = TO - 140
    const [bh, bm] = String(r[5]).split(':').map(Number), [th, tm] = String(r[6]).split(':').map(Number)
    expect((th! * 60 + tm!) - (bh! * 60 + bm!)).toBe(140)
    expect($('#exportSched')).toBeTruthy()
  })
})

describe('the airspace popup (tr: funnel)', () => {
  it('the Traffic button opens it with the wave label', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const btn = $('#eWeek [data-air]')
    expect(btn).toBeTruthy()
    await click(btn)
    expect($('#airpop')).toBeTruthy()
    expect(($('#airpop') as any).hidden).toBeFalsy()
    expect(/Traffic ·/.test($('#airTitle').textContent!)).toBe(true)
  })

  it('an admin gets editable rows; Add row books traffic AND marks the tr: key pending', async () => {
    const key = $('#eWeek [data-air]').dataset.air!
    const [di, gi] = key.split('|').map(Number)
    const g = DAYS[di!].waves[gi!]
    const n = (g.traffic || []).length
    await click($('#airAdd'))
    expect(g.traffic.length).toBe(n + 1)
    expect(SCHED.pending[`tr:${di}.${gi}`]).toBeTruthy()
    expect($$('#airBody [data-airi]').length).toBe(n + 1)
  })

  it('editing a row writes through; deleting removes it', async () => {
    const key = $('#eWeek [data-air]').dataset.air!
    const [di, gi] = key.split('|').map(Number)
    const g = DAYS[di!].waves[gi!]
    const inp = $$('#airBody [data-airi]').pop() as HTMLInputElement
    await act(async () => {
      inp.value = '2 X 4 / WSAT / 1130-1300 / 14K-28K'
      inp.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(g.traffic[g.traffic.length - 1]).toBe('2 X 4 / WSAT / 1130-1300 / 14K-28K')
    const n = g.traffic.length
    await click($$('#airBody [data-airdel]').pop()!)
    expect(g.traffic.length).toBe(n - 1)
    await click($('#airDone'))
    expect(($('#airpop') as any).hidden).toBe(true)
  })

  it('a member sees a read-only view — no inputs, no foot', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    await click($('#vWeek [data-air]') || $('[data-air]'))
    expect($$('#airBody input').length).toBe(0)
    expect($('#airAdd')).toBeFalsy()
    await click($('#airClose'))
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* The read-only branch used to interpolate the traffic string raw while the
     admin branch three lines above it escaped — and airspace shorthand really
     does carry a bare `<` ("<090 inbound"), which swallowed the rest of the
     list for every member reading it. */
  it('the read-only view escapes a traffic line — markup renders as text', async () => {
    const key = $('#eWeek [data-air]')?.dataset.air || $('[data-air]')!.dataset.air!
    const [di, gi] = key.split('|').map(Number)
    const g = DAYS[di!].waves[gi!]
    g.traffic = ['<b>INJECTED</b> / <090 inbound']
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    await click($('#vWeek [data-air]') || $('[data-air]'))
    const body = $('#airBody')
    expect(body.querySelector('b'), 'the angle brackets stay text, not markup').toBeNull()
    expect(body.textContent).toContain('<b>INJECTED</b> / <090 inbound')
    await click($('#airClose'))
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    g.traffic = []
  })
})

describe('the roster resize grip (B25)', () => {
  it('exists on the board, drags as vh, double-tap resets', async () => {
    await act(async () => { openScheduler(0) })
    const grip = $('#sbGrip')
    expect(grip).toBeTruthy()
    expect($('#sbSide')).toBeTruthy()
    /* drag up 100px → the roster grows by 100/vh */
    await act(async () => {
      grip.dispatchEvent(new MouseEvent('pointerdown', { clientY: 500, bubbles: true }))
      grip.dispatchEvent(new MouseEvent('pointermove', { clientY: 400, bubbles: true }))
      grip.dispatchEvent(new MouseEvent('pointerup', { clientY: 400, bubbles: true }))
    })
    const v1 = parseFloat(document.documentElement.style.getPropertyValue('--sbside'))
    expect(v1).toBeGreaterThan(40)
    /* double-tap (dblclick) goes back to 40vh */
    await act(async () => { grip.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })) })
    expect(document.documentElement.style.getPropertyValue('--sbside')).toBe('40vh')
    await act(async () => { closeScheduler() })
  })
})
