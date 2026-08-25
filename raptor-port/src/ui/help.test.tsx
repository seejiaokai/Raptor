// @vitest-environment jsdom
/* The Help page + bug reports (owner, 25 Aug 26 — "a new tab called Help,
   inside it allows anyone to type in Bug reports. In which admin can view
   them … categories … the alarm notification will be highlighted … date
   indicated … sorted accordingly to latest input then oldest"). The pins:
   - the tab is in BOTH navs for every role; Admin still sits last;
   - anyone files with a category; a blank description files nothing;
   - the admin list is newest first with the date on every row;
   - a member sees the form and their own receipts, never the admin list;
   - the bell lights for an admin with unseen reports (not for a member),
     and the admin OPENING the Help page is what puts it out;
   - reports survive a logout/login — data, not view state. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { REPORTS, BUG_CATS, fileReport, reportRows, unseenReports, bugAlert } from '../state/reports'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const asAdmin = () => act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
const asMember = () => act(async () => { setSession({ user: 'user', role: 'main' }); notify() })

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
})

beforeEach(async () => {
  REPORTS.length = 0
  await asAdmin()
  await act(async () => { setPage('viewsched'); notify() })
})

describe('the store', () => {
  it('files with a category, refuses a blank description, trims', () => {
    expect(fileReport(BUG_CATS[0]!, '   ')).toBeNull()
    expect(fileReport('not a category', 'real text')).toBeNull()
    const r = fileReport(BUG_CATS[1]!, '  the board jumped  ')!
    expect(r.text).toBe('the board jumped')
    expect(r.seen).toBe(false)
    expect(REPORTS.length).toBe(1)
  })

  it('lists newest first, whatever order they were filed in', () => {
    const a = fileReport(BUG_CATS[0]!, 'first')!; a.t = 1000
    const b = fileReport(BUG_CATS[0]!, 'second')!; b.t = 3000
    const c = fileReport(BUG_CATS[0]!, 'third')!; c.t = 2000
    expect(reportRows().map(r => r.text)).toEqual(['second', 'third', 'first'])
  })

  it('the bell alert is admin-only unseen', async () => {
    fileReport(BUG_CATS[0]!, 'squeak')
    expect(unseenReports()).toBe(1)
    expect(bugAlert()).toBe(true)
    await asMember()
    expect(bugAlert(), 'a member filed it — their bell stays dark').toBe(false)
  })
})

describe('the Help tab', () => {
  it('is in both navs for a member, and Admin still sits last for an admin', async () => {
    await asMember()
    expect(($('#topnav a[data-page="help"]') as any).hidden).toBeFalsy()
    await click($('#burger'))
    expect($('#drawerNav a[data-page="help"]')).toBeTruthy()
    await click($('#drawer'))
    await asAdmin()
    const tabs = $$('#topnav a[data-page]')
    expect(tabs[tabs.length - 1]!.dataset.page).toBe('admin')
    expect(tabs[tabs.length - 2]!.dataset.page).toBe('help')
  })

  it('a member files from the form; a blank Send toasts and files nothing', async () => {
    await asMember()
    await act(async () => { setPage('help'); notify() })
    expect($('#bugAdmin'), 'no admin list for a member').toBeFalsy()
    await click($('#bugSend'))
    expect(REPORTS.length).toBe(0)
    ;($('#bugCat') as HTMLSelectElement).value = 'Leave War'
    ;($('#bugText') as HTMLTextAreaElement).value = 'my leave vanished'
    await click($('#bugSend'))
    expect(REPORTS.length).toBe(1)
    expect(REPORTS[0]!.cat).toBe('Leave War')
    expect(($('#bugText') as HTMLTextAreaElement).value, 'the box clears after sending').toBe('')
    expect($('#bugMine'), 'the member sees their own receipt').toBeTruthy()
    expect($('#bugMine .bugrow .bugtext')!.textContent).toBe('my leave vanished')
  })

  it('the admin list shows category, date and text, newest first, and opening it clears the bell', async () => {
    await act(async () => {
      const a = fileReport('Speed & loading', 'slow monday')!; a.t = Date.UTC(2026, 0, 5, 4)
      const b = fileReport('Leave War', 'bids stuck')!; b.t = Date.UTC(2026, 6, 14, 4)
      notify()   // filing always rides a notify in the app (HelpPage.send)
    })
    expect(bugAlert(), 'unseen reports light the admin bell').toBe(true)
    expect($('#notifyBell').classList.contains('on')).toBe(true)
    await act(async () => { setPage('help'); notify() })
    const rows = $$('#bugList .bugrow')
    expect(rows.length).toBe(2)
    expect(rows[0]!.querySelector('.bugtext')!.textContent, 'newest first').toBe('bids stuck')
    expect(rows[0]!.querySelector('.bugcat')!.textContent).toBe('Leave War')
    expect(rows[0]!.querySelector('.bugwhen')!.textContent).toMatch(/14\/7|13\/7/)  // date shown (TZ-tolerant)
    expect(rows[0]!.querySelector('.bugnew'), 'unseen rows are badged NEW this visit').toBeTruthy()
    /* opening the page IS the acknowledgement */
    expect(unseenReports()).toBe(0)
    expect(bugAlert()).toBe(false)
    expect($('#notifyBell').classList.contains('on')).toBe(false)
  })

  it('the bell tap with a bug alert goes to Help', async () => {
    fileReport(BUG_CATS[0]!, 'squeak')
    await click($('#notifyBell'))
    expect($('#page-help').classList.contains('on')).toBe(true)
    expect(unseenReports(), 'arriving on the page marks it seen').toBe(0)
  })

  it('reports survive a logout/login — data, not view state', async () => {
    fileReport(BUG_CATS[0]!, 'filed before the switch')
    await asMember()
    await asAdmin()
    expect(REPORTS.length).toBe(1)
    expect(unseenReports()).toBe(1)
  })
})
