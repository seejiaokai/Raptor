// @vitest-environment jsdom
/* THE BELL'S TAP ACROSS SQUADRONS (batch 1's second half, the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §7 item 5 (R9), §15 D3, §16 D3′; his D2325 — picture
   f9's words "1 waiting for access to 149").
   - D3: the bell's access branch takes the newest unseen request among the squadrons switched on in his bell, enters its
     squadron when it is not the page's, then opens Admin → Users, the toast naming it; the bell's alert counts requests
     of switched-on squadrons only (the Admin tab's and drawer's badges count the page's squadron's — waitingCount, held by
     state/request-squadron.test.ts).
   - R9: a tap on a line of another squadron enters it and then lands — only where he may open that squadron's own pages
     (a Plan holder of it, a master admin, his home); where he may not, the line is only read and nothing opens, never
     his own squadron's page at that line's day.
   Red first on the code before the change. */
import { describe, it, expect, vi } from 'vitest'
import { useMsqWorld, signInAs, ACCT, PID, on } from '../test-support/msq-world'
import { requestAccess, accountsLoad, requestByName, saveAccess, markRequestsSeen } from '../state/accounts'
import { setBellSquadron } from '../state/bellsqn'
import { bellAccessAlert } from '../state/belltap'
import { pageUnit, lwUnitNow } from '../state/perms'
import { enterSquadron } from '../state/store'
import { UNIT } from '../engine/unitview'
import { CURPAGE, ADMINOPEN, setPage } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { bellTap, bellOn, bellListOpen, closeBellList, openNotice } from './topstate'
import type { Notice } from '../state/notices'

useMsqWorld()

function ask(name: string, cs: string, unit: string): string {
  signInAs(name)
  expect(requestAccess({ cs, ini: 'JB', seat: 'FCP', cat: 'C' }, unit), `${name}'s request`).toBeNull()
  accountsLoad()
  return requestByName(name)!.id
}
const toasts = (): string[] => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
function givePlan(acct: string, unit = 'u149', level: 'plan' | 'view' = 'plan'): void {
  signInAs('saber')
  expect(saveAccess(acct, { grants: { [unit]: level } })).toBeNull()
}
/* a line of his bell, made here: the tap is what is tested, not how the line was written */
function line(to: string, u: string, part: any, extra: Partial<Notice> = {}): Notice {
  return { id: 'tl' + Math.random().toString(36).slice(2), to, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15',
    what: [part], u, ...extra } as Notice
}

describe('§15 D3 — an access request of another squadron', () => {
  it('Hunter with Plan of 149, on 142\'s pages: one tap lands on 149\'s Waiting list, the toast naming 149', () => {
    givePlan(ACCT.hunter)
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    setPage('viewsched')
    expect(pageUnit('own')).toBe('u142')
    expect(bellOn()).toBe(true)
    bellTap()
    expect(UNIT).toBe('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(CURPAGE).toBe('admin')
    expect(ADMINOPEN).not.toBeNull()
    expect(toasts()).toContain('1 waiting for access to 149')
    /* the list on screen marks it seen (UsersPanel's effect — the requests shown, the page's squadron's) */
    expect(markRequestsSeen()).toBeNull()
    expect(bellAccessAlert()).toBe(false)
    /* the next tap opens the bell's own list */
    closeBellList()
    bellTap()
    expect(bellListOpen()).toBe(true)
  })
  it('a request of the page\'s own squadron moves nothing', () => {
    ask('newb@mail', 'NEWB', 'u142')
    signInAs('hunter')
    bellTap()
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('admin')
    expect(toasts()).toContain('1 waiting for access to 142')
  })
  it('the newest among the switched-on squadrons is the one opened', () => {
    givePlan(ACCT.hunter)
    on(15, 9)
    ask('old@mail', 'OLDY', 'u142')
    on(15, 10)
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    bellTap()
    expect(UNIT).toBe('u149')
    expect(toasts()).toContain('1 waiting for access to 149')
  })
  it('149 switched off in his bell: the tap takes 142\'s, and 149\'s alone does not light the bell', () => {
    givePlan(ACCT.hunter)
    on(15, 9)
    ask('old@mail', 'OLDY', 'u142')
    on(15, 10)
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('hunter')
    expect(setBellSquadron('u149', false)).toBe(true)
    bellTap()
    expect(UNIT).toBe('u142')
    expect(toasts()).toContain('1 waiting for access to 142')
    expect(markRequestsSeen()).toBeNull()
    /* only 149's is left unseen, and 149 is switched off: no alert */
    expect(bellAccessAlert()).toBe(false)
  })
  it('a master admin: 149 is off by default (D2198) — its request lights nothing until he switches 149 on', () => {
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('saber')
    expect(bellAccessAlert()).toBe(false)
    expect(setBellSquadron('u149', true)).toBe(true)
    expect(bellAccessAlert()).toBe(true)
    bellTap()
    expect(UNIT).toBe('u149')
    expect(CURPAGE).toBe('admin')
    expect(toasts()).toContain('1 waiting for access to 149')
  })
  it('149\'s own admin is told as before', () => {
    ask('newb@mail', 'NEWB', 'u149')
    signInAs('kestrel')
    expect(bellAccessAlert()).toBe(true)
    bellTap()
    expect(UNIT).toBe('u149')
    expect(toasts()).toContain('1 waiting for access to 149')
  })
})

describe('R9 — a line of another squadron', () => {
  it('a 149 posting line, Hunter with Plan of 149 on 142\'s pages: 149 entered, Admin → Users at the man\'s row', () => {
    givePlan(ACCT.hunter)
    signInAs('hunter')
    setPage('viewsched')
    openNotice(line(PID.hunter, 'u149', { k: 'po', who: PID.osprey, o: 'none' }))
    expect(UNIT).toBe('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(CURPAGE).toBe('admin')
    expect(ADMINOPEN?.person).toBe(PID.osprey)
  })
  it('a 149 Leave War line: 149 entered, its war loaded, the Leave War opened', () => {
    givePlan(ACCT.hunter)
    signInAs('hunter')
    setPage('viewsched')
    openNotice(line(PID.hunter, 'u149', { k: 'lwopen', a: '2026-07-20', b: '2026-07-24' }))
    expect(UNIT).toBe('u149')
    expect(lwUnitNow()).toBe('u149')
    expect(CURPAGE).toBe('leavewar')
  })
  it('a 149 line where he may not open 149\'s pages (View of 149 only): read, nothing opened, nothing entered', () => {
    givePlan(ACCT.hunter, 'u149', 'view')
    signInAs('hunter')
    setPage('viewsched')
    openNotice(line(PID.hunter, 'u149', { k: 'lwopen', a: '2026-07-20', b: '2026-07-24' }))
    expect(UNIT).toBe('u142')
    expect(lwUnitNow()).toBe('u142')
    expect(CURPAGE).toBe('viewsched')
    openNotice(line(PID.hunter, 'u149', { k: 'po', who: PID.osprey, o: 'none' }))
    expect(CURPAGE).toBe('viewsched')
    expect(ADMINOPEN).toBeNull()
  })
  /* rewritten by his D2381 (23 Nov 26): 149 he only views offers no Admin, so opening his own Admin page from the bell
     brings 142 back into view, the page opened (store.ts landOnOfferedPage) */
  it('a View holder on 149\'s schedule tapping a 142 line: his own pages are 142\'s — 142 comes back, Admin opened at the line', () => {
    givePlan(ACCT.hunter, 'u149', 'view')
    signInAs('hunter')
    enterSquadron('u149', false)
    expect(UNIT).toBe('u149')
    expect(pageUnit('own')).toBe('u142')
    openNotice(line(PID.hunter, 'u142', { k: 'po', who: PID.ranger, o: 'none' }))
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('admin')
    expect(ADMINOPEN?.person).toBe(PID.ranger)
  })
  it('a line of no squadron (stored before, D56) opens as before', () => {
    signInAs('hunter')
    setPage('viewsched')
    const n = line(PID.hunter, 'u142', { k: 'po', who: PID.ranger, o: 'none' })
    delete (n as any).u
    openNotice(n)
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('admin')
  })
  it('a toast is never shown for a line that opens nothing (no new words — D1625)', () => {
    givePlan(ACCT.hunter, 'u149', 'view')
    signInAs('hunter')
    const before = toasts().length
    openNotice(line(PID.hunter, 'u149', { k: 'lwopen', a: '2026-07-20', b: '2026-07-24' }))
    expect(toasts().length).toBe(before)
    vi.clearAllMocks()
  })
})
