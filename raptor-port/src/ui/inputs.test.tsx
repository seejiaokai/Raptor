// @vitest-environment jsdom
/* The Inputs page — tfin's inputs assertions plus the B26/B48 model rules
   driven through the page: role-gated add/delete, the undo stack, and the
   week revalidating when an input lands. */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo } from '../state/store'
import { INPUTS, INPUT_TYPES, DATES, inputRuleText, inpId } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { acceptInput, acceptedDay } from '../engine/slots'
import { canEditSched } from '../state/auth'
import { HIST } from '../state/history'
import { ELOG } from '../engine/editlog'
import { validate } from '../engine/validate'
import { InputsPage, initialRange } from './InputsPage'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { ME, setMe } from '../state/auth'
import { draftOf, commitInputEdit, commitNewInput, removeInput } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
/* The table is sorted by start date now (owner, Aug 5), so DOM row order is
   no longer INPUTS order. A test that means "the row for INPUTS[n]" has to say
   so — a row carries its input's own id (the pencil and the cross that used to
   carry the model index are gone: below). */
const rowFor = (inx: number) => {
  const r = INPUTS[inx]
  /* a record a test pushed straight into the list has no id until a command mints one */
  if (!r.iid) { inpId(r); act(() => { notify() }) }
  return $$('#inBody tr').find(tr => tr.dataset.iid === String(r.iid))!
}
/* THE LIST HAS NO PENCIL AND NO CROSS (owner D718, D723 — 10 Oct 26: "the edit and cross is not needed because … u can
   click on it to edit it or delete it"; the plan docs/superpowers/plans/2026-10-10-input-card-plan.md §2.3, §5). Every
   test below that pressed the row's ✎, its ✓ or its ✕ is RESTATED for the door that does that work now — the row
   opens the input's own window, which changes it and deletes it. The claims are the same; only the door moved. */
const D = (sel: string) => document.querySelector(sel) as HTMLElement
/* the window itself (the closed dialog's empty shell, `#inpEditPop`, stays in the page — so that is never the test) */
const W = () => document.querySelector('[data-testid="win-inputedit"]') as HTMLElement | null
const openRow = async (inx: number) => {
  const row = rowFor(inx)
  expect(row, 'the row is on the page').toBeTruthy()
  await click(row.querySelector('[data-testid="in-open"]'))
  expect(W(), 'the input’s window opened').toBeTruthy()
}
const delRow = async (inx: number) => { await openRow(inx); await click(D('#inpEditDel')) }
const setWin = async (sel: string, v: string) => act(async () => {
  const el = D(sel) as any
  const isSel = el instanceof window.HTMLSelectElement
  Object.getOwnPropertyDescriptor((isSel ? window.HTMLSelectElement : window.HTMLInputElement).prototype, 'value')!.set!.call(el, v)
  el.dispatchEvent(new Event(isSel ? 'change' : 'input', { bubbles: true }))
})
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

/* THE LIST HAS NO ADD FORM OF ITS OWN (owner D729 — the design vet's V1, 10 Oct 26: "one '+ Input' button … opens the
   same window the calendar opens"; the plan docs/superpowers/plans/2026-10-10-inputs-vet-plan.md §2, §3). Every test
   below that drove the form — its Person, its calendar, How long, the two times, Type and its "?", Title, Remarks,
   "Add input" — is RESTATED for that window: the claim is the same, only the door moved. Two things differ by the
   door itself and are said where they matter: the window opens FRESH each time (the form kept its dates and its kind
   for the next add), and it opens on the calendar's first kind, a duty, where the form opened on LL. */
const openNew = async () => {
  await click($('#inNew'))
  expect(W(), 'the new input’s window opened').toBeTruthy()
}
const cancelNew = async () => { if (W()) await click(D('#inpEditCancel')) }
/* a day of July 2026 on the window's own calendar (it opens on that month while no date is picked) */
const calDay = (iso: string) => D(`#inpEdCal [data-cal="${iso}"]`)
/* the window's type list, for the tests that need a type with (or without) the AM/PM span picker */
const setType = async (v: string) => setWin('#inpEditType', v)
const addNow = async () => click(D('#inpEditSave'))

/* The table opens on a today → +2-months window (owner, Aug 5). The seeded
   demo inputs are July 2026, so with the default window every assertion about
   ROWS below would really be an assertion about the window. Widen it once in
   beforeAll; the window itself has its own describe at the bottom. */
const showAllDates = async () => {
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeAll'))
}
const useDefaultRange = async () => {
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeDef'))
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'inputs')!)
  await click($('#inListBtn')) // D580: these list assertions enter the secondary view.
  await showAllDates()
})

describe('the Inputs page (tfin)', () => {
  it('inputs rows', () => {
    expect($$('#inBody tr').length).toBeGreaterThanOrEqual(4)
  })

  /* the form is gone, and one button stands in its place — at the left of the dates button (D729 — V1) */
  it('the list has no add form of its own: one "+ Input" button, first in its row of tools', async () => {
    for (const gone of ['.inbar', '.ingrid', '#inAdd', '#inType', '#inRemarks', '#inCal', '#inStartT', '#inEndT', '#inSpan', '#inAllday', '#inPerson', '#inPersonFixed', '#inTitle', '#inDates'])
      expect($(gone), gone + ' went with the form').toBeFalsy()
    const btn = $('#inNew')
    expect(btn, 'the button').toBeTruthy()
    expect(btn.textContent).toBe('+ Input')
    expect(btn.classList.contains('primary'), 'the page’s one filled button').toBe(true)
    const tools = [...btn.parentElement!.children].filter(c => !(c as HTMLElement).hidden)
    expect(tools[0], 'it comes first').toBe(btn)
    expect(tools[1].contains($('#inRangeBtn')), 'the dates button is next').toBe(true)
    expect(W(), 'nothing is open until it is pressed').toBeFalsy()
    await openNew()
    expect(D('[data-testid="win-inputedit"] .fw-title, [data-testid="win-inputedit"] .win-title, [data-testid="win-inputedit"]')!.textContent).toContain('New input')
    expect(D('#inpEdCal'), 'the window carries the date calendar').toBeTruthy()
    expect(D('#inpEditPop .rc-read')!.textContent, 'and no date is picked for him').toBe('pick a start date')
    expect((D('#inpEditPerson') as unknown as HTMLSelectElement).value, 'filed for whoever is signed in, until he picks').toBe(ME)
    await cancelNew()
    expect(W()).toBeFalsy()
  })

  it('no TDY, and the retired types are gone', async () => {
    await openNew()
    const opts = [...(D('#inpEditType') as unknown as HTMLSelectElement).options].map(o => o.value)
    expect(opts).not.toContain('TDY')
    /* removed Aug 26 — Office was a desk marker nobody read, and the two
       "Available" types were offers rather than commitments */
    for (const dead of ['Office', 'Available fly', 'Available duty'])
      expect(opts).not.toContain(dead)
    expect(opts).toContain('OD')
    await cancelNew()
  })

  /* THE REPEAT-WEEKS FEATURE IS GONE (owner, 22 Aug 26 — "remove repeated
     weeks everywhere"). It never expanded anywhere — the record stored one
     span and only the calendar question exposed that — so the field, the
     column and the recur write all left together. Pinned so a later "the
     form looks thin" pass does not put it back. */
  it('no Repeat wks field, no Recurring column, and an add writes no recur', async () => {
    expect($('#inRepeat'), 'the Repeat wks field is gone').toBeFalsy()
    expect($('#intbl thead th[data-sort="recur"]'), 'the Recurring heading is gone').toBeFalsy()
    /* the add needs a start date — picked on the window's own calendar */
    await openNew()
    await click(D('#inpEdCal [data-cal]'))
    const n = INPUTS.length
    await addNow()
    expect(INPUTS.length).toBe(n + 1)
    expect('recur' in INPUTS[0], 'a fresh record carries no recur field').toBe(false)
    await delRow(0)
    expect(INPUTS.length).toBe(n)
  })

  /* All day owns the whole window, so the two time boxes go out of play (owner, Aug 5). The List's form DIMMED them;
     the window, which is the one door now, PUTS THEM AWAY — a box that cannot be typed in is not drawn at all. */
  it('All day puts the two time boxes away, and Custom brings them back', async () => {
    await openNew()
    await setType('LL')            // a leave type carries the four-way span picker rather than the tick (owner, 10 Aug 26)
    const times = () => D('#inpEditStart')!.closest('.inped-t') as HTMLElement
    expect(D('#inpEditSpan [data-span="all"]')!.getAttribute('aria-pressed'), 'leave opens all-day').toBe('true')
    expect(times().hidden, 'the two times are out of play under All day').toBe(true)
    await click(D('#inpEditSpan [data-span="custom"]'))
    expect(times().hidden, 'and back under Custom').toBe(false)
    await click(D('#inpEditSpan [data-span="all"]'))
    expect(times().hidden).toBe(true)
    await cancelNew()
  })

  /* THE HALF-DAYS. AM and PM fill in the two time fields the form already had
     — nothing new is stored but the label — and the picker is offered for
     leave and medical types only, because the rest already take an exact
     range, which is finer than a half. */
  it('AM and PM fill the window, and only leave and medical are offered them', async () => {
    const st = () => D('#inpEditStart') as HTMLInputElement
    const en = () => D('#inpEditEnd') as HTMLInputElement
    await openNew()
    await setType('LL')
    await click(D('#inpEditSpan [data-span="am"]'))
    expect([st().value, en().value]).toEqual(['00:00', '12:00'])
    await click(D('#inpEditSpan [data-span="pm"]'))
    expect([st().value, en().value]).toEqual(['12:01', '23:59'])
    /* the minutes reach the model, and the half rides along as a label */
    await click(calDay('2026-07-13'))
    await addNow()
    expect(INPUTS[0].allday).toBe(false)
    expect([INPUTS[0].s, INPUTS[0].e]).toEqual([721, 1439])
    expect(INPUTS[0].half).toBe('pm')
    await act(async () => { undo() })
    /* an activity type keeps the plain tick, and carries no half */
    await openNew()
    await setType('Training')
    expect(D('#inpEditSpan')).toBeFalsy()
    expect(D('#inpEditAllday')).toBeTruthy()
    await click(calDay('2026-07-13'))
    await addNow()
    expect(INPUTS[0].type).toBe('Training')
    expect(INPUTS[0].half).toBeUndefined()
    await act(async () => { undo() })
  })

  /* the All day default follows the type (owner, 22 Aug 26): every "Duty &
     other commitments" type but SANS opens timed, so the box lands UNTICKED;
     leave, medical and SANS keep it ticked. It is a default, re-seeded on each
     type change, so the record written by an untouched form proves it. */
  it('unticks All day by default for Duty & other commitments, but not SANS or leave', async () => {
    await openNew()
    /* every timed "Duty & other commitments" type opens with the plain tick
       UP and UNCHECKED — the whole group bar SANS (the record a timed window
       actually lands from is pinned in boardaddinput.test.tsx's Meeting add) */
    for (const t of ['Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Duty', 'OD', 'Other']) {
      await setType(t)
      expect(D('#inpEditSpan'), `${t} takes the plain tick, not the span picker`).toBeFalsy()
      expect((D('#inpEditAllday') as HTMLInputElement).checked, `${t} opens unticked`).toBe(false)
    }
    /* SANS Availability — the group's one carve-out — is not offered by the Inputs tab's window (owner D620, 7 Oct 26: it
       is filed on the SANS calendar only); that it opens all-day with the span picker is pinned on that calendar's own
       form, ui/sansform.test.tsx */
    expect(Array.from((D('#inpEditType') as unknown as HTMLSelectElement).options).map(o => o.value)).not.toContain('SANS Availability')
    /* a leave type is unchanged — still opens all-day */
    await setType('LL')
    expect((D('#inpEditSpan [data-span="all"]') as HTMLElement).getAttribute('aria-pressed'), 'leave opens all-day').toBe('true')
    await cancelNew()
  })

  /* switching away from a half-capable type must not strand an invisible half
     on the record — the row would claim a window nobody could see or change */
  it('changing to a type with no halves clears the half', async () => {
    await openNew()
    await setType('LL')
    await click(D('#inpEditSpan [data-span="am"]'))
    await setType('Appointment')
    await click(calDay('2026-07-13'))
    await addNow()
    expect(INPUTS[0].half).toBeUndefined()
    await act(async () => { undo() })
  })

  /* the legend the owner asked for: a button by the type field, generated from
     the same table the rules come off, so it cannot describe a rule the engine
     does not apply */
  /* IT STANDS BESIDE "TYPE" IN THE INPUT'S WINDOW NOW (D729 — V1; ui/TypeLegend.tsx): it lived only in the List's form,
     and it is the one place that says ATT B may still stand a duty */
  it('the type legend opens beside Type in the window, names every type, and closes on an outside click', async () => {
    await openNew()
    expect(D('#inTypePop'), 'closed to start with').toBeFalsy()
    const help = D('#inTypeHelp')
    expect(help, 'the "?" is in the window').toBeTruthy()
    expect(W()!.contains(help), 'inside the window itself').toBe(true)
    expect(help.closest('.inped-f')!.contains(D('#inpEditType')), 'in the Type field').toBe(true)
    expect(help.closest('label'), 'and not inside the field’s label — a press on it is never a press on the list').toBeNull()
    await click(help)
    const pop = D('#inTypePop')!
    expect(pop, 'opens on the ?').toBeTruthy()
    for (const t of INPUT_TYPES) expect(pop.textContent, t).toContain(t)
    /* and it says what each one DOES, not just what it stands for */
    expect(pop.textContent).toContain('may still stand an SC SPARE')
    expect(pop.textContent).toContain('no flying')
    expect(pop.textContent).toContain('overseas')
    await act(async () => { document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
    expect(D('#inTypePop'), 'closes on a press outside').toBeFalsy()
    expect(W(), 'the window is still open').toBeTruthy()
    /* Escape closes the card and nothing else — the window, and what is typed in it, stay */
    await click(D('#inTypeHelp'))
    expect(D('#inTypePop')).toBeTruthy()
    await act(async () => { D('#inTypeHelp').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(D('#inTypePop'), 'Escape closed the card').toBeFalsy()
    expect(W(), '…and not the window').toBeTruthy()
    await cancelNew()
  })
  it('a SAVED input’s window carries the same "?"', async () => {
    await openRow(0)
    expect(D('#inTypeHelp'), 'there too').toBeTruthy()
    await click(D('#inTypeHelp'))
    expect(D('#inTypePop')!.textContent).toContain('What each type means')
    await act(async () => { document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
    await click(D('#inpEditCancel'))
  })

  it('every type in the legend shows the shared inputRuleText — the same source the Logic page reads', async () => {
    /* the drift seam the owner flagged (30 Aug 26): this "?" legend and the
       Logic page's type matrix must not tell different stories. Both render
       engine/inputs.ts inputRuleText, so this guard fails a gate the moment
       either surface stops reading the shared source — the same shape as the
       wave-kind guard in logic.test. */
    await openNew()
    await click(D('#inTypeHelp'))
    const pop = D('#inTypePop')!
    const missing = INPUT_TYPES.filter((t: string) => pop.textContent!.indexOf(inputRuleText(t)) < 0)
    expect(missing, missing.join(',')).toEqual([])
    await act(async () => { document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
    await cancelNew()
  })

  /* The "all people" option used to read "Personnel"; that word now names the
     ground-crew CATEGORY, so the filter's all-option is "Everyone" to keep the
     two apart. */
  it('the person filter all-option is Everyone, not a category name', () => {
    const first = ($('#inFPerson') as unknown as HTMLSelectElement).options[0]!
    expect(first.textContent).toBe('Everyone')
  })

  it('an admin add lands in INPUTS, the table, and the undo stack', async () => {
    const n = INPUTS.length
    await openNew()
    await click(calDay('2026-07-13'))   // a start date is required
    await setWin('#inpEditRmk', 'PHASE4C TEST')
    await addNow()
    expect(W(), 'added: the window has closed').toBeFalsy()
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].remarks).toBe('PHASE4C TEST')
    expect($$('#inBody tr').length).toBeGreaterThanOrEqual(5)
    /* personal inputs join the undo stack */
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  /* the timing fields (owner, Aug 26): All day writes 0–1439, and Custom frees the two time
     boxes so the stated minutes land on the input */
  it('a timed add stores the stated minutes; all-day stays 0–1439', async () => {
    const fresh = async () => { await openNew(); await setType('LL'); await click(calDay('2026-07-13')) }
    await fresh()
    await addNow()
    expect(INPUTS[0].s).toBe(0)
    expect(INPUTS[0].e).toBe(1439)
    await act(async () => { undo() })
    await fresh()
    await click(D('#inpEditSpan [data-span="custom"]'))
    await setWin('#inpEditStart', '10:20')
    await setWin('#inpEditEnd', '11:35')
    await addNow()
    expect(INPUTS[0].allday).toBe(false)
    expect(INPUTS[0].s).toBe(620)
    expect(INPUTS[0].e).toBe(695)
    await act(async () => { undo() })
    /* an end EARLIER than the start is an OVERNIGHT absence now — 22:00–02:00 is
       a real thing to be down for, and every other row type has rolled that way
       since the port (owner, 11 Aug 26). It reaches the model as typed and the
       engine rolls it. Only an end EQUAL to the start is refused, being a
       zero-length absence. */
    await fresh()
    await click(D('#inpEditSpan [data-span="custom"]'))
    await setWin('#inpEditStart', '10:20')
    await setWin('#inpEditEnd', '09:00')
    const n = INPUTS.length
    await addNow()
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].s).toBe(620)
    expect(INPUTS[0].e).toBe(540)
    await act(async () => { undo() })
    await fresh()
    await click(D('#inpEditSpan [data-span="custom"]'))
    await setWin('#inpEditStart', '10:20')
    await setWin('#inpEditEnd', '10:20')                 // equal to the start
    const n2 = INPUTS.length
    await addNow()
    expect(INPUTS.length).toBe(n2)
    expect(W(), 'refused: the window stays, with what he typed').toBeTruthy()
    await cancelNew()
  })

  it('the window’s Delete removes a row’s input, and undo resurrects it', async () => {
    const n = INPUTS.length
    const first = INPUTS[0]
    expect($$('#inBody .rmx, #inBody [data-inx], #inBody [data-edit]'), 'no cross and no pencil on any row').toHaveLength(0)
    await delRow(0)
    expect(W(), 'deleted: the window has closed').toBeFalsy()
    expect(INPUTS.length).toBe(n - 1)
    expect(INPUTS[0]).not.toBe(first)
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  /* owner, 5 Aug 26: the reference turned a member away with "View only —
     ask a scheduler". These are the crews' OWN leave, downchits and
     detachments, so the people they belong to enter them now. */
  it('a member may add and delete too', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    const n = INPUTS.length
    await openNew()
    await click(calDay('2026-07-13'))
    await addNow()
    expect(INPUTS.length, 'the add went through').toBe(n + 1)
    /* his own input opens to be CHANGED — Save and Delete are his (the third gate that used to refuse) */
    await openRow(0)
    expect(D('#inpEditSave'), 'the window offers Save').toBeTruthy()
    await click(D('#inpEditDel'))
    expect(INPUTS.length, 'and so did the delete').toBe(n)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* [ARCH-STACK] step 4 (H5, owner answer C, 20 Sep 26): an admin files
     clearing leave for someone who has posted out — the archived body is in
     the admin's person picker, in its own group, and nowhere else. */
  it('an admin can pick a posted-out (archived) person for a NEW input, in their own group — and file it for him', async () => {
    const id = Object.keys(PEOPLE).find(k => !PEOPLE[k].special && !PEOPLE[k].archived && !PEOPLE[k].san)!
    await act(async () => { PEOPLE[id].archived = true; notify() })
    try {
      await openNew()
      const grp = D('#inpEditPerson optgroup[label="Posted out / archived"]') as unknown as HTMLOptGroupElement
      expect(grp, 'the posted-out group is there').toBeTruthy()
      expect([...grp.querySelectorAll('option')].map(o => o.value)).toContain(id)
      /* …and the leave is filed for him (clearing leave — H5): the door the List's form was */
      await setType('LL')
      await setWin('#inpEditPerson', id)
      await click(calDay('2026-07-13'))
      const n = INPUTS.length
      await addNow()
      expect(INPUTS.length, 'filed').toBe(n + 1)
      expect(INPUTS[0].person, 'for the posted-out man').toBe(id)
      await act(async () => { undo() })
    } finally {
      await cancelNew()
      await act(async () => { PEOPLE[id].archived = false; notify() })
    }
  })

  /* owner, 22 Aug 26 — "for normal user account they can only input their own
     self. Which is whoever they are viewing as." Admin keeps the full roster
     select on both this form and the month calendar; a member's Person is the
     view-as person, printed as a value rather than offered as a choice — the
     rule the calendar's add dialog already applied, now on the page's own
     form too. */
  /* (The form read who is signed in LIVE, at its Add; the window reads it as it opens — nobody's sign-in changes under
     an open window: a sign-in reloads the page.) */
  it('a member files a leave for himself only — whoever is signed in — and his Person is a value, not a list', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    await openNew()
    await setType('LL')            // a leave: a kind a member never files for anyone else (D655)
    expect(D('#inpEditPerson'), 'the roster list is a scheduler’s').toBeFalsy()
    expect(D('#inpEditPersonFixed').textContent, 'the value is his own callsign').toBe(PEOPLE[ME].cs)
    await cancelNew()
    /* someone else signed in: the window opens on HIM, and that is who the add is filed for */
    await act(async () => { setMe('dj'); notify() })
    await openNew()
    await setType('LL')
    expect(D('#inpEditPersonFixed').textContent).toBe(PEOPLE.dj.cs)
    await click(calDay('2026-07-13'))
    const n = INPUTS.length
    await addNow()
    expect(INPUTS.length, 'the add went through').toBe(n + 1)
    expect(INPUTS[0].person, 'and landed on the signed-in person').toBe('dj')
    await delRow(0)
    expect(INPUTS.length).toBe(n)
    await act(async () => { setMe('bane'); setSession({ user: 'a', role: 'admin' }); notify() })
    await openNew()
    expect((D('#inpEditPerson') as unknown as HTMLSelectElement), 'an admin gets the roster list').toBeTruthy()
    await cancelNew()
  })

  it('a member changing his own leave keeps the person as plain text — no list to move it to another man', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    /* a leave: a kind a member never files for anyone else (D655), so its window offers no people to pick */
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: ME, type: 'LL', date: 'Jul 14', allday: true, remarks: 'own leave', mod: '' }))
    })
    await openRow(0)
    expect(D('#inpEditSave'), 'it is his to change').toBeTruthy()
    expect(D('#inpEditPerson'), 'no Person list for a member').toBeFalsy()
    expect(D('#inpEditPersonFixed').textContent, 'the name still prints').toBe(PEOPLE[ME].cs)
    await click(D('#inpEditDel'))
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* the write paths repeat the gate (CLAUDE.md: role checks at the page AND
     the write path) — a member's UI can no longer produce either call, so
     these drive the functions directly, the hand-made-call net */
  it('the write paths hold on their own: no member re-person, adds pinned to the viewer', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    /* commitInputEdit refuses a person change from a member */
    const r = INPUTS.find((x: any) => x.person && x.person !== ME)!
    expect(r, 'a row belonging to someone else exists').toBeTruthy()
    const was = r.person
    const d = draftOf(r); d.person = ME
    let ok: any
    await act(async () => { ok = commitInputEdit(r, d) })
    expect(ok, 'the re-person is refused').toBe(false)
    expect(r.person, 'and nothing moved').toBe(was)
    /* commitNewInput ASKS about a hand-made draft for another man — changed 8 Oct 26 with the group input (owner D654,
       D655; the build plan §3.13). Until then it pinned the draft onto the signed-in member in silence, and this test
       pinned that. A leave for another man is refused and nothing is filed, for either of them; a draft naming nobody
       is still his own. */
    const n = INPUTS.length
    await act(async () => {
      ok = commitNewInput({ person: was, type: 'LL', start: '2026-07-14', allday: true, remarks: '' })
    })
    expect(ok, 'a leave for another man is refused').toBe(false)
    expect(INPUTS.length, 'and nothing was filed for the member instead').toBe(n)
    await act(async () => {
      ok = commitNewInput({ person: '', type: 'LL', start: '2026-07-14', allday: true, remarks: '' })
    })
    expect(ok).toBe(true)
    expect(INPUTS[0].person, 'a draft naming nobody is his own').toBe(ME)
    await act(async () => { removeInput(INPUTS[0]) })
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* the boundary that did NOT move: entering an input is the crew's, putting
     one into the issued programme is a scheduler's */
  it('but accepting an input into the programme is still a scheduler\'s act', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect(canEditSched(), 'the gate routeClick asks before it accepts').toBe(false)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    expect(canEditSched()).toBe(true)
  })

  it('the filters narrow the table', async () => {
    const all = $$('#inBody tr').length
    await act(async () => {
      const sel = $('#inFType') as unknown as HTMLSelectElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(sel, 'OML')
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const narrowed = $$('#inBody tr').length
    expect(narrowed).toBeGreaterThan(0)
    expect(narrowed).toBeLessThan(all)
    expect($$('#inBody .intag').every(x => x.textContent === 'OML')).toBe(true)
  })

  /* one colour source for both this table and the month calendar
     (ui/inputedit.tsx's inputTone) — pin the three tones it can produce
     against the seed data that already carries all three: divot's OML
     (medical, red), vinci's Meeting (an activity under "Duty & other
     commitments", amber), and the demo SANS Availability seed (state/
     demoseed.ts, filed for nick) for purple. toContain, not equality —
     the flash class ('innew') can ride the same row. */
  it('stripes rows red and amber by inputTone — and carries no SANS availability (D620)', async () => {
    /* an earlier test in this file ('the filters narrow the table') leaves
       the type filter on OML and never resets it — put it back to All so
       every seeded person is on screen for this assertion */
    await act(async () => {
      const sel = $('#inFType') as unknown as HTMLSelectElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(sel, 'all')
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const redIx = INPUTS.findIndex((r: any) => r.person === 'divot' && r.type === 'OML')
    expect(rowFor(redIx).className, 'medical leave').toContain('in-red')
    const ambIx = INPUTS.findIndex((r: any) => r.person === 'vinci' && r.type === 'Meeting')
    expect(rowFor(ambIx).className, 'an activity commitment').toContain('in-amb')
    /* THE PURPLE ROW WENT WITH THE SANS LIST (owner D620, 7 Oct 26: SANS availability "leaves the List and is filed on the
       SANS calendar only, which has no list of its own"; built with the SANS calendar, 8 Oct 26). The seed is still
       there — it is simply on no list: not this one, and the SANS tab draws its calendar instead. */
    const sanIx = INPUTS.findIndex((r: any) => r.person === 'nick' && r.type === 'SANS Availability')
    expect(sanIx, 'the demo SANS seed is present').toBeGreaterThanOrEqual(0)
    expect(document.querySelector('#inBody tr.in-san'), 'no SANS row on the Inputs List').toBeNull()
    await click($('#inSansMode'))
    expect(document.querySelector('#sansCal'), 'the SANS tab is the SANS calendar').toBeTruthy()
    expect((document.querySelector('#inBody') as HTMLElement).closest('[hidden]'), 'and has no list').toBeTruthy()
    await click($('#inMemberMode'))
  })

  /* REMOVED WITH THE CONTROL IT TESTED (D620, 8 Oct 26): "a SANS row shows its F/O/A offer letters beside the type, never
     inside it" pinned the letters chip on a SANS row OF THE LIST (owner, 24 Aug 26). There is no such row any more. The
     letters themselves are pinned where a commitment is now listed — the SANS day's line (ui/sansday.test.tsx, "each
     line carries his letters"). What stays true here: no other row grows the chip. */
  it('no row of the List carries the F/O/A chip', async () => {
    expect(document.querySelector('#inBody .foa')).toBeNull()
  })

  it('an added downchit re-validates the week (reflow)', async () => {
    validate()
    const before = validate().all.filter((x: any) => x.code === 'DNIF_FLY').length
    /* put a downchit on someone flying Monday — stiff flies both waves */
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'stiff', date: 'Jul 13', allday: true, type: 'OML', remarks: '', mod: 'now' }))
    })
    const after = validate().all.filter((x: any) => x.code === 'DNIF_FLY').length
    expect(after).toBeGreaterThan(before)
    await act(async () => { undo() })
  })
})

/* SANS AVAILABILITY, the add form's own sub-form (owner, 14 Aug 26; reworked
   flags-only the same day — the owner's own phone bug: a per-event
   <input type=time> pair could not be cleared with one tap). SansPicker is
   now three checkboxes and nothing else, sitting ABOVE the standard How-long
   control rather than replacing it — SANS is a normal timed input with one
   extra field, riding the same SpanPicker/time-field machinery every other
   half-day type uses. The two refusals (person, empty tick set) are still
   sansRefusal's, shared by all three editors. */
describe('the SANS Availability sub-form on the add form', () => {
  const setV = async (el: any, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const setPerson = async (v: string) => setWin('#inpEditPerson', v)
  /* the sans checkboxes carry no id — found by their own label text, in
     SANS_ROWS' own Fly / AMT / OFT display order */
  const sansCk = (label: string) =>
    $$('#inSans .sanspick-ck').find(l => l.textContent?.includes(label))!.querySelector('input[type="checkbox"]') as HTMLInputElement
  const originalPerson = () => (D('#inpEditPerson') as unknown as HTMLSelectElement).value
  const toasts: string[] = []
  const withToast = async (fn: () => Promise<void>) => {
    toasts.length = 0
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await fn() } finally { HOOKS.toast = orig }
  }

  /* THE SIX TESTS THAT FILED SANS AVAILABILITY THROUGH THIS FORM WENT WITH THE CONTROL (owner D620, 7 Oct 26 — "in list
     mode remove sans avail and move that function to sans calendar solely"). Each is RE-POINTED at the form that now
     does that job, the SANS calendar's "+ Commitment" (ui/sansform.test.tsx): the three ticks beside the standard span
     picker, SANS aircrew only, no empty tick set, the flags under All day, AM, and a custom window. */
  it('the Inputs tab’s window does not offer SANS availability, nor its Fly / AMT / OFT ticks', async () => {
    await openNew()
    expect(Array.from((D('#inpEditType') as unknown as HTMLSelectElement).options).map(o => o.value)).not.toContain('SANS Availability')
    expect(D('#inSans')).toBeFalsy(); expect(D('#inpEditSans')).toBeFalsy()
    void setV; void setPerson; void sansCk; void originalPerson; void withToast
    await cancelNew()
  })

  it('the type legend carries the SANS "not an absence" sentence', async () => {
    await openNew()
    await click(D('#inTypeHelp'))
    expect(D('#inTypePop')!.textContent).toContain('not an absence')
    await act(async () => { document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
    await cancelNew()
  })
})

/* The two-click range calendar (owner, Aug 26) replaced the pair of date
   boxes. First click starts, second ends, and a second click BEFORE the start
   cannot make a backwards range — it becomes the new start instead. */
describe('the range calendar', () => {
  /* the window's own calendar — the same component the List's form used; its readout speaks the window's own
     month-first voice ("Jul 14"), where the form's said "14 Jul" */
  const day = (d: string) => D(`#inpEdCal [data-cal="2026-07-${d}"]`)
  const readout = () => D('#inpEditPop .rc-read')!.textContent
  beforeAll(openNew)
  afterAll(cancelNew)

  it('replaced the two date inputs', () => {
    expect($('#inStart')).toBeFalsy()
    expect($('#inEnd')).toBeFalsy()
    expect(D('#inpEdCal'), 'the calendar renders').toBeTruthy()
  })

  it('starts on Monday and marks the weekend', () => {
    const dow = [...document.querySelectorAll('#inpEdCal .rc-dow span')].map(x => x.textContent)
    expect(dow).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'])
    // 18 Jul 2026 is a Saturday
    expect(day('18').classList.contains('wk')).toBe(true)
    expect(day('15').classList.contains('wk')).toBe(false)
  })

  it('two clicks make a range, and the days between are marked', async () => {
    await click(day('14'))
    expect(readout()).toBe('Jul 14')
    expect(day('14').classList.contains('s')).toBe(true)
    await click(day('17'))
    expect(readout()).toBe('Jul 14 → Jul 17')
    expect(day('17').classList.contains('e')).toBe(true)
    expect(day('15').classList.contains('mid')).toBe(true)
  })

  it('a backwards second click becomes the new start instead', async () => {
    await click(day('20'))                 // fresh range
    expect(readout()).toBe('Jul 20')
    await click(day('16'))                 // earlier — cannot be an end
    expect(readout()).toBe('Jul 16')
    expect(day('16').classList.contains('s')).toBe(true)
    expect(document.querySelectorAll('#inpEdCal .rc-d.e').length).toBe(0)
    await click(day('17'))                 // now it can close
    expect(readout()).toBe('Jul 16 → Jul 17')
  })

  it('a third click begins a fresh range rather than sticking', async () => {
    await click(day('21'))
    expect(readout()).toBe('Jul 21')
  })

  it('the picked range is what Add writes', async () => {
    await click(day('14')); await click(day('16'))
    const n = INPUTS.length
    await addNow()
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].date).toBe('Jul 14')
    expect(INPUTS[0].endDate).toBe('Jul 16')
    await act(async () => { undo() })
  })
})

/* the phone card drops an End that repeats the Start ("Jul 13", never
   "Jul 13 → Jul 13") — CSS hides it off this marker, which is all jsdom can
   see, so pin the marker itself */
describe('the End cell marks itself data-same on a one-day input', () => {
  it('a one-day row carries it, a span row does not', async () => {
    /* plant one of each shape rather than trusting what earlier tests left of
       the seed, and widen the window so both are certainly on screen */
    const planted: any[] = [
      { person: 'sufa', date: 'Jul 14', allday: true, type: 'LL', remarks: '' },
      { person: 'sufa', date: 'Jul 14', endDate: 'Jul 16', allday: true, type: 'LL', remarks: '' },
    ]
    INPUTS.push(...planted)
    await act(async () => { notify() })
    /* neutralise whatever filters earlier tests left behind */
    await act(async () => {
      const setv = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      for (const id of ['inFPerson', 'inFType']) {
        const sel = $('#' + id) as unknown as HTMLSelectElement
        setv.call(sel, 'all'); sel.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    try {
      const cell = (row: any) => {
        const inx = INPUTS.indexOf(row)
        return rowFor(inx).querySelector('td[data-label="End"]')!
      }
      expect(cell(planted[0]).hasAttribute('data-same'), 'one-day marks itself').toBe(true)
      expect(cell(planted[1]).hasAttribute('data-same'), 'a span does not').toBe(false)
    } finally {
      for (const r of planted) INPUTS.splice(INPUTS.indexOf(r), 1)
      await act(async () => { notify() })
    }
  })
})

/* a row opens the input's window, and the window edits it (the pencil that edited the row in place is gone — D718) */
describe('editing an input from its own line', () => {
  it('opens from its row, commits on Save, and joins the undo stack', async () => {
    const target = INPUTS[0], was = target.remarks
    await openRow(0)
    expect($('#inBody tr.ined'), 'no row turns into fields any more').toBeFalsy()
    await setWin('#inpEditRmk', 'EDITED IN ITS WINDOW')
    await click(D('#inpEditSave'))
    expect(W(), 'saved: the window closed').toBeFalsy()
    expect(INPUTS.find((x: any) => x.iid === target.iid).remarks).toBe('EDITED IN ITS WINDOW')
    await act(async () => { undo() })
    expect(INPUTS.find((x: any) => x.iid === target.iid).remarks).toBe(was)
  })

  it('cancel leaves the row untouched', async () => {
    const before = JSON.stringify(INPUTS[0])
    await openRow(0)
    await setWin('#inpEditRmk', 'THROWN AWAY')
    await click(D('#inpEditCancel'))
    expect(W()).toBeFalsy()
    expect(JSON.stringify(INPUTS[0])).toBe(before)
  })
})

/* Two bugs the pencil introduced, both found in the post-change sweep. */
describe('editing an input that is already accepted', () => {
  /* an earlier test leaves the type filter narrowed; these need the whole list */
  /* The table opens on a today → +2-months window (owner, Aug 5). The seeded
   demo inputs are July 2026, so with the default window every assertion about
   ROWS below would really be an assertion about the window. Widen it once in
   beforeAll; the window itself has its own describe at the bottom. */
const showAllDates = async () => {
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeAll'))
}
const useDefaultRange = async () => {
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeDef'))
}

beforeAll(async () => {
    await act(async () => {
      const sel = $('#inFType') as unknown as HTMLSelectElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(sel, 'all'); sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
  })

  const setV = async (el: any, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })

  /* the row acceptInput created is linked by `src` = person|date|type|s.
     Editing any of those used to break the link, stranding a row on the
     programme that undo could never find. */
  it('keeps the ground row in step instead of orphaning it', async () => {
    INPUTS.unshift({ person: 'vinci', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'sweep', mod: '' })
    const inp = INPUTS[0]
    await act(async () => { acceptInput(0, inp, 'g'); notify() })
    const nGround = DAYS[0].ground.length
    expect(DAYS[0].ground.some((r: any) => r.src === inpId(inp))).toBe(true)

    await openRow(0)
    await setWin('#inpEditType', 'Appointment')
    await click(D('#inpEditSave'))

    expect(inp.type).toBe('Appointment')
    expect(DAYS[0].ground.length, 'no duplicate row left behind').toBe(nGround)
    // the link followed the edit, so the row is still reachable
    expect(DAYS[0].ground.some((r: any) => r.src === inpId(inp)), 'src re-linked').toBe(true)
    const row = DAYS[0].ground.find((r: any) => r.src === inpId(inp))
    expect(row.prog).toBe('APPOINTMENT')      // and it re-reads under the new type
    await act(async () => { INPUTS.splice(INPUTS.indexOf(inp), 1); notify() })
  })

  /* the editor used to hold a model INDEX; adding a row renumbers INPUTS and
     the draft then committed onto whoever had shifted into that slot. The window holds the RECORD, by its id. */
  it('commits onto the right row even after the list renumbers underneath', async () => {
    const target = INPUTS[0]
    const wasOther = INPUTS[1] ? { ...INPUTS[1] } : null
    await openRow(0)
    await setV(D('#inpEditRmk'), 'STAYS ON TARGET')
    // something else lands at the top of the list while the editor is open
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'yeti', date: 'Jul 14', allday: true, type: 'LL', remarks: 'jumped the queue', mod: '' }))
    })
    await click(D('#inpEditSave'))
    expect(INPUTS.find((x: any) => x.iid === target.iid).remarks).toBe('STAYS ON TARGET')
    expect(INPUTS[0].remarks).toBe('jumped the queue')   // the interloper is untouched
    if (wasOther) expect(INPUTS.find((x: any) => x.remarks === wasOther.remarks)).toBeTruthy()
    await act(async () => { undo() })
  })
})

/* The rest of the post-change sweep. */
describe('accepted rows are never stranded', () => {
  const groundRows = () => DAYS.flatMap((d: any, di: number) => (d.ground || []).map((r: any) => ({ di, src: r.src })))

  /* a multi-day input shows an Accept button on EVERY day it spans, so the row
     can be on any of them; the start date was a guess that silently missed */
  it('a row accepted on a later day of a span is found, not duplicated', async () => {
    INPUTS.unshift({ person: 'vinci', date: 'Jul 15', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'span', mod: '' })
    const inp = INPUTS[0]
    await act(async () => { acceptInput(4, inp, 'g'); notify() })   // accepted on the LAST day
    expect(acceptedDay(inp)).toBe(4)
    const before = groundRows().filter(r => r.src === inpId(inp)).length
    expect(before).toBe(1)

    await openRow(0)
    await click(D('#inpEditSave'))                                 // change nothing

    const after = groundRows().filter(r => r.src === inpId(inp))
    expect(after.length, 'still exactly one row').toBe(1)
    expect(after[0].di, 'and still on the day it was accepted on').toBe(4)
    await act(async () => { INPUTS.splice(INPUTS.indexOf(inp), 1); notify() })
  })

  it('deleting an accepted input takes its ground row with it', async () => {
    INPUTS.unshift({ person: 'yeti', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'del me', mod: '' })
    const inp = INPUTS[0]
    await act(async () => { acceptInput(0, inp, 'g'); notify() })
    const key = inpId(inp)
    expect(groundRows().some(r => r.src === key)).toBe(true)
    await delRow(0)
    expect(INPUTS.indexOf(inp)).toBe(-1)
    expect(groundRows().some(r => r.src === key), 'no row left behind').toBe(false)
    await act(async () => { undo() })
  })

  /* one ✓ used to push two history snapshots, so the first Undo landed in a
     half-applied state: old fields, but already un-accepted */
  it('editing an accepted input is a single undo step', async () => {
    /* added and accepted through the real paths, so history has a proper
       baseline to step back to — undo restores the ARRAY, so the assertions
       below look the row up by content rather than by object identity */
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'salsa', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'one step', mod: '' }))
    })
    const inp = INPUTS[0]
    await act(async () => { acceptInput(0, inp, 'g'); notify() })
    await openRow(0)
    await setWin('#inpEditRmk', 'CHANGED')
    /* the bug was that ONE ✓ pushed TWO snapshots — unacceptInput's markEdit
       fired mid-way, so the first Undo landed on old fields that were already
       un-accepted, a state the user never created */
    const depth = HIST.stack.length
    await click(D('#inpEditSave'))
    expect(INPUTS[0].remarks).toBe('CHANGED')
    expect(HIST.stack.length - depth, 'one action, one undo step').toBe(1)
    await act(async () => { undo() })
    expect(INPUTS.some((x: any) => x.remarks === 'CHANGED')).toBe(false)
    expect(INPUTS.find((x: any) => x.person === 'salsa' && x.remarks === 'one step')).toBeTruthy()
  })

  /* the window "+ Input" opens has NO date until one is picked (D729 — V1): the readout says so, and Add agrees — in
     the form's own old sentence, before any question (OIL, a document) is asked about a day nobody chose */
  it('Add refuses to invent a date when none was picked', async () => {
    const said: string[] = []
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    try {
      const n = INPUTS.length
      await openNew()
      expect(D('#inpEditPop .rc-read')!.textContent).toBe('pick a start date')
      await addNow()
      expect(INPUTS.length, 'nothing was dated for him').toBe(n)
      expect(said).toEqual(['Pick a start date on the calendar first'])
      expect(document.querySelector('[data-testid="oilconf"]'), 'and no question was asked').toBeNull()
      expect(W(), 'the window stays').toBeTruthy()
      /* a kind that asks a document, then a kind that asks OIL: still refused first, nothing asked */
      for (const t of ['OML', 'Duty']) {
        said.length = 0
        await setType(t)
        await addNow()
        expect(said, t).toEqual(['Pick a start date on the calendar first'])
        expect(INPUTS.length, t).toBe(n)
      }
      await setType('Training')
      await click(calDay('2026-07-14'))
      await addNow()
      expect(INPUTS.length).toBe(n + 1)
      await act(async () => { undo() })
    } finally { HOOKS.toast = orig; await cancelNew() }
  })
})

/* The remarks tail (owner, Aug 26; single-day "till" 18 Aug 26): picking on the
   calendar writes the date into Remarks as `till 15 Jul` — a span uses its last
   day, and a ONE-DAY pick uses that day — and everything the typist put in front
   of it is kept — `LL till 15 Jul`. The tail belongs to the calendar, so it is
   rewritten and removed by picking, never duplicated. */
describe('the picked date writes itself into Remarks', () => {
  const day = (d: string) => D(`#inpEdCal [data-cal="2026-07-${d}"]`)
  const rm = () => D('#inpEditRmk') as HTMLInputElement
  const typeInto = async (el: any, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  /* one new input's window for the picking tests below; the last of them adds, which closes it */
  beforeAll(openNew)
  afterAll(cancelNew)

  it('a lone start already reads till <that day>; the end then moves the date', async () => {
    await click(day('13'))
    expect(rm().value, 'a one-day pick still says till <date>').toBe('till 13 Jul')
    await click(day('15'))
    expect(rm().value).toBe('till 15 Jul')
  })

  it('the typed note survives, and the tail follows the calendar', async () => {
    await typeInto(rm(), 'LL till 15 Jul')
    await click(day('16'))                  // a fresh start now rewrites the tail to that one day…
    expect(rm().value, 'the tail follows the calendar, never stacks').toBe('LL till 16 Jul')
    await click(day('18'))                  // …and the end extends it
    expect(rm().value).toBe('LL till 18 Jul')
    /* re-picking rewrites the tail rather than stacking another one on */
    await click(day('16')); await click(day('17'))
    expect(rm().value).toBe('LL till 17 Jul')
  })

  it('a range that ends where it starts still writes till <that day>', async () => {
    await typeInto(rm(), '')
    await click(day('20')); await click(day('20'))
    // add() drops endDate for a one-day input, but the owner wants the tail to
    // name that single day anyway (18 Aug 26) — the type column, not endDate, is
    // what tells a span from a day
    expect(rm().value).toBe('till 20 Jul')
  })

  it('a note kept AFTER the tail survives the dates changing (owner, 18 Aug 26)', async () => {
    await typeInto(rm(), 'till 15 Jul Bangkok')
    // re-pick a new range: the token is rewritten IN PLACE (it no longer strips
    // and re-appends, so Bangkok stays exactly where the typist put it) — this is
    // the owner's own example, "till 13 Jul Bangkok" -> "till 18 Jul Bangkok"
    await click(day('16')); await click(day('18'))
    expect(rm().value, 'Bangkok must remain').toContain('Bangkok')
    expect(rm().value).toBe('till 18 Jul Bangkok')
  })

  /* CHANGED BY THE DOOR (D729 — V1; a reading told to him): the List's form kept its dates — and so the tail — for the
     next add. The window closes at Add and opens FRESH: no note, no date, nothing carried onto the next input. */
  it('Add writes the note with its tail; the next new input starts with no note and no date', async () => {
    await click(day('14')); await click(day('16'))
    await typeInto(rm(), 'LL till 16 Jul')
    const n = INPUTS.length
    await addNow()
    expect(INPUTS[0].remarks).toBe('LL till 16 Jul')
    expect(W(), 'the window closed at Add').toBeFalsy()
    await openNew()
    expect(rm().value, 'no note carried over').toBe('')
    expect(D('#inpEditPop .rc-read')!.textContent, 'and no date').toBe('pick a start date')
    await cancelNew()
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  /* RESTATED 10 Oct 26 with the pencil's row gone (D718). The row's own calendar rewrote the remark box at every pick,
     adding a "till" even where the remark had none. The window's calendar (D681; a one-person input's too, since this
     change) leaves the box alone while he picks — a remark the picker had touched would read as HIS change to a window
     that follows the record behind it — and the SAVE makes a "till" the remark carries follow the new last day
     (commitInputEdit; D189: the wording is the app's own). What is no longer done: a "till" is not ADDED to a remark
     that carried none. */
  it('the window’s calendar leaves the remark box alone; the save makes its "till" follow the new dates', async () => {
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'sufa', type: 'LL', date: 'Jul 13', endDate: 'Jul 14', allday: true, remarks: 'Bangkok till 14 Jul', mod: '' }))
    })
    const target = INPUTS[0]
    await openRow(0)
    const ed = () => D('#inpEditRmk') as HTMLInputElement
    expect(ed().value, 'opening the window rewrites nothing').toBe('Bangkok till 14 Jul')
    await click(D('#inpEdCal [data-cal="2026-07-13"]'))
    await click(D('#inpEdCal [data-cal="2026-07-16"]'))
    expect(ed().value, 'nor does picking').toBe('Bangkok till 14 Jul')
    await click(D('#inpEditSave'))
    const saved = INPUTS.find((x: any) => x.iid === target.iid)
    expect([saved.date, saved.endDate]).toEqual(['Jul 13', 'Jul 16'])
    expect(saved.remarks, 'the tail followed the calendar').toBe('Bangkok till 16 Jul')
    await act(async () => { undo(); undo() })
  })
})

/* ---- the table's own view: which window, and sorted how (owner, Aug 5) ---- */

/* dates are asserted RELATIVE to the clock, never against a hardcoded day, so
   these keep meaning whatever date the suite runs on */
const isoIn = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const lbl = (iso: string) => {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return MON[+iso.slice(5, 7) - 1] + ' ' + +iso.slice(8, 10)
}
/* the DAY-FIRST voice the Inputs page now shows (owner, 21 Aug 26); `lbl` stays
   month-first because it also seeds the model, whose stored labels are that way */
const lblDay = (iso: string) => {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return +iso.slice(8, 10) + ' ' + MON[+iso.slice(5, 7) - 1]
}
const seed = (o: any) => { INPUTS.unshift({ allday: true, s: 0, e: 1439, type: 'LL', mod: '', ...o }); notify() }
const startsShown = () => $$('#inBody tr td:nth-child(2)').map(td => td.textContent!.trim())

describe('the date window', () => {
  /* The quick button applies the SQUADRON'S look-ahead since 28 Aug 26 (an
     admin sets it; the standard is the same fortnight as before), so this
     no longer says "+2 months" — it says "the default window". */
  it('opens on today → the default window, and hides what is outside it', async () => {
    const n = INPUTS.length
    await act(async () => {
      seed({ person: 'bane', date: lbl(isoIn(-40)), remarks: 'WELL BEHIND' })
      seed({ person: 'bane', date: lbl(isoIn(3)), remarks: 'THIS WEEK' })
      seed({ person: 'bane', date: lbl(isoIn(150)), remarks: 'FAR AHEAD' })
    })
    await useDefaultRange()
    const shown = () => $$('#inBody tr').map(tr => tr.textContent || '')
    expect(shown().some(t => t.includes('THIS WEEK')), 'inside the window').toBe(true)
    expect(shown().some(t => t.includes('WELL BEHIND')), 'before today').toBe(false)
    expect(shown().some(t => t.includes('FAR AHEAD')), 'beyond the window').toBe(false)

    /* the readout names the window rather than leaving the user to guess */
    expect($('#inRangeBtn').textContent).toContain(lblDay(isoIn(0)))
    /* and an empty table under a window says it is the window */
    expect($('#inEmpty').textContent).toContain('All dates')

    await act(async () => { INPUTS.splice(0, INPUTS.length - n); notify() })
    await showAllDates()
  })

  /* an input that STARTED before the window but is still running is exactly
     the one a scheduler must not lose sight of */
  it('keeps a span that began before today but has not ended', async () => {
    const n = INPUTS.length
    await act(async () => { seed({ person: 'bane', date: lbl(isoIn(-10)), endDate: lbl(isoIn(10)), remarks: 'STILL RUNNING' }) })
    await useDefaultRange()
    expect($$('#inBody tr').some(tr => (tr.textContent || '').includes('STILL RUNNING'))).toBe(true)
    await act(async () => { INPUTS.splice(0, INPUTS.length - n); notify() })
    await showAllDates()
  })

  it('All dates puts everything back', async () => {
    await useDefaultRange()
    const windowed = $$('#inBody tr').length
    await showAllDates()
    expect($$('#inBody tr').length, 'the July demo rows are back').toBeGreaterThan(windowed)
    expect($('#inRangeBtn').textContent).toContain('All dates')
  })
})

/* THE VERY FIRST WINDOW: today → two weeks, and nothing cleverer (owner,
   12 Aug 26 — "it is ok to show any inputs from the today's date to 2 weeks
   down the road by default"). It anchored to the loaded week for a few hours
   in between; the owner replaced that with this. initialRange is the pure
   computation the mount reads. */
describe('initialRange — the window the page opens on', () => {
  it('is today → +14 days, wherever today falls', () => {
    expect(initialRange(new Date(2026, 6, 15))).toEqual({ from: '2026-07-15', to: '2026-07-29' })
    expect(initialRange(new Date(2026, 7, 12))).toEqual({ from: '2026-08-12', to: '2026-08-26' })
    expect(initialRange(new Date(2026, 5, 1))).toEqual({ from: '2026-06-01', to: '2026-06-15' })
  })

  it('rolls over a month end, and a year end, without inventing a date', () => {
    expect(initialRange(new Date(2026, 0, 25))).toEqual({ from: '2026-01-25', to: '2026-02-08' })
    expect(initialRange(new Date(2026, 11, 24))).toEqual({ from: '2026-12-24', to: '2027-01-07' })
  })

  it('never anchors to the loaded week — that behaviour was reverted', () => {
    /* Aug 2026 is past the demo week, and the window must NOT jump back to it.
       DATES' labels are 'Jul 13'-style, so compare on the month the ISO
       window lands in rather than reaching for the page's own unfmt. */
    const r = initialRange(new Date(2026, 7, 12))
    expect(DATES[0]).toMatch(/^Jul /)
    expect(r.from.slice(0, 7), 'the window stays in August, where today is').toBe('2026-08')
    expect(r.to.slice(0, 7)).toBe('2026-08')
  })
})

/* A render check, not just the pure function. With the clock past the demo
   week the table opens EMPTY — that is the owner's own choice (see
   InputsPage.tsx), so it is pinned as intended behaviour rather than left to
   be re-reported as a bug. Fake timers because the window is computed at
   mount, from `new Date()`. */
describe('the page as it first mounts, with different clocks', () => {
  const mountFresh = async () => {
    const h = document.createElement('div')
    document.body.appendChild(h)
    const root = createRoot(h)
    await act(async () => { root.render(<InputsPage />) })
    return { h, root }
  }

  it('today inside the loaded week: the seeded rows are there', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 13))
    const { h, root } = await mountFresh()
    expect(h.querySelectorAll('#inBody tr').length, 'the demo rows render').toBeGreaterThan(0)
    expect(h.querySelector('#inRangeBtn')!.textContent).toContain('13 Jul')
    await act(async () => root.unmount())
    h.remove()
    vi.useRealTimers()
  })

  it('today past the demo week: opens empty, deliberately, with the way out on screen', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 12))
    const { h, root } = await mountFresh()
    expect(h.querySelectorAll('#inBody tr').length, 'nothing falls in the next fortnight').toBe(0)
    expect(h.querySelector('#inEmpty')!.hasAttribute('hidden'), 'so the empty state IS shown').toBe(false)
    expect(h.querySelector('#inEmpty')!.textContent, 'and it names the way out').toMatch(/All dates/i)
    expect(h.querySelector('#inRangeBtn')!.textContent, 'the window is anchored on today, not the demo week').toContain('12 Aug')
    await act(async () => root.unmount())
    h.remove()
    vi.useRealTimers()
  })
})

describe('sorting by column', () => {
  it('opens sorted by start date, earliest first', () => {
    expect($('#intbl thead th[data-sort="start"]').className).toContain('on')
    expect($('#intbl thead th[data-sort="start"]').getAttribute('aria-sort')).toBe('ascending')
    const starts = startsShown()
    expect(starts.length).toBeGreaterThan(2)
    /* rendered as 'Jul 13' labels; compare on the ordinal the label implies */
    const ord = (s: string) => {
      const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const p = s.split(/\s+/)
      return (MON.indexOf(p[0]) + 1) * 100 + (+p[1] || 0)
    }
    const asc = starts.map(ord)
    expect(asc, 'ascending').toEqual([...asc].sort((a, b) => a - b))
  })

  it('a second click on the same heading inverts it', async () => {
    await click($('#intbl thead th[data-sort="start"]'))
    expect($('#intbl thead th[data-sort="start"]').getAttribute('aria-sort')).toBe('descending')
    const first = startsShown()
    await click($('#intbl thead th[data-sort="start"]'))
    expect($('#intbl thead th[data-sort="start"]').getAttribute('aria-sort')).toBe('ascending')
    expect(startsShown()).toEqual([...first].reverse())
  })

  it('every heading sorts, and only the sorted one is marked', async () => {
    for (const key of ['name', 'end', 'type', 'remarks', 'mod']) {
      await click($(`#intbl thead th[data-sort="${key}"]`))
      expect($(`#intbl thead th[data-sort="${key}"]`).className, key).toContain('on')
      expect($$('#intbl thead th.on').length, `only ${key} is marked`).toBe(1)
    }
    /* the loop left `mod` sorted, so ONE click on a different heading is a
       fresh ascending sort — inverting only happens on a repeat click */
    await click($('#intbl thead th[data-sort="name"]'))
    const names = $$('#inBody tr td:nth-child(1)').map(td => td.textContent!.trim().toLowerCase())
    expect(names).toEqual([...names].sort())
    await click($('#intbl thead th[data-sort="start"]'))  // leave it as it opened
  })
})

/* Closing the window picker (owner, Aug 5). It used to close only on its own
   button, so the click meant for the table under it was swallowed by a
   still-open popover. */
describe('the date-window calendar puts itself away', () => {
  const press = async (el: Element) => act(async () => {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  })

  it('closes on a press anywhere outside it', async () => {
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    expect($('#inRangePop'), 'open to begin with').toBeTruthy()
    await press($('#intbl'))
    expect($('#inRangePop'), 'gone').toBeFalsy()
    expect($('#inRangeBtn').getAttribute('aria-expanded')).toBe('false')
  })

  it('stays open for a press inside it, so picking a range still works', async () => {
    await click($('#inRangeBtn'))
    await press($('#inRangeCal [data-cal="2026-07-13"]'))
    expect($('#inRangePop'), 'still open').toBeTruthy()
    /* and its own button still toggles it shut */
    await click($('#inRangeBtn'))
    expect($('#inRangePop')).toBeFalsy()
    await showAllDates()
  })
})

/* A new input has to be visible from wherever the table happens to be pointed
   (owner, Aug 5): adding something and watching nothing appear reads as a
   failed save. It rides the top until the user re-arranges the table. */
describe('a new input announces itself', () => {
  const setV = async (el: any, v: string, proto: any) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const setFType = async (v: string) => act(async () => {
    const sel = $('#inFType') as unknown as HTMLSelectElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
    setter.call(sel, v); sel.dispatchEvent(new Event('change', { bubbles: true }))
  })
  /* through the window "+ Input" opens — the List's one door since D729; the page keeps what it adds in view */
  const addOne = async (remark: string) => {
    await openNew()
    await click(calDay('2026-07-13'))
    await setV(D('#inpEditRmk'), remark, window.HTMLInputElement)
    await addNow()
  }
  const reset = async () => {
    await setFType('all')
    await showAllDates()
  }

  it('rides the top row even when the filter and the window both exclude it', async () => {
    const n = INPUTS.length
    await useDefaultRange()          // Jul 2026 is behind us — outside the window
    await setFType('OML')            // and the add below is a duty, not an OML
    await addOne('SHOUTS FROM THE TOP')
    expect(INPUTS.length).toBe(n + 1)
    expect($$('#inBody tr')[0].textContent).toContain('SHOUTS FROM THE TOP')
    /* it is the only thing in there that is not an OML — the pin is one
       row riding above the filter, not the filter being cancelled */
    expect($$('#inBody .intag').filter(x => x.textContent !== 'OML').length).toBe(1)
    await act(async () => { undo() })
    await reset()
    expect(INPUTS.length).toBe(n)
  })

  it('lets go the moment the table is re-arranged', async () => {
    const n = INPUTS.length
    await setFType('OML')
    await addOne('LETS GO ON A RECLICK')
    expect($$('#inBody tr')[0].textContent).toContain('LETS GO ON A RECLICK')
    /* re-click a heading: the user is arranging the table for themselves now */
    await click($('#intbl thead th[data-sort="start"]'))
    expect($$('#inBody tr').some(tr => (tr.textContent || '').includes('LETS GO ON A RECLICK')),
      'back under the filter').toBe(false)
    await act(async () => { undo() })
    await click($('#intbl thead th[data-sort="start"]'))   // leave it as it opened
    await reset()
    expect(INPUTS.length).toBe(n)
  })

  /* re-pointed 15 Aug 26 — FLASH_MS moved from 1500 to 6000 to match the
     board's own .sb-fresh timing (harmonize the flash, owner audit), so the
     settle wait moves with it. A real wait, past vitest's 5000ms default, so
     the timeout is raised for this one test rather than switching the whole
     suite to fake timers. */
  it('flashes once and settles back', async () => {
    const n = INPUTS.length
    await addOne('FLASHES ONCE')
    const lit = $$('#inBody tr').find(tr => (tr.textContent || '').includes('FLASHES ONCE'))!
    expect(lit.className, 'lit on arrival').toContain('innew')
    expect($$('#inBody tr.innew').length, 'and it is the only one').toBe(1)
    await act(async () => { await new Promise(r => setTimeout(r, 6200)) })
    expect($$('#inBody tr.innew').length, 'settled').toBe(0)
    await act(async () => { undo() })
    await reset()
    expect(INPUTS.length).toBe(n)
  }, 10000)

  /* the owner's phone complaint, literally: "once an input is made, the view
     will snap to the input u just made" — it did not. The row carries a
     stable data-iid (the same identity the pin/flash lists already use) and
     the page scrolls it into view once React has painted it. */
  it('scrolls the just-added row into view, by its stable iid', async () => {
    const n = INPUTS.length
    const calls: any[] = []
    const orig = (Element.prototype as any).scrollIntoView
    ;(Element.prototype as any).scrollIntoView = function (opts: any) { calls.push({ el: this, opts }) }
    try {
      await addOne('SCROLLS INTO VIEW')
    } finally {
      (Element.prototype as any).scrollIntoView = orig
    }
    const lit = $$('#inBody tr').find(tr => (tr.textContent || '').includes('SCROLLS INTO VIEW'))!
    expect(lit.getAttribute('data-iid'), 'the row carries the iid the scroll looked it up by').toBeTruthy()
    expect(calls.length, 'scrolled exactly once').toBe(1)
    expect(calls[0].el, 'scrolled the new row itself').toBe(lit)
    expect(calls[0].opts).toEqual({ block: 'nearest', behavior: 'smooth' })
    await act(async () => { undo() })
    await reset()
    expect(INPUTS.length).toBe(n)
  })
})

/* owner audit, 15 Aug 26 — this page's own inline ✓ (save) and ✕ (delete) ran
   commitInputEdit/removeInput silently; the SAME functions already toast when
   the board's own input dialog calls them (inputedit.tsx), so this page was
   the one place the identical action said nothing. The CSV export toast
   answers a different silence — a phone browser that shows no download UI at
   all for the file it just saved. */
describe('success toasts (owner audit — a tap with no feedback)', () => {
  const toasts: string[] = []
  const withToast = async (fn: () => Promise<void>) => {
    toasts.length = 0
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await fn() } finally { HOOKS.toast = orig }
  }

  it('saving and deleting from the row’s window both say so', async () => {
    const n = INPUTS.length
    await openNew()
    await click(calDay('2026-07-13'))
    await withToast(async () => { await addNow() })
    expect(toasts, 'an add says so').toContain('Input added')
    await withToast(async () => {
      await openRow(0)
      await click(D('#inpEditSave'))
    })
    expect(toasts, 'a save says so').toContain('Input updated')
    await withToast(async () => { await delRow(0) })
    expect(toasts, 'and a delete says so').toContain('Input deleted')
    expect(INPUTS.length, 'the add and the delete cancel out').toBe(n)
  })

  it('the CSV export says it downloaded — a phone shows no download UI of its own', async () => {
    /* jsdom implements neither Blob URLs nor the anchor download it drives —
       exportCSV (ui/export.ts) is untestable past this point by design (its
       own doc comment), so only the createObjectURL call is stubbed, the
       minimum this button's own click handler needs to run to completion */
    const orig = (URL as any).createObjectURL
    ;(URL as any).createObjectURL = () => 'blob:x'
    try {
      await withToast(async () => { await click($('#inExport')) })
    } finally { (URL as any).createObjectURL = orig }
    expect(toasts).toContain('CSV downloaded')
  })
})

/* FABLE F6 (22 Sep 26) — AFTER A DISMISSED SHEET, NOBODY WAS TOLD. When a
   scheduler hands a request to another man and then cancels the OIL question,
   the new holder is correctly left unanswered — but outside the mode nothing
   showed it. The row on this page carried no mark (the revise button appears
   only where an answer EXISTS), the warning list said nothing, and the bell is
   per-member, so it lights for the man and not for the scheduler who made the
   change. The member finds it eventually; the scheduler never does. */
describe('a request with an OIL day nobody has answered says so on its row', () => {
  const plant = (r: any) => {
    const row: any = { person: 'bane', type: 'Duty', date: 'Jul 18', allday: true, remarks: 'f6test', mod: 'now', yr: 2026, ...r }
    inpId(row); INPUTS.unshift(row); return row
  }
  const rowOf = (remark: string) => $$('#inBody tr').find(tr => (tr.textContent || '').includes(remark))

  it('the mark is there when nobody has answered, and gone once somebody has', async () => {
    plant({})
    await act(async () => { notify() })
    await showAllDates()
    const tr = rowOf('f6test')
    expect(tr, 'the row is on the page').toBeTruthy()
    expect(tr!.querySelector('[data-oilask]'), 'and it says the question is open').toBeTruthy()
    expect((tr!.querySelector('[data-oilask]') as HTMLElement).title, 'naming the day').toMatch(/18 Jul/)

    INPUTS[0].oil = { '2026-07-18': 1 }
    await act(async () => { notify() })
    const tr2 = rowOf('f6test')
    expect(tr2!.querySelector('[data-oilask]'), 'answered, so the mark goes').toBeFalsy()
    expect(tr2!.querySelector('[data-oilrev]'), 'and the revise control takes its place').toBeTruthy()
  })

  it('THE CONTROL — a type that never asks carries no mark', async () => {
    plant({ type: 'LL', remarks: 'f6ctrl' })
    await act(async () => { notify() })
    await showAllDates()
    const tr = rowOf('f6ctrl')
    expect(tr).toBeTruthy()
    expect(tr!.querySelector('[data-oilask]')).toBeFalsy()
  })
})

/* AN ADD ON THIS PAGE WRITES ITS HISTORY LINE (the absence-record re-test, AB8a, 26 Sep 26). Edit history names an
   input ADDED and an input REMOVED (engine-rules §The edit log) — and the same add through the edit window
   (commitNewInput) always wrote "Input added — …", while the page's OWN Add, the door people use most, wrote
   nothing: filed here, then deleted, the history held the deletion of a leave it had never seen filed. */
describe('Edit history hears an add made on this page', () => {
  /* since [DRAFT-PENDING] (28 Sep 26) the line comes from the change history's ONE writer (state/changelines.ts —
     Astra DP-03): "<callsign> · <type> added · <days>", exactly once */
  it('"+ Input" and Add write ONE "<callsign> · <type> added" line', async () => {
    await openNew()
    await click(D('#inpEdCal [data-cal]'))
    const before = ELOG.rows.length
    await addNow()
    const r = INPUTS[0]
    const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
    const mine = ELOG.rows.slice(before).filter((x: any) => x.iid === r.iid)
    expect(mine.length, 'exactly one line').toBe(1)
    expect(mine[0]!.lbl).toContain(`${cs} · ${r.type} added`)
    await delRow(0)
  })
})
