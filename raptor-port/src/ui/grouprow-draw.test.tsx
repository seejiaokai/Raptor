// @vitest-environment jsdom
/* AN INPUT'S ROW, AS EVERY SCREEN DRAWS IT ([ALL-AVAIL-AS-MEMBER] step 2 (b); the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3). His rulings:
   D755 — "a row that came from an input IS the input: whoever stands on it … is in the input";
   D756 — an input is ONE record with the list of its people, so its row is ONE ground row;
   D743 — the ten pictures of the one row, approved as drawn; D727 — an input's people are named A to Z;
   D605 — a man on leave that day is flagged on his puck; D717 — the kind kept in sight under a titled row's name;
   D762 — one OIL answer an input, and only the scheduler leaves one person out, in OIL Earn;
   D737 — on the Unavailable list an input for several stays a row a man.

   An input filed for four is one record and lands one row: the first to join in its name box, the others under it. Every
   builder that draws a ground row — Edit Schedule's week, View-only Sched, the next-week peek, the Scheduler Board and
   its OIL Earn mode — draws that ONE row: its pucks, each on the key of the PLACE it stands on (`g:di.ri`,
   `g:di.ri.xN`), so its flag, its amendment mark, its OIL bar and switch and a tap or a drag on it are that place's;
   one "+ add"; and on the board one name box, one pair of time boxes, one remark box, one set of buttons, one grip.
   In OIL Earn each puck is its own switch under the INPUT's one item (`i:<iid>`).

   IT REPLACES the `[GROUP-INPUT-ONE-ROW]` step 4 file of this name (D661 — one ground row a man, tied by an entry mark
   and DRAWN as one: the lead drew the row, each puck kept ITS OWN ROW's key). Every screen of that file is here, on
   the one record filed by `commitInput`. What changed, and what is gone:
   - "each puck addressed by its own row" → each puck on the key of its own PLACE on the one row;
   - "in OIL Earn each puck is switched under ITS OWN request" → under the input's one item: one item, not one a man;
   - "an extra on a member's row — a placeholder — is drawn after the people, with its own place's key": a placeholder
     BESIDE named people cannot be made through the doors until step 3 of the build (D753) — the puck on its own
     place's key is pinned here for an input filed for ALL AVAIL alone; "after the people" is pinned on the pure
     answer (engine/grouprows.test.ts) and waits for step 3 on the screens;
   - "rows whose marks differ are drawn apart: a CX on one man's row alone is his own row" (D735) — RETIRED: there is
     one row, so one set of marks; what is left of it is pinned as "a CX is the row's — nobody is drawn apart";
   - "leadKeyOf — a member row's text box and its '+ add' go to the lead's" — RETIRED: no row is left undrawn; every
     ground key is its own (pinned as changed);
   - "entryLines: the records of one entry in one filing state are one line … split by where each request is filed" —
     RETIRED (step 2 (g)): one record has ONE filing, so there is nothing to split; the line is the record's people;
   - "a line under Personal Inputs: any of its people's inputs resolves to the line's first" — RETIRED: a line is one
     record with one id; every `iu:` key is its own (pinned as changed).
   Personal Inputs' one line and the Unavailable list's row a man (D737) are here on the one record too.
   THE ORDER the pucks are drawn in — A to Z, the one answer of engine/grouprows.ts rowPeopleDrawn — has a block of its
   own, a case a surface, apart from "which pucks, on which keys": so a surface that draws the right people in another
   order fails on the order alone.
   The geometry — two pucks across on a desktop, stacked on a phone, the two times together — is a browser test
   (e2e/grouprow.spec.ts): jsdom has no layout.
   Behaviour register: GI5. */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { inputItemKey } from '../engine/oil'
import { rowPeopleDrawn } from '../engine/grouprows'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay, PIOPEN, setOilDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, commitNewInput, draftOf } from './inputedit'
import { dayHTML, lSeat } from './html'
import { boardHTML } from './board'
import { peekDayHTML } from './peek'
import { leadKeyOf } from './grouprow'
import * as pops from './pops'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS), PSNAP = JSON.stringify(PEOPLE)
const W1 = '13/07/2026'
const WED = 2, SAT = 5
const SAT_ISO = '2026-07-18'
const toast = HOOKS.toast
const HK = { earn: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO }

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
  PIOPEN.delete(WED); PIOPEN.delete(SAT); setOilDay(null)
  stashClear()
}
/* a real saved store, as ui/reqdoor.test.tsx boots it: the input is filed through its own door and its row is worked
   out from it after the command, as in the app */
async function boot(be: MemoryBackend) {
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
}

const doc = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const cs = (id: string) => String((PEOPLE as any)[id].cs)
const az = (ids: string[]) => ids.slice().sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
const TITLE = 'Range safety brief', UP = TITLE.toUpperCase()
const dateOf = (di: number) => (di === SAT ? 'Jul 18' : 'Jul 15')
const FOUR = ['split', 'bane', 'vinci', 'pike']                 // joined out of A-to-Z order on purpose: Vandal, Ranger, Zenith, Nomad
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di === SAT ? 'Duty' : 'Meeting', title: TITLE, date: dateOf(di), yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your logbook' }), ...over })
/* ONE input for these people, in this order — the one writer (ui/inputedit.tsx commitInput) */
const file = (people: string[], di = WED, oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(di, over), people, oil ? { oil } : undefined)).toBe(true)
const rec = (di = WED, title = TITLE) => { const l = INPUTS.filter((x: any) => x.title === title && x.date === dateOf(di)) as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(di, title))))
const rowKey = (di = WED, title = TITLE) => `g:${di}.${riOf(di, title)}`
/* the place a person stands on, on the input's row: its name box, or his place under it */
const keyOf = (p: string, di = WED, title = TITLE) => { const r = ground(di)[riOf(di, title)], k = rowKey(di, title); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
const weekRows = (ed: boolean, di = WED, name = UP) => [...doc(dayHTML(di, ed)).querySelectorAll('.sec-grnd .pl-row')].filter(r => (r.textContent || '').includes(name)) as HTMLElement[]
const boardRows = (di = WED, name = UP) => [...doc(boardHTML(di)).querySelectorAll('.sb-panel.grnd .sb-arow')].filter(r => r.outerHTML.includes(name)) as HTMLElement[]
const peekRows = (d: any, di = WED) => [...doc(peekDayHTML(d, di, false)).querySelectorAll('.pl-row')].filter(r => (r.textContent || '').includes(UP)) as HTMLElement[]
/* the input's line under Personal Inputs, on the week and on the board */
const piWeek = (di = WED) => [...doc(dayHTML(di, true)).querySelectorAll('.pl-row[data-inprow]')].filter(r => (r.textContent || '').includes(TITLE)) as HTMLElement[]
const piBoard = (di = WED) => [...doc(boardHTML(di)).querySelectorAll('.sb-panel.pinp .inprow')].filter(r => r.outerHTML.includes(TITLE)) as HTMLElement[]
const slots = (row: Element) => [...row.querySelectorAll('.ppl [data-slot]')].map(s => (s as HTMLElement).dataset.slot!)
/* who the row draws on each place: `<id>@<key>` */
const seated = (row: Element) => [...row.querySelectorAll('.ppl [data-slot]')].map(s => `${(s.querySelector('[data-person]') as HTMLElement).dataset.person}@${(s as HTMLElement).dataset.slot}`)
const names = (row: Element) => [...row.querySelectorAll('.ppl .puck')].map(p => p.querySelector('.nm')!.textContent)
const placed = (people: string[], di = WED) => people.map(p => `${p}@${keyOf(p, di)}`)
/* the Saturday earns (in the app the Leave War says so — here the two hooks it answers through) */
const saturdayEarns = () => { HOOKS.oilEarningDay = (di: number) => di === SAT; HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15') }

beforeEach(async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0))
  resetWorld(); HOOKS.toast = () => {}
  await boot(new MemoryBackend())
  validate()
})
afterEach(() => {
  HOOKS.toast = toast; HOOKS.oilEarningDay = HK.earn; HOOKS.oilDayISO = HK.iso
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null
})

describe('the pucks of the one row — the one answer every builder reads (rowPeopleDrawn, on the day as filed)', () => {
  it('an input for four lands ONE row; its people A to Z by callsign, every puck on the key of the place it stands on', () => {
    file(FOUR); validate()
    expect(ground().filter((g: any) => g.src === String(inpId(rec())))).toHaveLength(1)
    expect([ground()[riOf()].who, ground()[riOf()].more], 'stored in the order they joined').toEqual(['split', ['bane', 'vinci', 'pike']])
    const ppl = rowPeopleDrawn(DAYS[WED], WED, riOf())
    expect(ppl.map(p => p.id)).toEqual(az(FOUR))
    expect(ppl.map(p => `${p.id}@${p.key}`)).toEqual(placed(az(FOUR)))
    expect(ppl.map(p => p.key).sort()).toEqual([rowKey(), `${rowKey()}.x0`, `${rowKey()}.x1`, `${rowKey()}.x2`])
  })
})

describe('Edit Schedule’s week', () => {
  it('ONE row for the four — each puck on the key of its own place; one "+ add"; the row’s own boxes', () => {
    file(FOUR); validate()
    const rows = weekRows(true)
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(seated(row).sort(), 'the four, each on the place he stands on').toEqual(placed(FOUR).sort())
    expect(row.querySelector('.ppl')!.getAttribute('data-fill')).toBe(`${rowKey()}.+`)
    expect(row.querySelectorAll('.addz')).toHaveLength(1)
    expect(row.querySelector('.ppl')!.classList.contains('one'), 'several pucks: not the one-puck cell').toBe(false)
    expect(row.querySelector('[data-txt$=".prog"]')!.getAttribute('data-txt')).toBe(`gr:${WED}.${riOf()}.prog`)
    expect(row.querySelector('.nm-kind')!.textContent, 'the kind kept in sight under the title (D717)').toBe('Meeting')
  })
  it('each puck is the very puck its own place would draw — so a man on leave that day is flagged on the one row (D605)', () => {
    file(FOUR); validate()
    const flagged = (p: string) => /\bhard\b|\bwarn\b|\bsoft\b|flag|sev/.test(doc(lSeat(WED, p, keyOf(p), true)).querySelector('.puck')!.className)
    expect(flagged('bane'), 'Ranger, before his leave: no flag').toBe(false)
    expect(commitNewInput(draftOf({ person: 'bane', type: 'LL', date: 'Jul 15', yr: 2026, allday: true, remarks: '' })), 'his leave that day').toBe(true)
    validate()
    const html = weekRows(true)[0]!.outerHTML
    for (const p of FOUR) expect(html, cs(p)).toContain(doc(lSeat(WED, p, keyOf(p), true)).innerHTML)
    expect(flagged('bane'), 'the man on leave wears his flag').toBe(true)
  })
  it('ten people: one row, ten pucks', () => {
    const ten = Object.keys(PEOPLE).filter(id => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].archived).slice(0, 10)
    file(ten); validate()
    expect(idsOf(rec()), 'one record holding the ten').toHaveLength(10)
    const rows = weekRows(true)
    expect(rows).toHaveLength(1)
    expect(slots(rows[0]!)).toHaveLength(10)
    expect(new Set(slots(rows[0]!)).size, 'ten places, no key twice').toBe(10)
  })
  it('an input filed for ALL AVAIL alone: the placeholder puck is drawn on its own place’s key', () => {
    file(['allavail']); validate()
    expect(idsOf(rec())).toEqual(['allavail'])
    const rows = weekRows(true)
    expect(rows).toHaveLength(1)
    expect(seated(rows[0]!)).toEqual([`allavail@${rowKey()}`])
    expect(rowPeopleDrawn(DAYS[WED], WED, riOf()).map(p => `${p.id}@${p.key}`)).toEqual([`allavail@${rowKey()}`])
  })
  it('a CX is the row’s — one row, one set of marks: nobody is drawn apart', () => {
    file(FOUR)
    ground()[riOf()].cx = true; ground()[riOf()].cxr = 'WX'; validate()
    const rows = weekRows(true)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.classList.contains('cx')).toBe(true)
    expect(slots(rows[0]!)).toHaveLength(4)
  })
  it('an ordinary one-person request beside it is the row it always was', () => {
    file(FOUR)
    expect(commitNewInput(draftOf({ person: 'ignite', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo check' }))).toBe(true)
    validate()
    const solo = INPUTS.find((x: any) => x.remarks === 'solo check') as any
    const ri = ground().findIndex((g: any) => g && g.src === String(inpId(solo)))
    const row = [...doc(dayHTML(WED, true)).querySelectorAll('.sec-grnd .pl-row')].find(r => /solo check/.test(r.textContent || ''))!
    expect(slots(row)).toEqual([`g:${WED}.${ri}`])
    expect(row.querySelector('.ppl')!.classList.contains('one')).toBe(true)
    expect(weekRows(true), 'and the four are still one row').toHaveLength(1)
  })
})

describe('View-only Sched and the next-week peek', () => {
  it('View-only Sched: one row, the four pucks, nothing to type in', () => {
    file(FOUR); validate(); setPage('sched')
    const rows = weekRows(false)
    expect(rows).toHaveLength(1)
    expect(names(rows[0]!).slice().sort()).toEqual(FOUR.map(cs).sort())
    expect(seated(rows[0]!).sort()).toEqual(placed(FOUR).sort())
    expect(rows[0]!.querySelector('[contenteditable]')).toBeNull()
    expect(rows[0]!.querySelector('.addz'), 'and no "+ add"').toBeNull()
  })
  it('the next-week peek: one row for the four, read off the rows alone', () => {
    file(FOUR)
    const d = JSON.parse(JSON.stringify(DAYS[WED]))
    INPUTS.length = 0                                      // the peek never looks an input up
    const rows = peekRows(d)
    expect(rows).toHaveLength(1)
    expect(names(rows[0]!).slice().sort()).toEqual(FOUR.map(cs).sort())
  })
})

describe('the Scheduler Board', () => {
  it('ONE row: one name box, one pair of time boxes, one remark box, one set of buttons, one grip — and the four pucks, each on its own place’s key', () => {
    file(FOUR); validate()
    const rows = boardRows()
    expect(rows).toHaveLength(1)
    const row = rows[0]!, at = `${WED}.${riOf()}`
    expect([...row.querySelectorAll('[data-bfld]')].map(b => (b as HTMLElement).dataset.bfld)).toEqual(['prog', 'str', 'end', 'rmks'].map(f => `gr:${at}.${f}`))
    expect(seated(row).sort()).toEqual(placed(FOUR).sort())
    for (const b of ['grcx', 'grinfo', 'grflag', 'grdel']) {
      expect(row.querySelectorAll(`[data-${b}]`), b).toHaveLength(1)
      expect(row.querySelector(`[data-${b}]`)!.getAttribute(`data-${b}`), b).toBe(at)
    }
    expect(row.querySelectorAll('.sb-grip')).toHaveLength(1)
    expect(row.querySelector('.ppl')!.getAttribute('data-fill')).toBe(`g:${at}.+`)
    expect(row.querySelectorAll('.addz')).toHaveLength(1)
  })
  it('in OIL Earn each puck is its own switch, under the INPUT’s one item — never one item a man (D762)', () => {
    saturdayEarns()
    file(FOUR, SAT, { [SAT_ISO]: 0.5 }); validate()
    setBoardDay(SAT); setOilDay(SAT)
    const rows = boardRows(SAT)
    expect(rows, 'the one row, in the mode').toHaveLength(1)
    const taps = [...rows[0]!.querySelectorAll('[data-oilp]')] as HTMLElement[]
    expect(taps.map(t => t.dataset.oilp!).sort(), 'a switch a person').toEqual(FOUR.slice().sort())
    expect(taps.map(t => t.dataset.oilitem), 'all under the input’s own item').toEqual(FOUR.map(() => inputItemKey(inpId(rec(SAT)))))
    expect(taps.map(t => t.dataset.oilday)).toEqual(FOUR.map(() => String(SAT)))
    expect(rows[0]!.querySelectorAll('[data-oilitem]:not([data-oilp])'), 'and no switch for the whole row: its name is not one').toHaveLength(0)
  })
})

/* ONE ORDER ON EVERY SURFACE (the plan §4.3: "Drawn in one order on every surface … ONE helper, so no two surfaces
   differ"; D727): the named people A to Z by callsign, as the one row drew them before the build (D743's pictures) —
   never the order they happened to join in. Each puck still on the key of its own place. */
describe('the pucks are drawn A to Z on every surface — the order rowPeopleDrawn answers (D727; the plan §4.3)', () => {
  it('Edit Schedule’s week', () => {
    file(FOUR); validate()
    expect(seated(weekRows(true)[0]!)).toEqual(placed(az(FOUR)))
  })
  it('View-only Sched', () => {
    file(FOUR); validate(); setPage('sched')
    expect(names(weekRows(false)[0]!)).toEqual(az(FOUR).map(cs))
  })
  it('the next-week peek', () => {
    file(FOUR)
    expect(names(peekRows(JSON.parse(JSON.stringify(DAYS[WED])))[0]!)).toEqual(az(FOUR).map(cs))
  })
  it('the Scheduler Board', () => {
    file(FOUR); validate()
    expect(seated(boardRows()[0]!)).toEqual(placed(az(FOUR)))
  })
  it('the Scheduler Board in OIL Earn', () => {
    saturdayEarns()
    file(FOUR, SAT, { [SAT_ISO]: 0.5 }); validate()
    setBoardDay(SAT); setOilDay(SAT)
    expect(([...boardRows(SAT)[0]!.querySelectorAll('[data-oilp]')] as HTMLElement[]).map(t => t.dataset.oilp)).toEqual(az(FOUR))
  })
  it('the input’s line under Personal Inputs — on the week and on the board', () => {
    file(FOUR); validate(); PIOPEN.add(WED)
    expect(names(piWeek()[0]!), 'the week').toEqual(az(FOUR).map(cs))
    expect(names(piBoard()[0]!), 'the board').toEqual(az(FOUR).map(cs))
  })
})

/* ---- PERSONAL INPUTS AND THE UNAVAILABLE LIST (step 2 (g) of the build; the plan §4.5, §4.6). The input is one record:
   under Personal Inputs it is ONE line with a puck a person and one Undo / Accept — one record has one filing; the
   Unavailable list stays a row a man (D737), each row with an address of its own. ---- */
describe('Personal Inputs — one line for the input, a puck a person', () => {
  it('the week, folded: the input of four counts ONCE — one more input, one more on the programme', () => {
    const count = () => { const h = doc(dayHTML(WED, true)).querySelector('.sub-h.pl-fold .pl-hint'); const m = h && /(\d+) inputs?(?: · (\d+) on programme)?/.exec(h.textContent || ''); return m ? [+m[1]!, +(m[2] || 0)] : [0, 0] }
    const [n0, g0] = count()
    file(FOUR); validate()
    expect(count(), 'ONE input, once on the programme').toEqual([n0 + 1, g0 + 1])
  })
  it('the week, opened: one line, four pucks, one Undo', () => {
    file(FOUR); validate(); PIOPEN.add(WED)
    const lines = piWeek()
    expect(lines).toHaveLength(1)
    expect(names(lines[0]!).slice().sort()).toEqual(FOUR.map(cs).sort())
    expect(lines[0]!.querySelector('.ppl')!.classList.contains('one')).toBe(false)
    expect(lines[0]!.querySelectorAll('[data-acc]')).toHaveLength(1)
    expect(lines[0]!.querySelector('.nm-kind')!.textContent, 'the kind kept in sight (D717)').toBe('Meeting')
  })
  it('the board, opened: one line, four pucks, one Undo', () => {
    file(FOUR); validate(); PIOPEN.add(WED)
    const lines = piBoard()
    expect(lines).toHaveLength(1)
    expect(names(lines[0]!).slice().sort()).toEqual(FOUR.map(cs).sort())
    expect(lines[0]!.querySelectorAll('[data-acc]')).toHaveLength(1)
  })
})

describe('the Unavailable list is left as it is — a row a man (D737)', () => {
  const odRows = (html: string, sel: string) => [...doc(html).querySelectorAll(sel)].filter(r => r.outerHTML.includes('det')) as HTMLElement[]
  it('an overseas duty filed for three — ONE record — is three rows there, a puck each, each with an address of its own; on the week and on the board', () => {
    expect(commitInput(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'det' }), ['bane', 'pike', 'rocky'])).toBe(true)
    validate()
    const od = INPUTS.filter((x: any) => x.type === 'OD' && x.remarks === 'det') as any[]
    expect(od, 'one record').toHaveLength(1)
    expect(idsOf(od[0])).toEqual(['bane', 'pike', 'rocky'])
    for (const [where, rows] of [['the week', odRows(dayHTML(WED, true), '.pl-row[data-inprow]')], ['the board', odRows(boardHTML(WED), '[data-inprow]')]] as const) {
      expect(rows, where).toHaveLength(3)
      expect(rows.map(r => [...r.querySelectorAll('.ppl [data-person]')].map(p => (p as HTMLElement).dataset.person)), where).toEqual([['bane'], ['pike'], ['rocky']])
      const at = rows.map(r => r.dataset.inprow!)
      expect(new Set(at).size, `${where}: three addresses`).toBe(3)
      expect(at.every(a => a.startsWith(String(inpId(od[0])))), `${where}: each names the one input`).toBe(true)
    }
  })
  it('three records saved before the build with one group id are three rows there too — each a one-person input', () => {
    for (const p of ['bane', 'pike', 'vinci']) INPUTS.push({ iid: 'od_' + p, person: p, grp: 'g2', grpBy: 'stiff', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'det' })
    validate()
    expect(odRows(dayHTML(WED, true), '.pl-row[data-inprow^="od_"]')).toHaveLength(3)
    expect(odRows(boardHTML(WED), '[data-inprow^="od_"]')).toHaveLength(3)
  })
})

describe('leadKeyOf — every place is its own: no row is left undrawn, and no line gathers records', () => {
  it('a ground row’s text box, its "+ add" and its pucks all come back unchanged', () => {
    file(FOUR)
    const at = `${WED}.${riOf()}`
    for (const k of [`gr:${at}.str`, `gr:${at}.prog`, `g:${at}.+`, `g:${at}`, `g:${at}.x0`, `g:${at}.x2`, 'fr:0.0.0.0', `gr:${WED}.99.str`]) expect(leadKeyOf(k), k).toBe(k)
  })
  it('an `iu:` key is its own too — the one record’s, one man’s row of it, a record saved before the build with a group id, one that is gone', () => {
    file(FOUR)
    for (const p of ['rocky', 'ignite']) INPUTS.push({ iid: 'gi_' + p, person: p, grp: 'g1', grpBy: 'stiff', type: 'Meeting', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: '' })
    const id = String(inpId(rec()))
    for (const k of [`iu:${id}`, `iu:${id}~pike`, 'iu:gi_rocky', 'iu:gi_ignite', 'iu:nobody']) expect(leadKeyOf(k), k).toBe(k)
  })
})
