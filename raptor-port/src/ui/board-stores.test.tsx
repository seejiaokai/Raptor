// @vitest-environment jsdom
/* Same preamble as src/ui/stores-edit.test.tsx — there is no shared helper
   module in this repo; each *.test.tsx defines its own. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, resetSession, notify, setPage } from '../state/store'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
})

/* every test sets up its own session/page from scratch — none of these may
   assume a previous test's DOM or state, so each passes with `-t` in
   isolation, not only as part of the describe block */
const openBoard = async () => {
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await click($('.sb-open'))
}

describe('the board carries the week\'s stores interface', () => {
  it('a flying line has exactly nine grid items, and the chips live inside the ninth', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openBoard(); await act(async () => notify())
    const line = $('#schedBoard .sb-line')
    expect(line, 'the line exists').toBeTruthy()
    /* the whole point of .sb-rcell: wrapping the input, the chips and C must
       not grow the line past the nine columns the desktop and phone grid
       templates both assume — a tenth child or a split .sb-rcell passes
       every other assertion here and still breaks the template */
    expect(line.children.length, 'still exactly nine grid items').toBe(9)
    const cell = line.querySelector('.sb-rcell') as HTMLElement
    expect(cell, 'the remarks input is wrapped in a cell').toBeTruthy()
    expect(cell.querySelector('.nts'), 'the remarks input is inside it').toBeTruthy()
    expect(cell.querySelector('.stores'), 'so are the stores').toBeTruthy()
    expect(cell.querySelector('.stcfg'), 'and so is C').toBeTruthy()
  })

  it('C on the board opens the same popup the week opens', async () => {
    await openBoard()
    await click($('#schedBoard .sb-line .stcfg[data-stcfg]'))
    expect(document.querySelector('.stmenu'), 'one popup builder, both surfaces').toBeTruthy()
    expect(document.querySelectorAll('.stmenu [data-cfg]').length).toBeGreaterThan(0)
  })

  it('an already-open board goes read-only for stores once the page becomes viewsched', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openBoard()
    await act(async () => notify())
    expect($('#schedBoard .sb-line .stcfg'), 'edit mode still shows C before the page changes').toBeTruthy()
    /* SchedBoard's `hidden` only tracks SBDAY, never CURPAGE, so the board
       modal survives a nav click underneath it — set the page directly
       rather than depend on a stale .sb-open click, which is inert once
       CURPAGE isn't 'editsched' (ViewWeek's own day markup has no .sb-open
       at all — only .di-open — so this state is reached by leaving a board
       open and navigating away, never by opening one from the view page). */
    await act(async () => { setPage('viewsched'); notify() })
    expect($('#schedBoard .sb-line .stores'), 'a duty crew sees what the jet carries').toBeTruthy()
    expect(document.querySelector('#schedBoard .sb-line .stcfg'), 'but cannot edit it').toBeFalsy()
    await act(async () => { setPage('editsched'); notify() })
  })

  it('a duty-crew session (role main) never gets C on the board, independent of page', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    /* a 'main' role can never reach the board through the UI — canEditSched()
       gates the .sb-open click and Edit Schedule is hidden from the nav for
       a non-admin — so this opens it directly, the same way other suites
       exercise the board without the click path (board.test.tsx, odds.test.tsx).
       resetSession is the real login/logout entry point (state/store.ts) and
       intentionally drops CURPAGE to 'viewsched' and closes any open board;
       openScheduler puts one back so the render gate — not the click gate —
       is what this test is proving. */
    await act(async () => { resetSession({ user: 'user', role: 'main' }) })
    await act(async () => { openScheduler(0); notify() })
    expect($('#schedBoard .sb-line .stores'), 'a duty crew still sees what the jet carries').toBeTruthy()
    expect(document.querySelector('#schedBoard .sb-line .stcfg'), 'role, not just page, keeps C off').toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
