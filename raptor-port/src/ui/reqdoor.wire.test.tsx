// @vitest-environment jsdom
/* THE WIRES OF THE INPUT ROW'S DOOR THAT NO TEST HELD ([ALL-AVAIL-AS-MEMBER], the break tests of 12 Oct 26 —
   docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 2). Each case here was written with its wire
   broken on purpose (ui/reqdoor.ts), went red, and is green on the door as built. Driven as ui/reqdoor.test.tsx drives
   it: the real door, the real drop (ui/drag.ts applyDrop on a stand-in element carrying the place's key), on a real
   saved store.

   · the swap's refusal (Fable F8; the plan §4.4): reqdoor.test.tsx's "a seat that refuses the man replaced refuses
     both" swaps into a seat that takes him — the refusing seat itself was never driven.
   · "only a scheduler's hand" (D763; the door's own `canEditSched()` tests): reqdoor.test.tsx's member is IN the input
     but did not file it, so the input's own save refuses him whether the door asks or not — all five of the door's
     tests could be dropped with nothing red. The member here FILED the input: its own window lets him change who is
     in it (D763), so only the door stands between him and the same change made by a hand on the schedule. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { slotVal } from '../engine/slots'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Whiteboard } from '../storage/whiteboard'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, commitNewInput, draftOf } from './inputedit'
import { rowPut, rowTake, rowMove, rowMark } from './reqdoor'
import * as pops from './pops'
import { applyDrop, setDrag } from './drag'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2
const toast = HOOKS.toast
let SAID: string[] = []

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  indexCallsigns()
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); view.disarmSlot()
  pops.setInpEdit(null); pops.setOilAsk(null)
  stashClear()
}
async function boot(be: MemoryBackend): Promise<Whiteboard> {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')      // Saber, a scheduler
  setPage('editsched'); setBoardDay(WED)
  return wb
}

const TITLE = 'Range safety brief'
const recs = () => INPUTS.filter((x: any) => x.title === TITLE && x.date === 'Jul 15') as any[]
const rec = () => { const l = recs(); expect(l, 'ONE record').toHaveLength(1); return l[0] }
const people = () => idsOf(rec()).map(String)
const ground = () => ((DAYS[WED] as any).ground || []) as any[]
const riOf = () => ground().findIndex((g: any) => g && g.src === String(inpId(rec())))
const rowKey = () => `g:${WED}.${riOf()}`
const DRAFT = () => ({ ...draftOf({ person: 'bane', type: 'Meeting', title: TITLE, date: 'Jul 15', yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your kit' }) })
const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); return el }

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''; setDrag(null) })

describe('the SWAP from a seat is one command — a seat that REFUSES the man replaced refuses both (D755 (2); Fable F8)', () => {
  it('the newcomer dragged from a row the man replaced ALREADY stands on (D271 — one man, once a row): nothing changes — he keeps his input, the newcomer keeps his place', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(DRAFT())).toBe(true)                                   // bane's own input, he alone on its row
    /* a row of the scheduler's own that holds the newcomer in its name box and the man to be replaced under him */
    ;(DAYS[WED] as any).ground.push({ prog: 'SQN PT', str: '07:00', end: '08:00', who: 'split', more: ['bane'], rmks: '' })
    const own = `g:${WED}.${ground().length - 1}`
    const was = JSON.stringify(INPUTS)
    setDrag({ kind: 'slot', key: own })
    expect(applyDrop(seatEl(rowKey()), 0, 0), 'the drop is refused').toBe(false)
    expect(people(), 'the input is still his').toEqual(['bane'])
    expect(JSON.stringify(INPUTS), 'and not a field of it moved').toBe(was)
    expect(slotVal(own), 'the newcomer is where he was').toBe('split')
    expect(ground()[ground().length - 1].more, 'the man replaced stands on that row once').toEqual(['bane'])
    expect(SAID.join(' | '), 'nothing said they swapped').not.toMatch(/swapped/)
  })
})

describe('only a scheduler\'s hand reaches an input from the schedule — the FILER too is refused there (D763; the plan §4.4)', () => {
  const K2 = 'Second brief'
  const D = (over: any = {}) => ({ ...DRAFT(), ...over })
  const recOf = (title: string) => { const l = INPUTS.filter((x: any) => x.title === title && x.date === 'Jul 15') as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
  const inIt = (title: string) => idsOf(recOf(title)).map(String)
  const keyIn = (title: string) => `g:${WED}.${ground().findIndex((g: any) => g && g.src === String(inpId(recOf(title))))}`
  const placeOf = (title: string, p: string) => { const k = keyIn(title), r = ground()[+k.split('.')[1]!]; if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
  const both = () => JSON.stringify([INPUTS, DAYS])
  /* Pike — a member, no scheduler — files two inputs for himself and another man: he is their filer */
  const asFiler = async () => {
    await boot(new MemoryBackend())
    setSession({ user: 'us', role: 'main', name: 'us' }); setMe('pike')
    expect(commitInput(null, D(), ['pike', 'bane']), 'a member files for himself and another (D655)').toBe(true)
    expect(commitInput(null, D({ title: K2, sTime: '16:00', eTime: '17:00' }), ['pike', 'rocky'])).toBe(true)
    expect(recOf(TITLE).by, 'he filed it').toBe('pike')
    SAID = []
  }
  it('THE CONTROL — in the input\'s own window the filer does change who is in it', async () => {
    await asFiler()
    expect(commitInput(recOf(TITLE), draftOf(recOf(TITLE)), ['pike', 'bane', 'split'])).toBe(true)
    expect(inIt(TITLE)).toEqual(['pike', 'bane', 'split'])
  })
  it('a person PUT on his input\'s row: refused, nothing changes', async () => {
    await asFiler()
    const was = both()
    expect(rowPut(`${keyIn(TITLE)}.+`, 'split')).toBe('refused')
    expect(both()).toBe(was)
  })
  it('a puck TAKEN OFF his input\'s row: refused, nothing changes', async () => {
    await asFiler()
    const was = both()
    expect(rowTake(placeOf(TITLE, 'bane'))).toBe('refused')
    expect(both()).toBe(was)
  })
  it('a puck dragged from his input\'s row ONTO A FLYING SEAT: refused, he stays in the input and the pilot in his seat', async () => {
    await asFiler()
    const was = both()
    setDrag({ kind: 'slot', key: placeOf(TITLE, 'bane') })
    expect(applyDrop(seatEl('2.0.0.0.p'), 0, 0)).toBe(false)
    expect(both()).toBe(was)
  })
  it('a puck MOVED from one of his inputs\' rows to the other\'s: refused, nothing changes', async () => {
    await asFiler()
    const was = both()
    expect(rowMove(placeOf(TITLE, 'bane'), `${keyIn(K2)}.+`)).toBe('refused')
    expect(both()).toBe(was)
  })
  it('a MARK on his input\'s row — CX, the red box, information only: refused, nothing changes (D760 reading 2)', async () => {
    await asFiler()
    const was = both()
    expect(rowMark(keyIn(TITLE), 'cx', true, 'WX')).toBe('refused')
    expect(rowMark(keyIn(TITLE), 'flag', true)).toBe('refused')
    expect(rowMark(keyIn(TITLE), 'info', true)).toBe('refused')
    expect(both()).toBe(was)
  })
})
