// @vitest-environment jsdom
/* ALL AVAIL / ALL AS ONE OF AN INPUT'S OWN PEOPLE — THROUGH THE DOORS ([ALL-AVAIL-AS-MEMBER] step 3, 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.4, §4.5, §4.7 — its tests T1, T3, T17 and the placeholder rows
   of §4.4's table). His rulings:
   D750 — "'Several people' takes ALL AVAIL / ALL, so the puck is one of the input's own people and is tied to no man";
   D753 — the men behind it follow the OIL answer given for the input, the scheduler may still switch any one man; it is
           offered only where the input is a single day; an input takes ALL or ALL AVAIL, never both;
   D755 — "a row that came from an input IS the input: whoever stands on it — a named person or ALL AVAIL / ALL, whoever
           put them there, whether the input began with one person or several — is in the input"; (4) a drop that cannot
           apply is refused with its reason;
   D757 — the walk-through: "ALL AVAIL stays when anyone leaves";
   D762 — one OIL answer for everyone in it; D763 — who is in it is changed by whoever filed it or a scheduler;
   D702 — members may choose it too; D271 — once on a row.
   And his question of 11 Oct 26, which the plan carries as T1: "will an input that has all avail vs an initial input
   that has just a person and an all avail was put on it and the initial person removed show the same in schedule and
   input?" — yes, and this file pins it.

   UNTIL THIS STEP every door refused a placeholder beside anyone ("ALL AVAIL is filed on its own"); the pins that said
   so are flipped where they stood (ui/reqdoor.test.tsx and its neighbours). Driven through the row's door
   (ui/reqdoor.ts), the drop itself (ui/drag.ts applyDrop), an armed place filled by a tap, and the input's one writer
   (ui/inputedit.tsx commitInput — what its own window saves through), on a real saved store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf, inputLines } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayPendingItems, dayShownPendCount, itemCounts, dayDelta } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { inputItemKey } from '../engine/oil'
import { oilEvidence, oilEarnedWork, projectOilInputs } from '../engine/oilev'
import { rowPeopleDrawn } from '../engine/grouprows'
import { ensureRowIds } from '../engine/rowids'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf, howMany } from './inputedit'
import { rowPut, rowTake, rowMove } from './reqdoor'
import { monthItems, barText, namesOf, everyoneIn } from './inputscal-model'
import { toggleOilPerson } from './oilmode'
import { pendItemWords } from './pendlist'
import * as pops from './pops'
import { applyDrop, setDrag } from './drag'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, SAT = 5
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const SAT_ISO = ISO[SAT] as string
const toast = HOOKS.toast, earning = HOOKS.oilEarningDay, sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
let SAID: string[] = []
/* who ALL AVAIL would stand for on the Saturday. `bane` is deliberately in it: a crowd that swept a NAMED man up would
   credit him twice (T3). */
const CROWD = ['bane', 'stiff', 'plasma']
const oilOn = () => {
  /* the seed Saturday carries flying, duty and sim work of its own: "only these earn" would pass, or fail, on its back.
     Stripped BEFORE the store boots, so the saved week is the stripped one. */
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilDayISO = (di: number) => ISO[di] as string
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilSentinel = () => CROWD.slice()
}

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
async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  admin()
  setPage('editsched'); setBoardDay(WED)
}
const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff') }      // Saber, a scheduler
const member = (id: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }

const cs = (p: string) => String((PEOPLE as any)[p].cs)
const TITLE = 'Range safety brief'
const dateOf = (di: number) => (di === SAT ? 'Jul 18' : 'Jul 15')
const recs = (di = WED, title = TITLE) => INPUTS.filter((x: any) => x.title === title && x.date === dateOf(di)) as any[]
const rec = (di = WED, title = TITLE) => { const l = recs(di, title); expect(l, 'ONE record').toHaveLength(1); return l[0] }
const people = (di = WED, title = TITLE) => idsOf(rec(di, title)).map(String)
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(di, title))))
const rowOf = (di = WED, title = TITLE) => ground(di)[riOf(di, title)]
const rowKey = (di = WED, title = TITLE) => `g:${di}.${riOf(di, title)}`
const keyOf = (p: string, di = WED, title = TITLE) => { const r = rowOf(di, title), k = rowKey(di, title); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
const onRow = (di = WED, title = TITLE) => [rowOf(di, title).who, ...(rowOf(di, title).more || [])].filter(Boolean)
const drawn = (di = WED, title = TITLE) => rowPeopleDrawn(DAYS[di], di, riOf(di, title)).map(p => String(p.id))
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di === SAT ? 'Duty' : 'Meeting', title: TITLE, date: dateOf(di), yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your kit' }), ...over })
const file = (ppl: string[], di = WED, oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl, oil ? { oil } : undefined), 'filed').toBe(true)
const cellEl = (key: string) => { const row = document.createElement('div'); row.className = 'pl-row'; const c = document.createElement('div'); c.className = 'ppl'; c.dataset.fill = key; row.appendChild(c); document.body.appendChild(row); return c }
const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); return el }
/* a 14:00–15:00 duty is a half day by its hours: Yes is that amount (a Yes the hours no longer price is asked again) */
const YES = { [SAT_ISO]: 0.5 }, NO = { [SAT_ISO]: 0 }
const item = (di = SAT) => inputItemKey(String(inpId(rec(di))))
const paid = (di = SAT) => Object.keys(oilEarnedWork(DAYS[di], oilEvidence(di))).sort()

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => {
  HOOKS.toast = toast; HOOKS.oilEarningDay = earning; HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''; setDrag(null)
})

describe('ALL AVAIL put on an input\'s row JOINS the input (D755, D757 step 3 — the plan §4.4)', () => {
  it('dropped on the row\'s "+ add": one record holding it, one row, drawn after the named people — and one Undo takes it back', async () => {
    await boot()
    file(['pike', 'bane'])
    const steps = ELOG.rows.length
    setDrag({ kind: 'roster', id: 'allavail' })
    expect(applyDrop(cellEl(`${rowKey()}.+`), 0, 0)).not.toBe(false)
    expect(people()).toEqual(['pike', 'bane', 'allavail'])
    expect(ground().filter((g: any) => g.src === String(inpId(rec())))).toHaveLength(1)
    expect(onRow(), 'the row is a whole copy of the input').toEqual(['pike', 'bane', 'allavail'])
    expect(drawn(), 'named A to Z by callsign, then the placeholder').toEqual([...['bane', 'pike'].sort((a, b) => cs(a).localeCompare(cs(b))), 'allavail'])
    expect(inputLines([rec()]).map((l: any) => l.person), 'the rules read a line a NAMED person — it blocks nobody').toEqual(['pike', 'bane'])
    expect(SAID.join(' | '), 'the puck is the sign: no note (owner D854)').not.toContain('added to')
    expect(ELOG.rows.length, 'one line of the change history').toBe(steps + 1)
    expect(globalUndo()).toBeTruthy()
    expect(people()).toEqual(['pike', 'bane'])
    expect(onRow()).toEqual(['pike', 'bane'])
  })
  it('dropped ON the only person\'s puck it joins beside him — a placeholder never replaces anyone', async () => {
    await boot()
    file(['bane'])
    setDrag({ kind: 'roster', id: 'allavail' })
    expect(applyDrop(seatEl(rowKey()), 0, 0)).not.toBe(false)
    expect(people()).toEqual(['bane', 'allavail'])
    expect(rec().by, 'and the input stays his who filed it').toBe('stiff')
  })
  it('an armed "+ add" filled by a tap on ALL in the crew list', async () => {
    await boot()
    file(['bane', 'pike'])
    view.armSlot(`${rowKey()}.+`)
    expect(view.placeArmed('all')).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'all'])
  })
  it('a named person put on the row of an input filed for ALL AVAIL joins it — on its "+ add" and on the placeholder\'s own puck alike', async () => {
    await boot()
    file(['allavail'])
    expect(rowPut(`${rowKey()}.+`, 'pike')).toBe('done')
    expect(rowPut(rowKey(), 'bane'), 'on the placeholder\'s puck: nobody is replaced').toBe('done')
    expect(people()).toEqual(['allavail', 'pike', 'bane'])
    expect(drawn()).toEqual([...['bane', 'pike'].sort((a, b) => cs(a).localeCompare(cs(b))), 'allavail'])
  })
})

describe('where it cannot apply the drop is refused with its reason, and nothing changes (D753, D755 (4))', () => {
  const refused = (key: string, id: string, why: RegExp | string) => {
    const was = JSON.stringify(INPUTS), days = JSON.stringify(DAYS)
    SAID = []
    expect(rowPut(key, id)).toBe('refused')
    expect(JSON.stringify(INPUTS), 'the inputs untouched').toBe(was)
    expect(JSON.stringify(DAYS), 'the schedule untouched').toBe(days)
    if (typeof why === 'string') expect(SAID).toEqual([why]); else expect(SAID.join(' | ')).toMatch(why)
  }
  it('ALL beside ALL AVAIL, and ALL AVAIL a second time — an input takes one of them, once', async () => {
    await boot()
    file(['bane', 'allavail'])
    refused(`${rowKey()}.+`, 'all', 'This input already has ALL AVAIL')
    refused(`${rowKey()}.+`, 'allavail', 'This input already has ALL AVAIL')
  })
  it('onto an input longer than a day', async () => {
    await boot()
    file(['bane', 'pike'], WED, undefined, { end: '2026-07-17' })
    refused(`${rowKey()}.+`, 'allavail', 'ALL AVAIL is for one day')
  })
  it('onto a kind that is not one of the six', async () => {
    await boot()
    file(['bane'], WED, undefined, { type: 'Fly with', title: TITLE })
    const r = INPUTS.find((x: any) => x.type === 'Fly with' && x.date === 'Jul 15' && idsOf(x).includes('bane') && x.remarks === 'Bring your kit') as any
    const ri = ground().findIndex((g: any) => g && g.src === String(inpId(r)))
    if (ri < 0) return                 // a kind that lands no Ground row has no row door to ask; its window says it (below)
    refused(`g:${WED}.${ri}.+`, 'allavail', 'ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
  })
  it('the same sentences at the input\'s own save — its window, the Inputs calendar', async () => {
    await boot()
    const no = (ppl: string[], over: any, why: string) => { SAID = []; expect(commitInput(null, DRAFT(WED, over), ppl)).toBe(false); expect(SAID).toEqual([why]) }
    const n = INPUTS.length
    no(['bane', 'allavail'], { end: '2026-07-17' }, 'ALL AVAIL is for one day')
    no(['bane', 'all'], { type: 'Fly with' }, 'ALL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
    no(['bane', 'allavail', 'all'], {}, 'This input already has ALL AVAIL')
    expect(INPUTS.length, 'nothing was filed').toBe(n)
    /* (until D776 and D778, 12 Oct 26, two more were refused here: ALL AVAIL on a Personal input, and a second person on
       one — "A Personal input is one person's own". Both save now: Personal is the same as an Event for people.) */
    SAID = []
    expect(commitInput(null, DRAFT(WED, { type: 'Personal' }), ['bane', 'allavail']), SAID.join(' | ')).toBe(true)
    expect(commitInput(null, DRAFT(WED, { type: 'Personal', sTime: '16:00', eTime: '17:00' }), ['bane', 'pike']), SAID.join(' | ')).toBe(true)
    expect(INPUTS.length).toBe(n + 2)
  })
})

describe('ALL AVAIL stays when anyone leaves; taken off itself, it leaves (D757 step 4)', () => {
  it('a named person taken off: ALL AVAIL stays, with everyone else', async () => {
    await boot()
    file(['bane', 'pike', 'allavail'])
    expect(rowTake(keyOf('bane'))).toBe('done')
    expect(people()).toEqual(['pike', 'allavail'])
    expect(onRow()).toEqual(['pike', 'allavail'])
  })
  it('the LAST named person taken off leaves an input for ALL AVAIL — it is not the last on the row', async () => {
    await boot()
    member('bane'); file(['bane']); admin()
    expect(rowPut(`${rowKey()}.+`, 'allavail')).toBe('done')
    expect(rowTake(keyOf('bane'))).toBe('done')
    expect(people()).toEqual(['allavail'])
    expect(rec().by, 'who filed it passes to the scheduler who took its filer out').toBe('stiff')
  })
  it('ALL AVAIL taken off the row leaves the input', async () => {
    await boot()
    file(['bane', 'allavail'])
    SAID = []
    expect(rowTake(keyOf('allavail'))).toBe('done')
    expect(people()).toEqual(['bane'])
    expect(SAID, 'the puck is the sign: no note (owner D854)').toEqual([])
  })
  it('alone on the row it is the last: refused, saying how', async () => {
    await boot()
    file(['allavail'])
    expect(rowTake(rowKey())).toBe('refused')
    expect(SAID.join(' ')).toBe('ALL AVAIL is the last on this input. Take the input off the programme, or delete it in its own window.')
    expect(people()).toEqual(['allavail'])
  })
  it('dragged from one input\'s row onto another\'s it MOVES — never in both', async () => {
    await boot()
    file(['bane', 'allavail'])
    expect(commitInput(null, DRAFT(WED, { title: 'Second brief' }), ['pike'])).toBe(true)
    expect(rowMove(keyOf('allavail'), `${rowKey(WED, 'Second brief')}.+`)).toBe('done')
    expect(people()).toEqual(['bane'])
    expect(people(WED, 'Second brief')).toEqual(['pike', 'allavail'])
  })
})

describe('the input\'s own save takes it too (the plan §4.5 — what its window and the picker save through)', () => {
  it('filed for two people and ALL AVAIL in one go: one record, in the order picked', async () => {
    await boot()
    file(['bane', 'pike', 'allavail'])
    expect(people()).toEqual(['bane', 'pike', 'allavail'])
    expect(onRow()).toEqual(['bane', 'pike', 'allavail'])
  })
  it('added in the window to an input of several, and taken out again', async () => {
    await boot()
    file(['bane', 'pike'])
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'pike', 'allavail'])).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'allavail'])
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'pike'])).toBe(true)
    expect(people()).toEqual(['bane', 'pike'])
  })
  it('its people un-picked and ALL AVAIL picked in one save: the input is ALL AVAIL\'s now (refused until this step)', async () => {
    await boot()
    file(['bane', 'pike'])
    expect(commitInput(rec(), draftOf(rec()), ['allavail'])).toBe(true)
    expect(people()).toEqual(['allavail'])
    expect(onRow()).toEqual(['allavail'])
  })
  it('a member adds ALL AVAIL to the input he filed (D702: "members may choose it too")', async () => {
    await boot()
    member('bane')
    file(['bane'])
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'allavail'])).toBe(true)
    expect(people()).toEqual(['bane', 'allavail'])
  })
  it('a person in a shared input he did not file adds nobody — ALL AVAIL neither (D763)', async () => {
    await boot()
    file(['bane', 'pike'])
    member('pike')
    const was = JSON.stringify(INPUTS)
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'pike', 'allavail'])).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(was)
  })
})

describe('OIL: one answer for everyone in it, the men behind ALL AVAIL with them (D753, D762 — the plan §4.7)', () => {
  it('T3 — nobody earns twice: a man named in the input is not in its crowd, and switching him off switches him off', async () => {
    oilOn(); await boot(); setBoardDay(SAT)
    file(['bane'], SAT, YES)
    expect(rowPut(`${rowKey(SAT)}.+`, 'allavail')).toBe('done')
    const ev = oilEvidence(SAT)
    expect(ev.sent[item()], 'the crowd written down never holds a named man').toEqual(['stiff', 'plasma'])
    expect(oilEarnedWork(DAYS[SAT], ev).bane, 'one span, as himself').toHaveLength(1)
    expect(paid()).toEqual(['bane', 'plasma', 'stiff'])
    toggleOilPerson(SAT, 'bane', item())
    expect(paid(), 'off is off — not still earning as one of the crowd').toEqual(['plasma', 'stiff'])
  })
  it('added where the input\'s answer is No: the note says so, and nobody behind it earns', async () => {
    oilOn(); await boot(); setBoardDay(SAT)
    file(['bane'], SAT, NO)
    SAID = []
    expect(rowPut(`${rowKey(SAT)}.+`, 'allavail')).toBe('done')
    expect(SAID).toEqual([`ALL AVAIL added to ${TITLE} — not counted for OIL`])
    expect(paid()).toEqual([])
  })
  it('a named person put beside ALL AVAIL follows the input\'s one answer, and leaves its crowd', async () => {
    oilOn(); await boot(); setBoardDay(SAT)
    file(['allavail'], SAT, YES)
    expect(oilEvidence(SAT).sent[item()]).toEqual(['bane', 'stiff', 'plasma'])
    expect(rowPut(`${rowKey(SAT)}.+`, 'bane')).toBe('done')
    expect(oilEvidence(SAT).sent[item()]).toEqual(['stiff', 'plasma'])
    expect(paid()).toEqual(['bane', 'plasma', 'stiff'])
    expect(pops.OILASK, 'the input is answered: no question is asked').toBeFalsy()
  })
  it('T17 — a crowd man switched off, ALL AVAIL taken off and dropped back: he is on again (a new holding)', async () => {
    oilOn(); await boot(); setBoardDay(SAT)
    file(['bane', 'allavail'], SAT, YES)
    toggleOilPerson(SAT, 'plasma', item())
    expect(paid()).toEqual(['bane', 'stiff'])
    expect(rowTake(keyOf('allavail', SAT))).toBe('done')
    expect(paid()).toEqual(['bane'])
    expect(rowPut(`${rowKey(SAT)}.+`, 'allavail')).toBe('done')
    expect(paid(), 'the switch made under the old holding does not come back').toEqual(['bane', 'plasma', 'stiff'])
  })
  it('…and a NAMED person leaving does not touch the crowd\'s switches (D750, D757 step 4)', async () => {
    oilOn(); await boot(); setBoardDay(SAT)
    file(['bane', 'pike', 'allavail'], SAT, YES)
    toggleOilPerson(SAT, 'plasma', item())
    expect(rowTake(keyOf('pike', SAT))).toBe('done')
    expect(paid(), 'plasma is still off').toEqual(['bane', 'stiff'])
  })
})

describe('HOW MANY an input holds, in words — ALL AVAIL is nobody to count (D702; found by the look at step 3, 12 Oct 26)', () => {
  /* the note after a filing read "Input added for 3 people" for two people and ALL AVAIL. The window's sentences — added,
     deleted, "delete for all…?", "it stays for the other…", "date changes apply to…" — count the PEOPLE and say the
     placeholder beside them, as the month's bar and the calendar's own delete question do (inputscal-model everyoneIn) */
  it('the people counted, the placeholder said beside them; one person keeps his callsign', async () => {
    await boot()
    expect(howMany(['bane', 'pike', 'split'])).toBe('3 people')
    expect(howMany(['bane', 'pike', 'allavail'])).toBe('2 people and ALL AVAIL')
    expect(howMany(['allavail', 'bane'])).toBe(`${cs('bane')} and ALL AVAIL`)
    expect(howMany(['all'])).toBe('ALL')
    expect(howMany(['bane'])).toBe(cs('bane'))
  })
  it('…and it is the calendar\'s own wording, for every mix', async () => {
    await boot()
    for (const ids of [['bane', 'pike', 'allavail'], ['bane', 'allavail'], ['bane', 'pike', 'split', 'all']]) {
      const it0 = monthItems([{ iid: 'x', type: 'Meeting', date: 'Jul 15', yr: 2026, people: ids.map(p => ({ p })) }], { fType: 'all', fPerson: 'all', fSearch: '' } as any)[0]!
      expect(howMany(ids), ids.join('+')).toBe(everyoneIn(it0))
    }
  })
})

describe('on a published day ALL AVAIL put in or taken out is ONE change waiting — the men behind it ride on it (D736, D109; the plan §4.8, T16)', () => {
  const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
  const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
  /* THE count — and every reader of it agrees */
  const waiting = (di: number): number => {
    const n = dayPendingItems(di).length
    expect(dayShownPendCount(di), 'the day head reads the same list').toBe(n)
    expect(itemCounts(dayPendingItems(di)).total, 'the Amendments box').toBe(n)
    expect(n === 0, 'never zero while something would go out, never something while nothing would').toBe(dayDelta(di).length === 0)
    return n
  }
  for (const di of [WED, SAT]) {
    const day = di === SAT ? 'a Saturday that earns' : 'a weekday'
    const yes = di === SAT ? YES : undefined
    it(`${day}: dropped on an input's row — 1; taken off again — nothing waiting (D98)`, async () => {
      oilOn(); await boot(); setBoardDay(di)
      file(['bane', 'pike'], di, yes)
      publish(di)
      expect(waiting(di)).toBe(0)
      expect(rowPut(`${rowKey(di)}.+`, 'allavail')).toBe('done')
      expect(waiting(di), 'ALL AVAIL added: one, not "and what this day earns" beside it').toBe(1)
      expect(rowTake(keyOf('allavail', di))).toBe('done')
      expect(waiting(di)).toBe(0)
    })
    it(`${day}: taken off an input that went out with it — 1`, async () => {
      oilOn(); await boot(); setBoardDay(di)
      file(['bane', 'allavail'], di, yes)
      publish(di)
      expect(rowTake(keyOf('allavail', di))).toBe('done')
      expect(waiting(di)).toBe(1)
    })
    it(`${day}: a man added to an input that carries ALL AVAIL — he leaves its crowd — 1 (Fable F6 (a)); taken out again — nothing`, async () => {
      oilOn(); await boot(); setBoardDay(di)
      file(['pike', 'allavail'], di, yes)
      publish(di)
      expect(rowPut(`${rowKey(di)}.+`, 'bane')).toBe('done')
      expect(waiting(di)).toBe(1)
      expect(rowTake(keyOf('bane', di))).toBe('done')
      expect(waiting(di)).toBe(0)
    })
    it(`${day}: an input filed after the day went out, holding a person and ALL AVAIL — 1 (D736: "one line, naming its people")`, async () => {
      oilOn(); await boot(); setBoardDay(di)
      publish(di)
      file(['bane', 'allavail'], di, yes)
      expect(waiting(di)).toBe(1)
    })
    it(`${day}: ALL AVAIL and a man added in two acts — 2`, async () => {
      oilOn(); await boot(); setBoardDay(di)
      file(['pike'], di, yes)
      publish(di)
      expect(rowPut(`${rowKey(di)}.+`, 'allavail')).toBe('done')
      expect(rowPut(`${rowKey(di)}.+`, 'split')).toBe('done')
      expect(waiting(di)).toBe(2)
    })
  }
  /* A MOVE IS ONE (owner D109, 25 Sep 26 — "A MAN MOVED FROM ONE PLACE TO ANOTHER ON THE SAME DAY IS ONE PENDING CHANGE,
     NOT TWO … a man (or a placeholder puck) taken off one place and put on another place of the SAME day pairs into one
     move, and the pending list's line reads 'Warden: MET + NOTAM BRIEF → SODB'"). Dragged from one INPUT's row to
     another's it read TWO — "taken out" of the first, "added" to the second (D736's unit, one each an input) — and the
     builder first parked that as right. He asked whether it was consistent with the rest of the app (12 Oct 26); it
     was not. Two inputs change, and it is still one act: one line, naming where he came from and where he went. */
  for (const di of [WED, SAT]) for (const who of ['split', 'allavail']) {
    const day = di === SAT ? 'a Saturday that earns' : 'a weekday'
    it(`${day}: ${who === 'allavail' ? 'ALL AVAIL' : 'a person'} dragged from one input's row to another's is ONE change waiting, said as a move; Undo — nothing (D109)`, async () => {
      oilOn(); await boot(); setBoardDay(di)
      file(['pike', who], di, di === SAT ? YES : undefined)
      expect(commitInput(null, DRAFT(di, { title: 'Second brief' }), ['rocky'], di === SAT ? { oil: YES } : undefined)).toBe(true)
      publish(di)
      expect(waiting(di)).toBe(0)
      expect(rowMove(keyOf(who, di), `${rowKey(di, 'Second brief')}.+`)).toBe('done')
      expect(waiting(di), 'one — not "taken out" and "added"').toBe(1)
      const w = pendItemWords(di, dayPendingItems(di)[0]!)
      expect([w.where, w.from, w.to], 'who, from where, to where — as a move reads everywhere else').toEqual([cs(who), TITLE, 'Second brief'])
      expect(globalUndo()).toBeTruthy()
      expect(waiting(di)).toBe(0)
    })
  }
  it('…but one person taken out of one input and ANOTHER put into a second is two acts — 2', async () => {
    oilOn(); await boot(); setBoardDay(WED)
    file(['pike', 'split'], WED)
    expect(commitInput(null, DRAFT(WED, { title: 'Second brief' }), ['rocky'])).toBe(true)
    publish(WED)
    expect(rowTake(keyOf('split', WED))).toBe('done')
    expect(rowPut(`${rowKey(WED, 'Second brief')}.+`, 'bane')).toBe('done')
    expect(waiting(WED)).toBe(2)
  })
  it('…and a move, then the man taken out of where he went: he is simply out of the first — 1, "taken out"', async () => {
    oilOn(); await boot(); setBoardDay(WED)
    file(['pike', 'split'], WED)
    expect(commitInput(null, DRAFT(WED, { title: 'Second brief' }), ['rocky'])).toBe(true)
    publish(WED)
    expect(rowMove(keyOf('split', WED), `${rowKey(WED, 'Second brief')}.+`)).toBe('done')
    expect(rowTake(keyOf('split', WED, 'Second brief'))).toBe('done')
    expect(waiting(WED)).toBe(1)
    expect(pendItemWords(WED, dayPendingItems(WED)[0]!).to).toBe('taken out')
  })

  it('THE CONTROL: a man of the crowd who files leave of his own is still his own change — and the crowd\'s with it, one line', async () => {
    oilOn(); await boot(); setBoardDay(SAT)
    file(['pike', 'allavail'], SAT, YES)
    publish(SAT)
    const n = waiting(SAT)
    CROWD.splice(CROWD.indexOf('plasma'), 1)                // somebody who is nobody's changed input drops out of the crowd
    view.afterSchedMutate()
    expect(waiting(SAT), 'that IS its own line: who stands behind the puck changed, and no input of his did').toBe(n + 1)
    CROWD.push('plasma')
  })
})

describe('T1 — HIS TWO ROUTES END THE SAME (owner, 11 Oct 26; D755 reading (a))', () => {
  /* what an input IS, less what only its history can differ in: its id and place, who filed it and when, the stamps of
     who put whom in */
  const says = (r: any) => {
    const { iid: _i, ord: _o, by: _b, at: _a, modBy: _mb, modAt: _ma, mod: _m, hand: _h, leftAt: _l, people: ppl, ...rest } = JSON.parse(JSON.stringify(r))
    return { ...rest, people: (ppl || []).map((e: any) => e.p) }
  }
  const rowSays = (di: number) => { const { rid: _r, src: _s, srcv: _v, ...rest } = JSON.parse(JSON.stringify(rowOf(di))); return rest }
  const claim = (di: number) => { const c: any = projectOilInputs(ISO[di] as string).find((x: any) => x.iid === String(inpId(rec(di)))); expect(c, 'a claim').toBeTruthy(); const { iid: _i, ...rest } = JSON.parse(JSON.stringify(c)); return rest }
  const card = (di: number) => { const it = monthItems([rec(di)], { fType: 'all', fPerson: 'all', fSearch: '' } as any)[0]!; return { names: namesOf(rec(di)), bar: barText(it, false), barPhone: barText(it, true), who: it.who, ph: it.ph } }
  const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
  const snapshot = (di: number) => ({
    input: says(rec(di)), row: rowSays(di), drawn: drawn(di), card: card(di), claim: claim(di),
    crowd: oilEvidence(di).sent[item(di)], paid: paid(di), waiting: dayPendingItems(di).length,
  })
  const route1 = () => file(['allavail'], SAT, YES)
  const route2 = () => {
    member('bane'); file(['bane'], SAT, YES); admin()
    expect(rowPut(`${rowKey(SAT)}.+`, 'allavail')).toBe('done')
    expect(rowTake(keyOf('bane', SAT))).toBe('done')
  }
  const run = async (route: () => void, published: boolean) => {
    resetWorld(); _resetTimeline()
    oilOn(); await boot(); setBoardDay(SAT)
    if (published) { sign(SAT); commitSetDayApproved(SAT, true) }
    route()
    return snapshot(SAT)
  }
  it('filed for ALL AVAIL — and filed for Ranger, ALL AVAIL dropped on its row, Ranger dragged off: the same input, row, card, bar, OIL claim and crowd', async () => {
    const a = await run(route1, false), b = await run(route2, false)
    expect(a.input.people).toEqual(['allavail'])
    expect(b).toEqual(a)
  })
  it('…and the same count of changes waiting on a day already published: one — an input filed', async () => {
    const a = await run(route1, true), b = await run(route2, true)
    expect(a.waiting).toBe(1)
    expect(b).toEqual(a)
  })
})
