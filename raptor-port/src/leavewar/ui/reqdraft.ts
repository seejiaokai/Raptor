/* A LEAVE REQUEST'S WORDS AS THE WINDOWS HOLD THEM — the draft, its change, the held request and its run's last day (the
   rows that draw them, and the rulings, are ReqWords.tsx's), moved here so that file exports only its components (React's
   quick reload keeps a component's state only in a file of components). */

import { recordsAt, reqRunKey, type ReqWords, type ReqWordsPatch } from '../state/store'
import { addDays, type RequestRec } from '../engine'

/** what the rows hold: the words as typed, the tick only where it was turned, the files */
export interface ReqDraft { remarks: string; till?: boolean; docIds: string[] }
export const emptyDraft = (): ReqDraft => ({ remarks: '', docIds: [] })
/* a leave's till tick is on by default (D952 — every kind but a one-day duty or other commitment) */
export const TILL_DEFAULT = true

export function draftOf(w: ReqWords | null | undefined): ReqDraft {
  return { remarks: w?.remarks ?? '', ...(typeof w?.till === 'boolean' ? { till: w.till } : {}), docIds: [...(w?.docIds ?? [])] }
}
/** the store's shape for a new bid: nothing where nothing was given */
export function wordsOf(d: ReqDraft): ReqWords | undefined {
  const t = d.remarks.trim() ? d.remarks : ''
  const w: ReqWords = { ...(t ? { remarks: t } : {}), ...(d.till === false ? { till: false } : {}), ...(d.docIds.length ? { docIds: [...d.docIds] } : {}) }
  return Object.keys(w).length ? w : undefined
}
/** a held request's change: only what differs from what it holds */
export function patchOf(was: ReqDraft, now: ReqDraft): ReqWordsPatch | null {
  const p: ReqWordsPatch = {}
  if (was.remarks.trim() !== now.remarks.trim()) p.remarks = now.remarks.trim()
  if ((was.till ?? TILL_DEFAULT) !== (now.till ?? TILL_DEFAULT)) p.till = now.till === false ? false : null
  if (was.docIds.join('|') !== now.docIds.join('|')) p.docIds = [...now.docIds]
  return Object.keys(p).length ? p : null
}

/** THE HELD REQUEST ON A DAY — the one bid the window's rows speak for: exactly one request there (a pending or a refused
 *  bid), else none; with its run's last day, so its "till" reads the bid's last day as the Inputs page will. */
export function heldRequest(personId: string, date: string): { rec: RequestRec; end: string } | null {
  const reqs = recordsAt(personId, date).filter((r): r is RequestRec => r.kind === 'request')
  if (reqs.length !== 1) return null
  const rec = reqs[0]!
  return { rec, end: runEnd(personId, date, rec) }
}
/** THE LAST DAY OF A BID'S RUN from this day on — the days after it holding the same bid (its kind, its state, its words) —
 *  for its "till <date>": the one-day window's and the day's list's alike (round 3's FULL check: the list read the day
 *  opened, "till 8 Dec", where the window on the run's first day read "till 9 Dec") */
export function runEnd(personId: string, date: string, rec: RequestRec): string {
  const k = reqRunKey(rec)   // the store's own run (R8)
  let end = date
  for (let d = addDays(date, 1); recordsAt(personId, d).some(r => r.kind === 'request' && reqRunKey(r as RequestRec) === k); d = addDays(d, 1)) end = d
  return end
}
