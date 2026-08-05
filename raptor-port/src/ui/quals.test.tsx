// @vitest-environment jsdom
/* The Quals page — tfin's B24 (Scheduler appointment) and V (AAR invariant)
   page assertions, driven through the React table. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { PEOPLE, isScheduler, isInstr, deriveQuals, ID_BY_CS, QCHIP, QCOLOR, QORDER, LEVELNAME } from '../engine/people'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* heading labels: the sorted column carries an arrow and, in EDIT QUALS, a
   grip and a ✕ — the label element is the name on its own */
const heads = () => $$('#qtbl thead th').map(x => {
  const lbl = x.querySelector('.qlbl')
  return ((lbl || x).textContent || '').replace(/[▲▼]/g, '')
})
/* the callsign column, top to bottom — what a sort is judged by */
const col = (sel: string) => $$(`#qtbl tbody tr:not(.grp) ${sel}`).map(x => (x.textContent || '').trim())
const callsigns = () => col('td.qname')

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'quals')!)
})

describe('the Quals page (tfin)', () => {
  it('quals rows', () => {
    expect($$('#qtbl tbody tr').length).toBeGreaterThan(10)
  })

  it('the Quals table has a Scheduler column, with the appointments', () => {
    const hs = $$('#qtbl thead th').map(x => x.textContent)
    expect(hs).toContain('Scheduler')
    expect($('#qtbl thead th.apt')).toBeTruthy()
  })

  it('appointed people are ticked, and a tick matches isScheduler', () => {
    expect($$('#qtbl td.qcell.apt-on').length).toBeGreaterThan(0)
    expect($$('#qtbl td[data-q$="|sched"]')
      .every(td => td.classList.contains('apt-on') === isScheduler(td.dataset.q!.split('|')[0]))).toBe(true)
  })

  it('every row carries the cell', () => {
    expect($$('#qtbl td[data-q$="|sched"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
  })

  it('ticking the cell appoints them, unticking withdraws it', async () => {
    const td = $$('#qtbl td[data-q$="|sched"]').find(x => !x.classList.contains('apt-on'))!
    const id = td.dataset.q!.split('|')[0]
    await click($('#qEdit'))
    await click($(`#qtbl td[data-q="${id}|sched"]`))
    expect(isScheduler(id)).toBe(true)
    await click($(`#qtbl td[data-q="${id}|sched"]`))
    expect(isScheduler(id)).toBe(false)
  })

  it('NAAR cannot be ticked before DAAR, and removing DAAR removes NAAR', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !PEOPLE[i].archived && !PEOPLE[i].quals.daar && !PEOPLE[i].special)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|naar"]`))
    expect(PEOPLE[id].quals.naar).toBeFalsy()          // refused — DAAR first
    await click($(`#qtbl td[data-q="${id}|daar"]`))
    await click($(`#qtbl td[data-q="${id}|naar"]`))
    expect(PEOPLE[id].quals.naar).toBe(true)
    await click($(`#qtbl td[data-q="${id}|daar"]`))    // withdraw DAAR
    expect(PEOPLE[id].quals.daar).toBe(false)
    expect(PEOPLE[id].quals.naar).toBe(false)          // NAAR went with it
  })

  it('SC NIGHT needs SC DAY, exactly as NAAR needs DAAR', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !PEOPLE[i].archived && !PEOPLE[i].quals.scDay && !PEOPLE[i].special)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|scNight"]`))
    expect(PEOPLE[id].quals.scNight).toBeFalsy()
    await click($(`#qtbl td[data-q="${id}|scDay"]`))
    await click($(`#qtbl td[data-q="${id}|scNight"]`))
    expect(PEOPLE[id].quals.scNight).toBe(true)
    await click($(`#qtbl td[data-q="${id}|scDay"]`))
    expect(PEOPLE[id].quals.scNight).toBe(false)
    await click($('#qSave'))
  })

  it('a WSO\'s AAR cells are struck out, not un-ticked', async () => {
    await click($('#qViewW'))
    expect($$('#qtbl td.qcell.na').length).toBeGreaterThan(0)
    await click($('#qViewP'))
  })

  it('a member sees the table but no editing', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($$('#qtbl tbody tr').length).toBeGreaterThan(10)
    expect($('#qEdit')).toBeFalsy()
    expect($('#qEditQuals'), 'and no way to reshape the LoX either').toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})

/* CALLSIGN + INITIALS (owner, Aug 26). The callsign is the identity the whole
   app plans by — it is what every puck prints — so it heads the table and is
   the only field Add person requires; first/last name are gone. */
describe('the callsign / initials columns', () => {
  const setV = async (el: HTMLElement, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })

  it('the table heads with Callsign then Initials, and Name is gone', () => {
    /* the sorted heading carries an arrow inside it, so read the LABEL —
       this assertion is about which columns exist, not how they are sorted */
    const hs = heads()
    expect(hs[0]).toBe('Callsign')
    expect(hs[1]).toBe('Initials')
    expect(hs).not.toContain('Name')
    // every row carries the new cell, so the columns stay square
    expect($$('#qtbl tbody tr:not(.grp) td.qinitc').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
  })

  it('Add person takes callsign + initials + pilot/WSO + cat, with no name fields', async () => {
    expect($('#qLast')).toBeFalsy()
    expect($('#qFirst')).toBeFalsy()
    await setV($('#qCS') as HTMLElement, 'Tester')
    await setV($('#qInitials') as HTMLElement, 'tkl')
    await click($('#qAddPerson'))
    const id = Object.keys(PEOPLE).find(k => PEOPLE[k].cs === 'Tester')!
    expect(id, 'the person was added').toBeTruthy()
    expect(PEOPLE[id].initials).toBe('TKL')          // stored upper-case
    expect(PEOPLE[id].seat).toBe('FCP')
    expect(PEOPLE[id].q).toBe('OCU')
    // the callsign is what a puck would resolve — that identity still holds
    expect(ID_BY_CS['tester']).toBe(id)
    const row = $$('#qtbl tbody tr:not(.grp)').find(r => r.querySelector('.qname')!.textContent === 'Tester')!
    expect(row.querySelector('.qinitc')!.textContent).toBe('TKL')
    PEOPLE[id].archived = true; delete ID_BY_CS['tester']
    await act(async () => notify())
  })

  it('edit mode lets an existing person\'s initials be filled in', async () => {
    await click($('#qEdit'))
    const input = $('#qtbl input.qinit[data-init]') as HTMLInputElement
    expect(input, 'edit mode renders an initials input').toBeTruthy()
    const id = input.dataset.init!
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(input, 'ab'); input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(PEOPLE[id].initials).toBe('AB')
    PEOPLE[id].initials = ''
    await act(async () => notify())
  })
})

/* the callsign is editable in edit mode and the rename reaches the schedule —
   the pucks print the new name (owner, Aug 26) */
describe('editing a callsign', () => {
  const commit = async (el: HTMLInputElement, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true }))
  })

  it('renames the person and every puck follows; duplicates are refused', async () => {
    if (!$('#qtbl input.qcs')) await click($('#qEdit'))
    const box = $('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement
    expect(box, 'edit mode renders a callsign input').toBeTruthy()

    await commit(box, 'Banzai')
    expect(PEOPLE.bane.cs).toBe('Banzai')
    expect(ID_BY_CS['banzai']).toBe('bane')
    expect(ID_BY_CS['bane']).toBeUndefined()

    // the schedule follows: a puck for that person now prints the new name
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    const puck = $('#vWeek .puck[data-person="bane"] .nm')
    expect(puck, 'bane still holds a seat').toBeTruthy()
    expect(puck.textContent).toBe('Banzai')

    // and a duplicate is refused, leaving the name as it was.
    // NB: leaving the page unmounts QualsPage, so edit mode has to be re-armed
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'quals')!)
    if (!$('#qtbl input.qcs')) await click($('#qEdit'))
    const box2 = $('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement
    await commit(box2, 'Snap')
    expect(PEOPLE.bane.cs).toBe('Banzai')

    await commit($('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement, 'Bane')
    expect(PEOPLE.bane.cs).toBe('Bane')
  })
})

/* ---- the CAT column (owner, Aug 5; ladder reworked Aug 5 '26) -----------
   "Level" is called CAT; CI, the generic I tier and the IP tick column have
   all left; instructor-ness lives in CAT itself as IW / IP / IR / FI. */
describe('the CAT column', () => {
  it('the heading says CAT, not Level', () => {
    const heads = $$('#qtbl thead th').map(th => th.textContent!.trim())
    expect(heads).toContain('CAT')
    expect(heads).not.toContain('Level')
  })

  it('CI and the generic I are off the ladder everywhere', () => {
    for (const map of [QCHIP, QCOLOR, QORDER, LEVELNAME]) {
      expect(Object.keys(map), 'CI is gone from the qual tables').not.toContain('CI')
      expect(Object.keys(map), 'the generic I is gone from the qual tables').not.toContain('I')
      for (const k of ['IW', 'IP', 'IR', 'FI']) expect(Object.keys(map)).toContain(k)
    }
    /* nobody is left holding the retired tiers, and the ip flag itself is gone */
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].q === 'CI' || PEOPLE[id].q === 'I')).toEqual([])
    expect(Object.keys(PEOPLE).filter(id => 'ip' in PEOPLE[id])).toEqual([])
  })

  it('the CAT dropdown is seat-filtered: no IW for a pilot, no IP/IR for a WSO', async () => {
    /* the table opens on the pilots; the first row dropdown belongs to an FCP */
    if (!$('#qtbl select.qlvlsel')) await click($('#qEdit'))
    let opts = [...$$('#qtbl select.qlvlsel')[0].querySelectorAll('option')].map(o => o.textContent)
    expect(opts).toEqual(['OCU', 'D', 'C', 'B', 'A', 'IP', 'IR', 'FI'])
    await click($('#qViewW'))
    opts = [...$$('#qtbl select.qlvlsel')[0].querySelectorAll('option')].map(o => o.textContent)
    expect(opts).toEqual(['OCU', 'D', 'C', 'B', 'A', 'IW', 'FI'])
    await click($('#qViewP'))
  })

  /* the migration (owner, Aug 5 '26): every I-or-ip holder moved into the
     instructor CATs — FCP → IP, RCP → IW; Dice keeps IR under its new
     meaning (instrument rating examiner); Bane dropped his A for IP */
  it('the instructors were migrated into the CATs', () => {
    for (const id of ['mamba', 'shaft', 'chaps', 'boosh', 'beams', 'split', 'stiff', 'bane']) {
      expect(PEOPLE[id].q, id).toBe('IP')
      expect(isInstr(PEOPLE[id].q), id + ' still reads as an instructor').toBe(true)
      expect(PEOPLE[id].ip, id + ' has no ip flag left').toBeUndefined()
    }
    for (const id of ['freak', 'wolf', 'dirty', 'stuff', 'glass', 'drill', 'nasty'])
      expect(PEOPLE[id].q, id).toBe('IW')
    expect(PEOPLE.dice.q).toBe('IR')
    expect(isInstr('IR')).toBe(true)
  })

  it('CAT A, CAT B and IP tick columns are gone; nothing derives instr', () => {
    const heads = $$('#qtbl thead th').map(th => th.textContent!.trim())
    expect(heads).not.toContain('CAT A')
    expect(heads).not.toContain('CAT B')
    expect(heads, 'the IP tick went when IP became a CAT').not.toContain('IP')
    /* and the engine no longer derives any of the three it no longer shows */
    const bane = { ...PEOPLE.bane, quals: undefined }
    deriveQuals(bane)
    expect(bane.quals.catA).toBeUndefined()
    expect(bane.quals.catB).toBeUndefined()
    expect(bane.quals.instr).toBeUndefined()
  })
})

/* ---- the columns themselves (owner, 5 Aug 26) ---------------------------
   a fixed left-to-right arrangement, Downchit dropped, TF added. */
describe('the qualification columns', () => {
  const QCOLS = ['SANS', 'SXO', 'Scheduler', 'SC DAY', 'SC NIGHT', 'DAAR', 'NAAR', 'NVG', 'IMC', 'TF']

  it('run SANS → TF in the owner\'s order, between CAT and Remarks', () => {
    const hs = heads()
    expect(hs.slice(hs.indexOf('CAT') + 1, hs.indexOf('Remarks'))).toEqual(QCOLS)
  })

  it('Downchit is gone from the table and from the derived quals', () => {
    expect(heads()).not.toContain('Downchit')
    expect($$('#qtbl td[data-q$="|dnif"]')).toEqual([])
    const p = { ...PEOPLE.bane, quals: undefined }
    deriveQuals(p)
    expect(p.quals.dnif, 'a downchit is an INPUT with dates, not a permanent tick').toBeUndefined()
  })

  it('TF is a real column that starts held by nobody', () => {
    expect($$('#qtbl td[data-q$="|tf"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].quals && PEOPLE[id].quals.tf)).toEqual([])
    expect($$('#qtbl td[data-q$="|tf"] .qchk')).toEqual([])
  })

  it('and TF ticks and unticks like any other qualification', async () => {
    await click($('#qEdit'))
    await click($('#qtbl td[data-q="bane|tf"]'))
    expect(PEOPLE.bane.quals.tf).toBe(true)
    expect($('#qtbl td[data-q="bane|tf"] .qchk')).toBeTruthy()
    await click($('#qtbl td[data-q="bane|tf"]'))
    expect(PEOPLE.bane.quals.tf).toBe(false)
    await click($('#qSave'))
  })
})

/* ---- sorting by heading (owner, 5 Aug 26) -------------------------------
   the Sort chips are gone: a click on a heading sorts by it, a second click
   inverts. CAT sorts by seniority and a qual column by who holds it. */
describe('sorting by clicking a heading', () => {
  const th = (k: string) => $(`#qtbl thead th[data-sort="${k}"]`)
  /* the same comparison the page sorts with, so the expectation is not
     testing localeCompare's opinion against the code's */
  const alpha = (list: string[]) => [...list].sort((a, b) => {
    const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0
  })
  const catOf = (cs: string) => QORDER[PEOPLE[ID_BY_CS[cs.toLowerCase()]].q]

  beforeAll(async () => {
    if ($('#qtbl').classList.contains('editing')) await click($('#qSave'))
    await click($('#qViewP'))
  })

  it('the Sort chips are gone, and View carries the three seat choices', () => {
    expect($$('.qbar .lab').map(x => x.textContent)).toContain('View')
    expect($$('.qbar .lab').map(x => x.textContent)).not.toContain('Sort')
    expect($$('.qbar .fchip').map(x => x.textContent)).toEqual(['Pilots', 'WSOs', 'All'])
    for (const k of ['cs', 'initials', 'flight', 'cat', 'tf']) expect(th(k), k).toBeTruthy()
  })

  it('opens on callsign, ascending', () => {
    expect(callsigns()).toEqual(alpha(callsigns()))
    expect(th('cs').getAttribute('aria-sort')).toBe('ascending')
    expect(th('cs').className).toContain('on')
  })

  it('a second click inverts it, a third puts it back', async () => {
    await click(th('cs'))
    expect(th('cs').getAttribute('aria-sort')).toBe('descending')
    expect(callsigns()).toEqual(alpha(callsigns()).reverse())
    await click(th('cs'))
    expect(th('cs').getAttribute('aria-sort')).toBe('ascending')
    expect(callsigns()).toEqual(alpha(callsigns()))
  })

  it('initials sort alphabetically, with the blanks at the bottom', async () => {
    await click(th('initials'))
    const inits = col('td.qinitc')
    const filled = inits.filter(x => x)
    expect(filled).toEqual(alpha(filled))
    expect(inits.slice(0, filled.length), 'no blank interrupts the filled ones').toEqual(filled)
    expect(th('initials').className).toContain('on')
    expect(th('cs').className, 'only one column sorts at a time').not.toContain('on')
  })

  /* the roster arrived with every Flight blank, so the grouping is proved on
     flights typed in through edit mode — which is also the only way the
     squadron will ever get them in (owner, 5 Aug 26) */
  it('flight is editable in edit mode, and the grouping follows what is typed', async () => {
    await click($('#qEdit'))
    const box = $('#qtbl input.qflt[data-flt="bane"]') as HTMLInputElement
    expect(box, 'the Flight cell is a field in edit mode').toBeTruthy()
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      set.call(box, 'b flt'); box.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(PEOPLE.bane.flight, 'upper-cased so it groups with any other B FLT').toBe('B FLT')
    for (const [id, f] of [['snap', 'B FLT'], ['dice', 'A FLT'], ['chaps', 'A FLT']] as const) {
      const b = $(`#qtbl input.qflt[data-flt="${id}"]`) as HTMLInputElement
      await act(async () => {
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
        set.call(b, f); b.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }
    await click($('#qSave'))
    await click(th('flight'))
    const fl = col('td.qfltc')
    const named = fl.filter(x => x)
    expect(named, 'the two A FLT sit together, then the two B FLT').toEqual(['A FLT', 'A FLT', 'B FLT', 'B FLT'])
    /* the blanks stay in one block of their own rather than splitting them */
    expect(fl.slice(0, named.length)).toEqual(named)
  })

  it('flight groups each flight together, pointed either way', async () => {
    /* the test above left it sorted by flight, so point it back at ascending
       rather than assuming which way a click leaves it */
    if (th('flight').getAttribute('aria-sort') !== 'ascending') await click(th('flight'))
    /* every flight appears in exactly ONE run of rows — that is what
       "grouped" means, and it is stronger than checking the order */
    const runsOf = () => { const fl = col('td.qfltc'); return fl.filter((f, i) => f !== fl[i - 1]) }
    const up = runsOf()
    expect(up.length, 'no flight is split across two blocks').toBe(new Set(up).size)
    const named = up.filter(x => x)
    expect(named).toEqual(alpha(named))
    expect(up[up.length - 1], 'the people with no flight yet sit at the bottom').toBe('')
    /* inverting keeps the blocks whole; it only turns them round */
    await click(th('flight'))
    const down = runsOf()
    expect(down.length).toBe(new Set(down).size)
    expect(down.filter(x => x)).toEqual(alpha(named).reverse())
    expect(down[0], 'and the blanks come to the top instead').toBe('')
    await click(th('cs'))
  })

  it('CAT sorts by seniority, most senior first, and inverts', async () => {
    await click(th('cat'))
    const down = callsigns().map(catOf)
    expect(down, 'FI at the top, OCU at the bottom').toEqual([...down].sort((a, b) => b - a))
    await click(th('cat'))
    const up = callsigns().map(catOf)
    expect(up).toEqual([...up].sort((a, b) => a - b))
  })

  it('a qualification column brings the qualified to the top', async () => {
    await click(th('scDay'))
    const held = $$('#qtbl tbody tr:not(.grp) td[data-q$="|scDay"]').map(td => !!td.querySelector('.qchk'))
    expect(held.indexOf(false) === -1 || held.lastIndexOf(true) < held.indexOf(false),
      'no unqualified row sits above a qualified one').toBe(true)
    /* and the inversion puts the unqualified on top instead */
    await click(th('scDay'))
    const flipped = $$('#qtbl tbody tr:not(.grp) td[data-q$="|scDay"]').map(td => !!td.querySelector('.qchk'))
    expect(flipped.indexOf(true) === -1 || flipped.lastIndexOf(false) < flipped.indexOf(true)).toBe(true)
    await click(th('cs'))
  })

  it('a WSO with no AAR at all sorts with the unqualified, not above them', async () => {
    await click($('#qViewW'))
    await click(th('daar'))
    /* every WSO row is struck out in BOTH AAR columns, so the sort has
       nothing to lift: the block stays whole rather than the dashes being
       thrown to the top as if they were ticks */
    const rows = $$('#qtbl tbody tr:not(.grp)').length
    expect($$('#qtbl tbody tr:not(.grp) td.qcell.na').length).toBe(rows * 2)
    expect(callsigns().length).toBe(rows)
    await click($('#qViewP')); await click(th('cs'))
  })
})

/* ---- View: Pilots / WSOs / All (owner, 5 Aug 26) ------------------------- */
describe('the View chips', () => {
  it('All shows the pilots and the WSOs together', async () => {
    await click($('#qViewP')); const pilots = callsigns().length
    await click($('#qViewW')); const wsos = callsigns().length
    await click($('#qViewA'))
    expect(callsigns().length).toBe(pilots + wsos)
    expect(callsigns()).toContain('Bane')      // a pilot
    expect(callsigns()).toContain('Freak')     // a WSO
    expect($('#qtbl tbody tr.grp').textContent).toContain('Assigned aircrew')
    expect($('#qViewA').className).toContain('on')
  })

  it('and the seat views still show only their own seat', async () => {
    await click($('#qViewP'))
    expect(callsigns()).not.toContain('Freak')
    expect($('#qtbl tbody tr.grp').textContent).toContain('Assigned pilots')
    await click($('#qViewW'))
    expect(callsigns()).not.toContain('Bane')
    expect($('#qtbl tbody tr.grp').textContent).toContain('Assigned WSOs')
    await click($('#qViewP'))
  })
})

/* ---- EDIT QUALS (owner, 5 Aug 26) ---------------------------------------
   a second mode inside edit mode, admin only: add a qualification, remove
   one, drag a heading to move it. */
describe('Edit quals', () => {
  /* pointer events, as a mouse or a finger sends them. jsdom has no
     PointerEvent constructor and no layout, so they are dispatched as mouse
     events with the pointer type names — which is exactly what the delegated
     listeners bind to, so the machine under test is the real one. */
  const pointer = async (type: string, el: Element | Document) =>
    act(async () => { el.dispatchEvent(new MouseEvent(type, { bubbles: true })) })
  const dragCol = async (from: string, to: string) => {
    await pointer('pointerdown', $(`#qtbl thead th[data-col="${from}"]`))
    await pointer('pointermove', $(`#qtbl thead th[data-col="${to}"]`))
    await pointer('pointerup', document)
  }
  const qualCols = () => $$('#qtbl thead th[data-col]').map(t => t.dataset.col)
  const on = async () => {
    if (!$('#qEditQuals')) await click($('#qEdit'))
    if ($('#qEditQuals').getAttribute('aria-pressed') !== 'true') await click($('#qEditQuals'))
  }

  beforeAll(async () => { await click($('#qViewP')) })

  it('the button only exists under Enable editing, and only for an admin', async () => {
    if ($('#qEditQuals')) await click($('#qSave'))
    expect($('#qEditQuals'), 'not before editing is enabled').toBeFalsy()
    await click($('#qEdit'))
    expect($('#qEditQuals')).toBeTruthy()
    expect($('#qEditQuals').getAttribute('aria-pressed'), 'off until it is pressed').toBe('false')
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($('#qEditQuals'), 'a member never sees it').toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('turning it on hands the headings over: they move and delete, not sort', async () => {
    await on()
    expect($('#qtbl').className).toContain('qediting')
    expect(qualCols().length, 'every qualification column is a handle').toBe(10)
    expect($$('#qtbl thead th[data-col] .qdel').length).toBe(10)
    /* the sort attribute is GONE from them, so a drag can never land as a
       click that re-sorts the table under the hand doing the dragging */
    expect($('#qtbl thead th[data-sort="tf"]')).toBeFalsy()
    const before = callsigns()
    await click($('#qtbl thead th[data-col="tf"]'))
    expect(callsigns(), 'clicking a heading does not sort in this mode').toEqual(before)
    /* the identity columns are not part of the arrangement and stay sortable */
    expect($('#qtbl thead th[data-sort="cs"]')).toBeTruthy()
    expect($('#qtbl thead th[data-col="cs"]')).toBeFalsy()
  })

  it('adds a qualification, held by nobody until it is ticked', async () => {
    await on()
    await act(async () => {
      const box = $('#qNewQual') as HTMLInputElement
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      set.call(box, 'low level'); box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#qAddQualBtn'))
    expect(qualCols()).toContain('lowlevel')
    expect(heads(), 'named as it was typed, in the table\'s own case').toContain('LOW LEVEL')
    expect($$('#qtbl td[data-q$="|lowlevel"] .qchk'), 'nobody holds it yet').toEqual([])
    expect($$('#qtbl td[data-q$="|lowlevel"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
    /* and it behaves like any other column once it exists */
    await click($('#qtbl td[data-q="bane|lowlevel"]'))
    expect(PEOPLE.bane.quals.lowlevel).toBe(true)
  })

  it('refuses a duplicate and a nameless qualification', async () => {
    await on()
    const set = async (v: string) => act(async () => {
      const box = $('#qNewQual') as HTMLInputElement
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      s.call(box, v); box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const was = qualCols().length
    await set('LOW LEVEL'); await click($('#qAddQualBtn'))
    await set('   '); await click($('#qAddQualBtn'))
    await set('!!'); await click($('#qAddQualBtn'))
    expect(qualCols().length).toBe(was)
  })

  it('removes a column the rules do not read, and keeps who held it', async () => {
    await on()
    expect(PEOPLE.bane.quals.lowlevel).toBe(true)
    await click($('#qtbl thead th[data-col="lowlevel"] .qdel'))
    expect(qualCols(), 'one press is enough — no rule reads it').not.toContain('lowlevel')
    expect(PEOPLE.bane.quals.lowlevel, 'the record itself is untouched').toBe(true)
    /* adding it back brings the ticks with it */
    await act(async () => {
      const box = $('#qNewQual') as HTMLInputElement
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      s.call(box, 'LOW LEVEL'); box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#qAddQualBtn'))
    expect($('#qtbl td[data-q="bane|lowlevel"] .qchk'), 'Bane still holds it').toBeTruthy()
    await click($('#qtbl thead th[data-col="lowlevel"] .qdel'))
  })

  it('arms first on a column the rules DO read, then removes it', async () => {
    await on()
    const held = Object.keys(PEOPLE).filter(id => PEOPLE[id].quals && PEOPLE[id].quals.scDay).length
    expect(held).toBeGreaterThan(0)
    await click($('#qtbl thead th[data-col="scDay"] .qdel'))
    expect(qualCols(), 'the first press only asks').toContain('scDay')
    expect($('#qtbl thead th[data-col="scDay"]').className).toContain('arm')
    expect($('#qtbl thead th[data-col="scDay"] .qdel').textContent).toBe('remove?')
    await click($('#qtbl thead th[data-col="scDay"] .qdel'))
    expect(qualCols(), 'the second press removes it').not.toContain('scDay')
    /* the rule that reads it still sees everyone who held it */
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].quals && PEOPLE[id].quals.scDay).length).toBe(held)
  })

  it('removing the column the table is sorted by falls back to callsign', async () => {
    await click($('#qSave'))                       // sorting needs the reading mode
    await click($('#qtbl thead th[data-sort="nvg"]'))
    expect($('#qtbl thead th[data-sort="nvg"]').getAttribute('aria-sort')).toBe('ascending')
    await on()
    await click($('#qtbl thead th[data-col="nvg"] .qdel'))
    await click($('#qSave'))
    expect($('#qtbl thead th[data-sort="cs"]').getAttribute('aria-sort'),
      'the arrow goes back somewhere it can sit').toBe('ascending')
    expect(callsigns()).toEqual([...callsigns()].sort((a, b) => {
      const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0
    }))
    await on()
  })

  it('drags a heading to move its column', async () => {
    await on()
    const before = qualCols()
    expect(before[0]).toBe('san')
    await dragCol('tf', 'san')                       // last one to the front
    expect(qualCols()[0]).toBe('tf')
    expect(qualCols().length, 'moved, not copied').toBe(before.length)
    expect(new Set(qualCols()).size).toBe(before.length)
    await dragCol('tf', 'imc')                       // and back to the end
    expect(qualCols()[qualCols().length - 1]).toBe('tf')
    /* a drag that ends on its own column changes nothing */
    const same = qualCols()
    await dragCol('tf', 'tf')
    expect(qualCols()).toEqual(same)
  })

  it('the cells follow their heading, so no column shows another one\'s ticks', async () => {
    await on()
    await dragCol('sched', 'san')
    const order = qualCols()
    const row = $$(`#qtbl tbody tr:not(.grp)`)[0]
    expect([...row.querySelectorAll('td[data-q]')].map(td => (td as HTMLElement).dataset.q!.split('|')[1]))
      .toEqual(order)
  })

  it('Save changes puts the table back to reading, and the mode with it', async () => {
    await on()
    await click($('#qSave'))
    expect($('#qtbl').className).not.toContain('qediting')
    expect($('#qEditQuals'), 'the button goes with edit mode').toBeFalsy()
    expect($('#qtbl thead th[data-sort="tf"]'), 'the headings sort again').toBeTruthy()
    expect($$('#qtbl .qdel')).toEqual([])
  })
})
