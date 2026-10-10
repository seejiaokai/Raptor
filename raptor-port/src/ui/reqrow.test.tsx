// @vitest-environment jsdom
/* A REQUEST'S BOXES WRITE THE REQUEST — his D739 and D740 (10 Oct 26): "The scheduler changes the input entirely from the
   original on the schedule"; asked back with one example — "14:30 - the input changes"; and for a one-man request,
   explained with Ranger's own Training (11:00 filed, 10:15 typed on the schedule): "Yes - same rule".

   The plan: docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.4 (step 2 of its §5). Until this build a
   time, a remark or a name typed in the boxes of a request's row on the Ground Programme changed THAT ROW — the request,
   its line under Personal Inputs and the Inputs calendar kept what was filed, and the member's next edit wrote over
   what the scheduler had typed (`[REQ-ROW-OWN-BOXES]`). Now the four boxes are the request's: the typing goes to the
   request through the one door (ui/reqrow.ts reqRowText), the row is re-made from it by the rule that exists, and a
   raw write to those boxes is refused in the engine (engine/slots.ts txtSet) so no door this plan forgot can leave the
   two apart. What stays the row's own: its second man, a CX, a red box, information only (D468, D46).

   Each case drives the app's own handlers on a real saved store (the Memory backend behind the whiteboard), as
   state/p6c-requestonread.test.ts does; a "reload" is a second boot from the same store. A click and a Tab both leave
   the box through the same blur — the week's focus-out, the board's change — which is what is driven here; the two
   gestures themselves are walked in the browser. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, inpTimeText, inpLabel, isLateInput } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount, dayCurVer, daySnapOf } from '../engine/publish'
import { WARN, validate } from '../engine/validate'
import { ELOG } from '../engine/editlog'
import { txtSet, txtGet, unacceptInput } from '../engine/slots'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeText, writeFill } from '../state/store'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange, Whiteboard } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { afterSchedMutate, setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitNewInput, commitInputEdit, draftOf } from './inputedit'
import { routeFocusOut } from './textedit'
import { boardChange } from './board'
import { reqRowText } from './reqrow'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2                                            // Wed 15 Jul
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
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
  view.WARNOFF.clear()
  stashClear()
}
let groups: WbChange[][] = []
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
  groups = []
  wb.subscribe(g => groups.push(g))
  return wb
}
async function reload(be: MemoryBackend): Promise<Whiteboard> { await vi.advanceTimersByTimeAsync(1000); resetWorld(); return boot(be) }
const weekWrites = () => groups.flat().filter(c => c.collection === 'weeks').map(c => (c.value === null ? '-' : '') + c.id)
const clear = () => { groups = [] }
const rowOf = (iid: string) => ((DAYS[WED] as any).ground || []).find((g: any) => g && g.src === iid)
const riOf = (iid: string) => ((DAYS[WED] as any).ground || []).findIndex((g: any) => g && g.src === iid)
const reqOf = (iid: string) => INPUTS.find((x: any) => String(inpId(x)) === iid) as any
/* Ranger's own Training on the Wednesday, 11:00 to 12:00 — the example he was asked with */
const file = (r: any = {}): string => {
  const d: any = draftOf({ person: 'bane', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 660, e: 720, remarks: 'as filed', ...r })
  expect(commitNewInput(d)).toBe(true)
  return String(inpId(INPUTS[0]))
}
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }

/* THE WEEK'S BOX: a contenteditable cell carrying `data-txt`, left by a blur (a click away, Tab, Enter) */
function typeWeek(path: string, text: string) {
  const el = document.createElement('span')
  el.setAttribute('data-txt', path); el.textContent = text
  document.body.appendChild(el)
  routeFocusOut({ target: el } as any)
  const shown = el.textContent
  el.remove()
  return shown
}
/* THE BOARD'S BOX: an input carrying `data-bfld`, whose change event is the board's write path */
function typeBoard(path: string, text: string) {
  const el = document.createElement('input')
  el.setAttribute('data-bfld', path); el.value = text
  document.body.appendChild(el)
  boardChange({ target: el } as any)
  const shown = el.value
  el.remove()
  return shown
}
const DOORS: Array<[string, (p: string, t: string) => string | null]> = [['the week', typeWeek], ['the board', typeBoard]]

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld(); HOOKS.toast = () => {} })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('a time, a remark or a name typed on a request’s row changes the request itself (D739, D740)', () => {
  for (const [where, type] of DOORS) {
    it(`${where}: 10:15 typed on Ranger’s Training row — the request, its Personal Inputs line and the row all read 10:15, after a reload too`, async () => {
      const be = new MemoryBackend()
      await boot(be)
      const iid = file()
      const rid = rowOf(iid).rid
      clear()
      type(`gr:${WED}.${riOf(iid)}.str`, '1015')
      const r = reqOf(iid)
      expect(r.s, 'the request itself').toBe(10 * 60 + 15)
      expect(r.e, 'its end as filed').toBe(12 * 60)
      expect(inpTimeText(r, 'str'), 'what its Personal Inputs line and the Inputs calendar print').toBe('10:15')
      expect(rowOf(iid).str, 'and its row, re-made from it').toBe('10:15')
      expect(rowOf(iid).rid, 'the same row').toBe(rid)
      expect(weekWrites(), 'the request alone is written — no day row').toEqual([])
      await reload(be)
      expect(reqOf(iid).s, 'after a reload').toBe(10 * 60 + 15)
      expect(rowOf(iid).str).toBe('10:15')
    })

    it(`${where}: a remark typed on the row is the request’s remark`, async () => {
      await boot(new MemoryBackend())
      const iid = file()
      type(`gr:${WED}.${riOf(iid)}.rmks`, 'bring the range card')
      expect(reqOf(iid).remarks).toBe('bring the range card')
      expect(rowOf(iid).rmks).toBe('bring the range card')
    })

    it(`${where}: a name typed on the row becomes the input’s own title, in the letters typed (reading R1)`, async () => {
      await boot(new MemoryBackend())
      const iid = file()
      type(`gr:${WED}.${riOf(iid)}.prog`, 'Range brief')
      expect(reqOf(iid).title).toBe('Range brief')
      expect(inpLabel(reqOf(iid))).toBe('Range brief')
      expect(rowOf(iid).prog, 'the row prints it in capitals, as every request row').toBe('RANGE BRIEF')
      /* …and the kind's own name typed back takes the title away again — a name equal to the kind is no title */
      type(`gr:${WED}.${riOf(iid)}.prog`, 'training')
      expect('title' in reqOf(iid)).toBe(false)
      expect(rowOf(iid).prog).toBe('TRAINING')
    })

    it(`${where}: an unreadable time is refused — the box heals, and neither the request nor the row moves`, async () => {
      await boot(new MemoryBackend())
      const iid = file()
      const shown = type(`gr:${WED}.${riOf(iid)}.str`, 'morning')
      expect(reqOf(iid).s).toBe(11 * 60)
      expect(rowOf(iid).str).toBe('11:00')
      expect(shown, 'the box shows the time it had').toBe('11:00')
    })

    it(`${where}: a box left as it reads writes nothing — no change, no history line`, async () => {
      await boot(new MemoryBackend())
      const iid = file()
      const r = reqOf(iid), before = JSON.stringify(r), lines = ELOG.length
      type(`gr:${WED}.${riOf(iid)}.str`, '11:00')
      type(`gr:${WED}.${riOf(iid)}.rmks`, 'as filed')
      type(`gr:${WED}.${riOf(iid)}.prog`, 'TRAINING')
      expect(JSON.stringify(reqOf(iid))).toBe(before)
      expect(ELOG.length).toBe(lines)
    })
  }

  it('the manners of the Personal Inputs boxes (reading R2): a time CLEARED makes the request all day; a time typed on an all-day request fills the other end', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    typeWeek(`gr:${WED}.${riOf(iid)}.end`, '')
    expect(reqOf(iid).allday, 'cleared: all day').toBe(true)
    expect([rowOf(iid).str, rowOf(iid).end], 'the row of an all-day request has no times').toEqual(['', ''])
    typeWeek(`gr:${WED}.${riOf(iid)}.str`, '0900')
    expect(reqOf(iid).allday).toBe(false)
    expect([rowOf(iid).str, rowOf(iid).end], 'from 09:00, to the end of the day').toEqual(['09:00', '23:59'])
  })

  it('what the scheduler set on the row stays the row’s: its second man, its red box and its information-only mark (D468, D46)', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    const rid = rowOf(iid).rid
    writeFill(`g:${WED}.${riOf(iid)}.+`, 'pike')
    schedWrite(SCHED_TYPES.mutate, () => { const row = rowOf(iid); row.flag = true; row.info = true; afterSchedMutate() })
    typeWeek(`gr:${WED}.${riOf(iid)}.str`, '1015')
    const row = rowOf(iid)
    expect(row.str).toBe('10:15')
    expect({ rid: row.rid, more: row.more, flag: row.flag, info: row.info }).toEqual({ rid, more: ['pike'], flag: true, info: true })
  })

  it('ONE Undo takes the typed time back — the request and its row together', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    typeWeek(`gr:${WED}.${riOf(iid)}.str`, '1015')
    expect(reqOf(iid).s).toBe(615)
    globalUndo()
    expect(reqOf(iid).s, 'the request as filed').toBe(660)
    expect(rowOf(iid).str, 'and its row').toBe('11:00')
  })

  it('on a PUBLISHED day the typed time is ONE change waiting, and the issued face keeps the time it went out with (D178)', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    publish(WED)
    expect(dayShownPendCount(WED), 'published clean').toBe(0)
    typeWeek(`gr:${WED}.${riOf(iid)}.str`, '1015')
    expect(dayShownPendCount(WED)).toBe(1)
    const issued = daySnapOf(WED, dayCurVer(WED)).d.ground.find((g: any) => g && g.src === iid)
    expect(issued.str, 'the issued version').toBe('11:00')
    expect(rowOf(iid).str, 'the working copy').toBe('10:15')
  })

  it('it never makes an on-time request read LATE (D741) — where the same change in the input’s own window does', async () => {
    await boot(new MemoryBackend())
    vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0))          // filed on 1 Jun, in good time
    const iid = file(), other = file({ person: 'pike' })
    expect(isLateInput(reqOf(iid))).toBe(false)
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))         // the day before: long past any cut-off
    const filed = reqOf(iid).mod
    typeWeek(`gr:${WED}.${riOf(iid)}.str`, '1015')
    expect(reqOf(iid).s).toBe(615)
    expect(reqOf(iid).mod, 'the late date is as it was').toBe(filed)
    expect(isLateInput(reqOf(iid))).toBe(false)
    expect(commitInputEdit(reqOf(other), { ...draftOf(reqOf(other)), sTime: '10:15' }), 'THE CONTROL: the window').toBe(true)
    expect(isLateInput(reqOf(other))).toBe(true)
  })

  it('`[REQ-ROW-SELF-CLASH]`: times typed on an ALL-DAY request’s row make the request timed — its man is not flagged against his own row', async () => {
    await boot(new MemoryBackend())
    const iid = file({ allday: true })
    expect([rowOf(iid).str, rowOf(iid).end]).toEqual(['', ''])
    typeWeek(`gr:${WED}.${riOf(iid)}.str`, '0900')
    typeWeek(`gr:${WED}.${riOf(iid)}.end`, '1000')
    const r = reqOf(iid)
    expect([r.allday, r.s, r.e]).toEqual([false, 540, 600])
    validate()
    const his = (WARN.all as any[]).filter(w => /Training but tasked/.test(String(w.msg || '')) && (w.who || []).includes('bane'))
    expect(his.map(w => w.msg), 'no "Training but tasked — TRAINING" for his own request').toEqual([])
  })
})

describe('the door and the belt — one rule for every writer (the plan §4.4)', () => {
  it('the door answers three ways: not a request’s box, saved, refused', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    expect(reqRowText(`fr:0.0.0.0`, 'x'), 'a flying line’s remark is not a request’s box').toBe('none')
    expect(reqRowText(`gr:${WED}.${riOf(iid)}.str`, '1015')).toBe('saved')
    expect(reqRowText(`gr:${WED}.${riOf(iid)}.str`, 'soon')).toBe('refused')
    expect(reqOf(iid).s).toBe(615)
  })

  it('the store’s own text writer goes through the door too — it changes the request, never the row alone', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    writeText(`gr:${WED}.${riOf(iid)}.str`, '07:00')
    expect(reqOf(iid).s).toBe(7 * 60)
    expect(rowOf(iid).str).toBe('07:00')
  })

  it('THE BELT: a raw write to a standing request’s row — its name, a time, its remark — is refused: nothing written, no mark', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    const ri = riOf(iid), marks = JSON.stringify(SCHED.pending)
    for (const [f, v] of [['str', '07:00'], ['end', '13:00'], ['rmks', 'RAW'], ['prog', 'RAW']] as const) {
      expect(txtSet(`gr:${WED}.${ri}.${f}`, v), f).toBe(false)
    }
    const row = rowOf(iid)
    expect([row.prog, row.str, row.end, row.rmks]).toEqual(['TRAINING', '11:00', '12:00', 'as filed'])
    expect(JSON.stringify(SCHED.pending)).toBe(marks)
    expect(reqOf(iid).s, 'and the request is as filed').toBe(660)
  })

  it('…and it refuses NOTHING else: a hand-built row, a row whose request is gone, a taken-off request’s row and a `kept` row are written as before', async () => {
    await boot(new MemoryBackend())
    const iid = file()
    const g = (DAYS[WED] as any).ground as any[]
    /* a row the scheduler built by hand */
    g.push({ prog: 'BRIEF', str: '', end: '', who: '', rmks: '', rid: 'hb1' })
    expect(txtSet(`gr:${WED}.${g.length - 1}.str`, '0800')).toBe(true)
    /* a dead row: its request is gone, the version's row kept on the day (D363) */
    g.push({ prog: 'MEETING', str: '09:00', end: '10:00', who: 'pike', rmks: '', src: 'gone1', srcv: 'x', kept: true, rid: 'kp1' })
    expect(txtSet(`gr:${WED}.${g.length - 1}.rmks`, 'still his to type')).toBe(true)
    expect(txtGet(`gr:${WED}.${g.length - 1}.rmks`)).toBe('still his to type')
    /* a request taken off the programme whose row stands again (a version loaded, a plan switched in) */
    const r = reqOf(iid)
    const kept = { ...rowOf(iid) }
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(WED, r); afterSchedMutate() })
    expect(r.acc).toBe('r')
    ;(DAYS[WED] as any).ground.push(kept)
    const ri = (DAYS[WED] as any).ground.indexOf(kept)
    expect(reqRowText(`gr:${WED}.${ri}.str`, '0700'), 'the door leaves it to the row').toBe('none')
    expect(txtSet(`gr:${WED}.${ri}.str`, '0700')).toBe(true)
    expect(r.s, 'the request taken off is not changed by it').toBe(660)
  })
})
