// @vitest-environment jsdom
/* "allow Unavailable to be editable too by the scheduler — even down to
   changing the puck; and the input updates automatically when changes are
   made on edit schedule or scheduler board; they should sync" (owner, 14 Aug
   26). Three things are pinned here: the dialog's new Person field (admin
   only), the Unavailable row's puck as a plant/drop target on both the week
   and the board, and that every path writes the SAME INPUTS record — there
   is nowhere else for it to go, so the week, the board and the Inputs page
   all read the one write back. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { INPUTS, inpId, inputCoversDate } from '../engine/inputs'
import { isSpecial } from '../engine/people'
import { SCHED } from '../engine/publish'
import { acceptInput } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import { afterSchedMutate } from '../state/view'
import * as view from '../state/view'
import { commitInputEdit, draftOf, setInpField, reassignInput, removeInput } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { openScheduler } from './board'
import { dayHTML } from './html'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* the reference suite's dnd() idiom, same as drag.test.tsx */
const dnd = async (from: Element, to: Element) => {
  const dt: any = { data: {}, effectAllowed: '', setData(k: string, v: string) { this.data[k] = v }, getData(k: string) { return this.data[k] || '' } }
  const mk = (t: string) => { const ev: any = new Event(t, { bubbles: true, cancelable: true }); try { ev.dataTransfer = dt } catch (_) {} return ev }
  await act(async () => {
    from.dispatchEvent(mk('dragstart'))
    to.dispatchEvent(mk('dragover'))
    to.dispatchEvent(mk('drop'))
    from.dispatchEvent(mk('dragend'))
  })
}

const MON = 'Jul 13'
/* Monday's own seed rows, unmodified by these tests: divot (OML — an
   isUnavail type, no acc needed to show under Unavailable) and vinci
   (Meeting — an ordinary type, so a fresh copy is filed with acc:'u' where a
   test needs that specific shape rather than reusing the seed's own). */
const divot = () => INPUTS.find((i: any) => i.person === 'divot' && i.date === MON)!

let TOASTS: string[] = []
const origToast = HOOKS.toast

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(async () => {
  TOASTS = []
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  if (view.ARM) await act(async () => { view.disarmSlot(); notify() })
})

/* ---- (a) the dialog's Person field — admin only ------------------------- */
describe('the dialog — a Person field, admin only', () => {
  it('an admin sees it, seeded with the row\'s own person', async () => {
    const inp = divot()
    await act(async () => { setInpEdit(inp); notify() })
    const sel = $('#inpEditPerson') as HTMLSelectElement
    expect(sel).toBeTruthy()
    expect(sel.value).toBe(inp.person)
    /* ordering matches rosterOptions() — callsign alpha order, same as the
       Inputs page's own add form, not filed order */
    const labels = $$('#inpEditPerson option').map(o => o.textContent)
    expect(labels).toEqual([...labels].sort((a, b) => (a || '').localeCompare(b || '')))
  })

  it('the footer hint no longer claims the person is Inputs-page-only', async () => {
    await act(async () => { setInpEdit(divot()); notify() })
    expect($('.inped-hint').textContent).toBe('The dates are changed on the Inputs page.')
  })

  it('a member never sees it, even with the dialog forced open on their own row (defence in depth — no button reaches them today)', async () => {
    const inp = divot()
    await act(async () => { setSession({ user: 'user', role: 'member' }); setInpEdit(inp); notify() })
    expect($('#inpEditPerson')).toBe(null)
    expect($('.inped-hint').textContent).toBe('The person and the dates are changed on the Inputs page.')
    await act(async () => { setInpEdit(null); setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('changing Person and saving reassigns the row, keeps it filed and stays open on the SAME record', async () => {
    const inp: any = { person: 'stiff', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'dialog reassign', mod: '' }
    await act(async () => { writeInputsBatch(() => { inpId(inp); INPUTS.unshift(inp) }); notify() })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    await act(async () => { afterSchedMutate(); notify() })
    await act(async () => { setInpEdit(inp); notify() })
    await act(async () => {
      const proto = window.HTMLSelectElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!
      setter.call($('#inpEditPerson'), 'bane')
      $('#inpEditPerson').dispatchEvent(new Event('change', { bubbles: true }))
    })
    await click($('#inpEditSave'))
    expect(inp.person).toBe('bane')
    expect(inp.acc, 'stays filed under Unavailable').toBe('u')
    expect(INPEDIT).toBe(null)
    await act(async () => { removeInput(inp); notify() })
  })
})

/* ---- (b)/(c)/(f) the engine underneath — no mount needed, mirrors
   audit-e-commit-relink.test.tsx's own style for the same machinery. These
   run interleaved with the App-mounted tests above and below exactly as
   inputedit.test.tsx already does (its own "retyping an accepted input"
   block pokes INPUTS directly under a live App with no act() wrapper) — the
   model is the thing under test, not a repaint. ---------------------------- */
const plant = (r: any) => { writeInputsBatch(() => { inpId(r); INPUTS.unshift(r) }); return r }
const scrap = (r: any) => { if (INPUTS.indexOf(r) >= 0) removeInput(r) }

describe('reassignInput — the shared write both the dialog and the puck use', () => {
  it('reassigning a filed (acc:"u") input keeps it filed, same row, same iid', () => {
    const inp: any = plant({ person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'handover', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    const iid = inp.iid
    expect(reassignInput(iid, 'stiff')).toBe(true)
    expect(inp.person).toBe('stiff')
    expect(inp.acc, 'still filed under Unavailable').toBe('u')
    expect(inp.iid, 'the SAME input record, not a replacement').toBe(iid)
    expect(INPUTS.indexOf(inp)).toBeGreaterThanOrEqual(0)
    expect(TOASTS.some(m => /is now unavailable instead of/i.test(m)), TOASTS.join('|')).toBe(true)
    scrap(inp)
  })

  it('refuses a no-op reassign onto the same person, silently', () => {
    const inp: any = plant({ person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'noop', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    expect(reassignInput(inp.iid, 'bane')).toBe(false)
    expect(inp.person).toBe('bane')
    scrap(inp)
  })

  it('a stale iid (the input was deleted underneath it) is refused and toasts', () => {
    expect(reassignInput('not-a-real-iid', 'bane')).toBe(false)
    expect(TOASTS.some(m => /no longer there/i.test(m))).toBe(true)
  })

  it('refuses a SENTINEL placeholder (ALL AVAIL etc.) — the roster palette still offers them, this dialog\'s own Person field does not', () => {
    const inp: any = plant({ person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'sentinel refusal', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    expect(reassignInput(inp.iid, 'allavail')).toBe(false)
    expect(inp.person).toBe('bane')
    scrap(inp)
  })

  it('refuses a reassign for a non-scheduler — the write-path role backstop', () => {
    const inp: any = plant({ person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'role backstop', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    setSession({ user: 'user', role: 'member' })   // a member may edit their own inputs, not reassign whose day this is
    expect(reassignInput(inp.iid, 'stiff')).toBe(false)
    expect(inp.person).toBe('bane')                // unchanged
    setSession({ user: 'a', role: 'admin' })
    scrap(inp)
  })
})

/* THE LATENT-BUG PIN (task brief, 14 Aug 26). Read against the CURRENT code
   (not an older snapshot) both of these already pass — commitInputEdit's
   re-accept branch calls acceptInput(di, r, wasAcc) with wasAcc carried
   through unchanged, and acceptInput's dest==='u' branch has no ground-row
   assumption baked into it, so a filed 'u' input already survives an edit of
   any field, person included. These are pinned as REGRESSION guards: if a
   future change narrows that branch back to the 'g' path only (the shape the
   task brief described as the bug), both of these fail immediately. */
describe('a filed (acc:"u") input survives an edit of any field — regression pins', () => {
  it('a TIME edit keeps it filed', () => {
    const inp: any = plant({ person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'time pin', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    expect(setInpField(inp, 'str', '07:00')).toBe(true)
    expect(inp.s).toBe(420)
    expect(inp.acc, 'the Unavailable filing survives a TIME edit').toBe('u')
    scrap(inp)
  })

  it('a PERSON edit keeps it filed (the shape the task brief called the bug)', () => {
    const inp: any = plant({ person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'person pin', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    const draft = draftOf(inp); draft.person = 'stiff'
    expect(commitInputEdit(inp, draft)).toBe(true)
    expect(inp.person).toBe('stiff')
    expect(inp.acc, 'the Unavailable filing survives a PERSON edit').toBe('u')
    scrap(inp)
  })
})

describe('a multi-day filing stays filed on every covered day after a person change', () => {
  it('re-files Tue/Wed/Thu under the new name, not just the start day', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 14', endDate: 'Jul 16', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'span reassign', mod: '' })
    expect(acceptInput(1, inp, 'u')).toBe(true)
    afterSchedMutate()
    const token = inp.iid
    const keysFor = (id: string) => Object.keys(SCHED.pending).filter(k => k.startsWith('inp:') && k.endsWith('.' + id)).sort()
    expect(keysFor(token)).toEqual([`inp:1.${token}`, `inp:2.${token}`, `inp:3.${token}`])
    expect(reassignInput(token, 'bane')).toBe(true)
    expect(inp.person).toBe('bane')
    expect(inp.acc).toBe('u')
    expect(keysFor(token), 'every covered day still carries the filing mark').toEqual([`inp:1.${token}`, `inp:2.${token}`, `inp:3.${token}`])
    expect(['Jul 14', 'Jul 15', 'Jul 16'].every(dt => inputCoversDate(inp, dt))).toBe(true)
    scrap(inp)
  })
})

/* ---- (e) view-only draws NO plant/drop affordance ------------------------ */
describe('markup — who gets the plant/drop address', () => {
  it('the edit week carries data-inpseat on Unavailable pucks', () => {
    const h = dayHTML(0, true)
    expect(h).toMatch(new RegExp(`data-inpseat="${divot().iid}"`))
  })
  it('the edit week does NOT carry it on Personal Inputs pucks (that group has no puck-swap control)', () => {
    const h = dayHTML(0, true)
    const inpGrp = h.slice(h.indexOf('sec-inp'), h.indexOf('sec-unav'))
    expect(inpGrp).not.toContain('data-inpseat')
  })
  it('view-only Sched draws the same Unavailable block with no data-inpseat at all', () => {
    const h = dayHTML(0, false)
    expect(h).toMatch(/sec-unav/)
    expect(h).not.toContain('data-inpseat')
  })
})

/* ---- (d) the puck as a live plant/drop target, on both surfaces ---------- */
describe('the puck itself — armed tap, and drag, on both surfaces', () => {
  it('an armed tap onto the week\'s Unavailable puck reassigns it, and the board shows the same row', async () => {
    const row = divot()                               // captured once — its .person is about to change
    const iid = row.iid
    const seat = () => $(`#eWeek .day[data-day="0"] [data-inpseat="${iid}"]`)
    expect(seat(), 'the target renders').toBeTruthy()
    expect(seat().querySelector('.puck')?.getAttribute('data-person')).toBe('divot')

    await click(seat())                              // arm it
    expect(view.armedKey()).toBe(`iu:${iid}`)
    const next = $$('#eRoster .rpuck[data-person]').find(p => p.dataset.person !== 'divot' && !isSpecial(p.dataset.person))!
    await click(next)                                 // plant — reassigns

    expect(view.armedKey(), 'the arm is put down by the plant').toBe('')
    expect(row.person, 'the seed row itself moved').toBe(next.dataset.person)
    expect(seat().querySelector('.puck')?.getAttribute('data-person'), 'the week repainted with the new puck').toBe(next.dataset.person)

    /* the board opened on the SAME day reads the SAME record back */
    await act(async () => { openScheduler(0); notify() })
    const boardSeat = $(`#schedBoard .unav [data-inpseat="${iid}"]`)
    expect(boardSeat, 'the board draws the same row').toBeTruthy()
    expect(boardSeat.querySelector('.puck')?.getAttribute('data-person'), 'and the same new person').toBe(next.dataset.person)
    await click($('#sbClose'))

    /* put it back so later tests (and any that follow in the file) see the
       seed's original shape */
    await act(async () => { reassignInput(iid, 'divot'); notify() })
  })

  it('a puck dragged from the roster onto the board\'s Unavailable seat reassigns it, without a ground-seat write anywhere', async () => {
    const inp: any = { person: 'bane', date: MON, allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'drag target', mod: '' }
    await act(async () => { writeInputsBatch(() => { inpId(inp); INPUTS.unshift(inp) }); notify() })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    await act(async () => { afterSchedMutate(); notify() })

    await act(async () => { openScheduler(0); notify() })
    const target = $(`#schedBoard .unav [data-inpseat="${inp.iid}"]`)
    expect(target, 'the board draws the freshly-filed row').toBeTruthy()
    const src = $$('#sbRoster .rpuck[data-person]').find(p => p.dataset.person !== 'bane' && !isSpecial(p.dataset.person))!
    await dnd(src, target)

    expect(inp.person).toBe(src.dataset.person)
    expect(inp.acc, 'no eligibility bar, no side effect on any schedule seat — a pure data edit').toBe('u')
    await click($('#sbClose'))

    await act(async () => { removeInput(inp); notify() })
  })
})
