// THE WAR'S OWN RECORDS ([ARCH-STACK] step 4, phases 2–3).
//
// A leave war stores ONLY what is its own (design §1, clash check B1):
//   - REQUESTS — a member's bid and the admin's decision on it while it is
//     undecided or refused. Approving a request turns it into an Input (the one
//     absence record) and deletes it; nothing "approved" is ever stored here.
//   - OIL CREDITS — FO/HO, generated from published weekend/PH work (`auto`)
//     or typed by an admin (`manual`, optionally with the work times).
//   - NOTICES — "your LL bid was replaced by ATT C (filed by …)", kept until the
//     person or an admin taps "OK, seen" (catalogue owner rule + clash check B6).
// Several can sit on one person/date (a morning bid and an afternoon bid, a
// worked morning beside an afternoon bid, a refused bid kept as history), so a
// date holds a LIST. What the box shows is derived (`dayview.ts`), never stored.
//
// Rules per person/date, enforced by `readRecs` on load and by every writer:
//   - at most one UNDECIDED request per half (a full-day one takes both);
//   - at most one refused request per half (a newer refusal replaces the older);
//   - at most one credit;
//   - notices unlimited.

import { parseCell, type Portion } from './codes'
import { AM, PM, FULL, type Contrib, type RequestState, type Win } from './dayview'

export interface RequestRec {
  id: string
  kind: 'request'
  /** the stored notation, portion marks included: `LL`, `*LL`, `OL*` */
  code: string
  state: RequestState
  /** the date a closed-bidding move took it from (the dotted mark) */
  shiftedFrom?: string
  /** what an un-approval carried back from the Input, consumed by the next
   *  approval: the member's remark and the moved marks (design §2.2, FB3-03) */
  carried?: Carried
}
export interface Carried { remarks?: string; lwMoved?: Record<string, string> }

/** WHO GAVE THIS OIL, in the words the squadron reads (owner, 21 Sep 26).
 *  A hand-typed award carries a name or a post, typed by the admin who gave
 *  it. An automatic credit has no person behind it — the evidence is the
 *  published weekend or public holiday it was earned on, or the duty input
 *  the owner accepted — so it says which of those it was. One helper, because
 *  the day window and the OIL tracker must not word it differently. */
export function creditGiver(c: { oil?: 'auto' | 'manual'; givenBy?: string; via?: 'schedule' | 'input' } | null | undefined): string {
  if (!c) return ''
  if (c.oil !== 'auto') return c.givenBy ?? ''
  return c.via === 'input' ? 'Duty input' : 'Weekend/PH'
}

export interface CreditRec {
  id: string
  kind: 'credit'
  code: 'FO' | 'HO'
  /** `auto` = the OIL pass generated it and may take it away again; `manual` =
   *  an admin typed it and only an admin removes it (design §18 OA3-003) */
  oil: 'auto' | 'manual'
  /** why it was earned (FLT, SIM + Duty, a claim's type, an admin's words) */
  note?: string
  /** ON WHOSE SAY-SO, on a HAND-TYPED credit (owner, 20 Sep 26 — the same
   *  optional box the OIL tracker's grant already carries). A credit the
   *  published schedule earned needs no such field: the schedule IS the
   *  evidence. One an admin types has none, so the squadron records who said
   *  the man worked. Free text — a name or a post. */
  givenBy?: string
  /** WHERE AN AUTOMATIC CREDIT CAME FROM (owner, 21 Sep 26 — he wants the
   *  giver shown on automatic OIL too, as "Weekend/PH", or "Duty input" where
   *  the credit came from a duty-and-commitments input he accepted rather than
   *  from the published schedule).
   *  It is RECORDED rather than worked out from the reason, because the two
   *  are genuinely indistinguishable there: the schedule's own reasons are
   *  FLT / SIM / Duty and one of the input types is also called Duty, so a
   *  Duty input and a duty desk would read identically. Only an `auto` credit
   *  carries it; a hand-typed award has `givenBy` instead. */
  via?: 'schedule' | 'input'
  /** the work times, minutes of the day (clash check B8). None = the whole day
   *  for every overlap check (owner Q7). Only an AUTOMATIC credit carries
   *  these now: they come off the published schedule, which knows the hours.
   *  A GRANT has none, because a grant is an award and not an attendance
   *  record (owner, 20 Sep 26 — "Remove the worked hours. Not required"). */
  spans?: Array<[number, number]>
  /** HOW MANY DAYS this grant is worth, when it is not simply the code's own
   *  worth (owner, 20 Sep 26 — "on the leave war i can also grant more than 1
   *  day of OIL credit just like how the oil tracker does it"). Absent means
   *  FO is one day and HO is half, which is the ordinary case and needs no
   *  typing. Never set on an automatic credit: the schedule earns exactly what
   *  the code says. */
  days?: number
  /** THE ADMIN'S OWN CREDIT, KEPT WHOLE. An admin typed a credit here first
   *  and the published schedule later earned one too, so the pass took it over
   *  in place. The pass may take its OWN credit away again — but taking this
   *  one away would destroy the squadron's record, which design §18 OA3-003
   *  forbids. So when the schedule stops backing it, exactly THIS is put back.
   *  A boolean was not enough (Codex review, 20 Sep 26): the schedule's code,
   *  reason and hours overwrite the admin's, so a flag handed back the
   *  SCHEDULE's credit wearing a manual label. It is an exact snapshot. */
  manual?: { code: 'FO' | 'HO'; note?: string; givenBy?: string; days?: number; spans?: Array<[number, number]> }
}

export interface NoticeRec {
  id: string
  kind: 'notice'
  /** the REPLACED bid's notation */
  code: string
  /** what it was when replaced */
  was: 'pending' | 'acknowledged'
  /** what replaced it, in the app's words: `ATT C`, `published schedule` */
  byType: string
  /** who did it, frozen at the time: a callsign, or `the published schedule` */
  byWho: string
  /** the command that replaced it — "OK, seen" clears every notice it made */
  seq: number
  at: string
}

export type WarRec = RequestRec | CreditRec | NoticeRec
/** personId → date → records. Sparse. */
export type Recs = Record<string, Record<string, WarRec[]>>

export const MAX_REC_NOTE = 40
/** The optional "given by" — on a hand-typed credit here, and on the OIL
 *  tracker's grant, which re-exports THIS one rather than keeping its own.
 *  Two literals for one box is the drift seam the house rules name: the
 *  tracker's had lived in the store since 2 Sep 26, and a second copy was
 *  written here on 20 Sep 26 at a different number before it was caught. */
export const MAX_GIVEN_BY = 40
/** The most days one grant may be worth. A year of OIL in a single entry is a
 *  typo, not a decision; corrections go through the OIL tracker's ledger. */
export const MAX_GRANT_DAYS = 365
export const MAX_CARRIED_REMARK = 200

/* ---- ids ---------------------------------------------------------------- */
let SEQ = 0
/** A fresh record id. Random enough that two tabs / an undo replay never
 *  collide on one address; ids are only compared within one person/date. */
export function newRecId(prefix = 'r'): string {
  SEQ = (SEQ + 1) % 1e6
  return `${prefix}${Date.now().toString(36)}${SEQ.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/* ---- reading ------------------------------------------------------------ */
export function recsAt(recs: Recs, personId: string, date: string): readonly WarRec[] {
  return recs[personId]?.[date] ?? []
}
export const isRequest = (r: WarRec): r is RequestRec => r.kind === 'request'
export const isCredit = (r: WarRec): r is CreditRec => r.kind === 'credit'
export const isNotice = (r: WarRec): r is NoticeRec => r.kind === 'notice'

/** The window a request's notation takes. */
export function requestWin(code: string): Win {
  const p = parseCell(code)?.portion ?? 'full'
  return p === 'am' ? AM : p === 'pm' ? PM : FULL
}
/** The window a credit takes: its work times, else the whole day. Several
 *  spans are joined end to end for the box (their union is what overlaps). */
export function creditWins(c: CreditRec): Win[] {
  return c.spans && c.spans.length ? c.spans.map(([s, e]) => [s, e] as Win) : [FULL]
}

/** A request's portion. */
export const portionOfCode = (code: string): Portion => parseCell(code)?.portion ?? 'full'
const halvesOf = (p: Portion): Array<'am' | 'pm'> => (p === 'full' ? ['am', 'pm'] : [p])

/** The war's records at one address as day-view contributions. */
export function recContribs(list: readonly WarRec[]): Contrib[] {
  const out: Contrib[] = []
  for (const r of list) {
    if (r.kind === 'request') {
      const cell = parseCell(r.code)
      out.push({ id: r.id, kind: 'request', code: cell?.type ?? r.code, win: requestWin(r.code), state: r.state, ...(r.shiftedFrom ? { movedFrom: r.shiftedFrom } : {}) })
    } else if (r.kind === 'credit') {
      /* ONE contribution per credit, however many work stretches it has: the
         envelope is what the box shows, the stretches are what clashes read */
      const ws = creditWins(r)
      const env: Win = [Math.min(...ws.map(w => w[0])), Math.max(...ws.map(w => w[1]))]
      out.push({ id: r.id, kind: 'credit', code: r.code, win: env, ...(ws.length > 1 ? { wins: ws } : {}), ...(r.oil === 'auto' ? { auto: true, ...(r.via ? { via: r.via } : {}) } : {}), ...(r.note ? { note: r.note } : {}), ...(r.givenBy ? { givenBy: r.givenBy } : {}), ...(r.days != null ? { days: r.days } : {}) })
    } else {
      out.push({ id: r.id, kind: 'notice', code: parseCell(r.code)?.type ?? r.code, win: FULL })
    }
  }
  return out
}

/* ---- the per-address rules ---------------------------------------------- */
/** Why a list breaks the per-address rules, or null when it is sound. */
export function listProblem(list: readonly WarRec[]): string | null {
  const live = { am: 0, pm: 0 }, refused = { am: 0, pm: 0 }
  let credits = 0
  const ids = new Set<string>()
  for (const r of list) {
    if (ids.has(r.id)) return 'duplicate id'
    ids.add(r.id)
    if (r.kind === 'credit') { if (++credits > 1) return 'two credits'; continue }
    if (r.kind !== 'request') continue
    const tally = r.state === 'refused' ? refused : live
    for (const h of halvesOf(portionOfCode(r.code))) if (++tally[h] > 1) return `two ${r.state === 'refused' ? 'refused' : 'undecided'} requests on the ${h === 'am' ? 'morning' : 'afternoon'}`
  }
  return null
}

/* ---- validation on load (untrusted storage) ------------------------------ */
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const REQ_STATES = new Set(['pending', 'acknowledged', 'refused'])
const ISO = /^\d{4}-\d{2}-\d{2}$/
const isSpan = (x: unknown): x is [number, number] =>
  Array.isArray(x) && x.length === 2 && x.every(n => Number.isInteger(n) && n >= 0 && n <= 1439) && (x[0] as number) <= (x[1] as number)

function readCarried(x: unknown): Carried | undefined {
  if (!isObj(x)) return undefined
  const out: Carried = {}
  if (typeof x.remarks === 'string' && x.remarks.trim()) out.remarks = x.remarks.slice(0, MAX_CARRIED_REMARK)
  if (isObj(x.lwMoved)) {
    const m: Record<string, string> = {}
    for (const [k, v] of Object.entries(x.lwMoved)) if (ISO.test(k) && typeof v === 'string' && ISO.test(v)) m[k] = v
    if (Object.keys(m).length) out.lwMoved = m
  }
  return Object.keys(out).length ? out : undefined
}

/** One stored record, or null when it is not one. A record carrying the
 *  retired `source`, or an `approved` state, is REJECTED (design §2.2 — the
 *  demo data is reset, not migrated). A bad note or `carried` is dropped, the
 *  record kept (design §19 FB4-03). */
export function readRec(x: unknown): WarRec | null {
  if (!isObj(x) || typeof x.id !== 'string' || !x.id || 'source' in x) return null
  if (x.kind === 'request') {
    if (typeof x.code !== 'string' || !parseCell(x.code) || typeof x.state !== 'string' || !REQ_STATES.has(x.state)) return null
    const r: RequestRec = { id: x.id, kind: 'request', code: x.code.trim().toUpperCase(), state: x.state as RequestState }
    if (typeof x.shiftedFrom === 'string' && ISO.test(x.shiftedFrom)) r.shiftedFrom = x.shiftedFrom
    const c = readCarried(x.carried)
    if (c) r.carried = c
    return r
  }
  if (x.kind === 'credit') {
    if ((x.code !== 'FO' && x.code !== 'HO') || (x.oil !== 'auto' && x.oil !== 'manual')) return null
    const r: CreditRec = { id: x.id, kind: 'credit', code: x.code, oil: x.oil }
    const mx = x.manual as any
    if (x.oil === 'auto' && mx && (mx.code === 'FO' || mx.code === 'HO')) {
      const m: NonNullable<CreditRec['manual']> = { code: mx.code }
      if (typeof mx.note === 'string' && mx.note.trim()) m.note = mx.note.trim().slice(0, MAX_REC_NOTE)
      if (typeof mx.givenBy === 'string' && mx.givenBy.trim()) m.givenBy = mx.givenBy.trim().slice(0, MAX_GIVEN_BY)
      if (typeof mx.days === 'number' && Number.isFinite(mx.days) && mx.days > 0 && mx.days <= MAX_GRANT_DAYS && mx.days * 2 === Math.round(mx.days * 2)) m.days = mx.days
      if (Array.isArray(mx.spans)) { const ms = mx.spans.filter(isSpan); if (ms.length) m.spans = ms as Array<[number, number]> }
      r.manual = m
    }
    if (typeof x.note === 'string' && x.note.trim()) r.note = x.note.trim().slice(0, MAX_REC_NOTE)
    /* Dropped rather than refused, like the note beside it: a bad "given by"
       must not cost the squadron the record that a man worked. */
    if (typeof x.givenBy === 'string' && x.givenBy.trim()) r.givenBy = x.givenBy.trim().slice(0, MAX_GIVEN_BY)
    if (Array.isArray(x.spans)) { const s = x.spans.filter(isSpan); if (s.length) r.spans = s as Array<[number, number]> }
    /* Halves only, and inside sane bounds — an unreadable quantity falls back
       to the code's own worth rather than costing the squadron the record. */
    if (typeof x.days === 'number' && Number.isFinite(x.days) && x.days > 0 && x.days <= MAX_GRANT_DAYS && x.days * 2 === Math.round(x.days * 2)) r.days = x.days
    return r
  }
  if (x.kind === 'notice') {
    if (typeof x.code !== 'string' || !parseCell(x.code) || (x.was !== 'pending' && x.was !== 'acknowledged')) return null
    if (typeof x.byType !== 'string' || typeof x.byWho !== 'string' || typeof x.seq !== 'number' || typeof x.at !== 'string') return null
    return { id: x.id, kind: 'notice', code: x.code, was: x.was, byType: x.byType.slice(0, 40), byWho: x.byWho.slice(0, 60), seq: x.seq, at: x.at }
  }
  return null
}

/** A whole war's records, or null when anything is malformed or breaks the
 *  per-address rules — the caller then re-seeds the war blob (reset, don't
 *  migrate: an old-shape blob is replaced, never half-read). */
export function readRecs(x: unknown): Recs | null {
  if (!isObj(x)) return null
  const out: Recs = {}
  for (const [pid, row] of Object.entries(x)) {
    if (!isObj(row)) return null
    const kept: Record<string, WarRec[]> = {}
    for (const [date, list] of Object.entries(row)) {
      if (!ISO.test(date) || !Array.isArray(list)) return null
      const recs: WarRec[] = []
      for (const leaf of list) { const r = readRec(leaf); if (!r) return null; recs.push(r) }
      if (listProblem(recs)) return null
      if (recs.length) kept[date] = recs
    }
    if (Object.keys(kept).length) out[pid] = kept
  }
  return out
}

/* ---- immutable edits (every writer goes through these) ------------------ */
/** A new Recs with the list at one address replaced (an empty list removes
 *  the address, and an empty person row goes with it). */
export function withList(recs: Recs, personId: string, date: string, list: readonly WarRec[]): Recs {
  const row = { ...(recs[personId] ?? {}) }
  if (list.length) row[date] = [...list]
  else delete row[date]
  const out = { ...recs }
  if (Object.keys(row).length) out[personId] = row
  else delete out[personId]
  return out
}

/** The undecided request touching a half (or either half, for 'full'). */
export function liveRequestsOn(list: readonly WarRec[], portion: Portion): RequestRec[] {
  const want = new Set(halvesOf(portion))
  return list.filter((r): r is RequestRec => r.kind === 'request' && r.state !== 'refused' &&
    halvesOf(portionOfCode(r.code)).some(h => want.has(h)))
}
