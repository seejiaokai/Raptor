// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 4.3 (plan §2.5's matrix, §3 phase 4.3; Fable F2-01/F2-02, Astra R2-06) — THE CHANGE
   HISTORY, ONE STORED ROW PER LINE, WRITTEN INSIDE THE COMMAND THAT MADE IT.

   It was ONE record (`settings/elog`, up to 2,000 lines) rewritten on every logged change, by a save queued on the
   microtask queue — AFTER the command's group had been sent, so a line was never in its command's group and never named
   by its batch (another person's screen would learn of a change and never of its history line). Now:
   - each line is `settings/elog:<lineId>`, written the moment the line is KEPT (the command's latched effect, inside its
     open group) — one user edit is ONE group: its rows, every line it logged and one batch; nothing lands after;
   - the line's place is (at, lineId) — `at` its wall clock, `lineId` minted per page life and rising — the same order on
     every reload and on every client; its in-memory number (`seq`) is only its place in the loaded list, never stored;
   - the 2,000 cap deletes the oldest line in the same group; a boot loads the newest 2,000 in that order;
   - a line written with no command running (an idle toggle) is still its own saved group with a batch, never bare;
   - the Admin → Data history sweep is ONE named command deleting exact lines, with its own line, in one group;
   - an Undo / Redo line, and a discard's lines, ride the command that caused them (F2-03);
   - "seen" is one row per person, `settings/seen:<pid>` = { upto: {at, lineId} | null, extra: lineId[] }, and an
     account's `seenFrom` a position in the same order (F2-02). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SCHEMA_VERSION } from '../storage/reset'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { ELOG, elogClear, logAction, elogRemap, elogLoad } from '../engine/editlog'
import { initStore, weekStashSnap, weekDirty, writeInputs, resetSession } from './store'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import type { Change as WbChange } from '../storage/whiteboard'
import { commit } from '../command'
import { signIn, sessionFor, addAccount, ACCOUNTS_LIST } from './accounts'
import { markSeen, isNewToMe, changesLoad } from './changes'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { clearEditHistory } from '../ui/inputedit'
import { PEOPLE } from '../engine/people'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const ROW = (remarks: string) => ({ person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks, mod: '2026-07-01' })
const as = (u: string, p: string) => resetSession(sessionFor(signIn(u, p) as any))
function resetWorld() {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  stashClear(); elogClear()
}
beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetSession(null); storeBackend.impl = null; ELOG.cap = 2000; resetWorld() })

let groups: WbChange[][] = []
async function boot(be = new MemoryBackend()) {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const { wb } = await bootStorage(be)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetTimeline(); installGlobalUndo()
  await vi.advanceTimersByTimeAsync(600)
  groups = []
  wb.subscribe(g => groups.push(g))
  return { be, wb }
}
const lineRows = (g: WbChange[]) => g.filter(c => c.collection === 'settings' && c.id.startsWith('elog:'))
const batchOf = (g: WbChange[]) => { const b = g.filter(c => c.collection === 'changes' && c.value !== null); expect(b).toHaveLength(1); return JSON.parse(b[0]!.value!) }
const drain = () => vi.advanceTimersByTimeAsync(0)

describe('one line, one row, inside its command', () => {
  it('one user edit is ONE group — its rows, every line it logged, one batch naming them all — and nothing after', async () => {
    const { wb } = await boot()
    as('ad', 'a')
    expect(writeInputs(() => { INPUTS.push(ROW('ONE')) })).toBe(true)
    await drain()
    expect(groups).toHaveLength(1)
    const g = groups[0]!
    const lines = lineRows(g)
    expect(lines.length).toBeGreaterThan(0)
    expect(g.some(c => c.collection === 'inputs')).toBe(true)
    const keys = batchOf(g).items.map((i: any) => i.key)
    for (const l of lines) expect(keys).toContain(`settings/${l.id}`)
    expect(wb.has('settings', 'elog'), 'the old whole-history record is never written').toBe(false)
    /* the row is the line: its identity is in its key and its value; its in-memory number is not stored */
    const kept = ELOG.rows[ELOG.rows.length - 1]!
    const stored = JSON.parse(wb.get('settings', `elog:${kept.lineId}`)!)
    expect(stored.lineId).toBe(kept.lineId)
    expect(stored.lbl).toBe(kept.lbl)
    expect(stored.pid).toBe('stiff')
    expect('seq' in stored).toBe(false)
  })

  it('a refused command leaves no line and no row', async () => {
    await boot()
    as('ad', 'a')
    const r = commit({ type: 'sched.mutate', scope: { module: 'sched' }, apply: () => { logAction(0, 'Line removed'); throw new Error('refused') } } as any)
    expect((r as any).ok).toBe(false)
    await drain()
    expect(ELOG.rows).toHaveLength(0)
    expect(groups).toEqual([])
  })

  it('a line written with no command running is still its own saved group, with a batch', async () => {
    await boot()
    as('ad', 'a')
    logAction(0, 'OIL earning switched off for Ranger')
    await drain()
    expect(groups).toHaveLength(1)
    expect(lineRows(groups[0]!)).toHaveLength(1)
    expect(batchOf(groups[0]!).items.map((i: any) => i.table)).toEqual(['EditLog'])
  })

  it('the cap deletes the oldest line in the same group that adds the newest', async () => {
    await boot()
    as('ad', 'a')
    ELOG.cap = 2
    logAction(0, 'a'); logAction(0, 'b')
    const oldest = ELOG.rows[0]!.lineId
    groups = []
    logAction(0, 'c')
    await drain()
    expect(groups).toHaveLength(1)
    const g = groups[0]!
    expect(lineRows(g).filter(c => c.value === null).map(c => c.id)).toEqual([`elog:${oldest}`])
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['b', 'c'])
  })
})

describe('the order is (at, lineId), on every reload and every client', () => {
  it('a reload loads the lines in order and numbers them afresh', async () => {
    const { be } = await boot()
    as('ad', 'a')
    logAction(0, 'one'); vi.advanceTimersByTime(5); logAction(1, 'two'); vi.advanceTimersByTime(5); logAction(2, 'three')
    await vi.advanceTimersByTimeAsync(300)
    resetWorld()
    await boot(be)
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['one', 'two', 'three'])
    expect(ELOG.rows.map(r => r.seq)).toEqual([1, 2, 3])
    logAction(0, 'four')
    expect(ELOG.rows[3]!.seq).toBe(4)
  })

  it('a boot loads the newest lines only, up to the cap, by (at, lineId)', async () => {
    const be = new MemoryBackend()
    const line = (lineId: string, t: number) => JSON.stringify({ lineId, t, who: 'Hex', pid: 'rocky', di: 0, date: '2026-07-13', key: '', lbl: lineId, from: '', to: '' })
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION),
      'elog:b.1': line('b.1', 100), 'elog:a.1': line('a.1', 100), 'elog:c.1': line('c.1', 50), 'elog:d.1': line('d.1', 200),
      'elog:bad': '{not json' } })
    ELOG.cap = 3
    await boot(be)
    expect(ELOG.rows.map(r => r.lineId)).toEqual(['a.1', 'b.1', 'd.1'])
    expect(be.peek('settings', 'elog:bad'), 'a line that will not read is left as it is').toBe('{not json')
  })

  it('lines from two clients interleave by their time on every reload', async () => {
    const be = new MemoryBackend()
    const line = (lineId: string, t: number, lbl: string) => JSON.stringify({ lineId, t, who: 'x', pid: null, di: null, date: null, key: '', lbl, from: '', to: '' })
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION),
      'elog:cA.000001': line('cA.000001', 10, 'A1'), 'elog:cB.000001': line('cB.000001', 20, 'B1'), 'elog:cA.000002': line('cA.000002', 30, 'A2') } })
    await boot(be)
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['A1', 'B1', 'A2'])
  })
})

describe('the lines that rode no command before', () => {
  it('an Undo line rides the restore — one group, one batch', async () => {
    await boot()
    as('ad', 'a')
    writeInputs(() => { INPUTS.push(ROW('UNDO ME')) })
    groups = []
    expect(globalUndo().ok).toBe(true)
    await drain()
    expect(groups).toHaveLength(1)
    const g = groups[0]!
    expect(lineRows(g).some(c => c.value && JSON.parse(c.value).lbl.startsWith('Undo'))).toBe(true)
    expect(g.some(c => c.collection === 'inputs')).toBe(true)
    batchOf(g)
  })

  it('the history sweep is ONE named command: the lines it deletes, its own line, one batch', async () => {
    await boot()
    as('ad', 'a')
    logAction(0, 'old one'); logAction(0, 'old two')
    const gone = ELOG.rows.map(r => r.lineId)
    groups = []
    const d = new Date(Date.now() + 86400000), p = (n: number) => String(n).padStart(2, '0')
    expect(clearEditHistory('before', `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`)).toBe(2)
    await drain()
    expect(groups).toHaveLength(1)
    const g = groups[0]!
    expect(lineRows(g).filter(c => c.value === null).map(c => c.id).sort()).toEqual(gone.map(id => `elog:${id}`).sort())
    expect(lineRows(g).filter(c => c.value !== null)).toHaveLength(1)
    expect(batchOf(g).type).toBe('elog.sweep')
  })

  it('a key renumbering inside a refused command changes neither the lines nor their rows', async () => {
    const { wb } = await boot()
    as('ad', 'a')
    logAction(0, 'about a row', { key: 'g:0.1' } as any)
    const id = ELOG.rows[0]!.lineId
    const before = wb.get('settings', `elog:${id}`)
    commit({ type: 'sched.mutate', scope: { module: 'sched' }, apply: () => { elogRemap((k: any) => (k === 'g:0.1' ? 'g:0.0' : k)); throw new Error('refused') } } as any)
    expect(ELOG.rows[0]!.key).toBe('g:0.1')
    expect(wb.get('settings', `elog:${id}`)).toBe(before)
  })
})

describe('what is new to you is one row per person, by position (F2-02)', () => {
  it('Mark all as seen writes only your own row, as a position', async () => {
    const { wb } = await boot()
    as('ad', 'a'); logAction(0, 'one'); logAction(1, 'two')
    as('us', 'us')
    groups = []
    expect(markSeen(ELOG.rows)).toBe(true)
    await drain()
    const g = groups[0]!
    expect(g.filter(c => c.collection === 'settings' && !c.id.startsWith('elog:')).map(c => c.id)).toEqual(['seen:bane'])
    const seen = JSON.parse(wb.get('settings', 'seen:bane')!)
    const last = ELOG.rows[1]!
    expect(seen).toEqual({ upto: { at: last.t, lineId: last.lineId }, extra: [] })
    expect(wb.has('settings', 'changeseen')).toBe(false)
  })

  it('two people marking at once both survive — each a row of his own', async () => {
    const be = new MemoryBackend()
    await boot(be)
    as('hex' as any, 'x'); logAction(0, 'by Hex')
    await vi.advanceTimersByTimeAsync(300)
    as('ad', 'a'); markSeen(ELOG.rows)
    as('us', 'us'); markSeen(ELOG.rows)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('settings', 'seen:stiff')).not.toBeNull()
    expect(be.peek('settings', 'seen:bane')).not.toBeNull()
    resetWorld(); await boot(be); changesLoad()
    as('us', 'us'); expect(isNewToMe(ELOG.rows[0]!)).toBe(false)
    as('ad', 'a'); expect(isNewToMe(ELOG.rows[0]!)).toBe(false)
  })

  it('an account made after the history began starts with nothing new — seenFrom is a position', async () => {
    await boot()
    as('ad', 'a'); logAction(0, 'before he joined')
    const pid = Object.keys(PEOPLE).find(id => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].archived && !(PEOPLE as any)[id].deleted && !ACCOUNTS_LIST.some(a => a.pid === id))!
    expect(addAccount('newbie@x', pid, 'main')).toBeNull()
    const acct = ACCOUNTS_LIST.find(a => a.name === 'newbie@x')!
    expect(acct.seenFrom).toEqual({ at: ELOG.rows[0]!.t, lineId: ELOG.rows[0]!.lineId })
    vi.advanceTimersByTime(5)
    logAction(1, 'after he joined')
    resetSession({ user: acct.id, role: 'member', pid: acct.pid } as any)
    const before = ELOG.rows.find(r => r.lbl === 'before he joined')!, after = ELOG.rows.find(r => r.lbl === 'after he joined')!
    expect(isNewToMe(before)).toBe(false)
    expect(isNewToMe(after)).toBe(true)
  })
})

/* the load never needs the old whole-history record — the fold turns it into rows (the elog converter) */
describe('the old record', () => {
  it('a store holding only the old whole-history record loads no line from it (the fold converts it)', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION), elog: JSON.stringify({ v: 1, next: 3, rows: [{ seq: 1, t: 1, who: 'x', di: 0, date: null, key: '', lbl: 'old', from: '', to: '' }] }) } })
    await boot(be)
    elogLoad()
    expect(ELOG.rows).toHaveLength(0)
  })
})
