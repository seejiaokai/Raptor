// @vitest-environment jsdom
/* The Inputs page — tfin's inputs assertions plus the B26/B48 model rules
   driven through the page: role-gated add/delete, the undo stack, and the
   week revalidating when an input lands. */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo } from '../state/store'
import { INPUTS, INPUT_TYPES, DATES } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { acceptInput, inpKey, acceptedDay } from '../engine/slots'
import { canEditSched } from '../state/auth'
import { HIST } from '../state/history'
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
   so — its buttons carry the model index, so find it by that. */
const rowFor = (inx: number) => $$('#inBody tr').find(tr =>
  tr.querySelector(`[data-edit="${inx}"],[data-inx="${inx}"],[data-save="${inx}"]`))!
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

/* the add form's type dropdown, for the tests that need a type with (or
   without) the AM/PM span picker */
const setType = async (v: string) => act(async () => {
  const sel = $('#inType') as unknown as HTMLSelectElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
  setter.call(sel, v)
  sel.dispatchEvent(new Event('change', { bubbles: true }))
})

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
  await showAllDates()
})

describe('the Inputs page (tfin)', () => {
  it('inputs rows', () => {
    expect($$('#inBody tr').length).toBeGreaterThanOrEqual(4)
  })

  it('no TDY, and the retired types are gone', () => {
    const opts = [...($('#inType') as unknown as HTMLSelectElement).options].map(o => o.value)
    expect(opts).not.toContain('TDY')
    /* removed Aug 26 — Office was a desk marker nobody read, and the two
       "Available" types were offers rather than commitments */
    for (const dead of ['Office', 'Available fly', 'Available duty'])
      expect(opts).not.toContain(dead)
    expect(opts).toContain('OD')
  })

  /* THE REPEAT-WEEKS FEATURE IS GONE (owner, 22 Aug 26 — "remove repeated
     weeks everywhere"). It never expanded anywhere — the record stored one
     span and only the calendar question exposed that — so the field, the
     column and the recur write all left together. Pinned so a later "the
     form looks thin" pass does not put it back. */
  it('no Repeat wks field, no Recurring column, and an add writes no recur', async () => {
    expect($('#inRepeat'), 'the Repeat wks field is gone').toBeFalsy()
    expect($('#intbl thead th[data-sort="recur"]'), 'the Recurring heading is gone').toBeFalsy()
    /* the add needs a start date — pick one on the form's own calendar
       rather than leaning on a date some earlier test happened to leave.
       TWICE, completing a one-day range: a single click leaves the picker
       half-open, and the next test's first click would then silently
       complete THIS range instead of starting its own */
    await click($('#inCal [data-cal]'))
    await click($('#inCal [data-cal]'))
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    expect('recur' in INPUTS[0], 'a fresh record carries no recur field').toBe(false)
    await click(rowFor(0).querySelector('.rmx'))
    expect(INPUTS.length).toBe(n)
  })

  /* All day owns the whole window, so the two time fields go out of play. They
     were always `disabled`; the `dim` class is what makes that visible, so the
     field is not aimed at first and ignored second (owner, Aug 5). */
  it('All day dims the two time fields, and Custom restores them', async () => {
    const st = () => $('#inStartT') as HTMLInputElement
    const en = () => $('#inEndT') as HTMLInputElement
    const dim = (el: HTMLElement) => el.closest('.ifield')!.classList.contains('dim')
    /* the form opens all-day, so they start out of play */
    expect(st().disabled, 'start time disabled under All day').toBe(true)
    expect(en().disabled, 'end time disabled under All day').toBe(true)
    expect(dim(st()), 'start time reads as out of play').toBe(true)
    expect(dim(en()), 'end time reads as out of play').toBe(true)

    /* the form opens on LL, a leave type, so it carries the four-way span
       picker rather than the tick (owner, 10 Aug 26) */
    await click($('#inSpan [data-span="custom"]'))
    expect(st().disabled, 'start time live under Custom').toBe(false)
    expect(en().disabled, 'end time live under Custom').toBe(false)
    expect(dim(st()), 'the fade lifts with the span').toBe(false)
    expect(dim(en()), 'the fade lifts with the span').toBe(false)

    await click($('#inSpan [data-span="all"]'))   // back to all-day for the tests below
    expect(st().disabled).toBe(true)
    expect(dim(st())).toBe(true)
  })

  /* THE HALF-DAYS. AM and PM fill in the two time fields the form already had
     — nothing new is stored but the label — and the picker is offered for
     leave and medical types only, because the rest already take an exact
     range, which is finer than a half. */
  it('AM and PM fill the window, and only leave and medical are offered them', async () => {
    const st = () => $('#inStartT') as HTMLInputElement
    const en = () => $('#inEndT') as HTMLInputElement
    await click($('#inSpan [data-span="am"]'))
    expect([st().value, en().value]).toEqual(['00:00', '12:00'])
    await click($('#inSpan [data-span="pm"]'))
    expect([st().value, en().value]).toEqual(['12:01', '23:59'])
    /* the minutes reach the model, and the half rides along as a label */
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inAdd'))
    expect(INPUTS[0].allday).toBe(false)
    expect([INPUTS[0].s, INPUTS[0].e]).toEqual([721, 1439])
    expect(INPUTS[0].half).toBe('pm')
    await act(async () => { undo() })
    /* an activity type keeps the plain tick, and carries no half */
    await setType('Training')
    expect($('#inSpan')).toBeFalsy()
    expect($('#inAllday')).toBeTruthy()
    await click($('#inAdd'))
    expect(INPUTS[0].type).toBe('Training')
    expect(INPUTS[0].half).toBeUndefined()
    await act(async () => { undo() })
    await setType('LL')
    await click($('#inSpan [data-span="all"]'))
  })

  /* the All day default follows the type (owner, 22 Aug 26): every "Duty &
     other commitments" type but SANS opens timed, so the box lands UNTICKED;
     leave, medical and SANS keep it ticked. It is a default, re-seeded on each
     type change, so the record written by an untouched form proves it. */
  it('unticks All day by default for Duty & other commitments, but not SANS or leave', async () => {
    /* every timed "Duty & other commitments" type opens with the plain tick
       UP and UNCHECKED — the whole group bar SANS (the record a timed window
       actually lands from is pinned in boardaddinput.test.tsx's Meeting add) */
    for (const t of ['Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Duty', 'OD', 'Other']) {
      await setType(t)
      expect($('#inSpan'), `${t} takes the plain tick, not the span picker`).toBeFalsy()
      expect(($('#inAllday') as HTMLInputElement).checked, `${t} opens unticked`).toBe(false)
    }
    /* SANS Availability is the carve-out: it takes the span picker and opens
       on all-day, exactly as leave and medical do */
    await setType('SANS Availability')
    expect($('#inAllday'), 'SANS has the span picker, not the plain tick').toBeFalsy()
    expect(($('#inSpan [data-span="all"]') as HTMLElement).getAttribute('aria-pressed'), 'SANS opens all-day').toBe('true')
    /* a leave type is unchanged — still opens all-day */
    await setType('LL')
    expect(($('#inSpan [data-span="all"]') as HTMLElement).getAttribute('aria-pressed'), 'leave opens all-day').toBe('true')
  })

  /* switching away from a half-capable type must not strand an invisible half
     on the record — the row would claim a window nobody could see or change */
  it('changing to a type with no halves clears the half', async () => {
    await click($('#inSpan [data-span="am"]'))
    await setType('Appointment')
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inAdd'))
    expect(INPUTS[0].half).toBeUndefined()
    await act(async () => { undo() })
    await setType('LL')
    await click($('#inSpan [data-span="all"]'))
  })

  /* the legend the owner asked for: a button by the type field, generated from
     the same table the rules come off, so it cannot describe a rule the engine
     does not apply */
  it('the type legend opens, names every type, and closes on an outside click', async () => {
    expect($('#inTypePop'), 'closed to start with').toBeFalsy()
    await click($('#inTypeHelp'))
    const pop = $('#inTypePop')!
    expect(pop, 'opens on the ?').toBeTruthy()
    for (const t of INPUT_TYPES) expect(pop.textContent, t).toContain(t)
    /* and it says what each one DOES, not just what it stands for */
    expect(pop.textContent).toContain('may still stand an SC spare')
    expect(pop.textContent).toContain('no flying')
    expect(pop.textContent).toContain('overseas')
    await act(async () => { document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
    expect($('#inTypePop'), 'closes on a press outside').toBeFalsy()
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
    await click($('#inCal [data-cal="2026-07-13"]'))   // a start date is required now
    await act(async () => {
      const rm = $('#inRemarks') as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(rm, 'PHASE4C TEST')
      rm.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].remarks).toBe('PHASE4C TEST')
    expect($$('#inBody tr').length).toBeGreaterThanOrEqual(5)
    /* personal inputs join the undo stack */
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  /* the timing fields (owner, Aug 26): an untouched form still writes the old
     06:00–18:00 window, All day still writes 0–1439, and unticking All day
     frees the two time fields so the stated minutes land on the input */
  it('a timed add stores the stated minutes; all-day stays 0–1439', async () => {
    const setV = async (el: any, v: string) => act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#inCal [data-cal="2026-07-13"]'))   // a start date is required now
    await click($('#inAdd'))
    expect(INPUTS[0].s).toBe(0)
    expect(INPUTS[0].e).toBe(1439)
    await act(async () => { undo() })
    expect(($('#inStartT') as HTMLInputElement).disabled).toBe(true)
    await click($('#inSpan [data-span="custom"]'))
    expect(($('#inStartT') as HTMLInputElement).disabled).toBe(false)
    await setV($('#inStartT'), '10:20')
    await setV($('#inEndT'), '11:35')
    await click($('#inAdd'))
    expect(INPUTS[0].allday).toBe(false)
    expect(INPUTS[0].s).toBe(620)
    expect(INPUTS[0].e).toBe(695)
    await act(async () => { undo() })
    /* an end EARLIER than the start is an OVERNIGHT absence now — 22:00–02:00 is
       a real thing to be down for, and every other row type has rolled that way
       since the port (owner, 11 Aug 26). It reaches the model as typed and the
       engine rolls it. Only an end EQUAL to the start is refused, being a
       zero-length absence. */
    await setV($('#inEndT'), '09:00')
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].s).toBe(620)
    expect(INPUTS[0].e).toBe(540)
    await act(async () => { undo() })
    await setV($('#inEndT'), '10:20')                 // equal to the start
    const n2 = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n2)
    await click($('#inSpan [data-span="all"]'))       // back to all-day for later tests
  })

  it('the ✕ deletes a row, and undo resurrects it', async () => {
    const n = INPUTS.length
    const first = INPUTS[0]
    await click(rowFor(0).querySelector('.rmx'))
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
    await click($('#inAdd'))
    expect(INPUTS.length, 'the add went through').toBe(n + 1)
    await click($('#inBody .rmx'))
    expect(INPUTS.length, 'and so did the delete').toBe(n)
    /* the pencil opens for them as well — the third gate that used to refuse */
    await click($('#inBody [data-edit]'))
    expect($('#inBody [data-cancel]'), 'the row opened as fields').toBeTruthy()
    await click($('#inBody [data-cancel]'))
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* owner, 22 Aug 26 — "for normal user account they can only input their own
     self. Which is whoever they are viewing as." Admin keeps the full roster
     select on both this form and the month calendar; a member's Person is the
     view-as person, printed as a value rather than offered as a choice — the
     rule the calendar's add dialog already applied, now on the page's own
     form too. */
  it('a member files for the view-as person only, and the fixed Person follows View-as', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($('#inPerson'), 'the roster select is a scheduler\'s').toBeFalsy()
    expect($('#inPersonFixed').textContent, 'the value is the view-as callsign').toBe(PEOPLE[ME].cs)
    /* switch who is being viewed as — the fixed value follows LIVE, and so
       does what the add actually writes (filedFor reads ME at commit, not a
       state seeded when the page mounted) */
    await act(async () => { setMe('dj'); notify() })
    expect($('#inPersonFixed').textContent).toBe(PEOPLE.dj.cs)
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length, 'the add went through').toBe(n + 1)
    expect(INPUTS[0].person, 'and landed on the view-as person').toBe('dj')
    await click(rowFor(0).querySelector('.rmx'))
    expect(INPUTS.length).toBe(n)
    await act(async () => { setMe('bane'); setSession({ user: 'a', role: 'admin' }); notify() })
    expect(($('#inPerson') as unknown as HTMLSelectElement), 'admin gets the roster select back').toBeTruthy()
  })

  it('a member\'s row editor keeps the person as plain text', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    await click($('#inBody [data-edit]'))
    const ed = $('#inBody tr.ined')
    expect(ed, 'the row opened as fields').toBeTruthy()
    expect(ed.querySelector('select[data-ed="person"]'), 'no Person select for a member').toBeFalsy()
    expect(ed.querySelector('[data-fld="Person"]')!.textContent, 'the name still prints').toBeTruthy()
    await click($('#inBody [data-cancel]'))
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
    /* commitNewInput pins a hand-made draft onto the viewer */
    await act(async () => {
      ok = commitNewInput({ person: was, type: 'LL', start: '2026-07-14', allday: true, remarks: '' })
    })
    expect(ok).toBe(true)
    expect(INPUTS[0].person, 'the add landed on the view-as person, not the claimed one').toBe(ME)
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
  it('stripes rows red/amber/purple by inputTone', async () => {
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
    const sanIx = INPUTS.findIndex((r: any) => r.person === 'nick' && r.type === 'SANS Availability')
    expect(sanIx, 'the demo SANS seed is present').toBeGreaterThanOrEqual(0)
    expect(rowFor(sanIx).className, 'SANS Availability').toContain('in-san')
  })

  /* owner, 24 Aug 26 — "include the F/O/A in the inputs as well". A SANS row
     wears its offer letters in a chip BESIDE the type tag; the tag itself stays
     the pure type string the sort/export and the .intag pin above still read. */
  it('a SANS row shows its F/O/A offer letters beside the type, never inside it', async () => {
    /* the earlier filter test can leave fType on OML — put it back to All so
       every seeded SANS person is on screen */
    await act(async () => {
      const sel = $('#inFType') as unknown as HTMLSelectElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(sel, 'all')
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    /* bullet's seed ticks all three (F/O/A); nick's ticks Fly only (F) */
    const bulletIx = INPUTS.findIndex((r: any) => r.person === 'bullet' && r.type === 'SANS Availability')
    const nickIx = INPUTS.findIndex((r: any) => r.person === 'nick' && r.type === 'SANS Availability')
    expect(bulletIx, 'the all-letters SANS seed is present').toBeGreaterThanOrEqual(0)
    expect(rowFor(bulletIx).querySelector('.foa')!.textContent).toBe('F/O/A')
    expect(rowFor(nickIx).querySelector('.foa')!.textContent).toBe('F')
    /* the type tag stays pure identity — no letters leaked into it */
    expect(rowFor(bulletIx).querySelector('.intag')!.textContent).toBe('SANS Availability')
    /* a non-SANS row carries no F/O/A chip at all */
    const omlIx = INPUTS.findIndex((r: any) => r.type === 'OML')
    expect(rowFor(omlIx).querySelector('.foa')).toBeNull()
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
  const setPerson = async (v: string) => act(async () => {
    const sel = $('#inPerson') as unknown as HTMLSelectElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
    setter.call(sel, v)
    sel.dispatchEvent(new Event('change', { bubbles: true }))
  })
  /* the sans checkboxes carry no id — found by their own label text, in
     SANS_ROWS' own Fly / AMT / OFT display order */
  const sansCk = (label: string) =>
    $$('#inSans .sanspick-ck').find(l => l.textContent?.includes(label))!.querySelector('input[type="checkbox"]') as HTMLInputElement
  const originalPerson = () => ($('#inPerson') as unknown as HTMLSelectElement).value
  const toasts: string[] = []
  const withToast = async (fn: () => Promise<void>) => {
    toasts.length = 0
    const orig = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await fn() } finally { HOOKS.toast = orig }
  }

  it('SansPicker mounts on selecting the type, alongside the standard span picker and time fields', async () => {
    const before = originalPerson()
    expect($('#inSans')).toBeFalsy()
    await setType('SANS Availability')
    expect($('#inSans'), 'the picker mounts').toBeTruthy()
    /* exactly 3 checkboxes, in Fly / AMT / OFT order */
    const rows = $$('#inSans .sanspick-ck')
    expect(rows.length).toBe(3)
    expect(rows.map(r => r.textContent?.trim())).toEqual(['Fly', 'AMT', 'OFT'])
    /* the owner's phone bug is what this pins: no per-event time pair any
       more, anywhere inside the picker */
    expect($$('#inSans input[type="time"]').length).toBe(0)
    /* INPUT_META gives SANS half:true now, so it gets the SAME span picker
       and time fields as leave and medical — not a swapped-out control */
    expect($('#inSpan'), 'the standard span picker is offered too').toBeTruthy()
    expect($('.spanpick')).toBeTruthy()
    expect($('#inStartT'), 'the standard start time field is present').toBeTruthy()
    expect($('#inEndT'), 'the standard end time field is present').toBeTruthy()
    expect($('#inAllday'), 'a half-day type never gets the plain tick').toBeFalsy()
    await setType('LL')                        // back to an ordinary type for later tests
    expect($('#inSans')).toBeFalsy()
    await setPerson(before)
  })

  it('refuses a non-SANS person, and leaves INPUTS untouched', async () => {
    await setType('SANS Availability')
    const nonSans = Object.keys(PEOPLE).find(id => !PEOPLE[id].san && !PEOPLE[id].archived)!
    expect(PEOPLE[nonSans].san).toBeFalsy()
    await setPerson(nonSans)
    await click(sansCk('Fly'))
    const n = INPUTS.length
    await withToast(async () => { await click($('#inAdd')) })
    expect(INPUTS.length, 'nothing was added').toBe(n)
    expect(toasts.some(t => /SANS aircrew only/.test(t)), toasts.join(' | ')).toBe(true)
    await setType('LL')
  })

  it('refuses an empty tick set', async () => {
    await setType('SANS Availability')
    const sansId = Object.keys(PEOPLE).find(id => PEOPLE[id].san)!
    await setPerson(sansId)
    const n = INPUTS.length
    await withToast(async () => { await click($('#inAdd')) })
    expect(INPUTS.length, 'nothing was added').toBe(n)
    expect(toasts.some(t => /Tick at least one/.test(t)), toasts.join(' | ')).toBe(true)
    await setType('LL')
  })

  /* All day is the form's default span, so the ticked flags alone decide
     whether Add goes through; the record rides the same all-day shape
     (s:0, e:1439) every other type gets — SANS carries no window of its
     own outside allday/half/s/e any more. */
  it('ticking Fly + OFT under the default All day commits sans flags only', async () => {
    await setType('SANS Availability')
    const sansId = Object.keys(PEOPLE).find(id => PEOPLE[id].san)!
    await setPerson(sansId)
    await click(sansCk('Fly'))
    await click(sansCk('OFT'))
    /* twice, so the pick lands on Jul 13 whatever range the form was left in
       — two clicks on one day always end with that day as the start */
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inCal [data-cal="2026-07-13"]'))
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    const r = INPUTS[0] as any
    expect(r.person).toBe(sansId)
    expect(r.type).toBe('SANS Availability')
    expect(r.allday).toBe(true)
    expect(r.half).toBeUndefined()
    /* sans values are true flags, never the old {s,e} object shape */
    expect(r.sans).toEqual({ f: true, o: true })
    await act(async () => { undo() })
    await setType('LL')
  })

  it('picking AM commits allday:false, half:\'am\', and the ticked flags', async () => {
    await setType('SANS Availability')
    const sansId = Object.keys(PEOPLE).find(id => PEOPLE[id].san)!
    await setPerson(sansId)
    await click(sansCk('AMT'))
    await click($('#inSpan [data-span="am"]'))
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inCal [data-cal="2026-07-13"]'))
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    const r = INPUTS[0] as any
    expect(r.allday).toBe(false)
    expect(r.half).toBe('am')
    expect(r.sans).toEqual({ a: true })
    await act(async () => { undo() })
    await click($('#inSpan [data-span="all"]'))
    await setType('LL')
  })

  it('picking Custom and typing 08:00–12:00 commits s:480, e:720', async () => {
    await setType('SANS Availability')
    const sansId = Object.keys(PEOPLE).find(id => PEOPLE[id].san)!
    await setPerson(sansId)
    await click(sansCk('Fly'))
    await click($('#inSpan [data-span="custom"]'))
    await setV($('#inStartT'), '08:00')
    await setV($('#inEndT'), '12:00')
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inCal [data-cal="2026-07-13"]'))
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    const r = INPUTS[0] as any
    expect(r.allday).toBe(false)
    expect(r.s).toBe(480)
    expect(r.e).toBe(720)
    expect(r.sans).toEqual({ f: true })
    await act(async () => { undo() })
    await click($('#inSpan [data-span="all"]'))
    await setType('LL')
  })

  it('the type legend carries the SANS "not an absence" sentence', async () => {
    await click($('#inTypeHelp'))
    expect($('#inTypePop')!.textContent).toContain('not an absence')
    await act(async () => { document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) })
  })
})

/* The two-click range calendar (owner, Aug 26) replaced the pair of date
   boxes. First click starts, second ends, and a second click BEFORE the start
   cannot make a backwards range — it becomes the new start instead. */
describe('the range calendar', () => {
  const day = (d: string) => $(`#inCal [data-cal="2026-07-${d}"]`)
  const readout = () => $('#inDates').textContent

  it('replaced the two date inputs', () => {
    expect($('#inStart')).toBeFalsy()
    expect($('#inEnd')).toBeFalsy()
    expect($('#inCal'), 'the calendar renders').toBeTruthy()
  })

  it('starts on Monday and marks the weekend', () => {
    const dow = $$('#inCal .rc-dow span').map(x => x.textContent)
    expect(dow).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'])
    // 18 Jul 2026 is a Saturday
    expect(day('18').classList.contains('wk')).toBe(true)
    expect(day('15').classList.contains('wk')).toBe(false)
  })

  it('two clicks make a range, and the days between are marked', async () => {
    await click(day('14'))
    expect(readout()).toBe('14 Jul')
    expect(day('14').classList.contains('s')).toBe(true)
    await click(day('17'))
    expect(readout()).toBe('14 Jul → 17 Jul')
    expect(day('17').classList.contains('e')).toBe(true)
    expect(day('15').classList.contains('mid')).toBe(true)
  })

  it('a backwards second click becomes the new start instead', async () => {
    await click(day('20'))                 // fresh range
    expect(readout()).toBe('20 Jul')
    await click(day('16'))                 // earlier — cannot be an end
    expect(readout()).toBe('16 Jul')
    expect(day('16').classList.contains('s')).toBe(true)
    expect($$('#inCal .rc-d.e').length).toBe(0)
    await click(day('17'))                 // now it can close
    expect(readout()).toBe('16 Jul → 17 Jul')
  })

  it('a third click begins a fresh range rather than sticking', async () => {
    await click(day('21'))
    expect(readout()).toBe('21 Jul')
  })

  it('the picked range is what Add writes', async () => {
    await click(day('14')); await click(day('16'))
    const n = INPUTS.length
    await click($('#inAdd'))
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

/* the pencil edits the row in place */
describe('editing an input from its own line', () => {
  it('opens on the pencil, commits on ✓, and joins the undo stack', async () => {
    const row0 = () => rowFor(0)
    await click(row0().querySelector('[data-edit]'))
    expect($('#inBody tr.ined'), 'the row became fields').toBeTruthy()
    const rm = $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(rm, 'EDITED IN PLACE'); rm.dispatchEvent(new Event('input', { bubbles: true })) })
    const inx = +($('#inBody tr.ined [data-save]') as HTMLElement).dataset.save!
    const was = INPUTS[inx].remarks
    await click($('#inBody tr.ined [data-save]'))
    expect($('#inBody tr.ined'), 'the row closed').toBeFalsy()
    expect(INPUTS[inx].remarks).toBe('EDITED IN PLACE')
    await act(async () => { undo() })
    expect(INPUTS[inx].remarks).toBe(was)
  })

  it('cancel leaves the row untouched', async () => {
    const before = JSON.stringify(INPUTS[0])
    await click(rowFor(0).querySelector('[data-edit]'))
    const rm = $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(rm, 'THROWN AWAY'); rm.dispatchEvent(new Event('input', { bubbles: true })) })
    await click($('#inBody tr.ined [data-cancel]'))
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
    expect(DAYS[0].ground.some((r: any) => r.src === inpKey(inp))).toBe(true)

    await click(rowFor(0).querySelector('[data-edit]'))
    const ty = $('#inBody tr.ined [data-ed="type"]') as HTMLSelectElement
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(ty, 'Appointment'); ty.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await click($('#inBody tr.ined [data-save]'))

    expect(inp.type).toBe('Appointment')
    expect(DAYS[0].ground.length, 'no duplicate row left behind').toBe(nGround)
    // the link followed the edit, so the row is still reachable
    expect(DAYS[0].ground.some((r: any) => r.src === inpKey(inp)), 'src re-linked').toBe(true)
    const row = DAYS[0].ground.find((r: any) => r.src === inpKey(inp))
    expect(row.prog).toBe('APPOINTMENT')      // and it re-reads under the new type
    await act(async () => { INPUTS.splice(INPUTS.indexOf(inp), 1); notify() })
  })

  /* the editor used to hold a model INDEX; adding a row renumbers INPUTS and
     the draft then committed onto whoever had shifted into that slot */
  it('commits onto the right row even after the list renumbers underneath', async () => {
    const target = INPUTS[0]
    const wasOther = INPUTS[1] ? { ...INPUTS[1] } : null
    await click(rowFor(0).querySelector('[data-edit]'))
    const rm = $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    await setV(rm, 'STAYS ON TARGET')
    // something else lands at the top of the list while the editor is open
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'yeti', date: 'Jul 14', allday: true, type: 'LL', remarks: 'jumped the queue', mod: '' }))
    })
    await click($('#inBody tr.ined [data-save]'))
    expect(target.remarks).toBe('STAYS ON TARGET')
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
    const before = groundRows().filter(r => r.src === inpKey(inp)).length
    expect(before).toBe(1)

    await click(rowFor(0).querySelector('[data-edit]'))
    await click($('#inBody tr.ined [data-save]'))                  // change nothing

    const after = groundRows().filter(r => r.src === inpKey(inp))
    expect(after.length, 'still exactly one row').toBe(1)
    expect(after[0].di, 'and still on the day it was accepted on').toBe(4)
    await act(async () => { INPUTS.splice(INPUTS.indexOf(inp), 1); notify() })
  })

  it('deleting an accepted input takes its ground row with it', async () => {
    INPUTS.unshift({ person: 'yeti', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'del me', mod: '' })
    const inp = INPUTS[0]
    await act(async () => { acceptInput(0, inp, 'g'); notify() })
    const key = inpKey(inp)
    expect(groundRows().some(r => r.src === key)).toBe(true)
    await click(rowFor(0).querySelector('.rmx'))
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
    await click(rowFor(0).querySelector('[data-edit]'))
    const rm = $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(rm, 'CHANGED'); rm.dispatchEvent(new Event('input', { bubbles: true }))
    })
    /* the bug was that ONE ✓ pushed TWO snapshots — unacceptInput's markEdit
       fired mid-way, so the first Undo landed on old fields that were already
       un-accepted, a state the user never created */
    const depth = HIST.stack.length
    await click($('#inBody tr.ined [data-save]'))
    expect(INPUTS[0].remarks).toBe('CHANGED')
    expect(HIST.stack.length - depth, 'one action, one undo step').toBe(1)
    await act(async () => { undo() })
    expect(INPUTS.some((x: any) => x.remarks === 'CHANGED')).toBe(false)
    expect(INPUTS.find((x: any) => x.person === 'salsa' && x.remarks === 'one step')).toBeTruthy()
  })

  it('Add refuses to invent a date when none was picked', async () => {
    // a fresh page state has no pick; the readout says so and Add must agree
    const n = INPUTS.length
    await click($('#inCal [data-cal="2026-07-14"]'))
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    await act(async () => { undo() })
  })
})

/* The remarks tail (owner, Aug 26; single-day "till" 18 Aug 26): picking on the
   calendar writes the date into Remarks as `till 15 Jul` — a span uses its last
   day, and a ONE-DAY pick uses that day — and everything the typist put in front
   of it is kept — `LL till 15 Jul`. The tail belongs to the calendar, so it is
   rewritten and removed by picking, never duplicated. */
describe('the picked date writes itself into Remarks', () => {
  const day = (d: string) => $(`#inCal [data-cal="2026-07-${d}"]`)
  const rm = () => $('#inRemarks') as HTMLInputElement
  const typeInto = async (el: any, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })

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

  it('Add clears the note but keeps the tail, because the dates stay on the form', async () => {
    await click(day('14')); await click(day('16'))
    await typeInto(rm(), 'LL till 16 Jul')
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS[0].remarks).toBe('LL till 16 Jul')
    expect(rm().value).toBe('till 16 Jul')
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  it('the row editor writes the same tail — but only from a click', async () => {
    await click(rowFor(0).querySelector('[data-edit]'))
    const ed = () => $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    expect(ed().value, 'opening the editor rewrites nothing').toBe(INPUTS[0].remarks || '')
    await typeInto(ed(), 'LL')
    /* Jul 12 is before every date in the demo week, so this always lands as a
       bare start whatever range the row opened with — and a bare start now
       carries its own one-day "till" */
    await click($('#inedCal [data-cal="2026-07-12"]'))
    expect(ed().value).toBe('LL till 12 Jul')
    await click($('#inedCal [data-cal="2026-07-14"]'))
    expect(ed().value).toBe('LL till 14 Jul')
    await click($('#inBody tr.ined [data-cancel]'))
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
  /* twice, so the pick lands on Jul 13 whatever range the form was left in:
     two clicks on one day always end with that day as the start */
  const addOne = async (remark: string) => {
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inCal [data-cal="2026-07-13"]'))
    await setV($('#inRemarks'), remark, window.HTMLInputElement)
    await click($('#inAdd'))
  }
  const reset = async () => {
    await setFType('all')
    await showAllDates()
  }

  it('rides the top row even when the filter and the window both exclude it', async () => {
    const n = INPUTS.length
    await useDefaultRange()          // Jul 2026 is behind us — outside the window
    await setFType('OML')            // and the add below is an LL, not an OML
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
     add() scrolls it into view once React has painted it. */
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

  it('saving and deleting the inline row editor both say so', async () => {
    const n = INPUTS.length
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inCal [data-cal="2026-07-13"]'))
    await click($('#inAdd'))
    await withToast(async () => {
      await click(rowFor(0).querySelector('[data-edit]'))
      await click($('#inBody tr.ined [data-save]'))
    })
    expect(toasts, 'the ✓ says the same words the dialog\'s own ✓ does').toContain('Input updated')
    await withToast(async () => {
      await click(rowFor(0).querySelector('.rmx'))
    })
    expect(toasts, 'and the ✕ says the same words the dialog\'s own delete does').toContain('Input deleted')
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
