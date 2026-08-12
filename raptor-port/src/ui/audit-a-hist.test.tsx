// @vitest-environment jsdom
/* AUDIT A (12 Aug 26) — adversarial pass over the History surfaces: the
   changes list's jump, the bubble, the escaping of user-typed values, the
   deletion sentences' clip, undo/redo, and the session boundary.

   Tests carrying a BUG marker assert the CURRENT (broken) behaviour on
   purpose, so this file runs green while the fault stands and starts
   failing the moment someone fixes it — flip the assertion then, don't
   delete it. Everything else pins behaviour that is correct today and was
   not pinned anywhere. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, resetSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { setSlotVal, slotVal, txtSet, txtGet } from '../engine/slots'
import { ELOG, elogClear, elogRows, elogFor } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { setHistList, setHistGroup, HISTOPEN } from './pops'
import { hideHistBub, histBubPinned } from './histbubble'
import { undo, redo } from '../state/history'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (s: string) => document.querySelector(s) as HTMLElement
const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[]
const bub = () => document.querySelector('.histbub') as HTMLElement | null
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const hover = async (el: Element) =>
  act(async () => { el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })) })
const settle = async () => act(async () => { await new Promise(r => setTimeout(r, 20)) })
const mutate = async () => act(async () => { view.afterSchedMutate(); notify() })
const newest = () => elogRows()[0]

let phone = false
const openList = async () => {
  if (!view.HISTMODE) await act(async () => { view.setHistMode(true); notify() })
  await act(async () => { setHistList('all'); notify() })
}
/* capture what the toast said while fn runs — the jump's "no longer on this
   day" is the one thing several tests here have to see or NOT see */
async function saidWhile(fn: () => Promise<any>) {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  try { await fn() } finally { HOOKS.toast = real }
  return said
}

beforeAll(async () => {
  initStore()
  HOOKS.isPhone = () => phone
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await act(async () => { openScheduler(0) })
})

beforeEach(async () => {
  phone = false
  elogClear(); hideHistBub(); HISTOPEN.clear()
  await act(async () => { view.setHistMode(false); setHistList(false); setHistGroup(false); notify() })
})

describe('stale addresses after a delete (the renumbering hole)', () => {
  /* engine/keys.ts's shiftKeys renumbers SCHED.pending/changes/als and never
     touches ELOG.rows — audit-a-editlog.test.ts pins the engine half. This
     is what a USER then sees: the changes list's own contract says "a key
     whose row has since been deleted toasts rather than failing silently"
     (docs/ui-contracts.md §History on the board), but when a row ABOVE the
     edit is deleted the old address is re-occupied by the next row down, so
     the jump neither toasts nor lands right — it pins the bubble, silently,
     on a row nobody ever edited. */
  it('BUG: the jump lands on the WRONG row, with no warning, after a row above is deleted', async () => {
    const rows = DAYS[0].dutywaves[0].rows
    const B = rows.length
    /* three fresh rows straight into the model (net zero by the end); the
       DELETE below is the real gesture under test. The bottom row carries a
       man of its own — an EMPTY duty row renders no addressable seat cell,
       so an empty re-occupant would fall into the (untrue) toast path
       rather than the silent wrong-land this test is about. */
    rows.push(
      { role: 'AUD-TOP', id: '', str: '', end: '' },
      { role: 'AUD-MID', id: '', str: '', end: '' },
      { role: 'AUD-BOT', id: '', str: '', end: '' },
    )
    setSlotVal(`d:0.0.${B + 1}`, 'bane')            // the LOGGED edit, on the middle row
    setSlotVal(`d:0.0.${B + 2}`, 'wolf')            // the bottom row's own man
    await mutate()

    /* delete the row ABOVE the edit — every key after it shifts down one */
    await click($(`#sbBoard [data-drdel="0.0.${B}"]`))

    /* the board is truthful: the edited man now sits at B, and the old
       address B+1 is the bottom row, which nobody edited to say Bane */
    expect(slotVal(`d:0.0.${B}`)).toBe('bane')
    expect(slotVal(`d:0.0.${B + 1}`)).toBe('wolf')

    await openList()
    const row = $$('#histBody .hl-row.hit').find(r => r.dataset.hkey === `d:0.0.${B + 1}`)
    expect(row, 'the log row still carries its pre-renumber key').toBeTruthy()

    const said = await saidWhile(async () => { await click(row!); await settle() })

    /* BUG — no toast, and the bubble pins Bane's story onto the bottom row,
       which was never edited. The one honest outcome the contract names
       (toast) and the one it promises (the right cell) both fail. */
    expect(said.length, 'nothing warned').toBe(0)
    expect(bub(), 'a bubble came up regardless').toBeTruthy()
    expect(histBubPinned()).toBe(true)
    expect(bub()!.textContent).toContain('Bane')
    const anchored = $(`#sbBoard [data-slot="d:0.0.${B + 1}"]`)
    expect(anchored.textContent, "the row under the bubble is Wolf's, never edited to say Bane").toContain('Wolf')
    expect(anchored.textContent).not.toContain('Bane')

    /* and the flip side: the row that truly holds the edit has NOTHING to
       say — hovering it raises no bubble at all */
    hideHistBub()
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="d:0.0.${B}"]`))
    expect(bub(), 'the edited row lost its history').toBe(null)

    /* net zero on the demo data — highest first, as the board itself does */
    await click($(`#sbBoard [data-drdel="0.0.${B + 1}"]`))
    await click($(`#sbBoard [data-drdel="0.0.${B}"]`))
  })
})

describe('the wave label (wl:) and the jump', () => {
  /* the board edits a wave's title through the [data-wsel] <select>, which is
     none of the addressable cell attributes — so findHistCell can never
     answer for a wl: key. The wl: FAMILY is missing from histJumpable's
     NO_BOARD_CELL list, so a wl: row is offered as a button and the click
     answers "no longer on this day" about a wave sitting right there on the
     board — the exact untruth the guard exists to prevent
     (docs/ui-contracts.md: "a new key family the board does not render wants
     a line in NO_BOARD_CELL"). */
  it('BUG: a wl: row is a button, and clicking it tells an untruth', async () => {
    const was = txtGet('wl:0.0')
    await act(async () => { txtSet('wl:0.0', 'AUDIT WAVE'); notify() })
    try {
      expect(elogFor('wl:0.0'), 'the week edit really logged').toBeTruthy()
      await openList()
      const row = $$('#histBody .hl-row.hit').find(r => r.dataset.hkey === 'wl:0.0')
      expect(row, 'offered as a jump though the board has no wl: cell').toBeTruthy()

      const said = await saidWhile(async () => { await click(row!); await settle() })
      expect(said.join(' '), 'and the jump calls a live wave gone').toContain('no longer')
      expect(bub()).toBe(null)
      expect(DAYS[0].waves[0], 'the wave is of course still there').toBeTruthy()
    } finally {
      await act(async () => { txtSet('wl:0.0', was); notify() })
    }
  })

  /* the board's own wave-title control writes w.label/w.night directly —
     no markEdit, no noteChange, so no pending mark and no log row. The same
     edit made on the WEEK (the wl: contenteditable) logs. HANDOFF names
     drag/Auto-sort as "the LAST schedule write with no line in the list";
     this one is another, and it is silent on the amendment side too. */
  it('BUG: retitling a wave from the board leaves no trace in the log at all', async () => {
    const w = DAYS[0].waves[0]
    const wasLabel = w.label, wasNight = w.night
    /* the earlier wl: test wrote through txtSet, which legitimately marks
       pending — freeze whatever is there so the assertion below reads the
       DELTA this gesture makes, which must be none */
    const hadPending = SCHED.pending['wl:0.0']
    const s = $('#sbBoard [data-wsel="0.0"]') as HTMLSelectElement
    expect(s, 'the board renders the wave-title select').toBeTruthy()
    try {
      s.value = 'Night wave'
      await act(async () => { s.dispatchEvent(new Event('change', { bubbles: true })) })
      expect(w.label, 'the model really changed').toBe('NIGHT WAVE')
      expect(w.night).toBe(true)
      /* BUG — invisible to History AND to the amendment machinery */
      expect(ELOG.rows.length, 'no line in the changes list').toBe(0)
      expect(SCHED.pending['wl:0.0'], 'no pending mark either').toBe(hadPending)
    } finally {
      w.label = wasLabel; w.night = wasNight
      await mutate()
    }
  })
})

describe('user-typed values in the History HTML', () => {
  it('a deleted note carrying markup lists as text, never as elements', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('<img src=x onerror=alert(1)>')
    await mutate()
    await click($(`#sbBoard [data-ndel="0.${ni}"]`))
    expect(newest()!.lbl, 'the sentence really carries the payload').toContain('<img')

    await openList()
    expect($('#histBody').querySelector('img'), 'no element was created').toBe(null)
    expect($('#histBody').querySelector('script')).toBe(null)
    expect($('#histBody').textContent).toContain('<img src=x')
  })

  it('a day-note value carrying markup reaches the bubble as text', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('')
    await mutate()
    try {
      await act(async () => { txtSet(`dn:0.${ni}`, '</div><img src=x onerror=alert(1)>'); notify() })
      await act(async () => { view.setHistMode(true); notify() })
      await hover($(`#sbBoard [data-bfld="dn:0.${ni}"]`))
      const b = bub()
      expect(b, 'the bubble came up').toBeTruthy()
      expect(b!.querySelector('img'), 'and holds no injected element').toBe(null)
      expect(b!.textContent).toContain('<img src=x')
      hideHistBub()
    } finally {
      await click($(`#sbBoard [data-ndel="0.${ni}"]`))
    }
  })
})

describe('what a deletion sentence carries at the edges', () => {
  it('an empty note reads as a bare sentence, with no empty quotes', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('')
    await mutate()
    await click($(`#sbBoard [data-ndel="0.${ni}"]`))
    const r = newest()!
    expect(r.lbl).toBe('Note removed')
    expect(r.lbl).not.toContain('"')
  })

  /* board.ts's clip() slices at a UTF-16 code-unit boundary (t.slice(0,59)),
     so a note built of astral characters — emoji — can be cut mid surrogate
     pair, leaving a lone high surrogate in the sentence the toast and the
     list both print (it renders as the replacement character). */
  it('BUG: the 60-char clip can split a surrogate pair', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('😀'.repeat(40))                    // 80 code units — must clip
    await mutate()
    await click($(`#sbBoard [data-ndel="0.${ni}"]`))
    const r = newest()!
    expect(r.lbl).toContain('Note removed')
    expect(r.lbl).toMatch(/…/)
    /* a high surrogate NOT followed by a low one — a malformed string */
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(r.lbl),
      'the clipped sentence contains a lone surrogate').toBe(true)
  })
})

describe('undo and redo against the log', () => {
  /* the documented contract (state/history.ts, docs/engine-rules.md): the log
     is NOT in histSnap, an undo reverts the schedule and leaves the record
     standing, and undo/redo each log themselves. Correct today; pinned here
     because nothing else pinned it. */
  it('undo reverts the value, keeps the record, and logs itself — redo the same', async () => {
    const key = $$('#sbBoard [data-slot]').map(e => e.dataset.slot!).filter(k => /\.p$/.test(k))[0]!
    const was = slotVal(key)
    const to = was === 'bane' ? 'stiff' : 'bane'
    await act(async () => { setSlotVal(key, to); view.afterSchedMutate(); notify() })
    expect(elogRows().length).toBe(1)

    await act(async () => { undo(); notify() })
    expect(slotVal(key), 'the schedule reverted').toBe(was)
    const afterUndo = elogRows()
    expect(afterUndo.length, 'the edit row still stands, plus the undo itself').toBe(2)
    expect(afterUndo[0]!.lbl).toBe('Undo')
    expect(afterUndo[0]!.key, 'a structural sentence, not a value pair').toBe('')
    expect(afterUndo[1]!.key).toBe(key)

    await act(async () => { redo(); notify() })
    expect(slotVal(key), 'redo re-applies').toBe(to)
    expect(elogRows()[0]!.lbl).toBe('Redo')
    expect(elogRows().length).toBe(3)

    /* leave the demo data as found */
    await act(async () => { undo(); notify() })
    expect(slotVal(key)).toBe(was)
  })
})

describe('the board closing and the session ending', () => {
  it('closing the board takes the bubble down and hands every parked title back', async () => {
    /* an edited seat wears title="Edited — not published yet"; the bubble
       parks it into data-hist-t while it is up. Whatever happens between
       park and close, the DOCUMENT must end with no data-hist-t anywhere. */
    const key = $$('#sbBoard [data-slot]').map(e => e.dataset.slot!).filter(k => /\.p$/.test(k))[1]!
    const was = slotVal(key)
    const to = was === 'bane' ? 'stiff' : 'bane'
    await act(async () => { setSlotVal(key, to); view.afterSchedMutate(); notify() })
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="${key}"]`))
    expect(bub()).toBeTruthy()

    await act(async () => { closeScheduler(); notify() })
    expect(bub(), 'the bubble did not outlive the board').toBe(null)
    expect(document.querySelector('[data-hist-t]'), 'no title left parked').toBe(null)

    await act(async () => { openScheduler(0); notify() })
    await act(async () => { setSlotVal(key, was); view.afterSchedMutate(); notify() })
  })

  /* LAST on purpose — resetSession drags the whole view back to page 1 */
  it('logging out clears the log, the mode, and any bubble still up', async () => {
    const key = $$('#sbBoard [data-slot]').map(e => e.dataset.slot!).filter(k => /\.p$/.test(k))[0]!
    const was = slotVal(key)
    await act(async () => { setSlotVal(key, was === 'bane' ? 'stiff' : 'bane'); view.afterSchedMutate(); notify() })
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="${key}"]`))
    expect(ELOG.rows.length).toBeGreaterThan(0)

    await act(async () => { resetSession(null); notify() })
    expect(ELOG.rows.length, 'the incoming user sees nothing').toBe(0)
    expect(view.HISTMODE, 'History is off for the next session').toBe(false)
    expect(bub(), 'and no bubble survived the logout').toBe(null)
    expect(document.querySelector('[data-hist-t]')).toBe(null)
  })
})
