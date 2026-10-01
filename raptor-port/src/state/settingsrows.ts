// src/state/settingsrows.ts
/* THE ONE-TIME CONVERSION OF THE WHOLE-LIST SETTINGS RECORDS ([DB-READINESS] group A, phases 4.3 / 4.4 — plan §2.6;
   storage/fold.ts). A browser that saved them the old way holds, in `settings`:
   - `elog`       { v, next, rows: [{ seq, t, … }] } — the whole change history in one record;
   - `changeseen` { [pid]: { upto: N, extra: [N…] } } — everyone's "seen" in one record, by line NUMBER;
   - `accounts`   [{ id, name, role, pid, on, offBy?, seenFrom?: N }] — every account in one record;
   - `accessreqs` [{ id, name, cs, ini, seat, cat, at, seenBy: [accountId…] }] — every request in one record.
   The fold turns them, once, into this build's rows — `elog:<lineId>`, `seen:<pid>`, `account:<id>`, `accessreq:<id>`,
   `reqseen:<accountId>` (engine/editlog.ts, state/changes.ts, state/accounts.ts) — and removes each old record in the
   same group. Line NUMBERS were per browser; this build places a line by its POSITION, (at, lineId) (Fable F2-02):
   each old line's `lineId` is minted from its old number (`f` + the number, fixed width), so lines made in the same
   millisecond keep their order, and every number that pointed at a line points at that line's position.
   Pure functions of the snapshot; each writes only `settings`, and never the other's keys. A record that will not read
   is left as it is — the reader never reads it — never a thrown boot (D401). */
import type { Converter } from '../storage/fold'
import { registerConverter } from '../storage/fold'
import type { Entry, Snapshot } from '../storage/backend'

type Pos = { at: number; lineId: string }
/* the old line number's lineId: fixed width, so the ids sort as the numbers did */
export const lineIdOfSeq = (seq: number): string => 'f' + Math.max(0, Math.floor(seq)).toString(36).padStart(8, '0')
const read = (snap: Snapshot, key: string): any => { const raw = snap.settings?.[key]; if (raw == null) return undefined; try { return JSON.parse(raw) } catch { return undefined } }
const put = (id: string, v: unknown): Entry => ({ collection: 'settings', id, value: JSON.stringify(v) })
const drop = (id: string): Entry => ({ collection: 'settings', id, value: null })

/* the old history's readable lines, by number */
function oldLines(snap: Snapshot): Array<{ seq: number; t: number; row: any }> {
  const raw = read(snap, 'elog')
  if (!raw || !Array.isArray(raw.rows)) return []
  return raw.rows
    .filter((x: any) => x && typeof x === 'object' && Number.isFinite(x.seq) && Number.isFinite(x.t))
    .map((x: any) => ({ seq: +x.seq, t: +x.t, row: x }))
    .sort((a: any, b: any) => a.seq - b.seq)
}
/* the position of the last old line numbered at or below n — null when there is none */
function posAtOrBelow(lines: Array<{ seq: number; t: number }>, n: number): Pos | null {
  let best: { seq: number; t: number } | null = null
  for (const l of lines) if (l.seq <= n) best = l; else break
  return best ? { at: best.t, lineId: lineIdOfSeq(best.seq) } : null
}

export const elogConverter: Converter = {
  name: 'elog', collections: ['settings'],
  convert(snap) {
    const out: Entry[] = []
    const raw = read(snap, 'elog')
    const lines = oldLines(snap)
    if (raw && typeof raw === 'object' && Array.isArray(raw.rows)) {
      for (const l of lines) {
        const { seq: _seq, ...rest } = l.row
        const lineId = lineIdOfSeq(l.seq)
        out.push(put(`elog:${lineId}`, { ...rest, lineId }))
      }
      out.push(drop('elog'))
    }
    const seen = read(snap, 'changeseen')
    if (seen && typeof seen === 'object' && !Array.isArray(seen)) {
      const known = new Set(lines.map(l => l.seq))
      for (const [pid, v] of Object.entries(seen as Record<string, any>)) {
        if (!pid || !v || typeof v !== 'object') continue
        const upto = Number.isFinite(v.upto) ? posAtOrBelow(lines, +v.upto) : null
        const extra = Array.isArray(v.extra) ? v.extra.filter((n: any) => Number.isFinite(n) && known.has(+n)).map((n: any) => lineIdOfSeq(+n)) : []
        out.push(put(`seen:${pid}`, { upto, extra }))
      }
      out.push(drop('changeseen'))
    }
    return out
  },
}

export const accountsConverter: Converter = {
  name: 'accounts', collections: ['settings'],
  convert(snap) {
    const out: Entry[] = []
    const lines = oldLines(snap)
    const accounts = read(snap, 'accounts')
    if (Array.isArray(accounts)) {
      for (const a of accounts) {
        if (!a || typeof a !== 'object' || typeof a.id !== 'string' || !a.id) continue
        const row: any = { ...a }
        /* seenFrom N — "every line from N on is news to him" — becomes the position of the last line before N (nothing
           before it: every line is news) */
        if (Number.isFinite(a.seenFrom)) row.seenFrom = posAtOrBelow(lines, +a.seenFrom - 1) ?? { at: 0, lineId: '' }
        else delete row.seenFrom
        out.push(put(`account:${a.id}`, row))
      }
      out.push(drop('accounts'))
    }
    const reqs = read(snap, 'accessreqs')
    if (Array.isArray(reqs)) {
      const seenBy = new Map<string, string[]>()
      for (const r of reqs) {
        if (!r || typeof r !== 'object' || typeof r.id !== 'string' || !r.id) continue
        const { seenBy: who, ...row } = r
        out.push(put(`accessreq:${r.id}`, row))
        for (const acct of Array.isArray(who) ? who : []) if (typeof acct === 'string' && acct) seenBy.set(acct, [...(seenBy.get(acct) || []), r.id])
      }
      for (const [acct, ids] of seenBy) out.push(put(`reqseen:${acct}`, { userId: acct, seenRequestIds: ids }))
      out.push(drop('accessreqs'))
    }
    return out
  },
}

registerConverter(elogConverter)
registerConverter(accountsConverter)
