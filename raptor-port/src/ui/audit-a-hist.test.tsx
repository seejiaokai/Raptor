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

describe('the log moves with a renumbering delete (fixed 12 Aug 26)', () => {
  /* engine/keys.ts's shiftKeys renumbers SCHED.pending/changes/als — and,
     since the audit, ELOG.rows through elogRemap — so a delete above an
     edited row slides the log's address down with the row. The jump lands
     on the row that really holds the edit, and its hover still answers. */
  it('the jump follows the edit to its new address after a row above is deleted', async () => {
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
    /* both edits slid down one with their rows: Bane's B+1 → B, and the
       bottom row's own Wolf edit B+2 → B+1 — so the address B+1 now
       answers for WOLF's history, not Bane's */
    const wolfRow = $$('#histBody .hl-row.hit').find(r => r.dataset.hkey === `d:0.0.${B + 1}`)
    expect(wolfRow && wolfRow.textContent, 'the old address now carries the edit that truly lives there').toContain('Wolf')
    const row = $$('#histBody .hl-row.hit').find(r => r.dataset.hkey === `d:0.0.${B}` && (r.textContent || '').includes('Bane'))
    expect(row, 'and Bane’s log row moved down with his row').toBeTruthy()

    const said = await saidWhile(async () => { await click(row!); await settle() })

    expect(said.length, 'nothing to warn about').toBe(0)
    expect(bub(), 'the bubble came up').toBeTruthy()
    expect(histBubPinned()).toBe(true)
    expect(bub()!.textContent).toContain('Bane')
    const anchored = $(`#sbBoard [data-slot="d:0.0.${B}"]`)
    expect(anchored.textContent, 'and it hangs on the row that really says Bane').toContain('Bane')

    /* and the flip side holds too: the bottom row answers with its OWN
       story (Wolf), never Bane's */
    hideHistBub()
    await act(async () => { view.setHistMode(true); notify() })
    await hover($(`#sbBoard [data-slot="d:0.0.${B + 1}"]`))
    expect(bub(), 'the bottom row still answers').toBeTruthy()
    expect(bub()!.textContent).toContain('Wolf')
    expect(bub()!.textContent).not.toContain('Bane')
    hideHistBub()

    /* net zero on the demo data — highest first, as the board itself does */
    await click($(`#sbBoard [data-drdel="0.0.${B + 1}"]`))
    await click($(`#sbBoard [data-drdel="0.0.${B}"]`))
  })
})

describe('the wave label (wl:) and the jump', () => {
  /* the board edits a wave's title through the [data-wsel] <select>, which is
     none of the addressable cell attributes — so findHistCell can never
     answer for a wl: key. Fixed 12 Aug 26 by the audit: wl joined
     NO_BOARD_CELL, so the row LISTS (the edit is real) but is not a button —
     the same answer ar:/at:/it:/tr: already give
     (docs/ui-contracts.md: "a new key family the board does not render wants
     a line in NO_BOARD_CELL"). */
  it('a wl: row lists but is not a button — the board has no cell to jump to', async () => {
    const was = txtGet('wl:0.0')
    await act(async () => { txtSet('wl:0.0', 'AUDIT WAVE'); notify() })
    try {
      expect(elogFor('wl:0.0'), 'the week edit really logged').toBeTruthy()
      await openList()
      const hit = $$('#histBody .hl-row.hit').find(r => r.dataset.hkey === 'wl:0.0')
      expect(hit, 'not offered as a jump — the board has no wl: cell').toBeFalsy()
      const listed = $$('#histBody .hl-row').find(r => (r.textContent || '').includes('AUDIT WAVE'))
      expect(listed, 'but the edit is in the list').toBeTruthy()
    } finally {
      await act(async () => { txtSet('wl:0.0', was); notify() })
    }
  })

  /* the board's own wave-title control used to write w.label/w.night with
     no markEdit at all — no pending mark, no log row, while the same edit
     on the WEEK (the wl: contenteditable) logged. Fixed 12 Aug 26 (audit):
     the handler books the retitle under the same wl: key, valued by the
     TITLES the control shows. */
  it('retitling a wave from the board logs, and marks the amendment', async () => {
    const w = DAYS[0].waves[0]
    const wasLabel = w.label, wasNight = w.night
    const s = $('#sbBoard [data-wsel="0.0"]') as HTMLSelectElement
    expect(s, 'the board renders the wave-title select').toBeTruthy()
    try {
      s.value = 'Night wave'
      await act(async () => { s.dispatchEvent(new Event('change', { bubbles: true })) })
      expect(w.label, 'the model really changed').toBe('NIGHT WAVE')
      expect(w.night).toBe(true)
      const r = elogFor('wl:0.0')
      expect(r, 'the retitle is in the changes list').toBeTruthy()
      expect(r!.to).toBe('Night wave')
      expect(SCHED.pending['wl:0.0'], 'and the amendment machinery saw it').toBeTruthy()
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

  /* board.ts's clip() cuts by CODE POINTS (fixed 12 Aug 26 — a UTF-16
     slice could halve a surrogate pair), so a note built of emoji clips to
     whole characters and the sentence stays well-formed. */
  it('the 60-char clip cuts whole characters, never half an emoji', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('😀'.repeat(70))                    // 70 code points — must clip
    await mutate()
    await click($(`#sbBoard [data-ndel="0.${ni}"]`))
    const r = newest()!
    expect(r.lbl).toContain('Note removed')
    expect(r.lbl).toMatch(/…/)
    /* no high surrogate left without its low half — a well-formed string */
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(r.lbl),
      'the clipped sentence contains a lone surrogate').toBe(false)
    expect([...r.lbl].length, 'and it really clipped to the budget').toBeLessThan(80)
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
