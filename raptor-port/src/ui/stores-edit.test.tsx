// @vitest-environment jsdom
/* There is NO shared UI test helper in this repo — every *.test.tsx defines
   its own $ / $$ / click and boots the app in beforeAll. This preamble is
   src/ui/interact.test.tsx:16-32 verbatim, plus the fake storeBackend the
   engine needs headless. Do not extract a helper module for this. */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { storeBackend } from '../engine/hooks'
import { STORE_CFG, storesReset } from '../engine/stores'
import { SCHED } from '../engine/publish'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

const mem: Record<string, string> = {}
const editTab = () => $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!
const openPen = async () => {
  await click(editTab())
  await click($('#eWeek .stcfg[data-stcfg]'))
  await click(document.querySelector('.stmenu .st-pen') as HTMLElement)
}

beforeAll(async () => {
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

/* the list is module state, so each test starts from the standard six —
   any open popup is dropped, or the next openPen finds two — and the
   amendment list is cleared too, or a mark left by one test survives to
   forge the "no mark landed" check in the next one (the vacuous-test bug
   this file shipped with: every popup here opens the SAME jet, di.gi.li.ai
   0.0.0.0, so a stray markEdit and an old one write the identical pending
   key — a key COUNT never moves on a repeat, only presence/absence does). */
beforeEach(async () => {
  Object.keys(mem).forEach(k => delete mem[k])
  document.querySelectorAll('.stmenu').forEach(x => x.remove())
  storesReset()
  Object.keys(SCHED.pending).forEach(k => delete SCHED.pending[k])
  await act(async () => notify())
})

/* every popup opened in this file is DAYS[0].waves[0].formations[0].aircraft[0],
   so this is the one and only key a stray markEdit from it could ever write */
const AC_KEY = 'st:0.0.0.0'

describe('the pen edits the LIST, not the schedule', () => {
  /* AC_KEY above is a hidden assumption — that the FIRST .stcfg on the edit
     week is jet 0.0.0.0 — that every "...is not a schedule edit" test below
     leans on without checking it. If seed data or day ordering ever moves
     that jet, AC_KEY would quietly point at a key markEdit never touches,
     and every one of those assertions would pass for the wrong reason —
     exactly the vacuity this whole file was rewritten to close. Pin it. */
  it('AC_KEY names the jet the first C button actually opens', async () => {
    await click(editTab())
    expect($('#eWeek .stcfg[data-stcfg]').dataset.stcfg).toBe('0.0.0.0')
  })

  it('renaming changes the label and never the key', async () => {
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = '2 TANKS'
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TANKS'])
    expect(STORE_CFG.some(([k]) => k === '2tanks')).toBe(false)
  })

  it('a rename never reaches the amendment list', async () => {
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = 'RENAMED'
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(SCHED.pending[AC_KEY], 'renaming the list is not a schedule edit').toBeUndefined()
  })

  it('removing a store leaves the jets that carry it untouched, and is not a schedule edit', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openPen()
    await click(document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-del') as HTMLElement)
    expect(STORE_CFG.some(([k]) => k === 'tk2')).toBe(false)
    expect(a.opts.tk2, 'the jet keeps it — add the store back and the chip returns').toBe(true)
    expect(SCHED.pending[AC_KEY], 'removing from the list is not a schedule edit').toBeUndefined()
  })

  it('adding appends and persists, and is not a schedule edit', async () => {
    await openPen()
    const box = document.querySelector('.stmenu .st-new') as HTMLInputElement
    box.value = 'LGB'
    await act(async () => { box.dispatchEvent(new Event('change', { bubbles: true })) })
    await click(document.querySelector('.stmenu .st-add') as HTMLElement)
    expect(STORE_CFG[STORE_CFG.length - 1]).toEqual(['lgb', 'LGB'])
    expect(JSON.parse(mem['sqn142_stores']!).pop()).toEqual(['lgb', 'LGB'])
    expect(SCHED.pending[AC_KEY], 'adding to the list is not a schedule edit').toBeUndefined()
  })

  it('the up arrow reorders and persists, and is not a schedule edit', async () => {
    await openPen()
    await click(document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-up') as HTMLElement)
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'tk2', 'nc', 'tks3', 'tpod', 'cl'])
    expect(JSON.parse(mem['sqn142_stores']!).map((r: any) => r[0]))
      .toEqual(['nav', 'tk2', 'nc', 'tks3', 'tpod', 'cl'])
    expect(SCHED.pending[AC_KEY], 'reordering the list is not a schedule edit').toBeUndefined()
  })

  it('opening and closing the pen is not a schedule edit', async () => {
    await click(editTab())
    await click($('#eWeek .stcfg[data-stcfg]'))
    await click(document.querySelector('.stmenu .st-pen') as HTMLElement)   // open
    expect(SCHED.pending[AC_KEY], 'opening the pen is not a schedule edit').toBeUndefined()
    await click(document.querySelector('.stmenu .st-pen') as HTMLElement)   // close
    expect(SCHED.pending[AC_KEY], 'closing the pen is not a schedule edit').toBeUndefined()
  })

  /* Deleting `if (pen) return` from the outside-click handler still left this
     file green when it read `.st-lab` inside the box — the box's own click
     handler stopPropagation()s before the click ever reaches document, and
     box.contains(ev.target) would have caught it first regardless. Dispatch
     the outside click on document.body itself, the only way to actually
     exercise the document-level listener the pen suspends. */
  it('the outside-click dismiss is suspended while the pen is open, and resumes once it closes', async () => {
    const outside = async () => { await act(async () => {
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })) }) }
    await click(editTab())
    await click($('#eWeek .stcfg[data-stcfg]'))
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })   // the setTimeout(0) arms `off`
    await click(document.querySelector('.stmenu .st-pen') as HTMLElement)
    await outside()
    expect(document.querySelector('.stmenu'), 'an outside click while the pen is open must not dismiss the box').toBeTruthy()
    await click(document.querySelector('.stmenu .st-pen') as HTMLElement)
    await outside()
    expect(document.querySelector('.stmenu'), 'an outside click once the pen is closed dismisses the box as usual').toBeFalsy()
  })

  /* board.ts's waveMenu ('+ Add wave') clears '.wavemenu' by class, and this
     box carries that class too. With the pen open the box's own outside-click
     listener declines to remove itself (that's the whole point of the test
     above) — so if waveMenu just yanked the node out from under it the same
     way, that listener would stay attached to document forever, pointing at
     a box that is no longer there. It must unhook it instead. */
  it('the wave picker replacing this popup while the pen is open unhooks its listener rather than leaking it', async () => {
    await openPen()
    const stmenu = document.querySelector('.stmenu') as any
    const offFn = stmenu._offClick
    expect(offFn, 'the box records its own outside-click handler for exactly this').toBeTypeOf('function')
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    try {
      await click($('#addGo'))
      expect(removeSpy, 'the wave picker unhooks the old popup\'s listener before discarding its node')
        .toHaveBeenCalledWith('click', offFn)
    } finally {
      removeSpy.mockRestore()
    }
  })

  /* labels became arbitrary user input this task — html.ts had two sites
     (the edit-mode on-chip, and storesView's read-only chip) that put a
     store's label straight into markup reaching innerHTML, unescaped. Both
     now go through esc(). Prove it where it actually renders — the WEEK's
     own chip, not just STORE_CFG's in-memory data — or an unescaped sink
     anywhere downstream reads as a passing test. */
  it('a rename that types markup is escaped everywhere it renders, not just held as data', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await act(async () => notify())
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = '<SVG ONLOAD=X>'   // 14 chars — clears MAX_LABEL, renameStore uppercases (already is)
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '<SVG ONLOAD=X>'])
    const chip = document.querySelector('#eWeek .stchip[data-store="0.0.0.0.tk2"]') as HTMLElement
    expect(chip, 'the on-chip for the renamed store still renders').toBeTruthy()
    expect(chip.querySelector('svg'), 'the label must render as TEXT, never be parsed as markup').toBeNull()
    expect(chip.textContent).toBe('<SVG ONLOAD=X>')
  })
})
