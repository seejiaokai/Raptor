// @vitest-environment jsdom
/* The UI half of B — a scheduler-typed brief time (owner, 6 Aug 26). The
   engine half (f.br, collectEvents, TIME_TXT) is already green; these pin
   that a scheduler can SEE and SET it: the week's editable box and its
   click-to-accept suggestion, the board's mirror of both, the role gate
   (editMode() is admin-only), the CSV export, and the read-only view page.
   Driven through the React app the same way editweek.test.tsx and
   board.test.tsx do. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { VCONF } from '../engine/rules'
import { minus } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { schedRows } from './export'
import { ridKey } from '../engine/rowids'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const rk = (k: string) => ridKey(k, DAYS)

let host: HTMLDivElement
let root: Root
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
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

/* Unmount before the file ends. The last test's click/notify can leave a
   React scheduler task pending; with the root still mounted that task fires
   AFTER vitest tears jsdom down and dies with "window is not defined" — an
   unhandled error that fails the whole `unit (raptor)` job while every test
   in it passed (CI, 10 Sep 26; the same commit ran clean locally — a timing
   flake, not a regression). Unmounting inside act() drains the queue first. */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('B on the edit week', () => {
  /* D1028, D1030 (19 Oct 26): the suggestion sits faint INSIDE the empty box — never a line above it — and one tap places
     it, saved when the box is left */
  it('the B box of a blank line carries the calculated time faint inside it; one tap places it, leaving saves it', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br, key = `ff:${idx}.br`
    await act(async () => { f.br = ''; notify() })
    expect($('#eWeek .bsug'), 'no suggestion on a line of its own above the box').toBeFalsy()
    const box = $(`#eWeek [data-txt="${key}"]`)
    const want = minus(f.to, VCONF.briefLead)
    expect(box.classList.contains('sugbox'), 'the empty box wears the suggestion').toBe(true)
    expect(box.dataset.ph).toBe(want)
    expect(box.textContent, 'nothing is written until he taps').toBe('')
    expect(f.br).toBe('')
    await act(async () => { box.focus() })
    await click(box)
    expect(box.textContent, 'the tap placed it').toBe(want)
    await act(async () => { box.blur() }); await settle()
    expect(f.br).toBe(want)
    expect(SCHED.pending[rk(key)]).toBe(1)
    expect($(`#eWeek [data-txt="${key}"]`).classList.contains('sugbox'), 'no suggestion once B is set').toBe(false)
    await act(async () => { f.br = was; delete SCHED.pending[rk(key)]; notify() })
  })

  it('a typed B needs no suggestion at all', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br
    await act(async () => { f.br = '06:05'; notify() })
    const box = $(`#eWeek [data-txt="ff:${idx}.br"]`)
    expect(box, 'the B box is drawn').toBeTruthy()
    expect(box.classList.contains('sugbox') || box.hasAttribute('data-ph'), 'no suggestion once B is typed').toBe(false)
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
    expect(SCHED.pending[rk(key)]).toBe(1)
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
    await act(async () => { f.br = was; delete SCHED.pending[rk(key)]; notify() })
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
    expect($(`#eWeek .sugbox`), 'no suggestion for a member').toBeFalsy()
    /* a stale suggesting box (the D1030 box, left from an admin session) — a tap places nothing for a member */
    const stale = document.createElement('span')
    stale.className = 'sugbox txed'
    const want = minus(f.to, VCONF.briefLead)
    stale.setAttribute('contenteditable', 'true'); stale.dataset.txt = key; stale.dataset.ph = want
    document.body.appendChild(stale)
    await click(stale)
    expect(stale.textContent, 'nothing placed').toBe('')
    expect(f.br, 'the model is untouched').toBe('')
    expect(SCHED.pending[key]).toBeUndefined()
    stale.remove()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); f.br = was; notify() })
  })
})

describe('B on the scheduler board', () => {
  it('the B input exists and a change writes through the funnel', async () => {
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    const inp = document.querySelector('#sbBoard input[data-bfld^="ff:"][data-bfld$=".br"]') as HTMLInputElement
    expect(inp, 'a B input renders on the board').toBeTruthy()
    const key = inp.dataset.bfld!, before = inp.value
    await act(async () => {
      inp.value = '07:15'
      inp.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(txtGet(key)).toBe('07:15')
    expect(SCHED.pending[rk(key)]).toBe(1)
    await act(async () => {
      inp.value = before
      inp.dispatchEvent(new Event('change', { bubbles: true }))
    })
    delete SCHED.pending[rk(key)]
  })

  it('a blank B on the board carries the same suggestion inside its box; one tap places it, leaving saves it', async () => {
    const f: any = firstForm()!, idx = idxOf(f), was = f.br, key = `ff:${idx}.br`
    await act(async () => { f.br = ''; notify() })
    expect(document.querySelector('#sbBoard .bsug'), 'no suggestion on a line of its own above the box').toBeNull()
    const inp = document.querySelector(`#sbBoard input[data-bfld="${key}"]`) as HTMLInputElement
    const want = minus(f.to, VCONF.briefLead)
    expect(inp.classList.contains('sugbox')).toBe(true)
    expect(inp.placeholder).toBe(want)
    expect(inp.value).toBe('')
    await act(async () => { inp.focus() })
    await click(inp)
    expect(inp.value, 'the tap placed it').toBe(want)
    expect(f.br, 'not saved until the box is left').toBe('')
    await act(async () => { inp.blur() }); await settle()
    expect(f.br).toBe(want)
    expect(SCHED.pending[rk(key)]).toBe(1)
    await act(async () => { f.br = was; delete SCHED.pending[rk(key)]; notify() })
  })
})

describe('the CSV export honours a typed B', () => {
  it('the Brief column is the typed value; a blank line falls back to the calculated one', () => {
    const f: any = firstForm()!, was = f.br
    const find = (rows: any[][]) => rows.find(r => r[3] === f.cs && r[4] === f.msn)
    f.br = '05:55'
    expect(find(schedRows())![6]).toBe('05:55')   // Rally (column 5) before Brief since D1026
    f.br = ''
    expect(find(schedRows())![6]).toBe(minus(f.to, VCONF.briefLead))
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

/* THE FLYING-LINE REMARKS BOX SAYS WHAT IT IS (owner, 16 Aug 26). The board's
   flying line gained a faded "Remarks" placeholder; the week's edit view now
   matches, so an empty remarks box reads the same on both surfaces. A
   standalone line keeps its MAIN/SPARE ghost text (a Stable decision), so the
   placeholder is emitted only on a formation line. */
describe('the edit week flying-line remarks placeholder', () => {
  it('a formation line carries a faded "Remarks" placeholder', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    await settle()
    const withRemarks = $$('#eWeek .rmkcell .ntx[data-ph="Remarks"]')
    expect(withRemarks.length, 'the week flying line offers the Remarks placeholder').toBeGreaterThan(0)
  })
})

/* [RALLY-PER-FORMATION] — each formation's own R box (owner D1026, D1027, D1029–D1031, 19 Oct 26): R above B in the
   second column, TO above LD in the third; the empty R box suggests the default rally (take-off less the Logic page's
   report time) faint inside it, one tap places it; the board carries the same box; "+ In-time" fills what it always did. */
describe('RB4 RB5 RB6 — the R box (D1026)', () => {
  const reset = async (f: any, keep: any) => { await act(async () => { Object.assign(f, keep); notify() }) }
  it('the week: R over B, TO over LD; an empty R suggests take-off less the report time; a typed one shows', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!); await settle()
    const f: any = firstForm()!, idx = idxOf(f), keep = { rl: f.rl, br: f.br }
    await act(async () => { f.rl = ''; notify() })
    const day = $('#eWeek .day[data-day="0"]')
    expect(day.innerHTML, 'the headings').toContain('<span class="c-c">R<br>B</span><span class="c-c">TO<br>LD</span>')
    const r = $(`#eWeek [data-txt="ff:${idx}.rl"]`), form = r.closest('.form') as HTMLElement
    expect([...form.querySelector('.fcell.bto')!.children].map(e => (e as HTMLElement).dataset.txt), 'R above B').toEqual([`ff:${idx}.rl`, `ff:${idx}.br`])
    expect([...form.querySelector('.fcell.ld')!.children].map(e => (e as HTMLElement).dataset.txt), 'TO above LD').toEqual([`ff:${idx}.to`, `ff:${idx}.ld`])
    expect(r.classList.contains('sugbox')).toBe(true)
    expect(r.dataset.ph, 'the default rally: take-off less the report time').toBe(minus(f.to, VCONF.reportLead))
    expect(r.textContent).toBe('')
    await act(async () => { f.rl = '07:05'; notify() })
    const typed = $(`#eWeek [data-txt="ff:${idx}.rl"]`)
    expect(typed.textContent).toBe('07:05')
    expect(typed.classList.contains('sugbox'), 'no suggestion once a rally is typed').toBe(false)
    await reset(f, keep)
  })
  it('one tap on the empty R box places the default rally; leaving the box saves it as a pending change would', async () => {
    const f: any = firstForm()!, idx = idxOf(f), keep = { rl: f.rl }, key = `ff:${idx}.rl`
    await act(async () => { f.rl = ''; notify() })
    const r = $(`#eWeek [data-txt="${key}"]`), want = minus(f.to, VCONF.reportLead)
    await act(async () => { r.focus() })
    await click(r)
    expect(r.textContent).toBe(want)
    await act(async () => { r.blur() }); await settle()
    expect(f.rl).toBe(want)
    expect(SCHED.pending[rk(key)]).toBe(1)
    delete SCHED.pending[rk(key)]
    await reset(f, keep)
  })
  it('a Tab passing through the empty R box fills nothing', async () => {
    const f: any = firstForm()!, idx = idxOf(f), keep = { rl: f.rl }
    await act(async () => { f.rl = ''; notify() })
    const msn = $(`#eWeek [data-txt="ff:${idx}.msn"]`)
    await act(async () => { msn.focus() })
    await act(async () => { msn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })) })
    expect(document.activeElement, 'the Tab reached the R box').toBe($(`#eWeek [data-txt="ff:${idx}.rl"]`))
    expect((document.activeElement as HTMLElement).textContent, 'and placed nothing').toBe('')
    await act(async () => { (document.activeElement as HTMLElement).blur() }); await settle()
    expect(f.rl).toBe('')
    await reset(f, keep)
  })
  it('the board: an R box before B in the first time cell, its placeholder the default rally', async () => {
    if (!document.querySelector('#sbBoard input[data-bfld]')) await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    const f: any = firstForm()!, idx = idxOf(f), keep = { rl: f.rl }
    await act(async () => { f.rl = ''; notify() })
    const cell = document.querySelector(`#sbBoard .sb-rb input[data-bfld="ff:${idx}.rl"]`)!.parentElement as HTMLElement
    expect([...cell.querySelectorAll('input')].map(e => e.dataset.bfld), 'R over B').toEqual([`ff:${idx}.rl`, `ff:${idx}.br`])
    const r = cell.querySelector('input') as HTMLInputElement
    expect(r.placeholder).toBe(minus(f.to, VCONF.reportLead))
    expect(r.classList.contains('sugbox')).toBe(true)
    await act(async () => { r.value = '0640'; r.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(f.rl, 'a typed rally writes through the funnel, folded').toBe('06:40')
    delete SCHED.pending[rk(`ff:${idx}.rl`)]
    await reset(f, keep)
  })
  it('"+ In-time" fills take-off less the report time, whatever a formation’s R box says (D1031)', async () => {
    const gi = DAYS[0].waves.findIndex((x: any) => !isStandalone(x) && (x.formations || []).length)
    const w: any = DAYS[0].waves[gi], keep = { intimes: w.intimes.slice(), rl: w.formations[0].rl }
    await act(async () => { w.intimes = []; w.formations[0].rl = '05:00'; notify() })
    await click($(`#eWeek [data-itadd="0|${gi}"]`))
    const tos = w.formations.filter((x: any) => !x.cx && x.to).map((x: any) => { const [h, m] = String(x.to).split(':').map(Number); return h! * 60 + m! })
    expect(w.intimes).toHaveLength(1)
    expect(w.intimes[0].slice(0, 5)).toBe(minus(String(Math.min(...tos)).length ? `${String(Math.floor(Math.min(...tos) / 60)).padStart(2, '0')}:${String(Math.min(...tos) % 60).padStart(2, '0')}` : '', VCONF.reportLead))
    await act(async () => { w.intimes = keep.intimes; w.formations[0].rl = keep.rl; notify() })
  })
  it('the CSV carries a Rally column before Brief: the typed rally, never the default', () => {
    const f: any = firstForm()!, keep = f.rl
    const find = (rows: any[][]) => rows.find(r => r[3] === f.cs && r[4] === f.msn)
    expect(schedRows()[0]!.slice(4, 8)).toEqual(['Mission', 'Rally', 'Brief', 'TO'])
    f.rl = '0705'; expect(find(schedRows())![5]).toBe('07:05')
    f.rl = ''; expect(find(schedRows())![5]).toBe('')
    f.rl = keep
  })
})

/* RB5 — the first keys after a tap replace the placed suggestion even where the phone ignored the highlight (iOS may not
   honour a selection set by script in a box just tapped): the box keeps only what was typed */
describe('RB5 — typing replaces a placed suggestion without the highlight', async () => {
  const { placeSuggestion } = await import('./interactions')
  it('on a board box and a week box', () => {
    const inp = document.createElement('input'); inp.placeholder = '09:40'; document.body.appendChild(inp)
    expect(placeSuggestion(inp)).toBe(true)
    expect(inp.value).toBe('09:40')
    inp.value = '09:401010'; inp.dispatchEvent(new Event('input', { bubbles: true }))
    expect(inp.value, 'only what was typed').toBe('1010')
    inp.value = '10105'; inp.dispatchEvent(new Event('input', { bubbles: true }))
    expect(inp.value, 'once only: then the box is ordinary').toBe('10105')
    inp.remove()
    const box = document.createElement('span'); box.setAttribute('contenteditable', 'true'); box.dataset.ph = '10:20'; document.body.appendChild(box)
    expect(placeSuggestion(box)).toBe(true)
    expect(box.textContent).toBe('10:20')
    box.textContent = '10:200955'; box.dispatchEvent(new Event('input', { bubbles: true }))
    expect(box.textContent).toBe('0955')
    box.remove()
  })
  it('a typed replacement that IS the selection behaviour leaves the value alone', () => {
    const inp = document.createElement('input'); inp.placeholder = '09:40'; document.body.appendChild(inp)
    placeSuggestion(inp)
    inp.value = '1'; inp.dispatchEvent(new Event('input', { bubbles: true }))
    expect(inp.value).toBe('1')
    inp.remove()
  })
})

/* the fresh read's F1: the R box carries its own timing fault — the warning's address and its words; the typed lines do not */
describe('RB5 — the R box explains its own timing fault', () => {
  it('week and board: data-warnkey and the message on the R box; nothing under the typed lines', async () => {
    const { dayHTML } = await import('./html')
    const { boardHTML } = await import('./board')
    const f: any = firstForm()!, idx = idxOf(f), keep = { rl: f.rl, br: f.br }, gi = +idx.split('.')[1]!
    const w: any = DAYS[0].waves[gi], keepLines = w.intimes.slice()
    f.br = ''; f.rl = minus(f.to, 30)   // a rally later than the suggested brief
    w.intimes = ['00:10 IN TIME']
    for (const h of [dayHTML(0, true), boardHTML(0)]) {
      expect(h).toMatch(new RegExp(`data-(txt|bfld)="ff:${idx.replace(/\./g, '\.')}\.rl"[^>]*data-warnkey="ff:${idx.replace(/\./g, '\.')}\.rl" title="[^"]*rally [0-9:]+ is later than suggested brief`))
    }
    expect(dayHTML(0, true), 'the typed lines do not explain the box’s fault').not.toMatch(/data-reporting-feedback[^>]*>[^<]*rally [0-9:]+ is later than/)
    Object.assign(f, keep); w.intimes = keepLines
  })
})

/* RB9 — a taken suggestion looks taken at once (owner D1038, 19 Oct 26 — "make it shorter so it looks like it's accepted.
   Like a short flash"): not highlighted (on his iPhone the highlight was the suggestion's own blue), the plain blue ring
   for about a second; the first change still replaces it, wherever the caret was (D1030) */
describe('RB9 — a taken suggestion: no highlight, a short flash, the first change replaces it', async () => {
  const { placeSuggestion, firstChange } = await import('./interactions')
  it('firstChange: an insertion anywhere keeps only what was put in; a deletion empties; a whole replacement stays', () => {
    expect(firstChange('09:40', '09:401')).toBe('1')
    expect(firstChange('09:40', '109:40')).toBe('1')
    expect(firstChange('09:40', '09:1540')).toBe('15')
    expect(firstChange('09:40', '09:4')).toBe('')
    expect(firstChange('09:40', '9:40')).toBe('')
    expect(firstChange('09:40', '1')).toBeNull()
    expect(firstChange('09:40', '09:40')).toBeNull()
    expect(firstChange('09:40', '0940')).toBe('')   // the colon taken out: a deletion
  })
  it('the browser\'s kind of change decides where it is given (the fresh read\'s F1): a selection typed over is kept', () => {
    expect(firstChange('10:40', '1', 'insertText'), 'select-all, then "1" of 1100 — not a Backspace').toBeNull()
    expect(firstChange('09:40', '0940', 'insertFromPaste'), 'a paste over the selection — kept').toBeNull()
    expect(firstChange('09:40', '09:4', 'deleteContentBackward')).toBe('')
    expect(firstChange('09:40', '09:401', 'insertText')).toBe('1')
    expect(firstChange('09:40', '09:401', 'deleteContentBackward'), 'a deletion is never read as an insertion').toBeNull()
  })
  it('a second take inside the second gets its own whole ring (the fresh read\'s F2)', async () => {
    const inp = document.createElement('input'); inp.placeholder = '09:40'; document.body.appendChild(inp); inp.focus()
    placeSuggestion(inp)
    await new Promise(r => setTimeout(r, 600))
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); inp.value = ''
    placeSuggestion(inp)
    await new Promise(r => setTimeout(r, 900))
    expect(inp.classList.contains('sugtook'), 'still on 0.9 s into the second take (1.5 s after the first)').toBe(true)
    await new Promise(r => setTimeout(r, 450))
    expect(inp.classList.contains('sugtook')).toBe(false)
    inp.remove()
  })
  it('on a board box and a week box: placed with the caret after it, nothing highlighted, the flash on, then off', async () => {
    const inp = document.createElement('input'); inp.placeholder = '09:40'; document.body.appendChild(inp); inp.focus()
    expect(placeSuggestion(inp)).toBe(true)
    expect([inp.value, inp.selectionStart, inp.selectionEnd]).toEqual(['09:40', 5, 5])
    expect(inp.classList.contains('sugtook')).toBe(true)
    inp.value = '09:4'; inp.dispatchEvent(new Event('input', { bubbles: true }))
    expect(inp.value, 'a Backspace empties the taken time').toBe('')
    expect(inp.classList.contains('sugtook'), '…and the ring goes with it (walkers A, B)').toBe(false)
    inp.value = ''; placeSuggestion(inp)
    expect(inp.classList.contains('sugtook')).toBe(true)
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(inp.classList.contains('sugtook'), 'Escape inside the second ends the ring at once').toBe(false)
    inp.remove()
    const box = document.createElement('span'); box.setAttribute('contenteditable', 'true'); box.dataset.ph = '10:20'; document.body.appendChild(box)
    expect(placeSuggestion(box)).toBe(true)
    expect(box.textContent).toBe('10:20')
    expect(String(window.getSelection()), 'nothing highlighted').toBe('')
    expect(box.classList.contains('sugtook')).toBe(true)
    await new Promise(r => setTimeout(r, 1300))
    expect(box.classList.contains('sugtook'), 'the flash is gone after about a second').toBe(false)
    box.remove()
  })
})

/* RB10 — SC, AVALON and BB lines have their own rally box (D1036, D1040): above START on the week and the next-week peek,
   before B on the board; no worked-out brief or rally in them (D1039); the export and the printed PDF carry the typed
   rally and the typed brief only */
describe('RB10 — a standby line\'s rally box on every surface', async () => {
  const { dayHTML } = await import('./html')
  const { peekDayHTML } = await import('./peek')
  const { makeStandalone } = await import('../engine/waves')
  const add = (kind: string) => { const w: any = makeStandalone(kind); w.formations[0].to = '19:00'; w.formations[0].ld = '07:00'; (DAYS[0] as any).waves.push(w); return { w, gi: (DAYS[0] as any).waves.length - 1 } }
  it('the week, edited and read: R above START, headed R / START, nothing suggested', () => {
    for (const kind of ['sc', 'avalon', 'bb']) {
      const { w, gi } = add(kind)
      w.formations[0].rl = '17:30'
      const ed = dayHTML(0, true), ro = dayHTML(0, false)
      const cell = (h: string) => { const d = document.createElement('div'); d.innerHTML = h; return d.querySelector(`[data-txt="ff:0.${gi}.0.rl"]`) || [...d.querySelectorAll('.form .bto')].find(c => c.textContent!.includes('17:30')) }
      expect(ed, kind + ': the heading').toContain('R<br>START')
      const e = cell(ed) as HTMLElement
      expect(e, kind + ': an editable R box').toBeTruthy()
      expect(e.textContent).toBe('17:30')
      expect(e.dataset.ph || '', kind + ': no default rally').toBe('')
      expect(e.nextElementSibling!.getAttribute('data-txt'), kind + ': START under it').toBe(`ff:0.${gi}.0.to`)
      expect(ro).toContain('17:30')
      ;(DAYS[0] as any).waves.pop()
    }
  })
  it('the next-week peek: R above START', () => {
    const { w } = add('avalon'); w.formations[0].rl = '17:30'
    const d = document.createElement('div'); d.innerHTML = peekDayHTML(DAYS[0], 0, true)
    const rl = [...d.querySelectorAll('.form .bto .rl')].find(e => e.textContent === '17:30')!
    expect(rl, 'the rally drawn').toBeTruthy()
    expect(rl.nextElementSibling!.textContent).toBe('19:00')
    expect(d.innerHTML).toContain('R<br>START')
    ;(DAYS[0] as any).waves.pop()
  })
  it('the export: the typed rally; the brief only where typed', () => {
    const { w } = add('bb'); w.formations[0].cs = 'BBX'
    const row = () => schedRows().find(r => r[3] === 'BBX')!
    expect(row().slice(5, 7), 'nothing typed: no rally, no worked-out brief').toEqual(['', ''])
    w.formations[0].rl = '1730'; w.formations[0].br = '18:00'
    expect(row().slice(5, 7)).toEqual(['17:30', '18:00'])
    ;(DAYS[0] as any).waves.pop()
  })
})

/* RB11 — one tap into a time box, then typing, replaces its time (owner D1047, 19 Oct 26): the first change after a press is
   read on its own — typed digits replace, Backspace clears, a selection typed over keeps what was typed; an arrow key (or a
   second press — e2e) gives back ordinary editing */
describe('RB11 — the first change in a time box tapped into replaces its time', async () => {
  const { armFreshTime } = await import('./interactions')
  const type = (el: HTMLInputElement, v: string, kind: string) => {
    el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: kind }))
    el.value = v
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: kind }))
  }
  const box = (v: string) => { const i = document.createElement('input'); i.className = 'tm'; i.value = v; document.body.appendChild(i); i.focus(); armFreshTime(i); return i }
  it('typed after the time, or in its middle: only what was typed', () => {
    let i = box('16:00'); type(i, '16:001', 'insertText'); expect(i.value).toBe('1')
    type(i, '16', 'insertText'); expect(i.value, 'once only: then ordinary').toBe('16'); i.remove()
    i = box('16:00'); type(i, '16:4500', 'insertText'); expect(i.value).toBe('45'); i.remove()
  })
  it('Backspace clears the time; a selection typed over keeps what was typed', () => {
    let i = box('16:00'); type(i, '16:0', 'deleteContentBackward'); expect(i.value).toBe(''); i.remove()
    i = box('16:00'); type(i, '1', 'insertText'); expect(i.value).toBe('1'); i.remove()
  })
  it('an arrow key or leaving the box gives back ordinary editing', () => {
    let i = box('16:00')
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    type(i, '16:030', 'insertText'); expect(i.value, 'a digit edited in place').toBe('16:030'); i.remove()
    i = box('16:00'); i.blur(); type(i, '16:001', 'insertText'); expect(i.value).toBe('16:001'); i.remove()
  })
})

/* the D1047 read's F1, F2, F4 */
describe('RB11 — a replaced time is saved; chosen digits are edited; Backspace clears from anywhere', async () => {
  const { armFreshTime } = await import('./interactions')
  const box = (v: string) => { const i = document.createElement('input'); i.className = 'tm'; i.value = v; document.body.appendChild(i); i.focus(); armFreshTime(i); return i }
  const type = (el: HTMLInputElement, v: string, kind: string) => {
    el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: kind }))
    el.value = v
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: kind }))
  }
  it('F1: the board is told of the replaced time when the box is left (it saves on change)', () => {
    const i = box('13:00'); let changes = 0; i.addEventListener('change', () => changes++)
    type(i, '13:001', 'insertText'); expect(i.value).toBe('1')
    i.blur(); expect(changes, 'one change, owed').toBe(1)
    i.remove()
  })
  it('F1: …and not twice where the browser raised its own; nothing for a box back to what it showed', () => {
    let i = box('13:00'); let changes = 0; i.addEventListener('change', () => changes++)
    type(i, '13:001', 'insertText'); i.dispatchEvent(new Event('change', { bubbles: true })); i.blur()
    expect(changes).toBe(1); i.remove()
    i = box('13:00'); changes = 0; i.addEventListener('change', () => changes++)
    type(i, '13:001', 'insertText'); i.value = '13:00'; i.blur()
    expect(changes, 'Escape put the old time back').toBe(0); i.remove()
  })
  it('F2: digits chosen with a drag (a press that moved) are edited as chosen', () => {
    const i = box('13:00')
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 50 }))
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 130, clientY: 50 }))
    expect(i.dataset.fresh || '', 'a drag gives back ordinary editing').toBe('')
    i.setSelectionRange(3, 5); type(i, '13:', 'deleteContentBackward'); expect(i.value).toBe('13:'); i.remove()
  })
  it('F2: a tap (a press that did not move) stays armed, whatever the browser selected', () => {
    const i = box('13:00')
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 50 }))
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 102, clientY: 51 }))
    expect(i.dataset.fresh).toBe('1'); i.remove()
  })
  it('F4: Backspace selects the whole time, so it clears wherever the caret is', () => {
    const i = box('13:00'); i.setSelectionRange(0, 0)
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
    expect([i.selectionStart, i.selectionEnd], 'the whole time selected for the key').toEqual([0, 5])
    expect(i.dataset.fresh, 'still armed: the clear is read from what the browser deleted (N1)').toBe('1')
    type(i, '13:0', 'deleteContentBackward')
    expect(i.value, 'a phone that ignored the selection and took one digit: still cleared').toBe(''); i.remove()
  })
})

describe('firstReplace — the browser\'s own word for what was put in wins over the shape', async () => {
  const { firstReplace } = await import('./interactions')
  it('"0915" put into "13:00" after "13:0" is 0915, not 9150', () => {
    expect(firstReplace('13:00', new InputEvent('input', { inputType: 'insertText', data: '0915' }), '13:091500')).toBe('0915')
    expect(firstReplace('13:00', new InputEvent('input', { inputType: 'insertText', data: '1' }), '13:001')).toBe('1')
    expect(firstReplace('13:00', new InputEvent('input', { inputType: 'insertText', data: '1' }), '1'), 'a selection typed over: what was typed').toBe('1')
    expect(firstReplace('09:15', new InputEvent('input', { inputType: 'insertText', data: '1' }), '09:1'), 'a word a single tap left chosen, typed over: a fresh time').toBe('1')
    expect(firstReplace('13:00', new InputEvent('input', { inputType: 'insertCompositionText', data: '001' }), '13:001'), 'an Android composition: read by shape (M1)').toBe('1')
    expect(firstReplace('13:00', new InputEvent('input', { inputType: 'insertReplacementText', data: '1300' }), '13:001'), 'autocorrect: read by shape, not its data (M1)').toBe('1')
    expect(firstReplace('13:00', new InputEvent('input', { inputType: 'deleteContentBackward' }), '13:0')).toBe('')
  })
})

describe('M3 — a scroll started on the armed box keeps it armed; a second tap or a long press does not', async () => {
  const { armFreshTime } = await import('./interactions')
  const armed = () => { const i = document.createElement('input'); i.className = 'tm'; i.value = '16:00'; const w = document.createElement('div'); w.id = 'eWeek'; w.appendChild(i); document.body.appendChild(w); i.focus(); armFreshTime(i); return { i, w } }
  it('pointerdown then a quick pointercancel (a scroll): still armed; pointerdown then pointerup (a tap): disarmed', () => {
    const { i, w } = armed()
    i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }))
    document.dispatchEvent(new PointerEvent('pointercancel'))
    expect(i.dataset.fresh, 'a scroll keeps it').toBe('1')
    i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }))
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 10, clientY: 10 }))
    expect(i.dataset.fresh || '', 'a second tap gives back ordinary editing').toBe('')
    w.remove()
  })
})

describe('M2 pinned — a placed suggestion with digits he chose, typed over, keeps the rest', async () => {
  const { placeSuggestion } = await import('./interactions')
  it('choose "20" of 07:20, type 45: 07:45', () => {
    const inp = document.createElement('input'); inp.placeholder = '07:20'; document.body.appendChild(inp)
    placeSuggestion(inp)
    inp.value = '07:4'
    inp.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '4' }))
    expect(inp.value, 'a chosen-digits edit is not a fresh time').toBe('07:4')
    inp.remove()
  })
})
