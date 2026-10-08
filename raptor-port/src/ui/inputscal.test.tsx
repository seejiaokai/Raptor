// @vitest-environment jsdom
/* The Inputs page's month-calendar view (ui/InputsCal.tsx) — the toggle, the
   grid shape, and the chips it draws. The day popover, hold-to-add and drag
   are later tasks and carry no assertions here; this file only pins the
   shell, the view-state round trip, and the DISPLAY contract (the data
   attributes those later tasks will hook). */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo, writeInputs } from '../state/store'
import { INPUTS, inpId, defaultAllday } from '../engine/inputs'
import { INPVIEW, CALMONTH, setCalMonth } from '../state/view'
import { DAYRMK, PLANPUCKS, addPlanPuck, addPuckPeople, addPuckRow, removePlanPuck } from '../state/plan'
import { LIFT_LAND_MS, markLand, pendingLand } from './lift'
import { ME } from '../state/auth'
import { PEOPLE, QORDER } from '../engine/people'
import { fmt, fmtDay, unfmt, firstPersonalType } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { monthCells } from './InputsCal'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const setSelect = async (sel: string, v: string) => act(async () => {
  const el = $(sel) as unknown as HTMLSelectElement
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
  setter.call(el, v)
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
/* a REAL PointerEvent — jsdom 30 (this repo's version, verified in
   caldrag.test.tsx) constructs one with clientX/clientY/pointerId round-
   tripping, so both caldrag.ts's own machine and InputsCal.tsx's own
   hold-to-add gesture (both native pointer listeners on the grid) see a
   genuine event, not a stand-in. */
const ptr = (type: string, x: number, y: number, id = 1) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: true })
/* A TAP IS ONE MOMENT, NOT TWO ([INPUTSCAL-TAP-FLAKY], 29 Sep 26). The press and the lift go in ONE synchronous act,
   so no timer can fire between them. They used to be two awaited acts, and REAL time passed between the two: past
   caldrag's 180ms hold a chip was PICKED UP (its lift then asks `document.elementFromPoint`, which jsdom does not
   have — "is not a function"), and past the calendar's 450ms hold-to-add an empty cell opened the add form instead
   of the day's popover. Alone the gap is a few ms; inside the full unit run, under load, it was not — four branches
   failed that way, never alone. A test that means a HOLD drives the clock itself (vi.useFakeTimers, below). */
const tap = async (el: Element, x: number, y: number) => act(async () => {
  el.dispatchEvent(ptr('pointerdown', x, y))
  el.dispatchEvent(ptr('pointerup', x, y))
  // A browser follows a tap with click. caldrag consumes that click after its
  // own onTap; omitting it left suppression armed for the next toolbar click.
  el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))
})
/* a React-controlled text input needs the native value setter, or React's
   own change-detection swallows a same-string re-set — the same trick every
   other *.test.tsx in this app uses. */
const typeInto = async (el: Element, value: string) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
/* React delegates onBlur off the bubbling focusout event, not bare blur —
   DutyTplModal.test.tsx's own idiom. */
const focusOut = async (el: Element) => act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
/* jump the open calendar straight to the seeded demo week's month, rather
   than clicking ‹/› however many times it takes to get there from whatever
   month the seed-from-range effect landed on */
const goJul2026 = async () => act(async () => { setCalMonth({ y: 2026, m: 7 }); notify() })

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'inputs')!)
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('monthCells (pure)', () => {
  it('a full grid is a multiple of 7, and the month\'s own days sit inside it', () => {
    const cells = monthCells(2026, 7)
    expect(cells.length % 7).toBe(0)
    expect(cells.find(c => c != null)).toBe('2026-07-01')
    expect(cells).toContain('2026-07-31')
  })

  it('July 2026 opens on a Wednesday, so the grid carries exactly 2 leading blanks', () => {
    const cells = monthCells(2026, 7)
    expect(cells[0]).toBeNull()
    expect(cells[1]).toBeNull()
    expect(cells[2]).toBe('2026-07-01')
  })
})

describe('the Inputs page calendar toggle', () => {
  it('D582 groups Calendar with List after input category and retains opening/closing', async () => {
    expect($('#inCalBtn'), 'the toggle button exists').toBeTruthy()
    /* D582 supersedes the old full-width Calendar accent: input category first,
       then the compact presentation group. The same switch still works. */
    expect($('#inCalBtn')!.closest('.inputs-views'), 'presentation controls are grouped').toBeTruthy()
    expect($('#inListBtn')!.closest('.inputs-views')).toBe($('#inCalBtn')!.closest('.inputs-views'))
    /* the three tabs come first, the Calendar | List switch after them (D620, D626 — the tabs replaced the mode pair) */
    expect($('.inputs-tabs')!.compareDocumentPosition($('.inputs-views')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect($('#inpCal'), 'D580: calendar opens first inside Inputs').toBeTruthy()
    await click($('#inListBtn'))
    expect($('#inpCal'), 'secondary list is reachable').toBeFalsy()

    await click($('#inCalBtn'))
    expect($('#inpCal'), 'opens on a click').toBeTruthy()
    expect(INPVIEW).toBe('cal')

    /* the calendar's own "List" button went with the switch that now does its job (D626) */
    expect($('#icClose')).toBeFalsy()
    await click($('#inListBtn'))
    expect($('#inpCal'), 'the switch is the way to the List').toBeFalsy()
    expect(INPVIEW).toBe('table')
  })

  it('reopens on the seeded demo week once the calendar is stepped there', async () => {
    await click($('#inCalBtn'))
    await goJul2026()
    expect($('.ic-mon')!.textContent).toBe('July 2026')
    expect(CALMONTH).toEqual({ y: 2026, m: 7 })
  })

  /* the header buttons must repaint what they change — setCalMonth is a bare
     module-let write, so each button has to notify() itself. This clicks the
     REAL buttons, because the helper above (setCalMonth + notify by hand) is
     exactly how the missing notify slipped past the suite and had to be
     caught on the live view instead. */
  it('the ‹ › and Today buttons actually move the visible month', async () => {
    expect($('.ic-mon')!.textContent).toBe('July 2026')
    await click($('#icPrev'))
    expect($('.ic-mon')!.textContent).toBe('June 2026')
    await click($('#icNext'))
    await click($('#icNext'))
    expect($('.ic-mon')!.textContent).toBe('August 2026')
    /* a real clock sits under Today, so pin the shape rather than the name:
       whatever month it is, the title repaints to it and CALMONTH agrees */
    await click($('#icToday'))
    const now = new Date()
    expect(CALMONTH).toEqual({ y: now.getFullYear(), m: now.getMonth() + 1 })
    expect($('.ic-mon')!.textContent).toContain(String(now.getFullYear()))
    await goJul2026()                    // back where the chip tests expect
  })
})

describe('chips (seeded demo data)', () => {
  /* divot's OML (a medical leave, Jul 13, all day) — an unavailable type,
     so inputTone reads it red */
  /* RE-POINTED (step 5, 8 Oct 26 — D626): an input is a BAR across its days now, inside no one date, so the two colour
     tests find the record's own bar by its id */
  it('a leave/medical input is a red bar', () => {
    const rec: any = INPUTS.find((r: any) => r.type === 'OML' && r.date === 'Jul 13')
    expect(rec, 'the seeded OML of 13 Jul').toBeTruthy()
    expect($(`.ib-bar.red[data-iid="${rec.iid}"]`), 'its bar is red').toBeTruthy()
  })

  /* bane's Appointment (Jul 16, timed 17:00–18:30) — a Duty & other
     commitments type, amber */
  it('an activity/appointment input is an amber bar', () => {
    const rec: any = INPUTS.find((r: any) => r.type === 'Appointment' && r.date === 'Jul 16')
    expect(rec, 'the seeded Appointment of 16 Jul').toBeTruthy()
    expect($(`.ib-bar.amb[data-iid="${rec.iid}"]`), 'its bar is amber').toBeTruthy()
  })

  /* every day the seeded SANS records land on also carries two overlapping
     multi-day leave/medical spans (sufa's ATT C, Jul 13-17; pike's OD,
     Jul 15-17), so red always fills MAX_CHIPS before tone order ever reaches
     san. Filtering to the type itself is what a scheduler would actually do
     to see the SANS picture, and it is what isolates the tone here too. */
  /* RE-POINTED 8 Oct 26 (the Inputs / SANS job, step 4): the SANS tab is its own calendar now (ui/SansCal.tsx). The
     promise is the same one — a SANS record is seen on its date and read as SANS at a glance — kept by the controls
     that now do it: the date's F / O / A counts, and the man's own puck wearing the SANS edge in the opened day
     (D649, D651), where the first calendar drew a purple row. */
  it('a SANS Availability record is counted on its SANS date, and its man is listed as his puck with the SANS edge', async () => {
    await click($('#inSansMode'))
    await goJul2026()
    try {
      const cell = $('[data-icday="2026-07-13"]')!
      expect(cell.querySelector('[data-testid="sc-f-2026-07-13"]'), 'a SANS date shows its F, O and A counts').toBeTruthy()
      await tap(cell,10,10)
      expect($('[data-testid="win-sansday"] [data-testid^="sd-row-"] .puck.san'), 'each commitment is the man’s puck, SANS edge on it').toBeTruthy()
      await click($('[data-testid="win-sansday-x"]'))
    } finally {
      await click($('#inMemberMode'))
      await goJul2026()
    }
    await act(async () => { setInpEdit(null); notify() })
  })
})

describe('the 22 Aug 26 cell redesign — title, sections, side-by-side inputs', () => {
  it('a SANS chip reads its F/O/A letters, never the words', async () => {
    /* the seeded records carry sans flags (state/demoseed.ts) — find one on
       its cell and read the chip the calendar drew for it */
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && r.sans)
    expect(rec, 'a seeded SANS record exists').toBeTruthy()
    await click($('#inSansMode'))
    expect($('#inSansMode').getAttribute('aria-selected')).toBe('true')
    expect($('#sansCal'), 'the SANS tab is the SANS calendar').toBeTruthy()
    await goJul2026()
    const iso=unfmt(rec.date,rec.yr)
    await act(async()=>{setCalMonth({y:+iso.slice(0,4),m:+iso.slice(5,7)});notify()})
    await tap($(`[data-icday="${iso}"]`),10,10)
    try {
      const chip = host.querySelector(`[data-popiid="${rec.iid}"] [data-testid="sd-letters"]`)!
      expect(chip, `its line renders (${rec.iid}; ${$('[data-testid="win-sansday"]')?.textContent})`).toBeTruthy()
      expect(chip.textContent).not.toContain('SANS')
      expect(chip.textContent).not.toContain('Availability')
      expect(chip.textContent).toMatch(/^[FOA]( · [FOA])*$/)
      await click($('[data-testid="win-sansday-x"]'))
    } finally {
      await click($('#inMemberMode'))
      await goJul2026()
    }
  })

  /* the multi-select puck picker (owner, 23 Aug 26; reworked 24 Aug 26 — a
     category "just … fade those pucks so that I know which puck is applicable.
     Not select them", pucks grouped by seat like the palette). */
  it('+ Pucks opens the picker; a category FADES the rest without selecting; tapping pucks selects; OK adds them; right-click and ✕ remove', async () => {
    const iso = '2026-07-09'
    const cell = $(`[data-icday="${iso}"]`)!
    await tap(cell, 10, 10)
    expect($('[data-testid="win-inputsday"]')).toBeTruthy()

    await click($('#icAddPucks'))
    expect($('.ic-pick'), 'the picker opened instead of making an empty row').toBeTruthy()
    expect(PLANPUCKS.find((p: any) => p.kind === 'pucks' && p.date === iso), 'no row until OK').toBeFalsy()
    /* the roster is grouped by seat, the way the palette lays it out */
    expect($('.ic-pick-body .ic-pick-grp'), 'pucks are grouped by seat').toBeTruthy()
    let sec: any
    try {
      /* a category chip HIGHLIGHTS by fading the rest — it selects NOTHING */
      const catA = $('.ic-pick-cats [data-pickcat="A"]')!
      await click(catA)
      expect(catA.className, 'the chip reads on (highlight is live)').toContain('on')
      expect(host.querySelectorAll('.ic-pickp.on').length, 'highlighting never selects a puck').toBe(0)
      expect(host.querySelectorAll('.ic-pickp.dim').length, 'non-matching pucks faded').toBeGreaterThan(0)
      expect(host.querySelectorAll('.ic-pickp:not(.dim):not(.already)').length, 'matching pucks stay bright').toBeGreaterThan(0)
      /* a second chip in the SAME category is an ALTERNATIVE — it broadens, it
         never empties (owner, 24 Aug 26 — "CAT A and B"): A-or-D lights at
         least as many as A alone. Across categories it would narrow instead;
         that AND is pinned at the unit level in hlfold.test.tsx. */
      const brightA = host.querySelectorAll('.ic-pickp:not(.dim):not(.already)').length
      const catD = $('.ic-pick-cats [data-pickcat="D"]')!
      await click(catD)
      expect(host.querySelectorAll('.ic-pickp:not(.dim):not(.already)').length, 'A or D lights at least as many as A alone').toBeGreaterThanOrEqual(brightA)
      await click(catD)   // clear D, back to just A
      /* pick two people by hand — a tap selects, faded or not */
      const pickTwo = [...host.querySelectorAll('.ic-pickp:not(.already)')].slice(0, 2) as HTMLElement[]
      const pickedIds = pickTwo.map(b => b.getAttribute('data-pickp')!)
      for (const b of pickTwo) await click(b)
      expect(host.querySelectorAll('.ic-pickp.on').length).toBe(2)
      expect(($('#icPickOk') as HTMLButtonElement).textContent).toContain('2')
      /* OK creates ONE new pucks row carrying the two picks */
      await click($('#icPickOk'))
      expect($('.ic-pick'), 'the picker closed on OK').toBeFalsy()
      sec = PLANPUCKS.find((p: any) => p.kind === 'pucks' && p.date === iso)
      expect(sec, 'a pucks row was created').toBeTruthy()
      expect(sec.ids.length).toBe(2)
      expect(sec.ids, 'the hand-picked people are on it').toEqual(expect.arrayContaining(pickedIds))
      expect($(`[data-secpucks="${sec.id}"] .puck`), 'the row draws real pucks').toBeTruthy()
      /* the date's HEAD carries it now — a week is three layers, and the date itself holds nothing (step 5, D626) */
      expect($(`[data-ichead="${iso}"] .ic-pks .ic-pk`), 'the date carries the tiny chip').toBeTruthy()
      /* the per-puck ✕ is gone now (owner, 24 Aug 26 — removal is drag-off or
         right-click); no seated puck carries a delete button anymore */
      expect($(`[data-secpucks="${sec.id}"] [data-pkdel]`), 'no per-puck ✕').toBeFalsy()
      /* RIGHT-CLICK a seated puck removes it, leaving a GAP so the rest don't
         shift — the blanked slot stays in place */
      const chip = $(`[data-secpucks="${sec.id}"]`)!.querySelector('.ic-secpk:not(.ic-secpk-gap)') as HTMLElement
      await act(async () => { chip.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
      expect(sec.ids.filter(Boolean).length, 'right-click dropped one puck').toBe(1)
      expect(sec.ids[0], 'the removed slot is blanked, not closed').toBe('')
      expect($(`[data-secpucks="${sec.id}"] .ic-secpk-gap`), 'a gap cell holds the position').toBeTruthy()
    } finally {
      sec = PLANPUCKS.find((p: any) => p.kind === 'pucks' && p.date === iso)
      if (sec) await act(async () => { removePlanPuck(sec.id); notify() })
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
    }
  })

  /* the picker's within-group order and the SANS seat split (owner, 24 Aug 26 —
     "arrange sans into pilot then wso … arranged in the cat hierarchy order.
     Like FI then IR then IP etc for pilot"). */
  it('picker: SANS splits into Pilots then WSOs, and every group reads in CAT-ladder order (highest first)', async () => {
    const iso = '2026-07-09'
    const cell = $(`[data-icday="${iso}"]`)!
    await tap(cell, 10, 10)
    await click($('#icAddPucks'))
    expect($('.ic-pick'), 'the picker opened').toBeTruthy()
    try {
      const grp = (label: string) => $$('.ic-pick-body .ic-pick-grp')
        .find(g => (g.querySelector('.ic-pick-gh')?.firstChild?.textContent || '') === label)
      const idsIn = (label: string) => {
        const g = grp(label); expect(g, `group "${label}" present`).toBeTruthy()
        return [...g!.querySelectorAll('.ic-pickp')].map(b => b.getAttribute('data-pickp')!)
      }
      /* SANS is split, pilots before WSOs */
      const heads = $$('.ic-pick-body .ic-pick-gh').map(h => h.firstChild?.textContent || '')
      const iPil = heads.indexOf('SANS · Pilots'), iWso = heads.indexOf('SANS · WSOs')
      expect(iPil, 'SANS · Pilots header present').toBeGreaterThanOrEqual(0)
      expect(iWso, 'SANS · WSOs comes after SANS · Pilots').toBeGreaterThan(iPil)
      /* SANS pilots are all front-seat, SANS WSOs all not */
      expect(idsIn('SANS · Pilots').every(id => PEOPLE[id].seat === 'FCP'), 'SANS pilots are FCP').toBe(true)
      expect(idsIn('SANS · WSOs').every(id => PEOPLE[id].seat !== 'FCP'), 'SANS WSOs are not FCP').toBe(true)
      /* every seat group reads highest CAT first (QORDER non-increasing) */
      const ladderOK = (label: string) => {
        const ranks = idsIn(label).map(id => QORDER[PEOPLE[id].q] ?? -1)
        return ranks.every((r, i) => i === 0 || ranks[i - 1] >= r)
      }
      for (const label of ['Pilots', 'WSOs', 'SANS · Pilots', 'SANS · WSOs']) {
        expect(ladderOK(label), `${label} in CAT-ladder order`).toBe(true)
      }
    } finally {
      if ($('#icPickCancel')) await click($('#icPickCancel'))
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
    }
  })

  it('the popover orders sections above the inputs block, + Input leading it', async () => {
    const iso = '2026-07-13'
    await act(async () => { addPlanPuck(iso, 'note first'); notify() })
    const cell = $(`[data-icday="${iso}"]`)!
    await tap(cell, 10, 10)
    try {
      /* RE-POINTED (step 5, 8 Oct 26 — the day is a window on the shell, D641): "+ Input" is PINNED at the window's top
         with the day's title, and the list scrolls under it — the planning sections first, then the inputs */
      const list = $('[data-testid="idy-list"]')!
      const secs = list.querySelector('.ic-secs')!
      const inputs = list.querySelector('[data-testid="idy-count"], [data-testid="idy-empty"]')!
      expect(secs, 'sections render').toBeTruthy()
      expect(inputs, 'the inputs block renders').toBeTruthy()
      expect(secs.compareDocumentPosition(inputs) & Node.DOCUMENT_POSITION_FOLLOWING,
        'sections sit ABOVE the inputs').toBeTruthy()
      /* + Input is pinned above the list, never scrolled away with it */
      expect($('#icPopAdd')!.closest('.sd-top'), '+ Input is pinned').toBeTruthy()
      expect(list.contains($('#icPopAdd'))).toBe(false)
      /* the admin section buttons lead the list */
      expect(list.firstElementChild!.classList.contains('ic-secbtns')).toBe(true)
    } finally {
      const note: any = PLANPUCKS.find((p: any) => p.text === 'note first')
      await act(async () => { if (note) removePlanPuck(note.id); notify() })
      await click($('[data-testid="win-inputsday-x"]'))
    }
  })

  it('the day title renders in the popover head beside the date', async () => {
    const iso = '2026-07-10'
    const cell = $(`[data-icday="${iso}"]`)!
    await tap(cell, 10, 10)
    try {
      /* RE-POINTED (step 5): the window's own bar carries the date; the day's title is pinned right under it */
      const head = $('[data-testid="win-inputsday"] .sd-top')!
      expect(head.querySelector('#icRmkEdit'), 'the title input is pinned at the window’s top').toBeTruthy()
    } finally {
      await click($('[data-testid="win-inputsday-x"]'))
    }
  })
})

describe('member session — reduced controls, same reach to add and to open a chip', () => {
  it('no remark editor, no +Note, but +Add input and the chip-edit route both stay', async () => {
    const iso = '2026-07-13' // divot's OML lives here, among several other entries
    const rec: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment' && r.date === 'Jul 16')
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    try {
      /* the cell tap is the popover's front door — see the identity test above */
      const cell = $(`[data-icday="${iso}"]`)!
      await tap(cell, 10, 10)
      expect($('[data-testid="win-inputsday"]')).toBeTruthy()
      expect($('#icRmkEdit'), 'no title editor for a member').toBeFalsy()
      expect($('#icAddPuck'), 'no +Note for a member').toBeFalsy()
      expect($('#icAddPucks'), 'no +Pucks for a member').toBeFalsy()
      expect($('#icPopAdd'), '+Input stays available to everyone').toBeTruthy()
      await click($('[data-testid="win-inputsday-x"]'))

      /* the input is a BAR across its days now (step 5, D626), found by its own id */
      const chip = $(`.ib-bar[data-icdrag][data-iid="${rec.iid}"]`)!
      ;(document as any).elementsFromPoint = () => [chip, $('[data-icday="2026-07-16"]')]
      try { await tap(chip, 5, 5) } finally { delete (document as any).elementsFromPoint }
      expect(INPEDIT, 'a tap on a bar still opens the input for a member').toBe(rec)
      await act(async () => { setInpEdit(null); notify() })
    } finally {
      await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    }
  })
})

/* ONE LIFT, EVERY DRAG (owner, 6 Sep 26) — the day popover's two drags. Both
   picked-up things ARE one element, so the cyan box is plain CSS on a class:
   `.ic-sec.dragging`, which React itself writes, and `.ic-secpk.pk-drag`, which
   the puck drag adds by hand (nothing re-renders under it). jsdom paints no
   shadow, so the box is pinned as a CSS contract in lift-css.test.ts; what this
   file pins is the half CSS cannot see. The popover is REBUILT by the very write
   the drop makes, so the landing is deferred (lift.ts markLand/paintLand): the
   address is marked BEFORE the write, and the component's own dep-list-free
   layout effect paints it in the commit that rebuilt it. A drop that moves
   nothing marks nothing, and a popover closed mid-drag leaves no class and no
   mark behind for the next stray release to cash in. */
describe('one lift, every drag — the day popover (6 Sep 26)', () => {
  const origEFP = document.elementFromPoint
  afterEach(() => { document.elementFromPoint = origEFP; markLand(''); vi.useRealTimers() })
  /* both machines listen on WINDOW for the life of one press — the release that
     ends a drag never reaches the element it started on */
  const win = (type: string, x: number, y: number) => act(async () => { window.dispatchEvent(ptr(type, x, y)) })
  const openPop = async (iso: string) => {
    const cell = $(`[data-icday="${iso}"]`)!
    await tap(cell, 10, 10)
    expect($('[data-testid="win-inputsday"]'), `the ${iso} popover opened`).toBeTruthy()
  }
  const dayIds = (iso: string) => PLANPUCKS.filter((p: any) => p.date === iso).map((p: any) => p.id)
  const wipe = async (iso: string) => act(async () => {
    for (const id of dayIds(iso)) removePlanPuck(id)
    notify()
  })
  /* two seated pucks on a fresh row, straight through the store — the picker
     route is already pinned above and is not what is under test here */
  const seatTwo = async (iso: string) => {
    const [a, b] = Object.keys(PEOPLE)
    let rowId = ''
    await act(async () => {
      addPuckRow(iso)
      rowId = PLANPUCKS.find((p: any) => p.date === iso && p.kind === 'pucks')!.id
      addPuckPeople(rowId, [a, b])
      notify()
    })
    return { rowId, a, b }
  }

  it('a section drop marks where it landed, and the popover flashes it in the commit that rebuilt it', async () => {
    vi.useFakeTimers()
    const iso = '2026-07-23'
    // addPlanPuck UNSHIFTS, so the note added second leads the day's own run
    await act(async () => { addPlanPuck(iso, 'lift note one'); addPlanPuck(iso, 'lift note two'); notify() })
    const [top, below] = dayIds(iso)
    try {
      await openPop(iso)
      const order = () => $$('.ic-secs .ic-sec').map(e => e.dataset.sec!)
      expect(order(), 'the day opens in store order').toEqual([top, below])

      /* jsdom lays nothing out: the hit-test answers with the section the finger
         is over, and its 0-height rect leaves the half-rule on "before this one" */
      document.elementFromPoint = () => $(`[data-sec="${top}"]`)
      await act(async () => { $(`[data-sechandle="${below}"]`)!.dispatchEvent(ptr('pointerdown', 10, 60)) })
      expect($(`[data-sec="${below}"]`)!.className,
        'picked up: the recipe rides the class React writes, never an imperative one').toMatch(/\bdragging\b/)
      await win('pointermove', 10, 20)
      await win('pointerup', 10, 20)

      expect(order(), 'it landed above the section it was dropped on').toEqual([below, top])
      expect(pendingLand(), 'the mark names the section that moved, by its own address')
        .toEqual({ sel: `[data-sec="${below}"]`, climb: undefined })
      const landed = $(`[data-sec="${below}"]`)!
      expect(landed.className, 'the picked-up class is gone').not.toMatch(/\bdragging\b/)
      expect(landed.classList.contains('lift-land'), 'and the section flashes where it landed').toBe(true)
      await act(async () => { vi.advanceTimersByTime(LIFT_LAND_MS + 50) })
      expect(landed.classList.contains('lift-land'), 'the flash is over within its own beat').toBe(false)
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })

  it('a seated-puck swap flashes the SLOT the puck landed in, not the one it left', async () => {
    vi.useFakeTimers()
    const iso = '2026-07-28'
    const { rowId, a, b } = await seatTwo(iso)
    try {
      await openPop(iso)
      const slot = (i: number) => $(`[data-secpucks="${rowId}"] .ic-secpk[data-pkidx="${i}"]`)!
      document.elementFromPoint = () => slot(1)
      await act(async () => { slot(0).dispatchEvent(ptr('pointerdown', 10, 10)) })
      await win('pointermove', 30, 10)          // past the 6px that arms the drag
      expect(slot(0).className, 'the lifted chip wears the recipe on its own .pk-drag').toMatch(/\bpk-drag\b/)
      await win('pointerup', 30, 10)

      const row: any = PLANPUCKS.find((p: any) => p.id === rowId)
      expect(row.ids, 'the two swapped seats').toEqual([b, a])
      expect(slot(1).classList.contains('lift-land'), 'the landed slot flashes').toBe(true)
      expect(slot(0).classList.contains('lift-land'), 'the vacated slot does not').toBe(false)
      expect(host.querySelector('.pk-drag'), 'nothing is left picked up').toBeFalsy()
      await act(async () => { vi.advanceTimersByTime(LIFT_LAND_MS + 50) })
      expect(slot(1).classList.contains('lift-land')).toBe(false)
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })

  it('dragging a puck OFF the row is a removal, not a landing — it marks nothing', async () => {
    const iso = '2026-07-29'
    const { rowId, a } = await seatTwo(iso)
    try {
      await openPop(iso)
      markLand('')                               // start from an empty slot, so null MEANS null
      const slot = (i: number) => $(`[data-secpucks="${rowId}"] .ic-secpk[data-pkidx="${i}"]`)!
      document.elementFromPoint = () => document.body     // the finger has left the row
      await act(async () => { slot(0).dispatchEvent(ptr('pointerdown', 10, 10)) })
      await win('pointermove', 30, 90)
      await win('pointerup', 30, 90)

      const row: any = PLANPUCKS.find((p: any) => p.id === rowId)
      expect(row.ids.includes(a), 'the puck came off the row').toBe(false)
      expect(pendingLand(), 'a removal has no landing place to flash').toBeNull()
      expect(host.querySelector('.lift-land'), 'so nothing flashes').toBeFalsy()
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })

  /* A COMMITTED DROP WITH A TARGET FLASHES WHERE THE THING ENDED UP, MOVED OR
     NOT (ruling, 7 Sep 26, on the owner's own words — "once I drop the item it
     should flash to show where the new item ended up", and in place IS where it
     ended up). The Leave War grid already reads this way for a drop on a row's
     own grip. Only a cancel, or a release with no target under it, shows
     nothing. These three pin the "moved nothing" half, which is the half a
     review found unpinned. */
  it('a section dropped back where it already sat still flashes — in place', async () => {
    const iso = '2026-07-02'
    // three sections, so the drop below is a REAL no-op rather than a two-row swap
    await act(async () => {
      addPlanPuck(iso, 'in place three'); addPlanPuck(iso, 'in place two'); addPlanPuck(iso, 'in place one'); notify()
    })
    const before = dayIds(iso)
    const [one, two] = before
    try {
      await openPop(iso)
      markLand('')
      /* drop the first section on the SECOND's upper half — "before that one",
         which is exactly where it already is, so movePlanSection refuses it */
      document.elementFromPoint = () => $(`[data-sec="${two}"]`)
      await act(async () => { $(`[data-sechandle="${one}"]`)!.dispatchEvent(ptr('pointerdown', 10, 20)) })
      await win('pointermove', 10, 30)
      await win('pointerup', 10, 30)

      expect(dayIds(iso), 'the store refused a move that lands where it began').toEqual(before)
      expect($(`[data-sec="${one}"]`)!.classList.contains('lift-land'),
        'and it still flashes — in place is where it ended up').toBe(true)
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })

  it('a section dropped on its OWN row flashes in place, and leaves no mark to fire late', async () => {
    const iso = '2026-07-03'
    await act(async () => { addPlanPuck(iso, 'own row two'); addPlanPuck(iso, 'own row one'); notify() })
    const before = dayIds(iso)
    const [one] = before
    try {
      await openPop(iso)
      markLand('')
      document.elementFromPoint = () => $(`[data-sec="${one}"]`)
      await act(async () => { $(`[data-sechandle="${one}"]`)!.dispatchEvent(ptr('pointerdown', 10, 20)) })
      await win('pointermove', 10, 22)
      await win('pointerup', 10, 22)

      expect(dayIds(iso), 'nothing moved').toEqual(before)
      const el = $(`[data-sec="${one}"]`)!
      expect(el.className, 'the picked-up class is gone').not.toMatch(/\bdragging\b/)
      expect(el.classList.contains('lift-land'), 'a committed drop on itself flashes where it stands').toBe(true)
      /* and nothing outlives the drop: the very next unrelated render must not
         find a live mark and flash something late */
      await act(async () => { notify() })
      expect(pendingLand(), 'no mark survives into an unrelated render').toBeNull()
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })

  it('a seated puck released on its own slot flashes in place, and marks nothing at all', async () => {
    const iso = '2026-07-04'
    const { rowId, a, b } = await seatTwo(iso)
    try {
      await openPop(iso)
      markLand('')
      const slot = (i: number) => $(`[data-secpucks="${rowId}"] .ic-secpk[data-pkidx="${i}"]`)!
      document.elementFromPoint = () => slot(0)          // released back on the slot it came from
      await act(async () => { slot(0).dispatchEvent(ptr('pointerdown', 10, 10)) })
      await win('pointermove', 30, 10)
      await win('pointerup', 30, 10)

      expect((PLANPUCKS.find((p: any) => p.id === rowId) as any).ids, 'the seats are untouched').toEqual([a, b])
      expect(slot(0).classList.contains('lift-land'), 'it flashes where it stayed').toBe(true)
      /* nothing was written, so nothing rebuilds the row — the chip is right
         here and takes the flash on the spot, with no mark to defer */
      expect(pendingLand(), 'an in-place puck needs no deferred landing').toBeNull()
      expect(host.querySelector('.pk-drag'), 'nothing left picked up').toBeFalsy()
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })

  /* The popover closing mid-drag is the one path that ends a drag with the
     dragged element already unmounted (dragCancelRef, 24 Aug 26). It must end
     the LIFT as well as the listeners: nothing moves, nothing is marked, and the
     stray release that arrives afterwards has nothing left to fire. */
  it('a popover closed mid-drag cancels both drags, leaving no lift and no mark', async () => {
    const iso = '2026-07-30'
    await act(async () => { addPlanPuck(iso, 'cancel note one'); addPlanPuck(iso, 'cancel note two'); notify() })
    const { rowId, a, b } = await seatTwo(iso)
    const before = dayIds(iso)          // the two notes, then the pucks row
    const [top, below] = before
    try {
      // ---- a SECTION drag, interrupted
      await openPop(iso)
      markLand('')
      document.elementFromPoint = () => $(`[data-sec="${top}"]`)
      await act(async () => { $(`[data-sechandle="${below}"]`)!.dispatchEvent(ptr('pointerdown', 10, 60)) })
      await win('pointermove', 10, 20)
      await click($('[data-testid="win-inputsday-x"]'))
      await win('pointerup', 10, 20)             // the stray release the canceller disarmed
      expect(dayIds(iso), 'nothing moved').toEqual(before)
      expect(pendingLand(), 'nothing was marked').toBeNull()

      // ---- a SEATED PUCK drag, interrupted
      await openPop(iso)
      const chip = $(`[data-secpucks="${rowId}"] .ic-secpk[data-pkidx="0"]`)!
      document.elementFromPoint = () => $(`[data-secpucks="${rowId}"] .ic-secpk[data-pkidx="1"]`)
      await act(async () => { chip.dispatchEvent(ptr('pointerdown', 10, 10)) })
      await win('pointermove', 30, 10)
      expect(chip.className, 'it really was picked up').toMatch(/\bpk-drag\b/)
      await click($('[data-testid="win-inputsday-x"]'))
      await win('pointerup', 30, 10)
      expect(chip.className, 'the lift came off on the way out').not.toMatch(/\bpk-drag\b/)
      expect((PLANPUCKS.find((p: any) => p.id === rowId) as any).ids, 'the seats are untouched').toEqual([a, b])
      expect(pendingLand(), 'and nothing was marked').toBeNull()

      await openPop(iso)
      expect(host.querySelector('[data-testid="win-inputsday"] .lift, [data-testid="win-inputsday"] .lift-land'), 'the reopened popover carries neither class').toBeFalsy()
      expect(host.querySelector('[data-testid="win-inputsday"] .dragging'), 'nor a stuck picked-up section').toBeFalsy()
    } finally {
      if ($('[data-testid="win-inputsday-x"]')) await click($('[data-testid="win-inputsday-x"]'))
      await wipe(iso)
    }
  })
})

/* RE-POINTED (step 5, 8 Oct 26): the first calendar was a layer over the whole screen and its last Escape went "back
   to the list". It is the Inputs tab's own screen now — Escape closes what is open ON it and never leaves it (the plan
   §3.6: "Esc closes the front window, then clears a range"). */
describe('Esc layering: the opened day first, and the calendar stays', () => {
  it('the first Esc closes just the opened day; a second leaves the calendar where it is', async () => {
    const cell = $('[data-icday="2026-07-06"]')!
    await tap(cell, 10, 10)
    expect($('[data-testid="win-inputsday"]')).toBeTruthy()

    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('[data-testid="win-inputsday"]'), 'first Esc closes just the popover').toBeFalsy()
    expect($('#inpCal'), 'the calendar itself is still open').toBeTruthy()

    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('#inpCal'), 'a second Esc leaves the calendar up').toBeTruthy()
    expect(INPVIEW).toBe('cal')
  })
})
