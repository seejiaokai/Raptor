// @vitest-environment jsdom
/* The Inputs page — tfin's inputs assertions plus the B26/B48 model rules
   driven through the page: role-gated add/delete, the undo stack, and the
   week revalidating when an input lands. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { acceptInput, inpKey, acceptedDay } from '../engine/slots'
import { HIST } from '../state/history'
import { validate } from '../engine/validate'

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
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'inputs')!)
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
    expect(opts).toContain('Detachment')
  })

  /* All day owns the whole window, so the two time fields go out of play. They
     were always `disabled`; the `dim` class is what makes that visible, so the
     field is not aimed at first and ignored second (owner, Aug 5). */
  it('All day dims the two time fields, and un-ticking restores them', async () => {
    const st = () => $('#inStartT') as HTMLInputElement
    const en = () => $('#inEndT') as HTMLInputElement
    const dim = (el: HTMLElement) => el.closest('.ifield')!.classList.contains('dim')
    /* the form opens all-day, so they start out of play */
    expect(st().disabled, 'start time disabled under All day').toBe(true)
    expect(en().disabled, 'end time disabled under All day').toBe(true)
    expect(dim(st()), 'start time reads as out of play').toBe(true)
    expect(dim(en()), 'end time reads as out of play').toBe(true)

    await click($('#inAllday'))
    expect(st().disabled, 'start time live once All day is off').toBe(false)
    expect(en().disabled, 'end time live once All day is off').toBe(false)
    expect(dim(st()), 'the fade lifts with the tick').toBe(false)
    expect(dim(en()), 'the fade lifts with the tick').toBe(false)

    await click($('#inAllday'))            // back to all-day for the tests below
    expect(st().disabled).toBe(true)
    expect(dim(st())).toBe(true)
  })

  it('the person filter is called Personnel, not All flights', () => {
    const first = ($('#inFPerson') as unknown as HTMLSelectElement).options[0]!
    expect(first.textContent).toBe('Personnel')
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
    await click($('#inAllday'))
    expect(($('#inStartT') as HTMLInputElement).disabled).toBe(false)
    await setV($('#inStartT'), '10:20')
    await setV($('#inEndT'), '11:35')
    await click($('#inAdd'))
    expect(INPUTS[0].allday).toBe(false)
    expect(INPUTS[0].s).toBe(620)
    expect(INPUTS[0].e).toBe(695)
    await act(async () => { undo() })
    /* an end at or before the start never reaches the model */
    await setV($('#inEndT'), '09:00')
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n)
    await click($('#inAllday'))                      // back to all-day for later tests
  })

  it('the ✕ deletes a row, and undo resurrects it', async () => {
    const n = INPUTS.length
    const first = INPUTS[0]
    await click($('#inBody .rmx'))
    expect(INPUTS.length).toBe(n - 1)
    expect(INPUTS[0]).not.toBe(first)
    await act(async () => { undo() })
    expect(INPUTS.length).toBe(n)
  })

  it('a member may not add or delete', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n)
    await click($('#inBody .rmx'))
    expect(INPUTS.length).toBe(n)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('the filters narrow the table', async () => {
    const all = $$('#inBody tr').length
    await act(async () => {
      const sel = $('#inFType') as unknown as HTMLSelectElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      setter.call(sel, 'Downchit')
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const narrowed = $$('#inBody tr').length
    expect(narrowed).toBeGreaterThan(0)
    expect(narrowed).toBeLessThan(all)
    expect($$('#inBody .intag').every(x => x.textContent === 'Downchit')).toBe(true)
  })

  it('an added downchit re-validates the week (reflow)', async () => {
    validate()
    const before = validate().all.filter((x: any) => x.code === 'DNIF_FLY').length
    /* put a downchit on someone flying Monday — stiff flies both waves */
    await act(async () => {
      const { writeInputs } = await import('../state/store')
      writeInputs(() => INPUTS.unshift({ person: 'stiff', date: 'Jul 13', allday: true, type: 'Downchit', remarks: '', mod: 'now' }))
    })
    const after = validate().all.filter((x: any) => x.code === 'DNIF_FLY').length
    expect(after).toBeGreaterThan(before)
    await act(async () => { undo() })
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
    expect($$('#inCal .rc-d.e').length).toBe(0)
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
    await click($('#inAdd'))
    expect(INPUTS.length).toBe(n + 1)
    expect(INPUTS[0].date).toBe('Jul 14')
    expect(INPUTS[0].endDate).toBe('Jul 16')
    await act(async () => { undo() })
  })
})

/* the pencil edits the row in place */
describe('editing an input from its own line', () => {
  it('opens on the pencil, commits on ✓, and joins the undo stack', async () => {
    const row0 = () => $$('#inBody tr')[0]
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
    await click($$('#inBody tr')[0].querySelector('[data-edit]'))
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

    await click($$('#inBody tr')[0].querySelector('[data-edit]'))
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
    await click($$('#inBody tr')[0].querySelector('[data-edit]'))
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

    await click($$('#inBody tr')[0].querySelector('[data-edit]'))
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
    await click($$('#inBody tr')[0].querySelector('.rmx'))
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
    await click($$('#inBody tr')[0].querySelector('[data-edit]'))
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

/* The remarks tail (owner, Aug 26): closing a range on the calendar writes its
   last day into Remarks as `till 15 Jul`, and everything the typist put in
   front of it is kept — `LL till 15 Jul`. The tail belongs to the calendar, so
   it is rewritten and removed by picking, never duplicated. */
describe('the end date writes itself into Remarks', () => {
  const day = (d: string) => $(`#inCal [data-cal="2026-07-${d}"]`)
  const rm = () => $('#inRemarks') as HTMLInputElement
  const typeInto = async (el: any, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })

  it('a start alone says nothing; closing the range writes the end date', async () => {
    await click(day('13'))
    expect(rm().value, 'one date is not a span').toBe('')
    await click(day('15'))
    expect(rm().value).toBe('till 15 Jul')
  })

  it('the typed note survives, and the tail follows the calendar', async () => {
    await typeInto(rm(), 'LL till 15 Jul')
    await click(day('16'))                  // a fresh range takes the tail with it…
    expect(rm().value, 'only the tail is the calendars to remove').toBe('LL')
    await click(day('18'))                  // …and the new end writes a new one
    expect(rm().value).toBe('LL till 18 Jul')
    /* re-picking rewrites the tail rather than stacking another one on */
    await click(day('16')); await click(day('17'))
    expect(rm().value).toBe('LL till 17 Jul')
  })

  it('a range that ends where it starts writes no tail', async () => {
    await typeInto(rm(), '')
    await click(day('20')); await click(day('20'))
    // add() drops endDate for a one-day range, so a tail would name a span it lacks
    expect(rm().value).toBe('')
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
    await click($$('#inBody tr')[0].querySelector('[data-edit]'))
    const ed = () => $('#inBody tr.ined [data-ed="remarks"]') as HTMLInputElement
    expect(ed().value, 'opening the editor rewrites nothing').toBe(INPUTS[0].remarks || '')
    await typeInto(ed(), 'LL')
    /* Jul 12 is before every date in the demo week, so this always lands as a
       bare start whatever range the row opened with */
    await click($('#inedCal [data-cal="2026-07-12"]'))
    expect(ed().value).toBe('LL')
    await click($('#inedCal [data-cal="2026-07-14"]'))
    expect(ed().value).toBe('LL till 14 Jul')
    await click($('#inBody tr.ined [data-cancel]'))
  })
})
