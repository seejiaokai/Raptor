// @vitest-environment jsdom
/* The medical clash sheet (owner, 27 Aug 26 — "ask at save time"): a new
   medical entry overlapping a DIFFERENT-type one never resolves silently.
   The sheet forces a choice per clash — the new entry takes the shared days,
   or the existing status keeps them and the new entry is filed around it
   (splitting into pieces where needed). Driven through the REAL InputEditor
   over the real store, the upconfirm harness idiom. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch, HIST } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setInpEdit, INPEDIT } from './pops'
import { docAdd } from '../state/docs'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const freshDoc = () => docAdd(new Blob(['x'], { type: 'image/png' }) as any).id
const ISNAP = JSON.stringify(INPUTS)
let TOASTS: string[] = []

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(async () => {
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  TOASTS = []
})

const plant = (r: any) => { writeInputsBatch(() => { INPUTS.unshift({ allday: true, remarks: '', mod: 'now', yr: 2026, ...r }) }); return INPUTS[0] }
/* a new medical entry through the shared dialog (the Unavailable + Add ctx) */
const openMedAdd = async (type: string, date: string, endDate?: string) => {
  await act(async () => {
    setInpEdit({ _new: true, _ctx: 'u', person: 'bane', type, date, ...(endDate ? { endDate } : {}), allday: true, yr: 2026, remarks: '', docId: freshDoc() })
    notify()
  })
}
const rows = (type: string) => INPUTS.filter((r: any) => r.person === 'bane' && r.type === type)
const spanOf = (r: any) => r.date + (r.endDate ? '-' + r.endDate : '')

describe('the clash sheet gates a different-type overlap', () => {
  it('Save opens the sheet instead of writing; the choice is forced; Cancel writes nothing', async () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash"]'), 'the clash sheet is up').toBeTruthy()
    expect(rows('ATT B'), 'nothing written yet').toHaveLength(0)
    expect(($('[data-testid="medclash-save"]') as HTMLButtonElement).disabled, 'unanswered clash blocks the save').toBe(true)
    expect($('[data-testid="medclash-0"]')!.textContent).toContain('Jul 13 – Jul 15')
    await click($('.upconf-foot .abtn.ghost'))
    expect($('[data-testid="medclash"]'), 'sheet gone').toBeFalsy()
    expect(rows('ATT B'), 'Cancel wrote nothing').toHaveLength(0)
    expect(rows('ATT C')[0].endDate, 'the old status untouched').toBe('Jul 15')
  })
  it('"new replaces" trims the old row — the programmatic default, now chosen out loud', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    const depth = HIST.stack.length
    await openMedAdd('ATT B', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg button'))               // "ATT B replaces"
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate).toBe('Jul 12')
    expect(rows('ATT B').map(spanOf)).toEqual(['Jul 13-Jul 18'])
    expect(HIST.stack.length, 'one undo step').toBe(depth + 1)
  })
  it('"Keep till" files the new entry AROUND the kept status, and the button names the date', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    const keep = $('[data-testid="medclash-0"] .seg').querySelectorAll('button')[1]
    expect(keep.textContent, 'the keep button says what survives').toBe('Keep ATT C till Jul 15')
    await click(keep)
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate, 'the kept status is untouched').toBe('Jul 15')
    expect(rows('ATT B').map(spanOf), 'the new entry starts after it').toEqual(['Jul 16-Jul 18'])
  })
  it('keeping a status in the MIDDLE splits the new entry into two rows, one undo step', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 13', endDate: 'Jul 14' })
    const depth = HIST.stack.length
    await openMedAdd('ATT B', 'Jul 10', 'Jul 20')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg').querySelectorAll('button')[1])
    await click($('[data-testid="medclash-save"]'))
    expect(c.date + '-' + c.endDate).toBe('Jul 13-Jul 14')
    expect(rows('ATT B').map(spanOf).sort()).toEqual(['Jul 10-Jul 12', 'Jul 15-Jul 20'])
    expect(HIST.stack.length, 'the split lands as one undo step').toBe(depth + 1)
  })
  // The forced-'new' rule (owner, 28 Aug 26 — "no ATT C keeps them button"):
  // a status covering the WHOLE new entry cannot be kept whole (keeping it
  // would swallow the entry — the old "nothing left to file" dead end, still
  // a commit-side backstop for multi-clash combinations). The sheet offers
  // only the pre-lit "replaces" pill; the leftover Remove/Keep is the choice.
  it('a status covering the WHOLE new entry offers no keep button — replace is forced', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 20' })
    await openMedAdd('ATT B', 'Jul 13', 'Jul 14')
    await click($('#inpEditSave'))
    const pills = $('[data-testid="medclash-0"] .seg').querySelectorAll('button')
    expect(pills, 'one pill only — keeping whole would swallow the entry').toHaveLength(1)
    expect(pills[0].className, 'and it is pre-selected').toContain('on-keep')
    expect($('[data-testid="medclash-tail-0"]')!.textContent, 'the leftover is up at once').toContain('Jul 15 – Jul 20')
    expect(($('[data-testid="medclash-save"]') as HTMLButtonElement).disabled, 'nothing left to answer').toBe(false)
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate, 'the head survives, trimmed to the day before').toBe('Jul 12')
    expect(rows('ATT B').map(spanOf)).toEqual(['Jul 13-Jul 14'])
    expect(rows('ATT C').map(spanOf), 'the Remove default dropped the 15–20 leftover').toEqual(['Jul 10-Jul 12'])
  })
  // The leftover Remove/Keep (owner, 28 Aug 26): a status overtaken in the
  // MIDDLE leaves a tail past the new entry. The sheet asks about it under that
  // clash, defaulting to Remove — the one choice here that carries a default.
  it('the owner\'s case — ATT C 10–15, new ATT B 12–13: forced replace, the Remove default drops the tail', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 12', 'Jul 13')
    await click($('#inpEditSave'))
    /* the entry sits wholly inside ATT C, so replace is forced and the
       leftover question is up without a click */
    expect($('[data-testid="medclash-0"] .seg').querySelectorAll('button')).toHaveLength(1)
    expect($('[data-testid="medclash-tail-0"]'), 'the leftover is asked at once').toBeTruthy()
    expect($('[data-testid="medclash-tail-0"]')!.textContent).toContain('Jul 14 – Jul 15')
    expect($('[data-testid="medclash-tail-0"]')!.textContent, 'the removal is shown, not silent').toContain('will be removed')
    expect(($('[data-testid="medclash-save"]') as HTMLButtonElement).disabled, 'the leftover default lets Save go').toBe(false)
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate).toBe('Jul 11')
    expect(rows('ATT C'), 'the leftover was removed — only the head remains').toHaveLength(1)
  })
  it('keeping the leftover mints it — both days on record', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 12', 'Jul 13')
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-tail-0"] .seg').querySelectorAll('button')[1])   // "Keep them"
    await click($('[data-testid="medclash-save"]'))
    expect(c.endDate).toBe('Jul 11')
    const tail = rows('ATT C').find((r: any) => r !== c)
    expect(tail && spanOf(tail), 'the full leftover is on record, the 15th included').toBe('Jul 14-Jul 15')
  })
  it('the leftover question follows the live choice where a choice exists', async () => {
    /* the new entry starts BEFORE the old status, so keeping it is possible
       (the entry's 8–9 head still files) and both pills draw — the geometry
       where the leftover question must come and go with the choice */
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT B', 'Jul 8', 'Jul 13')
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash-0"] .seg').querySelectorAll('button')).toHaveLength(2)
    expect($('[data-testid="medclash-tail-0"]'), 'no leftover until the new entry takes the days').toBeFalsy()
    await click($('[data-testid="medclash-0"] .seg button'))               // "ATT B replaces" → leftover appears
    expect($('[data-testid="medclash-tail-0"]')!.textContent).toContain('Jul 14 – Jul 15')
    await click($('[data-testid="medclash-0"] .seg').querySelectorAll('button')[1])   // switch to "Keep ATT C till Jul 15"
    expect($('[data-testid="medclash-tail-0"]'), 'no leftover when the old status is kept whole').toBeFalsy()
  })
  // The 28 Aug review's finding: when a KEPT middle status splits the new
  // entry, a kept leftover on ANOTHER clash used to be measured past the wrong
  // (segment) end and silently dropped. It must survive whole, past the ENTRY
  // end. Reaches a restore-held two-row overlap (planted directly).
  it('a kept leftover survives when another status is kept in the middle (multi-segment)', async () => {
    const oml = plant({ person: 'bane', type: 'OML', date: 'Jul 13', endDate: 'Jul 14' })
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 25' })   // INPUTS[0] → clash 0
    await openMedAdd('ATT B', 'Jul 10', 'Jul 20')
    await click($('#inpEditSave'))
    // clash 0 = ATT C covers the whole entry → replace is FORCED, its
    // leftover question up without a click; KEEP that leftover
    expect($('[data-testid="medclash-0"] .seg').querySelectorAll('button')).toHaveLength(1)
    expect($('[data-testid="medclash-tail-0"]')!.textContent, 'the leftover is past the ENTRY end').toContain('Jul 21 – Jul 25')
    await click($('[data-testid="medclash-tail-0"] .seg').querySelectorAll('button')[1])   // Keep them
    // clash 1 = OML: keep it in the middle (splits the new ATT B around it)
    await click($('[data-testid="medclash-1"] .seg').querySelectorAll('button')[1])
    await click($('[data-testid="medclash-save"]'))
    expect(INPUTS.indexOf(c), 'the original ATT C head is gone (started on the entry)').toBe(-1)
    expect(rows('ATT C').map(spanOf), 'the kept leftover is whole, past the entry — not dropped, not overlapping').toEqual(['Jul 21-Jul 25'])
    expect(oml.date + '-' + oml.endDate, 'the middle-kept OML is untouched').toBe('Jul 13-Jul 14')
    expect(rows('ATT B').map(spanOf).sort(), 'the new entry filed around the kept OML').toEqual(['Jul 10-Jul 12', 'Jul 15-Jul 20'])
  })
  it('a same-type overlap never reaches the sheet — the edit-instead refusal stands', async () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15' })
    await openMedAdd('ATT C', 'Jul 13', 'Jul 18')
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash"]')).toBeFalsy()
    expect(TOASTS.join(' ')).toContain('already filed over these days')
  })
})

/* The upload control manages SEVERAL files (owner, 1 Sep 26): one chip per
   attached file with its own ✕, an Add button for more — all draft-only
   until Save, through the real InputEditor. */
describe('the upload control with several files', () => {
  it('shows a chip per file, removes one on its ✕, and the removal saves', async () => {
    const a = freshDoc(), b = freshDoc()
    const row = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13', docId: a, docIds: [a, b] })
    await act(async () => { setInpEdit(row); notify() })
    expect(document.querySelectorAll('.docfield .docchip').length, 'one chip per attached file').toBe(2)
    expect($('.docfield .docbtn')!.textContent).toContain('Add')
    await click(document.querySelectorAll('.docfield .docdel')[0])
    expect(document.querySelectorAll('.docfield .docchip').length, 'the ✕ dropped its file from the draft').toBe(1)
    await click($('#inpEditSave'))
    expect(rows('ATT C')[0].docId, 'the remaining file is the record now').toBe(b)
    expect(rows('ATT C')[0].docIds, 'one file folds back to the single shape').toBeUndefined()
  })
  it('removing the last chip refuses the save and keeps the dialog open', async () => {
    const a = freshDoc()
    const row = plant({ person: 'bane', type: 'OML', date: 'Jul 20', endDate: 'Jul 22', docId: a })
    await act(async () => { setInpEdit(row); notify() })
    expect(document.querySelectorAll('.docfield .docchip').length).toBe(1)
    await click(document.querySelectorAll('.docfield .docdel')[0])
    await click($('#inpEditSave'))
    expect(TOASTS.join(' ')).toContain('Keep at least one document')
    expect($('#inpEditSave'), 'the dialog stayed open, nothing typed is lost').toBeTruthy()
    expect(rows('OML')[0].docId, 'the record keeps its file').toBe(a)
  })
})
