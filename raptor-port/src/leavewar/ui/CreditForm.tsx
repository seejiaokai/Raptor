// The credit form, and the day chip it is built on.
//
// Both lived inside OilTracker.tsx until 6 Sep 26, when the grid grew a bar of
// its own: a drag down a figure column picks a run of people and the bar takes
// ONE number for all of them (BalanceBar.tsx). That bar wants the tracker's
// form, not a second one — the same fields, the same refusals, the same wording
// — so the form moved out here and the tracker imports it back. Two credit
// surfaces, one body: they cannot drift into disagreeing about what a valid
// grant is, and the STORE (grantTo) still has the last word on both.

import { useState, type KeyboardEvent, type ReactNode } from 'react'
import type { CounterName } from '../engine'
import { grantTo, MAX_GIVEN_BY, MAX_REASON, reasonRequired } from '../state/store'
import { DateBox } from '../../ui/DateBox'
import './oiltracker.css'

/** A single day behind a box: the box reads the day, a tap opens the app's one
 *  date calendar over the page (ui/DateBox.tsx), a tap on a day picks it and
 *  closes it. The date of an OIL credit is one box among the form's others, so
 *  it opens OVER the form (owner D797; step two of the one date calendar —
 *  D901, 15 Oct 26). It was the Leave War's range calendar bent to one day,
 *  under a chip. */
export function DayChip({ testid, value, today, onPick }: {
  testid: string
  value: string
  today: string
  onPick: (d: string) => void
}) {
  return <DateBox label="Date" testid={testid} className="oil-datebox" value={value} today={today} noWeekday onChange={onPick} />
}

/**
 * The typed days, signed: `2` and `+2` add, `-2` (or `−2`) subtracts (owner,
 * 6 Sep 26 — "if I put 2 or +2 it means the same thing, only minus is −2").
 * With no sign typed the `sign` chip decides — a phone's decimal keypad has no
 * minus key, so the chip is the phone's way to a correction. Null for anything
 * that is not a plain number; the STORE rules the rest (non-zero, halves) so
 * this form, the tracker and any future caller cannot disagree with it.
 */
export function parseAmount(raw: string, sign: 1 | -1 = 1): number | null {
  const t = raw.trim().replace(/^−/, '-')
  if (!/^[+-]?\d*\.?\d+$/.test(t)) return null
  const n = Number(t)
  return /^[+-]/.test(t) ? n : n * sign
}

/**
 * The credit form — one amount, a date, a reason, an optional "given by", for
 * one or many people — on OIL (the tracker, and the figures bar's OIL column)
 * and, since 6 Sep 26, on ANY pool from the figures bar, where a plain pool
 * takes the number alone (`reasonRequired`, the store's own predicate — the
 * date is today, the approver is stamped). Its own component so its draft
 * state resets with the people it is for (the caller keys it).
 */
export function CreditForm({ counter, ids, who, today, initialAmount = '1', autoFocus = false, onDone, onCancel }: {
  counter: CounterName
  ids: string[]
  who: ReactNode
  today: string
  /** The tracker opens on `1`; the grid's bar opens EMPTY — a missing number
   *  fails closed, so an idle Enter can never add a day. */
  initialAmount?: string
  autoFocus?: boolean
  onDone: () => void
  /** Present on the grid's bar (its ✕ and Escape); the tracker clears its
   *  selection by an outside tap instead. */
  onCancel?: () => void
}) {
  const full = reasonRequired(counter)
  const [amt, setAmt] = useState(initialAmount)
  const [sign, setSign] = useState<1 | -1>(1)
  const [date, setDate] = useState(today)
  const [reason, setReason] = useState('')
  const [given, setGiven] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    const n = parseAmount(amt, sign)
    const problem = n === null ? 'Type the days — 2 adds, -2 subtracts' : grantTo(ids, counter, n, date, reason, given)
    if (problem) { setErr(problem); return }
    onDone()
  }
  const keys = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape' && onCancel) { e.stopPropagation(); onCancel() }
  }
  // No `plain` modifier on the short form (review, 6 Sep 26): no rule ever read
  // it, and a class that styles nothing reads as a hook something depends on.
  // What the short form drops is plain in the markup — `full` gates the date,
  // the reason and the given-by. Add one back with a rule the day the short bar
  // needs a look of its own.
  return (
    <div className="oil-bar form" data-testid="oil-credit-panel">
      <b className="oil-who" data-testid="oil-credit-who">{who}</b>
      <button
        className="tchip sign"
        data-testid="oil-sign"
        aria-pressed={sign < 0}
        aria-label={sign < 0 ? 'Subtracting — tap to add instead' : 'Adding — tap to subtract instead'}
        onClick={() => setSign(s => (s < 0 ? 1 : -1))}
      >{sign < 0 ? '−' : '+'}</button>
      <input
        type="text"
        inputMode="decimal"
        className="oil-num"
        data-testid="oil-amt"
        value={amt}
        placeholder="days"
        autoFocus={autoFocus}
        aria-label="Days — 2 or +2 adds, -2 subtracts"
        // Editing the number clears the last refusal (review, 6 Sep 26): the
        // message names what was wrong with the value that WAS typed, so left
        // standing over a new one it reads as a fresh rejection of a draft
        // nothing has judged yet.
        onChange={e => { setErr(''); setAmt(e.target.value) }}
        onKeyDown={keys}
      />
      {full && <DayChip testid="oil-date" value={date} today={today} onPick={setDate} />}
      {full && (
        <input className="oil-text" data-testid="oil-reason" maxLength={MAX_REASON} value={reason} placeholder="reason" aria-label="Reason" onChange={e => setReason(e.target.value)} onKeyDown={keys} />
      )}
      {full && (
        <input className="oil-text given" data-testid="oil-given" maxLength={MAX_GIVEN_BY} value={given} placeholder="given by (optional)" aria-label="Given by" onChange={e => setGiven(e.target.value)} onKeyDown={keys} />
      )}
      <button className="dchip approve" data-testid="oil-credit-save" onClick={save}>Save</button>
      {onCancel && <button className="dchip cancel" data-testid="oil-credit-cancel" aria-label="Cancel" onClick={onCancel}>✕</button>}
      {err && <span className="note warn" data-testid="oil-credit-err">{err}</span>}
    </div>
  )
}
