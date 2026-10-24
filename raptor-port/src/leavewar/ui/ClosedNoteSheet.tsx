// A MEMBER'S TAP ON A DAY NOT OPEN FOR BIDDING (owner, D1176, D1225 — 21–22 Oct 26; drawn r7-08 and r7-09 of the
// overhaul's page, approved with the build plan, D1250). The stages went (D1177): a member bids only on an open day
// from today (D1211); anywhere else on his own row a tap says why, and what to do instead — never a tap that does
// nothing, never a bid window that then refuses.
//
//   · NOTHING OF HIS PENDING THERE — the closed note, word for word (D1176): "Bidding is closed. To change your leave,
//     seek management's approval, then file it on the Inputs page. Your approved leave updates here by itself." — and
//     "Open the Inputs page" (D1166: he files or changes his leave there himself, after management's verbal yes).
//   · HIS OWN PENDING BID THERE — the bid, and the note that it is pending a decision and he may delete it (D1225;
//     "pending", never "waiting" — D1217), with Delete: the store's one rule (the cell's empty write, `setCell`, takes only his own
//     pending bid on a day closed for him). And its Document and Remarks (M3 5.9, 5.10 — D1150: "even after its dates are locked"), saved to the bid as
//     they change (`lw.reqmeta` — the one change the commit lets through on a closed day, perms.ts onlyChangesWords).

import { useState } from 'react'
import { displayCell, type RequestRec } from '../engine'
import { fileStraight, setCell, setRequestWords } from '../state/store'
import { DutyButtons } from './LeaveButtons'
import { draftOf, heldRequest, patchOf, ReqWordsRows, type ReqDraft } from './ReqWords'
import { openInputsPage } from '../sync'
import { DeleteChip } from './SheetActions'
import { Sheet } from './Sheet'
import { dayLabel } from './dates'

export const CLOSED_NOTE = 'Bidding is closed. To change your leave, seek management’s approval, then file it on the Inputs page. Your approved leave updates here by itself.'
export const PENDING_NOTE = 'Your bid is pending a decision. Delete it if you no longer want it.'

const portionWord = (code: string) => (code.startsWith('*') ? 'Morning' : code.endsWith('*') ? 'Afternoon' : 'Whole day')

export function ClosedNoteSheet({ personId, callsign, date, pending, onClose }: {
  personId: string
  callsign: string
  date: string
  /** his own live bids on this day — the store's `ownPendingOnClosedDay` */
  pending: readonly RequestRec[]
  onClose: () => void
}) {
  /* each pending bid's words while he types, by its id (a change is saved as it is made — ReqWords.tsx). EVERY pending bid
     of his there gets its rows — a morning and an afternoon each their own (the roll-call's find: with two, none were drawn) */
  const [edit, setEdit] = useState<Record<string, ReqDraft>>({})
  const end = heldRequest(personId, date)?.end ?? date
  /* ROUND 2 (his D1318 — "it can go anytime. member can file it too"; drawn r2-member-closed): a course, an overseas duty or
     the unforeseen absence is filed here too, closed for bidding or not — straight, as the input it is */
  const [fileErr, setFileErr] = useState('')
  const fileDuty = (code: string) => {
    const r = fileStraight([{ personId, date }], code)
    if (r.done > 0) return closeKeeping()
    setFileErr(r.why[0] ?? 'Nothing was filed on this day.')
  }
  const dutyRow = (
    <>
      <div className="bidsheet-row bp-extra" data-testid="closed-extra-row"><DutyButtons onFile={fileDuty} testPrefix="closed" /></div>
      {fileErr && <div className="bidsheet-row"><span className="note warn" data-testid="closed-file-err">{fileErr}</span></div>}
    </>
  )
  /* words typed and not yet saved are saved as it closes (the fresh read's 5) */
  const closeKeeping = () => {
    for (const r of pending) { const e = edit[r.id]; const p = e && patchOf(draftOf(r), e); if (p) setRequestWords(personId, date, r.id, p) }
    onClose()
  }
  return (
    <Sheet testid="closed-note" label={pending.length ? 'Your pending bid' : 'Bidding is closed'} onClose={closeKeeping}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{dayLabel(date)}</span>
        <button className="x" data-testid="closed-note-close" onClick={closeKeeping} aria-label="Close">✕</button>
      </div>
      {pending.length ? (
        <>
          {pending.map(r => (
            <div className="bidsheet-row" key={r.id}>
              <span className="lab">Your bid</span>
              <span className="cn-bid" data-testid={`closed-bid-${r.id}`}>
                <b className="cn-code">{displayCell(r.code).replace(/[<>]/g, '')}</b> {portionWord(r.code)} · pending
              </span>
            </div>
          ))}
          <p className="cn-note" data-testid="pending-note">{PENDING_NOTE}</p>
          {pending.map((r, i) => (
            /* round 3's one row (his D1354, 25 Oct 26 — round 3's Q2): the dark box, its till, Document, no labels */
            <ReqWordsRows compact key={r.id} testPrefix={i === 0 ? 'closed' : `closed-${r.id}`} start={date} end={pending.length === 1 ? end : date}
              value={edit[r.id] ?? draftOf(r)}
              onChange={(next, how) => {
                if (how === 'type') return setEdit(e => ({ ...e, [r.id]: next }))
                const patch = patchOf(draftOf(r), next)
                if (patch) setRequestWords(personId, date, r.id, patch)
                setEdit(e => { const { [r.id]: _gone, ...rest } = e; return rest })
              }} />
          ))}
          <div className="bidsheet-row">
            <span className="lab">Selected</span>
            <DeleteChip
              testid="closed-delete"
              onClick={() => {
                /* ONE command for all of them, so one Undo brings them back (M1's code read, L1 / F6): the cell's empty
                   write on a closed day takes exactly his own pending bids there (`ownPendingOnClosedDay`) */
                setCell(personId, date, '')
                onClose()
              }}
            />
          </div>
          {dutyRow}
        </>
      ) : (
        <>
          <p className="cn-note" data-testid="closed-note-text">{CLOSED_NOTE}</p>
          {dutyRow}
          <div className="cn-foot">
            <button type="button" className="dchip plain" data-testid="closed-inputs" onClick={() => { openInputsPage(); onClose() }}>
              Open the Inputs page
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}
