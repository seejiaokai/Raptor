// @vitest-environment jsdom
/* BREAK TESTS — the Scheduler Board's builders (ui/board-html.ts), the wires the one-rule job's break tests found NO
   test on (docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 1; the checking guide §8.4): each
   case here was RED with its wire broken on purpose and is green with the build as it stands. The week's twin of this
   file is ui/html.wire.test.tsx.

   Wire 8 — THE SANS AVAILABILITY PANEL IS A CARD A MAN (the roll-call's row 6, "a face a man"): a SANS commitment an
   admin files for several SANS people at once (D658) is one record, and the board's "SANS Avail" panel must still draw
   every man in it. With `sbSansPanel` drawing only the first face of each record (`facesOf(r).slice(0, 1)`), every
   test of the suite stayed green: the panel was only ever tested with one-person inputs.

   Booted as ui/grouprow-draw.test.tsx boots it: a real saved store, the input filed through its one writer
   (ui/inputedit.tsx commitInput), the day drawn by the board's own builder. */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
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
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf } from './inputedit'
import { boardHTML } from './board'
import * as pops from './pops'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS), PSNAP = JSON.stringify(PEOPLE)
const W1 = '13/07/2026'
const WED = 2
const toast = HOOKS.toast

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

beforeEach(async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0))
  resetWorld(); HOOKS.toast = () => {}
  await boot(new MemoryBackend())
  validate()
})
afterEach(() => {
  HOOKS.toast = toast
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null
})

describe('wire 8 — the board’s SANS availability panel: a card a man of an input that holds several (D658; the roll-call’s row 6)', () => {
  it('a SANS commitment an admin files for three SANS people — ONE record — is three cards in "SANS Avail", a puck each, each opening the one input', () => {
    /* three SANS people with no SANS commitment that Wednesday yet, so every card of theirs is this input's */
    const before = [...doc(boardHTML(WED)).querySelectorAll('.sb-panel.sansav .sanscard [data-person]')].map(p => String((p as HTMLElement).dataset.person))
    const sans = Object.keys(PEOPLE).filter(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !before.includes(id)).slice(0, 3)
    expect(sans, 'three SANS people on the roster').toHaveLength(3)
    expect(commitInput(null, draftOf({ person: sans[0], type: 'SANS Availability', date: 'Jul 15', yr: 2026, allday: true, sans: { f: true }, remarks: 'wire eight' }), sans)).toBe(true)
    validate()
    const made = INPUTS.filter((x: any) => x.type === 'SANS Availability' && x.remarks === 'wire eight') as any[]
    expect(made, 'one record').toHaveLength(1)
    expect(idsOf(made[0])).toEqual(sans)
    const cards = [...doc(boardHTML(WED)).querySelectorAll('.sb-panel.sansav .sanscard')].filter(c => (c.textContent || '').includes('wire eight')) as HTMLElement[]
    expect(cards, 'a card a man').toHaveLength(3)
    expect(cards.map(c => (c.querySelector('[data-person]') as HTMLElement).dataset.person).sort(), 'every man of the input has his card').toEqual(sans.slice().sort())
    expect(cards.every(c => c.dataset.inpedit === String(inpId(made[0]))), 'each card opens the one input').toBe(true)
  })
})
