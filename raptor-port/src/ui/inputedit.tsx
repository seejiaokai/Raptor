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
import { isOD, INPUTS, INPUT_TYPES, TYPE_GROUPS, TYPE_FAMILY_LABEL, titleOf, DATES, inpId, inpMeta, inpType, typeGroup, isoLabel, inputCoversDate, isPersonal, isUnavail, isSansAvail, isUpchit, isDownchit, isLeave, needsDoc, defaultAllday, dateOrd, dateIx, baseYear, remarksTyped, oilAsks, oilNeverEarns, oilSilent, nowStamp, placeholderProblem, idsOf, leadOf, namedOf, holds, isPlaceholderInput, shapeProblem, inputStampISO, inpLabel, filingOf, landsUnavail, isOther, isFly, toOf, placeOf } from '../engine/inputs'
import { upchitTrimPlan, upchitEffects, upchitDeletePlan, newMedTrimPlan, medClashes, subtractSpans, medStartOrd, medEndOrd, ordLabel, firstEndIso, firstEndOrd } from '../engine/medical'
import { OilConfirm } from './OilConfirm'
import { DocConfirm } from './DocConfirm'
import { docFields, rowDocIds } from '../state/docs'
import { acceptInput } from '../engine/slots'
import { iuParts } from '../engine/keys'
import { ownInputOf, toPeople, putPerson, takePerson, swapPerson, pieceOf } from '../engine/inputown'
import { DAYS } from '../engine/data'
import { PEOPLE, isSpecial } from '../engine/people'
import { hhmm, parseHM, hmOK } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { LOCKED_WEEK_NOTE } from '../engine/publish'
import { logAction, elogSweep, todayIso } from '../engine/editlog'
import { elogReason } from '../state/changelines'
import { stampPlaced, stampChanged } from '../state/inputstamp'
import { writeInputsBatch, tryInputsBatch, notify, protectedDates, inputProtected } from '../state/store'
import { hearGateCuts } from '../state/inputgate-hook'
import { oilAskPlan } from '../leavewar/sync'
import { leaveKey } from '../leavewar/absences'
import { voidedOil, repricedOil } from '../engine/oil'
import { CmdRefused } from '../command'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { CURWEEK } from '../engine/waves'
import { keyToIso, mondayOf } from './weeknav'
import { canEditSched } from '../state/auth'
import { me, isMe, mayEditInput, mayDeleteInput, mayFileInputFor, membersFileOn, memberFilesForOthers, filerSwitchedOff, filedWhole, byAfterLeaving, mayMovePlace } from '../state/perms'
import { INPEDIT, setInpEdit, setOilAsk, setMedMove } from './pops'
import { OILWAIT, type OilWaitKind } from '../state/view'
import { holdForOil } from './oilwait'
import { RangeCal } from './RangeCal'
/* The Leave War seam (sync.ts is the one crossing point, CLAUDE.md §The Leave
   War tab): retracting a synced row's war cells when it is edited or deleted
   here — not a new seam, a Raptor-side caller of the existing one. */

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
  /* (printed, so the year is two digits — owner D1096; fmt above KEEPS four, being a stored label) */
  return +y === baseYear() ? lbl : lbl + ' ' + y.slice(-2)
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

export const SPANS: Array<[Span, string, string]> = [
  ['all', 'All day', 'The whole day'],
  ['am', 'AM', 'Morning — 00:00 to 12:00'],
  ['pm', 'PM', 'Afternoon and evening — 12:01 onwards'],
  ['custom', 'Custom', 'Type your own start and end time'],
]

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
export const SANS_ROWS: Array<[string, string]> = [['f', 'Fly'], ['a', 'AMT'], ['o', 'OFT']]
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
    if (x === except || !holds(x, person) || !isSansAvail(x.type)) return false
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
    if (x === except || !holds(x, person) || !isDownchit(x.type) || inpType(x.type) !== t) return false
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
    if (!isDownchit(r.type) || !holds(r, person)) continue
    const a = dateOrd(r.date, r.yr), b = dateOrd(r.endDate || r.date, r.yr)
    if (a == null || b == null || a > x) continue
    if (b >= x) { running = true; break }
    if (latestEnd == null || b > latestEnd) latestEnd = b
  }
  if (!running && latestEnd == null) return 'There is no medical-down entry to upchit — file the medical input first'
  if (!running) {
    const answered = INPUTS.some((r: any) => {
      if (r === except || !holds(r, person) || !isUpchit(r.type)) return false
      const o = dateOrd(r.date, r.yr)
      return o != null && o >= latestEnd
    })
    if (answered) return 'That medical-down period is already closed — edit the existing upchit instead'
  }
  const dup = INPUTS.some((r: any) => r !== except && holds(r, person) && isUpchit(r.type) && dateOrd(r.date, r.yr) === x)
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
    if (!holds(r, person) || !isUpchit(r.type)) return false
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
   Raptor-owned cells. A piece keeps only the typist's own words: its "till …"
   is printed from its own dates (owner D948 — engine/inputs.ts remarksShown), so
   "ATT C till 13 Jul" follows the new end. inpKey is person|date|type|s — an
   end-trim moves none of them, so no accepted-row relink is needed. */
export function applyMedPlan(plan: any[]) {
  if (medPlanProtected(plan)) { medicalLocked(); return false }
  const cs = (r: any) => { const p = leadOf(r); return PEOPLE[p] ? PEOPLE[p].cs : p }
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
      const t: any = { ...pieceOf(r), date: ordLabel(p.tail.startOrd, r.yr), mod: nowStamp() }
      delete t.iid          // its own address, minted below — never a copy
      delete t.lw           // a plain Raptor row; the war re-lands it inbound
      delete t.firstEnd     // D999: a piece is not the row an upchit cut
      delete t.acc
      if (p.tail.endOrd > p.tail.startOrd) t.endDate = ordLabel(p.tail.endOrd, r.yr)
      else delete t.endDate
      t.remarks = remarksTyped(r.remarks, r)      // its date is printed from its own dates (D948) — never written in
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
    /* D999: an upchit moved later gives the downchit it had cut its days back — up to the day before the new date, never
       past the end it was first filed with (upchitTrimPlan works out how far); back at that first end, the note of it goes */
    if (p.action === 'grow' && p.newEndOrd != null) {
      r.endDate = ordLabel(p.newEndOrd, r.yr)
      if (firstEndOrd(r) === p.newEndOrd) delete r.firstEnd
      r.remarks = remarksTyped(r.remarks, r)
      r.mod = nowStamp()
      stampChanged(r)
      elogReason(r.iid, p.why || 'given back by a moved upchit')
      continue
    }
    if (p.action !== 'trim' || p.newEndOrd == null) continue
    /* D999: the end it was filed with, kept the FIRST time an upchit cuts it — what a later move of the upchit may give
       back, and never more */
    if (p.up) { if (r.firstEnd == null) { const fe = medEndOrd(r); if (fe != null) r.firstEnd = firstEndIso(fe) } }
    /* a cut by ANOTHER medical starts its own story: what was kept no longer says how far an upchit may give back
       (the fresh read of D999, 1) */
    else delete r.firstEnd
    /* [ARCH-STACK] step 4: the Leave War READS this row — trimming it trims the
       war with nothing to retract. */
    const a = dateOrd(r.date, r.yr)
    if (a != null && p.newEndOrd <= a) delete r.endDate
    else r.endDate = ordLabel(p.newEndOrd, r.yr)
    r.remarks = remarksTyped(r.remarks, r)        // its date is printed from its own dates (D948)
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
  for (const g of segs) {
    const t: any = { ...pieceOf(base), date: ordLabel(g.startOrd, base.yr), mod: nowStamp() }
    delete t.iid          // its own address, minted below — never a copy
    delete t.lw           // a plain Raptor row; the war re-lands it inbound
    delete t.acc
    if (g.endOrd > g.startOrd) t.endDate = ordLabel(g.endOrd, base.yr)
    else delete t.endDate
    t.remarks = remarksTyped(base.remarks, base)     // its date is printed from its own dates (D948)
    inpId(t)
    /* a sibling of `base`: who placed it is base's (a new filing's own filer, or the edited record's — D629) */
    stampChanged(t)
    INPUTS.push(t)
    elogReason(t.iid, 'a kept piece of a split medical entry')
    applyMedPlan(newMedTrimPlan(leadOf(t), t.type, g.startOrd, g.endOrd, t, keepTail, entryEnd))
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
/* `families` (owner D1179, M3 7.4): the Inputs page's FILTER heads each group with a choice for the whole family —
   "All leave", "All medical", "All duty & commitments" (engine/inputs.ts typeMatches); an input's own kind list never */
export const typeOptions = (allow?: (t: string) => boolean, families = false) => TYPE_GROUPS.map((g: any) => {
  const ts = INPUT_TYPES.filter((t: string) => typeGroup(t) === g.k && (!allow || allow(t)))
  return ts.length ? <optgroup key={g.k} label={g.t}>{families && <option value={`grp:${g.k}`}>{TYPE_FAMILY_LABEL[g.k]}</option>}{ts.map((t: string) => <option key={t}>{t}</option>)}</optgroup> : null
})

/* The draft is held apart from the model so Cancel is a real cancel. */
/** WHERE AN INPUT STANDS, as an Other's "Goes to" reads it: 'u' under Unavailable, 'r' rejected by a scheduler (the
 *  scenario designer's G5), else 'g' — the programme. One reading for the window, the save and its "anything changed?" */
export const goesOf = (r: any): 'g' | 'u' | 'r' => (r && r.acc === 'u' ? 'u' : r && r.acc === 'r' ? 'r' : 'g')
/** A SCHEDULER'S MOVE IS MARKED ON THE INPUT (his D1388, 26 Oct 26 — [LW-OTHER-GOES-TO-LOCK]): from then on only a
 *  scheduler changes where it stands (state/perms.ts mayMovePlace). Written by each of his doors, inside the command that
 *  makes the move, so one Undo takes both back — Reject, → Ground, → Unavail (ui/interactions.ts), its Ground Programme
 *  row removed (ui/board.ts), his window's Goes to or a retype that moves it (commitInputEdit). Never on his own
 *  one-person input, which is nobody's to keep from him. Filing is not a move: one he files for a member under
 *  Unavailable is the member's to pick again, as whoever files an Other picks (D1356). */
export function markMoved(r: any) {
  if (r && canEditSched() && !(idsOf(r).length <= 1 && isMe(leadOf(r)))) r.schedPlaced = true
}
export const draftOf = (r: any) => ({
  person: leadOf(r), type: r.type, allday: !!r.allday, half: r.half || '',
  start: unfmt(r.date, r.yr), end: r.endDate ? unfmt(r.endDate, r.yr) : '',
  sTime: r.allday ? '06:00' : hhmm(r.s), eTime: r.allday ? '18:00' : hhmm(r.e),
  /* the words a person typed — a date saved in the remark before D948 is printed from the dates instead, never shown in
     the box (engine/inputs.ts remarksTyped) */
  remarks: remarksTyped(r.remarks, r),
  /* the till-date tick's hand choice (owner D953): true / false where someone ticked or unticked it against its default,
     undefined where it follows the default (engine/inputs.ts tillShown) */
  till: typeof r.till === 'boolean' ? r.till : undefined,
  /* the input's own title ([INPUT-OWN-TITLE], D715): NULL while it is named by its kind — the box then SHOWS the kind's
     name and follows a change of kind — and a string once somebody has typed in it ('' when he emptied it: the box
     stays empty for him to type in, rather than snapping back to the kind's name under his cursor). Nothing is stored
     until what was typed differs from the kind's own name (engine/inputs.ts titleOf). */
  title: r.title || null,
  /* an Attach's "To" (his D1373) — where he is attached; '' where none */
  to: r.to || '',
  /* an Other's "Goes to" (his D1356): 'u' while it stands under Unavailable, 'r' while a scheduler has rejected it (the
     scenario designer's G5 — it read "Ground Programme"), else 'g' — the window's choice. A NEW one opened from the
     Unavailable list's "+ Add" starts on Unavailable (the M3 code read's Q3) — the list it was added from */
  goes: r && r._new && r._ctx === 'u' ? 'u' : goesOf(r),
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
/* ON ONE MAN'S CELL OF A LEAVE FILED FOR SEVERAL THE REMARK IS HIS ALONE (Fable's read of the finished code, finding 1 —
   12 Oct 26; the one-rule plan §4.6; owner D737, D755 (3), reading R5). The sheet is opened on a PERSON's cell and is
   handed whatever leave stands behind it (leavewar/sync.ts leaveInputAt — a leave filed on the Inputs page for several
   as readily as one the war approved for one man). So where the input holds several, he is first given a leave of his
   own, in the same command (engine/inputown.ts ownInputOf), and the remark is written on THAT — the others' leave is
   untouched, and the man himself may do it (the piece is his one-person input). The same shape as `saveFromRow`'s
   one-man branch. Pinned in leavewar/onerecord-write.test.ts. */
/* …and its documents, where the caller hands them (the Leave War's remarks window — M3 7.3, D1150, D1159): one save,
   the same gate; a documents-only change prints nowhere on the schedule (inpDetailKey reads no document) */
/* …and its "till <date>" tick, where the caller hands one (the Leave War's bid windows and day's list show the leave's
   Remarks row whole — round 3, D1307: the box, the tick and the Document button; D953's hand choice, settled by the one
   input write as every save is) */
export function setLeaveRemarks(row: any, remarks: string, person?: any, docIds?: string[], till?: boolean): boolean {
  const withDocs = (d: any) => ({ ...d, remarks, ...(docIds ? { docIds: [...docIds] } : {}), ...(typeof till === 'boolean' ? { till } : {}) })
  if (person != null && person !== '' && idsOf(row).length > 1 && holds(row, person)) {
    return ownPartSave(row, person, own => commitInputEdit(own, withDocs(draftOf(own))))
  }
  return commitInputEdit(row, withDocs(draftOf(row)))
}
/* ONE MAN'S PART IS CHANGED, OR NOTHING IS (the one-rule job's check, 12 Oct 26 — the Opus trial read, claim 4, reproduced
   red in leavewar/trialread.test.ts). Both one-man doors — a box typed on his row of the Unavailable list, the Leave
   War's remark on his cell — first give him an input of his own (engine/inputown.ts ownInputOf: he is OUT of the shared
   one from that line on) and then save the change on it. A save refused there answered false, and a batch whose body
   only ANSWERS false is still committed: a start typed equal to the end was refused with its sentence, the cell healed,
   and the man had been taken out of the shared leave all the same, the others told by their bells. So a refusal inside
   THROWS, which is what rolls the command back whole (state/store.ts runInputWrite) — the idiom commitInput's own
   body uses (`stop`). The refusal has already said why; saveBatch says so itself only where nothing did. */
function ownPartSave(inp: any, who: any, save: (own: any) => boolean): boolean {
  return saveBatch(() => {
    const own = ownInputOf(inp, who)
    if (!own || !save(own)) throw new CmdRefused('one man’s part was not saved')
    return true
  })
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
  /* AN INPUT FOR ALL AVAIL / ALL: one of seven kinds (Personal among them since D778, 12 Oct 26), one day ([INPUT-ALL-AVAIL] — placeholderRefused above says why).
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
    HOOKS.toast('Keep at least one document on this entry. Add the replacement before removing the last file.', 'warn'); return null
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
/* …AND A NEW LEAVE ASKS FOR ITS DOCUMENT (owner D1150, M3 7.4 — "something similar to medical where it asks a question
   for a document to attach. But its not a hard stop"): a NEW leave, or one retyped INTO leave, with none, asks the same
   [Upload] / [No document]; a leave already saved and edited never asks. */
export function docGate(draft: any, except: any): 'ok' | 'ask' {
  if (!draft || rowDocIds(draft).length) return 'ok'
  if (needsDoc(draft.type)) return except && needsDoc(except.type) ? 'ok' : 'ask'
  if (isLeave(draft.type)) return except && isLeave(except.type) ? 'ok' : 'ask'
  return 'ok'
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
  /* a cancelled or information-only input can earn nothing, so no door asks for it — the save, the put-back, the
     filing, the revise button (owner D814; engine/inputs.ts oilNeverEarns) */
  if (oilNeverEarns(prevRow)) return { kind: 'none' }
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
  const prev = (prevRow && holds(prevRow, draft.person) && prevRow.oil) || {}
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
  if (!row || !oilAsks(row.type) || oilSilent(row)) return false
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
  if (!row || !oilAsks(row.type) || oilSilent(row)) return ''
  const prev = (row.oil || {}) as Record<string, number>
  const p = oilAskPlan(row).find(x => prev[x.iso] == null)
  return p ? p.iso : ''
}
/** THE "OIL?" SIGN — the day nobody has answered for, FOR A READER WHO MAY ANSWER IT; '' otherwise (owner D777, 12 Oct
 *  26: "Oil pictures looks good" — the pictures of record docs/mock/2026-10-12-oil-ask/). An input's card — the opened
 *  day's and the List's on a phone (ui/InputCard.tsx) — wears a small outlined "OIL?" tag for it, and the desktop List's
 *  row its "OIL?" button, for an input of ONE person and of SEVERAL alike (ui/InputsPage.tsx). ONE body for the three,
 *  so they cannot disagree about an input.
 *  WHO SEES IT is who the input's own window offers "Answer…" to (state/perms.ts mayEditInput): its only person, whoever
 *  filed it for others while he may still change it, an admin. That is what closes the gap the one-rule job's walk
 *  found (A8, H4, H7; the Opus trial read, claim 3): a scheduler puts someone into a member's input and shuts the
 *  question — the member may no longer answer, no bell asks (D762 reading 3), and the List said nothing to the one
 *  person who could. A man merely IN a shared input sees none: he has no answer of his own to give (D762). */
export function oilSignDay(row: any): string {
  const iso = oilUnansweredDay(row)
  return iso && mayEditInput(row) ? iso : ''
}
/** …and its words: the tag's title, and what the card's label says to a screen reader */
export const oilSignNote = (iso: string): string => (iso ? `Nobody has answered the OIL question for ${oilDayLabel(iso)}` : '')
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
/* ONE LABEL FOR AN OIL DAY, wherever one is named (`[CARD-CHECK-SEEN]` 8 — walker C, scenario 78: the question of an
   input in January 2027 named "9 JAN"). Every other date outside the year in hand says its year — the List's day
   headings, a card's "till 1 Jan 2027". Used by the question's heading (ui/OilConfirm.tsx), the window's two "not
   answered yet" lines and the desktop row's "OIL?" chip (ui/InputsPage.tsx). */
export function oilDayLabel(iso: any): string {
  const s = isoLabel(iso)
  return s && +String(iso).slice(0, 4) !== baseYear() ? `${s} ${String(iso).slice(2, 4)}` : s   // two digits (D1096)
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
   seed as it was (ui/InputsCal.tsx openAdd): filed for the signed-in person, its kind's own all-day default.
   `_calendar` is what gives the window its date calendar and keeps the saved input in view (InputEditor, below).
   ITS KIND IS OL (owner D917, 15 Oct 26 — "the default type to be OL since that's the most common leave taken"), not
   the first "Duty & other commitments" kind it opened on until then; OL takes no title (D716). Only these doors: a
   board panel's + Add keeps `firstPersonalType`, SANS "+ Commitment" its own kind, a saved input its own. A squadron
   whose kinds carry no OL falls back to the old start. */
export const newInputSeed = (from?: string, until?: string) => {
  const [iso, end] = from && until && until < from ? [until, from] : [from, until]
  const t = INPUT_TYPES.includes('OL') ? 'OL' : firstPersonalType()
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
  /* …and, since his D1372 / D1374, a course and an Attach, which land there by themselves, and an Other, which goes there
     on its "Goes to" (D1356 — opened from here it starts on Unavailable, draftOf): the M3 code read's Q3 — a scheduler
     adding one from this list was offered none of them */
  u: (t: any) => (isUnavail(t) && !isSansAvail(t) && !isUpchit(t)) || landsUnavail(t) || isOther(t),
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
export function protectedInput(...rows: any[]): boolean {
  const dates = protectedDates()
  if (!dates.length) return false
  const hit = rows.some(r => r && dates.some((dt: any) => inputCoversDate(r, dt)))
  /* (the locked week's one sentence — engine/publish.ts LOCKED_WEEK_NOTE, owner D837: said by all four doors of this file) */
  if (hit) HOOKS.toast(LOCKED_WEEK_NOTE, 'warn')
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
  /* D999: a give-back reaches days the row does not cover yet — they are checked too (the fresh read of D999, 3) */
  (p.action === 'grow' && p.row && p.newEndOrd != null && inputProtected({ date: p.row.date, endDate: ordLabel(p.newEndOrd, p.row.yr), yr: p.row.yr })) ||
  (p.tail && inputProtected({ date: ordLabel(p.tail.startOrd, p.row?.yr), endDate: p.tail.endOrd > p.tail.startOrd ? ordLabel(p.tail.endOrd, p.row?.yr) : undefined, yr: p.row?.yr })))

export const medicalLocked = () => HOOKS.toast(LOCKED_WEEK_NOTE, 'warn')

/* Check every kept segment and its cascade against the unchanged model. Forms
   run this before committing segment one; the sibling writer also guards itself. */
export const medSegmentsProtected = (base: any, segs: any[], keepTail?: any, entryEnd?: any, except = base) =>
  segs.some(g => inputProtected({ ...base, date: ordLabel(g.startOrd, base.yr), endDate: ordLabel(g.endOrd, base.yr) }) ||
    medPlanProtected(newMedTrimPlan(leadOf(base), base.type, g.startOrd, g.endOrd, except, keepTail, entryEnd)))

/* IS THIS DRAFT A PLACEHOLDER INPUT THAT MAY NOT BE SAVED? ([INPUT-ALL-AVAIL] — owner D700, D711, D712, D713; the plan
   docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §3.2.) An input for ALL AVAIL / ALL is one of seven kinds (Personal among them since D778, 12 Oct 26), ONE
   day, never in a group — engine/inputs.ts placeholderProblem, the one body. This is its voice at a save DOOR: it says
   the sentence and answers true, and the caller keeps its window open. Asked FIRST by every save handler — before the
   document question, the medical sheets and the OIL question (Astra's read of the plan, 9 Oct 26: changing an ALL AVAIL
   input's kind to a medical one reached the document question before any refusal) — and again inside
   normalizeInputDraft, which every other door passes through (the calendar's drag, the time cells, each man of a group
   save). A draft carries ISO `start` / `end`; a record carries `date` / `endDate`. The save boundary's hard check
   (state/store.ts) is behind them all. */
export function placeholderRefused(d: any): boolean {
  const why = placeholderWhy(d)
  if (why) HOOKS.toast(why, 'warn')
  return !!why
}
/** …and the sentence itself, said by nobody: '' where the draft's `person` is no placeholder, or is one this input may
 *  hold. Since step 3 of the one-rule build (D750, D753) a placeholder may stand beside other people, so this asks
 *  only what is the placeholder's own — its kind and its one day; the people picker greys its two pucks by it. */
export function placeholderWhy(d: any): string {
  if (!d || !isSpecial(d.person)) return ''
  const iso = d.start != null || d.end != null
  const date = iso ? (d.start ? fmt(d.start) : '') : d.date
  const endDate = iso ? (d.end && d.end !== d.start ? fmt(d.end) : undefined) : d.endDate
  return placeholderProblem({ person: d.person, type: d.type, date, endDate, yr: d.yr ?? baseYear(), acc: d.acc })
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
  /* WRITTEN WITH ITS PEOPLE (the one-rule build, step 2 — owner D756: "an input is stored as ONE record with the list
     of its people"): a filing for one person is a list of one. The entry takes who placed it and when from the
     filing's own stamp, below. */
  const row: any = {
    people: [{ p: draft.person }], type: draft.type, allday: !!draft.allday,
    /* yr anchors the bare date labels to the year they were picked under —
       fmt leaves the loaded year implicit, and this is what reads it back */
    /* the typed words only — its "till <date>" is printed from its dates (owner D948) */
    s, e, date, yr: baseYear(), remarks: remarksTyped(draft.remarks, draft), mod: nowStamp(),
    /* its own title, only where one was typed and its kind takes one (D715, D716 — titleOf is the one normaliser) */
    ...(titleOf(draft.type, draft.title) ? { title: titleOf(draft.type, draft.title) } : {}),
    /* where an Attach is to (his D1373 — free words, optional) */
    ...(isFly(draft.type) && toOf(draft.to) ? { to: toOf(draft.to) } : {}),
    /* FILED UNDER UNAVAILABLE BY ITSELF (his D1372 a course, D1374 an Attach) or by its filer's "Goes to" (an Other — D1356):
       the same `acc:'u'` a scheduler's "→ Unavail" writes, so the schedule draws it under Unavailable and the Leave War
       counts him out (D1357) — from the board's Ground "+ Inputs" too (the code read's F1: there a one-man Other with Goes
       to Unavailable, and an Attach, landed on the programme, the war counting him in, while the same window for two men
       filed both under Unavailable; the filing wins, so one man and several agree) — never for ALL AVAIL / ALL, which is
       never under Unavailable (placeholderProblem). */
    ...(filingOf(draft.type, draft.goes) && !isSpecial(draft.person) ? { acc: 'u' } : {}),
    /* the till-date tick, where it was turned against its default (D953) — one that matches the saved dates' default is
       dropped by the write itself (state/store.ts runInputWrite → tillSettle) */
    ...(typeof draft.till === 'boolean' ? { till: draft.till } : {}),
    ...(endDate ? { endDate } : {}),
    ...(half ? { half } : {}),
    ...(Object.keys(flags).length ? { sans: flags } : {}),
    /* the supporting documents' ids only — the blobs stay in state/docs, so
       history snapshots (JSON of INPUTS) never copy a file. EVERY KIND keeps them since the Leave War overhaul's M3 7.4
       (owner D1150 — "I should allow all inputs to have the option to attach photo/PDF"): the window draws the Document
       row for every kind, so what it holds is what the filer sees (it used to be gated on a medical type, which a
       certificate left behind by a switch to leave relied on — the row now shows it, and its ✕ takes it off). */
    ...docFields(rowDocIds(draft)),
  }
  /* the row's own address, minted before the write so the snapshot this add
     pushes already carries it — the Inputs page add's own withId precedent */
  inpId(row)
  /* who placed it, and when (D629 — state/inputstamp.ts): the signed-in person, whoever it is filed FOR */
  stampPlaced(row)
  { const e = row.people[0]; if (row.by != null) e.by = row.by; if (row.at != null) e.at = row.at }
  /* the medical trim cascade, computed and PREFLIGHTED before the batch (P2-QREV-01):
     it mutates existing rows and fires Leave War withdrawals the funnel cannot undo,
     so a plan touching a protected-date row is refused whole, before anything runs. */
  const medPlan = isDownchit(row.type)
    ? newMedTrimPlan(draft.person, row.type, dateOrd(date, row.yr), dateOrd(endDate || date, row.yr), row, keepTail, entryEnd)
    : isUpchit(row.type)
      ? upchitTrimPlan(draft.person, dateOrd(date, row.yr), row).map((p: any) => ({ ...p, why: 'closed by the upchit' }))
      : null
  if (medPlan && medPlanProtected(medPlan)) {
    HOOKS.toast(LOCKED_WEEK_NOTE, 'warn')
    return false
  }
  const ok = writeInputsBatch(() => {
    INPUTS.unshift(row)
    /* a new medical input wins its overlapping days from a DIFFERENT-type
       downchit, and an upchit cuts everything covering its date to end the
       day before — the upchit day is a fit day (owner, 27 Aug 26) — planned
       pure, applied here so the add and its trims are ONE undo step */
    if (medPlan) applyMedPlan(medPlan)
    if (toGround && row.acc !== 'u') {
      /* the board's Ground "+ Inputs" is a DELIBERATE scheduler act — it lands
         the row on the programme whatever the day's publish state (an ordinary
         AL on a published day), and reports the one duplicate-content-key
         refusal. isUnavail is acceptInput's own refusal, re-checked here only
         to say something useful if a future caller mis-routes; the dialog's
         ground context can only offer activity types. */
      const di = dateIx(date)
      if (di >= 0 && !isUnavail(row.type) && !acceptInput(di, row, 'g'))
        HOOKS.toast('An identical row is already on the Ground Programme, so this one was added under Personal Inputs instead', 'warn')
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
/* `opts.oil` — THE INPUT'S ONE OIL ANSWER, given with this save (owner D762; commitInput below): written on the record,
   for everyone in it. */
export type InputSaveOpts = { sched?: boolean; oil?: Record<string, number> }
export const schedSide = (opts?: InputSaveOpts): boolean => !!(opts && opts.sched) && canEditSched()
/* who is putting a person in, and when — the running command's own person and moment (state/inputstamp.ts) */
const stampOf = (): { by?: string; at?: number } => { const t: any = stampPlaced({}); return { by: t.by, at: t.at } }
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
    /* an input of several, or one a scheduler has since changed, says who CAN (sharedRefusal — one body with the window) */
    HOOKS.toast(idsOf(r).length > 1 || isPlaceholderInput(r) ? sharedRefusal([r], 'change this for everyone') : 'You can only edit your own inputs', 'warn')
    return false
  }
  /* WHO IS IN AN INPUT OF SEVERAL IS NEVER CHANGED HERE (the one-rule build, step 2): this body saves what an input
     SAYS, and re-points an input of ONE person; commitInput changes the list, reassignInput one man's Unavailable row.
     A draft naming someone else for an input that holds several is refused — it used to be passed over in silence,
     saving nothing of it and moving the late date all the same. */
  if (idsOf(r).length > 1 && draft.person != null && draft.person !== '' && !holds(r, draft.person)) {
    /* (owner D837 + D839, 14 Oct 26 — N24: "is changed in its own window" was read as a report that something had just
       been changed, not as the rule; this line and reassignInput's below are a pair and are worded alike) */
    HOOKS.toast('Open this input’s own window to change who is in it', 'warn')
    return false
  }
  /* write-path role backstop (owner, 22 Aug 26): moving an input onto a
     DIFFERENT person is a scheduler's act — the same line reassignInput and
     the calendar drag (caldrag.ts) already draw. A member's editors no
     longer render a Person control at all, so a real gesture cannot trip
     this; it refuses the hand-made call. Editing their own row's times,
     type or remarks stays theirs (draftOf seeds person from the row, so an
     untouched person sails through). */
  if (!canEditSched() && draft.person !== leadOf(r)) {
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
  /* WHERE A SCHEDULER PUT IT STAYS PUT (his D1388 — "the member could quietly move it back"): a member's save of one a
     scheduler moved keeps it where it stands — its Goes to is not his, and a retype is put back there in the write below.
     A kind that cannot stand there — a leave or a medical on the programme or parked, an overseas duty on the programme
     with no move of its own — is refused here, with its reason, before anything is written. */
  const held = !mayMovePlace(r)
  if (held && draft.type !== r.type && placeOf({ ...r, type: draft.type }) !== placeOf(r)) {
    HOOKS.toast(`A scheduler has moved this input, so only a scheduler can change it to ${inpType(draft.type)}`, 'warn')
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
    HOOKS.toast(LOCKED_WEEK_NOTE, 'warn')
    return false
  }
  /* A HAND-OVER WRITES THE REQUEST ALONE ([DB-READINESS] group A, phase 6 (a)). Until phase 6 the week stash joined this
     batch when the holder moved ([OIL-XWEEK-DENY], 22 Sep 26), because the hand-over cleared the old holder's refusal out
     of weeks nobody was looking at too. That clear is gone — the refusal is ignored on read (engine/oilev.ts
     pruneHandedOverDecisions, by the request's `hand` below) — so no week is written, and one Undo still puts back the
     assignment and the refusal together: the count rides the request. */
  /* A DOCUMENT ADDED OR TAKEN OFF IS NOT A CHANGE TO WHAT WAS FILED (the M3 fresh read's 3; D1150 — "they can apply first but
     upload after"): the late mark measures the input's last change (`mod`), and a file attached after the cut-off made an
     on-time leave read LATE. Where the draft differs from the record by its documents alone, its time is left as it was. */
  const docsOnly = (() => { try { return JSON.stringify({ ...draftOf(r), docIds: [] }) === JSON.stringify({ ...draft, docIds: [] }) } catch { return false } })()
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
    const leaveSame = leaveKey({ ...r, person: leadOf(r) }) === leaveKey({ person: draft.person, type: draft.type, date, endDate, yr: baseYear(), allday: draft.allday, half, s, e })
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
    const wasDormant = r.acc === 'r', wasType = r.type, wasPerson = leadOf(r)
    /* …and where it stood, for the scheduler's move (his D1388, below the filing rules) */
    const accWas = r.acc, odWas = r.odGround, placeWas = placeOf(r)
    /* WHO IT IS FOR — its one person, replaced (a hand-over). A record that carries its people is written in its list
       (engine/inputown.ts swapPerson: the entry replaced, the holding moved on); one in the old shape, in `person`, as
       always. An input of SEVERAL is never re-pointed here: who is in it is changed by commitInput, below. */
    const handed = draft.person !== wasPerson && idsOf(r).length <= 1
    if (handed) { if (Array.isArray(r.people)) swapPerson(r, wasPerson, draft.person, stampOf()); else r.person = draft.person }
    r.type = draft.type; r.allday = draft.allday
    /* THE REMARK HOLDS ONLY WHAT WAS TYPED (owner D948, 16 Oct 26): its "till <last day>" is printed from the dates on
       every screen (engine/inputs.ts remarksShown), so a moved or stretched input's date follows by itself — the one save
       every door uses writes the typed words alone, a date token typed or saved before the build taken out. */
    const rem = remarksTyped(draft.remarks, { type: draft.type, date: r.date, endDate: r.endDate, start: draft.start, end: draft.end })   // its old days and its new
    const wasDateD999 = r.date, wasEndD999 = r.endDate, wasYrD999 = r.yr
    r.s = s; r.e = e; r.date = date; r.remarks = rem
    /* the date the late mark reads — left as it is by a scheduler's change made from a row on the schedule (D741, D742) */
    if (!sched && !docsOnly) {
      const was = r.mod
      r.mod = nowStamp()
      /* …and a member's save that writes a NEW change date takes a scheduler's LATE drop off (owner D1620 — a new late
         change brings the mark back); a scheduler's own change keeps it. The commit gate allows exactly this. */
      if (r.mod !== was && !canEditSched()) delete r.lateOff
    }
    /* THE TITLE FOLLOWS THE DRAFT ([INPUT-OWN-TITLE]): written where one was typed, and the key REMOVED where the box
       was put back to the kind's own name, emptied, or the kind retyped to one that takes no title — a leave never
       keeps the name of the Event it used to be. A draft that does not STATE a title (no `title` key at all — a
       hand-made call; every door of the app seeds one through draftOf, where NULL says "none") leaves the record's
       own where its kind still takes one: silence is not an instruction to wipe a name. */
    { const tt = titleOf(draft.type, draft.title === undefined ? r.title : draft.title); if (tt) r.title = tt; else delete r.title }
    /* …AND SO DOES AN ATTACH'S "TO" (his D1373), on the same terms: a draft that states it writes it; a kind that is not
       an Attach keeps none */
    { const to = isFly(draft.type) ? toOf(draft.to === undefined ? r.to : draft.to) : ''; if (to) r.to = to; else delete r.to }
    /* …AND SO DOES THE TILL-DATE TICK (owner D953), on the same terms: a draft that states one (every door of the app
       seeds `till` through draftOf, undefined meaning "as its dates say") writes it; a hand-made call with no `till` key
       leaves the record's own. A choice the new dates overtook is dropped by the write itself (runInputWrite). */
    if ('till' in draft) { if (typeof draft.till === 'boolean') r.till = draft.till; else delete r.till }
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
    /* …for EVERY kind since M3 7.4 (D1150): a leave's or a duty's ✕ that empties its list takes the files off the record;
       a medical's list never goes empty here (the replace-don't-strip refusal above). A draft that carries no list at all
       (a caller that never drew the Document row) leaves the record's as it is. */
    if (Array.isArray(draft.docIds) && (!needsDoc(draft.type) || rowDocIds(draft).length)) {
      delete (r as any).docId
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
    /* D999: a downchit's dates changed BY HAND are what the man says now — the end an upchit once cut it from no longer
       bounds a give-back (the fresh read of D999, 1) */
    /* compared as DATES, not labels: the form writes a label with its year whenever the loaded week is in another year,
       so a remarks-only edit would read as a move (the fix read of D999) */
    if (r.firstEnd != null && (dateOrd(date, baseYear()) !== dateOrd(wasDateD999, wasYrD999)
      || dateOrd(endDate || date, baseYear()) !== dateOrd(wasEndD999 || wasDateD999, wasYrD999))) delete r.firstEnd
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
    const keptOil = (sched ? repricedOil : voidedOil)({ person: wasPerson, oil: r.oil }, { ...r, person: leadOf(r) })
    if (keptOil) r.oil = keptOil; else delete r.oil
    /* …AND THE ANSWER GIVEN WITH THIS VERY SAVE ([OIL-ASK-NOTIFY] — owner D783: a swap "is not made until the question
       is answered", so the new holder's answer arrives WITH the swap, in its one command). Written HERE, after the
       hand-over above voided the old holder's — a line earlier and the same save would void it too (Fable's read of
       the plan, A8). */
    if (opts && opts.oil) r.oil = { ...opts.oil }
    /* ...and the SCHEDULER's own override on this request dies with the
       assignment too (Codex scenario 7, 22 Sep 26). Voiding the member's
       answers above was only half of it: a refusal the scheduler made about the
       old holder stayed on the day, dormant while someone else held the
       request, and live again the moment it was handed back. Since [DB-READINESS]
       group A phase 6 (a) it is not cleared off the days — a hand-over writes no
       day (D450) — but counted: the request's holding moves on, and every
       decision made under an earlier one reads as nothing (engine/oilev.ts
       pruneHandedOverDecisions). The same record, so one undo puts it back. */
    if (handed && !Array.isArray(r.people)) {
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
    /* an overseas duty's way out of Unavailable (D1393, engine/inputs.ts odOut) is its own: retyped into or out of one, the
       new kind stands where it stands by itself — no row kept on the programme by an old mark */
    if (r.type !== wasType && (isOD(wasType) || isOD(r.type))) { delete r.odGround; if (isOD(r.type) && r.acc === 'g') delete r.acc }
    /* WHERE IT IS FILED FOLLOWS ITS KIND AND ITS "GOES TO" (his D1356, D1372, D1374): a retype INTO a kind that lands
       under Unavailable by itself files it there; a retype OUT of one takes it off again (to where its new kind lands —
       the programme, worked out on read), unless it became an Other whose filer picked Unavailable; and an Other's
       "Goes to" changed in the window moves it. A scheduler's own filing of any other kind is left as it is (D1357). */
    {
      const goesWas = goesOf(r)
      /* a scheduler's Reject stands until a scheduler changes it (G5): a member's edit never moves a rejected Other, as his
         edit of a rejected request's time never revives it */
      /* …nor, since his D1388, one a scheduler has moved: where it stands is then the scheduler's (held, above) */
      const goesNow = 'goes' in draft && !held ? draft.goes : goesWas
      if (r.type !== wasType && landsUnavail(r.type)) r.acc = 'u'
      else if (r.type !== wasType && landsUnavail(wasType) && r.acc === 'u' && !(isOther(r.type) && goesNow === 'u')) delete r.acc
      else if (isOther(r.type) && 'goes' in draft && goesNow !== goesWas) { if (goesNow === 'u') r.acc = 'u'; else if (goesNow === 'g') delete r.acc }
      else if (r.type !== wasType && isOther(r.type) && goesNow === 'u') r.acc = 'u'
      /* an Other its filer had under Unavailable, retyped to another commitment, lands where that kind lands — the Ground
         Programme until a scheduler moves it (D1357; the scenario designer's G4) */
      else if (r.type !== wasType && isOther(wasType) && !isOther(r.type) && r.acc === 'u') delete r.acc
    }
    /* …and except an input turned into a PLACEHOLDER's ([INPUT-ALL-AVAIL]; Astra's read of the code, 9 Oct 26): an input
       filed for ALL AVAIL / ALL is never under Unavailable (engine/inputs.ts placeholderProblem) — it goes back onto
       the programme, where its row, its crowd and its OIL are (state/holderbase.ts lands it after this command). */
    if (r.acc === 'u' && isPlaceholderInput(r)) delete r.acc
    /* WHERE A SCHEDULER PUT IT, A MEMBER'S SAVE LEAVES IT (his D1388): whatever the rules above did with his retype — an
       Attach sent under Unavailable by itself, a rejected one revived by its new kind, one taken off Unavailable as another
       commitment — it goes back where it stood (a kind that cannot stand there was refused before the write). A
       scheduler's own save that moves it marks it moved. */
    if (placeOf(r) !== placeWas) {
      if (held) {
        if (accWas === undefined) delete r.acc; else r.acc = accWas
        if (odWas) r.odGround = odWas; else delete r.odGround
      } else markMoved(r)
    }
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
  | { kind: 'up'; who: string; dateLabel: string; effects: { plan: any[]; leftovers: any[] }; cuts: string[] }

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
    const effects = upchitEffects(draft.person, isoOrd(draft.start), r)
    if (!growsBack(effects.plan)) return { kind: 'up', who, dateLabel, effects, cuts: [] }
    /* days given back (D999): what the Leave War's rules will cut there, said first (D1023) — the save the sheet's Save
       runs (commitEditUpchit), tried; then the sheet's rows read again off the lists as they now stand */
    const iid = String(r.iid)
    const find = () => INPUTS.find((x: any) => String(x.iid) === iid)
    const cuts = giveBackCuts(() => { const x = find(); return !!x && commitEditUpchit(x, { ...draft }, []) })
    const again = find()
    return { kind: 'up', who, dateLabel, effects: upchitEffects(draft.person, isoOrd(draft.start), again ?? r), cuts }
  }
  /* the days the SAVE will take — the draft's own whole dates (`isoOrd`), never its labels read in the record's old year */
  const a = isoOrd(draft.start)
  const b = isoOrd(draft.end || draft.start)
  const clashes = medClashes(draft.person, draft.type, a, b, r)
  if (!clashes.length) return null
  return { kind: 'clash', who, newType: draft.type,
    span: fmtDay(draft.start) + (draft.end && draft.end !== draft.start ? ' – ' + fmtDay(draft.end) : ''), clashes, a, b }
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
    remarks: remarksTyped(draft.remarks, draft),     // the date is printed from the dates (D948)
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

/** WOULD THIS SAVE GO THROUGH? — the door's own body, run for real and thrown away (state/store.ts tryInputsBatch;
 *  [OIL-ASK-NOTIFY], owner D783 — the OIL question is put BEFORE the change, so the change must be known good before
 *  anyone is asked). Silent: whatever the save says is said when it is run for real — a refusal by the real run, in
 *  its own words. A refused try puts the lists back as NEW objects: find a record again by its id afterwards. */
export function dryRun(fn: () => boolean | void): boolean {
  const say = HOOKS.toast
  HOOKS.toast = () => {}
  try { return tryInputsBatch(fn) } finally { HOOKS.toast = say }
}
/** WHAT A GIVE-BACK WILL CUT, SAID ON THE UPCHIT SHEET BEFORE ANYTHING CHANGES (owner D1023, 18 Oct 26 — "Ok as
 *  recommended"). Days an upchit moved later or deleted gives back to a downchit can hold leave filed since, and a bid —
 *  and the Leave War's rules cut them inside the same command ("sick cuts leave"; a clashing input replaces an undecided
 *  bid). Rather than work the cut out a second way, the door's own write is TRIED AND THROWN AWAY (dryRun) with those
 *  rules heard as they cut (state/inputgate-hook.ts hearGateCuts): one line each, in their warning's own words — so the
 *  sheet and the save cannot disagree. A write that would be refused cuts nothing. The tried save puts the lists back
 *  as NEW objects: an open window's record is found again by its id here — marked as the same record, so the window
 *  keeps what was typed (InputEditor) — and every caller finds its own again. */
export function giveBackCuts(write: () => boolean | void): string[] {
  const held = INPEDIT && !INPEDIT._new && INPEDIT.iid != null ? String(INPEDIT.iid) : null
  let ok = false
  const lines = hearGateCuts(() => { ok = dryRun(write) })
  if (held != null) {
    const again = INPUTS.find((x: any) => String(x.iid) === held)
    if (again && again !== INPEDIT) setInpEdit(again, true)
  }
  notify()                                           // every screen reads its records again after the thrown-away save
  return ok ? lines : []
}
const growsBack = (plan: any[]) => plan.some((p: any) => p.action === 'grow')
/** THE OIL QUESTION FIRST, FOR A DOOR OF THIS FILE THAT IS NOT AN INPUT'S ROW ([OIL-ASK-NOTIFY] — owner D780: "…holds at
 *  every door"; D783: a change that raises the OIL question "is NOT MADE until the question is answered"; the plan
 *  §3.1, readings R1). The Unavailable row's person (reassignInput, below) and the Inputs calendar's date drag
 *  (ui/caldrag.ts) each made their change and THEN put the question, and a Cancel left it made with nobody having
 *  answered. They now go the way the row's door goes (ui/reqdoor.ts `gated`): the door's own save is tried and thrown
 *  away; a change that would be refused is refused, in its own words; one that raises the question writes NOTHING and
 *  waits (ui/oilwait.ts); the answer runs `make` again WITH it — the change and the answer one command, one Undo.
 *  The record is found again by its id each time (a tried save puts the list back as new objects), and `same` says
 *  whether it is still what the question was asked about. True: the change was made now. */
export function oilFirst(o: {
  kind: OilWaitKind
  lead: string
  iid: string
  /** the change, on the record as it stands; false — refused, and it said why */
  make: (r: any, oil?: Record<string, number>) => boolean
  same: (r: any) => boolean
  gate: (r: any) => ReturnType<typeof oilGate>
  /** what flashes when it is not answered (ui/oilwait.ts — `sel:` + a selector) */
  places: string[]
  /** this door asked afresh — the bar's "Answer OIL"; true: made */
  again: () => boolean
  /** who the waiting question is HEADED for, on the record as it stands — everyone the one answer is written for (owner
   *  D762), as the row's door heads it (ui/reqdoor.ts `gated`). The gate's own heading names the draft's one person, so a
   *  door that changes an input of several says who it will hold ([OIL-ASK-HEAD-SEVERAL] — the narrow read's FX-1,
   *  13 Oct 26: a drag on the Inputs calendar and a hand-over on the Unavailable row headed it with one man). '' or
   *  absent: the gate's. */
  who?: (r: any) => string
}): boolean {
  const find = () => INPUTS.find((x: any) => String(x.iid) === String(o.iid))
  const run = (oil?: Record<string, number>): string => { const r = find(); return !r || !o.same(r) ? 'none' : o.make(r, oil) ? 'done' : 'refused' }
  /* THE GATE FIRST, THE TRY ONLY WHERE THERE IS A QUESTION: nothing to ask (a working day, a kind that never earns) →
     the change is made exactly as it always was, on the very record — a thrown-away save puts every record back as a
     NEW object, and that is paid only where a question is about to be put. The gate is asked without a word: a draft
     it would refuse is the save's to refuse, in the save's own words. */
  const say = HOOKS.toast
  let g: ReturnType<typeof oilGate> | null = null
  HOOKS.toast = () => {}
  try { const r = find(); g = r ? o.gate(r) : null } finally { HOOKS.toast = say }
  if (!g || g.kind !== 'ask') return run() === 'done'
  if (!dryRun(() => run() === 'done')) {
    /* it would be refused: the real run says why and writes nothing. (Should the two ever disagree, the change is made
       as it always was and the question follows it — never silent.) */
    const a = run()
    if (a === 'done') askOilIfPending(find())
    else notify()                                    // every screen reads its records again after the thrown-away save
    return a === 'done'
  }
  const now = find()                                   // a tried save puts every record back as a new object
  holdForOil({
    kind: o.kind, lead: o.lead, places: o.places,
    gate: { who: (o.who && now ? o.who(now) : '') || g.who, typeLabel: g.typeLabel, plan: g.plan, prev: g.prev },
    redo: oil => run(oil),
    ask: () => { const x = find(); if (!x || !o.same(x)) return 'none'; return o.again() ? 'done' : OILWAIT ? 'asked' : 'refused' },
  })
  return false
}

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
export function reassignInput(iid: any, personId: any): boolean {
  /* write-path role backstop (CLAUDE.md: role checks at the write path, not
     only the render). Reassigning WHOSE day an Unavailable row is, is a
     scheduler action — the dialog's Person field and the iu: arm/drop targets
     are already canEditSched()-gated, but this is the one write path and must
     not depend on every future caller remembering to gate first. Distinct from
     commitInputEdit, which a member may legitimately reach to edit their OWN
     input's times/remarks. */
  if (!canEditSched()) return false
  /* `iid` is the row's address after its `iu:` — the input's id, or `<iid>~<person>` for one man's row of an input
     that holds several (engine/keys.ts iuParts — the one parser) */
  const at = iuParts('iu:' + String(iid)) || { iid: String(iid), person: null }
  const r = INPUTS.find((i: any) => i.iid === at.iid)
  if (!r) { HOOKS.toast('That input is no longer there — nothing was changed', 'warn'); return false }
  /* whose row it is: the man it names, else the input's one person */
  const from = at.person != null && holds(r, at.person) ? at.person : leadOf(r)
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
  if (isSpecial(from)) { HOOKS.toast(`An ${PEOPLE[from].cs} input can only be changed in its own window. Open it to change who it is for.`, 'warn'); return false }
  if (from === personId) return false           // dropped back on themselves — nothing to say
  const was = PEOPLE[from] ? PEOPLE[from].cs : String(from || '')
  /* ONE MAN OF SEVERAL REPLACED IN THE LIST (the one-rule build, step 2 (g); the plan §4.6 — "he is REPLACED in the list
     by the person dropped — the swap, as built for one record"): the input, its time and its filing are everyone's and
     stay; only who stands in his place changes. Every refusal a save can meet is asked for the newcomer alone. */
  if (idsOf(r).length > 1) {
    if (holds(r, personId)) { HOOKS.toast(`${PEOPLE[personId].cs} is already on this input`, 'warn'); return false }
    if (!normalizeInputDraft({ ...draftOf(r), person: personId }, r)) return false
    /* (who filed it passes to the scheduler who swaps its FILER out — D759 reading 7, as the window's save does it in
       commitInput; the Opus trial read, claim 9, reproduced red in leavewar/trialread.test.ts) */
    /* (THE OIL QUESTION FIRST — oilFirst, above: the input keeps its ONE answer through this swap, D762, so there is a
       question only where it has none yet; then the swap waits on it and is made with the answer) */
    return oilFirst({
      kind: 'swap', lead: `Putting ${PEOPLE[personId].cs} in place of ${was}`, iid: String(r.iid),
      same: x => holds(x, from) && !holds(x, personId),
      make: (x, oil) => {
        if (!saveBatch(() => {
          const by = me()
          if (by != null && String(x.by ?? '') === String(from)) { toPeople(x); x.by = String(by) }
          swapPerson(x, from, personId, stampOf())
          if (oil) x.oil = { ...oil }
          stampChanged(x)
        })) return false
        HOOKS.toast(isPersonal(x.type) && x.acc !== 'u' ? `${PEOPLE[personId].cs} is on ${inpLabel(x)} instead of ${was}` : `${PEOPLE[personId].cs} is now unavailable instead of ${was}`, 'ok')
        return true
      },
      gate: x => oilGate(draftOf(x), x),
      /* headed for everyone the one answer is written for — the people it will hold, the newcomer in his place (D762,
         [OIL-ASK-HEAD-SEVERAL]; the same list the row's door builds, ui/reqdoor.ts) */
      who: x => inputWho({ people: idsOf(x).map(String).map(p => p === String(from) ? personId : p).map(p => ({ p })) }),
      places: [`sel:[data-inpseat="${String(iid)}"]`],
      again: () => !!reassignInput(iid, personId),
    })
  }
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
     the same — he has not answered — so THE QUESTION IS PUT FIRST and the hand-over is made with its answer (oilFirst,
     above — [OIL-ASK-NOTIFY], owner D783; until then the hand-over was made and the question followed it, and a Cancel
     left the new holder unanswered). A medical never asks the OIL question, so its own wait, just above, and this
     one never meet on one gesture (Fable's read of the plan, A10). */
  return oilFirst({
    kind: 'swap', lead: `Putting ${PEOPLE[personId].cs} in place of ${was}`, iid: String(r.iid),
    same: x => idsOf(x).length === 1 && holds(x, from),
    make: (x, oil) => {
      if (!commitInputEdit(x, { ...draftOf(x), person: personId }, undefined, undefined, oil ? { sched: true, oil } : { sched: true })) return false
      HOOKS.toast(`${PEOPLE[personId].cs} is now unavailable instead of ${was}`, 'ok')
      return true
    },
    gate: x => oilGate({ ...draftOf(x), person: personId }, x),
    places: [`sel:[data-inpseat="${String(iid)}"]`],
    again: () => !!reassignInput(iid, personId),
  })
}
/* (what stood here until [OIL-ASK-NOTIFY]: the hand-over made, then the question — kept for its reasoning)
  if (!commitInputEdit(r, draft, undefined, undefined, { sched: true })) return false
  HOOKS.toast(`${PEOPLE[personId].cs} is now unavailable instead of ${was}`, 'ok')
  /* THE SECOND DOOR ONTO THE SAME BUG (Fable M2, 22 Sep 26). This helper goes
     straight to commitInputEdit, so the gate's own person-change rule never
     runs and the new holder arrives unanswered — which the mode then draws with
     the wording of a refusal. Refusing the drag was the cheaper repair and is
     the wrong one: the app DRAWS this gesture as available, and inviting a
     gesture then declining it is the defect G5 is about. So the reassign stands
     and the question follows.
  askOilIfPending(r)
  return true
} */

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
export function askOilIfPending(r: any, shut = false): boolean {
  if (!r || !oilAsks(r.type)) return false
  /* `shut` — the question was raised from the input's ROW on the schedule (ui/reqdoor.ts): the dialog it opens in closes
     with the sheet, answered or not — whoever put the person on the row was on the schedule, not in the input's window
     (found re-expressing the editor's tests, 12 Oct 26: the mark went unset when the question became the input's one
     answer, and an unanswered question left a dialog standing on the schedule that nobody had opened). */
  /* OF EVERY MAN OF A SHARED ENTRY, NOT OF THE ONE RECORD THE GESTURE HELD (Sol's read of the calendar job's bug check,
     8 Oct 26 — seen failing in `groupeditor.test.tsx` before this): the first man's standing No said nothing about a
     man beside him with no answer, who was then left to his own bell — what D660 rules out. The sheet opens on the
     first record that needs an answer. */
  /* (since the one-rule build the question is the INPUT's — one answer for everyone in it, D762 — so there is one record
     to ask of) */
  const live = INPUTS.find((x: any) => x.iid === r.iid) || r
  if ((oilGate(draftOf(live), live) as any).kind !== 'ask') return false
  setOilAsk(live.iid, shut); setInpEdit(live); notify()
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
export function setInpField(inp: any, field: 'str' | 'end' | 'rmks', text: any, who?: any) {
  if (!inp) return false
  const d: any = draftOf(inp)
  /* the typed words only: a remark box on the schedule's Ground Programme row shows its "till <date>" (the row prints
     it), and a Tab through it hands that back — taken out here, so nothing changed reads as nothing changed (D948) */
  if (field === 'rmks') { d.remarks = remarksTyped(text, inp) }
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
  const ok = saveFromRow(inp, d, who)
  if (ok && !schedSide({ sched: true })) askOilIfPending(inp)
  return ok
}
/* ONE ROW, ONE TIME — FOR EVERYONE ON IT (owner D735; D739 — "a time or a remark the scheduler types on a shared input's
   row … changes the input itself, for everyone in it"; the plan §4.4, the shared half). The schedule draws a shared
   input as ONE row and under Personal Inputs as ONE line, so a box typed there is the ENTRY's: every record of it is
   saved alike, in the entry's one command (commitGroup — one Undo step, one line of history), and the rows stay one
   row. Asked of the same thing the drawing asks: an activity kind, not filed under Unavailable, whose entry holds more
   than one record. ON THE UNAVAILABLE LIST A TYPED BOX CHANGES THAT MAN'S RECORD ALONE, as built — that list stays a
   row a man (D737; reading R7), and he then reads as his own input. A one-man input is saved as it always was. */
/* …SINCE THE ONE-RULE BUILD (step 2 (g); the plan 2026-10-11-one-rule-plan.md §4.6): the input is ONE record, so a box
   typed on its row or its Personal Inputs line saves that record — for everyone in it. ON THE UNAVAILABLE LIST one
   man's row of an input that holds SEVERAL is his part alone (`who` — the row names him: engine/keys.ts iuParts): he is
   first given an input of his own, in the same command (engine/inputown.ts ownInputOf), and the box changes that —
   what "a record changed alone leaves the entry" did by itself before, said in the data (D737, D759 reading 4; told
   to him as R5). */
function saveFromRow(inp: any, d: any, who?: any): boolean {
  const mine = who != null && who !== '' && idsOf(inp).length > 1 && holds(inp, who) && !(isPersonal(inp.type) && inp.acc !== 'u')
  if (!mine) return commitInputEdit(inp, d, undefined, undefined, { sched: true })
  return ownPartSave(inp, who, own => commitInputEdit(own, { ...d, person: who }, undefined, undefined, { sched: true }))
}
/* THE NAME TYPED ON A REQUEST'S ROW IS THE INPUT'S OWN TITLE (owner D739, D740; reading R1, told to him — the plan
   2026-10-10-group-input-one-row-plan.md §4.4): the row's name box on the Ground Programme is reached through
   ui/reqrow.ts, and what is typed there becomes the title, in the letters typed — through the one normaliser inside
   the save (engine/inputs.ts titleOf: 40 characters; the kind's own name, in any case, is no title and takes one
   away). Like setInpField it is reached only from a row on the schedule, so its save is a schedule-side one: the late
   date stays (D741). A name does not price OIL, so nothing follows it. */
export function setInpTitle(inp: any, text: any) {
  if (!inp) return false
  const d: any = draftOf(inp)
  d.title = String(text == null ? '' : text)
  return saveFromRow(inp, d)
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
    /* an input of several, or one for ALL AVAIL, is deleted for everyone by whoever filed it or an admin — said in the
       shared sentence (the old removeEntry's, folded in here with the dead code, step 6 of the one-rule build) */
    HOOKS.toast(idsOf(r).length > 1 || isPlaceholderInput(r) ? sharedRefusal([r], 'delete this for everyone') : 'You can only delete your own inputs', 'warn')
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
  /* a man taking himself out of a shared input that goes on: what stood on his place goes with him, and his line says so */
  /* AN UPCHIT DELETED GIVES THE DOWNCHIT IT CUT ITS DAYS BACK (owner D1022, 18 Oct 26 — as a moved one does, D999), in the
     same command: one Undo step puts back the upchit and the cut together. Every door that deletes one says so first
     (upchitDeleteAsk, below); this is the write, whoever asked. A give-back onto a locked day is refused whole. */
  const back = upchitDeletePlan(r).map((p: any) => ({ ...p, why: 'given back by a deleted upchit' }))
  if (back.length && medPlanProtected(back)) { medicalLocked(); return false }
  return saveBatch(() => { if (back.length) applyMedPlan(back); dropInputRow(r) })
}
/** THE QUESTION BEFORE AN UPCHIT IS DELETED (D1022 — "the save sheet says so before anything changes"): what its delete
 *  would give back, for the upchit sheet to say — null where the delete changes nothing else (any other input, an upchit
 *  whose downchit has nothing to get back), and the door then deletes at once as it always has (D792). */
export function upchitDeleteAsk(r: any): { who: string; dateLabel: string; effects: { plan: any[]; leftovers: any[] }; cuts: string[] } | null {
  if (!upchitDeletePlan(r).length) return null
  const o = dateOrd(r.date, r.yr)
  const p = leadOf(r)
  /* …and each leave and bid of his the days given back will cut (D1023): the delete itself (removeInput), tried; the
     plan then worked out again off the lists as they now stand (the tried save put them back as new objects) */
  const iid = String(r.iid)
  const find = () => INPUTS.find((x: any) => String(x.iid) === iid)
  const cuts = giveBackCuts(() => { const x = find(); return !!x && removeInput(x) })
  const plan = upchitDeletePlan(find() ?? r)
  return { who: PEOPLE[p] ? PEOPLE[p].cs : String(p ?? ''), dateLabel: o != null ? fmt(ordISO(o)) : String(r.date || ''), effects: { plan, leftovers: [] }, cuts }
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
  /* an input whose list a scheduler has changed is no longer wholly its filer's (owner D755 (3); the one-rule plan §4.9) */
  { const r = rows.find(x => x && Array.isArray(x.people)); if (r && r.by != null && !filedWhole(r)) return 'A scheduler has changed who is in this — ask an admin to change it for everyone' }
  const by = rows.find(r => r && r.grpBy)?.grpBy ?? rows.find(r => r && r.by)?.by
  return `Only ${PEOPLE[by] ? PEOPLE[by].cs : 'whoever filed it'} — who filed it — or an admin can ${what}`
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

/* ---- THE ONE WRITER OF AN INPUT ([ALL-AVAIL-AS-MEMBER] step 2 (a), 12 Oct 26 — owner D756: "an input is stored as ONE
   record with the list of its people"; D762: one OIL answer for everyone in it; D755 (3): a person in it "may always
   withdraw himself"; D763: "who is in an input is changed only by whoever filed it or by a scheduler"; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.4 "The writer") -------------------------------------------------
   `rec` — the input's record, or null for a new filing. `draft` — what it should say (its `person` is not read).
   `people` — who it should hold, in the order wanted; someone already in it keeps his place and his entry, someone new
   is appended. `opts.sched` — the save comes from the input's row on the schedule (the late date is not moved, a Yes to
   the OIL question is re-priced, not dropped — commitInputEdit). `opts.oil` — the input's one OIL answer.

   IT RUNS EVERY REFUSAL FIRST — who may, what one record may hold (engine/inputs.ts shapeProblem), and every refusal a
   single person's input can meet, asked for EVERY person and said with his callsign where it is his alone — and then
   ONE command: one record put. One Undo step. What the input SAYS is saved by the one body every input's fields go
   through (commitNewInput for a filing, commitInputEdit for a change — the remark's date word, the late date, the
   voiding of an OIL answer the hours no longer price, the stamps, the absence rules at the door), so no rule of a
   single input can be missed for one of several.

   WHO MAY (state/perms.ts — the one module): an admin; the input's only named person; its filer, for a kind he may file
   for others. ANYONE IN IT may take HIMSELF out, and nothing else (D755 (3)); a person in it who did not file it adds
   nobody (D763).

   A PERSON PUT IN LATER is stamped with who put him in and when, and — where the save is the input's own window, after
   the input's own late date — with a late date of his own: only the person added can be late; the input's own date and
   everyone else's entry are left alone.

   A filing for ONE person is written with its list of one too (commitNewInput — step 2 (g)); a record stored in the old
   shape reads the same (inputs.ts peopleOf) and is rewritten with its list the first time who is in it changes.

   Returns true when it is saved (or there was nothing to save); false, having said why, when it is not. */
/** who an input is CALLED BY in a title or a question: its one person; for several, the first A to Z and how many more
 *  ("Ace +2") — a placeholder never leads while a named person is in it. '' for a record naming nobody. */
export function inputWho(rec: any): string {
  const ids = rec ? idsOf(rec) : []
  if (!ids.length) return ''
  const cs = (p: any) => (PEOPLE[p] ? PEOPLE[p].cs : String(p ?? ''))
  if (ids.length === 1) return cs(ids[0])
  const named = namedOf(rec).map((e: any) => cs(e.p)).sort((a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  return `${named.length ? named[0] : cs(ids[0])} +${ids.length - 1}`
}
/** HOW MANY AN INPUT HOLDS, IN WORDS, for the window's own sentences — "Input added for …", "Delete this input for …?",
 *  "It stays for …": the PEOPLE are counted and a placeholder is said beside them ("2 people and ALL AVAIL"; one named
 *  person keeps his callsign, "Ranger and ALL AVAIL") — ALL AVAIL stands for whoever is free on the day (D702), so it is
 *  nobody to count. The wording of the calendar's own delete question (ui/inputscal-model.ts everyoneIn); pinned equal
 *  to it by ui/phmember.test.tsx. (Found by the look at step 3 of the one-rule build, 12 Oct 26: "Input added for 3
 *  people" for two people and ALL AVAIL.) */
export function howMany(ids: readonly any[]): string {
  const cs = (p: any) => (PEOPLE[p] ? String(PEOPLE[p].cs) : String(p ?? ''))
  const named = ids.filter(p => !isSpecial(p)), phs = ids.filter(p => isSpecial(p)).map(cs)
  return [named.length === 1 ? cs(named[0]) : named.length ? `${named.length} people` : '', ...phs].filter(Boolean).join(' and ')
}
export function commitInput(rec: any | null, draft: any, people: any[], opts?: InputSaveOpts): boolean {
  if (!draft) return false
  const say = HOOKS.toast
  const cs = (p: any) => (PEOPLE[p] ? PEOPLE[p].cs : String(p ?? ''))
  const want: string[] = []
  { const seen = new Set(want); for (const p of people || []) { const id = p == null ? '' : String(p); if (id && !seen.has(id)) { seen.add(id); want.push(id) } } }
  if (rec && INPUTS.indexOf(rec) < 0) { say('That input is no longer there — nothing was saved', 'warn'); return false }
  if (!want.length) { say('Pick at least one person', 'warn'); return false }
  const scheduler = canEditSched(), mine = me()
  if (!scheduler && mine == null) { say('Sign in with your own account to file an input', 'warn'); return false }
  const have: string[] = rec ? idsOf(rec).map(String) : []
  const wantSet = new Set(want), haveSet = new Set(have)
  const gone = have.filter(p => !wantSet.has(p))
  const added = want.filter(p => !haveSet.has(p))
  /* his list, in the record's own order, then whoever is new */
  const next = have.filter(p => wantSet.has(p)).concat(added)

  /* EVERY REFUSAL A SINGLE PERSON'S INPUT CAN MEET, FOR EVERY PERSON, BEFORE ANYTHING IS WRITTEN — asked quietly, then
     said once: as it is where everyone meets the same one (a missing time), with his callsign where it is one's alone */
  const norm = new Map<string, NonNullable<ReturnType<typeof normalizeInputDraft>>>()
  const refused: Array<[string, string]> = []
  for (const p of next) {
    let why = ''
    HOOKS.toast = (m: any) => { if (!why) why = String(m) }
    let n: ReturnType<typeof normalizeInputDraft>
    try { n = normalizeInputDraft({ ...draft, person: p }, rec) } finally { HOOKS.toast = say }
    if (!n) refused.push([p, why || 'This input could not be saved'])
    else norm.set(p, n)
  }
  if (refused.length) {
    const same = refused.length === next.length && refused.every(x => x[1] === refused[0][1])
    const [who, why] = refused[0]
    say(same || why.startsWith(cs(who)) ? why : `${cs(who)} — ${why}`, 'warn')
    return false
  }
  const first = norm.get(next[0])!
  /* ALL AVAIL / ALL PUT INTO ONE A SCHEDULER MOVED UNDER UNAVAILABLE would take it off again (a placeholder is never under
     Unavailable — below): where he put it is his to change (his D1388) */
  if (rec && rec.acc === 'u' && next.some(p => isSpecial(p)) && !mayMovePlace(rec)) {
    say('A scheduler has moved this input under Unavailable, so only a scheduler can put ALL AVAIL or ALL in it', 'warn'); return false
  }
  /* WHAT ONE RECORD MAY HOLD — the same body the save boundary holds every command to (state/store.ts) */
  /* (an input under Unavailable that now holds a placeholder is taken back onto the programme by this save, below —
     so where it is filed TODAY is not held against the placeholder) */
  const offU = !!rec && rec.acc === 'u' && next.some(p => isSpecial(p))
  const shape = shapeProblem({ type: draft.type, date: first.date, endDate: first.endDate, yr: baseYear(), acc: rec && !offU ? rec.acc : undefined, lw: rec ? rec.lw : undefined, people: next.map(p => ({ p })) })
  if (shape) { say(shape, 'warn'); return false }
  /* (A PLACEHOLDER IS ONE OF AN INPUT'S PEOPLE since step 3 of the one-rule build — owner D750, D753, D755: it may be
     put in beside them, be left alone when they go, or take the input over in one save. Until then every one of those
     was refused here as "filed on its own".) */
  if (protectedInput(...(rec ? [rec] : []), normDest(first, draft.yr))) return false

  /* does what it SAYS change? (the dates compared as dates, not as their labels — a label carries no year) */
  const sansKey = (x: any) => Object.keys(sansFlags(x)).sort().join(',')
  const wantEnd = draft.end && draft.end !== draft.start ? draft.end : ''
  const says = !!rec && (rec.type !== draft.type || !!rec.allday !== !!draft.allday || rec.s !== first.s || rec.e !== first.e
    || unfmt(rec.date, rec.yr) !== draft.start || (rec.endDate ? unfmt(rec.endDate, rec.yr) : '') !== wantEnd
    || (rec.half || '') !== (first.half || '') || remarksTyped(rec.remarks, rec) !== remarksTyped(draft.remarks, draft)
    || String(rec.title || '') !== titleOf(draft.type, draft.title === undefined ? rec.title : draft.title)
    || (isFly(draft.type) && String(rec.to || '') !== toOf(draft.to === undefined ? rec.to : draft.to))
    || (isOther(draft.type) && 'goes' in draft && goesOf(rec) !== draft.goes)
    || ('till' in draft && (typeof rec.till === 'boolean' ? rec.till : undefined) !== (typeof draft.till === 'boolean' ? draft.till : undefined))
    || (isSansAvail(draft.type) && sansKey(rec.sans) !== sansKey(draft.sans)))
  const answers = !!opts && !!opts.oil && (!rec || JSON.stringify(rec.oil || {}) !== JSON.stringify(opts.oil))

  /* WHO MAY — asked before anything is written, of the one module (state/perms.ts) */
  for (const p of added) if (!mayFileInputFor(p, draft.type)) { say(fileForOtherRefusal(draft.type), 'warn'); return false }
  /* a member never hands an input someone else filed for him to another person — he may add people to it, or take
     himself out; moving it is a scheduler's (commitInputEdit says the same of one person's input) */
  if (rec && !scheduler && mine != null && added.length && gone.includes(String(mine)) && String(rec.by ?? '') !== String(mine)) {
    say('Only a scheduler can move an input to another person', 'warn'); return false
  }
  if (rec) {
    const selfOut = !scheduler && mine != null && gone.length === 1 && gone[0] === String(mine) && !added.length && !says && !answers
    if (!selfOut && (says || answers || gone.length || added.length) && !mayEditInput(rec)) {
      say(sharedRefusal([rec], 'change this for everyone'), 'warn'); return false
    }
  }
  if (rec && !says && !answers && !gone.length && !added.length) return true

  /* THE ONE COMMAND. What the doors and the absence rules say inside it is gathered, and said once afterwards. */
  const heard: string[] = []
  const heardSet = new Set<string>()
  HOOKS.toast = (m: any) => { for (const part of String(m).split(' · ')) if (part && !heardSet.has(part)) { heardSet.add(part); heard.push(part) } }
  let ok = false
  try {
    ok = writeInputsBatch(() => {
      const stop = (): never => { throw new CmdRefused(heard[heard.length - 1] || 'refused') }
      let r: any = rec
      if (!r) {
        if (!commitNewInput({ ...draft, person: next[0] }, false, undefined, undefined, x => { r = x }) || !r) stop()
        for (const p of next.slice(1)) r.people.push({ p, ...(r.by != null ? { by: r.by } : {}), ...(r.at != null ? { at: r.at } : {}) })
        /* an Other its filer sent under Unavailable, filed with ALL AVAIL / ALL among its people, lands on the programme
           instead — a placeholder is never under Unavailable (placeholderProblem; the scenario designer's G3: it was
           refused whole, after the window had offered "Goes to") */
        if (r.acc === 'u' && isPlaceholderInput(r)) delete r.acc
      } else {
        if (says && !commitInputEdit(r, { ...draft, person: leadOf(r), docIds: rowDocIds(r) }, undefined, undefined, opts)) stop()
        /* who filed it passes on with its filer (state/perms.ts byAfterLeaving — Fable F13): to the scheduler who takes
           him out (D759 reading 7); to whoever put in the newest entry not his own, when he takes himself out */
        const filer = r.by == null ? null : String(r.by)
        if (filer && gone.includes(filer)) { toPeople(r); const by = scheduler && mine != null ? String(mine) : byAfterLeaving(r, filer); if (by != null) r.by = by }
        for (const p of gone) takePerson(r, p)
        const st: any = added.length ? stampOf() : null
        /* only the person added can be late: his own date, where this save is the input's own window and falls after
           the input's (a change from the schedule never makes anyone read late — D741) */
        if (st && !schedSide(opts)) { const today = nowStamp(); if (String(inputStampISO(r) || '') < today) st.mod = today }
        /* a person a member adds on a new change date takes a scheduler's LATE drop off (owner D1620) */
        if (st && st.mod != null && !scheduler) delete r.lateOff
        for (const p of added) putPerson(r, p, st)
        /* …and an input filed for ALL AVAIL / ALL is never under Unavailable — it goes back onto the programme (the
           same rule the one-person save keeps, commitInputEdit; found by the re-expressed tests, 12 Oct 26) — a
           scheduler's move, marked (his D1388; the code read's F2: unmarked, its filer could send it back) */
        if (r.acc === 'u' && isPlaceholderInput(r)) { delete r.acc; markMoved(r) }
        /* THE ONE PERSON OF AN INPUT WHO MAKES IT AN INPUT OF SEVERAL IS WHO FILED THAT (state/perms.ts takesOn — as before
           the build, where the group he made named him its filer): so he can go on changing who is in it, and its OIL
           question comes to his bell. An admin's add leaves who filed it alone. */
        if (!scheduler && mine != null && added.length && !gone.length && have.length === 1 && have[0] === String(mine) && String(r.by ?? '') !== String(mine)) r.by = String(mine)
        if (gone.length || added.length) stampChanged(r)
      }
      if (opts && opts.oil && JSON.stringify(r.oil || {}) !== JSON.stringify(opts.oil)) { r.oil = { ...opts.oil }; stampChanged(r) }
    })
  } finally { HOOKS.toast = say }
  if (!ok) {
    const why = heard[0]
    say(why ? `${why} — nothing was saved${next.length > 1 ? ' for anyone: take that person off the list, or change it' : ''}` : 'Not saved — that change is not yours to make', 'warn')
    return false
  }
  if (heard.length) say(heard.join(' · '), 'warn')
  return true
}
/* one man's own input, for the bodies of this file that change his part alone (engine/inputown.ts) */
export { ownInputOf }

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
export const WIN_FIELDS: { k: string; label: string; keys: string[] }[] = [
  { k: 'person', label: 'person', keys: ['person'] }, { k: 'type', label: 'kind', keys: ['type'] },
  { k: 'title', label: 'title', keys: ['title'] },
  { k: 'start', label: 'start date', keys: ['start'] }, { k: 'end', label: 'end date', keys: ['end'] },
  { k: 'hours', label: 'hours', keys: ['allday', 'half', 'sTime', 'eTime'] },
  { k: 'remarks', label: 'remarks', keys: ['remarks'] }, { k: 'till', label: 'till date', keys: ['till'] },
  { k: 'sans', label: 'Fly / OFT / AMT', keys: ['sans'] },
  { k: 'docs', label: 'documents', keys: ['docIds'] },
]
export const fieldSame = (f: { keys: string[] }, a: any, b: any) => f.keys.every(k => JSON.stringify(a?.[k] ?? null) === JSON.stringify(b?.[k] ?? null))
export const fieldPart = (f: { keys: string[] }, d: any) => Object.fromEntries(f.keys.map(k => [k, d?.[k]]))
/** a field's value in words, for "theirs … yours …" */
export function fieldSay(k: string, d: any): string {
  if (!d) return 'nothing'
  if (k === 'person') return PEOPLE[d.person] ? PEOPLE[d.person].cs : String(d.person ?? 'nobody')
  if (k === 'type') return String(d.type || 'none')
  if (k === 'start' || k === 'end') return d[k] ? fmtDay(d[k]) : 'none'
  if (k === 'hours') return d.allday ? 'all day' : d.half ? String(d.half).toUpperCase() : `${d.sTime}–${d.eTime}`
  if (k === 'remarks') return d.remarks ? `“${d.remarks}”` : 'none'
  if (k === 'till') return typeof d.till === 'boolean' ? (d.till ? 'shown' : 'hidden') : 'as its dates say'
  if (k === 'title') return `“${titleOf(d.type, d.title) || String(d.type || '')}”`
  if (k === 'sans') return d.sans ? (['f', 'o', 'a'].filter(x => d.sans[x]).map(x => x.toUpperCase()).join(' ') || 'none ticked') : 'none'
  const n = (d.docIds || []).length
  return n ? `${n} document${n > 1 ? 's' : ''}` : 'none'
}

/* WHICH PROGRAMME an input lands on, said in words — the Common Programme where its people hold ALL or ALL AVAIL (owner D955;
   ui/html.ts onCommon reads the same off the row), the Ground Programme otherwise */
export const progOf = (ids: readonly any[]): string => ids.some((id: any) => PEOPLE[id] && PEOPLE[id].special) ? 'Common Programme' : 'Ground Programme'

