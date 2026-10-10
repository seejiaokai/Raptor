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
import { FloatWin, bringForward } from './FloatWindow'
import { frontWin } from './floatwin'
import { placedLine, placedLineOf } from './placedline'
import { PeoplePick, PlaceholderGroup, pickProblem } from './PeoplePick'
import { entryRowsOf } from '../state/inputgroup'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { INPUTS, INPUT_TYPES, TYPE_GROUPS, TITLE_MAX, titledKind, titleOf, DATES, inpId, inpMeta, inpType, typeGroup, isoLabel, inputCoversDate, isPersonal, isUnavail, isSansAvail, isUpchit, isDownchit, isLeave, needsDoc, defaultAllday, dateOrd, dateIx, baseYear, withRemarksTail, remarksTailWord, oilAsks, nowStamp, placeholderProblem } from '../engine/inputs'
import { upchitTrimPlan, upchitEffects, newMedTrimPlan, medClashes, subtractSpans, medStartOrd, medEndOrd, ordLabel } from '../engine/medical'
import { UpchitConfirm } from './UpchitConfirm'
import { MedClashConfirm } from './MedClashConfirm'
import { OilConfirm } from './OilConfirm'
import { DocConfirm } from './DocConfirm'
import { docAdd, docFields, docGet, rowDocIds } from '../state/docs'
import { ClipIcon, UploadIcon } from './icons'
import { acceptInput } from '../engine/slots'
import { PEOPLE, isSpecial, whoId } from '../engine/people'
import { hhmm, parseHM, hmOK } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { logAction, elogSweep, todayIso } from '../engine/editlog'
import { elogReason } from '../state/changelines'
import { stampPlaced, stampChanged } from '../state/inputstamp'
import { writeInputsBatch, notify, protectedDates, inputProtected } from '../state/store'
/* The Leave War seam (sync.ts is the one crossing point, CLAUDE.md §The Leave
   War tab): retracting a synced row's war cells when it is edited or deleted
   here — not a new seam, a Raptor-side caller of the existing one. */
import { oilAskPlan } from '../leavewar/sync'
import { leaveKey } from '../leavewar/absences'
import { voidedOil, repricedOil } from '../engine/oil'
import { newId } from '../engine/newid'
import { CmdRefused } from '../command'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { CURWEEK } from '../engine/waves'
import { keyToIso, mondayOf } from './weeknav'
import { canEditSched } from '../state/auth'
import { me, isMe, mayEditInput, mayDeleteInput, mayFileInputFor, membersFileOn, memberFilesForOthers, filerSwitchedOff } from '../state/perms'
import { INPEDIT, setInpEdit, OILASK, setOilAsk, setMedMove, setDocView } from './pops'
import { CURPAGE, revealInput } from '../state/view'
import { useVersion } from './useStore'
import { RangeCal } from './RangeCal'
import { TypeLegend } from './TypeLegend'
import { clickedOutside } from './outside'

/* THE ROSTER LIST, one place — the Inputs page's add form, its own row
   editor and this dialog's new Person field must never disagree on who is
   offered or in what order, so all three call this rather than each sorting
   PEOPLE their own way. */
export const rosterOptions = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
  .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))
/* [ARCH-STACK] step 4 (clash check H5, owner answer C, 20 Sep 26): an admin
   can still FILE leave for someone who has posted out (clearing leave) or has
   not posted in yet — so the Inputs page's own person pickers offer the
   archived bodies too, in their own group below the roster. Every OTHER roster
   surface (the board, the palette, reassign) keeps rosterOptions(). */
/* never a DELETED man — he is on no list ([POST-OUT-OUTCOMES], D287, D299) */
export const archivedOptions = () => Object.keys(PEOPLE).filter(id => PEOPLE[id].archived && !PEOPLE[id].special && !PEOPLE[id].deleted)
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
/* ISO 'yyyy-mm-dd' → a DAY-FIRST label ('2026-07-13' → '13 Jul'), the voice
   the Inputs page now speaks throughout (owner, 21 Aug 26 — "standardise the way
   the inputs are shown"). Same year rule as fmt: this year stays implicit, any
   other keeps its full year so a leave into January still reads unambiguously
   ('2027-01-03' → '3 Jan 2027'). Display only — the model still stores the
   month-first labels fmt/unfmt round-trip. */
export const fmtDay = (iso: any) => {
  if (!iso) return ''
  const [y, m, da] = String(iso).split('-')
  if (!m) return String(iso)
  const lbl = String(+da) + ' ' + MON[+m]
  return +y === baseYear() ? lbl : lbl + ' ' + y
}
/* ISO 'yyyy-mm-dd' → a 'day month year' STAMP with a two-digit year
   ('2026-07-06' → '6 Jul 26'), matching the app's own week voice ('13 Jul 26').
   Anything stamped TODAY reads "now" — the display kept from when 'now' was
   stored literally (ARCH-STACK 1b froze the stored stamp to an ISO date, so a
   this-session edit is today's ISO; the column still says "now" for it, and
   shows the real date once the record is a day old). The legacy literal 'now'
   still maps through for any pre-freeze record. This is the one date the owner
   named — the Inputs page's Last-modified column (owner, 21 Aug 26 — "change the
   modified date to show day month year"). */
export const fmtDMY = (iso: any) => {
  const s = String(iso || '')
  if (!s || s === 'now' || s === nowStamp()) return s === '' ? s : 'now'
  const [y, m, da] = s.split('-')
  if (!m) return s
  return `${+da} ${MON[+m] || ''} ${String(y).slice(2)}`
}
/* `yr` is the row's own anchor year (24 Aug 26): a bare label on a record
   belongs to the year the record was created under, not to whatever week is
   loaded when it is next opened for edit — without it, editing a 2026 input
   from a 2027 week silently re-dated it a year forward. */
export const unfmt = (lbl: any, yr?: any) => {
  const p = String(lbl || '').trim().split(/\s+/)
  const mi = MON.indexOf(p[0])
  if (mi < 1 || !p[1]) return ''
  const y = p.length > 2 && isFinite(+p[2]) ? +p[2] : (isFinite(+yr) && +yr > 0 ? +yr : baseYear())
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
/* This is the ONE place the input colour code is decided — the Inputs
   table's row stripes and the month calendar's chips (a view built in
   parallel) both import this instead of each re-deriving its own tone, so
   the two surfaces cannot drift apart. Red = a man who is absent (leave,
   medical, OD); amber = a local commitment (activity / duty & other
   commitments); purple = SANS Availability, wearing the same `--san`
   purple the rest of the app already reads as SANS. */
export const inputTone = (t: any) => isSansAvail(t) ? 'san' : isUpchit(t) ? 'amb' : isUnavail(t) ? 'red' : 'amb'
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

/* ONE SANS RECORD PER DAY (bug-test fix). SANS Availability is one window per
   record: two records covering the same person on the same day break silently —
   sansGate/sansAvailOn (engine/inputs.ts) read only the FIRST, and the card grid
   draws BOTH. (The edit-address half of this hazard is gone since 13 Sep 26:
   cards address the input by its stable inpId, not the shared inpKey, so a click
   can no longer edit or delete the wrong record — but sansGate still reads only
   the first, which is reason enough to keep the rule.) So refuse a new/edited record whose date RANGE
   overlaps an existing SANS record for the same person; `except` is the row
   being edited, which never clashes with itself. To offer two windows on one
   day the member ticks both events on the one record — the feature's own model.
   Returns '' when clear. */
export function sansOverlapRefusal(person: any, date: any, endDate: any, except: any): string {
  const na = dateOrd(date), nb = dateOrd(endDate || date)
  if (na == null || nb == null) return ''
  const clash = INPUTS.some((x: any) => {
    if (x === except || x.person !== person || !isSansAvail(x.type)) return false
    /* each existing record's labels resolve through ITS anchor year — a
       record for this month/day LAST year is not a clash (24 Aug 26) */
    const a = dateOrd(x.date, x.yr), b = dateOrd(x.endDate || x.date, x.yr)
    return a != null && b != null && na <= b && a <= nb
  })
  return clash ? 'A SANS availability is already filed for one of these days — edit that entry instead of adding another' : ''
}

/* ---- THE MEDICAL REFUSALS AND THE TRIM APPLIER (owner, 27 Aug 26) --------
   Same-type medical overlap is REFUSED — the person is told to edit the
   entry already on file (and attach the new document to it), because two
   same-type records over one day share an edit address exactly like the
   SANS case above. A DIFFERENT-type overlap is not refused: the new input
   wins its days and the planner (engine/medical.ts) trims the old one — the
   applier below is the write half of that plan. */
export function medOverlapRefusal(person: any, type: any, date: any, endDate: any, except: any): string {
  const na = dateOrd(date), nb = dateOrd(endDate || date)
  if (na == null || nb == null) return ''
  const t = inpType(type)
  const clash = INPUTS.some((x: any) => {
    if (x === except || x.person !== person || !isDownchit(x.type) || inpType(x.type) !== t) return false
    const a = dateOrd(x.date, x.yr), b = dateOrd(x.endDate || x.date, x.yr)
    return a != null && b != null && na <= b && a <= nb
  })
  /* the article follows the initials as they are said — an A-T-T C, an H-L, an O-M-L (W2's re-walk, 26 Sep 26) */
  const an = /^[AEFHILMNORSX]/i.test(String(t)) ? 'An' : 'A'
  return clash ? `${an} ${t} is already filed over these days — edit that entry instead, and attach the new document to it` : ''
}
/* An upchit is ONE date closing a real, still-open medical-down period —
   four refusals: a ranged upchit, an upchit with nothing on file to close,
   one for an episode ALREADY closed (a second later-dated upchit would trim
   nothing and sit in Upchit Complete as paperwork for no event), and a
   second upchit on the same day (the shared-edit-address hazard again). */
export function upchitRefusal(person: any, date: any, endDate: any, except: any): string {
  if (endDate) return 'An upchit is a single date — pick the day he is medically up'
  const x = dateOrd(date)
  if (x == null) return ''
  /* something to close: a downchit COVERING x (this upchit will trim it to
     end the day before — the upchit day is a fit day, owner 27 Aug 26), or
     an expired one still unanswered — no upchit already on/after its end
     (the same covering test pendingUpchits reads, so the refusal and the nag
     cannot disagree about what "open" means; >= also admits the canonical
     day-after closer) */
  let running = false, latestEnd: any = null
  for (const r of INPUTS) {
    if (!isDownchit(r.type) || r.person !== person) continue
    const a = dateOrd(r.date, r.yr), b = dateOrd(r.endDate || r.date, r.yr)
    if (a == null || b == null || a > x) continue
    if (b >= x) { running = true; break }
    if (latestEnd == null || b > latestEnd) latestEnd = b
  }
  if (!running && latestEnd == null) return 'There is no medical-down entry to upchit — file the medical input first'
  if (!running) {
    const answered = INPUTS.some((r: any) => {
      if (r === except || r.person !== person || !isUpchit(r.type)) return false
      const o = dateOrd(r.date, r.yr)
      return o != null && o >= latestEnd
    })
    if (answered) return 'That medical-down period is already closed — edit the existing upchit instead'
  }
  const dup = INPUTS.some((r: any) => r !== except && r.person === person && isUpchit(r.type) && dateOrd(r.date, r.yr) === x)
  return dup ? 'An upchit is already filed for that day — edit that entry instead' : ''
}

/* A downchit cannot RUN OVER — or END ON — one of the person's upchits: the
   upchit day itself is a FIT day (owner, 27 Aug 26), so a downchit covering
   it would read "medically down" and "medically up" at once, and the Medical
   view would list him in two sections. The trimmed convention is now
   end-the-day-before (down 10–13, upchit 12 → 10–11), which is why ending ON
   the date conflicts too. STARTING on it stays allowed — a man cleared in
   the morning and down again the same day is a new episode, not a
   contradiction. The refusal follows the edit-that-entry shape of its
   siblings above. */
export function downOverUpchitRefusal(person: any, date: any, endDate: any): string {
  const na = dateOrd(date), nb = dateOrd(endDate || date)
  if (na == null || nb == null) return ''
  const hit = INPUTS.find((r: any) => {
    if (r.person !== person || !isUpchit(r.type)) return false
    const o = dateOrd(r.date, r.yr)
    return o != null && o > na && o <= nb
  })
  return hit ? `An upchit is filed for ${hit.date} — edit or delete that entry first` : ''
}
/* ord (dateOrd form) → ISO, for the remarks-tail rewrites here and in the
   clash-segment writers the forms run */
/** a draft's own date ('2026-01-16') as the number the medical rules compare (20260116). A DRAFT'S DATES ARE WHOLE
 *  DATES — year and all — so this is the one honest way to ask "which days would this save take": the label a date is
 *  STORED under leaves its year out when it is the loaded week's, and reading such a label back in the record's OLD
 *  year asked the medical question about the wrong year (both readers of the input card's check, 10 Oct 26 — a
 *  downchit moved from next year onto another medical entry of this year was saved with no question, the other entry
 *  cut in silence). */
export const isoOrd = (iso: any): number => +String(iso || '').replace(/-/g, '')
export const ordISO = (o: any) => `${Math.floor(o / 10000)}-${String(Math.floor(o / 100) % 100).padStart(2, '0')}-${String(o % 100).padStart(2, '0')}`
/* Apply a trim plan from engine/medical.ts. Runs INSIDE the caller's
   writeInputsBatch so the new input and the rows it shortens land as ONE
   undo step. A delete goes through dropInputRow (Leave-War retraction and
   the ground-row un-accept both live there); a trim follows
   commitInputEdit's own discipline for a Leave-War-synced row — the span is
   part of the sync signature, so the old grant is withdrawn first and the
   lw tag dropped, and the next reconcile lands the shorter span as
   Raptor-owned cells. The remarks "till …" token is the calendar's to
   rewrite (withRemarksTail), so "ATT C till 13 Jul" follows the new end
   while the typist's own words stay. inpKey is person|date|type|s — an
   end-trim moves none of them, so no accepted-row relink is needed. */
export function applyMedPlan(plan: any[]) {
  if (medPlanProtected(plan)) { medicalLocked(); return false }
  const cs = (r: any) => (PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person)
  for (const p of plan || []) {
    const r = p.row
    /* The surviving TAIL of a row the new input only partly covered — minted
       BEFORE the head is trimmed or dropped, while the row still says what it
       covered. A second row of the same type, person, year anchor and
       document (the certificate covers the whole original episode), spanning
       the days past the new input's end: the new input wins exactly its own
       days, and the man does not silently read as fit for the rest of a long
       downchit because a two-day one landed in the middle of it. */
    if (p.tail && p.tail.startOrd != null && p.tail.endOrd != null) {
      const t: any = { ...r, date: ordLabel(p.tail.startOrd, r.yr), mod: nowStamp() }
      delete t.iid          // its own address, minted below — never a copy
      delete t.lw           // a plain Raptor row; the war re-lands it inbound
      delete t.acc
      if (p.tail.endOrd > p.tail.startOrd) t.endDate = ordLabel(p.tail.endOrd, r.yr)
      else delete t.endDate
      t.remarks = withRemarksTail(r.remarks, ordISO(p.tail.startOrd), ordISO(p.tail.endOrd), 'till')
      inpId(t)
      /* a piece of the old record: it keeps who placed that (the copy carries `by` and `at`), changed now (D629) */
      stampChanged(t)
      INPUTS.push(t)
      elogReason(t.iid, 'the tail of a split medical entry')
    }
    /* Every cut leaves a line in the day log — the trim cascade is the one
       writer of medical paperwork that is not a person's own hand, and a row
       that shortens or vanishes with no record anywhere is exactly the
       untraceable edit the log exists to end. */
    if (p.action === 'delete') {
      /* `why` lets the caller log the honest reason — an upchit's removals say
         so, instead of every delete claiming "overwritten by a newer entry" */
      /* the line is the change history's one writer's (state/changelines.ts — Astra DP-03); the reason rides in */
      elogReason(r.iid, p.why || 'overwritten by a newer medical entry')
      dropInputRow(r)
      continue
    }
    if (p.action !== 'trim' || p.newEndOrd == null) continue
    /* [ARCH-STACK] step 4: the Leave War READS this row — trimming it trims the
       war with nothing to retract. */
    const a = dateOrd(r.date, r.yr)
    if (a != null && p.newEndOrd <= a) delete r.endDate
    else r.endDate = ordLabel(p.newEndOrd, r.yr)
    r.remarks = withRemarksTail(r.remarks, a != null ? ordISO(a) : '', ordISO(p.newEndOrd), 'till')
    r.mod = nowStamp()
    stampChanged(r)
    elogReason(r.iid, 'cut by a medical')
  }
}

/* THE CLASH RESOLUTION (owner, 27 Aug 26 — a new medical entry that overlaps
   a DIFFERENT-type one asks at save time who holds the shared days, exactly
   like the upchit sheet). Given the sheet's per-clash choices ('new' — the
   new entry takes the shared days, today's programmatic default — or 'old' —
   the existing status keeps them), the day segments the new entry actually
   keeps: the kept statuses' whole spans are subtracted, so a 'kept' row is
   never trimmed (the segments cannot touch it) and the choice needs no
   second enforcement anywhere. Empty = the kept statuses cover every day of
   the new entry — toasted here, and the caller writes nothing. */
export function medKeptSegments(aOrd: any, bOrd: any, clashes: any[], choices: string[]) {
  const winners = clashes
    .filter((_: any, i: number) => choices[i] === 'old')
    .map((c: any) => ({ s: medStartOrd(c.row), e: medEndOrd(c.row) }))
  const segs = subtractSpans(aOrd, bOrd, winners)
  if (!segs.length) HOOKS.toast('The statuses you kept cover every day of this entry — nothing left to file', 'warn')
  return segs
}
/* Mint the 2nd..nth kept segments as SIBLING rows of `base` (same person,
   type, times and document — the applyMedPlan tail idiom: the certificate
   covers the whole filed episode), each trimmed against whatever it still
   overlaps — only rows the filer chose to overwrite, since kept rows are
   outside every segment by construction. Runs INSIDE the caller's
   writeInputsBatch so the whole resolution is one undo step. */
export function mintMedSegments(base: any, segs: any[], keepTail?: any, entryEnd?: any) {
  if (medSegmentsProtected(base, segs, keepTail, entryEnd)) { medicalLocked(); return false }
  const cs = PEOPLE[base.person] ? PEOPLE[base.person].cs : base.person
  for (const g of segs) {
    const t: any = { ...base, date: ordLabel(g.startOrd, base.yr), mod: nowStamp() }
    delete t.iid          // its own address, minted below — never a copy
    delete t.lw           // a plain Raptor row; the war re-lands it inbound
    delete t.acc
    if (g.endOrd > g.startOrd) t.endDate = ordLabel(g.endOrd, base.yr)
    else delete t.endDate
    t.remarks = withRemarksTail(base.remarks, ordISO(g.startOrd), ordISO(g.endOrd), 'till')
    inpId(t)
    /* a sibling of `base`: who placed it is base's (a new filing's own filer, or the edited record's — D629) */
    stampChanged(t)
    INPUTS.push(t)
    elogReason(t.iid, 'a kept piece of a split medical entry')
    applyMedPlan(newMedTrimPlan(t.person, t.type, g.startOrd, g.endOrd, t, keepTail, entryEnd))
  }
}

/* THE TYPE CONTROLS. Twenty types is too many for a flat list, so every
   dropdown is cut into the same three groups the legend uses, generated from
   INPUT_META — the list you pick from, the explanation you read and the rule
   the engine applies are one thing.
   `allow` (owner, 19 Aug 26) narrows the list for the board's context-bound
   adds — the Ground Programme's + Inputs offers activity types only, the
   Unavailable + Add leave/medical/OD only — without minting a second list
   that could drift; a group whose every type is filtered out is skipped
   rather than left as an empty heading. No filter = the full list, which is
   what every EDIT and the Inputs page keep. */
export const typeOptions = (allow?: (t: string) => boolean) => TYPE_GROUPS.map((g: any) => {
  const ts = INPUT_TYPES.filter((t: string) => typeGroup(t) === g.k && (!allow || allow(t)))
  return ts.length ? <optgroup key={g.k} label={g.t}>{ts.map((t: string) => <option key={t}>{t}</option>)}</optgroup> : null
})

/* The draft is held apart from the model so Cancel is a real cancel. */
export const draftOf = (r: any) => ({
  person: r.person, type: r.type, allday: !!r.allday, half: r.half || '',
  start: unfmt(r.date, r.yr), end: r.endDate ? unfmt(r.endDate, r.yr) : '',
  sTime: r.allday ? '06:00' : hhmm(r.s), eTime: r.allday ? '18:00' : hhmm(r.e),
  remarks: r.remarks || '',
  /* the input's own title ([INPUT-OWN-TITLE], D715): NULL while it is named by its kind — the box then SHOWS the kind's
     name and follows a change of kind — and a string once somebody has typed in it ('' when he emptied it: the box
     stays empty for him to type in, rather than snapping back to the kind's name under his cursor). Nothing is stored
     until what was typed differs from the kind's own name (engine/inputs.ts titleOf). */
  title: r.title || null,
  // SANS Availability's own Fly/AMT/OFT payload — a plain object, not derived from s/e/half
  sans: r.sans ? { ...r.sans } : null,
  /* the supporting documents' ids (medical types) — the blobs live in
     state/docs. A LIST since 1 Sep 26 (several files on one entry);
     rowDocIds reads the legacy single-docId rows into it. */
  docIds: rowDocIds(r),
})

/* Edit ONLY the remarks of an existing input, through the one commit path
   (owner, 27 Aug 26 — the published Leave War remarks editor). Everything but
   the remark is seeded back from the row, so `rowSig` is unchanged: a
   Leave-War-synced leave keeps its lw tag and its grid cells, only the note
   the Inputs page reads is rewritten. The member-own / scheduler-any gate,
   the mod timestamp and the undo snapshot all come free from commitInputEdit
   — this must NOT grow its own copy of any of them. */
export function setLeaveRemarks(row: any, remarks: string): boolean {
  return commitInputEdit(row, { ...draftOf(row), remarks })
}

/* THE UPLOAD CONTROL every editor renders when needsDoc(type) — one
   component so the add form, the in-table row editor and the modal cannot
   grow three file inputs with three behaviours. An entry holds SEVERAL
   files now (owner, 1 Sep 26 — "upload several files into a single entry
   and delete or reupload"): each attached file is a chip with a ✕ that
   drops it from the DRAFT list (nothing changes until Save — Cancel stays
   a real cancel, and the store keeps every stored file either way, because
   undo can resurrect a record), and the button appends more. Picking files
   stores each at once (state/docs); a refused file (wrong kind, over the
   cap) toasts and the rest still land. */
export function DocField({ ids, onIds }: { ids: string[], onIds: (ids: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const have = ids || []
  return <span className="docfield">
    <input ref={ref} type="file" accept="image/*,application/pdf" multiple hidden
      onChange={e => {
        const fs = e.target.files ? [...e.target.files] : []
        e.target.value = ''
        if (!fs.length) return
        const fresh: string[] = []
        fs.forEach(f => {
          const { id, why } = docAdd(f)
          if (!id) { HOOKS.toast(why, 'warn'); return }
          fresh.push(id)
        })
        if (fresh.length) onIds([...have, ...fresh])
      }} />
    {have.map(id => {
      const doc = docGet(id)
      return <span key={id} className="docchip" title={doc ? doc.name : 'Document'}>
        <span className="docname">{doc ? doc.name : 'document'}</span>
        <button type="button" className="docdel" aria-label={`Remove ${doc ? doc.name : 'document'}`}
          onClick={() => onIds(have.filter(x => x !== id))}>✕</button>
      </span>
    })}
    <button type="button" className={'abtn docbtn' + (have.length ? ' has' : '')}
      title={have.length ? 'Attach another file (photo or PDF)' : 'Attach the supporting document (photo or PDF)'}
      onClick={() => ref.current && ref.current.click()}>
      <UploadIcon /><span>{have.length ? 'Add' : 'Document'}</span>
    </button>
  </span>
}

/* The refusals and the derivations EVERY input write shares — the edit dialog
   (commitInputEdit) and the board's + Add (commitNewInput). Kept in one place
   so a second creation path can never quietly disagree with the editor about,
   say, whether an overnight range is allowed or how a span's year is read.
   Toasts the reason and returns null on refusal — the caller keeps its editor
   open, so nothing typed is lost; on success it returns the model-ready fields.
   `except` is the row to leave out of the SANS overlap check: an edit excludes
   itself, a brand-new input excludes nothing (null). */
export function normalizeInputDraft(draft: any, except: any):
  { s: number, e: number, date: string, endDate: string | undefined, half: string } | null {
  const s = draft.allday ? 0 : parseHM(draft.sTime), e = draft.allday ? 1439 : parseHM(draft.eTime)
  if (!draft.allday && (s == null || e == null)) { HOOKS.toast('Give the input a start and end time, or tick All day', 'warn'); return null }
  /* and they have to be times a clock can show. Without this an out-of-range
     value reached the model through the DIALOG even after the cells were
     guarded, and anything past 24:00 was refused only by accident — hhmm()
     turned it into `100:39`, which failed the re-parse above and so complained
     that no time had been given, when one had (audit, 12 Aug 26). */
  if (!draft.allday && (!hmOK(draft.sTime) || !hmOK(draft.eTime))) {
    HOOKS.toast('That is not a time — try 0900 or 09:00', 'warn'); return null
  }
  /* An end EARLIER than the start crosses midnight — 22:00–02:00 is a real
     absence, and a duty row, a sim box and a night sortie have all rolled that
     way since the port (win() in time.ts). Personal inputs were the one row type
     that refused it outright, so an overnight absence could not be recorded at
     all (owner, 11 Aug 26). Only an end EQUAL to the start is refused now: that
     is a zero-length absence, which means nothing either way. The cost of the
     roll is that a transposed 09:00–08:00 becomes a 23-hour absence instead of
     an error — the same trade every other row type on the board already makes. */
  if (!draft.allday && (e as number) === (s as number)) { HOOKS.toast('Give the input a start and end that are not the same time', 'warn'); return null }
  /* A CLEARED DATE IS REFUSED, never guessed at. fmt() answers a blank with
     the loaded week's Monday — the right default for a field that was never
     shown — but a dialog's date box CAN be emptied by hand, and silently
     filing the input on Monday is the missing-input trap the doctrine names:
     on an upchit it would then trim the man's downchits against a date
     nobody picked. The add form already refuses this; the dialogs share it
     here so no editor can disagree. */
  if (!draft.start) { HOOKS.toast('Pick the date first', 'warn'); return null }
  /* A MEDICAL RECORD KEEPS ITS FAMILY (owner, 27 Aug 26): a downchit stays a
     downchit type, an upchit stays an upchit — retyping one into leave would
     strand its document and walk it out of the tracker without a trace. The
     dialogs already narrow their type lists; this is the write-path half, so
     a hand-made call cannot do what the picker will not offer. */
  if (except && isDownchit(except.type) && !isDownchit(draft.type)) {
    HOOKS.toast('A medical entry stays medical — delete it instead if it was filed in error', 'warn'); return null
  }
  if (except && isUpchit(except.type) && !isUpchit(draft.type)) {
    HOOKS.toast('An upchit stays an upchit — delete it instead if it was filed in error', 'warn'); return null
  }
  const date = fmt(draft.start), endDate = draft.end && fmt(draft.end) !== date ? fmt(draft.end) : undefined
  /* AN INPUT FOR ALL AVAIL / ALL: one of six kinds, one day ([INPUT-ALL-AVAIL] — placeholderRefused above says why).
     Here, at the one body every editor's commit passes through, so no door can write what the picker will not offer. */
  if (placeholderRefused({ person: draft.person, type: draft.type, date, endDate })) return null
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
      return null
    }
  }
  /* SANS AVAILABILITY IS RESTRICTED TO SANS AIRCREW, AND NEEDS AT LEAST ONE
     BOX TICKED (owner, 14 Aug 26) — an unrestricted or empty record would be
     a type that means nothing, so both are refused here, the one place every
     editor's commit passes through. */
  if (isSansAvail(draft.type)) {
    const why = sansRefusal(draft.person, draft.sans)
    if (why) { HOOKS.toast(why, 'warn'); return null }
    const dup = sansOverlapRefusal(draft.person, date, endDate, except)
    if (dup) { HOOKS.toast(dup, 'warn'); return null }
  }
  /* REPLACE-DON'T-STRIP (owner, 1 Sep 26): an already-medical row that HAS
     paperwork cannot be saved with none — deleting the LAST file would strip an
     entry of the proof it went in on; replace it instead. This guard stays here,
     at the one write path, so a hand-made call cannot do what the picker will not.
     The OTHER half — "a medical input needs a document AT ALL" — is now a PROMPT,
     not a hard refusal (owner, [SYNC-INTEG]): saving a NEW medical (or one retyped
     INTO the medical group) with no document opens a [Upload] / [No document] ask
     at the commit sites (docGate + DocConfirm), so a record that genuinely isn't
     available can still be filed. A pre-feature bare medical row still edits
     freely. rowDocIds reads the draft's list and the bare docId alike. */
  if (needsDoc(draft.type) && !rowDocIds(draft).length
      && except && needsDoc(except.type) && rowDocIds(except).length) {
    HOOKS.toast('Keep at least one document on this entry — add the replacement before removing the last file', 'warn'); return null
  }
  /* the medical refusals (owner, 27 Aug 26) — same-type overlap says "edit
     that entry"; an upchit has to be a single date closing something real */
  if (isDownchit(draft.type)) {
    const dup = medOverlapRefusal(draft.person, draft.type, date, endDate, except)
    if (dup) { HOOKS.toast(dup, 'warn'); return null }
    /* ...and it must not swallow an upchit: extending a downchit back over
       the date that closed it would say "down" and "up" at once (27 Aug 26
       overnight pass — the contradiction was accepted silently). */
    const over = downOverUpchitRefusal(draft.person, date, endDate)
    if (over) { HOOKS.toast(over, 'warn'); return null }
  }
  if (isUpchit(draft.type)) {
    const why = upchitRefusal(draft.person, date, endDate, except)
    if (why) { HOOKS.toast(why, 'warn'); return null }
  }
  /* Derived once, here, because the Leave-War check reads the input's PORTION
     and the label write near the end of commitInputEdit reads the same value —
     deriving it twice is how the two would drift (see the note at that write). */
  const half = (!draft.allday && hasHalf(draft.type) && s != null && e != null) ? halfOf(s as number, e as number) : ''
  return { s: s as number, e: e as number, date, endDate, half }
}

/* THE MEDICAL-DOCUMENT GATE (owner, [SYNC-INTEG]) — the withOilAsk doctrine's
   sibling, so every editor that can save a medical input asks the SAME question
   the SAME way. Given the draft about to be saved and the row it replaces (null
   for an add), decide whether the missing-document PROMPT is needed:
   - 'ask'  — a NEW medical input, or one retyped INTO the medical group, with no
              document. The caller opens DocConfirm ([Upload] / [No document]);
              "No document" re-runs the save with the doc treated as resolved, so
              a record that genuinely isn't available can still be filed.
   - 'ok'   — everything else, and the caller proceeds straight to the commit:
              a non-medical type; a draft that already carries a document; OR an
              already-medical row being edited (whether it keeps its file, strips
              it — normalizeInputDraft's replace-don't-strip guard refuses that at
              the commit — or is a pre-feature bare record that edits freely). No
              prompt nags an existing medical row.
   The five certificate types are exactly `needsDoc` (ATT C / ATT B / HL / OML /
   Upchit). rowDocIds reads the draft's list and the bare docId alike. */
export function docGate(draft: any, except: any): 'ok' | 'ask' {
  if (!draft || !needsDoc(draft.type) || rowDocIds(draft).length) return 'ok'
  if (except && needsDoc(except.type)) return 'ok'
  return 'ask'
}

/* THE OIL ASK GATE (owner, 28 Aug 26) — one decision body for every save
   path that can write a duty-&-commitments input, so the predicate cannot
   drift between the three editors (the withOilAsk doctrine). Given the
   draft about to be saved and the row it replaces (null for an add):
   - 'none'    — no sheet needed, save straight through (not an ask-set
                 type, no applicable days, or the standing answers already
                 cover the plan — an untouched remarks edit re-asks nothing);
   - 'refused' — normalizeInputDraft toasted; the caller aborts the save
                 exactly as the upchit/medical gates do on a bad draft;
   - 'ask'     — open OilConfirm with this payload; its Save writes the
                 decisions onto the row INSIDE the caller's own batch.
   The prior answers count as covering a day only when they exist and,
   where positive, still promise the amount the current times derive — a
   moved or re-timed input asks again rather than riding a stale yes.
   `force` (the revise button, owner 29 Aug 26 — "change my OIL answer")
   skips that covered-already bailout so the sheet re-opens over EVERY
   applicable day with the standing answers pre-loaded; everything else —
   the normalize, the toast on a refused draft, the plan — is the same
   body, so a revise can never price a day differently than a save. */
export function oilGate(draft: any, prevRow: any, force = false):
  { kind: 'none' } | { kind: 'refused' } |
  { kind: 'ask', who: string, typeLabel: string, plan: { iso: string, amt: 0.5 | 1 }[], prev: Record<string, number> } {
  if (!draft || !oilAsks(draft.type)) return { kind: 'none' }
  const n = normalizeInputDraft(draft, prevRow)
  if (!n) return { kind: 'refused' }
  const plan = oilAskPlan({ person: draft.person, date: n.date, endDate: n.endDate, yr: baseYear(), allday: !!draft.allday, s: n.s, e: n.e })
  if (!plan.length) return { kind: 'none' }
  /* THE ANSWERS BELONG TO A MAN, NOT TO THE REQUEST (hand pass finding 1,
     21 Sep 26; both red teams 22 Sep). Pricing a NEW holder's plan against the
     OLD holder's answers finds the amount unchanged and reports nothing to ask
     — so the new man was never asked, the commit below then voided those
     answers anyway (its own comment already said "the new person must be asked
     again"), and he arrived unanswered. Unanswered is drawn with the wording of
     a refusal, so a man who worked was shown as having been refused and paid
     nothing, silently. Reproduced end to end: Talisman refused and published,
     the request handed to Ace, Ace's published Saturday blank and Talisman's
     back. A person change is therefore ALWAYS stale, and the sheet opens with
     NO ticks pre-loaded — the new holder answers for himself. */
  const prev = (prevRow && prevRow.person === draft.person && prevRow.oil) || {}
  const stale = plan.some(p => prev[p.iso] == null || (prev[p.iso] !== 0 && prev[p.iso] !== p.amt))
  if (!force && prevRow && !stale) return { kind: 'none' }
  return {
    kind: 'ask',
    who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
    /* named as every screen names it — its own title where it has one ([INPUT-OWN-TITLE]); the question itself is
       asked, and priced, by its KIND and hours */
    typeLabel: titleOf(draft.type, draft.title) || String(draft.type || ''), plan, prev,
  }
}

/* WHETHER THE REVISE BUTTON SHOWS, off the SAVED row alone (owner, 29 Aug 26
   — the button follows the question: it appears exactly where an OIL
   decision exists to change). Read raw the way oilPendingFor reads rows —
   NEVER through normalizeInputDraft, which toasts on a refused draft and
   this runs per render. Unanswered days alone stay the bell's business:
   this affordance only ever REVISES. */
export function oilAnswered(row: any): boolean {
  if (!row || !oilAsks(row.type) || row.acc === 'r') return false
  const prev = (row.oil || {}) as Record<string, number>
  return oilAskPlan(row).some(p => prev[p.iso] != null)
}
/** THE FIRST APPLICABLE DAY NOBODY HAS ANSWERED FOR, or '' (Fable F6,
 *  22 Sep 26). The mirror of `oilAnswered`, and the sign that was missing
 *  everywhere outside the mode: when a scheduler hands a request over and then
 *  cancels the question, the new holder is correctly left unanswered — and the
 *  row carried no mark, the warning list said nothing, and the bell is
 *  per-member, so it lit for the man and not for the scheduler who made the
 *  change. He would never have found it.
 *
 *  Derived, like the bell: answer the day, move the request or retype it out of
 *  the ask set and the row stops matching, with nothing to clear. */
export function oilUnansweredDay(row: any): string {
  if (!row || !oilAsks(row.type) || row.acc === 'r') return ''
  const prev = (row.oil || {}) as Record<string, number>
  const p = oilAskPlan(row).find(x => prev[x.iso] == null)
  return p ? p.iso : ''
}
/* the one-line standing beside the button: how many applicable days the
   record currently credits */
export function oilSummary(row: any): string {
  const plan = oilAskPlan(row)
  const prev = (row.oil || {}) as Record<string, number>
  const yes = plan.filter(p => (prev[p.iso] ?? 0) > 0).length
  const n = plan.length
  if (!yes) return n === 1 ? 'no OIL on its non-working day' : `no OIL on its ${n} non-working days`
  if (n === 1) return 'credited on its non-working day'
  return `credited on ${yes} of ${n} non-working days`
}
/* A SHARED INPUT'S LINE COUNTS ITS PEOPLE WHERE THEIR ANSWERS DIFFER (owner D731 (4), 10 Oct 26 — "credited for 2 of 3 —
   Ranger: no"; walker C of the input card's check, scenario 61). Each man's record carries his OWN answer (D660: the
   filer answers for all at the save, and a man may still change his own), and the window's line read the answers of
   the ONE record it happened to be opened on: "credited on its non-working day" for three people of whom one had
   since said No. Where every man's answers are alike the line reads exactly as it always did — `oilSummary`, above
   (his reading (b)). Where they differ: how many of them are credited at all, then each man who is not ("no"), and
   each credited for only some of its days ("1 of 2 days"). A man who has not answered is NOT named here: the window's
   own "Not answered yet — <day>: <names>" line, straight under this one, names him. Words only — it reads the same
   stored answers the credit pass reads (leavewar/sync.ts oilAskPlan) and writes nothing. */
export function oilSummaryOf(rows: any[]): string {
  const live = (rows || []).filter(Boolean)
  if (live.length < 2) return live.length ? oilSummary(live[0]) : ''
  /* A REQUEST TAKEN OFF THE PROGRAMME HAS NO STANDING HERE (Sol's read of this batch, 10 Oct 26 — finding 2). Taking a
     request off keeps its stored answer (`acc: 'r'` — engine/slots.ts unacceptInput: it stands again when the request
     is accepted again) and it earns nothing while it is off: `oilAnswered`, `oilUnansweredDay`, the bell and the
     credit pass all leave it out. This count read the stored Yes and said "credited" of a man credited with nothing.
     Such a man is never counted, never lends the line his words, and is named — "Ace: taken off". */
  const off = (r: any) => r.acc === 'r'
  const marks = live.map(r => {
    const prev = (r.oil || {}) as Record<string, number>
    return off(r) ? [] : oilAskPlan(r).map(p => (prev[p.iso] == null ? '?' : prev[p.iso] > 0 ? 'y' : 'n'))
  })
  if (!live.some(off) && marks.every(m => m.join('') === marks[0].join(''))) return oilSummary(live[0])
  const who = (r: any) => (PEOPLE[r.person] ? PEOPLE[r.person].cs : String(r.person ?? ''))
  const credited = marks.filter(m => m.includes('y')).length
  const notes = live.map((r, i) => {
    const m = marks[i], yes = m.filter(x => x === 'y').length
    if (off(r)) return `${who(r)}: taken off`
    if (yes && yes < m.length) return `${who(r)}: ${yes} of ${m.length} days`
    if (!yes && m.length && m.every(x => x === 'n')) return `${who(r)}: no`
    return ''
  }).filter(Boolean)
  return `credited for ${credited} of ${live.length}` + (notes.length ? ' — ' + notes.join(', ') : '')
}
/* ONE LABEL FOR AN OIL DAY, wherever one is named (`[CARD-CHECK-SEEN]` 8 — walker C, scenario 78: the question of an
   input in January 2027 named "9 JAN"). Every other date outside the year in hand says its year — the List's day
   headings, a card's "till 1 Jan 2027". Used by the question's heading (ui/OilConfirm.tsx), the window's two "not
   answered yet" lines and the desktop row's "OIL?" chip (ui/InputsPage.tsx). */
export function oilDayLabel(iso: any): string {
  const s = isoLabel(iso)
  return s && +String(iso).slice(0, 4) !== baseYear() ? `${s} ${String(iso).slice(0, 4)}` : s
}

/* The default type a board panel's + Add opens on — a personal (activity) type
   for the Personal Inputs panel, a leave/medical type for Unavailable, so the
   new row lands in the panel it was added from. The scheduler can change it in
   the dialog; SANS Availability is deliberately never the Unavailable default
   (it is an offer, not an absence, and carries its own aircrew restriction). */
export const firstPersonalType = () => INPUT_TYPES.find((t: any) => isPersonal(t)) || INPUT_TYPES[0]
/* THE NEW INPUT OF THE INPUTS PAGE — one seed for its two doors: "+ Input" in a day opened on the calendar (and a
   drag across several days), and "+ Input" on the List (owner D729 — the design vet's V1, 10 Oct 26: "one '+ Input'
   button … opens the same window the calendar opens"). The calendar hands in the day it was pressed on; THE LIST HANDS
   IN NONE — the window then opens with no date picked ("pick a start date"), as the List's own form always did:
   quietly dating an input nobody dated was the trap that form's first check named. Everything else is the calendar's
   seed as it was (ui/InputsCal.tsx openAdd): filed for the signed-in person, the first "Duty & other commitments"
   kind, its own all-day default. `_calendar` is what gives the window its date calendar and keeps the saved input in
   view (InputEditor, below). */
export const newInputSeed = (from?: string, until?: string) => {
  const [iso, end] = from && until && until < from ? [until, from] : [from, until]
  const t = firstPersonalType()
  return { _new: true, _calendar: true, _ctx: 'i', person: me(), type: t, date: iso ? fmt(iso) : undefined,
    endDate: iso && end && end !== iso ? fmt(end) : undefined, allday: defaultAllday(t), s: 360, e: 1080 }
}
export const firstUnavailType = () => INPUT_TYPES.find((t: any) => isUnavail(t) && !isSansAvail(t)) || INPUT_TYPES[0]
export const firstSansType = () => INPUT_TYPES.find((t: any) => isSansAvail(t)) || INPUT_TYPES[0]
/* which types each board add offers (owner, 19 Aug 26) — the Ground
   Programme's + Inputs takes what can land on the programme, Unavailable
   takes what makes a man absent, and SANS Availability is nowhere else's
   business (it is an offer, not an absence, so it appears in NEITHER of the
   other two lists — its own panel's + Add is where it is filed) */
export const TYPE_ALLOW: any = {
  g: (t: any) => isPersonal(t),
  /* Upchit is excluded like SANS — it is not an absence, so the Unavailable
     panel's + Add must not offer it; it is filed on the Inputs page or from
     the Medical view's pending card */
  u: (t: any) => isUnavail(t) && !isSansAvail(t) && !isUpchit(t),
  s: (t: any) => isSansAvail(t),
  /* the Inputs tab's own "+ Input": everything but SANS availability, which is filed on the SANS calendar and nowhere
     else (owner D620, 7 Oct 26) */
  i: (t: any) => !isSansAvail(t),
}

/* ADD a brand-new input from a schedule surface (owner, Aug 26 — "scheduler
   board should have the authority to add inputs... under unavailable and
   personal inputs"). The board's + Add seeds a blank row for the OPEN DAY and
   opens the SAME dialog an edit uses; Save lands here. It runs the identical
   refusals and derivations an edit does (normalizeInputDraft) and unshifts the
   row exactly as the Inputs page's own add form does — one write through
   writeInputsBatch, so it joins the undo stack as ONE step, re-validates the
   week, and (for a leave/medical type) crosses to Leave War on the same notify
   the Inputs page add already rides. Dates were a single day here until the
   Unavailable + Add grew the range picker (owner, 19 Aug 26) — a draft
   carrying an end date lands a span through the same normalize the Inputs
   page's calendar feeds.
   `toGround` (owner, 19 Aug 26 — the Ground Programme's + Inputs): the new
   row is ACCEPTED onto the open day's ground programme in the same batch, so
   the button on that panel puts the item where the button is. One undo step
   still — writeInputsBatch swallows acceptInput's own history pushes exactly
   as commitInputEdit's relink already relies on. */
/* an UNSUPPORTED (pre-Phase-2 / wrong-week) book is read-only (P2-IMPL-03). An
   input op that touches a date on such a week — the row's own date (source) OR a
   normalized destination date — would land/edit/remove/re-file a row on a frozen
   schedule, so refuse it at the UI entry and say why. Date-based and GLOBAL
   (P2-REREVIEW-02): protectedDates() spans the loaded week AND every stashed
   protected week, so an input for an unvisited protected week is refused from any
   loaded week. The engine's acceptInput/unacceptInput are the hard backstop; this
   also stops the input row's own fields diverging from the frozen day, and gives
   the user a reason rather than a silent no-op. Callers pass NORMALIZED
   destinations (P2-REREVIEW-01) so the date fields it reads actually exist. */
function protectedInput(...rows: any[]): boolean {
  const dates = protectedDates()
  if (!dates.length) return false
  const hit = rows.some(r => r && dates.some((dt: any) => inputCoversDate(r, dt)))
  if (hit) HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
  return hit
}
/* a row-like {date,endDate,yr} built from a NORMALIZED draft, for the protection
   check on the DESTINATION dates (the editor draft carries sTime/eTime/start/end,
   not the model's date/endDate — reading those raw was the P2-REREVIEW-01 no-op). */
const normDest = (n: { date: string, endDate: string | undefined }, yr: any) => ({ date: n.date, endDate: n.endDate, yr })
/* PREFLIGHT A MEDICAL PLAN (P2-QREV-01). The medical create/trim cascade
   (applyMedPlan) mutates EXISTING rows — trims and deletes — and (before
   [ARCH-STACK] step 4) withdrew Leave War cells as a side effect the input
   funnel's model-rollback could not take back. So a plan that touches ANY
   protected-date row must be refused BEFORE it runs, not rolled back after: this
   preflights the whole plan (its target rows, and the surviving tail a split
   would mint) so nothing executes on a frozen record. */
export const medPlanProtected = (plan: any[]) => (plan || []).some((p: any) =>
  (p.row && inputProtected(p.row)) ||
  (p.tail && inputProtected({ date: ordLabel(p.tail.startOrd, p.row?.yr), endDate: p.tail.endOrd > p.tail.startOrd ? ordLabel(p.tail.endOrd, p.row?.yr) : undefined, yr: p.row?.yr })))

const medicalLocked = () => HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')

/* Check every kept segment and its cascade against the unchanged model. Forms
   run this before committing segment one; the sibling writer also guards itself. */
export const medSegmentsProtected = (base: any, segs: any[], keepTail?: any, entryEnd?: any, except = base) =>
  segs.some(g => inputProtected({ ...base, date: ordLabel(g.startOrd, base.yr), endDate: ordLabel(g.endOrd, base.yr) }) ||
    medPlanProtected(newMedTrimPlan(base.person, base.type, g.startOrd, g.endOrd, except, keepTail, entryEnd)))

/* IS THIS DRAFT A PLACEHOLDER INPUT THAT MAY NOT BE SAVED? ([INPUT-ALL-AVAIL] — owner D700, D711, D712, D713; the plan
   docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §3.2.) An input for ALL AVAIL / ALL is one of six kinds, ONE
   day, never in a group — engine/inputs.ts placeholderProblem, the one body. This is its voice at a save DOOR: it says
   the sentence and answers true, and the caller keeps its window open. Asked FIRST by every save handler — before the
   document question, the medical sheets and the OIL question (Astra's read of the plan, 9 Oct 26: changing an ALL AVAIL
   input's kind to a medical one reached the document question before any refusal) — and again inside
   normalizeInputDraft, which every other door passes through (the calendar's drag, the time cells, each man of a group
   save). A draft carries ISO `start` / `end`; a record carries `date` / `endDate`. The save boundary's hard check
   (state/store.ts) is behind them all. */
export function placeholderRefused(d: any): boolean {
  if (!d || !isSpecial(d.person)) return false
  const iso = d.start != null || d.end != null
  const date = iso ? (d.start ? fmt(d.start) : '') : d.date
  const endDate = iso ? (d.end && d.end !== d.start ? fmt(d.end) : undefined) : d.endDate
  const why = placeholderProblem({ person: d.person, type: d.type, date, endDate, yr: d.yr ?? baseYear(), grp: d.grp, grpBy: d.grpBy })
  if (why) HOOKS.toast(why, 'warn')
  return !!why
}

/* WHY A MEMBER MAY NOT FILE THIS KIND FOR ANOTHER MAN, in a sentence — one wording for the new-input door, the edit door
   and (with the Inputs calendar) the people picker's own line. The members' switch being off is said as that; else the
   kind is named: a member files for others only duties and commitments (D655), never SANS availability (D658). */
export function fileForOtherRefusal(type: any): string {
  if (!membersFileOn() && memberFilesForOthers(type)) return 'Filing for other people is switched off — you can file this only for yourself'
  const what = isLeave(type) ? 'leave' : isUpchit(type) ? 'an upchit' : isDownchit(type) ? 'a medical entry' : isSansAvail(type) ? 'SANS availability' : 'this'
  return `You can file ${what} only for yourself`
}

export function commitNewInput(draft: any, toGround?: boolean, keepTail?: any, entryEnd?: any, onAdded?: (row:any)=>void): boolean {
  if (!draft) return false
  /* write-path role backstop (owner, 22 Aug 26 — a member files inputs only
     for whoever they are viewing as; the Person choice is a scheduler's).
     The member-reachable seeds (the calendar's openAdd) already carry ME and
     render no Person control, so for a real gesture this changes nothing —
     it is the net for a hand-made call, the same place-and-shape as
     reassignInput's own gate below. Pinned BEFORE normalize so the SANS
     aircrew check judges the person actually being written. */
  if (!canEditSched()) {
    /* [ACCOUNTS]: filed for the SIGNED-IN person (perms.ts me()); someone signed in
       without access (a guest) is nobody's person and files nothing */
    const mine = me()
    if (mine == null) { HOOKS.toast('Sign in with your own account to file an input', 'warn'); return false }
    /* A MEMBER'S DRAFT FOR ANOTHER MAN IS ASKED, NEVER RE-POINTED AT HIMSELF IN SILENCE (the group input — owner D654,
       D655, D658; the build plan §3.13). Until 7 Oct 26 this line wrote his own name over whatever the draft said:
       right while a member could file for nobody else, and now the quiet substitution of one man for another that the
       picker's rule forbids ("nothing is ever substituted for what he picked"). A draft naming nobody is still his
       own; one naming another man is filed for that man where the one rule allows it (perms.ts mayFileInputFor — a
       duty or a commitment, the members' switch on) and refused with the sentence where it does not. */
    if (draft.person == null || draft.person === '') draft = { ...draft, person: mine }
    else if (!mayFileInputFor(draft.person, draft.type)) { HOOKS.toast(fileForOtherRefusal(draft.type), 'warn'); return false }
  }
  const n = normalizeInputDraft(draft, null)
  if (!n) return false
  if (protectedInput(normDest(n, draft.yr))) return false   // read-only quarantine, NORMALIZED destination (P2-REREVIEW-01/02)
  const { s, e, date, endDate, half } = n
  const flags = isSansAvail(draft.type) ? sansFlags(draft.sans) : {}
  const row: any = {
    person: draft.person, type: draft.type, allday: !!draft.allday,
    /* yr anchors the bare date labels to the year they were picked under —
       fmt leaves the loaded year implicit, and this is what reads it back */
    s, e, date, yr: baseYear(), remarks: String(draft.remarks || '').trim(), mod: nowStamp(),
    /* its own title, only where one was typed and its kind takes one (D715, D716 — titleOf is the one normaliser) */
    ...(titleOf(draft.type, draft.title) ? { title: titleOf(draft.type, draft.title) } : {}),
    ...(endDate ? { endDate } : {}),
    ...(half ? { half } : {}),
    ...(Object.keys(flags).length ? { sans: flags } : {}),
    /* the supporting documents' ids only — the blobs stay in state/docs, so
       history snapshots (JSON of INPUTS) never copy a file. Gated on the type
       actually needing one: a certificate uploaded under a medical pick and
       left behind by a switch to leave must not ride onto the leave row and
       draw a paperclip nothing explains. */
    ...(needsDoc(draft.type) ? docFields(rowDocIds(draft)) : {}),
  }
  /* the row's own address, minted before the write so the snapshot this add
     pushes already carries it — the Inputs page add's own withId precedent */
  inpId(row)
  /* who placed it, and when (D629 — state/inputstamp.ts): the signed-in person, whoever it is filed FOR */
  stampPlaced(row)
  /* the medical trim cascade, computed and PREFLIGHTED before the batch (P2-QREV-01):
     it mutates existing rows and fires Leave War withdrawals the funnel cannot undo,
     so a plan touching a protected-date row is refused whole, before anything runs. */
  const medPlan = isDownchit(row.type)
    ? newMedTrimPlan(row.person, row.type, dateOrd(date, row.yr), dateOrd(endDate || date, row.yr), row, keepTail, entryEnd)
    : isUpchit(row.type)
      ? upchitTrimPlan(row.person, dateOrd(date, row.yr), row).map((p: any) => ({ ...p, why: 'closed by the upchit' }))
      : null
  if (medPlan && medPlanProtected(medPlan)) {
    HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
    return false
  }
  const ok = writeInputsBatch(() => {
    INPUTS.unshift(row)
    /* a new medical input wins its overlapping days from a DIFFERENT-type
       downchit, and an upchit cuts everything covering its date to end the
       day before — the upchit day is a fit day (owner, 27 Aug 26) — planned
       pure, applied here so the add and its trims are ONE undo step */
    if (medPlan) applyMedPlan(medPlan)
    if (toGround) {
      /* the board's Ground "+ Inputs" is a DELIBERATE scheduler act — it lands
         the row on the programme whatever the day's publish state (an ordinary
         AL on a published day), and reports the one duplicate-content-key
         refusal. isUnavail is acceptInput's own refusal, re-checked here only
         to say something useful if a future caller mis-routes; the dialog's
         ground context can only offer activity types. */
      const di = dateIx(date)
      if (di >= 0 && !isUnavail(row.type) && !acceptInput(di, row, 'g'))
        HOOKS.toast('An identical row is already on the Ground Programme — added under Personal Inputs instead', 'warn')
    }
    /* every OTHER add puts an activity input on the programme (owner, Aug 26 — the default is "on the programme") —
       worked out after this command, from the request ([DB-READINESS] phase 6 (c) — state/holderbase.ts): the filing
       writes the request and no day (D450); a request filed LIVE on a PUBLISHED day lands on the working copy as a pending
       amendment (owner 16 Sep 26), the issued face frozen, and the scheduler removes it if unwanted. The board's Ground
       "+ Inputs" above is a scheduler's own placement: its row is written inside this command, and saved with it. */
  })
  /* the funnel backstop rolled the batch back (a protected date slipped the
     preflights above) — report failure, don't log a phantom "Input added" (P2-QREV-04) */
  if (!ok) return false
  /* its history line is the change history's one writer's (state/changelines.ts — Astra DP-03, 28 Sep 26) */
  onAdded?.(row)
  return true
}

/* Commit a draft onto its row. Returns false and toasts when it will not go —
   the caller keeps its editor open on a false, so nothing typed is lost.
   Runs through writeInputsBatch like every other mutation, so an edit joins
   the undo stack as ONE step and re-validates the week. */
/* A REQUEST WHOSE ROW IS ON A WEEK NOT ON SCREEN IS EDITED AND DELETED LIKE ANY OTHER ([DB-READINESS] group A, phase 6 (c)).
   Until phase 6 an edit or a delete here was refused with "Load the week of … to edit / delete this accepted input" (13 Sep
   26, the inspect's finding 1): the row on that week could not be reached, and would have stayed with its old times or
   person. The row is worked out from the request whenever its week is read now (engine/overlay.ts viewOfWeek — the saved
   week's row re-made, taken away or landed on its new day), so the edit goes ahead and that week shows it when it is
   opened; the refusal, and its "can't tell" twin for an unreadable saved week, went with it. */

/* `opts.sched` — THE SAVE COMES FROM A ROW ON THE SCHEDULE (owner D741, D742, D739 reading 4 — 10 Oct 26; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.6, §4.7): a time or a remark typed on the input's
   row, a different man dropped on it. For someone who may edit the schedule, such a save does NOT move the late date
   (`mod` — "no change made there makes an input that was on time read LATE"), and keeps a Yes to the OIL question at
   what the new hours give instead of dropping it. Who changed it, and when, is still stamped. Asked of the ROLE here,
   not trusted from the caller: a hand-made call by anyone else is an ordinary save. The input's own window never
   passes it, wherever it was opened from (D742 reading 3). */
export type InputSaveOpts = { sched?: boolean }
export const schedSide = (opts?: InputSaveOpts): boolean => !!(opts && opts.sched) && canEditSched()
export function commitInputEdit(r: any, draft: any, keepTail?: any, entryEnd?: any, opts?: InputSaveOpts) {
  if (!r || !draft) return false
  const sched = schedSide(opts)
  if (INPUTS.indexOf(r) < 0) {                 // deleted or undone underneath us
    HOOKS.toast('That input is no longer there — nothing was saved', 'warn')
    return false
  }
  /* the SOURCE date is checked here (r is a model row with real date/endDate);
     the normalized DESTINATION is checked after normalizeInputDraft below, so a
     move INTO a protected week is refused too (P2-REREVIEW-01/02). */
  if (protectedInput(r)) return false
  /* write-path role backstop (owner, 27 Aug 26): a LOGGED-IN MEMBER edits only
     their OWN inputs. The row's ✎ is hidden on everyone else's, so a real
     gesture cannot reach here; this refuses a hand-made call. "Member" is any
     signed-in session that cannot edit the schedule — the same predicate the
     render gate reads (InputsPage), NOT a role literal: the first cut compared
     against 'member', a string no account ever carries (the member login is
     role 'main', auth.ts), so the gate never fired in production while its
     test logged in with the fabricated shape and stayed green. The app's own
     internal edit cascades (sync retraction, medical trims, the accepted-row
     relink) stay person-scoped to the row's own person, so a member's cascade
     is their own row and still passes; a sessionless test/boot context is not
     a member and is not gated. */
  if (!mayEditInput(r)) {   // [ACCOUNTS]: the one rule, perms.ts (the man, whoever filed it for him, an admin — no one else)
    HOOKS.toast('You can only edit your own inputs', 'warn')
    return false
  }
  /* write-path role backstop (owner, 22 Aug 26): moving an input onto a
     DIFFERENT person is a scheduler's act — the same line reassignInput and
     the calendar drag (caldrag.ts) already draw. A member's editors no
     longer render a Person control at all, so a real gesture cannot trip
     this; it refuses the hand-made call. Editing their own row's times,
     type or remarks stays theirs (draftOf seeds person from the row, so an
     untouched person sails through). */
  if (!canEditSched() && draft.person !== r.person) {
    HOOKS.toast('Only a scheduler can move an input to another person', 'warn')
    return false
  }
  /* …and what a member FILED for another man stays a kind he may file for him (the group input, plan §3.13): retyping
     his Meeting for Hex into Hex's leave is refused here with its sentence — the commit gate would roll it back with
     none. His own input retypes as freely as ever (mayFileInputFor: himself, any kind). */
  if (!canEditSched() && !isMe(draft.person) && !mayFileInputFor(draft.person, draft.type)) {
    HOOKS.toast(fileForOtherRefusal(draft.type), 'warn')
    return false
  }
  const n = normalizeInputDraft(draft, r)
  if (!n) return false
  if (protectedInput(normDest(n, draft.yr))) return false   // refuse a move INTO a protected week (P2-REREVIEW-01/02)
  const { s, e, date, endDate, half } = n
  /* preflight the medical trim cascade this edit would trigger, BEFORE the batch
     (P2-QREV-01) — its trims/deletes and Leave War withdrawals cannot be rolled
     back. Computed with the edit's NEW values (== what the in-batch call uses once
     r is mutated); `r` is excluded as self. */
  const medPlan = isDownchit(draft.type)
    ? newMedTrimPlan(draft.person, draft.type, dateOrd(date, baseYear()), dateOrd(endDate || date, baseYear()), r, keepTail, entryEnd)
    : isUpchit(draft.type)
      ? upchitTrimPlan(draft.person, dateOrd(date, baseYear()), r).map((p: any) => ({ ...p, why: 'closed by the upchit' }))
      : null
  if (medPlan && medPlanProtected(medPlan)) {
    HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
    return false
  }
  /* A HAND-OVER WRITES THE REQUEST ALONE ([DB-READINESS] group A, phase 6 (a)). Until phase 6 the week stash joined this
     batch when the holder moved ([OIL-XWEEK-DENY], 22 Sep 26), because the hand-over cleared the old holder's refusal out
     of weeks nobody was looking at too. That clear is gone — the refusal is ignored on read (engine/oilev.ts
     pruneHandedOverDecisions, by the request's `hand` below) — so no week is written, and one Undo still puts back the
     assignment and the refusal together: the count rides the request. */
  const ok = writeInputsBatch(() => {
    /* A Leave-War-synced row (owner, 17 Aug 26 — full two-way): editing the
       LEAVE ITSELF — its person, type, dates or which half — changes the war
       too. The old grant is WITHDRAWN first, while the row still says what the
       war approved, and the lw tag is dropped — the edited row is an ordinary
       input from here on, which inbound lands as Raptor-owned cells exactly
       like a leave filed on this page ("Raptor owns what Raptor last wrote").
       Leaving either half out resurrects the snap-back: keep the cells and
       outbound re-mints the old row; keep the tag and inbound skips the edited
       one.
       But editing ONLY THE REMARKS leaves the leave untouched, and that is the
       common case now (owner, 18 Aug 26 — a member adding where they are going
       for an OL). The leave's sync signature is unchanged, so the row STAYS
       lw-tagged: Leave War keeps the leave (it does not show remarks anyway),
       and the next reconcile MATCHES this row rather than re-minting it, so the
       refined remark survives. rowSig folds the type vocabulary and the portion
       exactly as reconciliation does, so "did the leave change?" here cannot
       disagree with what a re-sync would decide. */
    /* [ARCH-STACK] step 4 (design §5.4, owner §13 Q1): the war READS this row, so
       nothing is retracted — the edit simply shows there. What changes is who
       may edit it on the war: a MEMBER's own date / type / person edit of a
       leave the admin approved clears `lw` (it stays green and gains the blue
       "filed on the Inputs page" edge; from then on it is changed here). A
       remarks-only edit, and any admin edit, keep it war-approved. */
    /* …compared in the year the save WRITES (`baseYear()` — the labels above were made against it): read in the record's
       old year, a leave moved to the same day of another year looked unchanged and kept its approval (both readers of
       the input card's check, 10 Oct 26) */
    const leaveSame = leaveKey(r) === leaveKey({ person: draft.person, type: draft.type, date, endDate, yr: baseYear(), allday: draft.allday, half, s, e })
    if (r.lw && !leaveSame && !canEditSched()) delete r.lw
    /* THE EDIT WRITES THE REQUEST ALONE ([DB-READINESS] group A, phase 6 (c) — D450; plan §3 (c) §6). Its row — on the
       week on screen or on any other — is worked out from the request after this command and whenever its week is read
       (engine/overlay.ts viewOfWeek): re-made in place when the request changed (its id, its place and everything the
       scheduler set on it kept; D271 said there), taken away when it no longer covers the day or is retyped to a kind that
       never goes on the programme (said there too), landed on its new start day when it moved. The un-accept / re-accept
       relink that did it here, with its extras restore and its toasts, went with it. What stays here is the request's own
       filing: a 'taken off' record retyped counts again (below), and one filed under Unavailable stays filed unless it is
       retyped to a kind never filed there. */
    /* captured for the filing rules below — the writes overwrite r.type */
    const wasDormant = r.acc === 'r', wasType = r.type, wasPerson = r.person
    r.person = draft.person; r.type = draft.type; r.allday = draft.allday
    /* THE REMARK'S DATE TOKEN FOLLOWS THE DATES (the absence-record re-test's final code reads — Fable F1, Astra 3,
       26 Sep 26): "till <last day>" / "on <day>" is the app's own wording (D189). The form's pickers rewrite it as the
       dates are picked; the calendar's drag and the upchit's date box did not, so a moved leave kept its old last day.
       Rewritten here, the one save every door uses, ONLY when the dates changed — a remarks-only edit keeps whatever
       was typed. Idempotent where a picker already wrote it. */
    let rem = String(draft.remarks || '').trim()
    const redated = date !== r.date || (endDate || '') !== (r.endDate || '')
    const word = redated ? remarksTailWord(rem) : null
    if (word) rem = withRemarksTail(rem, ordISO(dateOrd(date, baseYear())), ordISO(dateOrd(endDate || date, baseYear())), word)
    r.s = s; r.e = e; r.date = date; r.remarks = rem
    /* the date the late mark reads — left as it is by a scheduler's change made from a row on the schedule (D741, D742) */
    if (!sched) r.mod = nowStamp()
    /* THE TITLE FOLLOWS THE DRAFT ([INPUT-OWN-TITLE]): written where one was typed, and the key REMOVED where the box
       was put back to the kind's own name, emptied, or the kind retyped to one that takes no title — a leave never
       keeps the name of the Event it used to be. A draft that does not STATE a title (no `title` key at all — a
       hand-made call; every door of the app seeds one through draftOf, where NULL says "none") leaves the record's
       own where its kind still takes one: silence is not an instruction to wipe a name. */
    { const tt = titleOf(draft.type, draft.title === undefined ? r.title : draft.title); if (tt) r.title = tt; else delete r.title }
    /* …and who changed it, and when — `by` and `at` are never touched by a change (D629 — state/inputstamp.ts) */
    stampChanged(r)
    /* the edit re-derived its labels against the CURRENT loaded year (fmt),
       so the anchor moves with them — an edit is a re-statement of the date */
    r.yr = baseYear()
    /* SANS Availability used to force allday:true and carry per-event windows
       of its own in `sans` — that is what made a per-event time pair
       impossible to clear on a phone (see SansPicker above). It is a normal
       timed input now: r.allday/s/e/half just above ARE its one window,
       exactly like a leave input, and `sans` here is normalised to flags
       only — which events are offered, never a shape of its own. */
    const flags = sansFlags(draft.sans)
    if (Object.keys(flags).length) r.sans = flags; else delete r.sans
    /* the draft's file list REPLACES the record's reference pair — an edit
       that touched nothing else re-applies the same list (draftOf seeded it
       from the row), so paperwork is never silently dropped, while an
       explicit ✕ or an added file lands exactly as shown. The refusals
       above already stopped the list going empty on a row that had files.
       Only on a type that KEEPS documents — the family guard above stops a
       medical row leaving the group, so this bites only on stray ids a
       dialog carried while the type was flipped among non-medical picks. */
    if (needsDoc(draft.type) && rowDocIds(draft).length) {
      delete (r as any).docIds
      Object.assign(r, docFields(rowDocIds(draft)))
    }
    /* DERIVED from the times, never copied from the draft (audit, 12 Aug 26).
       The in-place cells already derived it (halfOf), but the Inputs page's own
       two time boxes did not: press AM, then type 08:00 over the start, and the
       row kept a half:'am' label describing an 08:00–12:00 window — the week
       and the palette then printed "local leave (LL) (AM)" for a window that is
       not the morning. One derivation for all three editors is the only way the
       label cannot drift from the hours it claims to describe.
       hasHalf too, not just the hours: a type that has no halves (CSE) must
       drop the label even when the times happen to land on one, or it would be
       stranded on a record with no control left to change it. `half` is derived
       once above the write (the Leave-War check needs it too). */
    if (half) r.half = half; else delete r.half
    if (endDate) r.endDate = endDate; else delete r.endDate
    /* The OIL answers (owner, 28 Aug 26) belong to the commitment as it was
       acknowledged: retyped out of the ask set, or moved to ANOTHER person,
       they are void — the new shape (or the new person) must be asked again
       (the delete half/sans precedent). Date-only moves KEEP them: an entry
       for a day the row no longer covers is inert to the credit pass, which
       re-checks coverage live. reassignInput and the calendar drag both land
       here, so they inherit the person rule. */
    /* …and the per-day rule further down (a positive answer the new hours no longer price). ONE function says all of
       it — engine/oil.ts voidedOil — shared with the check on what a member's command really changed (state/perms.ts,
       the plan §3.13): what a save did not answer afresh must be exactly what this leaves. */
    /* …from a row on the schedule a Yes is KEPT, at what the new hours give — engine/oil.ts repricedOil (D739 reading 4) */
    const keptOil = (sched ? repricedOil : voidedOil)({ person: wasPerson, oil: r.oil }, r)
    if (keptOil) r.oil = keptOil; else delete r.oil
    /* ...and the SCHEDULER's own override on this request dies with the
       assignment too (Codex scenario 7, 22 Sep 26). Voiding the member's
       answers above was only half of it: a refusal the scheduler made about the
       old holder stayed on the day, dormant while someone else held the
       request, and live again the moment it was handed back. Since [DB-READINESS]
       group A phase 6 (a) it is not cleared off the days — a hand-over writes no
       day (D450) — but counted: the request's holding moves on, and every
       decision made under an earlier one reads as nothing (engine/oilev.ts
       pruneHandedOverDecisions). The same record, so one undo puts it back. */
    if (r.person !== wasPerson) {
      r.hand = Number(r.hand || 0) + 1
      /* …and when it LEFT him: every decision about him made under an earlier holding is void from now on — on every
         day, in every week, with no day written (engine/oilev.ts pruneHandedOverDecisions). The old write-side clear
         voided exactly the old holder's decisions; this says the same thing on the request itself. */
      if (wasPerson) r.leftAt = { ...(r.leftAt || {}), [String(wasPerson)]: r.hand }
    }
    /* AND a positive answer whose HOURS no longer price what was approved is
       void per day (bug pass, 28 Aug 26): the three gated editors re-ask via
       oilGate, but the board's and week's IN-PLACE cells commit straight
       through here — a scheduler stretching a confirmed 2h Saturday
       appointment to all-day would otherwise silently reprice an
       acknowledged HO into an FO cell, the exact silence the feature exists
       to prevent. Dropping the entry makes the day read UNANSWERED again, so
       the bell lights and the owner re-confirms; an explicit 0 (a decline)
       stays — hours cannot change a No. Gate saves are unaffected: they
       write their fresh decisions after this commit, in the same batch. */
    /* (applied above, with the retype / hand-over rule: voidedOil) */
    /* A DORMANT record whose TYPE changes COUNTS AGAIN (26 Aug 26 bug pass).
       Dormancy marks "the scheduler removed THIS commitment"; retype it and it
       is a different commitment, so it fails CLOSED — it flags — rather than
       inheriting the old removal. Without this, retyping a removed Meeting to
       LL minted a permanently-dormant absence: the validator said nothing while
       the crew picker still barred the man (the forbidden two-voice drift), and
       because LL is not a Personal-Inputs type there was no Accept button left
       to wake it. Time/remark edits on a dormant record still keep it parked —
       only Accept (or a retype) revives it, per the owner's removal rule. */
    if (wasDormant && r.type !== wasType && r.acc === 'r') delete r.acc
    /* an EDIT restates the span, so the same medical rules run against the
       person's other rows — the row itself is excluded (except-style). The plan
       was computed + preflighted above, before the batch (P2-QREV-01). */
    if (medPlan) applyMedPlan(medPlan)
    /* 'u' (filed under Unavailable) is a scheduler's filing DECISION on the request, not a landing — it survives an edit
       (P2-REV2-06: an edit off the loaded week used to turn it into a fresh, flagging input). Except a retype to a kind that
       is never filed there — a leave, a medical, an overseas duty (acceptInput refuses those): then the request is simply
       that kind, as the loaded week's relink always left it. One rule on and off the loaded week now (P2-QREV/Fable-9 had
       the off-week edit re-derive on any type change). */
    if (r.acc === 'u' && r.type !== wasType && isUnavail(r.type)) delete r.acc
    /* …and except an input turned into a PLACEHOLDER's ([INPUT-ALL-AVAIL]; Astra's read of the code, 9 Oct 26): an input
       filed for ALL AVAIL / ALL is never under Unavailable (engine/inputs.ts placeholderProblem) — it goes back onto
       the programme, where its row, its crowd and its OIL are (state/holderbase.ts lands it after this command). */
    if (r.acc === 'u' && isSpecial(r.person)) delete r.acc
  })
  /* the funnel backstop rolled the batch back — report failure so the editor
     stays open and nothing typed is lost (P2-QREV-04) */
  return ok
}

/* ---- THE MEDICAL QUESTIONS FOLLOW A DRAG AND A REASSIGN (the absence-record re-test, AB4, 26 Sep 26 — Fable F4 and
   Astra A, found independently) ------------------------------------------------------------------------------------
   The edit window and the Inputs table put a different-type medical overlap to the filer (the clash sheet — "choose who
   holds the shared days", NO default) and an upchit's effects to him (the summary sheet) BEFORE anything is written
   (owner, 27 Aug 26). The calendar's chip drag and the schedule's reassign went straight to commitInputEdit, whose trim
   plan then resolved the clash with the safety default (every tail kept) — silently. These three are the one body the
   sheets' callers share: what to ask, and what each sheet's Save writes for an EDIT of an existing row. The Inputs
   table's edit runs through them, and so does the move hand-off (ui/MedMoveConfirm.tsx), so a drag, a reassign and
   an edit answer the same question the same way. */
export type MedAsk =
  | { kind: 'clash'; who: string; newType: string; span: string; clashes: any[]; a: number; b: number }
  | { kind: 'up'; who: string; dateLabel: string; effects: { plan: any[]; leftovers: any[] } }

/** What saving `draft` over the existing row `r` must put to the filer first: null when nothing (not a medical, or a
 *  downchit that meets no different-type medical), 'refused' when the shared refusals toasted. */
export function medAskFor(r: any, draft: any): MedAsk | null | 'refused' {
  if (!draft || !draft.start || !(isUpchit(draft.type) || isDownchit(draft.type))) return null
  /* the shared refusals FIRST — a bad draft toasts at once, never after a sheet was shown */
  if (!normalizeInputDraft(draft, r)) return 'refused'
  const who = PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || '')
  if (isUpchit(draft.type)) {
    /* an upchit is NEVER saved silently: the summary runs whatever it finds */
    const dateLabel = fmt(draft.start)
    return { kind: 'up', who, dateLabel, effects: upchitEffects(draft.person, isoOrd(draft.start), r) }
  }
  /* the days the SAVE will take — the draft's own whole dates (`isoOrd`), never its labels read in the record's old year */
  const a = isoOrd(draft.start)
  const b = isoOrd(draft.end || draft.start)
  const clashes = medClashes(draft.person, draft.type, a, b, r)
  if (!clashes.length) return null
  return { kind: 'clash', who, newType: draft.type,
    span: fmt(draft.start) + (draft.end && draft.end !== draft.start ? ' – ' + fmt(draft.end) : ''), clashes, a, b }
}

/** The clash sheet's Save for an EDIT: the edited row becomes the first kept segment, the rest are minted as
 *  siblings — all one undo step. */
export function commitEditMedChoices(r: any, draft: any, ask: { clashes: any[]; a: number; b: number }, choices: string[], keepTail: any[]): boolean {
  const segs = medKeptSegments(ask.a, ask.b, ask.clashes, choices)
  if (!segs.length) return false
  if (medSegmentsProtected({ ...draft, yr: r.yr }, segs, keepTail, ask.b, r)) { medicalLocked(); return false }
  const g0 = segs[0]
  const d2 = {
    ...draft,
    start: ordISO(g0.startOrd),
    end: g0.endOrd > g0.startOrd ? ordISO(g0.endOrd) : '',
    remarks: withRemarksTail(draft.remarks, ordISO(g0.startOrd), ordISO(g0.endOrd), 'till'),
  }
  return saveBatch(() => {
    const ok = commitInputEdit(r, d2, keepTail, ask.b)
    if (ok) mintMedSegments(r, segs.slice(1), keepTail, ask.b)
    return ok
  })
}

/* ---- THE OUTER SAVE'S ANSWER IS THE ANSWER ([INPUT-SAVE-SAYS-OK-WHEN-REFUSED], found 7 Oct 26, fixed 8 Oct 26 with the
   group input — the build plan §3.13) --------------------------------------------------------------------------------
   Several doors wrap one or more per-record saves in ONE outer save, so the whole is one Undo step. A save raised
   inside a running save JOINS it and answers "yes" at once — before the outer command has been checked (the check on
   what a member's command really changed, the locked-week backstop, one man once an entry). Each door then reported
   the INNER answer: an outer command that was refused, and rolled back whole, still said "Input added" and closed its
   window. So every such door saves through here.

   `fn` is the door's own body; returning false means an inner save already refused and said why. The answer is
   `ok` — saved — and `refused`: the inner saves were content and the OUTER command said no. A refusal that said
   nothing of its own (the commit gate has no voice) is said here, so no Save is ever silent. A refused command puts
   the list back as NEW objects: a door that holds a record across the save finds it again by its id. */
export const NOT_SAVED = 'Not saved — that change was refused, and nothing was kept'
export function saveBatchX(fn: () => boolean | void): { ok: boolean; refused: boolean } {
  const say = HOOKS.toast
  /* held in an object: the door's answer is set inside the save's own callback */
  const got: { inner: boolean | void; spoke: boolean } = { inner: undefined, spoke: false }
  let done = false
  HOOKS.toast = (...a: any[]) => { got.spoke = true; return (say as any)(...a) }
  try { done = writeInputsBatch(() => { got.inner = fn() }) } finally { HOOKS.toast = say }
  const content = got.inner !== false
  const refused = content && !done
  if (refused && !got.spoke) say(NOT_SAVED, 'warn')
  return { ok: content && done, refused }
}
export const saveBatch = (fn: () => boolean | void): boolean => saveBatchX(fn).ok

/** The upchit sheet's Save for an EDIT: the edit and the ticked leftover removals as ONE undo step (the nested batch
 *  is safe — the inner writeInputsBatch's push is a no-op under the outer). */
export function commitEditUpchit(r: any, draft: any, removals: any[]): boolean {
  if (medPlanProtected(removals.map((row: any) => ({ row })))) { medicalLocked(); return false }
  return saveBatch(() => {
    const ok = commitInputEdit(r, draft)
    if (ok && removals.length)
      applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
    return ok
  })
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
  if (protectedInput(r)) return false          // read-only quarantine (P2-IMPL-03)
  /* the roster PALETTE (unlike rosterOptions() above) still carries the
     SPECIALS — sentinel placeholders like ALL AVAIL, never real aircrew — so
     a drag or an armed tap can reach here with one even though the dialog's
     own Person field can never offer it. "Unavailable" describes a real
     person's day; a placeholder has no day to describe. */
  if (!PEOPLE[personId]) return false
  /* …and it SAYS so (walker B of the ALL AVAIL check, 9 Oct 26: the drop was refused with no words at all — a gesture
     the palette invites, declined in silence) */
  if (isSpecial(personId)) { HOOKS.toast(`Unavailable is a real person’s day — ${PEOPLE[personId].cs} cannot take it`, 'warn'); return false }
  /* …AND A PLACEHOLDER IS NEVER THE SOURCE EITHER ([INPUT-ALL-AVAIL]; both first-round plan readers, 9 Oct 26). An input
     filed for ALL AVAIL / ALL carries the filer's one OIL answer for everyone behind it (D711 (1)); dragging a man onto
     it would turn it into that man's own input by a gesture that asks nothing. Its own window is the one door. */
  if (isSpecial(r.person)) { HOOKS.toast(`An input for ${PEOPLE[r.person].cs} is changed in its own window — open it to change who it is for`, 'warn'); return false }
  if (r.person === personId) return false           // dropped back on themselves — nothing to say
  const was = PEOPLE[r.person] ? PEOPLE[r.person].cs : String(r.person || '')
  const draft = draftOf(r)
  draft.person = personId
  /* a MEDICAL handed to a man who already carries a different medical there (or an upchit) is asked about first,
     exactly as the edit window asks (AB4, 26 Sep 26 — the second door both plan reviews named): the move waits on
     ui/MedMoveConfirm.tsx and nothing is written until it is answered */
  const ask = medAskFor(r, draft)
  if (ask === 'refused') return false
  if (ask) {
    setMedMove({ iid: r.iid, draft, ask, via: 'reassign', said: `${PEOPLE[personId].cs} is now unavailable instead of ${was}` })
    notify()
    return false
  }
  /* from a row on the schedule: the late date is not moved (D742 reading 3). The new holder's OIL answer is void all
     the same — he has not answered — and the question below still follows (the plan §4.7: not touched). */
  if (!commitInputEdit(r, draft, undefined, undefined, { sched: true })) return false
  HOOKS.toast(`${PEOPLE[personId].cs} is now unavailable instead of ${was}`, 'ok')
  /* THE SECOND DOOR ONTO THE SAME BUG (Fable M2, 22 Sep 26). This helper goes
     straight to commitInputEdit, so the gate's own person-change rule never
     runs and the new holder arrives unanswered — which the mode then draws with
     the wording of a refusal. Refusing the drag was the cheaper repair and is
     the wrong one: the app DRAWS this gesture as available, and inviting a
     gesture then declining it is the defect G5 is about. So the reassign stands
     and the question follows. */
  askOilIfPending(r)
  return true
}

/** THE QUESTION FOLLOWS A SAVE THAT LEFT A DAY UNANSWERED — the one body, so
 *  every door that writes an input straight through `commitInputEdit` raises it
 *  the same way and none of them can drift (Codex ranks 5 and 6, 22 Sep 26).
 *
 *  Three doors reach it: the drag-reassign above, the calendar's date drag, and
 *  the two in-place time cells (both of which go through `setInpField`, so
 *  neither the board's handler nor the week's contenteditable can bypass this).
 *  *(11 Oct 26 — owner D739 reading 4, D740 reading 4: the in-place cells no longer reach it for a scheduler. Hours
 *  typed on a row of the schedule keep a Yes at the new amount and open nothing — engine/oil.ts repricedOil; the
 *  drag-reassign and the calendar's drag still do.)*
 *  Each of them correctly voids an answer their edit made stale — a new holder
 *  has not answered, a moved date was never answered for, hours that no longer
 *  price an answer kill it — and each of them then relied on the member's
 *  notification bell being noticed later. The bell is per-member, so the
 *  SCHEDULER who made the change sees nothing at all, and the day pays nothing
 *  until somebody happens to look.
 *
 *  THE SPLIT THIS SETTLES: Fable reads the bell as the 28 Aug design for these
 *  two doors and Codex reads them as missing asks. The evidence that decides it
 *  is the app's own behaviour on the door that WAS closed — the drag-reassign
 *  asks immediately, on the same surface, with no navigation. Two gestures of
 *  the same kind, on the same record, answered two different ways is the drift
 *  the one-body rule exists to stop. The bell remains, for the member and for
 *  everything nobody was standing in front of.
 *
 *  It asks only where there is something to ask: an ask-set type, and a gate
 *  that reports a covered day with no answer that prices it. A remarks-only
 *  edit, a weekday move and a type that never earns all pass through silently.
 *  The editor is mounted at App level, so the sheet opens over whatever surface
 *  the gesture happened on — no navigation, unlike the bell, which is taking a
 *  member somewhere. */
export function askOilIfPending(r: any): boolean {
  if (!r || !oilAsks(r.type)) return false
  /* OF EVERY MAN OF A SHARED ENTRY, NOT OF THE ONE RECORD THE GESTURE HELD (Sol's read of the calendar job's bug check,
     8 Oct 26 — seen failing in `groupeditor.test.tsx` before this): the first man's standing No said nothing about a
     man beside him with no answer, who was then left to his own bell — what D660 rules out. The sheet opens on the
     first record that needs an answer. */
  const live = INPUTS.find((x: any) => x.iid === r.iid) || r
  const rows = entryRowsOf(INPUTS, live)
  const need = (rows.length ? rows : [live]).find((x: any) => (oilGate(draftOf(x), x) as any).kind === 'ask')
  if (!need) return false
  setOilAsk(need.iid); setInpEdit(need); notify()
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
  /* THIS DOOR IS REACHED ONLY FROM A ROW ON THE SCHEDULE (the week's `data-inp`, the board's `data-ifld`), so its save
     is a schedule-side one (D741, D742): the late date stays, and a Yes to the OIL question stays at what the new hours
     give — NO question opens (D739 reading 4, D740 reading 4; the plan §4.7). That replaces the fourth door's "the
     question follows the save" (Codex rank 6, 22 Sep 26), which stands only where the save was an ordinary one: a
     hand-made call by someone who may not edit the schedule, whose stale Yes was dropped as the window drops it. */
  const ok = commitInputEdit(inp, d, undefined, undefined, { sched: true })
  if (ok && !schedSide({ sched: true })) askOilIfPending(inp)
  return ok
}
/* Deleting an ACCEPTED input used to leave its ground row on the programme for
   good — nothing pointed at it any more, so it could never be removed and it
   still printed and validated as a real commitment. */
export function removeInput(r: any) {
  const inx = INPUTS.indexOf(r)
  if (inx < 0) { HOOKS.toast('That input is no longer there', 'warn'); return false }
  if (protectedInput(r)) return false          // read-only quarantine (P2-IMPL-03)
  /* write-path role backstop (owner, 27 Aug 26): a LOGGED-IN MEMBER deletes
     only their OWN inputs — the row's ✕ is hidden on everyone else's, this
     refuses a hand-made call. Same predicate as commitInputEdit's gate above
     (and the render gate): any signed-in session that cannot edit the
     schedule — not the role literal 'member', which no account carries and
     which left this gate inert in production. */
  if (!mayDeleteInput(r)) {   // [ACCOUNTS]: the one rule, perms.ts
    HOOKS.toast('You can only delete your own inputs', 'warn')
    return false
  }
  /* WHAT was deleted, and which day it logs against — captured before the
     splice below, the same "read the row, then remove it" order every
     deletion in board.ts follows. di follows interactions.ts:424's rule for
     this same input machinery: the day it is actually live on when it has
     one (accepted into that day's ground programme), else null — an input
     that was never accepted has no day to pin the removal to. */
  /* its history line is the change history's one writer's (state/changelines.ts — Astra DP-03, 28 Sep 26) */
  /* the save's own answer, never a bare "yes": a delete the commit gate refused is not a delete (saveBatch) */
  return saveBatch(() => { dropInputRow(r) })
}

/* DELETE A WHOLE SHARED INPUT — every record of the entry, as ONE command and one Undo step (owner D655: "shown and
   edited as one thing"; the plan §3.13: Delete "for all 4 people" is the filer's or an admin's). All or nothing: asked
   of the one rule for EVERY record before anything goes. A man in it who is neither takes HIMSELF out — removeInput on
   his own record, which is still his. */
/* WHO MAY CHANGE A SHARED INPUT, SAID TO SOMEONE WHO MAY NOT — one body for every door that says it (the window's foot
   has its own two sentences and asks the same question first): Delete for everyone, a save, the Delete key on the
   opened day's line (ui/InputsCal.tsx), a bar's drag (ui/caldrag.ts). "Only Saber — who filed it — or an admin can
   <do this>". TO THE FILER HIMSELF, WITH THE MEMBERS' SWITCH OFF (owner D731 (8), 10 Oct 26): that sentence named HIM as
   the one who could — "Only Ranger — who filed it — or an admin can change this", read by Ranger. He is told what is
   true: the switch is off. No right is decided here (state/perms.ts filerSwitchedOff — the reason, never the rule). */
export const FILING_OFF = 'Filing for other people is switched off — an admin can change this.'
export function sharedRefusal(rows: any[], what: string): string {
  if (filerSwitchedOff(rows)) return FILING_OFF
  const by = rows.find(r => r && r.grpBy)?.grpBy ?? rows.find(r => r && r.by)?.by
  return `Only ${PEOPLE[by] ? PEOPLE[by].cs : 'whoever filed it'} — who filed it — or an admin can ${what}`
}
export function removeEntry(rows: any[]): boolean {
  const live = (rows || []).filter(r => INPUTS.indexOf(r) >= 0)
  if (!live.length) { HOOKS.toast('That input is no longer there', 'warn'); return false }
  if (protectedInput(...live)) return false
  if (!live.every(r => mayDeleteInput(r))) {
    HOOKS.toast(sharedRefusal(live, 'delete this for everyone'), 'warn')
    return false
  }
  return saveBatch(() => { for (const r of live) dropInputRow(r) })
}

/* THE one per-row removal body — removeInput above (one row, its own batch)
   and clearHistoryBefore below (bulk, one batch) both run exactly this, so
   the bulk sweep can never drift from what a single delete does.
   A Leave-War-synced row (owner, 17 Aug 26 — full two-way): deleting it
   here WITHDRAWS the leave from the war too, before the splice while the
   row still says what was granted. Without this the next reconcile would
   re-mint the row from the still-approved cells — the snap-back. */
function dropInputRow(r: any) {
  /* [ARCH-STACK] step 4: deleting the row IS deleting the absence — the war
     reads it, so there is nothing to withdraw (deliberate delete propagates
     and sticks, owner decision 2, 13 Sep 26). */
  /* THE DELETE WRITES THE REQUEST ALONE ([DB-READINESS] group A, phase 6 (c) — D450): its row goes from every week as that
     week is read (engine/overlay.ts viewOfWeek, rule 1 — the week on screen straight after this command), a published day
     reads it pending (D114, D178), and an Undo gives the request back and with it the exact row (state/holderbase.ts). A
     request "taken off" whose own row stands again (a plan switched in — [REQ-ORPHAN-ROW] 3) needs nothing of its own
     either: rule 1 takes that row too. */
  const ix = INPUTS.indexOf(r); if (ix >= 0) INPUTS.splice(ix, 1)
}

/* ---- ONE SAVE FOR A WHOLE GROUP (owner D654, D655, D658, D660 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "The writer") ---------------------------------
   His ruling is "one shared group input, shown and edited as one thing". It is KEPT as one record per man tied by a
   group id (state/inputgroup.ts — every reader of an input reads one man's record and stays as it is), so "one thing"
   is made here, at the save: ONE command files, changes or trims every record of the entry alike.

   `entry` — the records the editor was opened on (state/inputgroup.ts entriesOf), or null for a new filing.
   `draft` — the editor's own draft; its `person` is not read. `people` — who the entry should now hold.
   `oilDec` — the filer's answer to the OIL question, asked ONCE for the entry (D660: "that person filing should answer
   for all" — the days and the hours are the same for every man, so the amounts are): it is written onto every record
   this save files or changes; with nothing else changed, onto every record of the entry (the filer revising it for all).

   IT RUNS THE PER-RECORD BODIES A SINGLE INPUT ALREADY USES — commitNewInput for each man added, commitInputEdit for
   each record kept WHOSE SHARED FIELDS ACTUALLY CHANGE, dropInputRow for each man taken off — inside one outer batch,
   so every per-record rule (the remark's date token, the voiding of an OIL answer the hours no longer price, the late
   date `mod`, who placed and changed it, the absence rules at the door) runs for each man exactly as for a single
   input, and the whole is ONE Undo step.

   A CHANGE TO THE PEOPLE ALONE TOUCHES NOBODY ELSE (both plan readers' finding G6): commitInputEdit stamps the late
   date on every save, whatever changed — so a record kept with its shared fields as they were is NOT passed through
   it. Adding or taking off a man after the cut-off leaves the others' late date and stamps alone; only the man added
   can be late.

   ALL OR NOTHING. Every refusal a single input can meet is asked for EVERY man before anything is written, and the
   sentence names the man where it is his alone; a refusal that only shows inside the batch (the absence rules — no
   leave over leave, none over a medical; the check on what a member's command changed) throws and rolls the whole
   command back. A half-filed group cannot exist. Leave over recorded work is NOT a refusal (his ruling of 20 Sep 26):
   it is filed and flagged, for a group as for one man, in ONE note naming every man it applies to.

   WHO THE ENTRY'S FILER IS (`grpBy`, finding G4). A group made from nothing: whoever files it. A single input made a
   group by a MEMBER: that member. By an ADMIN: the single input's own filer (`by`) where it has one — an admin's hand
   never takes an entry from the member who filed it — else that admin. Every man added later takes the entry's
   filer and his own true `by`. An entry of one man is an ordinary input: one person filed alone gets no group at all.

   Returns true when it is saved (or there was nothing to save); false, having said why, when it is not. */
export function commitGroup(entry: { rows: any[] } | null, draft: any, people: any[], oilDec?: Record<string, number>): boolean {
  if (!draft) return false
  const say = HOOKS.toast
  const cs = (p: any) => (PEOPLE[p] ? PEOPLE[p].cs : String(p ?? ''))
  const want: string[] = []
  for (const p of people || []) { const id = p == null ? '' : String(p); if (id && !want.includes(id)) want.push(id) }
  const rows: any[] = entry ? (entry.rows || []).filter((r: any) => INPUTS.indexOf(r) >= 0) : []
  if (entry && !rows.length) { say('That input is no longer there — nothing was saved', 'warn'); return false }
  if (!want.length) { say('Pick at least one person', 'warn'); return false }
  const scheduler = canEditSched(), mine = me()
  if (!scheduler && mine == null) { say('Sign in with your own account to file an input', 'warn'); return false }
  /* A PLACEHOLDER IS FILED ON ITS OWN ([INPUT-ALL-AVAIL] — the plan §3.2). The WHOLE selection is judged before any man
     is written: a placeholder among several people, the two placeholders together, or a placeholder taking over an
     entry that is a group. (Hiding the two in "Several people" is not enough — switching from one person to several
     keeps what was chosen; both first-round plan readers.) */
  const ph = want.find(p => isSpecial(p))
  if (ph != null && (want.length > 1 || rows.some(r => r.grp != null || r.grpBy != null) || rows.length > 1)) {
    say(placeholderProblem({ person: ph, type: 'Duty', grp: 1 }), 'warn'); return false
  }
  const kept = rows.filter(r => want.includes(String(r.person)))
  const gone = rows.filter(r => !want.includes(String(r.person)))
  const have = new Set(rows.map(r => String(r.person)))
  const added = want.filter(p => !have.has(p))

  /* WHO MAY — asked before anything else, of the one module (state/perms.ts) */
  const many = kept.length + added.length > 1
  if (many && scheduler && needsDoc(draft.type)) {
    say(`${isUpchit(draft.type) ? 'An upchit' : 'A medical entry'} is filed for one person at a time — each needs its own document`, 'warn'); return false
  }
  for (const p of added) if (!mayFileInputFor(p, draft.type)) { say(fileForOtherRefusal(draft.type), 'warn'); return false }

  /* EVERY REFUSAL A SINGLE INPUT CAN MEET, FOR EVERY MAN, BEFORE ANYTHING IS WRITTEN. Asked quietly, then said once:
     as it is where every man meets the same one (a missing time), with his callsign where it is one man's alone */
  const norm = new Map<string, NonNullable<ReturnType<typeof normalizeInputDraft>>>()
  const refused: Array<[string, string]> = []
  for (const p of want) {
    const r = kept.find(x => String(x.person) === p) || null
    let why = ''
    HOOKS.toast = (m: any) => { if (!why) why = String(m) }
    let n: ReturnType<typeof normalizeInputDraft>
    try { n = normalizeInputDraft({ ...draft, person: p }, r) } finally { HOOKS.toast = say }
    if (!n) refused.push([p, why || 'This input could not be saved'])
    else norm.set(p, n)
  }
  if (refused.length) {
    const same = refused.length === want.length && refused.every(x => x[1] === refused[0][1])
    say(same ? refused[0][1] : `${cs(refused[0][0])} — ${refused[0][1]}`, 'warn')
    return false
  }
  const first = norm.get(want[0])!
  if (protectedInput(...rows, normDest(first, draft.yr))) return false

  /* which of the records kept actually change: only those are saved (G6) */
  const sansKey = (x: any) => Object.keys(sansFlags(x)).sort().join(',')
  /* THE DATES ARE COMPARED AS DATES, NOT AS THEIR LABELS (Astra's read of the date door, 9 Oct 26 - A1). A label
     carries no year inside the loaded one, so a shared input moved by exactly a year - 13 Oct 2027 to 13 Oct 2026 -
     read 'Oct 13' on both sides: nothing was written, and the window closed saying "Input updated". */
  const wantEnd = draft.end && draft.end !== draft.start ? draft.end : ''
  const moved = (r: any): boolean => unfmt(r.date, r.yr) !== draft.start || (r.endDate ? unfmt(r.endDate, r.yr) : '') !== wantEnd
  /* ONE REMARK FOR EVERY MAN OF THE ENTRY (both reads of the date door - Astra A2, Sol 2). When the dates change, the
     save rewrites the remark's "till <last day>" word on each record it CHANGES (commitInputEdit) - and a man ADDED in
     the same save took the remark as typed, old last day and all. Remarks are part of what makes the records one
     entry, so one shared input came out as two. The effective remark is worked out HERE, once, and is what every
     man - kept or added - is saved with; the picker itself still never touches the remark. */
  const redated = kept.some(r => r.date !== first.date || (r.endDate || '') !== (first.endDate || '') || moved(r))
  let rem = String(draft.remarks || '').trim()
  const tail = redated ? remarksTailWord(rem) : null
  if (tail) rem = withRemarksTail(rem, ordISO(dateOrd(first.date, baseYear())), ordISO(dateOrd(first.endDate || first.date, baseYear())), tail)
  const d = rem === String(draft.remarks || '') ? draft : { ...draft, remarks: rem }
  const changes = (r: any): boolean => {
    const n = norm.get(String(r.person))!
    return r.type !== draft.type || !!r.allday !== !!draft.allday || r.s !== n.s || r.e !== n.e
      || r.date !== n.date || (r.endDate || '') !== (n.endDate || '') || moved(r) || (r.half || '') !== (n.half || '')
      || String(r.remarks || '') !== rem
      || String(r.title || '') !== titleOf(draft.type, draft.title)
      || (isSansAvail(draft.type) && sansKey(r.sans) !== sansKey(draft.sans))
  }
  const changed = kept.filter(changes)
  const whole = sharedRefusal(rows, 'change this for everyone')
  for (const r of changed) if (!mayEditInput(r)) { say(whole, 'warn'); return false }
  for (const r of gone) if (!mayDeleteInput(r)) { say(whole, 'warn'); return false }

  const regroup = many && kept.some(r => !r.grp)
  const oilOnly = !!oilDec && !added.length && !gone.length && !changed.length
  if (oilOnly) for (const r of kept) if (!mayEditInput(r)) { say(whole, 'warn'); return false }
  /* a fresh OIL answer is EVERY man's (D682, below) - when it is given by someone who may change the input for
     everyone: its filer, an admin. A man who may only ADD somebody (this door lets a member add a man to an entry he
     did not file) answers for the man he adds and for nobody else - the others' answers are not his to replace. */
  const forAll = !!oilDec && kept.every(r => mayEditInput(r))
  if (!added.length && !gone.length && !changed.length && !regroup && !oilOnly) return true

  /* THE ONE COMMAND. What the doors and the absence rules say inside it is gathered, and said once afterwards. */
  const heard: string[] = []
  HOOKS.toast = (m: any) => { for (const part of String(m).split(' · ')) if (part && !heard.includes(part)) heard.push(part) }
  let ok = false
  try {
    ok = writeInputsBatch(() => {
      const stop = (): never => { throw new CmdRefused(heard[heard.length - 1] || 'refused') }
      let grp: any = rows.find(r => r.grp)?.grp, grpBy: any = rows.find(r => r.grpBy)?.grpBy
      if (!grp && many) {
        grp = newId('g')
        grpBy = !scheduler ? mine : (rows[0] && rows[0].by != null ? rows[0].by : mine)
      }
      for (const r of gone) dropInputRow(r)
      for (const r of kept) {
        if (grp && !r.grp) { r.grp = grp; r.grpBy = grpBy }
        if (changed.includes(r)) {
          if (!commitInputEdit(r, { ...d, person: r.person, docIds: rowDocIds(r) })) stop()
          if (oilDec) r.oil = { ...oilDec }
        } else if (oilOnly) { r.oil = { ...oilDec }; stampChanged(r) }
        /* THE ANSWER IS EVERY MAN'S (owner D682, 9 Oct 26: "the answer is written for everyone in it - a man's own
           earlier answer, a No included, is replaced"; Sol's read of the date door - 1). A man added or taken off
           brings the question back for "X +2", and the filer's answer went on the ADDED man's record alone: the sheet
           had asked about all of them, and a man's own earlier No stood against the filer's fresh Yes. A record
           whose answer is already this one is not touched (no "changed" stamp for nothing). */
        else if (forAll && JSON.stringify(r.oil || {}) !== JSON.stringify(oilDec)) { r.oil = { ...oilDec }; stampChanged(r) }
      }
      for (const p of added) {
        let row: any = null
        if (!commitNewInput({ ...d, person: p }, false, undefined, undefined, x => { row = x }) || !row) stop()
        if (grp) { row.grp = grp; row.grpBy = grpBy }
        if (oilDec) row.oil = { ...oilDec }
      }
    })
  } finally { HOOKS.toast = say }
  if (!ok) {
    const why = heard[0]
    say(why ? `${why} — nothing was saved${want.length > 1 ? ' for anyone: take that person off the list, or change it' : ''}` : 'Not saved — that change is not yours to make', 'warn')
    return false
  }
  /* what went through and wants telling — leave over recorded work, a bid replaced — as ONE note */
  if (heard.length) say(heard.join(' · '), 'warn')
  return true
}

/* ---- CLEAR OLD DATA / CLEAR EDIT HISTORY (owner, 25 Aug 26 — "an option on
   the admin page to clear a set date of history data … so that the app stays
   snappy", then the same day: "On specific dates or a range or from this day
   till history onwards"). The PERIOD GRAMMAR is one resolver shared by both
   sweeps: 'before' a date (open-ended into the past), 'on' one date, or a
   'range' inclusive of both ends — resolved once into an inclusive-lower /
   EXCLUSIVE-upper ISO window, so every comparison below is the same
   `>= lo && < hi` shape whatever the mode.

   The DATA sweep is CLUTTER-ONLY (owner, 13 Sep 26 — [SYNC-INTEG] P4). It
   clears past calendar pucks and day titles (state/plan.ts) and NOTHING ELSE.
   Doctrine points, deliberate:
   - It NEVER deletes any leave / medical / duty INPUT, so it never changes a
     leave balance (balances are derived from inputs) — that whole class of
     data loss is designed out, not guarded against. The old input sweep and
     its Leave War withdrawals are gone.
   - It NEVER drops a stashed week. A stash is not safely "clutter": a
     published-then-unpublished day keeps its issuance history in a stash even
     when the day reads empty, and an authored week that was deliberately
     EMPTIED holds that fact ONLY as an empty stash — dropping it would resurrect
     the seed. Both were proven in the pre-build red-team (SYNC-003 / SYNC-005),
     so saved weeks are left alone.
   - It NEVER touches the currently-loaded week, in either collection — a puck
     or title on any of its seven days is excluded even when the period covers it.
   - DELETION FAILS CLOSED: an impossible date (isoOk) clears nothing; only a
     puck/title wholly inside the period goes.
   - The pucks/titles sweep is ONE writeInputsBatch, so it lands as a single
     undo step (history.ts snapshots both) — the safety net for a destructive
     button, and enough on its own now that no stash or input is touched.
   - `dry` answers "how many would go?" without touching anything — the
     panel's confirm step shows the count it is about to act on, from the
     same selection logic it will act with (one body, no drift).
   - canEditSched at the write path, per the standing role doctrine — the
     Admin page's own gate is the page, this is the belt.

   The EDIT-HISTORY sweep clears ELOG rows by the LOCAL calendar date of when
   the edit was made (the date the history list prints), never touching the
   schedule itself. It is permanent — the log was never in the undo snapshot
   (editlog.ts's header says why) — and the clear itself is logged AFTER the
   sweep, so the record that history was cleared, and by whom, survives its
   own clearing even when the period covers today. */
export type ClearMode = 'before' | 'on' | 'range'
const ISO_RX = /^\d{4}-\d{2}-\d{2}$/
/* FAIL CLOSED on an IMPOSSIBLE date too (SYNC-006): the pattern alone accepts
   2026-02-31, and nextIso would silently normalise it to 3 Mar, widening the
   window past what was asked. Round-trip through a UTC date and reject anything
   the calendar does not actually hold — a bad month/day, 29 Feb in a non-leap
   year — so a typo clears NOTHING instead of the wrong span. */
const isoOk = (s: any) => {
  const str = String(s || '')
  if (!ISO_RX.test(str)) return null
  const [y, m, d] = str.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return str
}
const nextIso = (iso: string) => {
  const p = iso.split('-')
  return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + 1)).toISOString().slice(0, 10)
}
/* mode + dates → the window, or null when a needed date is missing or
   malformed (FAIL CLOSED: no window, nothing cleared). A reversed range is
   swapped, not refused — the two pickers don't order themselves. `said` is
   the sentence fragment both sweeps log with. */
function clearWindow(mode: ClearMode, a: string, b?: string): { lo: string | null, hi: string, said: string } | null {
  const A = isoOk(a)
  if (!A) return null
  if (mode === 'before') return { lo: null, hi: A, said: `from before ${A}` }
  if (mode === 'on') return { lo: A, hi: nextIso(A), said: `on ${A}` }
  const B = isoOk(b)
  if (!B) return null
  const x = A <= B ? A : B, y = A <= B ? B : A
  return { lo: x, hi: nextIso(y), said: `between ${x} and ${y}` }
}
/* The 7-day ISO span of the currently-loaded week, [lo, hi) — its Monday to the
   NEXT Monday. A puck or title on any of these seven days is never cleared, so
   the sweep can never disturb the week on screen (owner, [SYNC-INTEG] P4). */
function loadedWeekSpan(): { lo: string, hi: string } {
  const lo = keyToIso(mondayOf(CURWEEK))
  const p = lo.split('-')
  const hi = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + 7)).toISOString().slice(0, 10)
  return { lo, hi }
}

export function clearHistoryData(mode: ClearMode, a: string, b?: string, dry?: boolean): number {
  if (!canEditSched()) return 0
  const w = clearWindow(mode, a, b)
  if (!w) return 0
  const loaded = loadedWeekSpan()
  /* in the period, and NOT on the loaded week (owner: never touch the week on
     screen — a puck/title on any of its seven days is excluded even when the
     period covers it). Pucks/titles are keyed by their own ISO `date` field
     (SYNC-004: the old `.iso` read matched nothing, so real pucks were never
     cleared — state/plan.ts writes `date`). */
  const inWin = (iso: any) => !!iso && iso < w.hi && (w.lo == null || iso >= w.lo) &&
    !(iso >= loaded.lo && iso < loaded.hi)
  const oldPucks = PLANPUCKS.filter((s: any) => inWin(s.date))
  const oldRmk = Object.keys(DAYRMK).filter(inWin)
  const n = oldPucks.length + oldRmk.length
  if (dry || !n) return n
  /* ONE writeInputsBatch → ONE undo step (history.ts snapshots pucks + titles).
     No input is deleted, no balance moves, no stashed week is dropped and the
     loaded week is untouched, so there is nothing to preflight or persist beyond
     what the batch already does. */
  /* its history line INSIDE the batch ([DB-READINESS] group A, phase 4.1): one saved group, one change-log batch */
  writeInputsBatch(() => {
    oldPucks.forEach((s: any) => { const ix = PLANPUCKS.indexOf(s); if (ix >= 0) PLANPUCKS.splice(ix, 1) })
    oldRmk.forEach(k => { delete DAYRMK[k] })
    logAction(null, `Cleared ${n} item${n === 1 ? '' : 's'} of old clutter ${w.said}`, { date: todayIso(), sect: 'day' })
  })
  return n
}

/* kept as the one-argument spelling of the 'before' mode — the original
   control shipped with this name and the pins in wipe.test.tsx hold it */
export function clearHistoryBefore(iso: string, dry?: boolean): number {
  return clearHistoryData('before', iso, '', dry)
}

export function clearEditHistory(mode: ClearMode, a: string, b?: string, dry?: boolean): number {
  if (!canEditSched()) return 0
  const w = clearWindow(mode, a, b)
  if (!w) return 0
  /* ISO date → LOCAL midnight ms, because ELOG rows are stamped with the
     wall clock and the history list prints local dates */
  const ms = (iso: string | null) => {
    if (iso == null) return null
    const p = iso.split('-')
    return new Date(+p[0], +p[1] - 1, +p[2]).getTime()
  }
  /* ONE named command (`elog.sweep` — engine/editlog.ts): the exact lines it clears, and its own line — dated today
     (Fable F3): a line with no day is in no week's window, and the record that history was cleared, and by whom, must
     be seen — in one saved group ([DB-READINESS] group A, phase 4.3) */
  return elogSweep(ms(w.lo), ms(w.hi), dry, k => `Edit history cleared — ${k} entr${k === 1 ? 'y' : 'ies'} ${w.said}`)
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
/* THE FIELDS OF AN INPUT AS A WINDOW WEIGHS THEM (the plan §3.7): what "a field" is when the record is changed behind
   an open window. The hours are ONE field — all day, a half, a start and an end are set together by one control, and
   a clash on two of the four would be nonsense to read. */
const WIN_FIELDS: { k: string; label: string; keys: string[] }[] = [
  { k: 'person', label: 'person', keys: ['person'] }, { k: 'type', label: 'kind', keys: ['type'] },
  { k: 'title', label: 'title', keys: ['title'] },
  { k: 'start', label: 'start date', keys: ['start'] }, { k: 'end', label: 'end date', keys: ['end'] },
  { k: 'hours', label: 'hours', keys: ['allday', 'half', 'sTime', 'eTime'] },
  { k: 'remarks', label: 'remarks', keys: ['remarks'] }, { k: 'sans', label: 'Fly / OFT / AMT', keys: ['sans'] },
  { k: 'docs', label: 'documents', keys: ['docIds'] },
]
const fieldSame = (f: { keys: string[] }, a: any, b: any) => f.keys.every(k => JSON.stringify(a?.[k] ?? null) === JSON.stringify(b?.[k] ?? null))
const fieldPart = (f: { keys: string[] }, d: any) => Object.fromEntries(f.keys.map(k => [k, d?.[k]]))
/** a field's value in words, for "theirs … yours …" */
function fieldSay(k: string, d: any): string {
  if (!d) return 'nothing'
  if (k === 'person') return PEOPLE[d.person] ? PEOPLE[d.person].cs : String(d.person ?? 'nobody')
  if (k === 'type') return String(d.type || 'none')
  if (k === 'start' || k === 'end') return d[k] ? fmtDay(d[k]) : 'none'
  if (k === 'hours') return d.allday ? 'all day' : d.half ? String(d.half).toUpperCase() : `${d.sTime}–${d.eTime}`
  if (k === 'remarks') return d.remarks ? `“${d.remarks}”` : 'none'
  if (k === 'title') return `“${titleOf(d.type, d.title) || String(d.type || '')}”`
  if (k === 'sans') return d.sans ? (['f', 'o', 'a'].filter(x => d.sans[x]).map(x => x.toUpperCase()).join(' ') || 'none ticked') : 'none'
  const n = (d.docIds || []).length
  return n ? `${n} document${n > 1 ? 's' : ''}` : 'none'
}

export function InputEditor() {
  useVersion()
  const r = INPEDIT
  const open = !!r
  /* the dialog opens on an EXISTING row for an edit, or on a seed row carrying
     `_new` for the board's + Add — same fields, but Save inserts rather than
     overwrites and there is nothing to Delete (see commitNewInput) */
  const isNew = !!(r && r._new)
  /* which board panel the + Add came from (owner, 19 Aug 26) — 'g' the Ground
     Programme (+ Inputs: activity types only, accepted straight onto the
     programme), 'u' Unavailable (leave/medical/OD only, with a date range),
     's' SANS Availability (the type is fixed, SANS aircrew only). '' is an
     ordinary EDIT, which keeps the full type list — retyping an existing row
     across groups is a real move the app already handles. */
  const ctx = isNew ? (r._ctx || '') : ''
  /* GUARD RAIL (owner, 27 Aug 26): a medical input stays medical. Editing a
     downchit offers ONLY the downchit family (ATT C/B, OML, HL) — never a
     retype into leave or a course, which would strand its mandatory document
     and the trim rules; an upchit edit likewise stays an upchit. The
     cross-group retype the comment above allows is kept for non-medical rows.
     Board + Add keeps its own TYPE_ALLOW list; this only narrows an EDIT. */
  const typeFilter = ctx ? TYPE_ALLOW[ctx]
    : (r && !isNew && isDownchit(r.type)) ? isDownchit
    : (r && !isNew && isUpchit(r.type)) ? isUpchit
    /* and no input already filed is turned INTO SANS availability (D620: it is filed on the SANS calendar only); a
       SANS commitment's own editor keeps the full list, as built */
    : (r && !isNew && !isSansAvail(r.type)) ? TYPE_ALLOW.i
    : undefined
  const [draft, setDraft] = useState<any>(null)
  /* the upchit save-time summary (owner, 27 Aug 26) — effects to show + the
     commit its Save runs; null = no sheet over this dialog */
  const [upConf, setUpConf] = useState<any>(null)
  /* the medical clash sheet (owner, 27 Aug 26) — the clashes to put to the
     filer plus the span ordinals its Save resolves against */
  const [medConf, setMedConf] = useState<any>(null)
  /* the OIL ask (owner, 28 Aug 26) — the oilGate payload; null = no sheet */
  const [oilConf, setOilConf] = useState<any>(null)
  /* the medical-document ask (owner, [SYNC-INTEG]) — {who, typeLabel}; null = no sheet */
  const [docConf, setDocConf] = useState<any>(null)
  const box = useRef<HTMLDivElement>(null)
  const keepDraft = useRef(false)
  /* A WINDOW ON THE INPUTS PAGE (owner D641: "an input or a commitment being filed" is one of the windows that drag
     while the page behind works; the plan §3.7: "the input / commitment editor when it is opened on the Inputs page").
     Opened from the board or the week it stays the blocking dialog it was — outside this job's mock-ups.
     A window does not block, so the record it shows CAN be changed behind it. The rule is the plan's: "an editor never
     saves a field its user did not change". `base` is the record as the window last saw it; on every change behind it
     a field he has not touched takes the live value silently, and a field changed BOTH ways is put to him (`clash`).
     `shown` is the record the window holds, for the one-editor-at-a-time question (`swap`). */
  const win = open && CURPAGE === 'inputs'
  const base = useRef<any>(null)
  const shown = useRef<any>(null)
  const [clash, setClash] = useState<string[]>([])
  /* WHAT HIS CHANGE WAS MADE OVER, per field (`[CAL-CHECK-SEEN]`, the editor — walker G's X-08, 10 Oct 26). `base` moves
     with every change behind the window, so once a field was in dispute nothing remembered the value he had typed his
     change over: a bar's drag rewrote a leave's "till" word under his typed remark — rightly listed — and when the
     drag was UNDONE the note stayed, "theirs" now the very value the window had opened on. A field whose record is
     back to what his change was made over is not in dispute: it is an ordinary unsaved change again. Kept from the
     first change behind him until the field is settled the other way (he takes theirs, both become the same, the
     window is seeded afresh). */
  const madeOver = useRef<Record<string, any>>({})
  const [, redraw] = useState(0)
  const [swap, setSwap] = useState<any>(null)
  const swapOk = useRef(false)
  /* WHO IT IS FOR (owner D654–D656; the plan §3.13). On the Inputs page the Person field is the people picker
     (ui/PeoplePick.tsx): `ppl` in the order picked, `several` its switch. The editor opened on ANY record of a shared
     input holds the ENTRY — its records worked out on read (state/inputgroup.ts), never kept here — and a save for
     more than one man, or of an entry of more than one, is ONE command (commitGroup). `basePpl` is the entry's people
     as the window last saw them: a man added or taken off on the page behind is followed silently — an add and a
     removal of different men cannot collide. */
  const [ppl, setPpl] = useState<string[]>([])
  const [several, setSeveral] = useState(false)
  const basePpl = useRef<string[]>([])
  const entryIds = useRef<string[]>([])
  const [delAll, setDelAll] = useState(false)
  const [takeOut, setTakeOut] = useState(false)
  /* a saved shared input's dates, being re-picked in the window (D681): true between the tap for the new start and the
     tap for the new end — see `datesHere`, below */
  const [midPick, setMidPick] = useState(false)
  /* ...and two more, from the two reads of that door (9 Oct 26). `calKey`: the calendar's month is seeded ONCE, when it
     is put on screen - and it was put on screen with the dates of the input the window held BEFORE (the new record
     arrives a render ahead of its draft), so a December input opened over an October one showed October (Astra A3).
     It is counted up where the draft is re-seeded, so the calendar is made again WITH that draft - and never on a
     tap, which would throw away a month he had turned to. `datesPicked`: he has tapped the calendar since the window
     took its dates. A first tap ON the saved day leaves the dates as they were, and "not different from what was
     saved" read as "not touched": a move made behind the window then replaced his start without a word (Sol 3). */
  const [calKey, setCalKey] = useState(0)
  const [datesPicked, setDatesPicked] = useState(false)
  const rows: any[] = r && !isNew ? entryRowsOf(INPUTS, r).filter((x: any) => INPUTS.indexOf(x) >= 0) : []
  const picker = win && ctx !== 'up'
  const grouped = picker && (ppl.length > 1 || rows.length > 1)
  const csOf = (p: any) => (PEOPLE[p] ? PEOPLE[p].cs : String(p ?? ''))
  /* re-seed whenever a different row is opened, never on a repaint — a
     re-seed mid-edit would throw away what has been typed. The bell's
     hand-off (pops.OILASK) is consumed HERE: opened on the flagged row, the
     OIL sheet comes straight up over the dialog so the tap lands on the
     question itself — one-shot, cleared as it is read. */
  useLayoutEffect(() => {
    /* the same record, found again after a refused save (stay, below): what he typed is kept */
    if (keepDraft.current) { keepDraft.current = false; shown.current = r; return }
    /* ONE EDITOR AT A TIME (the plan §3.7): the page behind a window works, so another input can be asked for while
       this one holds changes nobody has saved. It is not replaced under him: the window keeps the first, and asks. */
    const prev = shown.current
    const other = !!prev && !!r && r !== prev && !(prev.iid && prev.iid === r.iid)
    /* ... and WHO IT IS FOR is his work too (the same bug check - Astra's M2): the picked people are held apart from
       the draft's fields, so a third man added to a shared input, and nothing else touched, was thrown away without
       a word when another input was opened. Compared as a set - picked and un-picked again is no change. */
    const pplTouched = ppl.length !== basePpl.current.length || ppl.some(id => !basePpl.current.includes(id))
    if (win && other && !swapOk.current && draft && base.current && (pplTouched || WIN_FIELDS.some(f => !fieldSame(f, draft, base.current)))) {
      setSwap(r); keepDraft.current = true; setInpEdit(prev); notify()
      /* ...AND IT ASKS FROM THE FRONT (`[TITLE-CHECK-SEEN]` 4, 10 Oct 26). The press that asked for the other input landed
         on another window first — a card of the opened day — and that window took the front, as any pressed window
         does: this one put its question up BEHIND it. On a phone the day's window is nearly the whole screen, so
         nobody saw a question at all until the day was closed. The window that asks comes forward. */
      bringForward('inputedit')
      return
    }
    swapOk.current = false
    shown.current = r
    base.current = r ? draftOf(r) : null
    madeOver.current = {}
    setClash([]); setSwap(null)
    setDraft(r ? draftOf(r) : null); setUpConf(null); setMedConf(null); setOilConf(null); setDocConf(null)
    const rs = r && !r._new ? entryRowsOf(INPUTS, r) : []
    const p0 = rs.length ? rs.map((x: any) => String(x.person)) : r ? [String(r.person ?? '')] : []
    setPpl(p0); setSeveral(rs.length > 1); basePpl.current = p0; entryIds.current = rs.map((x: any) => x.iid)
    setDelAll(false); setTakeOut(false); setMidPick(false); setDatesPicked(false); setCalKey(k => k + 1)
    if (r && !r._new && OILASK && r.iid === OILASK) {
      setOilAsk(null)
      const g = oilGate(draftOf(r), r)
      /* the bell's question to a man about his OWN record inside a shared input he did not file: his answer alone */
      if (g.kind === 'ask') setOilConf(rs.length > 1 && isMe(r.person) && !rs.every((x: any) => mayEditInput(x)) ? { ...g, own: r.iid } : g)
    } else if (OILASK && !r) setOilAsk(null)
  }, [r])
  /* THE RECORD BEHIND THE WINDOW. After every paint of the page the window asks what its record now is:
       · GONE (deleted on the page behind, or taken away by an Undo) — the window closes and says so;
       · the same record as a NEW object (a refused command and an Undo both put the list back as new objects) — it
         holds that one, without throwing away what he typed;
       · CHANGED — a field he has not touched takes the live value silently; one changed both ways is listed, with what
         theirs is and what his is, and waits for his choice; Save is refused until he has made it.
     So a Save writes only his own changes over the record as it stands (the plan §3.7). */
  useLayoutEffect(() => {
    if (!win || !r || isNew || !draft) return
    /* NOT WHILE IT IS ASKING. When another input is asked for over unsaved work, the effect above keeps the first one
       and puts it back — but for that one paint `r` IS the other input, and this step took it for the window's own
       record changed behind it: it said "Changed while this window was open: people — X added, Y taken off", said the
       reverse a moment later, and put the saved people back over the ones he had picked (the calendar job's bug check,
       8 Oct 26 — found writing the test for a people-only change). The window follows only the record it is SHOWING. */
    if (shown.current !== r) return
    const now = INPUTS.find((x: any) => x.iid === r.iid)
    if (!now) {
      /* the record this window was opened on left a shared input that lives on: the window holds the rest of it */
      const rest = entryIds.current.length > 1 ? entryIds.current.map(id => INPUTS.find((x: any) => x.iid === id)).find(x => x && x.grp) : null
      if (rest) { keepDraft.current = true; setInpEdit(rest); notify(); return }
      HOOKS.toast('That input was removed while its window was open — the window has closed', 'warn'); close(); return
    }
    if (now !== r) { keepDraft.current = true; setInpEdit(now); notify(); return }
    /* THE PEOPLE, FOLLOWED: a man added or taken off behind the window is added or taken off in it, and said once */
    const liveRows = entryRowsOf(INPUTS, now)
    const liveP = liveRows.map((x: any) => String(x.person)), bp = basePpl.current
    entryIds.current = liveRows.map((x: any) => x.iid)
    if (liveP.join('\u0000') !== bp.join('\u0000')) {
      const added = liveP.filter(p => !bp.includes(p)), removed = bp.filter(p => !liveP.includes(p))
      basePpl.current = liveP
      const next = [...ppl.filter(p => !removed.includes(p)), ...added.filter(p => !ppl.includes(p))]
      setPpl(next.length ? next : liveP)
      if (next.length > 1) setSeveral(true)
      const what = [added.length ? added.map(csOf).join(', ') + ' added' : '', removed.length ? removed.map(csOf).join(', ') + ' taken off' : ''].filter(Boolean).join(', ')
      if (what) HOOKS.toast('Changed while this window was open: people — ' + what, 'info')
    }
    const cur = draftOf(now), b = base.current
    if (!b) { base.current = cur; return }
    if (WIN_FIELDS.every(f => fieldSame(f, cur, b))) return
    let next = draft
    const hit = new Set(clash)
    for (const f of WIN_FIELDS) {
      if (fieldSame(f, cur, b)) continue                                   // not changed behind him
      /* a date he has TAPPED is his, even where the tap was on the day already saved (`datesPicked`, above) */
      const tapped = datesPicked && (f.k === 'start' || f.k === 'end')
      if (!tapped && fieldSame(f, draft, b)) { next = { ...next, ...fieldPart(f, cur) }; delete madeOver.current[f.k] } // he has not touched it: theirs, silently
      else if (!fieldSame(f, draft, cur)) {                                // changed both ways…
        if (!madeOver.current[f.k]) madeOver.current[f.k] = b
        /* …unless the record is BACK to what his change was made over (`madeOver`, above): nothing is in dispute */
        if (fieldSame(f, cur, madeOver.current[f.k])) hit.delete(f.k)
        else hit.add(f.k)
      }
      else { hit.delete(f.k); delete madeOver.current[f.k] }               // both made the same change
    }
    base.current = cur
    if (next !== draft) setDraft(next)
    if (hit.size !== clash.length || [...hit].some(k => !clash.includes(k))) setClash([...hit])
    /* …and where the same fields stay in dispute, the note is drawn again: it prints "theirs" from `base`, which has
       just moved, and nothing else would repaint it — a second change behind him left the first value on screen
       (found by this batch's own control test, 10 Oct 26). Once: the next pass finds the record as `base` and stops. */
    else if (hit.size) redraw(n => n + 1)
  })
  /* asked before every write, and again after any blocking question (an upchit, OIL or clash sheet) — the record may
     have been changed behind the window while the question stood */
  const undecided = () => {
    if (!win || !clash.length) return false
    setUpConf(null); setMedConf(null); setOilConf(null); setDocConf(null)
    HOOKS.toast('Choose which to keep first — your change, or the one made while this window was open', 'warn')
    return true
  }
  useEffect(() => {
    if (!open) return
    /* Escape peels one layer: whichever sheet is up first, then the dialog —
       all are deps so the handler never closes the dialog under a sheet */
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      /* as a window it does not own the page: Escape typed in a box on the page BEHIND it is that box's own (a cell
         being edited puts its text back on Escape) — the shell's own rule, ui/FloatWindow.tsx */
      if (win) {
        const a = document.activeElement as HTMLElement | null
        const mine = !!a && !!box.current && !!box.current.closest('.floatwin')?.contains(a)
        if (!mine && a && a !== document.body && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return
        /* AND IT IS THE FRONT WINDOW'S (D641; the calendar job's bug check, 8 Oct 26 - Astra's M1, seen in the running
           build): with the settings window opened over this one, Escape closed THIS editor - the one behind - and
           lost what he had typed, because this handler runs first and never asked which window was in front. With
           none of its own questions up, the editor takes Escape only when it is the front window; otherwise the
           key is left for the shell, which closes the front one (ui/FloatWindow.tsx). A question of its own (the
           OIL, upchit, medical or document sheet) blocks the page, so it still answers first. */
        if (!docConf && !upConf && !medConf && !oilConf && frontWin() !== 'inputedit') return
      }
      e.stopPropagation()
      if (docConf) setDocConf(null)
      else if (upConf) setUpConf(null)
      else if (medConf) setMedConf(null)
      else if (oilConf) setOilConf(null)
      else close()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [open, win, upConf, medConf, oilConf, docConf])

  const close = () => { setInpEdit(null); notify() }
  /* the "?" card beside Type takes Escape only while this window is the one in front (ui/TypeLegend.tsx) */
  const legendFront = useRef(() => frontWin() === 'inputedit').current
  /* A REFUSED SAVE KEEPS THE WINDOW, ON THE RECORD, WITH WHAT HE TYPED ([INPUT-SAVE-SAYS-OK-WHEN-REFUSED]; the plan
     §3.13: "his Save is refused with the sentence, the window stays"). A refused command puts the list back as new
     objects, so the record this window holds is no longer the one in the list: find it again by its id and hold
     that — WITHOUT re-seeding the draft, which the effect above would do for any newly opened row. A new input's
     seed is in no list and simply stays; a record that is truly gone closes the window, as it always did. */
  const stay = () => {
    if (!r || r._new) return
    const live = INPUTS.find((x: any) => x.iid === r.iid)
    if (!live) { close(); return }
    if (live !== r) { keepDraft.current = true; setInpEdit(live); notify() }
  }
  /* a refusal KEEPS the dialog open, so nothing typed is lost — bar the one
     refusal there is no way back from: the row went (an undo under the modal),
     and there is nothing left to hold the typing for */
  /* THE SAVE AND ITS OWN WORD ARE ONE NOTE (found by the gate run of the design vet's build, 10 Oct 26). The app has one
     passing note, whose words the next one replaces. A save can say something of its own as it is written — the Leave
     War's door: "Ammo's LL replaces the LL bid on 11 Feb", "the leave is cut for the ATT C" — and this window then said
     "Input added" over it in the same instant. While the List had its own add form (which said nothing after a
     one-person add) that sentence was read there; with the form gone (D729, V1) the window is the page's one maker,
     and the sentence would have been covered on every filing. So every save of this window runs inside ONE note
     (engine/hooks.ts toastBatch — the publish command's way): what the save said and "Input added" are said together,
     in order, in the stronger colour. A refused save still says its one sentence alone — nothing is joined to it,
     because the window says "added" only after a save that happened. */
  const doSave = (removals: any[], oilDec?: Record<string, number>) => HOOKS.toastBatch(() => saveNow(removals, oilDec))
  const saveNow = (removals: any[], oilDec?: Record<string, number>) => {
    if (undecided()) return
    if (medPlanProtected(removals.map(row => ({ row })))) return medicalLocked()
    /* FOR SEVERAL PEOPLE, OR A SHARED INPUT: one command for the whole entry (commitGroup) — the OIL answer, asked
       once, written for every man (D660) */
    if (grouped) {
      const had = new Set(INPUTS.map((x: any) => x.iid))
      const entry = isNew ? null : { rows: entryRowsOf(INPUTS, r) }
      if (commitGroup(entry, draft, ppl, oilDec)) {
        const row = (entry && entry.rows.find((x: any) => INPUTS.indexOf(x) >= 0)) || INPUTS.find((x: any) => !had.has(x.iid))
        if (row) revealInput(row)
        HOOKS.toast(isNew ? (ppl.length > 1 ? `Input added for ${ppl.length} people` : 'Input added') : 'Input updated', 'ok'); close()
      } else stay()
      return
    }
    if (isNew) {
      let savedRow:any=null
      const ok = saveBatch(() => {
        const ok = commitNewInput(draft, ctx === 'g', undefined, undefined, row=>{savedRow=row})
        /* the OIL answers land on the just-unshifted row, inside the same
           batch, so the add and its acknowledgment are ONE undo step */
        if (ok && oilDec) savedRow.oil = oilDec
        if (ok && removals.length)
          applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
        return ok
      })
      if (ok) {
        if(r._calendar||CURPAGE==='inputs')revealInput(savedRow)
        HOOKS.toast(ctx === 'g' ? 'Input added to the Ground Programme' : 'Input added', 'ok'); close()
      }
      return
    }
    /* AN OIL ANSWER ALONE IS NOT A CHANGE TO THE INPUT (both readers of the input card's check, 10 Oct 26). "Answer…" and
       "Change…" came through the full save below, which stamps the input's late date with today — so an on-time input
       turned LATE for having its OIL question answered after the cut-off. The desktop row's chip never did that
       (ui/InputsPage.tsx reviseOil), and since the phone's card has no chip (D723) this window is the phone's only
       way to an answer. Where nothing of the input itself differs from the record as it stands, the answer is written
       by itself — who answered and when is stamped, the late date is not moved — one step, one Undo. Anything he has
       also changed goes through the full save, answer and change together, as before. */
    if (oilDec && !removals.length && WIN_FIELDS.every(f => fieldSame(f, draft, draftOf(r)))) {
      if (!mayEditInput(r) || protectedInput(r)) { stay(); return }
      const s = saveBatchX(() => { r.oil = { ...oilDec }; stampChanged(r); return true })
      if (s.ok) { if (CURPAGE === 'inputs') revealInput(r); HOOKS.toast('OIL answer saved', 'ok'); close() }
      else if (s.refused) stay()
      else if (INPUTS.indexOf(r) < 0) close()
      return
    }
    const s = saveBatchX(() => {
      const ok = commitInputEdit(r, draft)
      if (ok && oilDec) r.oil = oilDec
      if (ok && removals.length)
        applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
      return ok
    })
    if (s.ok) { if(CURPAGE==='inputs')revealInput(r);HOOKS.toast('Input updated', 'ok'); close() }
    else if (s.refused) stay()
    else if (INPUTS.indexOf(r) < 0) close()
  }
  /* the clash sheet's Save — resolve the choices into kept segments, file
     the draft as the first and mint the rest, all one undo step */
  const doMedSave = (choices: string[], keepTail: any[]) => HOOKS.toastBatch(() => medSaveNow(choices, keepTail))
  const medSaveNow = (choices: string[], keepTail: any[]) => {
    if (undecided()) return
    const segs = medKeptSegments(medConf.a, medConf.b, medConf.clashes, choices)
    if (!segs.length) return          // toasted; the form stays open, unwritten
    if (medSegmentsProtected({ ...draft, yr: isNew ? baseYear() : r.yr }, segs, keepTail, medConf.b, isNew ? null : r)) return medicalLocked()
    const g0 = segs[0]
    const d2 = {
      ...draft,
      start: ordISO(g0.startOrd),
      end: g0.endOrd > g0.startOrd ? ordISO(g0.endOrd) : '',
      remarks: withRemarksTail(draft.remarks, ordISO(g0.startOrd), ordISO(g0.endOrd), 'till'),
    }
    let savedRow:any=isNew?null:r
    const s = saveBatchX(() => {
      const ok = isNew ? commitNewInput(d2, ctx === 'g', keepTail, medConf.b, row=>{savedRow=row}) : commitInputEdit(r, d2, keepTail, medConf.b)
      /* the commit's own trim only cuts rows the first segment overlaps —
         all of them chosen losers, since kept rows sit outside every
         segment; the later segments land as sibling rows, each trimmed the
         same way. keepTail carries the filer's per-leftover Remove/Keep so a
         tail is minted only where kept (owner, 28 Aug 26) */
      if (ok) mintMedSegments(savedRow, segs.slice(1), keepTail, medConf.b)
      return ok
    })
    if (s.ok) { if(r._calendar||CURPAGE==='inputs')revealInput(savedRow);HOOKS.toast(isNew ? 'Input added' : 'Input updated', 'ok'); close() }
    else if (s.refused) stay()
    else if (!isNew && INPUTS.indexOf(r) < 0) close()
  }
  /* `skipDoc` is reserved for the DocConfirm "No document" resume (owner,
     [SYNC-INTEG]); a plain click/Enter must pass FALSE, never React's event
     object — see the bindings below (SYNC-002). */
  const save = (skipDoc = false) => {
    if (undecided()) return
    /* A NEW INPUT WITH NO DATE PICKED IS REFUSED FIRST, in the List's own old sentence (D729 — V1: the List's "+ Input"
       opens this window with no date). Before every question: the OIL and the medical questions below would otherwise
       be asked about a day nobody chose (a blank date reads as the loaded week's Monday — engine fmt). */
    if (isNew && r._calendar && draft && !draft.start) { HOOKS.toast('Pick a start date on the calendar first', 'warn'); return }
    /* an input for ALL AVAIL / ALL that may not be saved is refused FIRST — before the picker's own line, the document
       question and every sheet ([INPUT-ALL-AVAIL]) */
    if (draft && placeholderRefused(several && picker ? { ...draft, person: ppl.find(p => isSpecial(p)) ?? draft.person, grp: ppl.some(p => isSpecial(p)) ? 1 : undefined } : draft)) return
    if (picker && draft) {
      /* nothing is substituted for what he picked: people he may not file this kind for refuse the save, in the
         picker's own sentence */
      const pb = pickProblem(ppl, several, draft.type)
      if (pb) { HOOKS.toast(pb.why, 'warn'); return }
    }
    if (grouped && draft) {
      /* ONE QUESTION FOR THE ENTRY (D660): the days and the hours are every man's alike, so the amounts are. A man
         added to an entry already answered is answered for by whoever adds him — the sheet comes back, with the
         standing answers ticked */
      /* NEVER INTO A MEDICAL ENTRY BY THIS BRANCH (Astra's read of the calendar job's bug check, 8 Oct 26 — R1, seen
         failing in `groupeditor.test.tsx`): this branch returns before the document ask, the upchit summary and the
         medical-clash question, and a shared meeting whose kind was changed to a medical one and whose people were cut
         to one was SAVED through it with none of them asked. A medical entry is one person's own: the others are taken
         out and saved first, and the kind is changed after — by the one-person save, which asks them all. */
      if (needsDoc(draft.type) || isUpchit(draft.type)) {
        HOOKS.toast('A medical entry is one person’s own. Take the other people out and save first — then change its kind.', 'warn')
        return
      }
      const first = rows.find(x => ppl.includes(String(x.person))) || null
      const adds = !!first && ppl.some(p => !rows.some(x => String(x.person) === p))
      /* ASKED OF EVERY MAN KEPT, NOT OF THE FIRST ALONE (Astra's read of the calendar job's bug check, 8 Oct 26 — seen
         failing in `groupeditor.test.tsx` before this): each man's record carries his OWN answer, and the first man's
         standing No said nothing about the others — their answers were voided by the new hours and nobody was asked,
         which is the bell D660 rules out. The question opens while ANY of them needs one. */
      const kept = rows.filter(x => ppl.includes(String(x.person)))
      const gates = (kept.length ? kept : [first]).map(x => oilGate({ ...draft, person: x ? x.person : ppl[0] }, x, adds))
      if (gates.some(x => x.kind === 'refused')) return
      const g = gates.find(x => x.kind === 'ask') || gates[0]!
      if (g.kind === 'refused') return
      if (g.kind === 'ask') { setOilConf(g); return }
      doSave([])
      return
    }
    /* THE DOCUMENT ASK runs FIRST (owner, [SYNC-INTEG]): saving a NEW medical
       with no certificate opens [Upload] / [No document] before anything else,
       so "No document" then flows on through the upchit-summary / downchit-clash
       / OIL pipeline exactly as an attached one would. */
    if (!skipDoc && draft && docGate(draft, isNew ? null : r) === 'ask') {
      setDocConf({
        who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
        typeLabel: draft.type,
      })
      return
    }
    /* an upchit is NEVER saved silently (owner, 27 Aug 26): the summary sheet
       runs first — what it ends, and an explicit Keep/Remove on every
       later-dated entry. A missing date skips straight to the commit, whose
       own refusal says so; the removals ride doSave's batch as one undo step
       (the nested batch's inner push is a no-op under the outer). */
    if (draft && isUpchit(draft.type) && draft.start) {
      /* run the shared refusals FIRST — a missing document or a junk upchit
         should toast at once, not after the summary was already shown */
      if (!normalizeInputDraft(draft, isNew ? null : r)) return
      setUpConf({
        who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
        dateLabel: fmt(draft.start),
        effects: upchitEffects(draft.person, isoOrd(draft.start), isNew ? null : r),
      })
      return
    }
    /* a DIFFERENT-type medical overlap is asked about, never resolved
       silently (owner, 27 Aug 26 — the clash sheet); same refusal-first
       order as the upchit path */
    if (draft && isDownchit(draft.type) && draft.start) {
      if (!normalizeInputDraft(draft, isNew ? null : r)) return
      /* the days the save will take — `isoOrd`, as `medAskFor` reads them (the record's old year is not theirs) */
      const a = isoOrd(draft.start)
      const b = isoOrd(draft.end || draft.start)
      const clashes = medClashes(draft.person, draft.type, a, b, isNew ? null : r)
      if (clashes.length) {
        setMedConf({
          who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
          newType: draft.type,
          span: fmt(draft.start) + (draft.end && draft.end !== draft.start ? ' – ' + fmt(draft.end) : ''),
          clashes, a, b,
        })
        return
      }
    }
    /* a duty-&-commitments input over a weekend/PH is never credited — or
       skipped — silently (owner, 28 Aug 26): the OIL ask runs before the
       write, and its decisions ride doSave's batch. Disjoint from the two
       medical branches by type, so at most one sheet ever gates a save. */
    const g = oilGate(draft, isNew ? null : r)
    if (g.kind === 'refused') return
    if (g.kind === 'ask') { setOilConf(g); return }
    doSave([])
  }
  /* a shared input is deleted for everyone only after it is asked (the day's own question — the plan §3.13) */
  const del = () => {
    if (rows.length > 1) { setDelAll(true); return }
    if (removeInput(r)) { HOOKS.toast('Input deleted', 'ok'); close() } else stay()
  }
  const delEntry = () => {
    const live = entryRowsOf(INPUTS, r)
    setDelAll(false)
    if (removeEntry(live)) { HOOKS.toast(`Input deleted for ${live.length} people`, 'ok'); close() } else stay()
  }
  /* a man's own OIL answer inside a shared input he did not file: his record alone, and never its late date */
  const saveOwnOil = (iid: string, dec: Record<string, number>) => {
    const row = INPUTS.find((x: any) => x.iid === iid)
    if (!row) return
    const s = saveBatchX(() => { row.oil = { ...dec }; stampChanged(row); return true })
    if (s.ok) HOOKS.toast('OIL answer saved', 'ok'); else if (s.refused) stay()
  }

  const who = rows.length > 1 ? `${csOf(rows[0].person)} +${rows.length - 1}`
    : r && PEOPLE[r.person] ? PEOPLE[r.person].cs : (r ? String(r.person) : '')
  /* READ ONLY for an input its reader may not change (the absence-record re-test, W1-F3, 26 Sep 26): a member reaching
     another man's input — the calendar's chip, the day popover's row — was shown Delete and Save, each refused only
     when pressed. The write path's own rule (perms.ts mayEditInput), asked before the form is drawn: he may still
     READ it (D211 — type, remarks, documents), with nothing offered that he cannot use. */
  const canAll = rows.length > 1 ? rows.every(x => mayEditInput(x)) : true
  const readOnly = !isNew && !!r && (rows.length > 1 ? !canAll : !mayEditInput(r))
  /* A MAN IN A SHARED INPUT WHO DID NOT FILE IT (D655, reading 2) reads it, and has exactly two things of his own: take
     himself out, and his own OIL answer. Anyone else only reads it. */
  const mineRow = rows.length > 1 && !canAll ? rows.find(x => isMe(x.person)) || null : null
  const filer = rows.length > 1 ? csOf(rows.find(x => x.grpBy)?.grpBy ?? rows.find(x => x.by)?.by ?? '') || 'whoever filed it' : ''
  const takeMeOut = () => {
    const mine = mineRow && INPUTS.find((x: any) => x.iid === mineRow.iid)
    setTakeOut(false)
    if (mine && removeInput(mine)) { HOOKS.toast('You are out of this input', 'ok'); close() } else stay()
  }
  /* THE DATES OF A SAVED SHARED INPUT ARE CHANGED HERE (owner D681, 9 Oct 26 — `[CAL-SHARED-DATES]`, found by Astra's
     read of the calendar job's bug check). "One shared input, shown and edited as one thing" (D655) — and no door
     changed its dates: the List's shared row opens this window (it has no edit in place: that would act on the first
     man's record alone), the window drew its date picker for a NEW input only, and a bar's drag keeps the length. So
     the window carries the same two-tap calendar for a saved entry of more than one man — on the Inputs page, and only
     for a reader who may change it for EVERYONE (`readOnly` is the write path's own rule): a man in it who did not file
     it keeps his two things and no more. Nothing new is written: the entry's ONE command (`commitGroup`) always took
     the dates from the draft, asks the OIL question of every man kept (D660, D682) and follows the remark's "till"
     word (`commitInputEdit`) — only the control was missing. The board's and the week's dialogs are as they were:
     there a moved span would take the row off the day it was opened from.
     AND AN ORDINARY ONE-PERSON INPUT'S TOO (owner D718, D723, 10 Oct 26 — `[INPUT-LIST-AS-DAY-CARD]`; the plan
     docs/superpowers/plans/2026-10-10-input-card-plan.md §3.1). D681's reading (7) left it "the ways it already has
     (its row in the List)" — and that row's pencil, the ONLY form that changed a saved one-person input's dates, went
     with D718 ("the edit and cross is not needed because … u can click on it to edit it"). So the window carries the
     same calendar for every saved input its reader may change. Again nothing new is written: the one-person save
     (`commitInputEdit`) always took the dates from the draft, and `save` asks every question the pencil's row asked —
     the document, the upchit's summary, the medical clash, OIL. NOT for one man's SANS commitment, which is on no
     list (D620) and keeps its own way: deleted and added again on the SANS calendar. */
  const datesHere = win && !isNew && !readOnly && ctx !== 'up' && !(rows.length < 2 && !!r && isSansAvail(r.type))
  /* who the window's Person list offers beyond the roster (below) */
  /* …AND FOR A NEW INPUT OF THE INPUTS PAGE, since the List's own add form went (D729 — V1, 10 Oct 26): that form was
     "where such leave is filed" — its Person list carried this group — and the window a new input opens in did not,
     so with the form gone no door could file an input for a man who has posted out. Found by the door inventory made
     before the form was removed (docs/superpowers/plans/2026-10-10-inputs-vet-plan.md §2). Not on the SANS calendar's
     "+ Commitment", nor on a pending upchit's own window: neither ever offered it. */
  const archivedHere = win && (!isNew || ctx === 'i') && canEditSched() && ctx !== 's' && !(draft && isSansAvail(draft.type)) ? archivedOptions() : []
  /* the first day whose OIL question nobody has answered, for the line that says so (below); '' where there is none */
  /* …asked of EVERY record of the entry, not of the one the window happens to be opened on (walker C's find, 10 Oct 26 —
     Astra's scenario 69: a shared duty whose first man had answered from his own bell read "no OIL … Change…", with no
     word that another man of it was still unanswered) */
  /* THE RECORDS THE OIL LINES SPEAK FOR (owner D731 (4)): on the Inputs page a shared input's window holds the ENTRY, and
     its line counts every man of it (`oilSummaryOf`); the schedule's and the board's dialog holds ONE man's row and
     saves one, so there the line is his alone, as it was. The line shows while ANY of them has an answer.
     ONE SCOPE FOR BOTH LINES (Astra's read of this batch, 10 Oct 26 — finding 2): "Not answered yet" was asked of every
     record of the entry wherever the editor stood, so the schedule's dialog on Ace's row named RANGER as unanswered —
     beside a button that answers for Ace alone. It is asked of the same records the line above it speaks for. */
  const oilRows = !isNew && r ? (picker && rows.length > 1 ? rows : [r]) : []
  const anyAnswered = oilRows.some(x => oilAnswered(x))
  const unanswered = oilRows.filter(x => oilUnansweredDay(x))
  const unansweredDay = unanswered.length ? oilUnansweredDay(unanswered[0]) : ''
  /* a NEW row's dates live on the DRAFT (the range picker moves them); an
     edit's stay on the row — and so does the TITLE's date, which says what is saved, while the line under the picker
     says what a Save would write */
  const when = !r ? '' : (isNew && draft && draft.start)
    ? fmt(draft.start) + (draft.end && draft.end !== draft.start ? ' → ' + fmt(draft.end) : '')
    /* the stored month-first labels said day-first, as the rest of the Inputs page speaks ([LW-ISO-DATES], 28 Sep 26 —
       the window's title read "Tally · Jul 24") */
    : fmtDay(unfmt(r.date, r.yr)) + (r.endDate ? ' → ' + fmtDay(unfmt(r.endDate, r.yr)) : '')
  const span = draft ? spanOf(draft.allday, draft.half) : 'all'
  /* the roster a context-bound add offers — SANS Availability is refused for
     anyone else at commit (sansRefusal), so the list should not offer them */
  const peopleFor = () => ctx === 's' ? rosterOptions().filter(id => PEOPLE[id].san) : rosterOptions()

  /* the form itself — the same fields, checks and buttons whichever chrome it stands in */
  const inner = (<>
        {draft && <div className="airpop-body inped-body" inert={readOnly || undefined}>
          {/* SCHEDULER ONLY (owner, 14 Aug 26 — "allow Unavailable to be
              editable too... even down to changing the puck"). A member
              opening their own input never reaches this dialog at all today
              (the buttons that open it only render in an admin's edit mode),
              but the gate is repeated here anyway rather than trusted to
              that — canEditSched() is the same check every other
              admin-only control in this dialog's callers already uses. */}
          {/* the upchit context comes FROM a pending card, so its person is a
              value, not a choice — the fixed-type idiom below, one row up */}
          {ctx === 'up'
            ? <div className="inped-f">
              <span className="inped-k">Person</span>
              <span className="inped-v" id="inpEditPersonFixed">{PEOPLE[draft.person] ? PEOPLE[draft.person].cs : draft.person}</span>
            </div>
            : picker
            /* ON THE INPUTS PAGE: the people picker — one person from the list, or several as pucks (D656) */
            ? <PeoplePick people={ppl} several={several} type={draft.type} sansOnly={ctx === 's' || isSansAvail(draft.type)}
              lockOne={!isNew && !canEditSched()} readOnly={readOnly}
              /* THE POSTED-OUT / ARCHIVED PEOPLE, for an admin changing a SAVED input ([INPUT-LIST-AS-DAY-CARD], 10 Oct 26 —
                 Astra's scenario 57). The List's pencil offered them in its own Person list (clearing leave is filed
                 for a man who has posted out — [ARCH-STACK] step 4, H5) and the pencil is gone (D718): without this
                 no form could move a saved input to an archived man. A NEW input's window offers them too since the
                 List's Add form — where such leave was filed — went (D729; `archivedHere`, above). */
              more={archivedHere.length ? <optgroup label="Posted out / archived">{archivedHere.map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}</optgroup> : undefined}
              moreIds={archivedHere.length ? archivedHere : undefined}
              onChange={(p, s) => { setPpl(p); setSeveral(s); if (p.length === 1 && draft.person !== p[0]) setDraft({ ...draft, person: p[0] }) }} />
            : canEditSched() && <label className="inped-f">
              <span className="inped-k">Person</span>
              <select id="inpEditPerson" aria-label="Person" value={draft.person}
                onChange={e => setDraft({ ...draft, person: e.target.value })}>
                <PlaceholderGroup type={draft.type} current={draft.person} />
                {peopleFor().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
              </select>
            </label>}
          {/* the SANS panel's add is not a choice of type at all, so a dropdown
              with one entry would only pretend it was — the type reads as a
              plain value there (owner, 19 Aug 26) */}
          {ctx === 's' || ctx === 'up'
            ? <div className="inped-f">
              <span className="inped-k">Type</span>
              <span className="inped-v" id="inpEditTypeFixed">{draft.type}</span>
            </div>
            /* ON THE INPUTS PAGE THE "?" STANDS BESIDE "TYPE" (owner D729 — V1, 10 Oct 26; ui/TypeLegend.tsx): what each
               kind means lived only in the List's own add form, which went. It is outside the field's <label>, so a
               press on the card is never a press on the list of kinds. NOT where the form cannot be used: the form
               of an input its reader may not change is inert, and a "?" inside it would be a button that is seen and
               does nothing (Astra's scenario design, 10 Oct 26) — a reader chooses no kind, and the card is one press
               away under "+ Input". */
            : <div className="inped-f">
              {win && !readOnly
                ? <span className="inped-kh"><label className="inped-k" htmlFor="inpEditType">Type</label><TypeLegend shut={!!(docConf || upConf || medConf || oilConf)} front={legendFront} /></span>
                : <label className="inped-k" htmlFor="inpEditType">Type</label>}
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
                    /* a typed title stays with a kind that takes one; a leave or a medical kind takes none, and a
                       title left behind would come back if the kind were changed again ([INPUT-OWN-TITLE]) */
                    ...(titledKind(t) ? {} : { title: null }),
                    /* re-seed the All day default on a brand-new add only, so the
                       board add agrees with the Inputs form (defaultAllday): a
                       personal commitment opens timed, leave/medical/SANS all-day.
                       An EDIT keeps whatever the saved record already carries. */
                    ...(isNew ? { allday: defaultAllday(t) } : {}),
                  })
                }}>{typeOptions(typeFilter)}</select>
            </div>}
          {/* THE INPUT'S OWN TITLE (owner D715, 9 Oct 26 — "select the type of input and it gives the user the option to
              change the name of the input … if event Is selected, event shows as the title which can be edited"; D716:
              the "Duty & other commitments" kinds only). The box SHOWS the kind's own name until something else is
              typed, so choosing a kind fills it in and changing the kind changes it — and a box nobody touched saves
              nothing (titleOf). The KIND above goes on deciding every rule; this is the name people read. */}
          {/* ENTER IS USED UP BY THE SAVE (`[TITLE-CHECK-SEEN]` 5, 10 Oct 26 — here and in Remarks, below). The save closes
              the window and the keyboard goes back to the button that opened it ("+ Input"); the SAME key press, still
              in flight, then pressed that button, and a blank "New input" opened again. `preventDefault` on the key
              down is what stops the browser handing the press on (seen in a real browser: e2e/inputs-batch2.spec.ts). */}
          {titledKind(draft.type) && ctx !== 's' && ctx !== 'up' && <label className="inped-f">
            <span className="inped-k">Title</span>
            {/* its id is NOT `inpEditTitle`: that is the dialog's own heading where this editor opens from the schedule or
                the board, and the two shared one id there (the check's walk, walker C — W3) */}
            <input id="inpEditOwnTitle" aria-label="Title" maxLength={TITLE_MAX} autoComplete="off"
              value={draft.title == null ? inpType(draft.type) : draft.title} placeholder={inpType(draft.type)}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              onFocus={e => { if (draft.title == null) e.target.select() }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(false) } }} />
          </label>}
          {/* the Unavailable add takes a RANGE (owner, 19 Aug 26 — "I can
              select a date range as well"): the same two-click calendar the
              Inputs page uses, owning the remarks' till-date token the same
              way (withRemarksTail — a one-day pick reads "till <that day>",
              and what the typist wrote around the token survives re-picks) */}
          {/* an upchit is ONE date (the write path refuses a range), picked
              plainly — defaulting to today, editable for a certificate
              signed a day or two back (owner, 27 Aug 26) */}
          {ctx === 'up' && <label className="inped-f">
            <span className="inped-k">Date</span>
            <input type="date" id="inpEditUpDate" aria-label="Upchit date" value={draft.start}
              onChange={e => setDraft({ ...draft, start: e.target.value, end: '' })} />
          </label>}
          {/* ...and a SAVED shared input's (D681 — `datesHere`, above). A saved input's dates are a finished range, so
              the first tap is always the NEW START and the next the new end — "a tap for the start, a tap for the end";
              a one-day input is handed to the calendar as a range of one day until that first tap, or its first tap
              would stretch it instead (`midPick`). Its remark is not rewritten here: the save follows the "till" word
              itself, and a remark the picker had touched would read as his own change to the window. */}
          {(ctx === 'u' || (isNew && r._calendar) || datesHere) && <div className="inped-f">
            <span className="inped-k">Dates</span>
            <div className="inped-dates">
              <RangeCal key={'cal-' + calKey} idPrefix="inpEd" start={draft.start}
                end={datesHere && !midPick ? (draft.end || draft.start) : draft.end}
                onPick={(s2, e2) => {
                  if (datesHere) { setMidPick(!e2); setDatesPicked(true); setDraft({ ...draft, start: s2, end: e2 }); return }
                  setDraft({ ...draft, start: s2, end: e2, remarks: withRemarksTail(draft.remarks, s2, e2, 'till') })
                }} />
              <div className="rc-read">{draft.start ? (fmt(draft.start) + (draft.end && draft.end !== draft.start ? ' → ' + fmt(draft.end) : '')) : 'pick a start date'}</div>
            </div>
          </div>}
          {/* the F/O/A ticks sit ABOVE the standard timing controls now, not
              in place of them (owner rework, 14 Aug 26) — SANS Availability
              is a normal timed input with one extra field, and its single
              window is the SAME 'When' block below every other half-day
              type already uses (hasHalf('SANS Availability') is true). */}
          {isSansAvail(draft.type) && <div className="inped-f">
            <span className="inped-k">Availability</span>
            <SansPicker id="inpEditSans" sans={draft.sans} onChange={sans => setDraft({ ...draft, sans })} />
          </div>}
          {/* an upchit has no hours — the date above is the whole record, so
              the When row would only offer controls that mean nothing */}
          {!isUpchit(draft.type) && <div className="inped-f">
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
          </div>}
          {/* the mandatory supporting document (owner, 27 Aug 26) — drawn for
              exactly the types whose commit demands one (needsDoc is the one
              body for both), so the button never appears where the file is
              not wanted and never hides where it is */}
          {needsDoc(draft.type) && <div className="inped-f">
            <span className="inped-k">Document</span>
            <DocField ids={draft.docIds} onIds={ids => setDraft({ ...draft, docIds: ids })} />
          </div>}
          <label className="inped-f">
            <span className="inped-k">Remarks</span>
            <input id="inpEditRmk" aria-label="Remarks" maxLength={200} value={draft.remarks} autoComplete="off"
              onChange={e => setDraft({ ...draft, remarks: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(false) } }} />
          </label>
          {/* REVISE A RECORDED OIL ANSWER (owner, 29 Aug 26 — a mistaken "No
              OIL" used to be revisable only by nudging the input's times).
              Drawn off the SAVED row (oilAnswered — no per-render normalize),
              priced off the CURRENT draft (oilGate force — a half-edited time
              asks what the save would credit); the sheet's Save runs the same
              doSave as the gate, one batch, one undo step. */}
          {/* NO "CHANGE…" FOR A READER (`[CAL-CHECK-SEEN]`, the editor — 10 Oct 26): his form is inert, so the button was
              one that is seen and cannot be pressed — as the "?" beside Type was until D729. The line still says what
              stands. A man in a shared input he did not file has his OWN line, and its own live button, below. */}
          {anyAnswered && <div className="inped-f">
            <span className="inped-k">OIL</span>
            <div className="inped-oil">
              <span className="inped-oilsum">{oilSummaryOf(oilRows)}</span>
              {!readOnly && <button type="button" className="abtn ghost" data-testid="oil-revise"
                onClick={() => { const g = oilGate(draft, r, true); if (g.kind === 'ask') setOilConf(g) }}>Change…</button>}
            </div>
          </div>}
          {/* …AND THE QUESTION NOBODY HAS ANSWERED YET (the plan docs/superpowers/plans/2026-10-10-input-card-plan.md
              §3.2; `oilUnansweredDay` — Fable F6, 22 Sep 26). The List's "OIL?" chip was the one sign, outside the bell
              of the man himself, that a weekend request's question was asked and put away unanswered; the phone's
              list is cards now and a card has no chips (D723), so the window says it — and answers it, by the same
              forced question the chip opened. Only for a reader who may change the input. Said while ANY record of the
              entry has a day nobody answered — a shared input names who — and beside an answered line too (one day
              answered, another not): then that line's "Change…" is the one button, since both open the same question. */}
          {!isNew && r && unansweredDay && <div className="inped-f" data-testid="oil-unanswered">
            <span className="inped-k">OIL</span>
            <div className="inped-oil">
              <span className="inped-oilsum">Not answered yet — {oilDayLabel(unansweredDay)}{oilRows.length > 1 ? ': ' + unanswered.map(x => csOf(x.person)).join(', ') : ''}</span>
              {!readOnly && !anyAnswered && <button type="button" className="abtn ghost" data-testid="oil-answer"
                onClick={() => { const g = oilGate(draft, r, true); if (g.kind === 'ask') setOilConf(g) }}>Answer…</button>}
            </div>
          </div>}
          {/* who placed this input and when, and its last change — the editor's small print (owner D629; the one line
              is ui/placedline.ts). Not on a new input, which nobody has placed yet. */}
          {!isNew && r && (rows.length > 1 ? placedLineOf(rows) : placedLine(r)) && <div className="inped-placed" data-testid="inped-placed">{rows.length > 1 ? placedLineOf(rows) : placedLine(r)}</div>}
          {/* a shared input its reader may NOT change for everyone says nothing here about dates: the line beside the
              buttons already says who can change it, and "changed on the Inputs page" sent him to the page he is on */}
          {/* …and since the window carries the dates of EVERY saved input (D718), no reader of another person's input is
              sent "to the Inputs page" for them either: he is on it, and they are not his to change */}
          {/* THE PARAGRAPH OF INSTRUCTIONS IS GONE FROM THE INPUTS PAGE'S WINDOW (owner D729 — the design vet's V3,
              10 Oct 26; D726: "I don't like too wordy interface"). A new input said "Choose the dates and the hours.
              Save adds one input covering the whole date range." and a saved one "To change its dates, tap the new
              start on the calendar above, then the new end …" — the line under the calendar already shows what a Save
              will write. ONE short line stays, on a saved SHARED input: its dates change for every man in it, which
              nothing else in the window says. `hint` is '' where there is nothing to say, and then no line is drawn.
              NOT TOUCHED (D729 reading 2 — only what the page showed): the SANS calendar's own lines, and every line
              of the dialogs the schedule and the board open. */}
          {(hint => hint && <div className="inped-hint">{hint}</div>)(win && !isNew && readOnly ? '' : isNew
            ? r._calendar
              /* "your available hours" is the SANS calendar's wording — on the Inputs calendar the same window files
                 a meeting or a leave (Opus's own read of the build, step 0, 7 Oct 26) */
              ? isSansAvail(draft.type)
                ? 'Choose the dates and your available hours. Save adds one input covering the whole date range.'
                : ''
              : ctx === 'up'
              ? 'Pick the day he is fit for full duty and attach the upchit document — the medical entry ends the day before, and a summary asks before anything is changed.'
              : ctx === 'u'
              ? 'Pick the dates on the calendar — the remarks carry the till date automatically, and a leave syncs to the Inputs page and Leave War.'
              : ctx === 'g'
                ? `Added on ${when}, straight onto the Ground Programme. For a multi-day span, use the Inputs page.`
                : `Added on ${when}. For a multi-day span, use the Inputs page.`
            /* a SANS commitment is on no list of the Inputs tab (D620), so "the Inputs page" is no place to change its
               dates — and this editor changes none: it is deleted and added again (the calendar job's bug check, 8 Oct 26) */
            : datesHere
              ? rows.length > 1 ? `Date changes apply to all ${rows.length}.` : ''
            : isSansAvail(draft.type)
              ? 'To change its dates, delete it and add it again on the SANS calendar.'
            : canEditSched()
              ? 'The dates are changed on the Inputs page.'
              : 'The person and the dates are changed on the Inputs page.')}
        </div>}
        {/* HIS OWN TWO THINGS in a shared input he did not file — outside the read-only form, so they are live */}
        {mineRow && draft && (
          <div className="inped-own">
            {oilAnswered(mineRow) && <div className="inped-oil">
              <span className="inped-oilsum">Your OIL: {oilSummary(mineRow)}</span>
              <button type="button" className="abtn ghost" data-testid="oil-revise-own"
                onClick={() => { const g = oilGate(draftOf(mineRow), mineRow, true); if (g.kind === 'ask') setOilConf({ ...g, own: mineRow.iid }) }}>Change…</button>
            </div>}
            {/* …and where HIS question was never answered (Sol's read of the input card's check, 10 Oct 26): he could
                revise an answer here but not give one — the bell was his only way, and a phone's card has no chip. The
                same question, for his record alone (`own`); where he has answered one day and not another, "Change…"
                above is the one button. */}
            {oilUnansweredDay(mineRow) && <div className="inped-oil" data-testid="oil-unanswered-own">
              <span className="inped-oilsum">Your OIL: not answered yet — {oilDayLabel(oilUnansweredDay(mineRow))}</span>
              {!oilAnswered(mineRow) && <button type="button" className="abtn ghost" data-testid="oil-answer-own"
                onClick={() => { const g = oilGate(draftOf(mineRow), mineRow, true); if (g.kind === 'ask') setOilConf({ ...g, own: mineRow.iid }) }}>Answer…</button>}
            </div>}
            {takeOut && (
              <div className="inped-ask" data-testid="inped-takeout-ask" role="alertdialog" aria-label="Take yourself out?">
                <span className="inped-ask-q">Take yourself out of this input? It stays for the other {rows.length - 1 === 1 ? 'person' : `${rows.length - 1} people`}.</span>
                <button type="button" className="abtn danger" data-testid="inped-takeout-yes" autoFocus onClick={takeMeOut}>Take me out</button>
                <button type="button" className="abtn ghost" data-testid="inped-takeout-no" onClick={() => setTakeOut(false)}>Stay in</button>
              </div>
            )}
          </div>
        )}
        {delAll && (
          <div className="inped-ask" data-testid="inped-delall" role="alertdialog" aria-label="Delete for everyone?">
            <span className="inped-ask-q">Delete this input for all {rows.length} people?</span>
            <button type="button" className="abtn danger" data-testid="inped-delall-yes" autoFocus onClick={delEntry}>Delete</button>
            <button type="button" className="abtn ghost" data-testid="inped-delall-no" onClick={() => setDelAll(false)}>Keep</button>
          </div>
        )}
        <div className="airpop-foot">
          {/* nothing to delete on a row that does not exist yet (the board's
              + Add) — the button is simply absent in that mode */}
          {!isNew && !readOnly && <button className="abtn danger" id="inpEditDel" onClick={del}>Delete</button>}
          {mineRow && !takeOut && <button className="abtn" data-testid="inped-takeout" onClick={() => setTakeOut(true)}>Take me out</button>}
          {/* ITS DOCUMENT, OPENED FROM HERE ([INPUT-LIST-AS-DAY-CARD], 10 Oct 26 — Astra's scenario 60). The paperclip of the
              List's row is how a medical input's paperwork is read — by EVERY account (owner, 27 Aug 26) — and a phone's
              card carries no paperclip (D723): the form above names a document and cannot open it, and for a reader who
              may not change the input the form is inert besides. So the paperclip stands here, beside the buttons and
              outside the form, for any saved input that has a document; it opens the same viewer. */}
          {!isNew && r && rowDocIds(r).some(id => !!docGet(id)) && <button type="button" className="abtn inped-doc" data-testid="inped-docview"
            aria-label="View the document" title="View the document" onClick={() => { setDocView({ row: r }); notify() }}><ClipIcon /></button>}
          {readOnly && <span className="inped-ro" data-testid="inped-ro">{rows.length > 1
            /* to the FILER, kept out by the members' switch alone: that the switch is off (D731 (8) — `sharedRefusal`,
               above, says the same at the other doors). "Take me out" beside it is whatever the rules already give. */
            ? filerSwitchedOff(rows) ? FILING_OFF
            : mineRow ? `Only ${filer} — who filed it — or an admin can change this for everyone.` : `Only its people, ${filer} — who filed it — or an admin can change this.`
            /* an input filed for ALL AVAIL / ALL has no owner to name — "Only ALL AVAIL or an admin can change this"
               named a puck that is nobody (walker A of its check, 9 Oct 26): the one who may is whoever FILED it */
            /* …and to that filer himself, kept out by the members' switch alone, that the switch is off (D731 (8)) */
            : r && isSpecial(r.person) ? sharedRefusal([r], 'change this.')
            : `Only ${who || 'its owner'} or an admin can change this.`}</span>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" id="inpEditCancel" onClick={close}>{readOnly ? 'Close' : 'Cancel'}</button>
          {!readOnly && <button className="abtn primary" id="inpEditSave" onClick={() => save(false)}>{isNew ? 'Add' : 'Save'}</button>}
        </div>
  </>)
  /* the questions that must be answered before going on stay BLOCKING, over the form (the plan §3.7: "It does not
     carry: a question that must be answered before going on") */
  const sheets = (<>
      {/* the upchit save-time summary rides OVER this dialog (its z sits one
          layer up) — Save commits with the ticked removals, Cancel returns
          to the still-open form with nothing written */}
      {upConf && <UpchitConfirm who={upConf.who} dateLabel={upConf.dateLabel} effects={upConf.effects}
        onCancel={() => setUpConf(null)}
        onSave={removals => { setUpConf(null); doSave(removals) }} />}
      {/* the medical clash sheet, same layer and same contract — Save
          resolves the choices, Cancel returns to the untouched form */}
      {medConf && <MedClashConfirm who={medConf.who} newType={medConf.newType} span={medConf.span}
        clashes={medConf.clashes} aOrd={medConf.a} bOrd={medConf.b}
        onCancel={() => setMedConf(null)}
        onSave={(choices, keepTail) => { setMedConf(null); doMedSave(choices, keepTail) }} />}
      {/* the OIL ask, same layer and same contract — Save commits the input
          with the day decisions in one batch, Cancel returns to the form */}
      {/* HEADED FOR WHOEVER THE ANSWER IS WRITTEN FOR (`[CAL-CHECK-SEEN]`, the editor — 10 Oct 26). A shared input's
          question is asked once and its answer goes on every man's record (D660, D682): the save's own door headed it
          "Saber +2", while "Change…", "Answer…", the bell and the question that follows a bar's drag headed it with
          the one man whose record the window happened to hold. ONE place decides it now, for every door: the group —
          its first name and how many more, the words of the window's own title — unless the question is a man's own
          (`own`: his record alone, inside an input he did not file). */}
      {/* …and the first name is the entry's first A TO Z, whatever order its people were picked in — the name the saved
          input's title leads with (the walk's find, 10 Oct 26: a NEW group asked as "Ranger +2", the man picked
          first, and was "Ace +2" from the moment it was saved). */}
      {oilConf && <OilConfirm who={!oilConf.own && grouped && ppl.length > 1 ? `${ppl.map(csOf).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))[0]} +${ppl.length - 1}` : oilConf.who} typeLabel={oilConf.typeLabel}
        plan={oilConf.plan} prev={oilConf.prev}
        onCancel={() => setOilConf(null)}
        onSave={dec => { const own = oilConf.own; setOilConf(null); if (own) saveOwnOil(own, dec); else doSave([], dec) }} />}
      {/* the medical-document ask (owner, [SYNC-INTEG]): "No document" resumes
          the SAME save through the rest of the pipeline (skipDoc); "Upload"
          dismisses so the filer can attach a certificate and save again */}
      {docConf && <DocConfirm who={docConf.who} typeLabel={docConf.typeLabel}
        onUpload={() => setDocConf(null)}
        onNoDoc={() => { setDocConf(null); save(true) }} />}
  </>)
  if (win) return (<>
    <FloatWin id="inputedit" title={(isNew ? 'New input' : who) + (when ? ' · ' + when : '')} testid="win-inputedit" className="inpedwin" onClose={close}>
      <div id="inpEditPop" className="inpedbox inped-win" ref={box}>
        {/* ONE EDITOR AT A TIME: another input was asked for while this one holds unsaved changes */}
        {swap && (
          <div className="inped-ask" data-testid="inped-swap" role="alertdialog" aria-label="Unsaved changes">
            <span className="inped-ask-q">This input has unsaved changes. Open {swap._new ? 'a new input' : `${PEOPLE[swap.person] ? PEOPLE[swap.person].cs : 'the other'}’s input`} and lose them?</span>
            <button type="button" className="abtn danger" data-testid="inped-swap-go"
              onClick={() => { const to = swap._new ? swap : (INPUTS.find((x: any) => x.iid === swap.iid) || null); swapOk.current = true; setSwap(null); setInpEdit(to); notify() }}>Discard and open</button>
            <button type="button" className="abtn ghost" data-testid="inped-swap-stay" onClick={() => setSwap(null)}>Keep editing</button>
          </div>
        )}
        {/* A FIELD CHANGED BOTH WAYS — his, in the window, and someone's on the page behind it: listed, each with its
            two values and a choice. Nothing of his is thrown away, and nothing is saved over theirs unasked. */}
        {clash.length > 0 && draft && (
          <div className="inped-ask" data-testid="inped-clash" role="alert">
            <b className="inped-ask-h">Changed while this window was open</b>
            {clash.map(k => {
              const f = WIN_FIELDS.find(x => x.k === k)!
              return (
                <div key={k} className="inped-clash-row">
                  <span className="inped-ask-q">{f.label} — theirs {fieldSay(k, base.current)}, yours {fieldSay(k, draft)}</span>
                  <button type="button" className="abtn" data-testid={'inped-clash-mine-' + k} onClick={() => setClash(c => c.filter(x => x !== k))}>Keep mine</button>
                  <button type="button" className="abtn" data-testid={'inped-clash-theirs-' + k}
                    onClick={() => {
                      setDraft({ ...draft, ...fieldPart(f, base.current) }); setClash(c => c.filter(x => x !== k)); delete madeOver.current[k]
                      /* dates taken back from the record are a FINISHED range again: the next tap is a new start, not
                         the end of a pick he has just given up (Astra's read of the date door, 9 Oct 26 - A4) */
                      if (k === 'start' || k === 'end') { setMidPick(false); if (!clash.some(x => x !== k && (x === 'start' || x === 'end'))) setDatesPicked(false) }
                    }}>Take theirs</button>
                </div>
              )
            })}
          </div>
        )}
        {inner}
      </div>
    </FloatWin>
    {sheets}
  </>)
  return (
    <div className="airpop" id="inpEditPop" hidden={!open}
      onClick={e => { if (clickedOutside(e, 'inpEditPop')) close() }}>
      <div className="airpop-box inpedbox" ref={box}>
        <div className="airpop-head">
          <b id="inpEditTitle">{isNew ? 'New input' : who}{when ? ' · ' + when : ''}</b>
          <button className="x" id="inpEditClose" aria-label="Close" onClick={close}>✕</button>
        </div>
        {inner}
      </div>
      {sheets}
    </div>
  )
}
