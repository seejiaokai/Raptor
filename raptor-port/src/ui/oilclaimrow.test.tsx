// @vitest-environment jsdom
/* A CLAIM ROW MUST NOT SAY THE OPPOSITE OF THE PUCK BESIDE IT
   (walk find, 22 Sep 26 — hand-pass finding 13).

   On the everything-Saturday, four rows carried BOTH of these at once:

     the name cell   "Nothing on this row can earn OIL, so there is nothing
                      to switch off"
     the puck on it  "Talisman earns half a day — tap to take him off this event"

   The cause is that `oilCapableItems` is derived from the SCHEDULE walk, and a
   request's credit never goes through it — the requester is credited from his own
   answer, and D18's extras are each decided on their own puck. So a perfectly
   live claim's item is absent from that set for a reason that has nothing to
   do with being unable to earn, and the row borrowed the inert wording.

   This file asserts the INVARIANT over every row the board draws, not one
   fixture: no row may claim nothing on it can earn while a puck on the same
   row says a man earns. Genuinely inert rows — AVALON, a desk with no times,
   an ⓘ row, a cancelled or withdrawn claim — must KEEP the old wording, and
   that is asserted too, because a fix that simply deleted the sentence would
   pass the first half. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, idsOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { ensureRowIds } from '../engine/rowids'
import { setOilDay, setPage, CURPAGE } from '../state/view'
import { toggleOilMode, oilDayFigures, oilFigureFor } from './oilmode'
import { openScheduler } from './board'
import { rowPut } from './reqdoor'
import { setOilAsk, setInpEdit } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const SAT = 5, SAT_ISO = '2026-07-18'
const DSNAP = JSON.stringify(DAYS)
const INERT = /nothing on this row can earn/i
const EARNS = /earns (a full day|half a day)/i
const PER_PERSON = /answered for each person on it/i
let host: HTMLDivElement
let root: Root
/* the page the suite stands on once signed in */
let HOME: any
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

beforeAll(async () => {
  initStore()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' } as any); notify() })
  HOME = CURPAGE
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ensureRowIds(DAYS); setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
})
/* (a man put on a row whose input has no OIL answer opens the question, in the input's window — closed here; and the
   page a tap was made from is put back, so no case inherits another's) */
afterEach(async () => { await act(async () => { setOilDay(null); setOilAsk(null); setInpEdit(null); setPage(HOME); notify() }) })

const addRow = (di: number, r: any) => {
  ;(DAYS[di] as any).ground = (((DAYS[di] as any).ground) || []).concat([r]); ensureRowIds(DAYS)
  const g = (DAYS[di] as any).ground; return g[g.length - 1]
}
const claim = (over: any = {}) => {
  const row: any = { iid: 'cl1', person: 'bane', type: 'Training', date: 'Jul 18',
    acc: 'g', allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', yr: 2026,
    oil: { [SAT_ISO]: 1 }, ...over }
  INPUTS.unshift(row); return row
}
/* every row the board draws that has BOTH a name cell and a puck */
/* the board renders under #sbBoard here and #schedBoard in the shipped shell;
   search the document so this cannot quietly match nothing */
const pairs = () => $$('.sb-arow, .sb-line').map(r => {
  const cell = r.querySelector('.oilitem') as HTMLElement | null
  const pk = r.querySelector('.oilpk') as HTMLElement | null
  /* textContent, not innerText — jsdom has no layout engine and innerText
     comes back empty, which silently turned every "is my row on screen?"
     filter into a no-op that passed by matching nothing. */
  return cell && pk ? { row: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
                        cell: cell.getAttribute('title') || '', puck: pk.getAttribute('title') || '' } : null
}).filter(Boolean) as { row: string; cell: string; puck: string }[]

const openMode = async () => {
  await act(async () => { openScheduler(SAT); notify() })
  await act(async () => { toggleOilMode(SAT); notify() })
}
/* a TAP on a puck is a scheduler's, on Edit Schedule — the board takes none from any other page (boardArmClick) */
const onEditSchedule = async () => { await act(async () => { setPage('editsched'); notify() }) }
/* a man put on the claim's row as a hand does it now — on its "+ add", through the row's door (D755): he joins the input */
const putOnRow = async (id: string) => {
  const ri = ((DAYS[SAT] as any).ground as any[]).findIndex(g => g && g.src === 'cl1')
  await act(async () => { expect(rowPut(`g:${SAT}.${ri}.+`, id), `${id} put on the row`).toBe('done'); notify() })
}
/* his switch on the claim's own row (he may wear other pucks on the seed Saturday, each with its own item) */
const hisOnClaim = (id: string) => {
  const el = $$('.sb-arow .seat.oilpk').find(p => p.dataset.oilp === id && p.dataset.oilitem === 'i:cl1')
  expect(el, `${id}'s switch on the claim's row`).toBeTruthy()
  return el as HTMLElement
}

describe('a claim row and the puck beside it agree about OIL', () => {
  it('NO row says nothing here can earn while a puck on it says a man earns', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1' })
    await openMode()
    const rows = pairs()
    expect(rows.length, 'the board drew rows carrying both a name cell and a puck').toBeGreaterThan(0)
    const bad = rows.filter(r => INERT.test(r.cell) && EARNS.test(r.puck))
    expect(bad, 'these rows contradict themselves: ' + JSON.stringify(bad)).toEqual([])
  })

  it('a LIVE claim row says the decision is per person, and points at the pucks', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1' })
    await openMode()
    const mine = pairs().filter(r => EARNS.test(r.puck) && /TRAINING/i.test(r.row))
    expect(mine.length, 'the landed claim row is on screen with an earning puck').toBeGreaterThan(0)
    mine.forEach(r => expect(r.cell, r.row).toMatch(PER_PERSON))
  })

  it('a CANCELLED claim keeps the ordinary inert wording — it is true there', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1', cx: true })
    await openMode()
    const mine = pairs().filter(r => /TRAINING/i.test(r.row))
    expect(mine.length, 'the cancelled claim row is on screen').toBeGreaterThan(0)
    mine.forEach(r => {
      expect(r.cell, 'it does not borrow the per-person sentence').not.toMatch(PER_PERSON)
      expect(r.puck, 'and its puck agrees nothing is earned').not.toMatch(EARNS)
    })
  })

  /* D18's SECOND MAN — the credit pass credits him and the mode said he earns nothing.
     Walk find, 22 Sep 26: Cobra earned NOTHING on the Saturday, was dragged
     onto Talisman's landed Training row through the row's own drop zone, and
     the day then credited him HO — so job 8's engine half works. His puck in the
     mode was drawn INERT, titled "Cobra — nothing measurable to earn from
     here", carrying no item and no switch. The screen contradicted the credit
     about a man's entitlement AND offered no way to change it.

     The cause is two bodies: the credit moved to `oilEarnedWork` (oilev.ts,
     where D18 was built) while `oilEligible` still asked `dayOilWork`, whose
     ground walk skips every `src` row whole.

     UNDER THE ONE RULE (owner D755, D762 — 11 Oct 26; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md
     §4.4, §4.7) he is no longer "the scheduler's extra" on another man's row: put on it — through the row's door
     (ui/reqdoor.ts; a raw write under the row is refused by the engine's belt and swept by the re-make) — he is IN
     the input, and D18's "earns by default, whatever the member answered" is gone with the split: there is ONE answer
     an input, for everyone in it. What the walk found still stands and is what these two pin: the screen and the
     credit agree about him, and he is NEVER inert — on the input's Yes he is drawn earning; on its No, or with no
     answer, he is OFF, a real switch, told whose answer it is (the words for an input of several — never "he
     answered No": he gave no answer of his own), and a tap credits HIM alone. */
  it('D762 (was D18) — a second man put on a claim row is IN the input: on its Yes he is drawn earning, not inert', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1' })
    await putOnRow('stiff')
    expect(idsOf(INPUTS[0]).map(String), 'he joined the input — the same record').toEqual(['bane', 'stiff'])
    expect((INPUTS[0] as any).oil, 'and follows its one answer: nothing was written for him').toEqual({ [SAT_ISO]: 1 })
    await openMode()
    expect(oilDayFigures(SAT)['stiff'], 'the credit pass credits the second man').toBeTruthy()
    /* by his DISPLAYED name, derived — an inert puck carries no data-oilp at
       all, which is half the defect, so the id cannot be the only handle */
    const name = (PEOPLE as any)['stiff'].cs
    const his = $$('.oilpk').filter(p =>
      p.getAttribute('data-oilp') === 'stiff' ||
      (p.getAttribute('title') || '').startsWith(name))
    expect(his.length, 'his puck is on the row').toBeGreaterThan(0)
    const inert = his.filter(p => p.className.includes('inert'))
    expect(inert.map(p => p.getAttribute('title')), 'none of his pucks is inert').toEqual([])
    expect(his.some(p => (p.getAttribute('title') || '').match(EARNS)), 'and one of them says he earns').toBe(true)
    const onRow = hisOnClaim('stiff')
    expect(onRow.classList.contains('on'), 'the puck on the claim\'s own row is lit').toBe(true)
    expect(onRow.title).toMatch(EARNS)
    expect(oilFigureFor(SAT, 'stiff', 'i:cl1'), 'and it is THIS input that counts towards his day').toBeTruthy()
  })

  for (const [what, oil, words] of [
    ['a No', { [SAT_ISO]: 0 }, /whoever filed this Training answered No to OIL; tap to credit him anyway/],
    ['no answer', undefined, /the OIL question for this Training has not been answered yet; tap to credit him/],
  ] as const) {
    it(`D762 — on ${what} the second man is OFF, a real switch, in the words for an input of several; a tap credits HIM alone`, async () => {
      claim({ oil })
      addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1' })
      await putOnRow('stiff')
      await onEditSchedule()
      await openMode()
      const seat = () => hisOnClaim('stiff')
      expect(seat().classList.contains('inert'), 'not inert — he can be credited').toBe(false)
      expect(seat().classList.contains('off'), 'he follows the input\'s answer').toBe(true)
      expect(seat().title).toMatch(words)
      expect(seat().title, 'never his own refusal — he gave no answer of his own').not.toMatch(/answered No for/)
      expect(seat().title).not.toMatch(EARNS)
      expect(oilFigureFor(SAT, 'stiff', 'i:cl1'), 'the credit agrees: nothing from this input').toBeNull()
      /* the man who filed it is one of several now, and reads the same way */
      expect(hisOnClaim('bane').classList.contains('off')).toBe(true)
      expect(hisOnClaim('bane').title).toMatch(words)
      await act(async () => { seat().querySelector('.puck')!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
      expect((DAYS[SAT] as any).oild.people, 'a decision about HIM alone, under his own name and the input\'s id')
        .toEqual({ 'stiff|i:cl1': 'allow' })
      expect(seat().classList.contains('on')).toBe(true)
      expect(hisOnClaim('bane').classList.contains('off'), 'the other man is untouched').toBe(true)
      expect(oilFigureFor(SAT, 'stiff', 'i:cl1'), 'and the credit follows the tap').toBeTruthy()
      expect(oilFigureFor(SAT, 'bane', 'i:cl1'), 'for him alone').toBeNull()
    })
  }

  it('an ⓘ row keeps it too', async () => {
    addRow(SAT, { prog: 'ADMIN', str: '0900', end: '1000', who: 'bane', info: true })
    await openMode()
    const mine = pairs().filter(r => /ADMIN/i.test(r.row))
    expect(mine.length, 'the info row is on screen').toBeGreaterThan(0)
    mine.forEach(r => expect(r.cell, r.row).toMatch(INERT))
  })
})
