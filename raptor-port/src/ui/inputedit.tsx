/* Editing ONE personal input, wherever it is read from.
   ------------------------------------------------------------------------
   The Inputs page has had a row editor since Aug 26; the owner asked (10 Aug
   26) for the same edit — times, type, remarks and delete — from Edit Schedule
   and the schedule board, writing back to the Inputs page. Two editors over one
   list is how the two drift apart, so everything that is genuinely the EDIT
   lives here and both surfaces call it: the halves, the span control, the draft
   shape, the commit (including the accepted-row relink, which is the part that
   is easy to get wrong) and the delete.

   What is NOT here is the Inputs page's own furniture — the calendar, the
   `till` remarks tail, the pins and the flashes. Those belong to a page that
   is a list; the dialog is a single row, opened from a day. */
import { useEffect, useRef, useState } from 'react'
import { INPUTS, INPUT_TYPES, TYPE_GROUPS, DATES, inpMeta, typeGroup, inputCoversDate, isUnavail, isSansAvail, dateOrd, baseYear } from '../engine/inputs'
import { acceptInput, unacceptInput, acceptedDay, inpKey } from '../engine/slots'
import { DAYS } from '../engine/data'
import { PEOPLE, isSpecial } from '../engine/people'
import { hhmm, parseHM, hmOK } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { logAction } from '../engine/editlog'
import { writeInputsBatch, notify } from '../state/store'
import { canEditSched } from '../state/auth'
import { INPEDIT, setInpEdit } from './pops'
import { useVersion } from './useStore'

/* THE ROSTER LIST, one place — the Inputs page's add form, its own row
   editor and this dialog's new Person field must never disagree on who is
   offered or in what order, so all three call this rather than each sorting
   PEOPLE their own way. */
export const rosterOptions = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
  .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))

const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* yyyy-mm-dd → the stored label ('2026-07-14' → 'Jul 14'). The loaded week's
   year is left implicit so an ordinary date reads 'Jul 14' with no clutter; a
   date in ANY OTHER year keeps its year in the label ('2027-01-03' →
   'Jan 3 2027') so a leave running into the new year sorts and covers correctly
   (dateOrd/inputCoversDate read the year back) and the reader can see at a
   glance it is not this year (owner, 12 Aug 26). */
export const fmt = (d: any) => {
  if (!d) return DATES[0]
  const [y, m, da] = d.split('-')
  const lbl = MON[+m] + ' ' + String(+da)
  return +y === baseYear() ? lbl : lbl + ' ' + y
}
/* fmt's inverse — the model stores 'Jul 14' labels, the calendar speaks
   yyyy-mm-dd. A label carrying a trailing year ('Jan 3 2027') round-trips it;
   a bare one belongs to the loaded week's year, exactly as fmt left it. */
export const unfmt = (lbl: any) => {
  const p = String(lbl || '').trim().split(/\s+/)
  const mi = MON.indexOf(p[0])
  if (mi < 1 || !p[1]) return ''
  const y = p.length > 2 && isFinite(+p[2]) ? +p[2] : baseYear()
  return `${y}-${String(mi).padStart(2, '0')}-${String(+p[1]).padStart(2, '0')}`
}

/* AM is 00:00–12:00 and PM is 12:01 to late, the squadron's own halves (the AM
   start was 04:00 until the owner moved it to midnight, 10 Aug 26 — a man on
   morning leave is off from the start of the day, and an 04:00 start left four
   hours in which the app still thought he was at work).
   The control writes nothing new: it fills in the two time fields the form
   already had, so the engine still reads only s/e. `half` rides along as a
   label, so reopening the editor says "AM" rather than guessing from minutes,
   and the week can print "local leave (AM)".
   Offered for leave and medical only (owner's call) — the other types take an
   exact range, which is finer than a half-day. */
export const HALF_AM: [string, string] = ['00:00', '12:00']
export const HALF_PM: [string, string] = ['12:01', '23:59']
export const hasHalf = (t: string) => !!(inpMeta(t) || {}).half
export type Span = 'all' | 'am' | 'pm' | 'custom'
export const spanOf = (allday: boolean, half: string): Span => allday ? 'all' : half === 'am' ? 'am' : half === 'pm' ? 'pm' : 'custom'
/* what a span means in the four fields it drives */
export const spanFields = (m: Span) => m === 'all' ? { allday: true, half: '', sTime: '06:00', eTime: '18:00' }
  : m === 'am' ? { allday: false, half: 'am', sTime: HALF_AM[0], eTime: HALF_AM[1] }
    : m === 'pm' ? { allday: false, half: 'pm', sTime: HALF_PM[0], eTime: HALF_PM[1] }
      : { allday: false, half: '', sTime: '', eTime: '' }      // custom keeps whatever is typed

const SPANS: Array<[Span, string, string]> = [
  ['all', 'All day', 'The whole day'],
  ['am', 'AM', 'Morning — 00:00 to 12:00'],
  ['pm', 'PM', 'Afternoon and evening — 12:01 onwards'],
  ['custom', 'Custom', 'Type your own start and end time'],
]
export function SpanPicker({ id, span, onPick }: { id: string, span: Span, onPick: (m: Span) => void }) {
  return <div className="spanpick" id={id} role="group" aria-label="How much of the day">
    {SPANS.map(([m, label, title]) =>
      <button key={m} type="button" className={'spanbtn' + (span === m ? ' on' : '')}
        aria-pressed={span === m} title={title} data-span={m}
        onClick={() => onPick(m)}>{label}</button>)}
  </div>
}

/* THE SANS SUB-FORM (owner, 14 Aug 26; reworked the same day) — the only
   place a record's Fly/AMT/OFT flags are typed, shared by the add form, the
   in-table row editor and this file's own modal (the same three surfaces
   SpanPicker already serves). Fly / AMT / OFT, in that display order —
   SANS_KEY in avail.ts maps them to f/o/a, which is a lookup order, not a
   reading order.
   It is FLAGS ONLY now, three checkboxes and nothing else — the owner's own
   phone bug (14 Aug 26): a per-event `<input type=time>` pair could not be
   cleared with one tap, only typed over one digit at a time, and there was
   no way back to "no time stated" short of retyping both ends blank one
   after another. SANS Availability carries its ONE window in the record's
   own standard allday/half/s/e fields now, exactly like a leave input, so
   clearing a timing is the same one tap "All day" already gives every other
   type — SpanPicker draws it, not this picker. */
const SANS_ROWS: Array<[string, string]> = [['f', 'Fly'], ['a', 'AMT'], ['o', 'OFT']]
export function SansPicker({ id, sans, onChange }: { id: string, sans: any, onChange: (next: any) => void }) {
  const set = (k: string, checked: boolean) => {
    const next = { ...(sans || {}) }
    if (checked) next[k] = true; else delete next[k]
    onChange(next)
  }
  return <div className="sanspick" id={id} role="group" aria-label="SANS availability">
    {SANS_ROWS.map(([k, label]) => (
      <label className="sanspick-ck" key={k}>
        <input type="checkbox" checked={!!(sans && sans[k])}
          onChange={e => set(k, e.target.checked)} /> {label}
      </label>
    ))}
  </div>
}
/* Flags only — every ticked key becomes `true`; anything falsy, including a
   legacy `{s,e}` value shape from before the 14 Aug rework, is dropped.
   Shared so the add form and commitInputEdit can never normalise a payload
   two different ways. */
export const sansFlags = (sans: any): any => {
  const flags: any = {}
  for (const k of Object.keys(sans || {})) if (sans[k]) flags[k] = true
  return flags
}
/* THE SANS PAYLOAD REFUSALS — one function, so the add form, the in-table
   editor and this modal (via commitInputEdit) can never disagree on the
   wording. Two checks now the payload is flags-only: restricted to SANS
   aircrew, and at least one box ticked. The record's one window rides the
   SAME span/time validation every other half-day type goes through — there
   is no third check here for it any more. Returns '' when the payload is
   fine to save. */
export function sansRefusal(person: any, sans: any): string {
  if (!PEOPLE[person]?.san) return 'SANS Availability is for SANS aircrew only'
  if (!sans || !Object.keys(sans).some(k => sans[k])) return 'Tick at least one of Fly / AMT / OFT'
  return ''
}

/* THE TYPE CONTROLS. Twenty types is too many for a flat list, so every
   dropdown is cut into the same three groups the legend uses, generated from
   INPUT_META — the list you pick from, the explanation you read and the rule
   the engine applies are one thing. */
export const typeOptions = () => TYPE_GROUPS.map((g: any) =>
  <optgroup key={g.k} label={g.t}>
    {INPUT_TYPES.filter((t: string) => typeGroup(t) === g.k).map((t: string) => <option key={t}>{t}</option>)}
  </optgroup>)

/* The draft is held apart from the model so Cancel is a real cancel. */
export const draftOf = (r: any) => ({
  person: r.person, type: r.type, allday: !!r.allday, half: r.half || '',
  start: unfmt(r.date), end: r.endDate ? unfmt(r.endDate) : '',
  sTime: r.allday ? '06:00' : hhmm(r.s), eTime: r.allday ? '18:00' : hhmm(r.e),
  remarks: r.remarks || '',
  // SANS Availability's own Fly/AMT/OFT payload — a plain object, not derived from s/e/half
  sans: r.sans ? { ...r.sans } : null,
})

/* Commit a draft onto its row. Returns false and toasts when it will not go —
   the caller keeps its editor open on a false, so nothing typed is lost.
   Runs through writeInputsBatch like every other mutation, so an edit joins
   the undo stack as ONE step and re-validates the week. */
export function commitInputEdit(r: any, draft: any) {
  if (!r || !draft) return false
  if (INPUTS.indexOf(r) < 0) {                 // deleted or undone underneath us
    HOOKS.toast('That input is no longer there — nothing was saved', 'warn')
    return false
  }
  const s = draft.allday ? 0 : parseHM(draft.sTime), e = draft.allday ? 1439 : parseHM(draft.eTime)
  if (!draft.allday && (s == null || e == null)) { HOOKS.toast('Give the input a start and end time, or tick All day', 'warn'); return false }
  /* and they have to be times a clock can show. Without this an out-of-range
     value reached the model through the DIALOG even after the cells were
     guarded, and anything past 24:00 was refused only by accident — hhmm()
     turned it into `100:39`, which failed the re-parse above and so complained
     that no time had been given, when one had (audit, 12 Aug 26). */
  if (!draft.allday && (!hmOK(draft.sTime) || !hmOK(draft.eTime))) {
    HOOKS.toast('That is not a time — try 0900 or 09:00', 'warn'); return false
  }
  /* An end EARLIER than the start crosses midnight — 22:00–02:00 is a real
     absence, and a duty row, a sim box and a night sortie have all rolled that
     way since the port (win() in time.ts). Personal inputs were the one row type
     that refused it outright, so an overnight absence could not be recorded at
     all (owner, 11 Aug 26). Only an end EQUAL to the start is refused now: that
     is a zero-length absence, which means nothing either way. The cost of the
     roll is that a transposed 09:00–08:00 becomes a 23-hour absence instead of
     an error — the same trade every other row type on the board already makes. */
  if (!draft.allday && (e as number) === (s as number)) { HOOKS.toast('Give the input a start and end that are not the same time', 'warn'); return false }
  const date = fmt(draft.start), endDate = draft.end && fmt(draft.end) !== date ? fmt(draft.end) : undefined
  /* A SPAN HAS TO RUN FORWARDS. Dates now carry their year whenever it is not
     the loaded week's (fmt above), so a leave into the new year — Dec 28 →
     Jan 3 — stores its end as 'Jan 3 2027', dateOrd orders it AFTER the start,
     and inputCoversDate covers every day between. This used to be refused
     outright: the labels dropped the year, so a yearless 'Jan 3' sorted BEHIND
     'Dec 28' and the leave covered nothing, blocked nothing and vanished from
     the Inputs table; a same-month-and-day span a year long lost its end
     silently the same way (owner, 12 Aug 26 — the fix he then asked for).
     What is STILL refused is a genuinely backwards range — an end that falls
     before its start in real time. The calendar cannot produce one (RangeCal
     flips a reversed second click into the new start), but the write path
     guards it anyway, the same as every other malformed value here. */
  if (endDate) {
    const a = dateOrd(date), b = dateOrd(endDate)
    if (a == null || b == null || b < a) {
      HOOKS.toast('The end date has to fall on or after the start date', 'warn')
      return false
    }
  }
  /* SANS AVAILABILITY IS RESTRICTED TO SANS AIRCREW, AND NEEDS AT LEAST ONE
     BOX TICKED (owner, 14 Aug 26) — an unrestricted or empty record would be
     a type that means nothing, so both are refused here, the one place every
     editor's commit passes through. */
  if (isSansAvail(draft.type)) {
    const why = sansRefusal(draft.person, draft.sans)
    if (why) { HOOKS.toast(why, 'warn'); return false }
  }
  writeInputsBatch(() => {
    /* An ACCEPTED input is linked to the row it created by `src`, a content
       key of person|date|type|s. Editing any of those silently broke the
       link: the row stayed on the programme, undo could no longer find it,
       and it could never be removed. So an accepted input is un-accepted
       through the real path FIRST, edited, then re-accepted — which also
       moves the row when the date moves it to another day. */
    const wasAcc = r.acc
    /* the row may sit on any day the input spans, not its start date */
    const wasDi = wasAcc === 'g' ? acceptedDay(r) : -1
    /* what a SCHEDULER added to the promoted row by hand — extra crew in
       `more`, the red flag, a CX — is not derivable from the input, so the
       unaccept/re-accept relink below used to regenerate the row bare and
       silently discard it (audit, 12 Aug 26). Captured here, before the
       unaccept removes the row (and before the edit can change inpKey),
       and put back onto the regenerated row after the re-accept. */
    let extras: any = null
    if (wasDi >= 0) {
      const oldRow = ((DAYS[wasDi] || {}).ground || []).find((g: any) => g.src === inpKey(r))
      if (oldRow && (oldRow.more?.length || oldRow.flag || oldRow.cx))
        extras = { more: oldRow.more, flag: oldRow.flag, cx: oldRow.cx }
    }
    if (wasAcc) unacceptInput(wasDi, r)
    r.person = draft.person; r.type = draft.type; r.allday = draft.allday
    r.s = s; r.e = e; r.date = date; r.remarks = String(draft.remarks || '').trim(); r.mod = 'now'
    /* SANS Availability used to force allday:true and carry per-event windows
       of its own in `sans` — that is what made a per-event time pair
       impossible to clear on a phone (see SansPicker above). It is a normal
       timed input now: r.allday/s/e/half just above ARE its one window,
       exactly like a leave input, and `sans` here is normalised to flags
       only — which events are offered, never a shape of its own. */
    const flags = sansFlags(draft.sans)
    if (Object.keys(flags).length) r.sans = flags; else delete r.sans
    /* DERIVED from the times, never copied from the draft (audit, 12 Aug 26).
       The in-place cells already derived it (halfOf), but the Inputs page's own
       two time boxes did not: press AM, then type 08:00 over the start, and the
       row kept a half:'am' label describing an 08:00–12:00 window — the week
       and the palette then printed "local leave (LL) (AM)" for a window that is
       not the morning. One derivation for all three editors is the only way the
       label cannot drift from the hours it claims to describe.
       hasHalf too, not just the hours: a type that has no halves (CSE) must
       drop the label even when the times happen to land on one, or it would be
       stranded on a record with no control left to change it. */
    const half = (!draft.allday && hasHalf(draft.type) && s != null && e != null) ? halfOf(s as number, e as number) : ''
    if (half) r.half = half; else delete r.half
    if (endDate) r.endDate = endDate; else delete r.endDate
    if (wasAcc) {
      /* put it back on the day it was on, if the edit still covers that day;
         otherwise its new start date — and if the START label is not itself
         a loaded day, the first loaded day the span still covers. Without
         that last fallback an Unavailable-filed input whose span BEGINS
         before the loaded week (wasDi is always -1 for 'u' — acceptedDay
         answers only 'g') was silently unfiled by any in-place edit, with
         a false "moved outside the programmed week" toast, though no date
         had moved (audit, 12 Aug 26). Mirrors markInputDays semantics. */
      const keep = wasDi >= 0 && DATES[wasDi] && inputCoversDate(r, DATES[wasDi])
      const startDi = DATES.indexOf(r.date)
      const di = keep ? wasDi : (startDi >= 0 ? startDi : DATES.findIndex(dt => inputCoversDate(r, dt)))
      /* acceptInput REFUSES a leave / medical / overseas-duty type — those are
         issued through the Unavailable block and never become a programme row.
         So retyping an accepted Meeting to LL legitimately drops its row, and
         the drop was silent: the un-accept above had already removed it, this
         call returned false unread, and the save still reported success. The
         row vanished from a published programme with nothing said. Say it. */
      if (di >= 0) {
        /* two different refusals, and saying the wrong one is its own bug: the
           TYPE is never accepted (leave/medical/overseas duty), or an identical
           row is already on the programme and a second would make the link
           between input and row ambiguous — see acceptInput. */
        if (!acceptInput(di, r, wasAcc))
          HOOKS.toast(isUnavail(r.type)
            ? `${r.type} does not go on the Ground Programme — its row has been removed`
            : 'An identical row is already on the Ground Programme — this one was not put back', 'warn')
        else if (extras && wasAcc === 'g') {
          const nr = ((DAYS[di] || {}).ground || []).find((g: any) => g.src === inpKey(r))
          if (nr) {
            if (extras.more?.length) nr.more = extras.more
            if (extras.flag) nr.flag = extras.flag
            if (extras.cx) nr.cx = extras.cx
          }
        }
      }
      else HOOKS.toast('Moved outside the programmed week — it is no longer accepted', 'warn')
    }
  })
  return true
}

/* ---- CHANGING THE PUCK (owner, 14 Aug 26 — "allow Unavailable to be
   editable too... even down to changing the puck") ---------------------
   The Unavailable row's person cell plants and drops like any other seat
   (interactions.ts's tap-arm-then-plant, drag.ts's applyDrop) — both call
   this ONE function rather than poking `r.person` themselves, so the
   accepted-row relink above runs exactly once, the same way for a tap, a
   drag or the dialog's own Person field below. No eligibility bar: this is
   a data edit to who is unavailable, not a seat assignment, so any roster
   member (including one already filed unavailable elsewhere, or flying) is
   a legal target. */
export function reassignInput(iid: any, personId: any) {
  /* write-path role backstop (CLAUDE.md: role checks at the write path, not
     only the render). Reassigning WHOSE day an Unavailable row is, is a
     scheduler action — the dialog's Person field and the iu: arm/drop targets
     are already canEditSched()-gated, but this is the one write path and must
     not depend on every future caller remembering to gate first. Distinct from
     commitInputEdit, which a member may legitimately reach to edit their OWN
     input's times/remarks. */
  if (!canEditSched()) return false
  const r = INPUTS.find((i: any) => i.iid === iid)
  if (!r) { HOOKS.toast('That input is no longer there — nothing was changed', 'warn'); return false }
  /* the roster PALETTE (unlike rosterOptions() above) still carries the
     SPECIALS — sentinel placeholders like ALL AVAIL, never real aircrew — so
     a drag or an armed tap can reach here with one even though the dialog's
     own Person field can never offer it. "Unavailable" describes a real
     person's day; a placeholder has no day to describe. */
  if (!PEOPLE[personId] || isSpecial(personId)) return false
  if (r.person === personId) return false           // dropped back on themselves — nothing to say
  const was = PEOPLE[r.person] ? PEOPLE[r.person].cs : String(r.person || '')
  const draft = draftOf(r)
  draft.person = personId
  if (!commitInputEdit(r, draft)) return false
  HOOKS.toast(`${PEOPLE[personId].cs} is now unavailable instead of ${was}`, 'ok')
  return true
}

/* ---- ONE FIELD, TYPED IN PLACE (owner, 10 Aug 26) ------------------------
   "Instead of pressing a type to edit... edit the input directly like changing
   the start and end time... The remarks can be edited as well... in the same
   modality as ground programme." So the times and the remarks are ordinary
   cells on both surfaces now, and each commits one field through the SAME
   commitInputEdit the dialog and the Inputs page use — the accepted-row
   relink is exactly as easy to forget here as anywhere else.

   HOW ALL-DAY IS SAID, now that the two cells are times: CLEAR ONE. That is
   what the engine already believes (`awayAllDay` reads a record with no usable
   window as off for the whole day, and fails closed), so the cell and the rule
   agree without a third control to keep in step.
   It is deliberately ASYMMETRIC with filling one in, and the first cut of this
   was symmetric and WRONG: "blank both cells" could not actually be done. The
   moment the first cell was cleared the other end defaulted to the edge of the
   day and the row stayed timed, so the second cell was never blank at the same
   moment as the first, and an all-day row was a one-way trip. TYPING a time
   still defaults the other end — "from 09:00" is how a scheduler reads a
   half-filled row, and an all-day row has nothing in either cell, so without
   that default typing a start into one would do nothing at all.
   And the AM/PM label is DERIVED here rather than set: times that land exactly
   on a half get it, anything else clears it, so the printed "(AM)" can never
   describe a window that is no longer a half. */
const halfOf = (s:number, e:number) => (s === 0 && e === 720) ? 'am' : (s === 721 && e === 1439) ? 'pm' : ''
export function setInpField(inp: any, field: 'str' | 'end' | 'rmks', text: any) {
  if (!inp) return false
  const d: any = draftOf(inp)
  if (field === 'rmks') { d.remarks = String(text == null ? '' : text) }
  else {
    const cur: any = { str: d.allday ? '' : d.sTime, end: d.allday ? '' : d.eTime }
    cur[field] = String(text == null ? '' : text).trim()
    /* an unreadable time is a typo, not a clear — refuse it and let the cell
       heal back, the same way txtSet does for a schedule field */
    for (const k of ['str', 'end']) {
      /* hmOK, not parseHM: the format test alone let an OUT-OF-RANGE clock
         through (audit, 12 Aug 26). `2570` parsed to 26:10 and the absence
         then overlapped nothing on its own day — a man on leave lost every
         warning he had and was offered for the very seat he was off for,
         while the leave reappeared on the NEXT day through the midnight
         tail. Same test the schedule cells use (engine/time.ts). */
      if (cur[k] && !hmOK(cur[k])) { HOOKS.toast('That is not a time — try 0900 or 09:00', 'warn'); return false }
    }
    if (!cur[field]) { d.allday = true; d.half = '' }      // the cell just cleared
    else {
      const s = cur.str ? parseHM(cur.str) as number : 0
      const e = cur.end ? parseHM(cur.end) as number : 1439
      d.allday = false; d.sTime = hhmm(s); d.eTime = hhmm(e); d.half = halfOf(s, e)
    }
  }
  return commitInputEdit(inp, d)
}
/* Deleting an ACCEPTED input used to leave its ground row on the programme for
   good — nothing pointed at it any more, so it could never be removed and it
   still printed and validated as a real commitment. */
export function removeInput(r: any) {
  const inx = INPUTS.indexOf(r)
  if (inx < 0) { HOOKS.toast('That input is no longer there', 'warn'); return false }
  /* WHAT was deleted, and which day it logs against — captured before the
     splice below, the same "read the row, then remove it" order every
     deletion in board.ts follows. di follows interactions.ts:424's rule for
     this same input machinery: the day it is actually live on when it has
     one (accepted into that day's ground programme), else null — an input
     that was never accepted has no day to pin the removal to. */
  const di = r.acc ? acceptedDay(r) : -1
  const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
  const when = r.date + (r.endDate ? '–' + r.endDate : '')
  writeInputsBatch(() => {
    if (r.acc) unacceptInput(acceptedDay(r), r)
    INPUTS.splice(inx, 1)
  })
  logAction(di >= 0 ? di : null, `Input removed — ${cs}, ${r.type}, ${when}`)
  return true
}

/* ---- the dialog the week and the board open (owner, 10 Aug 26) -----------
   A modal rather than an in-place row editor, because both surfaces that open
   it are string-built and swapped wholesale on every repaint: a set of live
   fields inside that markup would lose its caret the first time anything else
   on the day changed. It is a SIBLING of the shell and the board (App.tsx),
   the same place CxDialog sits, so it paints above whichever of the two opened
   it.

   The row itself is held, never its index or its key: undo is still live under
   the modal, and both renumber INPUTS and rewrite the content key an accept
   button would have carried.

   DATES ARE STILL NOT HERE — moving the span makes the row vanish from the
   day you opened it from, which is the Inputs page's job, and the footer
   says so. PERSON now IS here (owner, 14 Aug 26 — "allow Unavailable to be
   editable too... even down to changing the puck"), but only for a
   scheduler: reassigning changes WHOSE row this is, not which day it sits
   on, so it stays inside what this dialog already keeps in view — unlike a
   date move, the row you are looking at is still the row you are looking
   at afterwards, just under a different name. */
export function InputEditor() {
  useVersion()
  const r = INPEDIT
  const open = !!r
  const [draft, setDraft] = useState<any>(null)
  const box = useRef<HTMLDivElement>(null)
  /* re-seed whenever a different row is opened, never on a repaint — a
     re-seed mid-edit would throw away what has been typed */
  useEffect(() => { setDraft(r ? draftOf(r) : null) }, [r])
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [open])

  const close = () => { setInpEdit(null); notify() }
  /* a refusal KEEPS the dialog open, so nothing typed is lost — bar the one
     refusal there is no way back from: the row went (an undo under the modal),
     and there is nothing left to hold the typing for */
  const save = () => {
    if (commitInputEdit(r, draft)) { HOOKS.toast('Input updated', 'ok'); close() }
    else if (INPUTS.indexOf(r) < 0) close()
  }
  const del = () => { if (removeInput(r)) { HOOKS.toast('Input deleted', 'ok'); close() } }

  const who = r && PEOPLE[r.person] ? PEOPLE[r.person].cs : (r ? String(r.person) : '')
  const when = r ? (r.date + (r.endDate ? ' → ' + r.endDate : '')) : ''
  const span = draft ? spanOf(draft.allday, draft.half) : 'all'

  return (
    <div className="airpop" id="inpEditPop" hidden={!open}
      onClick={e => { if ((e.target as HTMLElement).id === 'inpEditPop') close() }}>
      <div className="airpop-box inpedbox" ref={box}>
        <div className="airpop-head">
          <b id="inpEditTitle">{who}{when ? ' · ' + when : ''}</b>
          <button className="x" id="inpEditClose" aria-label="Close" onClick={close}>✕</button>
        </div>
        {draft && <div className="airpop-body inped-body">
          {/* SCHEDULER ONLY (owner, 14 Aug 26 — "allow Unavailable to be
              editable too... even down to changing the puck"). A member
              opening their own input never reaches this dialog at all today
              (the buttons that open it only render in an admin's edit mode),
              but the gate is repeated here anyway rather than trusted to
              that — canEditSched() is the same check every other
              admin-only control in this dialog's callers already uses. */}
          {canEditSched() && <label className="inped-f">
            <span className="inped-k">Person</span>
            <select id="inpEditPerson" aria-label="Person" value={draft.person}
              onChange={e => setDraft({ ...draft, person: e.target.value })}>
              {rosterOptions().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
            </select>
          </label>}
          <label className="inped-f">
            <span className="inped-k">Type</span>
            <select id="inpEditType" aria-label="Type" value={draft.type}
              onChange={e => {
                const t = e.target.value
                /* a type with no halves cannot keep a half label — it would
                   read "(AM)" on a row the picker can no longer express.
                   Switching TO SANS Availability seeds an empty payload for
                   the picker below to fill; switching AWAY drops it — a
                   record for a different type carrying a stale sans object
                   would be dead weight nothing reads. */
                setDraft({
                  ...draft, type: t, ...(hasHalf(t) ? {} : { half: '' }),
                  sans: isSansAvail(t) ? (draft.sans || {}) : null,
                })
              }}>{typeOptions()}</select>
          </label>
          {/* the F/O/A ticks sit ABOVE the standard timing controls now, not
              in place of them (owner rework, 14 Aug 26) — SANS Availability
              is a normal timed input with one extra field, and its single
              window is the SAME 'When' block below every other half-day
              type already uses (hasHalf('SANS Availability') is true). */}
          {isSansAvail(draft.type) && <div className="inped-f">
            <span className="inped-k">Availability</span>
            <SansPicker id="inpEditSans" sans={draft.sans} onChange={sans => setDraft({ ...draft, sans })} />
          </div>}
          <div className="inped-f">
            <span className="inped-k">When</span>
            <div className="inped-when">
              {hasHalf(draft.type)
                ? <SpanPicker id="inpEditSpan" span={span} onPick={m => {
                  const f = spanFields(m)
                  setDraft({
                    ...draft, allday: f.allday, half: f.half,
                    /* Custom keeps whatever is already in the boxes — the
                       point of it is to adjust the times you can see */
                    ...(m === 'custom' ? {} : { sTime: f.sTime, eTime: f.eTime }),
                  })
                }} />
                : <label className="inped-ad"><input type="checkbox" id="inpEditAllday" checked={draft.allday}
                  onChange={e => setDraft({ ...draft, allday: e.target.checked, half: '' })} /> all day</label>}
              <span className="inped-t" hidden={draft.allday}>
                <input type="time" id="inpEditStart" aria-label="Start time" value={draft.sTime}
                  onChange={e => setDraft({ ...draft, sTime: e.target.value, half: '' })} />
                <input type="time" id="inpEditEnd" aria-label="End time" value={draft.eTime}
                  onChange={e => setDraft({ ...draft, eTime: e.target.value, half: '' })} />
              </span>
            </div>
          </div>
          <label className="inped-f">
            <span className="inped-k">Remarks</span>
            <input id="inpEditRmk" aria-label="Remarks" maxLength={200} value={draft.remarks} autoComplete="off"
              placeholder="e.g. medical appt, till 15 Jul"
              onChange={e => setDraft({ ...draft, remarks: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') save() }} />
          </label>
          <div className="inped-hint">{canEditSched()
            ? 'The dates are changed on the Inputs page.'
            : 'The person and the dates are changed on the Inputs page.'}</div>
        </div>}
        <div className="airpop-foot">
          <button className="abtn danger" id="inpEditDel" onClick={del}>Delete</button>
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" id="inpEditCancel" onClick={close}>Cancel</button>
          <button className="abtn primary" id="inpEditSave" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
