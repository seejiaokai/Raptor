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

import { DocField, tillOfISO } from '../sync'
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

export function ReqWordsRows({ value, onChange, start, end, testPrefix = 'bid' }: {
  value: ReqDraft
  /** `commit`: a change to save now on a held request (a file, a ✕, the tick, the box left or Enter); `type`: a keystroke */
  onChange: (next: ReqDraft, how: 'type' | 'commit') => void
  /** the request's first and last day (ISO), for its "till <date>" */
  start: string
  end?: string
  testPrefix?: string
}) {
  const till = tillOfISO('LL', start, end)
  const on = typeof value.till === 'boolean' ? value.till : TILL_DEFAULT
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
  const same = (r: RequestRec) => r.code === rec.code && r.state === rec.state && (r.remarks ?? '') === (rec.remarks ?? '')
  let end = date
  for (let d = addDays(date, 1); recordsAt(personId, d).some(r => r.kind === 'request' && same(r)); d = addDays(d, 1)) end = d
  return { rec, end }
}
