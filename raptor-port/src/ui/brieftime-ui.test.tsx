// @vitest-environment jsdom
/* The UI half of B — a scheduler-typed brief time (owner, 6 Aug 26). The
   engine half (f.br, collectEvents, TIME_TXT) is already green; these pin
   that a scheduler can SEE and SET it: the week's editable box and its
   click-to-accept suggestion, the board's mirror of both, the role gate
   (editMode() is admin-only), the CSV export, and the read-only view page.
   Driven through the React app the same way editweek.test.tsx and
   board.test.tsx do. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { VCONF } from '../engine/rules'
import { minus } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { schedRows } from './export'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 10)) })

/* the first ordinary (non-standalone) formation of day 0 — same idiom as the
   engine's brieftime.test.ts, so a seed change that adds a standalone wave
   ahead of the flying waves cannot silently point this file at a shift line
   that never briefs. */
const firstForm = () => {
  const w = (DAYS[0].waves || []).find((x: any) => !isStandalone(x) && (x.formations || []).length)
  return w ? w.formations[0] : null
}
/* the funnel key prefix (di.gi.li) for a formation found via firstForm —
   located by object identity rather than assumed indices, so a seed reorder
   cannot silently point this file's keys at the wrong line. */
const idxOf = (f: any) => {
  for (let gi = 0; gi < DAYS[0].waves.length; gi++) {
    const fs = DAYS[0].waves[gi].formations || []
    const li = fs.indexOf(f)
    if (li >= 0) return `0.${gi}.${li}`
  }
  throw new Error('formation not found in DAYS[0]')
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

describe('B on the edit week', () => {
  it('a blank line renders a ghost carrying the calculated time; clicking it accepts', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br, key = `ff:${idx}.br`
    await act(async () => { f.br = ''; notify() })
    const ghost = $(`#eWeek .bsug[data-bacc="${key}"]`)
    expect(ghost, 'a suggestion ghost renders for the blank line').toBeTruthy()
    const want = minus(f.to, VCONF.briefLead)
    expect(ghost.dataset.bval).toBe(want)
    expect(ghost.textContent).toBe(want)
    await click(ghost)
    expect(f.br).toBe(want)
    expect(SCHED.pending[key]).toBe(1)
    expect($(`#eWeek .bsug[data-bacc="${key}"]`), 'the ghost is gone once B is set').toBeFalsy()
    await act(async () => { f.br = was; delete SCHED.pending[key]; notify() })
  })

  it('a typed B needs no suggestion at all', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br
    await act(async () => { f.br = '06:05'; notify() })
    expect($(`#eWeek .bsug[data-bacc="ff:${idx}.br"]`), 'no ghost once B is typed').toBeFalsy()
    await act(async () => { f.br = was; notify() })
  })

  it('typing into the box commits through txtSet, marks pending, and Escape restores', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br, key = `ff:${idx}.br`
    await act(async () => { f.br = '06:05'; notify() })
    const el = $(`#eWeek [data-txt="${key}"]`)
    expect(el, 'the B box renders').toBeTruthy()
    expect(el.textContent).toBe('06:05')
    await act(async () => {
      el.textContent = '0610'
      el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    await settle()
    expect(txtGet(key)).toBe('06:10')
    expect(f.br).toBe('06:10')
    expect(SCHED.pending[key]).toBe(1)
    /* the commit above changed the day's rendered string, so EditWeek's
       per-day diff swapped in a fresh section (outerHTML) — `el` is now a
       detached node whose events never reach the document-level listener.
       Re-query the live box before driving Escape on it. */
    const live = $(`#eWeek [data-txt="${key}"]`)
    /* Escape abandons an in-flight edit and puts the model value back —
       same contract as every other [data-txt] field (textedit.ts). */
    await act(async () => {
      live.textContent = 'GARBAGE'
      live.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    expect(live.textContent).toBe('06:10')
    await act(async () => { f.br = was; delete SCHED.pending[key]; notify() })
  })
})

describe('a member session cannot indicate a brief', () => {
  /* editMode() (state/store.ts) is admin-only, landed earlier the same day —
     canEditSched() gates both what dayHTML renders (ed collapses to the
     view-mode branch) and, belt-and-braces, the click handler itself, so a
     stale ghost left over from an admin session (a version mismatch, a
     race) still refuses rather than trusting the markup. */
  it('renders no suggestion or box, and a direct click on a stale ghost writes nothing', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br, key = `ff:${idx}.br`
    await act(async () => { f.br = ''; notify() })
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($(`#eWeek [data-txt="${key}"]`), 'no editable box for a member').toBeFalsy()
    expect($(`#eWeek .bsug[data-bacc="${key}"]`), 'no suggestion ghost for a member').toBeFalsy()
    const stale = document.createElement('span')
    stale.className = 'bsug'
    const want = minus(f.to, VCONF.briefLead)
    stale.dataset.bacc = key; stale.dataset.bval = want
    document.body.appendChild(stale)
    await click(stale)
    expect(f.br, 'the model is untouched').toBe('')
    expect(SCHED.pending[key]).toBeUndefined()
    stale.remove()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); f.br = was; notify() })
  })
})

describe('B on the scheduler board', () => {
  it('the B input exists and a change writes through the funnel', async () => {
    await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
    const inp = document.querySelector('#sbBoard input[data-bfld^="ff:"][data-bfld$=".br"]') as HTMLInputElement
    expect(inp, 'a B input renders on the board').toBeTruthy()
    const key = inp.dataset.bfld!, before = inp.value
    await act(async () => {
      inp.value = '07:15'
      inp.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(txtGet(key)).toBe('07:15')
    expect(SCHED.pending[key]).toBe(1)
    await act(async () => {
      inp.value = before
      inp.dispatchEvent(new Event('change', { bubbles: true }))
    })
    delete SCHED.pending[key]
  })

  it('a blank B on the board offers the same accept ghost as the week', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br, key = `ff:${idx}.br`
    await act(async () => { f.br = ''; notify() })
    const ghost = document.querySelector(`#sbBoard .bsug[data-bacc="${key}"]`) as HTMLElement
    expect(ghost, 'the board renders the suggestion ghost').toBeTruthy()
    const want = minus(f.to, VCONF.briefLead)
    expect(ghost.dataset.bval).toBe(want)
    await click(ghost)
    expect(f.br).toBe(want)
    expect(SCHED.pending[key]).toBe(1)
    await act(async () => { f.br = was; delete SCHED.pending[key]; notify() })
  })
})

describe('the CSV export honours a typed B', () => {
  it('the Brief column is the typed value; a blank line falls back to the calculated one', () => {
    const f: any = firstForm()!, was = f.br
    const find = (rows: any[][]) => rows.find(r => r[3] === f.cs && r[4] === f.msn)
    f.br = '05:55'
    expect(find(schedRows())![5]).toBe('05:55')
    f.br = ''
    expect(find(schedRows())![5]).toBe(minus(f.to, VCONF.briefLead))
    f.br = was
  })
})

describe('the view week shows a brief time, read-only', () => {
  it('plain effective text, no suggestion, no editable box', async () => {
    const f: any = firstForm()!, was = f.br
    await act(async () => { f.br = ''; notify() })
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    const dayEl = $('#vWeek .day[data-day="0"]')
    const forms = [...dayEl.querySelectorAll('.form')]
    const formRow = forms.find(fr => (fr.querySelector('.csmsn b')?.textContent || '').includes(f.cs))
    expect(formRow, "the formation's row renders on the view page").toBeTruthy()
    const b = formRow!.querySelector('.bto b')
    expect(b, 'the effective brief is shown as plain text').toBeTruthy()
    expect(b!.textContent).toBe(minus(f.to, VCONF.briefLead))
    expect(formRow!.querySelector('.bsug'), 'no suggestion on the view page').toBeFalsy()
    expect(formRow!.querySelector('.bto [contenteditable]'), 'no editable box on the view page').toBeFalsy()
    await act(async () => { f.br = was; notify() })
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  })
})
