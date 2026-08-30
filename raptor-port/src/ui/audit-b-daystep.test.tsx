// @vitest-environment jsdom
/* AUDIT B (12 Aug 26, overnight adversarial pass) — day-step edge coverage the
   existing boardnav/boardbackground suites do not pin. Everything in THIS file
   asserts behaviour that is either contractually required or documented as
   deliberate; the reproductions of suspected faults live in
   audit-b-bugs.test.tsx so a red test there cannot hide a regression here. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeSlot, resetSession, subscribe, subscribeBoard, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { WARN } from '../engine/validate'
import { slotVal } from '../engine/slots'
import * as view from '../state/view'
import { openScheduler, closeScheduler, toggleWide, SBWIDE, boardTab, boardDayStep, askSortAll, cancelSortAll, askCx, cxCommit, SORTALL, CXT } from './board'
import { ELOG } from '../engine/editlog'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

/* the scrub harness from boardnav.test.tsx: jsdom rects are all 0x0, so each
   dot is stubbed onto its own 20px slot before every move */
const layOutDots = () => {
  $$('#sbDays [data-sbtab]').forEach((d, i) => {
    (d as any).getBoundingClientRect = () => ({ left: i * 20, width: 20, right: i * 20 + 20, top: 40, bottom: 60, height: 20, x: i * 20, y: 40 })
  })
}
const scrub = async (...xs: number[]) => {
  const dots = $('#sbDays')
  await act(async () => {
    dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: xs[0], clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 1 } as any))
  })
  for (const x of xs.slice(1)) {
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
    })
  }
  await act(async () => {
    dots.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: xs[xs.length - 1], clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
  })
}

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { view.setPage('editsched'); notify() })
})

beforeEach(async () => {
  if (SBWIDE) { await act(async () => { toggleWide(); notify() }) }
  // continuous arrows can load an adjacent week — reset to the seed so the
  // DAYS[]/allhands assertions below start on the week they assume
  if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') })
  await act(async () => { view.setPage('editsched'); openScheduler(2); notify() })
})

afterEach(async () => {
  /* put stray dialog state down so one test's leftovers cannot leak */
  await act(async () => { cancelSortAll(); if (CXT) { (await import('./board')).setCxt(null) } notify() })
})

/* SCENARIO 1 (spam): the next-day arrow hammered past the end of the week now
   FLOWS into the following weeks instead of clamping (owner, 22 Aug 26). Ten
   forward clicks from Friday of the seed week land two weeks on, and the arrow
   is never disabled; every panel still agrees on the day it settles. */
describe('arrow spamming rolls continuously through the weeks', () => {
  it('ten rapid next-day clicks from Friday land two weeks on, Monday, with every panel agreeing', async () => {
    await act(async () => { openScheduler(4); notify() })       // Friday, seed week
    for (let i = 0; i < 10; i++) await act(async () => { $('#sbNextDay').click() })
    /* 4→5→6→[wk+1]0→1→2→3→4→5→6→[wk+2]0 : two boundary crossings, settling on Monday */
    expect(view.SBDAY).toBe(0)
    expect(CURWEEK, 'two weeks past the seed').toBe('27/07/2026')
    expect(($('#sbNextDay') as HTMLButtonElement).disabled, 'never disabled at an end now').toBe(false)
    /* every surface on the board must agree on the settled day — the bar, the
       on-dot, the checks header and the inputs header */
    expect($('#sbDay').textContent).toBe(DAYS[0].dow)
    const on = $$('#sbDays [data-sbtab]').filter(d => d.classList.contains('on'))
    expect(on.length).toBe(1)
    expect(on[0].dataset.sbtab).toBe('0')
    expect($('#sbWarn').textContent).toContain(`for ${DAYS[0].dow}`)
    // restore the seed week AND drain effects so the week-crossing churn does
    // not leak deferred renders into a later test's act()
    await act(async () => { loadWeek('13/07/2026') })
    await act(async () => {})
  })

  it('and ten previous-day clicks roll back the same way', async () => {
    await act(async () => { openScheduler(2); notify() })       // Wednesday, seed week
    for (let i = 0; i < 10; i++) await act(async () => { $('#sbPrevDay').click() })
    /* 2→1→0→[wk-1]6→5→4→3→2→1→0→[wk-2]6 : settling on Sunday two weeks back */
    expect(view.SBDAY).toBe(6)
    expect(CURWEEK, 'two weeks before the seed').toBe('29/06/2026')
    expect(($('#sbPrevDay') as HTMLButtonElement).disabled).toBe(false)
    expect($('#sbDay').textContent).toBe(DAYS[6].dow)
    await act(async () => { loadWeek('13/07/2026') })
    await act(async () => {})
  })
})

/* SCENARIO 3: a puck armed for planting must not carry across a day step —
   setBoardDay's cross-day disarm, driven through the arrow for the first time */
describe('an armed slot is put down by a day step', () => {
  it('stepping to the next day disarms, and a palette pick then plants nothing', async () => {
    const before3 = slotVal('d:3.0.0')
    await act(async () => { view.armSlot('d:2.0.0'); notify() })
    expect(view.ARM, 'the slot armed on Wednesday').toBeTruthy()
    expect(view.ARM.di).toBe(2)
    await act(async () => { $('#sbNextDay').click() })
    expect(view.SBDAY).toBe(3)
    expect(view.ARM, 'the arm did not follow the step onto Thursday').toBe(null)
    /* the reference behaviour placeArmed pins: with nothing armed a palette
       tap is refused outright, so nothing can land on the wrong day */
    let planted: any
    await act(async () => { planted = view.placeArmed('casper') })
    expect(planted).toBe(false)
    expect(slotVal('d:3.0.0'), 'Thursday’s seat untouched').toBe(before3)
  })

  it('a scrub that passes through other days and returns does not resurrect the arm', async () => {
    await act(async () => { view.armSlot('d:2.0.0'); notify() })
    layOutDots()
    await scrub(50, 90, 110, 50)          // 2 → 4 → 5 → back to 2
    expect(view.SBDAY).toBe(2)
    expect(view.ARM, 'disarmed at the first day change and stays down').toBe(null)
  })
})

/* SCENARIO 5: boardTab is view-only — no validate, board lane once, global
   lane never — but a REAL mutation right after a step must wake both lanes
   and both surfaces must show the stepped-to day */
describe('boardTab is view-only, and the first real mutation repaints everything', () => {
  it('a step neither validates nor touches the global lane', async () => {
    const warnRef = WARN.byDay
    let g = 0, b = 0
    const offG = subscribe(() => { g++ })
    const offB = subscribeBoard(() => { b++ })
    await act(async () => { $('#sbNextDay').click() })
    offG(); offB()
    expect(g, 'global lane silent').toBe(0)
    expect(b, 'board lane fired once').toBe(1)
    expect(WARN.byDay, 'no validate ran — the engine cost is the reason the lane exists').toBe(warnRef)
  })

  it('a slot write straight after a step repaints week AND board, both on the new day', async () => {
    await act(async () => { $('#sbNextDay').click() })       // 2 → 3
    const weekHTML = $('#eWeek')!.innerHTML
    let g = 0
    const offG = subscribe(() => { g++ })
    const was = slotVal('d:3.0.0')
    await act(async () => { writeSlot('d:3.0.0', was === 'casper' ? 'bane' : 'casper') })
    offG()
    expect(g, 'a mutation flows through the global lane').toBeGreaterThan(0)
    expect(WARN.byDay, 'and validated').not.toBe(undefined)
    expect($('#eWeek')!.innerHTML, 'the hidden week repainted with the write').not.toBe(weekHTML)
    expect($('#sbDay').textContent, 'the board panels repainted on the stepped-to day').toBe(DAYS[3].dow)
    await act(async () => { writeSlot('d:3.0.0', was) })      // put it back
  })
})

/* SCENARIO 8 (owner adversarial pass, 30 Aug 26): the display fold means a
   stored compact '0900' now READS '09:00' in the box. Stepping the day with a
   merely-focused, untouched legacy box must not become a phantom edit — boardTab
   compares the field to the model's DISPLAY, so an untouched legacy value
   neither rewrites the model nor logs a History row, while a real typed value
   still commits on the way out. */
describe('a day step past an untouched legacy compact time box logs nothing', () => {
  it('stepping away from a focused-but-untouched 0900 box mints no model write and no History row', async () => {
    await act(async () => { openScheduler(0); notify() })
    const f: any = DAYS[0].waves[0].formations[0]
    expect(f, 'day 0 wave 1 carries a flying line').toBeTruthy()
    const keep = f.to
    f.to = '0900'                                   // as an old save (or last week's 4-digit spell) holds it
    await act(async () => { notify() })
    const box = $('#sbBoard input.tm[data-bfld$=".to"]') as HTMLInputElement
    expect(box, 'the take-off box rendered').toBeTruthy()
    expect(box.value, 'and shows the folded colon form').toBe('09:00')
    const elogBefore = ELOG.rows.length
    box.focus()                                     // focused, but NOT edited
    await act(async () => { boardTab(3); notify() })
    expect(f.to, 'the untouched legacy value is left exactly as stored').toBe('0900')
    expect(ELOG.rows.length, 'no phantom History row was minted').toBe(elogBefore)
    f.to = keep
    await act(async () => { notify() })
  })

  it('a genuinely typed value still commits on the way out (the guard does not swallow edits)', async () => {
    await act(async () => { openScheduler(0); notify() })
    const f: any = DAYS[0].waves[0].formations[0]
    const keep = f.to
    f.to = '0900'
    await act(async () => { notify() })
    const box = $('#sbBoard input.tm[data-bfld$=".to"]') as HTMLInputElement
    box.focus()
    box.value = '1015'                              // a real keystroke, not blurred before the step
    await act(async () => { boardTab(3); notify() })
    expect(f.to, 'the typed take-off committed on the day step, folded to colon').toBe('10:15')
    f.to = keep
    await act(async () => { notify() })
  })
})

/* SCENARIO 7: the split day name, all seven days — the existing test pins the
   shape on Wed and the date on Mon/Sat/Sun; this closes the other days and the
   tail on every one (Sat/Sun collide at three letters, so the tail + date are
   what tells them apart on surfaces with room) */
describe('every day of the week splits its name three letters + .bl tail', () => {
  it('Mon through Sun: firstChild is the three letters, the .bl is the rest, whole word survives', async () => {
    for (let di = 0; di < DAYS.length; di++) {
      await act(async () => { boardTab(di); notify() })
      const day = $('#sbDay')
      const tail = day.querySelector('.bl') as HTMLElement
      expect(day.firstChild!.nodeValue, `${DAYS[di].dow} leads with its three letters`).toBe(DAYS[di].dow.slice(0, 3))
      expect(tail, `${DAYS[di].dow} carries its tail in a .bl`).toBeTruthy()
      expect(tail.textContent).toBe(DAYS[di].dow.slice(3))
      expect(day.textContent, 'desktop reads the whole word off the same markup').toBe(DAYS[di].dow)
      expect($('#sbDate').textContent).toBe(DAYS[di].dt)
    }
  })
})

/* SCENARIO 2: which dialogs survive a day step. Sort all SHOULD (its commit
   reads the day it armed, by design — the dialog "can never say the wrong day
   even if the board has since switched tabs underneath it"), and the CX box
   acts on the ROW OBJECT it captured, so a step cannot re-target it. */
describe('dialogs across a day step', () => {
  it('Sort all survives a step and still names the day it was asked about', async () => {
    await act(async () => { askSortAll(2) })
    expect(SORTALL).toBe(2)
    await act(async () => { $('#sbNextDay').click(); $('#sbNextDay').click() })
    expect(view.SBDAY).toBe(4)
    expect(SORTALL, 'the armed day did not follow the tabs').toBe(2)
    expect($('#sortAllTitle').textContent).toContain(DAYS[2].dow)
    await act(async () => { cancelSortAll() })
  })

  it('the CX dialog commits to the row it captured, not to whatever day is now open', async () => {
    const row = DAYS[2].allhands && DAYS[2].allhands[0]
    expect(row, 'day 2 has a programme row to cancel').toBeTruthy()
    await act(async () => { askCx(row, `ap:2.0.prog`, 'this item') })
    await act(async () => { boardTab(5); notify() })
    expect(view.SBDAY).toBe(5)
    await act(async () => { cxCommit(true, 'WX') })
    expect(row.cx, 'the captured Wednesday row is the one cancelled').toBe(true)
    expect(row.cxr).toBe('WX')
    const d5 = DAYS[5].allhands && DAYS[5].allhands[0]
    if (d5) expect(d5.cx, 'the visible Saturday row was never touched').not.toBe(true)
    await act(async () => { askCx(row, `ap:2.0.prog`, 'this item'); cxCommit(false, '') })   // un-cancel
    expect(row.cx).toBe(false)
  })

  /* the stores popup is body-level and closed by its own click-away. An ARROW
     click reaches document and closes it — and since 12 Aug 26 (audit) a
     SCRUB closes it too: the strip eats the release click, so boardTab now
     takes the popup (and a pinned History bubble) down itself rather than
     leaving it standing over a day it does not describe. */
  it('an arrow click closes the stores popup, and a scrub closes it too', async () => {
    const openPopup = async () => {
      const c = $('#sbBoard [data-stcfg]')
      expect(c, 'the board renders a stores C button in edit mode').toBeTruthy()
      await act(async () => { c.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
      await act(async () => { await new Promise(r => setTimeout(r, 5)) })   // its click-away arms on a macrotask
      expect(document.querySelector('.stmenu'), 'the popup opened').toBeTruthy()
    }
    await openPopup()
    await act(async () => { $('#sbNextDay').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(document.querySelector('.stmenu'), 'the arrow click is an outside click — popup gone').toBe(null)

    await act(async () => { boardTab(2); notify() })
    await openPopup()
    layOutDots()
    await scrub(50, 110)                                     // 2 → 5, release eaten by the strip
    expect(view.SBDAY).toBe(5)
    expect(document.querySelector('.stmenu'), 'boardTab took the popup down with the day it described').toBe(null)
  })
})

/* SCENARIO 6: the page lock comes off on every close path jsdom can drive */
describe('body.sb-lock on the close paths', () => {
  it('is set while the board is open and removed by its own Close', async () => {
    expect(document.body.classList.contains('sb-lock')).toBe(true)
    await act(async () => { closeScheduler() })
    expect(document.body.classList.contains('sb-lock'), 'Close lifts the lock').toBe(false)
  })

  it('is removed when the board is closed by setPage (nav under the drawer, z440 over the board)', async () => {
    expect(document.body.classList.contains('sb-lock')).toBe(true)
    await act(async () => { view.setPage('viewsched'); notify() })
    expect(view.SBDAY, 'setPage closed the board').toBe(null)
    expect(document.body.classList.contains('sb-lock'), 'no lock left on a page with no board').toBe(false)
  })

  it('is removed on a logout with the board open, and the next session starts unlocked', async () => {
    expect(document.body.classList.contains('sb-lock')).toBe(true)
    await act(async () => { resetSession(null); notify() })
    expect(document.body.classList.contains('sb-lock'), 'logout under an open board must not brick the app’s scrolling').toBe(false)
    expect(view.CARRYDAY, 'and no stale carry follows the next login').toBe(null)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await act(async () => { view.setPage('editsched'); notify() })
  })

  it('restores the document scroll it captured at open', async () => {
    const el = (document.scrollingElement || document.documentElement) as HTMLElement
    await act(async () => { closeScheduler() })               // start from closed
    el.scrollTop = 777
    await act(async () => { openScheduler(2); notify() })
    el.scrollTop = 0                                          // whatever the lock/browser did meanwhile
    await act(async () => { closeScheduler() })
    expect(el.scrollTop, 'put back by hand, not left to overflow:hidden’s good graces').toBe(777)
    el.scrollTop = 0
  })
})

/* SCENARIO 4 (multi-pointer): a second finger landing on the strip mid-scrub
   must not leave the machine wedged — the last finger down owns the scrub,
   and its release still ends the gesture cleanly */
describe('two fingers on the dot strip', () => {
  it('the second pointer takes over and its release ends the scrub', async () => {
    const dots = $('#sbDays')
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 1 } as any))
    })
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 90, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
    })
    expect(view.SBDAY, 'finger one scrubbed to dot 4').toBe(4)
    /* finger two lands — the machine re-bases on it (documented behaviour:
       onDown overwrites live/x0/id; finger one is orphaned, not wedged) */
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 110, clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 2 } as any))
    })
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
    })
    expect(view.SBDAY, 'the orphaned first finger no longer steers').toBe(4)
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 10, clientY: 50, pointerType: 'touch', pointerId: 2 } as any))
      dots.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 10, clientY: 50, pointerType: 'touch', pointerId: 2 } as any))
    })
    expect(view.SBDAY, 'finger two steered to dot 0 and released').toBe(0)
    /* and the machine is not wedged: after the one designed click-eat (the
       release's own click) expires, a plain tap still works */
    await act(async () => { await new Promise(r => setTimeout(r, 360)) })
    layOutDots()
    await act(async () => {
      $$('#sbDays [data-sbtab]')[3].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(view.SBDAY).toBe(3)
  })
})
