/* A LEAVE REQUEST'S DOCUMENT AND REMARKS ROWS (owner D1210, D1226, D1150, D1159; the Leave War overhaul's M3, 5.9 and 5.10)
   — one piece for the one-day window, the drag-selection window (one person) and the closed-day window, so the three
   cannot grow three remarks boxes:
   · Document — the app's one Document button, as the Inputs page's input window draws it (D1159): the upload arrow and
     "Document", "Add" once a file is there, each file a chip with its ✕ (`ui/inputedit.tsx DocField`, reached through
     `sync.ts` — the war's one seam to Raptor);
   · Remarks — the box holds only what is typed; after it, in grey, "till <its last day>" from the request's dates, with
     a tick before it — ticked by default for leave (D952); unticked, the date is struck through and no screen prints it;
     a hand choice is kept only where it differs from the default (D953); a two-digit year (D1095). Exactly the Inputs
     page's box (`inped-rmk`, `inped-tl` — D1226).
   The rows only draw and report. The window decides when a change is saved: on an empty day the words go with the bid
   the leave tap writes; on a day holding a bid each change is saved to it at once — a pick, a ✕, the tick — and the
   typed words when the box is left or Enter pressed (`commit`), one `lw.reqmeta` command each. */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { remarksTyped, tillShown } from '../../engine/inputs'
import { setLeaveRemarks } from '../../ui/inputedit'
import { inputDates } from '../absences'
import { DocField, rowDocIds, tillOfISO } from '../sync'
import { recordsAt, type ReqWords, type ReqWordsPatch } from '../state/store'
import { addDays, type RequestRec } from '../engine'

/** what the rows hold: the words as typed, the tick only where it was turned, the files */
export interface ReqDraft { remarks: string; till?: boolean; docIds: string[] }
export const emptyDraft = (): ReqDraft => ({ remarks: '', docIds: [] })
/* a leave's till tick is on by default (D952 — every kind but a one-day duty or other commitment) */
const TILL_DEFAULT = true

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

/* THE BOX GROWS WITH ITS WORDS (his D1333): one line tall to start; as the words wrap it grows a line at a time, so a long
   remark is read whole, never hidden in one line that scrolls sideways. Measured after each change of the words (the
   height set back to auto first, so it shrinks again too). */
function useGrow(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const t = ref.current
    if (!t) return
    t.style.height = 'auto'
    if (t.scrollHeight > 0) t.style.height = `${t.scrollHeight + (t.offsetHeight - t.clientHeight)}px`
  }, [value])
  return ref
}

/** ROUND 3's ONE ROW (his D1311, approved D1332): the dark Remarks box (D1308), the words "Remarks" inside it until he types
 *  (no label beside it), its "till <date>", then the app's one Document button — the bid windows' and the day's list's.
 *  Enter saves the words, as before; it never starts a new line (a remark is one run of words that wraps — D1333). */
export function WordsRow({ value, onChange, till, tillOn, onTill, testPrefix = 'bid', readOnlyDocs = false }: {
  value: { remarks: string; docIds: string[] }
  onChange: (next: { remarks: string; docIds: string[] }, how: 'type' | 'commit') => void
  /** "till <date>" — '' where the entry prints none */
  till: string
  tillOn: boolean
  onTill?: (on: boolean) => void
  testPrefix?: string
  readOnlyDocs?: boolean
}) {
  const ref = useGrow(value.remarks)
  return (
    <div className={`bidsheet-row bp-words${value.docIds.length ? ' has-docs' : ''}`} data-testid={`${testPrefix}-rmk-row`} role="group" aria-label="Remarks and document">
      <span className="inped-rmk bp-rmk dark">
        <textarea
          ref={ref}
          id={`${testPrefix}-remarks`}
          data-testid={`${testPrefix}-remarks`}
          aria-label="Remarks"
          placeholder="Remarks"
          rows={1}
          maxLength={200}
          autoComplete="off"
          value={value.remarks}
          onChange={e => onChange({ ...value, remarks: e.target.value.replace(/\n/g, ' ') }, 'type')}
          onBlur={() => onChange(value, 'commit')}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onChange(value, 'commit') } }}
        />
        {till && (
          <label className="inped-ad inped-tl" data-testid={`${testPrefix}-tl`}>
            <input type="checkbox" data-testid={`${testPrefix}-till`} checked={tillOn} disabled={!onTill}
              onChange={e => onTill?.(e.target.checked)} />
            <span className={'inped-till' + (tillOn ? '' : ' off')} data-testid={`${testPrefix}-tilldate`}>{till}</span>
          </label>
        )}
      </span>
      <span className="bp-doc" data-testid={`${testPrefix}-doc-row`}>
        <DocField ids={value.docIds} onIds={ids => { if (!readOnlyDocs) onChange({ ...value, docIds: ids }, 'commit') }} />
      </span>
    </div>
  )
}

export function ReqWordsRows({ value, onChange, start, end, testPrefix = 'bid', compact = false }: {
  value: ReqDraft
  /** `commit`: a change to save now on a held request (a file, a ✕, the tick, the box left or Enter); `type`: a keystroke */
  onChange: (next: ReqDraft, how: 'type' | 'commit') => void
  /** the request's first and last day (ISO), for its "till <date>" */
  start: string
  end?: string
  testPrefix?: string
  /** round 3's one row (the bid windows and the day's list); the closed-day window keeps its two labelled rows */
  compact?: boolean
}) {
  const till = tillOfISO('LL', start, end)
  const on = typeof value.till === 'boolean' ? value.till : TILL_DEFAULT
  if (compact) {
    return (
      <WordsRow testPrefix={testPrefix} value={value} till={till} tillOn={on}
        onChange={(next, how) => onChange({ ...value, ...next }, how)}
        onTill={v => { const { till: _drop, ...rest } = value; onChange(v === TILL_DEFAULT ? rest : { ...rest, till: v }, 'commit') }} />
    )
  }
  return (
    <>
      <div className="bidsheet-row" data-testid={`${testPrefix}-doc-row`}>
        <span className="lab">Document</span>
        <DocField ids={value.docIds} onIds={ids => onChange({ ...value, docIds: ids }, 'commit')} />
      </div>
      <div className="bidsheet-row" data-testid={`${testPrefix}-rmk-row`}>
        <label className="lab" htmlFor={`${testPrefix}-remarks`}>Remarks</label>
        <span className="inped-rmk bp-rmk">
          <input
            id={`${testPrefix}-remarks`}
            data-testid={`${testPrefix}-remarks`}
            type="text"
            maxLength={200}
            autoComplete="off"
            value={value.remarks}
            onChange={e => onChange({ ...value, remarks: e.target.value }, 'type')}
            onBlur={() => onChange(value, 'commit')}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onChange(value, 'commit') } }}
          />
          {till && (
            <label className="inped-ad inped-tl" data-testid={`${testPrefix}-tl`}>
              <input
                type="checkbox"
                data-testid={`${testPrefix}-till`}
                checked={on}
                onChange={e => {
                  const v = e.target.checked
                  const { till: _drop, ...rest } = value
                  onChange(v === TILL_DEFAULT ? rest : { ...rest, till: v }, 'commit')
                }}
              />
              <span className={'inped-till' + (on ? '' : ' off')} data-testid={`${testPrefix}-tilldate`}>{till}</span>
            </label>
          )}
        </span>
      </div>
    </>
  )
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
  const same = (r: RequestRec) => r.code === rec.code && r.state === rec.state && (r.remarks ?? '') === (rec.remarks ?? '')
  let end = date
  for (let d = addDays(date, 1); recordsAt(personId, d).some(r => r.kind === 'request' && same(r)); d = addDays(d, 1)) end = d
  return end
}

/** AN APPROVED LEAVE'S OWN ROW (his D1307 — shown straight away, for whoever may change it, in place of "Note"; D1308 the
 *  dark box; D1333 it wraps): the words, the till tick and the documents of the Raptor INPUT the leave is, saved onto that
 *  input through the one remarks save (`ui/inputedit.ts setLeaveRemarks` → commitInputEdit, which carries the member-own /
 *  admin-any gate) — a remark typed when the box is left or Enter pressed, a file, a ✕ or the tick at once. On one man's
 *  cell of a leave filed for several the remark is his alone, as the remarks window always made it (setLeaveRemarks). */
/** WORDS TYPED AND NOT YET SAVED, SAVED BEFORE AN ACTION (round 3's FULL check, 24 Oct 26 — the scenario designer's S15): an
 *  iPhone keeps the box focused when a button is tapped, so no blur saves the words first, and an action that closes the
 *  window — or turns the bid into a leave, or a leave back into a bid — went ahead without them. A words row hands its
 *  window this ref; the window calls it before it acts, so the words ride with what the action does. */
export type FlushRef = { current: (() => void) | null }
function useFlush(flushRef: FlushRef | undefined, pending: { current: { save: () => void } | null }) {
  useEffect(() => {
    if (!flushRef) return
    const flush = () => { const p = pending.current; pending.current = null; p?.save() }
    flushRef.current = flush
    return () => { if (flushRef.current === flush) flushRef.current = null }
  }, [flushRef, pending])
}

export function LeaveWords({ row, personId, testPrefix = 'bid', onRefused, flushRef }: {
  /** the Raptor input the cell derives from (`sync.ts leaveInputAt`) */
  row: any
  personId: string
  testPrefix?: string
  /** a save the one gate refused says why (a control that silently does nothing is the worst of the three outcomes) */
  onRefused?: (why: string) => void
  /** the window's way to save words typed and not yet saved before an action (`useFlush`) */
  flushRef?: FlushRef
}) {
  const typed = remarksTyped(row?.remarks, row)
  const docIds = rowDocIds(row)
  const [edit, setEdit] = useState<string | null>(null)
  /* words typed and not yet saved go with the window's closing — ✕, Escape, a tap outside — as a held bid's do (the bid
     window's fresh read, 5): the latest of them kept here, saved once as the row leaves the screen, or before an action */
  const pending = useRef<{ text: string; save: () => void } | null>(null)
  useEffect(() => () => { pending.current?.save() }, [])
  useFlush(flushRef, pending)
  const dates = inputDates(row)
  const till = dates.length ? tillOfISO(row?.type ?? 'LL', dates[0], dates[dates.length - 1]) : ''
  const save = (remarks: string, ids: string[], tillTo?: boolean) => {
    if (!setLeaveRemarks(row, remarks, personId, ids, tillTo)) onRefused?.('That could not be saved — change it on the Inputs page.')
  }
  return (
    <WordsRow testPrefix={testPrefix} till={till} tillOn={tillShown(row)}
      value={{ remarks: edit ?? typed, docIds }}
      onChange={(next, how) => {
        if (how === 'type') {
          pending.current = next.remarks.trim() !== typed.trim() ? { text: next.remarks, save: () => { setEdit(null); save(next.remarks.trim(), docIds) } } : null
          return setEdit(next.remarks)
        }
        pending.current = null
        setEdit(null)
        if (next.remarks.trim() !== typed.trim() || next.docIds.join('|') !== docIds.join('|')) save(next.remarks.trim(), next.docIds)
      }}
      onTill={v => { pending.current = null; save(edit ?? typed, docIds, v) }} />
  )
}
