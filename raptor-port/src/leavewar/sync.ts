// THE LEAVE WAR ⇄ RAPTOR SEAM ([ARCH-STACK] step 4, 20 Sep 26 — replaces the
// 17 Aug two-way copy of approved leave, wires 1 + 2, which is DELETED).
//
// An absence — leave, medical, course, overseas duty — is ONE record: the Raptor
// Input. This module:
//   - READS the Inputs into the war's absence index (`refreshAbsences`), from
//     which the war derives what each day shows (state/merge.ts, engine/dayview.ts);
//   - installs the ABSENCE DOOR on the war store: approving, un-approving,
//     removing and moving approved leave write the Input inside the war's own
//     command (`doorApprove` … `doorMoveApproved`);
//   - installs the owner's clash rules at the inputs door (inputgate.ts) and the
//     publish door (`publishReplacesBids`);
//   - derives the clash strip from the day views;
//   - keeps wire 0 (the roster projection) and wire 4 (OIL credits from the
//     published schedule and acknowledged duty claims, `runOilPass`) and the
//     posting-out archive pass.
// The derived passes are reconciliation, not queues: compute the desired state,
// diff, write only the difference; a SYNCING flag guards re-entrancy.

import { useSyncExternalStore } from 'react'
import { toPeople, pieceOf } from '../engine/inputown'
import { inputOnDay, goesOnProg, inputLines, DATES, baseYear, dateOrd, inpId, inpWin, isAway, isLeave, isPersonal, canWork, oilAsks, oilSilent, remarksTyped, tillShown, tillDefault, inputCoversDate, nowStamp, idsOf, onlyNamed, leadOf, isPlaceholderInput, inputSilent, filingOf, inputUnitOf } from '../engine/inputs'
import { dayEngaged, personBusy } from '../engine/avail'
import { inputProtected, protectedDates } from '../engine/quarantine'
import { shortDate } from './ui/dates'
import { mayManageRoster, viewerId, me, mayEditInput, setLwDayOpenProbe, setLwBalanceProbe, setLwUnitProbe, setLwPostingProbe, setFollowUpsProbe, setWarLinesOwed, setHolidayLinesOwed, pageUnit } from '../state/perms'
import { openWinFor } from '../state/cutoff'
import { rosterOf, homeUnitOf, unitPeople } from '../engine/roster'
import { UNIT } from '../engine/unitview'
import { qualify } from '../storage/unitid'
import { balancesLocked, setHiddenIdentityLookup, snapshotNow, setWarHomeProbe, readStoredPost, samePosting } from './state/store'
import { setLwManDayProbe, setLwLeaveAddsProbe, setLwxPostingProbe } from '../state/perms'
import { PROFILE } from './state/rows'
import { UNIT_ROW_PREFIXES } from '../state/units-model'
import { onCommit as cmdOnCommit } from '../command'
import type { Change } from '../command/types'
import { isBalKind, readTypedBalShape, sameSnapshot, type SnapEntry } from './engine/leaveyear'
import { SESSION, canEditOwn } from '../state/auth'
/* [ARCH-STACK] phase 3: the command-routed persistPeople (the cross-seam roster
   writers — PO-archive, restore — emit a people change too). */
import { persistPeopleProjection, commitPeopleEdit } from '../state/people-settings-commit'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import type { Day, Sched } from '../engine/schema'
import { SCHED, dayApproved, dayCurVer, dayCurVerIn, daySnapIn, daySnapOf, amFormatOf, unpublishBackTo } from '../engine/publish'
import { blindDesks, dayOilBlind, dayOilWork, inputOilAmt, oilWorkWhy, type OilWork } from '../engine/oil'
import { oilEarnedWork, oilAmount, oilWorkSpans as workSpans, type OilEvidence } from '../engine/oilev'
import { stashUnitKeys, stashGet, isPreservedWeek } from '../engine/weekstash'
import { CURWEEK } from '../engine/waves'
import { validate } from '../engine/validate'
import { notify as raptorNotify, subscribe as raptorSubscribe, getVersion as raptorVersion, writeInputsBatch, setSessionWorldHook } from '../state/store'
import { DAYSWIN, setDaysWin, setDocView, setInpEdit, setOilAsk, setOilList } from '../ui/pops'
import { puck } from '../ui/html'
import type { DayWhatIf } from './engine/whatif'
import { lwSyncTurn } from './state/store'
import {
  addDays,
  oilLedgerOf,
  inSquadron,
  isNonWorkingDay,
  localToday,
  weekday,
  parseCell,
  warHolding,
  recsAt,
  recContribs,
  isOilAward,
  requestWin,
  barsWrite,
  forbiddenPair,
  liveRequestsOn,
  portionOfCode,
  portionOf,
  codeInWords,
  overlaps,
  newRecId,
  outcomeOf,
  holidayAt,
  availHave,
  availPointsOf,
  availRedLines,
  availVerdict,
  reqNamesOf,
  redDays,
  type AvailVerdict,
  type DayVerdict,
  type RedDay,
  type RedLine,
  classifyEvent,
  defKey,
  shortOf,
  normShort,
  isWeekend,
  canEditCell,
  memberToday,
  type PostOutcome,
  type Person,
  type Contrib,
  type RequestRec,
  type RequestState,
  type WarRec,
  type Period,
  type EventDef,
  type DayInfo,
  type EventBand,
  type EventKind,
  type HolidayRef,
} from './engine'
import {
  absencesChanged,
  availRules,
  bidWhatIf,
  getVersion,
  setRefusalHook,
  setHolidayTell,
  holidayRunsOfChanges,
  setDecisionTell,
  openingTells,
  type HolidayRun,
  type WarTell,
  type OpenTell,
  type ReqWords,
  clearRaptorCell,
  createWar,
  selectWar,
  figureCtxOf,
  getState,
  ingestDutyCredit,
  lwEditLists,
  rawState,
  setAbsenceDoor,
  setActorLookup,
  focusDay,
  setPeople,
  setPostOut,
  lwStore,
  markPostingDone,
  forgetPersonFrom,
  openStint,
  closeStintOnArchive,
  postingProblem,
  stintClosed,
  stintOpened,
  personCut,
  restoreDateProblem,
  keepsWindow,
  windowFor,
  setAccountLookup,
  setPostingBlockLookup,
  setPostingLockLookup,
  setQualCatalog,
  setViewer,
  setViewerCallsign,
  subscribe as lwSubscribe,
  postedOutBy,
  initStore as lwInitStore,
  lwHistInit,
  worldUnit,
  readStoredPeriods,
  postOutIsSaved,
  revertUnsavedPostOuts,
} from './state/store'
import { units as unitList, homeOn, todayIso, unitRows } from '../state/units'
import { foreignWar, setForeignDoor, readForeign, type ForeignWar } from './state/foreign'
import type { StorageBackend } from './state/storage'
import { HOOKS } from '../engine/hooks'
import { deferEffect as cmdDeferEffect, commitProjection as cmdCommitProjection, commit as cmdCommit, CmdRefused, isInReducer, isCommitting as cmdIsCommitting, activeEnvelope, isQueued, isOk, type CommitResult, type Txn } from '../command'
/* [POST-OUT-OUTCOMES] (27 Sep 26): the posting's outcomes cross the seam HERE, the one place the war meets Raptor */
import { suspendForPosting, enableAfterPosting, lastAdminIfGone, lastAdminLock, masterDeleteProblem, masterChangeProblem, otherSquadronPersonProblem, accountOfPid, suspendForArchive, enableForRestore, ACCOUNTS_LIST, isAdminAccount, adminsOf } from '../state/accounts'
import { markBack, clearBack, CURPAGE, setPage } from '../state/view'
import { askNewWar } from './ui/warask'
import { applyDelete, deleteCutoff, effectiveToday, stashPreflight } from '../state/person-delete'
import { peopleStore, settingsStore, finishPeopleWrite, revertUnsavedPeople } from '../state/people-settings-commit'
import { schedStore, schedApplyEnd, resyncBeforeEnlist, commitInputs, SCHED_TYPES } from '../state/sched-commit'
import { noticeHoliday, noticeWar, noticePosting, noticePostingBack, setHolidayLeft, setHolidaySpan, setDerivedNotices, isWarNotice, noticeAboutHim, noticeLeftBell, warLineName, NOTICES, type Notice, type NoticePart, type PoOutcome } from '../state/notices'
import { askLw, askRing, setApprMode, setBalancesUp } from './ui/lwnav'
import { ringCell } from './ui/cellring'
import { hasRead, forgetRead } from '../state/noticeseen'
import { renameCallsign } from '../engine/slots'
import { ELOG } from '../engine/editlog'
import { callsignProblem, saidOf } from '../state/roster-add'
import { setPublishGate, setOilPlan } from '../state/inputgate-hook'
import { stampPlaced, stampChanged, stampWho } from '../state/inputstamp'
import { absencesAt, setAbsenceRows, setAbsenceOwner, type MergedWar } from './state/merge'
import { validIso, planFor, monthAnswers, type DayFacts, type DayAnswer, type FlyPlan, type FlyRun, type Tones } from '../state/flyplan-model'
import {
  getFlyPlan as planOfUnit, getTones as tonesOfUnit, sansFly, setFlyDays as setFlyDaysOf, setFlyRun as setFlyRunOf,
  dropFlyRun as dropFlyRunOf, type FlyDayPatch, type FlySave,
} from '../state/flyplan'
import { MAX_CARRIED_REMARK, MAX_REQ_DOCS } from './engine/warrecs'
import { docFields, rowDocIds } from '../state/docs'
import { codeWorth } from './engine/credit'
import { cs, dm, installInputGate } from './inputgate'
import { projectPeople, qualCatalogue, homeStintsFor, laidHome } from './state/raptorRoster'
import {
  labelToISO, warVisible, warCounts, absenceSignature, buildAbsenceIndex, inputDates, inputWindow, inputRowFor, isoToInputDate, warInputs, warLines, rosterBody,
  type AbsenceIndex, type WarInput, type InputRead,
} from './absences'

/* Re-entrancy: ingest persists-and-notifies per cell, and writeInputsBatch's
   epilogue notifies too, so each reconciler fires the other's subscription
   mid-write. One flag over both means those nested calls return at the door;
   the wiring below re-runs the counterpart pass once the writer finishes. */
let SYNCING = false

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* '2026-02-11' -> 'Feb 11', year-suffixed outside baseYear()'s year — the
   exact convention engine/inputs.ts documents and dateOrd reads back. */
function isoToLabel(iso: string): string {
  const y = +iso.slice(0, 4)
  const lbl = `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`
  return y === baseYear() ? lbl : `${lbl} ${y}`
}

/* labelToISO / rowPortion / medRowPortion live in ./absences ([ARCH-STACK]
   step 4) — the one absence layer reads them too. */

/* ---- THE ABSENCE LAYER ([ARCH-STACK] step 4, design §1–§4) ----------------
   An absence is ONE record — the Input. The war stores none: it READS the
   Inputs through a per-person index (absences.ts) and the store's merge. This
   replaces the two sync wires and their loop-breaker (runInbound /
   runOutbound / retractLwRow, all deleted): nothing is copied either way, so
   there is nothing to reconcile and nothing to disagree.

   Kept current by a per-person SIGNATURE over the war-visible Inputs, checked
   on every Raptor notify (design §4.1 — phase 8's notify always runs, command
   or not): a changed signature rebuilds that person's rows and repaints the
   war (no persist, no envelope). Unchanged persons keep their row objects, so
   the merge re-does only them. */
const SIGS = new Map<string, string>()
let INDEX: AbsenceIndex = new Map()

/** Rebuild the index for every person whose war-visible Inputs changed. True
 *  when anything did (the caller then repaints). */
export function refreshAbsences(force = false): boolean {
  const byPerson = new Map<string, WarInput[]>()
  /* one LINE a named person of each input ([ALL-AVAIL-AS-MEMBER] step 1 — engine/inputs.ts inputLines): the index is
     one man's absences, so a leave filed for three is three men's, and an input for ALL AVAIL is nobody's */
  for (const row of warLines(warInputs().filter(r => r && warCounts(r)))) {   // only the kinds the war shows are copied — this runs on every repaint
    if (!row || !warCounts(row) || !row.person) continue
    const p = String(row.person)
    const list = byPerson.get(p)
    if (list) list.push(row)
    else byPerson.set(p, [row])
  }
  const next: AbsenceIndex = new Map()
  let changed = force
  for (const [p, rows] of byPerson) {
    const sig = rows.map(absenceSignature).join('\n')
    const prev = INDEX.get(p)
    if (!force && prev && SIGS.get(p) === sig) { next.set(p, prev); continue }
    const one = buildAbsenceIndex(rows).get(p) ?? new Map()
    next.set(p, one)
    SIGS.set(p, sig)
    changed = true
  }
  for (const p of INDEX.keys()) if (!byPerson.has(p)) { SIGS.delete(p); changed = true }
  if (!changed) return false
  INDEX = next
  setAbsenceRows(INDEX)
  publishLeaveClashes()
  return true
}

/** Re-read the Inputs AND repaint the war when anything changed. Every door
 *  and the inputs gate refresh inside their command; the repaint must come
 *  from them, because the Raptor lane that runs afterwards then finds the index
 *  already current and would not bump the war (Fable inspection #1, 20 Sep 26).
 *  Deferred to the command's release when inside one, so no subscriber runs on
 *  a half-applied world. */
export function refreshAbsencesAndRepaint(): void {
  if (!refreshAbsences()) return
  /* one repaint per command: if the war notified on its own after this point
     (a door that also rewrote its records), that repaint already reads the
     fresh index — skip a second one */
  const at = getVersion()
  if (!cmdDeferEffect(() => { if (getVersion() === at) absencesChanged() })) absencesChanged()
}

/** THE ABSENCES A RESTORE WILL LEAVE ON A DAY (Astra's final code read, finding 1, 26 Sep 26) — for the war's check
 *  on what an Undo or Redo may put back (store.ts restoreBlocker). The Inputs as they will stand once this restore has
 *  run: every input it writes, at its after-image; every one it deletes, gone; the rest as they are. An absence the
 *  restore moves off the day, or takes away, is then no blocker, and one it keeps is judged at the hours it will
 *  have. Without Inputs changes, the day as it stands now. */
export function restoreAbsencesOf(changes: ReadonlyArray<{ collection: string; id: string; op: string; after?: unknown }>): (personId: string, date: string) => readonly Contrib[] {
  const ins = changes.filter(ch => ch.collection === 'inputs')
  if (!ins.length) return absencesAt
  const touched = new Set(ins.map(ch => String(ch.id)))
  const rows = warInputs().filter(r => r && !touched.has(String(r.iid)))
  /* (an inputs after-image is a stored input) */
  for (const ch of ins) if (ch.op !== 'delete' && ch.after && typeof ch.after === 'object') rows.push(ch.after as WarInput)
  const ix = buildAbsenceIndex(warLines(rows).filter(r => r && r.person && warCounts(r)))
  return (personId, date) => ix.get(personId)?.get(date) ?? []
}

/* WHICH WAR AN ABSENCE IS IN (the reshape walk's W2-F2, 22 Nov 26 — his D2243 Q6; the plan's A1; state/merge.ts AbsenceOwner).
   Only while each squadron has a war of its own (the world door): leave a war approved is that squadron's war's alone (the
   Input's `lwU`, written by `doorApprove`), so leave approved in 142's war before a man's move is not in 149's "until the
   Transfer batch carries it"; any other absence is in the war whose squadron he is on that day — his home that day, as the
   war's own door asks it (store.ts notThisWarsDay): a man with no squadron that day is never taken out. The token moves
   whenever the squadron rows are read afresh or another war is loaded. */
let OWN_ROWS: unknown = null, OWN_UNIT = '', OWN_N = 0
function absenceOwnerToken(): number {
  const rows = WORLD_DOOR ? unitRows() : null, unit = WORLD_DOOR ? worldUnit() : ''
  if (rows !== OWN_ROWS || unit !== OWN_UNIT) { OWN_ROWS = rows; OWN_UNIT = unit; OWN_N++ }
  return OWN_N
}
function absenceOwnerOf(pid: string): ((date: string, lwU: string | undefined) => boolean) | null {
  if (!WORLD_DOOR) return null
  const unit = worldUnit()
  const stints = homeStintsFor(pid, unit)
  const always = stints.length === 1 && stints[0]!.from === null && stints[0]!.to === null
  return (date, lwU) => {
    if (lwU) return lwU === unit
    if (always) return true
    const h = homeOn(pid, date)
    return !h || h === unit
  }
}
/* the squadron an approved leave of before the stamp is counted to — his home on every day of it, where that is one */
function unstampedUnit(x: WarInput): string | null {
  const who = String(leadOf(x) ?? '')
  const us = new Set(inputDates(x).map(d => homeOn(who, d)))
  const [one] = [...us]
  return us.size === 1 && one ? one : null
}

/** Install the absence door (wireLeaveWarSync does; tests call it alone). */
export function installAbsenceDoor(): void {
  setAbsenceDoor({ approve: doorApprove, decideApproved: doorDecideApproved, removeApproved: doorRemoveApproved, moveApproved: doorMoveApproved, file: doorFile, approveWhy, decideApprovedWhy, approvedBy })
  /* who a request's "placed by" / "decided by" names (M4 8.6): the person the running command acts for, as an Input's stamp */
  setActorLookup(stampWho)
  /* THE OPEN DAYS JOIN THE WAR'S PERMISSION (the red team's B8): the permissions module asks, of a member's war record
     (`war:person:date`), whether that day is open for HIM — the one rule (`canEditCell`), asked of the period holding
     the date, with a member's today (D1211). Read from the right: a war id may carry a colon. */
  /* WHICH SQUADRON'S WAR IS LOADED (perms.ts setLwUnitProbe — the second fix read, H2): a war record's id names no unit, so
     the gate asks here; only while each squadron has a world of its own (the world door, set at boot) */
  setLwUnitProbe(() => (WORLD_DOOR ? worldUnit() : null))
  /* WHAT A POSTING IS AS SAVED (perms.ts setLwPostingProbe — fix read 13, item B): the posting pass is judged against the
     war's stored profile row, never memory's copy, which a change outside every command rewrites in place */
  setLwPostingProbe(postOutIsSaved)
  /* A7 — A WAR TAKES A MAN'S DAY ONLY WHERE IT IS ITS SQUADRON'S (the reshape plan §6.2; his D2243 Q3), installed with A1 as
     one change: the war's own door asks his home on the day (store.ts notThisWarsDay — only while each squadron has a world
     of its own, as the unit probe above), and the gate's 7b backstop reads `(pid, day)` off a war cell's change
     (`lw.cell`, id `<war>:<pid>:<date>`, read from the right — a war id may carry a colon — as applyLwRecord reads it) */
  setWarHomeProbe((pid, iso) => (WORLD_DOOR ? homeOn(pid, iso) : null))
  setLwManDayProbe(warCellDay)
  /* …and the days a command adds to a war's approved leave, which is an Input (the fix read of the reshape — `warLeaveAdds`) */
  setLwLeaveAddsProbe(warLeaveAdds)
  /* …AND HOLDS A MAN'S ABSENCE ONLY WHERE IT IS ITS OWN (the reshape walk's W2-F2; D2243 Q6, A1 — state/merge.ts) */
  setAbsenceOwner({ token: absenceOwnerToken, of: absenceOwnerOf })
  /* A5 — ANOTHER SQUADRON'S POSTING AS THAT SQUADRON SAVED IT (perms.ts setLwxPostingProbe, step 7), installed with the pass
     over every squadron, and the pass's wake-up wiring */
  setLwxPostingProbe(foreignPostingSaved)
  hookForeignRun()
  /* WHAT A RESTORE'S FOLLOW-UP LINES MAY SAY (perms.ts setFollowUpsProbe — fix read 6, fault B): the one body that writes
     them, so the gate compares a "taken back" or "again" line with what this restore owes, field for field */
  setFollowUpsProbe((moved, dir, notices) => followUpsOwed(moved, dir, notices, hasRead))
  /* WHICH WAR LINES A COMMAND OWES (perms.ts setWarLinesOwed — fix read 10, fault A): worked out from its own changes */
  setWarLinesOwed((changes, n) => warLineCovered(warLinesOwed(changes), n))
  /* WHICH HOLIDAY LINES A COMMAND OWES (perms.ts setHolidayLinesOwed — fix read 11, fault C): from its own war changes */
  setHolidayLinesOwed((changes, n) => holidayLineCovered(holidayLinesOwed(changes), n))
  setLwDayOpenProbe((cellId: string) => {
    const iDate = cellId.lastIndexOf(':')
    if (iDate < 0) return true
    const date = cellId.slice(iDate + 1)
    return canEditCell(warHolding(getState().wars, date)?.period ?? null, 'member', date, memberToday())
  })
  /* M5a — A MEMBER'S TYPED FIGURE (perms.ts setLwBalanceProbe): the lock as it stands when his change is saved, the
     app's today, and whether his snapshot is the one the store builds from his approved leave now; and who a man with
     no row on the war is, so his figures read his seat (the pilots' 15-day run — the spec §4) */
  setLwBalanceProbe({
    locked: () => balancesLocked(),
    today: () => memberToday(),
    sameSnap: (snap, pid, kind) => isBalKind(kind) && sameSnapshot(snap as SnapEntry[], snapshotNow(pid, kind)),
    wellFormed: (row, kind) => readTypedBalShape(row, kind) !== null,
  })
  setHiddenIdentityLookup(id => hiddenIdentity(id))
  /* a refused war gesture rolled INPUTS back; the absence index was refreshed
     inside it, so re-read it before the repaint (Codex AS4-R2-001) */
  setRefusalHook(() => { refreshAbsences(true) })
  installInputGate()
  setPublishGate(publishFlagsBids)
  /* which days of an input ask the OIL question, for the check on a filer's answers (state/perms.ts - D660) */
  setOilPlan(oilAskPlan)
  /* [OIL-ASK-NOTIFY]: a working day made a holiday tells the schedulers and opens the one list (tellHoliday, below);
     and the bell's holiday line asks how many inputs are still left to answer (state/notices.ts) */
  setHolidayTell(tellHoliday)
  /* M4 batch 9: a decision on a man's leave, and bidding opened or closed, tell the bell (tellWar, below) */
  setDecisionTell({ leave: warLeaveNow, decisions: tellWar, openings: tellBidding })
  /* (and the admins' line for a posting with nothing to run — postedLines, [POSTOUT-RUN-NOTICE]) */
  setDerivedNotices(pid => [...endedLines(pid), ...postedLines(pid)])
  setHolidayLeft(holidayLeft)
  setHolidaySpan(holidaySpan)
  /* WHICH DAYS CAN EARN OIL AT ALL — the schedule's blind-desk warning asks
     this before it speaks, and only Leave War can answer for a public holiday
     (the engine covers Saturday and Sunday from the day's own name). One
     predicate, the same `isNonWorkingISO` the credit itself is drawn from, so
     the warning and the OIL can never disagree about which days count. */
  HOOKS.oilEarningDay = (di: number) => {
    const iso = labelToISO(DATES[di])
    /* the schedule in view is the unit in view's — its days off are that squadron's (nonWorkingFor, above; the loaded
       war's own answer whenever the two are one squadron, as they are for everyone until step 5's schedules menu) */
    return !!iso && nonWorkingFor(UNIT, iso)
  }
  /* the other two facts the OIL evidence block needs from out here: the day's
     real date, and who an ALL / ALL AVAIL puck stands for ([ALL-AVAIL-REDEF]).
     Same seam, same reason — the engine cannot ask a war anything. */
  HOOKS.oilDayISO = (di: number) => labelToISO(DATES[di]) || ''
  HOOKS.oilSentinel = (iso: string, win: [number, number], day: Day) => availableFor(iso, win, day)
  /* WHICH YEAR'S PERIOD IS MISSING (owner's ruling D19, 22 Sep 26). A weekend
     COUNTS as a day that earns whether or not a war holds it — that is the
     calendar, and the predicate above says so. But the credit can only be
     written into a war that DOES hold the date (`creditFrom`'s own first
     line), so a day outside every period promised a full day of OIL that
     nobody could ever be paid, and said nothing about it. The year is the
     war's fact, not the engine's, so it is handed over already named. */
  HOOKS.oilNoPeriod = (di: number) => {
    const iso = labelToISO(DATES[di])
    if (!iso || !isNonWorkingISO(iso)) return ''
    return warHolding(getState().wars, iso) ? '' : iso.slice(0, 4)
  }
}

/** CREATE THE MISSING PERIOD, from the schedule — the way out the day offers
 *  beside the reason (owner's ruling D19, 22 Sep 26: "indicate that the leave
 *  war period doesn't exist, create it").
 *
 *  A whole calendar year, named for it, with NOTHING OPEN (D1177): opening
 *  dates for bidding is the admin's own act taken when the schedule firms up —
 *  so it is never done from a schedule screen. The scheduler is handed to the
 *  Leave War afterwards to open dates in the "Open for bidding" window, which
 *  is his half of the job.
 *
 *  Refusals come straight back from the store, which is where they belong: a
 *  member gets 'forbidden', and a year another war already reaches gets
 *  'overlap' rather than a second war over the same dates — a date in two wars
 *  would let one man hold leave on it twice. */
export function createOilPeriodFor(year: string): string {
  const y = String(year || '').trim()
  if (!/^\d{4}$/.test(y)) return 'backwards'
  return createWar(y, `${y}-01-01`, `${y}-12-31`)
}
/* THE LEAVE WAR SHOWS THE PERIOD JUST MADE (M1's walk, A-F3): the schedule's "Create the period" brought the Leave War to
   the front on the period it was showing, while its note said to open the new one's dates "here". The Leave War's own
   "new period" goes straight to the period it made (owner, 2 Sep 26 — WarSheet); this is the same for the schedule's. */
export function showPeriodOf(iso: string): void {
  const war = warHolding(getState().wars, iso) as MergedWar | undefined
  if (war) selectWar(war.period.id)
}
/** Re-read the Inputs into the war now and repaint — what a Raptor notify
 *  does in the app; tests that push INPUTS directly call it. */
export function syncAbsences(): void {
  refreshAbsences(true)
  absencesChanged()
}

/* The Raptor leave INPUT behind a war cell — what the remarks
   editor edits (owner, 27 Aug 26). The day view knows exactly which Inputs make
   the cell (their iids), so this is a lookup, not a guess: the tapped half's
   contributor when the code names one, else the main one. */
export function leaveInputAt(personId: string, iso: string, code?: string): WarInput | null {
  const war = warHolding(getState().wars, iso) as MergedWar | undefined
  const v = war ? war.views?.[personId]?.[iso] : null
  if (!v) return null
  const leaves = (v.all as Contrib[]).filter(c => c.kind === 'absence' && isLeave(INPUT_TYPE_FOR[c.code] ?? c.code))
  if (!leaves.length) return null
  const cell = code ? parseCell(code) : null
  const pick = (cell && leaves.find(c => c.code === cell.type && portionOf(c.win) === cell.portion))
    ?? (cell && leaves.find(c => c.code === cell.type))
    ?? (cell ? null : leaves[0])
  if (!pick) return null
  return warInputs().find(r => String(r.iid) === pick.id) ?? null
}
/** EVERY Raptor leave input behind a war cell — a morning and an afternoon are two entries on the Inputs page — each
 *  once (the drag window's typed words go onto every one of them: his D1341 "Replace them all"; the night's scenario
 *  designer, gap 5, 25 Oct 26 — `leaveInputAt` alone gave the first found). */
export function leaveInputsAt(personId: string, iso: string): WarInput[] {
  const war = warHolding(getState().wars, iso) as MergedWar | undefined
  const v = war ? war.views?.[personId]?.[iso] : null
  if (!v) return []
  const ids = [...new Set((v.all as Contrib[]).filter(c => c.kind === 'absence' && isLeave(INPUT_TYPE_FOR[c.code] ?? c.code)).map(c => String(c.id)))]
  return ids.map(id => warInputs().find(r => String(r.iid) === id)).filter((r): r is WarInput => !!r)
}
/** An input as it now stands, by its id — the record a window opened on, read afresh after a save (the one-row words of his
 *  own leave, the night's walk W1). Null where it is gone. */
export function inputById(iid: unknown): WarInput | null {
  return iid == null ? null : warInputs().find(r => String(r.iid) === String(iid)) ?? null
}
const INPUT_TYPE_FOR: Record<string, string> = { ATTB: 'ATT B', ATTC: 'ATT C' }

/* ---- THE ABSENCE DOOR: the war's changes to approved leave ---------------
   Every one runs INSIDE the war gesture that called it (store.ts `gesture` —
   one envelope, one undo step, all-or-nothing on save). Each writes the Input
   through the Raptor inputs door (writeInputsBatch, which joins the gesture)
   and the war's own records through the store, in the same command. */
const cmpISO = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/* The war's own Input writes (approve / un-approve / remove / move) manage the
   requests they touch themselves, so the inputs door's bid replacement (H1)
   stands aside for them; the invariant (B7) still applies. */
let DOOR = 0
export const inDoor = (): boolean => DOOR > 0

/** The Input a war door may act on for one item — it must BE that person's
 *  war-approved LEAVE covering that date (Codex AS4-R2-002/003): a stale or
 *  mismatched id, or an lw-tagged row an admin retyped to a medical / course /
 *  duty, is never moved, un-approved or deleted from the war. */
function warLeaveRow(it: { personId: string; date: string; iid: string }): WarInput | null {
  const row = warInputs().find(r => String(r.iid) === it.iid)
  if (!row || !row.lw || !isLeave(row.type)) return null
  /* (a war-approved leave is one person's — read through the record's own list) */
  if (String(onlyNamed(row) ?? '') !== it.personId || !inputDates(row).includes(it.date)) return null
  return row
}
/* the earliest "placed" of a run of requests, as the leave keeps it (`lwBy`, `lwAt` — M4 8.6); none where no request of
   the run carries one (a request saved before M4) */
function placerOf(recs: ReadonlyArray<{ placedBy?: string; placedAt?: number }>): { lwBy?: string; lwAt?: number } {
  const first = recs.filter(r => typeof r.placedAt === 'number').sort((a, b) => a.placedAt! - b.placedAt!)[0]
  return first ? { ...(first.placedBy ? { lwBy: first.placedBy } : {}), lwAt: first.placedAt } : {}
}
/* the app's generic refusal, for a change a day now another squadron's refuses that no ruling gives words for (store.ts) */
const NOT_SAVED = 'This change could not be saved.'
function doorWrite(fn: () => void): boolean {
  DOOR++
  try { return writeInputsBatch(fn) } finally { DOOR-- }
}

/* WHY `doorApprove` WOULD SKIP ONE ITEM — the one body the door and Approvals' writer ask (M4 8.3: every line is checked
   before anything is written, so an inner refusal never sinks Approve all). The locked week; then the preflight — the
   would-be absence against every absence already there (a different leave on the same time, a medical) — skipped and
   reported, nothing consumed. */
const lockedDates = (): Set<string> => new Set(protectedDates().map(d => labelToISO(d)).filter(Boolean) as string[])
/* IS HE A DELETED MAN — the war's `gone` mark, OR the app's own delete mark ([LW-DELETED-NO-ROW-APPROVE], 30 Oct 26). A man
   deleted before he ever arrived (his only stint still to come) keeps no row and no posting record on the war
   (store.ts forgetPersonFrom drops both), so `gone` never sees him — yet a pending bid of his on a day already past (an admin
   may bid there, D1211) stays behind, and Approvals still lists it (approvals.ts counts every pending line, roster or not):
   Approve wrote a leave input for a man deleted. The app's people (`PEOPLE[id].deleted`, D290 — set by Admin → Users and by a
   Delete posting alike) are the one record of a delete that outlives the war's row. Never "no row and no record": a SANS
   man with SANS off has neither and is no one deleted (the scenario list's S1-4). A Delete POSTING that has run falls to
   D1436's date rule below, as before (R3c-1) — its kept record still carries the outcome and `poDone`. */
const deletedMan = (personId: string): boolean => postedOutBy(personId) === 'gone' || !!rosterBody(personId)?.deleted
/** IS EVERY PENDING BID OF HIS REFUSED — a man deleted, but not by a Delete POSTING that has run (that falls to D1436's date
 *  rule — R3c-1: his kept record carries the outcome and `poDone`). The ONE body the live door (`approveWhy`) and the
 *  restore refusal (state/person-delete.ts deletedRestoreProblem) ask, so Undo and Redo never disagree with Approve (the
 *  blind code read of 14403cf57, finding 2). */
export function refusedWhole(personId: string): boolean {
  const kept = getState().postOuts[personId] || getState().people.find(p => p.id === personId)
  return deletedMan(personId) && !(kept && outcomeOf(kept) === 'delete' && kept.poDone)
}
/** FROM WHICH DAY A DELETED MAN'S LEAVE IS REFUSED — '' every day (refused whole), a date for a Delete POSTING that has run (the
 *  first day the war draws him posted out — `postingOutFrom`, the day `postingOutWhy` refuses from), null for a man not deleted.
 *  The restore refusal reads it (state/person-delete.ts deletedRestoreProblem): a posting dated before the day it ran deletes
 *  him only from the run day (person-delete.ts deleteCutoff), so his days between the two keep their records, and the live
 *  door refuses them; Undo and Redo refuse them too (the narrow read of fdc66f528, finding 1). */
export function refusedFrom(personId: string): string | null {
  if (refusedWhole(personId)) return ''
  return deletedMan(personId) ? postingOutFrom(personId) : null
}
function approveWhy(it: { personId: string; date: string; recId: string }, prot: Set<string> = lockedDates()): string | null {
  const war = warHolding(rawState().wars, it.date)
  const rec = war ? recsAt(war.recs, it.personId, it.date).find((r): r is RequestRec => r.kind === 'request' && r.id === it.recId) : undefined
  if (!war || !rec) return 'No longer there'
  /* A DAY NOW ANOTHER SQUADRON'S (the reshape walk's W2-F3; his D2243 Q3 — nobody puts his leave into his old squadron's
     war for a day after his move): a bid left there from before the move was saved is not approved, in every door that asks
     this — Approvals, Approve all, the day's list, the bid windows, Auto-approve — in the ruled sentence */
  const other = warDayWhy(it.personId, it.date)
  if (other) return other
  /* A DELETED MAN (the host's decision, 28 Oct 26 — the fixes' round 3, R3-6): D1436 speaks only of posting out, so the
     refusal the code had before M4 for a man deleted from the squadron stands, pending his word: a pending bid left from
     before his delete is not approved, in every door, with the words it had.
     …A MAN DELETED ON ADMIN → USERS ONLY (round 3c, R3c-1 — the third blind read's 1): a posting out with the "Delete"
     outcome marks him gone too once it has run, and a Delete posting IS a posting out — so it falls to D1436's one date
     rule below (his days before the date approve), never to this whole refusal. The kept record carries the posting's
     outcome and `poDone` (store.ts markPostingDone; the kept row spreads the record's window). */
  if (refusedWhole(it.personId)) return 'Posted out — refuse or delete it'
  if (prot.has(it.date)) return `${shortDate(it.date)} is on a locked week — not approved`
  const po = postingOutWhy(it.personId, it.date)
  if (po) return po
  return heldWhy(it.personId, it.date, rec)
}
/* WHAT HOLDS A BID'S TIME, NAMED (his D1544, 31 Oct 26 — [LW-OFFER-ONLY-TAKEABLE]): a refused bid with a medical or leave filed
   over its day since used to say only "already holds leave or a medical at that time". The one refusal of that kind now
   names the holder as the grid's box writes it (a half with its AM or PM — D1525): "OML holds 11 Nov, so the bid can't be
   approved" (the agent's draft, the app's own codes). The same sentence greys the windows' Approve and is its title
   (`bidHeldWhy`), so the button and every door that asks the war's approve rule — Approvals, Approve all, the day's list, the
   bid windows, Auto-approve — say one thing. */
function heldWhy(personId: string, date: string, rec: RequestRec): string | null {
  const c: Contrib = { id: 'new', kind: 'absence', code: parseCell(rec.code)!.type, win: requestWin(rec.code) }
  const o = absencesAt(personId, date).find(x => barsWrite(c, x))
  return o ? `${codeInWords(notationOf(o.code, o.win))} holds ${dayMon(date)}, so the bid can’t be approved` : null
}
/** Why this bid cannot be approved because a medical or leave already holds its time — null where nothing holds it (his D1544:
 *  the windows grey its Approve while this answers). Only that one reason: a locked week or a posting is said on the press. */
export function bidHeldWhy(personId: string, date: string, recId: string): string | null {
  const war = warHolding(rawState().wars, date)
  const rec = war ? recsAt(war.recs, personId, date).find((r): r is RequestRec => r.kind === 'request' && r.id === recId) : undefined
  /* (…and a day now another squadron's, in the ruled sentence — W2-F3: the day's list greys its Approve with it) */
  return rec ? warDayWhy(personId, date) ?? heldWhy(personId, date, rec) : null
}
/* REPLACED 31 Oct 26 BY HIS D1541 (see `postingOutWhy` below): the posting date now refuses no leave, but a Delete posting's,
   so read what follows as the history of the date rule that a Delete posting still keeps.
   His D1436 (27 Oct 26, "all as recommended", question 16): leave on a day from his posting-out date on is not approved,
   even before the posting has run — the Approvals list and the bid windows alike, since both ask `approveWhy`; a posting
   out as SANS keeps his leave (D283). The record's own dates are read, as `postingPendingTag` reads them.
   ONE DATE RULE, WHETHER THE POSTING HAS RUN OR NOT (the fixes' round 2 — the host's reading of D1436's full row, 28 Oct 26:
   "a request with no such day approves as ever"). The older B12 rule — a man whose posting had run, every request of his
   refused ("Posted out — refuse or delete it"), his months before the posting too — went: once the posting has run (a
   Delete posting included) his days from the date are refused as before it, the words in the past tense, and his days
   before it approve — a man DELETED on Admin → Users is refused whole by `approveWhy`'s own check above (R3-6, R3c-1,
   pending his word). */
/* the first day his posting refuses — the day after his last in the squadron; none for a SANS posting (D283) or none at all */
function postingOutFrom(personId: string): string | null {
  const w = getState().postOuts[personId] || getState().people.find(p => p.id === personId)
  if (!w || !w.to || outcomeOf(w) === 'sans') return null
  return addDays(w.to, 1)
}
/* HIS D1541 (31 Oct 26 — replacing D1436): the posting date refuses no leave — "he just needs to inform the superior on his
   own. The next sqn can still reject it" — so a posting out as Overseas Sqn, Transfer or with no outcome approves his days
   from the date in every door that asks this (Approvals, the day's list, the bid windows, Auto-approve), and Undo / Redo
   agree by having nothing to refuse. Only a posting with the Delete outcome keeps the refusal from its date: he leaves flying
   for good (D287) and has no next squadron — D1541's reading 1, confirmed by his D1545 (31 Oct 26). */
function postingOutWhy(personId: string, date: string): string | null {
  const w = getState().postOuts[personId] || getState().people.find(p => p.id === personId)
  if (!w || outcomeOf(w) !== 'delete') return null
  const from = postingOutFrom(personId)
  if (!from || date < from) return null
  const on = dayMon(from)
  return postedOutBy(personId) ? `He posted out on ${on}: refuse or delete it` : `He posts out on ${on}: refuse or delete it`
}
/** FROM WHICH DAY A DELETE POSTING REFUSES HIS LEAVE, FOR A MAN NOT YET DELETED ([LW-DELETE-POSTING-RESTORE], 1 Nov 26): the
 *  day the live door refuses from (`postingOutWhy` — his D1545: a posting out with the Delete outcome keeps refusing his
 *  leave from its date), so Undo and Redo never put back an approval Approve now refuses (D754). Null for every other
 *  posting, which refuses nothing (D1541), where none is set, and for a man deleted — once the Delete posting has run, his
 *  refusal is `refusedFrom`'s, decided once and kept (a delete is final). A posting can move, be taken back or change its
 *  outcome, so the restore check that reads this (state/person-delete.ts postingRestoreProblem) is asked fresh on every Undo
 *  and Redo. (Built first for every posting as [LW-POSTED-OUT-RESTORE], 057ca75ab, reverted when D1541 took that refusal
 *  away; its one kept case is the Delete posting's.) */
export function postingRefusedFrom(personId: string): string | null {
  if (deletedMan(personId)) return null
  const w = getState().postOuts[personId] || getState().people.find(p => p.id === personId)
  return w && outcomeOf(w) === 'delete' ? postingOutFrom(personId) : null
}
/** the men a posting out may refuse: every man on the war with a posting window, and every posting record kept */
export function postingOutIds(): string[] {
  const s = getState()
  return [...new Set([...s.people.filter(p => !!p.to).map(p => p.id), ...Object.keys(s.postOuts)])]
}
/** the restore's refusal, in the live door's terms (`postingOutWhy` — "He posts out on 18 Jul: refuse or delete it") */
export function postingRestoreWhy(personId: string, dir: 'undo' | 'redo'): string | null {
  const from = postingRefusedFrom(personId)
  if (!from) return null
  const cs = rosterCallsign(personId) ?? getState().people.find(p => p.id === personId)?.callsign ?? personId
  return `Can’t ${dir} that — ${cs} ${postedOutBy(personId) ? 'posted' : 'posts'} out on ${dayMon(from)}, so leave from that day can’t be approved`
}
/* WHY `doorDecideApproved` WOULD SKIP ONE ITEM (the same one body, M4 8.3) */
function decideApprovedWhy(it: { personId: string; date: string; iid: string }, prot: Set<string> = lockedDates()): string | null {
  const row = warLeaveRow(it)
  if (!row) return 'No longer there'
  /* A DAY NOW ANOTHER SQUADRON'S (the fix read of the reshape — opus-3 F3; A7, his D2243 Q3): sending approved leave back
     to a request there writes a new request into this war, which its door refuses — after the leave had been cut from its
     Input, so the leave went and no bid came. Refused before anything is cut, in the app's generic words (no ruling gives
     others; store.ts decideWhy says the same of its own doors). Delete is the way out, and is never refused. */
  if (warDayWhy(it.personId, it.date)) return NOT_SAVED
  if (prot.has(it.date) || inputProtected(row)) return `${shortDate(it.date)} is on a locked week — not changed`
  const contrib = absencesAt(it.personId, it.date).find(c => c.id === it.iid)
  if (!contrib || !warHolding(rawState().wars, it.date)) return 'No longer there'
  const list = recsAt(warHolding(rawState().wars, it.date)!.recs, it.personId, it.date)
  /* design §24.1 (Codex AS4-002): un-approving never overwrites or sits beside a request already stored on that time —
     pending, acknowledged OR a refused one kept as history — for every destination state */
  const blocking = list.filter((r): r is RequestRec => r.kind === 'request' && overlaps(requestWin(r.code), contrib.win))
  if (blocking.length) return `${blocking[0]!.code} request on ${shortDate(it.date)} — decide or clear it before changing the ${contrib.code}`
  return null
}
/* who approved a war-approved leave — its Input's placer (D629), by callsign */
function approvedBy(iid: string): string | null {
  const row = warInputs().find(r => String(r.iid) === iid)
  const p = row && row.by != null ? rosterBody(String(row.by)) : null
  return p && p.cs ? String(p.cs) : null
}

/** approve: requests → Inputs (design §5.2 `lw.approve`, §18 OA3-002). Groups
 *  each person's selected requests into runs of consecutive days with the same
 *  code and the same carried remark; one Input per run; the requests go. */
function doorApprove(items: Array<{ personId: string; date: string; recId: string }>): { done: number; skipped: number; why: string[]; whyOf: Array<{ personId: string; why: string }> } {
  const why: string[] = []
  /* …and whose each reason is, so a window over several men names each (the fixes' round 3, R3-4) */
  const whyOf: Array<{ personId: string; why: string }> = []
  const prot = new Set(protectedDates().map(d => labelToISO(d)).filter(Boolean) as string[])
  type Pick = { personId: string; date: string; rec: RequestRec; warId: string }
  const picks: Pick[] = []
  let skipped = 0
  for (const it of items) {
    const war = warHolding(rawState().wars, it.date)
    const rec = war ? recsAt(war.recs, it.personId, it.date).find((r): r is RequestRec => r.kind === 'request' && r.id === it.recId) : undefined
    if (!war || !rec) { skipped++; continue }
    const bad = approveWhy(it, prot)
    if (bad) { skipped++; why.push(bad); whyOf.push({ personId: it.personId, why: bad }); continue }
    /* a bid left standing when work was later credited. Owner Q5 and §26.3
       used to SKIP that day at approval; reversed 20 Sep 26 — recorded work no
       longer stops an approval: the leave is granted, the day is flagged, and
       a human resolves it. */
    picks.push({ ...it, rec, warId: war.period.id })
  }
  if (!picks.length) return { done: 0, skipped, why, whyOf }
  /* runs: same person, war, code, remark, till tick and documents (M3 7.2 — one leave holds one of each), consecutive dates */
  picks.sort((a, b) => cmpISO(a.personId, b.personId) || cmpISO(a.date, b.date))
  const runs: Pick[][] = []
  for (const p of picks) {
    const last = runs[runs.length - 1]
    const prev = last?.[last.length - 1]
    if (prev && prev.personId === p.personId && prev.warId === p.warId && prev.rec.code === p.rec.code &&
      (prev.rec.remarks ?? '') === (p.rec.remarks ?? '') && prev.rec.till === p.rec.till &&
      (prev.rec.docIds ?? []).join('|') === (p.rec.docIds ?? []).join('|') && addDays(prev.date, 1) === p.date) last!.push(p)
    else runs.push([p])
  }
  const rows = runs.map(run => {
    const first = run[0]!, last = run[run.length - 1]!
    const moved: Record<string, string> = {}
    for (const p of run) {
      if (p.rec.shiftedFrom) moved[p.date] = p.rec.shiftedFrom
      for (const [d, f] of Object.entries(p.rec.carried?.lwMoved ?? {})) if (d === p.date) moved[d] = f
    }
    const row = inputRowFor({
      person: first.personId, code: first.rec.code, from: first.date, to: last.date, lw: first.warId,
      /* the request's own words only — its "till <last day>" is printed from its dates (owner D948) */
      remarks: remarksTyped(first.rec.remarks ?? '', { start: first.date, end: last.date }),
      lwMoved: moved, mod: nowStamp(),
    })
    /* ITS TILL TICK AND ITS DOCUMENTS GO WITH IT (owner D1226, D1150; M3 7.2): the Inputs page shows the leave as the
       request said — a tick kept only where it differs from the leave's default (D953), the papers as the input's own */
    if (typeof first.rec.till === 'boolean' && first.rec.till !== tillDefault(row)) row.till = first.rec.till
    if (first.rec.docIds?.length) Object.assign(row, docFields(first.rec.docIds))
    /* WHO PLACED THE REQUEST, KEPT ON THE LEAVE (M4 8.6): the Input's own `by` / `at` name the APPROVER (below), so the
       request's placer rides beside them — the earliest of the run's — and a put-back gives them back to the request */
    Object.assign(row, placerOf(run.map(p => p.rec)))
    /* WHOSE WAR APPROVED IT (W2-F2 — his D2243 Q6): kept on the leave where each squadron has a war of its own, so it
       stays this war's after he moves (absenceOwnerOf, above) */
    if (WORLD_DOOR) row.lwU = worldUnit()
    inpId(row)
    /* placed by whoever approved it, now (D629 — state/inputstamp.ts) */
    stampPlaced(row)
    /* …and written with its list, as every input is since the one-rule build: a leave the war approves is an input of
       one person (the plan §4.6) */
    return toPeople(row)
  })
  let ok = false
  doorWrite(() => {
    for (const r of rows) {
      /* approving next to leave already approved in the same war, of the same
         type and part of the day, EXTENDS that Input (design §1: "creates (or
         extends) an Input") — a day-by-day approval stays one record */
      const start = labelToISO(r.date, r.yr)!, end = r.endDate ? labelToISO(r.endDate, r.yr)! : start
      /* …and only when the remark (without its date tail) matches, so an
         extension never swallows the run's own carried remark (Fable #7) */
      const body = (x: WarInput) => remarksTyped(x.remarks, x)
      const same = (x: WarInput) => x !== r && idsOf(x).length === 1 && String(leadOf(x)) === String(leadOf(r)) && x.lw === r.lw && x.type === r.type &&
        !!x.allday === !!r.allday && (x.half ?? '') === (r.half ?? '') && body(x) === body(r) &&
        /* …and only leave of the SAME squadron's war (W2-F2): 149's approval never joins leave 142's war approved */
        (!r.lwU || (x.lwU ?? unstampedUnit(x)) === r.lwU) &&
        /* a request that carries its own till choice (M3 7.2) joins only a leave that shows the same; one with none takes
           its neighbour's, as before (D953) */
        (typeof r.till !== 'boolean' || tillShown(x) === r.till)
      const before = warInputs().find(x => same(x) && addDays(inputDates(x).slice(-1)[0] ?? '', 1) === start)
      /* …and a day that would BRIDGE a leave whose till date is unticked and one whose is not joins the one before only:
         one record holds one tick, so a bridge would drop one of the two choices (owner D953 — the scenario designer's 8,
         17 Oct 26). An extension of either alone keeps its choice — the dates still run more than a day. */
      const after0 = warInputs().find(x => same(x) && inputDates(x)[0] === addDays(end, 1))
      const after = after0 && before && tillShown(after0) !== tillShown(before) ? undefined : after0
      if (!before && !after) { warInputs().push(r); continue }
      const from = before ? inputDates(before)[0]! : start
      const to = after ? inputDates(after).slice(-1)[0]! : end
      const keep = (before ?? after)!   // (one of the two is there: neither was handled just above)
      const merged = sliceInput({ ...keep, lwMoved: { ...(before?.lwMoved ?? {}), ...(r.lwMoved ?? {}), ...(after?.lwMoved ?? {}) } }, from, to, true)
      merged.remarks = remarksTyped(keep.remarks, keep)
      if (r.lwU) merged.lwU = r.lwU
      /* …the papers of every piece it joins (M3 7.2): none is lost to a join */
      const papers = [...new Set([...rowDocIds(keep), ...rowDocIds(r), ...(before && after ? rowDocIds(after) : [])])]
      delete merged.docId; delete merged.docIds
      Object.assign(merged, docFields(papers))
      merged.mod = nowStamp()
      /* …and the earliest placer of what it joins (M4 8.6) */
      Object.assign(merged, placerOf([keep, r, ...(before && after ? [after] : [])].map(x => ({ placedBy: x.lwBy, placedAt: x.lwAt }))))
      /* an approval that EXTENDS a leave is still an approval: placed by this approver, now (the plan §3.8) */
      stampPlaced(merged)
      warInputs().splice(warInputs().indexOf(keep), 1, merged)
      if (before && after) warInputs().splice(warInputs().indexOf(after), 1)
    }
    ok = true
  })
  if (!ok) return { done: 0, skipped: skipped + picks.length, why, whyOf }
  lwEditLists(picks.map(p => ({ personId: p.personId, date: p.date, drop: [p.rec.id], add: [] })))
  refreshAbsencesAndRepaint()
  return { done: picks.length, skipped, why, whyOf }
}

/** FILED STRAIGHT (round 2 — his D1318, D1324; `store.ts fileStraight`): a course, an overseas duty or — since his D1365 —
 *  an Other written as the Inputs they are — one input a man a run of consecutive days, a course and an overseas duty whole
 *  days (neither has halves on the Inputs page), an Other on the window's half and filed under the schedule's Unavailable
 *  list (`acc:'u'` — D1356, D1365, so it counts him out), the window's words and papers with it, placed by whoever filed
 *  it now (D629). No `lw`
 *  provenance: the war never changes these kinds (dayview OFF_WAR — design §5.4, owner §13 Q1), so once filed it is the
 *  Inputs page's, exactly as one filed there. The Inputs door's own rules run (a course or an OD never replaces a bid). */
/** THE PASSING NOTE OF A DUTY FILED WITH A DAY LEFT OUT — "1 day filed. 12 Feb already holds an OD — left as it is." (the bid
 *  window's course, overseas duty, Other and Attach buttons — ui/BidPicker.tsx fileDuty): the count, then the first reason
 *  the door gave, else that the days were not his to change. ONE FULL STOP (the second re-walk's I3): the door's reasons
 *  carry none, but the app's generic words do — "1 day filed. This change could not be saved.." */
export function dutyFiledNote(r: { done: number; skipped: number; why: readonly string[] }): string {
  const why = r.why[0] ?? `${r.skipped} day${r.skipped === 1 ? ' was' : 's were'} not yours to change`
  return `${r.done} day${r.done === 1 ? '' : 's'} filed. ${why}${why.endsWith('.') ? '' : '.'}`
}
function doorFile(items: Array<{ personId: string; date: string }>, code: string, words?: ReqWords): { done: number; skipped: number; why: string[] } {
  const why: string[] = []
  const prot = new Set(protectedDates().map(d => labelToISO(d)).filter(Boolean) as string[])
  let skipped = 0, awaySaid = false
  const picks: Array<{ personId: string; date: string }> = []
  for (const it of items) {
    if (prot.has(it.date)) { skipped++; why.push(`${shortDate(it.date)} is on a locked week — not filed`); continue }
    /* A DAY NOW ANOTHER SQUADRON'S IS LEFT OUT (the fix read of the reshape — fable-3 F2 (c); A7, his D2243 Q3: this war
       takes nothing new of his there): a duty dragged across his move files its days still this squadron's — the run is
       split at the move — where the commit gate used to refuse the whole filing and the window closed as filed. Said in
       the app's generic words, once (no ruling gives others). */
    if (warDayWhy(it.personId, it.date)) { skipped++; if (!awaySaid) { awaySaid = true; why.push(NOT_SAVED) } continue }
    /* A DAY THAT ALREADY HOLDS THE SAME KIND FOR HIM is left as it is (round 2's FULL check — the scenario designer's G2): a
       range or a drag over an OD filed earlier made a second OD on that day, two inputs of one kind over one day. The days
       around it are filed; a run is split there, so nothing overlaps. */
    /* (an Other on a half: the same kind on a half it takes — the morning's beside an afternoon's is no duplicate) */
    const bare = code.replace(/\*/g, ''), half = code.startsWith('*') ? 'am' : code.endsWith('*') ? 'pm' : 'full'
    const takes = (w: [number, number]) => half === 'full' || (half === 'am' ? w[0] <= 720 : w[1] >= 721)
    if (absencesAt(it.personId, it.date).some(o => o.code === bare && takes(o.win as [number, number]))) {
      skipped++; why.push(`${shortDate(it.date)} already holds ${bare === 'OD' ? 'an OD' : bare === 'OTH' ? 'an Other' : bare === 'ATCH' ? 'an Attach' : `a ${bare}`} — left as it is`); continue
    }
    picks.push(it)
  }
  if (!picks.length) return { done: 0, skipped, why }
  picks.sort((a, b) => cmpISO(a.personId, b.personId) || cmpISO(a.date, b.date))
  const runs: Array<typeof picks> = []
  for (const p of picks) {
    const last = runs[runs.length - 1], prev = last?.[last.length - 1]
    if (prev && prev.personId === p.personId && addDays(prev.date, 1) === p.date) last!.push(p)
    else if (!(prev && prev.personId === p.personId && prev.date === p.date)) runs.push([p])
  }
  const rows = runs.map(run => {
    const first = run[0]!, last = run[run.length - 1]!
    const row = inputRowFor({ person: first.personId, code, from: first.date, to: last.date, remarks: remarksTyped(words?.remarks ?? '', { start: first.date, end: last.date }), mod: nowStamp() })
    if (typeof words?.till === 'boolean' && words.till !== tillDefault(row)) row.till = words.till
    if (words?.docIds?.length) Object.assign(row, docFields(words.docIds))
    /* filed where its kind lands: an Other straight under Unavailable (D1365); a course and an Attach too, by themselves
       (D1372, D1374 — an Attach from the war, D1378) */
    if (filingOf(row.type, 'u')) row.acc = 'u'
    inpId(row)
    stampPlaced(row)
    return toPeople(row)
  })
  if (!doorWrite(() => { for (const r of rows) warInputs().push(r) })) return { done: 0, skipped: skipped + picks.length, why }
  refreshAbsencesAndRepaint()
  askFiledOil(rows.map(r => String(r.iid)), picks[0]!.date, picks.reduce((m, p) => (p.date > m ? p.date : m), picks[0]!.date))
  return { done: picks.length, skipped, why }
}

/** THE OIL QUESTION OF WHAT WAS JUST FILED FROM THE WAR (round 2's FULL check — the scenario designer's G3): an OD or a
 *  course on a weekend or a holiday asks it at the save, as the Inputs page does — owner D804 ("asked … wherever it is
 *  filed"), D660 (the filer answers, at the save, so nobody is left to his own bell). One input: its own question, in its
 *  own window, over the war (the bell's way in — ui/topstate.ts openNotice). Several (a drag over several men): a scheduler gets the
 *  ONE list of those days (D782), never a window per man; anyone else — a member files one input, his own — the first.
 *  Raised once the filing has gone through (a deferred effect), never for one refused. */
function askFiledOil(iids: string[], from: string, to: string): void {
  const mine = new Set(iids)
  const open = oilOpenOn(from, to).filter(o => mine.has(o.iid))
  if (!open.length) return
  const raise = () => {
    if (open.length > 1 && canEditOwn()) {
      const days = open.flatMap(o => o.days).sort()
      setOilList({ from: days[0]!, to: days[days.length - 1]!, name: '', plain: true })
    } else {
      const row = warInputs().find(x => String(x.iid) === open[0]!.iid)
      if (!row) return
      setOilAsk(open[0]!.iid)
      setInpEdit(row)
    }
    raptorNotify()
  }
  if (!cmdDeferEffect(raise)) raise()
}

/* the dates an Input covers and a copy of it limited to [from, to] — the one
   split/shrink body (design §5.2 Splitting: the first part keeps the iid, a
   later part gets a fresh one carrying lw / remarks / docs / mod verbatim) */
export function sliceInput(row: WarInput, from: string, to: string, keepIid: boolean): WarInput {
  /* its own people, never the list it was cut from (engine/inputown.ts pieceOf) */
  const out: WarInput = pieceOf(row)
  const { date, yr } = isoToInputDate(from)
  out.date = date
  out.yr = yr
  const endIso = to
  if (endIso > from) {
    const e = isoToInputDate(endIso)
    out.endDate = e.yr === yr ? e.date : `${e.date} ${e.yr}`
  } else delete out.endDate
  if (row.lwMoved) {
    const m: Record<string, string> = {}
    for (const [d, f] of Object.entries(row.lwMoved as Record<string, string>)) if (d >= from && d <= to) m[d] = f
    if (Object.keys(m).length) out.lwMoved = m
    else delete out.lwMoved
  }
  /* ITS WORDS FOLLOW ITS DATES (the absence-record re-test, AB3, 26 Sep 26 — Fable F3, reproduced on screen). This
     body copied the remark verbatim, so a piece cut by a medical (the gate's sick-cuts-leave), un-approved, deleted or
     moved by the war kept "till 24 Jul" when it now ended on the 21st — on the Inputs page, the week and the board.
     (Since D948, 16 Oct 26, no cut writes a date into the remark: each piece prints its own from its dates.)
     Only a remark that CARRIES the token is touched, and the typist's other words stay where they are. D189: on a
     published day the piece still covers, the changed words are a change like any other. */
  /* (since D948, 16 Oct 26, the date is printed from the piece's own dates and never written in: a remark saved with
     one loses it here, its words kept) */
  if (row.remarks) out.remarks = remarksTyped(row.remarks, row)
  if (!keepIid) { delete out.iid; inpId(out) }
  /* WHO CUT OR MOVED IT, AND WHEN (D629 — state/inputstamp.ts). Every caller of this body is a change to the leave — a
     day un-approved, deleted or moved on the war, a medical cutting it (inputgate.ts) — and each piece is a copy of the
     record, so it keeps who PLACED that (`by`, `at`) and takes the change here. `mod` is carried as it was. */
  stampChanged(out)
  return out
}

/** Remove the given dates from the given Inputs — shrink, split or delete —
 *  in ONE Raptor batch. Returns the per-Input result for the callers. */
function cutDates(cuts: Map<string, Set<string>>): boolean {
  let ok = false
  doorWrite(() => {
    for (const [iid, drop] of cuts) {
      const ix = warInputs().findIndex(r => String(r.iid) === iid)
      if (ix < 0) continue
      const row = warInputs()[ix]
      const dates = inputDates(row)
      const keep: string[][] = []
      for (const d of dates) {
        if (drop.has(d)) { keep.push([]); continue }
        if (!keep.length || !keep[keep.length - 1]!.length) keep.push([d])
        else keep[keep.length - 1]!.push(d)
      }
      const parts = keep.filter(k => k.length)
      if (!parts.length) { warInputs().splice(ix, 1); continue }
      const pieces = parts.map((k, i) => sliceInput(row, k[0]!, k[k.length - 1]!, i === 0))
      warInputs().splice(ix, 1, ...pieces)
    }
    ok = true
  })
  return ok
}

/* THE REMARK A REQUEST CARRIES, AT THE LENGTH THE STORE'S READER KEEPS ([STORE-READER-SWEEP], [DB-READINESS] group A,
   phase 7 — engine/warrecs.ts readCarried cuts at MAX_CARRIED_REMARK). Approving writes the remark onto the leave WITH its
   date ("… on 18 Feb"), which can carry a 200-letter remark past the limit; stored whole, the record in memory and the
   record after a reload differed, the date cut mid-word. Over the limit, the date goes first — the next approval writes
   it again — and the typist's own words are kept up to the limit. (Since D948 nothing writes the date in.) */
function carriedRemark(text: unknown): string {
  const s = String(text ?? '')
  return s.length <= MAX_CARRIED_REMARK ? s : remarksTyped(s).slice(0, MAX_CARRIED_REMARK)
}

/** un-approve approved leave back into a request of `to` (design §5.2
 *  `lw.decideApproved`, §24): the Input shrinks / splits / goes on those dates,
 *  and a request carrying its remark and moved marks takes its place. Refused
 *  per date where a different request already sits on that time (§24.1). */
function doorDecideApproved(items: Array<{ personId: string; date: string; iid: string }>, to: RequestState): { done: number; skipped: number; why: string[]; whyOf: Array<{ personId: string; why: string }> } {
  const why: string[] = []
  /* …and whose each reason is, so a window over several men names each (the fixes' round 3, R3-4) */
  const whyOf: Array<{ personId: string; why: string }> = []
  let skipped = 0
  const cuts = new Map<string, Set<string>>()
  const adds: Array<{ personId: string; date: string; drop: string[]; add: WarRec[] }> = []
  const prot = new Set(protectedDates().map(d => labelToISO(d)).filter(Boolean) as string[])
  for (const it of items) {
    const row = warLeaveRow(it)
    const contrib = row ? absencesAt(it.personId, it.date).find(c => c.id === it.iid) : undefined
    if (!row || !contrib || !warHolding(rawState().wars, it.date)) { skipped++; continue }
    const bad = decideApprovedWhy(it, prot)
    if (bad) { skipped++; why.push(bad); whyOf.push({ personId: it.personId, why: bad }); continue }
    const code = notationOf(contrib.code, contrib.win)
    const rec: RequestRec = {
      id: newRecId(), kind: 'request', code, state: to,
      ...(row.lwMoved?.[it.date] ? { shiftedFrom: row.lwMoved[it.date] } : {}),
      ...(row.lwMoved?.[it.date] ? { carried: { lwMoved: { [it.date]: row.lwMoved[it.date] } } } : {}),
      /* a put-back carries the leave's words back to the request (M3 7.1 / 7.2, B9) */
      ...(row.remarks ? { remarks: carriedRemark(row.remarks) } : {}),
      ...(typeof row.till === 'boolean' ? { till: row.till } : {}),
      ...(rowDocIds(row).length ? { docIds: rowDocIds(row).slice(0, MAX_REQ_DOCS) } : {}),
      /* who placed the request it was, as recorded on the leave (M4 8.6); a refusal names who refused it, now */
      ...(typeof row.lwBy === 'string' && row.lwBy ? { placedBy: row.lwBy } : {}),
      ...(typeof row.lwAt === 'number' ? { placedAt: row.lwAt } : {}),
      ...(to === 'refused' ? { ...(stampWho() ? { decidedBy: stampWho() } : {}), decidedAt: Date.now() } : {}),
    }
    adds.push({ personId: it.personId, date: it.date, drop: [], add: [rec] })
    const set = cuts.get(it.iid) ?? new Set<string>()
    set.add(it.date)
    cuts.set(it.iid, set)
  }
  if (!adds.length) return { done: 0, skipped, why, whyOf }
  if (!cutDates(cuts)) return { done: 0, skipped: skipped + adds.length, why, whyOf }
  lwEditLists(adds)
  refreshAbsencesAndRepaint()
  return { done: adds.length, skipped, why, whyOf }
}

/** delete approved leave days (design §5.2 `lw.removeApproved` — a deliberate
 *  delete propagates and sticks, owner decision 2, 13 Sep 26). */
function doorRemoveApproved(items: Array<{ personId: string; date: string; iid: string }>): { done: number; skipped: number; why: string[] } {
  const cuts = new Map<string, Set<string>>()
  const why: string[] = []
  const prot = new Set(protectedDates().map(d => labelToISO(d)).filter(Boolean) as string[])
  let skipped = 0
  for (const it of items) {
    const row = warLeaveRow(it)
    if (!row) { skipped++; continue }
    if (prot.has(it.date) || inputProtected(row)) { skipped++; why.push(`${shortDate(it.date)} is on a locked week — not deleted`); continue }
    const set = cuts.get(it.iid) ?? new Set<string>()
    set.add(it.date)
    cuts.set(it.iid, set)
  }
  const n = items.length - skipped
  if (!n) return { done: 0, skipped, why }
  if (!cutDates(cuts)) return { done: 0, skipped: items.length, why }
  refreshAbsencesAndRepaint()
  return { done: n, skipped, why }
}

/** slide approved leave days by `delta` (design §5.2 `lw.moveApproved`, §17
 *  FB3-01). `check` = validate only (the store's moveProblem). The moved days
 *  are cut from their Input and re-filed as a new Input over the landing
 *  dates, carrying lw / remarks / docs / mod and the moved-from marks when
 *  `tracked` (the store passes it on every move since D1177: "the dotted moved
 *  mark shows on any move of a leave already approved"). */
/* `skip` (the final reads, Fable 3 / Astra 1, 27 Sep 26 — [LW-MOVE-STANDARD]): the ids of the war's own requests moving in
   the SAME move. At the preview they still stand on their old days, so a leave landing on the day a moving bid is leaving
   was refused though the result fits; leaving them out of the landing check makes the preview the move's own picture. The
   commit passes none: by then the requests have already left and landed, so the door judges the day as it will be. */
function doorMoveApproved(items: Array<{ personId: string; date: string; iid: string }>, delta: number, tracked: boolean, check: boolean, skip?: ReadonlySet<string>): { reason: 'occupied' | 'window' | 'nothing' | 'away'; at?: string } | null {
  const leaving = new Set(items.map(i => `${i.iid}|${i.date}`))
  const prot = new Set(protectedDates().map(d => labelToISO(d)).filter(Boolean) as string[])
  for (const it of items) {
    const row = warLeaveRow(it)
    if (!row) return { reason: 'nothing', at: it.date }
    const to = addDays(it.date, delta)
    if (!warHolding(rawState().wars, to)) return { reason: 'window', at: to }
    /* A LANDING DAY NOW ANOTHER SQUADRON'S (the fix read of the reshape — opus-3 F2, fable-3 F2, astra-3 F2; his D2243 Q3:
       nobody puts his leave into his old squadron's war for a day after his move): asked at the preview and at the commit,
       as Approve asks it (`approveWhy`) */
    if (warDayWhy(it.personId, to)) return { reason: 'away', at: to }
    /* a locked week at either end refuses before anything moves (AS4-R2-001) */
    if (prot.has(it.date) || prot.has(to) || inputProtected(row)) return { reason: 'window', at: prot.has(to) ? to : it.date }
    const contrib = absencesAt(it.personId, it.date).find(c => c.id === it.iid)
    if (!contrib) return { reason: 'nothing', at: it.date }
    const here = absencesAt(it.personId, to).filter(c => !leaving.has(`${c.id}|${to}`))
    const war = warHolding(rawState().wars, to)!
    const landing = recsAt(war.recs, it.personId, to).filter(r => !skip || !skip.has(r.id))
    const reqs = recContribs(landing)
    if ([...here, ...reqs].some(o => barsWrite({ ...contrib, id: 'moving' }, o))) return { reason: 'occupied', at: to }
    if (liveRequestsOn(landing, portionOf(contrib.win)).length) return { reason: 'occupied', at: to }
  }
  if (check) return null
  /* group per Input: cut the moved dates, re-file them shifted */
  const byIid = new Map<string, string[]>()
  for (const it of items) byIid.set(it.iid, [...(byIid.get(it.iid) ?? []), it.date])
  const cuts = new Map<string, Set<string>>()
  const refile: WarInput[] = []
  for (const [iid, dates] of byIid) {
    const row = warInputs().find(r => String(r.iid) === iid)!
    cuts.set(iid, new Set(dates))
    const sorted = [...dates].sort()
    let run: string[] = []
    const flush = () => {
      if (!run.length) return
      const from = addDays(run[0]!, delta), to = addDays(run[run.length - 1]!, delta)
      const moved: Record<string, string> = {}
      for (const d of run) {
        const origin = row.lwMoved?.[d] ?? d
        if (tracked) moved[addDays(d, delta)] = origin
      }
      const piece = sliceInput({ ...row, lwMoved: undefined }, from, to, false)
      if (Object.keys(moved).length) piece.lwMoved = moved
      else delete piece.lwMoved
      refile.push(piece)
      run = []
    }
    for (const d of sorted) { if (run.length && addDays(run[run.length - 1]!, 1) !== d) flush(); run.push(d) }
    flush()
  }
  let ok = false
  doorWrite(() => {
    /* cut first (same body as remove), then file the landings */
    for (const [iid, drop] of cuts) {
      const ix = warInputs().findIndex(r => String(r.iid) === iid)
      if (ix < 0) continue
      const row = warInputs()[ix]
      const parts: string[][] = []
      for (const d of inputDates(row)) {
        if (drop.has(d)) { parts.push([]); continue }
        if (!parts.length || !parts[parts.length - 1]!.length) parts.push([d])
        else parts[parts.length - 1]!.push(d)
      }
      const keep = parts.filter(k => k.length)
      warInputs().splice(ix, 1, ...keep.map((k, i) => sliceInput(row, k[0]!, k[k.length - 1]!, i === 0)))
    }
    for (const r of refile) warInputs().push(r)
    ok = true
  })
  if (ok) refreshAbsencesAndRepaint()
  return ok ? null : { reason: 'window' }
}

/* WHAT THE CLASH NOTE PRINTS for one side of the pair ([LW-HALF-DAY-WORDS-LEFT], 30 Oct 26): the code as the grid's box draws
   it — an OIL the app credited with its star after its code (D1306), a half day named in words, never the stored "*HO" /
   "LL*" (engine/codes.ts codeInWords). An HO keeps the half its work fell in, an FO none (the box draws an FO whole —
   MatrixRows placeOf). The stored notation stays on the clash too (`inputCode`, `bidCode`): it is what keys it. */
function clashCodeShown(c: Contrib): string {
  if (c.kind === 'credit') return codeInWords(c.code, !!c.auto, c.code === 'HO' ? (portionOf(c.win) === 'pm' ? 'pm' : 'am') : null)
  return codeInWords(notationOf(c.code, c.win))
}
function notationOf(code: string, win: readonly [number, number]): string {
  const p = portionOf(win)
  return p === 'am' ? `*${code}` : p === 'pm' ? `${code}*` : code
}

/* ---- the clash strip: DERIVED from the day views, never stored ------------
   (design §3.1, §19 OA4-003): every forbidden pair on any day of any war — a
   request over an absence, leave over worked time, two overlapping leaves, a
   medical on worked time — republished whenever the war's records or the
   index change, behind an equality guard so an unchanged list notifies
   nothing. */
function publishLeaveClashes(): void {
  const out: SyncClash[] = []
  for (const war of getState().wars) {
    for (const [person, row] of Object.entries(war.views ?? {})) {
      for (const [date, v] of Object.entries(row)) {
        for (const pair of v.conflicts as Array<[Contrib, Contrib]>) {
          /* the sentence reads "work earns X but the day holds Y", so when one
             side is a CREDIT it has to be the X — and which side that is
             depends only on the order the records happen to sit in on the day
             (state/merge.ts puts the war's own records before the absences).
             Order the pair here rather than letting the wording flip. */
          const [a, b] = clashPairOrder(pair)
          const duty = a.kind === 'credit' || b.kind === 'credit'
          const holders = duty ? [b] : [a, b]
          const wayOut = clashWayOut(holders)
          /* the leave filed on the Inputs page that is in the way — what "Change the leave on Inputs" opens (D827) — and, for
             leave the war approved, that leave's own input too: for a man with no row on the grid the note opens it there
             (his D1542 — the grid has no row to open his day on) */
          const filed = wayOut === 'inputs' ? holders.find(c => c.kind === 'absence' && !c.lw)
            : wayOut === 'war' ? holders.find(c => c.kind === 'absence' && !!c.lw) : undefined
          out.push({ person, date, inputCode: notationOf(a.code, a.win), bidCode: notationOf(b.code, b.win), inputShown: clashCodeShown(a), bidShown: clashCodeShown(b), ...(duty ? { kind: 'duty' as const } : {}),
            wayOut, war: String(war.period?.id ?? ''), ...(filed ? { iid: String(filed.id) } : {}),
            /* the bid's own record, whichever side of the pair it stands (the fixes' narrow read, its 1) — what the note's
               "Decide it in Approvals ›" rings (D1542): `bidCode` is the pair's SECOND side, the bid only against work */
            ...(() => { const req = [a, b].find(c => c.kind === 'request'); return req ? { reqId: String(req.id) } : {} })() })
        }
      }
    }
  }
  LEAVE_CLASHES = out
  publishClashes()
}

/* WHERE A CLASH CAN BE UNDONE ([ABSENCE-SMALL-SEEN] 1, 28 Sep 26 — the re-test's W6 N2: every line said "resolve on
   the sheet", but for leave filed on the Inputs page the day's sheet has no control; it says "Change it on the Inputs
   page"). The way out follows the record that is IN THE WAY — for a worked weekend, what the day already holds (the
   credit is the schedule's and nobody deletes it); for two leaves, the one a person can act on, a bid first: a bid is
   decided on the sheet; leave the war approved is changed on the sheet (sent back, moved or deleted) — at any time
   since the stages went (D1177; the "published" way out, "Step the war back to Bidding Closed", went with them — D827
   narrowed); leave filed on the Inputs page is changed there. */
/** The pair in the order its sentence reads it: a CREDIT first ("work earns X but the day holds Y"); otherwise leave the
 *  war APPROVED second, where the sentence puts "approved" ("The input is HL, but the bid is approved OL" — M1's code
 *  read, L5: for two absences the day's order is not fixed, so "approved" could land on the other leave). */
export function clashPairOrder(pair: readonly [Contrib, Contrib]): [Contrib, Contrib] {
  const [x, y] = pair
  if (y.kind === 'credit' && x.kind !== 'credit') return [y, x]
  if (x.kind === 'credit') return [x, y]
  const warOwn = (c: Contrib) => c.kind === 'absence' && !!c.lw
  if (warOwn(x) && !warOwn(y)) return [y, x]
  return [x, y]
}

function clashWayOut(holders: readonly Contrib[]): ClashWayOut {
  if (holders.some(c => c.kind === 'request')) return 'bid'
  if (holders.some(c => c.kind === 'absence' && c.lw)) return 'war'
  return 'inputs'
}

/* ---- the clash list's shape and its subscribers --------------------------- */

/** Where the admin undoes a clash — the words the strip prints after each line. */
export type ClashWayOut = 'bid' | 'war' | 'inputs'

/** A leave input asking for a date the squadron already bid differently on.
 *  The system never overwrites a bid — it raises the clash and a human
 *  decides (Leave War's rule); this list is that surface's data. */
/* a man's callsign as the roster has it — for a clash about a man with NO row on the war (a SANS man with Show SANS
   off, an archived man), whom the war's own roster cannot name; never his hidden id ([BATCH-14OCT-LEFTOVERS] (c)) */
export function rosterCallsign(id: string): string | null {
  const b = rosterBody(id)
  return b && b.cs ? String(b.cs) : null
}
/* …and whether he is a SANS man, for a man with no row on the war (a SANS man while SANS is off it — Approvals' LOWEST AVAIL
   says "SANS · not in Avail" for him, M4 8.2) */
export function rosterIsSans(id: string): boolean {
  const b = rosterBody(id)
  return !!(b && b.san)
}
export interface SyncClash {
  person: string
  date: string
  /** What the Raptor input asks for, in Leave War notation. */
  inputCode: string
  /** What the squadron already bid. */
  bidCode: string
  /** The two codes as the note PRINTS them — as the grid's box draws each (`clashCodeShown`); the codes above are the
   *  stored notation, which keys the clash and is never printed. */
  inputShown?: string
  bidShown?: string
  /** Absent for a leave clash; 'duty' when a published weekend/PH duty's OIL
   *  credit (wire 4) found the date already holding something else. */
  kind?: 'duty'
  /** Where it is undone (`clashWayOut`) — so the strip never sends him to a sheet with no control on it. */
  wayOut: ClashWayOut
  /** The leave period that holds the date — the list covers every period, and a tap on a clash must put ITS period on
   *  screen before it opens the day ([LW-CLASH-NOTE-PHONE], owner D827). */
  war: string
  /** The Input in the way, whose own window the tap opens: for `wayOut: 'inputs'`, and for `wayOut: 'war'` (leave the war
   *  approved) — opened only for a man with no row on the grid (his D1542); a man with a row has his day opened. */
  iid?: string
  /** A bid in the pair: its own record id (a request's contribution id is its record's) — the line Approvals rings (D1542). */
  reqId?: string
}

/* Re-derived on every pass, never persisted — a clash list is a view of two
   live records, and storing it would let it outlive either. Two passes
   contribute (inbound's leave clashes, the OIL pass's duty clashes), each
   replacing only its own half, so one pass running cannot blank the other's
   findings between its runs. */
let LEAVE_CLASHES: SyncClash[] = []
let CLASHES: SyncClash[] = []
let clashVersion = 0
const clashListeners = new Set<() => void>()

export function getClashes(): SyncClash[] {
  return CLASHES
}
export function getClashVersion(): number {
  return clashVersion
}
export function subscribeClashes(fn: () => void): () => void {
  clashListeners.add(fn)
  return () => void clashListeners.delete(fn)
}

function publishClashes(): void {
  const next = [...LEAVE_CLASHES]
  /* A clash that did not change must not repaint the strip: the passes run on
     every Raptor notify, and the common case is "still the same clashes". */
  if (JSON.stringify(next) === JSON.stringify(CLASHES)) return
  CLASHES = next
  clashVersion += 1
  for (const fn of clashListeners) fn()
}

/* ---- wire 4: published weekend/PH duty -> OIL credit --------------------- */

/* Whether Leave War calls this date non-working. The weekend needs no war at
   all; a public holiday is whatever the war holding the date says — its PH
   flag, or an event word typed on it whose type is tagged "off day" (the
   owner's own input path for holidays, seeded as `PH`). A date no war holds
   can still be a weekend, but never a holiday: there is nowhere to have
   filed one. EXPORTED since 28 Aug 26 — the input ask-flow (oilAskPlan
   below, the OilConfirm sheet, the bell's pending scan) all read the SAME
   answer, so "is this day applicable" can never fork. */
/* ---- EACH SQUADRON'S DAYS OFF ARE ITS OWN (his D2195, 18 Nov 26: "The holiday list shouldn't be shared. Individual sqns
   will own it" — the reshape plan §7, A4; it narrows D2160's shared list, which step 4 of batch 1 had built) -----------
   A public holiday, like an Off day, is its own squadron's: written into that squadron's war (the Holidays list, D638)
   and read from it alone, never laid onto another squadron's days, OIL or bell — even at one place. So:
   - the war a person opens reads only its own holidays (state/store.ts — the overlay that laid the place's on is gone);
   - `nonWorkingFor(unit, iso)` — THE one answer to "is this a day off for this squadron" (a weekend, or its own war's
     public holiday): the OIL earning day of the schedule in view (HOOKS.oilEarningDay, wired below) asks it for the
     unit in view, and every input's OIL question asks it for the squadron the input sits in that day (oilAskPlan);
   - `unitDayFacts(unit, iso)` — what that squadron's own war says the day is (public holiday, Off day, its name): the
     flying plan's answer for a squadron's page (flyAnswer) and the holiday line's span and name read it.
   Another squadron's war is read through its own door (setWarWorldDoor's, the boot's) — its periods only, never its
   records — and kept until a world is swapped or written (storedMoved). */
const STORED = new Map<string, { periods: Period[]; eventDefs: EventDef[] }>()
/* (how many times what is kept here has been dropped — a cached answer read from another squadron's war, such as how
   many inputs a holiday line still counts (holidayLeft), is keyed on it) */
let STORED_VER = 0
function storedMoved(): void { STORED.clear(); STORED_VER++; fxMoved() }
function storedWorld(unit: string): { periods: Period[]; eventDefs: EventDef[] } {
  const hit = STORED.get(unit)
  if (hit) return hit
  let out: { periods: Period[]; eventDefs: EventDef[] } = { periods: [], eventDefs: rawState().eventDefs }
  if (WORLD_DOOR) {
    try {
      const r = readStoredPeriods(WORLD_DOOR(unit).backend)
      out = { periods: r.periods, eventDefs: r.eventDefs ?? rawState().eventDefs }
    } catch { /* a door that will not read: no day of that squadron's reads as off but a weekend — never a guess */ }
  }
  STORED.set(unit, out)
  return out
}
/** WHAT A SQUADRON'S OWN WAR SAYS A DAY IS — a public holiday or an Off day, and its name and short form as that war
 *  writes them; nothing for a working day or a date no period of it holds. The loaded war answers for its own squadron
 *  (dayFacts); another squadron's is read from its door. */
export function unitDayFacts(unit: string, iso: string): { kind: 'ph' | 'off' | null; name: string; short: string } {
  if (!unit || unit === worldUnit()) { const f = dayFacts(iso); return { kind: f.kind, name: f.name, short: f.short } }
  const own = storedWorld(unit)
  const p = own.periods.find(x => x.start <= iso && iso <= x.end)
  const day = p ? dayIn(p, iso) : undefined
  const h = p && day ? holidayAt(own.eventDefs, day, p.bands) : null
  return { kind: h ? holidayKind(h.kind) : null, name: h ? h.name : '', short: h ? shortOf(own.eventDefs, h.name, h.short) : '' }
}
/** THE PUBLISHED DAYS OF A SQUADRON ON A RUN OF DATES — the loaded week's (when it is that squadron's schedule in view)
 *  and every stashed week of that squadron's (the OIL pass's own two sources, desiredOilCells), each a day whose
 *  publish state says it went out. A week never visited has published nothing, so these two are the whole session. */
export function publishedDaysOf(unit: string, from: string, to: string): string[] {
  const out = new Set<string>()
  if (!validIso(from) || !validIso(to) || to < from) return []
  if (unit === UNIT) {
    for (let di = 0; di < DAYS.length; di++) {
      const iso = labelToISO(DATES[di])
      if (iso && iso >= from && iso <= to && dayApproved(di)) out.add(iso)
    }
  }
  for (const v of stashUnitKeys(unit)) {
    if (unit === UNIT && String(v) === String(CURWEEK)) continue
    const wk = stashOilWeek(qualify(unit, String(v)))
    if (!wk) continue
    for (let di = 0; di < 7; di++) {
      const iso = weekDayISO(String(v), di)
      if (iso && iso >= from && iso <= to && (wk.sc.dayOK || {})[di]) out.add(iso)
    }
  }
  return [...out].sort()
}
/** WHAT A NEW PUBLIC HOLIDAY WOULD PUT OUT OF DATE, BEFORE IT IS SAVED (multi-squadron batch 1, step 4 — D2184 R32; his
 *  D2195 narrowed it to its own squadron, the reshape plan §7, A4): the published days on `from`..`to` of the loaded war's
 *  squadron — whose list the holiday is written into, and whose days alone it touches — that are working days for it now
 *  and would become a public holiday. Such a day was published as a working day, so it must be published again before
 *  its OIL is earned (the day's own amber line, D2003). None: an empty list. */
export function holidayOutOfDate(from: string, to: string): { unit: string; days: string[] }[] {
  if (!validIso(from) || !validIso(to) || to < from) return []
  const home = worldUnit()
  const days = publishedDaysOf(home, from, to).filter(iso => !isWeekend(iso) && !nonWorkingFor(home, iso))
  return days.length ? [{ unit: home, days }] : []
}

/** IS `iso` A DAY OFF FOR `unit` — a weekend, or a public holiday in its own war (D2195: never another squadron's, even
 *  at one place); an Off day is the squadron's own, and earns no OIL by itself, as before. The loaded war answers for its
 *  own squadron; another squadron's is read from its door. */
export function nonWorkingFor(unit: string, iso: string): boolean {
  if (!unit || unit === worldUnit()) return isNonWorkingISO(iso)
  if (!validIso(iso)) return false
  if (isWeekend(iso)) return true
  const own = storedWorld(unit)
  const war = own.periods.find(p => p.start <= iso && iso <= p.end)
  const day = war?.days.find(d => d.date === iso)
  return isNonWorkingDay(iso, day, own.eventDefs, war?.bands ?? [])
}

export function isNonWorkingISO(date: string): boolean {
  // The body is the engine's `isNonWorkingDay` since 3 Sep 26 — the same
  // predicate the leave-charging rule (charge.ts) reads, so a PH earns OIL
  // and excuses a leave day by ONE definition.
  const war = warHolding(getState().wars, date)
  const day = war?.period.days.find(d => d.date === date)
  return isNonWorkingDay(date, day, getState().eventDefs, war?.period.bands ?? [])
}

/* THE INPUT ASK-FLOW'S PLAN (owner, 28 Aug 26): which of a duty-&-commitments
   input's covered days are non-working, and what the input's own hours would
   earn on each — the pure body BOTH the OilConfirm sheet and the save gate
   read, so what is asked and what is credited cannot disagree (the
   upchitEffects precedent). One entry per applicable day; the amount is the
   input's own standing (all-day = FO, else its length under oilFullMin) —
   the CELL finally posted may still upgrade when published schedule work on
   the same day stretches its envelope (desiredOilCells). Walks label→ISO exactly as
   inputDates does, same 400-day cap. */
export function oilAskPlan(row: { person?: unknown; date: string; endDate?: string; yr?: unknown; allday?: unknown; s?: unknown; e?: unknown }): { iso: string; amt: 0.5 | 1 }[] {
  const out: { iso: string; amt: 0.5 | 1 }[] = []
  /* its own squadron's threshold, whichever squadron is picked (§15 D4 — engine/oil.ts inputOilAmt) */
  const amt = inputOilAmt(row.allday, row.s, row.e, inputUnitOf(row))
  if (amt == null) return out
  const start = labelToISO(row.date, row.yr)
  if (!start) return out
  let end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
  if (end < start) end = start
  let n = 0
  for (let d = start; d <= end && n < 400; d = addDays(d, 1), n++) {
    if (inputDayOff(row, d)) out.push({ iso: d, amt })
  }
  return out
}
/* WHOSE LIST JUDGES AN INPUT'S DAY (his D2195 — "a holiday one squadron adds never touches another squadron's days, OIL
   or bell"; D2206 — "a man's holiday OIL follows his own squadron's list"; the reshape plan §7, A4: oilOpenOn →
   oilAskPlan → isNonWorkingISO judged every squadron's input by the LOADED war's holidays, so 142's holiday asked 149's
   inputs the OIL question and told 149's admins). A weekend is everyone's. Otherwise the day is off where it is off for
   a squadron the input sits in that day — its named people's homes that day, else its stamp, else its filer's
   (engine/inputs.ts inputOnDay, the one body the lists ask) — each by its own war (nonWorkingFor). An input that sits in
   no squadron (a draft before anyone is in it) is judged by the loaded war, as every input was before. */
function inputDayOff(row: object, iso: string): boolean {
  if (isWeekend(iso)) return true
  const us = unitList().map(u => u.id).filter(u => inputOnDay(row, u, iso))
  if (!us.length) return isNonWorkingISO(iso)
  return us.some(u => nonWorkingFor(u, iso))
}

/* THE BELL'S PENDING SCAN (owner, 28 Aug 26 — "it will notify the applicable
   user based on the notification tab to review if the input deserves an
   applicable HO or FO"): every duty-&-commitments input of this person with
   at least one applicable (non-working) covered day the owner has NOT
   answered yet — a missing key in row.oil; an explicit 0 IS an answer. A
   DERIVED predicate on purpose (the bugAlert shape): it self-heals — answer
   the days, or move the input, and the row stops matching with no clearing
   discipline — and it recomputes the moment Leave War marks a PH after the
   fact, which is the whole point. Dormant rows ask nothing: the scheduler
   removed that commitment. Returns the first pending day per row so the
   bell's tap can land the editor on the exact question (iid, never the row
   object — undo re-mints rows). */
export function oilPendingFor(personId: string | null | undefined): { iid: string; iso: string }[] {
  const out: { iid: string; iso: string }[] = []
  /* a placeholder is nobody: there is no bell to light for ALL AVAIL itself ([INPUT-ALL-AVAIL]) */
  if (!personId || rosterBody(personId)?.special) return out
  /* a protected (quarantined) day is never asked (P2-QREV-06/Fable-6): the OIL
     pass already treats it as "credit stands", and the answer write would be
     rolled back by the input funnel — so the bell would stay lit forever. Skip
     those days from the scan. */
  const prot = protectedDates()
  const isoProt = (iso: string) => prot.length > 0 && prot.some(dt => inputCoversDate({ date: isoToLabel(iso), yr: baseYear() }, dt))
  /* AND AN INPUT HE FILED FOR ALL AVAIL / ALL ([INPUT-ALL-AVAIL]; owner D711 (4), 9 Oct 26: "an OIL question nobody
     answered goes to the filer's bell, and only his"). Nobody stands behind such an input by name, so nobody else can be
     asked; the men behind it never are (D702: "only on the day and the schedule"). ONLY WHILE HE MAY STILL ANSWER — a
     task is never shown to someone who cannot do it (both plan readers): a member filer whose right went with the
     members' switch is not asked, and the scheduler meets the unanswered question on the Inputs List and in OIL Earn.
     Asked of the one permissions module, for the person signed in. */
  const session = me()
  /* …AND AN INPUT HE FILED FOR SEVERAL PEOPLE (owner D762, 11 Oct 26 — "for an input with several people the OIL
     question has one answer, for everyone in it: whoever filed it, or an admin, gives it; no man in it gives an answer
     of his own"; step 2 (a) of the one-rule build). So "an input he answers for" is ONE test: its only person is he —
     his own request, whoever filed it — or it holds anyone else (several people, ALL AVAIL) and he is its filer, while
     he may still change it. A man who is merely IN a shared input is not asked. */
  const filedByHim = (row: WarInput) => (idsOf(row).length > 1 || isPlaceholderInput(row)) && row.by != null && String(row.by) === String(personId)
    && (session == null || String(session) === String(personId)) && mayEditInput(row)
  const ownOf = (row: WarInput) => idsOf(row).length === 1 && onlyNamed(row) === personId
  /* the RECORDS, not the per-person lines (engine/inputs.ts): this asks who ANSWERS for an input — its own man, or
     whoever filed it for ALL AVAIL, an input that has no line at all — and hands back the input's id for the editor */
  for (const row of warInputs()) {
    if ((!ownOf(row) && !filedByHim(row)) || !oilAsks(row.type) || oilSilent(row)) continue
    const answered = (row.oil ?? {}) as Record<string, number>
    const hit = oilAskPlan(row).find(p => answered[p.iso] == null && !isoProt(p.iso))
    if (hit && row.iid) out.push({ iid: row.iid, iso: hit.iso })
  }
  return out
}

/* ---- [OIL-ASK-NOTIFY] THE ONE LIST, AND THE HOLIDAY'S NOTICE (owner D780, D781, D782, D783 — 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.2, §3.3) ---------------------------------------------- */

/** One input of the one list: its id, its days IN THE RUN that nobody has answered for, what its own hours earn on a
 *  day (the amount the single question offers — one standing for every day of an input), and its last day. */
export interface OilOpen { iid: string; days: string[]; amt: 0.5 | 1; last: string }
/** EVERY INPUT THAT NEEDS AN OIL ANSWER ON A RUN OF DATES (owner D782: "every input of that day that needs an answer").
 *  Read live, never stored: a duty-and-commitments input, on the programme, with a day in `from`..`to` that asks the
 *  question and has no answer — an explicit 0 IS an answer. One line an input, however many people are in it (D762:
 *  one answer for everyone). A day of a locked (older-version) week is never asked, as the bell's own scan never asks
 *  it (oilPendingFor, above) — its answer could not be written. WHO may answer is the reader's to ask: the list is a
 *  scheduler's (ui/OilDayList.tsx); a member's own input still reaches him by his own bell. */
export function oilOpenOn(from: string, to?: string | null, unit?: string | null): OilOpen[] {
  if (!validIso(from)) return []
  const hi = to && validIso(to) && to >= from ? to : from
  const prot = protectedDates()
  const isoProt = (iso: string) => prot.length > 0 && prot.some(dt => inputCoversDate({ date: isoToLabel(iso), yr: baseYear() }, dt))
  const out: OilOpen[] = []
  for (const row of warInputs()) {
    if (!row || !row.iid || !oilAsks(row.type) || oilSilent(row)) continue
    /* ONE SQUADRON'S (multi-squadron batch 1, step 4 — D2184 R32): a holiday at a place two squadrons share is answered
       by each squadron's own schedulers for its own inputs, never the other's; `unit` names whose. Omitted: every
       squadron's (the holiday's own notice asks which squadrons have anything to answer). */
    /* …BY DAY (the reshape plan §3.2 A-i — Fable F10, Opus M6): each asked day is the squadron's whose its people are ON
       THAT DAY (engine/inputs.ts inputOnDay) — a duty 14–17 Jul across Ranger's 16 Jul move puts the 16th and 17th on
       149's list, the 14th and 15th on 142's; never the input's first day for every day */
    /* …AND A DAY OFF FOR THAT SQUADRON (his D2195 — the reshape plan §7, A4): an input with people of two squadrons on one
       day is asked where either squadron's list makes it off (oilAskPlan), but it stands on a squadron's list only for a
       day off by that squadron's own list — 149's holiday never puts a shared input on 142's list */
    const plan = oilAskPlan(row)
    if (!plan.length) continue
    const answered = (row.oil ?? {}) as Record<string, number>
    const days = plan.filter(p => p.iso >= from && p.iso <= hi && answered[p.iso] == null && !isoProt(p.iso) && (!unit || (inputOnDay(row, unit, p.iso) && nonWorkingFor(unit, p.iso)))).map(p => p.iso)
    if (!days.length) continue
    const start = labelToISO(row.date, row.yr) ?? days[0]!
    const end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
    out.push({ iid: String(row.iid), days, amt: plan[0]!.amt, last: end < start ? start : end })
  }
  return out
}
/* how many are left on a run — the bell's holiday line asks at every draw of both bells, so the answer is kept until
   something it was read from has moved: the scheduler's store (every change there ends in a notify), the war's facts,
   the list's own length (Fable's read of the plan, A9) */
let LEFT: { v: number; wf: number; n: number; sv: number; m: Map<string, number> } = { v: -1, wf: -1, n: -1, sv: -1, m: new Map() }
/* (counted for the squadron the LINE was written for — the Plan audit's PB4, the reshape plan §19: a holiday is its own
   squadron's (D2195), so its line counts that squadron's inputs, whoever reads it; it counted the reader's home, so a 149
   line on the bell of Hunter, 142's admin holding Plan of 149, read 0 and was hidden. Another squadron's days are read
   from its door, so what is kept is dropped with the stored worlds too — STORED_VER) */
function holidayLeft(a: string, b: string, unit: string): number {
  const v = raptorVersion(), wf = warFactsVersion(), n = warInputs().length, sv = STORED_VER
  if (LEFT.v !== v || LEFT.wf !== wf || LEFT.n !== n || LEFT.sv !== sv) LEFT = { v, wf, n, sv, m: new Map() }
  const key = `${a}|${b}|${unit}`
  let c = LEFT.m.get(key)
  if (c == null) { c = oilOpenOn(a, b, unit || null).length; LEFT.m.set(key, c) }
  return c
}
/* the days of a run of dates that are a holiday NOW — its first and last weekday that does not work (a weekend inside it
   is part of it; a weekend alone is no holiday); null where none is left. The bell's line reads its dates, its count,
   the day it covers and the list it opens through this (state/notices.ts noticeSpan). */
/* (THE LINE'S OWN SQUADRON — the blind read's R4, the reshape plan §19b; D2195: `unit` is the squadron the line was written
   for, and its days and name are read from that squadron's own list — its stored war when another is loaded — never the
   loaded war's: Hunter's line of 149's holiday, read with 142's war loaded, had no day left and was hidden) */
function holidaySpan(a: string, b: string, unit: string): { a: string; b: string; name: string } | null {
  if (!validIso(a) || !validIso(b) || b < a) return null
  const u = unit || worldUnit()
  let lo: string | null = null, hi: string | null = null
  for (let d = a, n = 0; d <= b && n < 400; d = addDays(d, 1), n++) if (!isWeekend(d) && nonWorkingFor(u, d)) { if (!lo) lo = d; hi = d }
  return lo && hi ? { a: lo, b: hi, name: holidayOwnNameOf(u, lo) } : null
}
/* (a squadron's holiday's own name on a date — holidayOwnName below, for any squadron's list) */
export function holidayOwnNameOf(unit: string, iso: string): string { const n = unitDayFacts(unit, iso).name; return n && n !== holidayWord('ph') ? n : '' }
/* a holiday's NAME — only one of its own. A holiday made with no name (the Event sheet's "PH" button; the Holidays
   list's empty name box) is saved under the preset's own word (holidayWord), and that word is not a name: the list
   then said "PH is now a public holiday." under "Public holiday · PH" (the check's walk, E1 — 13 Oct 26). Read as '',
   and each reader says it its own way: the list names the day, the bell's line says "Public holiday". */
export function holidayOwnName(iso: string): string { const n = dayFacts(iso).name; return n && n !== holidayWord('ph') ? n : '' }
/* THE SCHEDULERS of the Leave War's OWN squadron (multi-squadron batch 1, step 4): a posting is a fact of the world it was set in, so
   its bell lines go to that squadron's admins only, never the other squadron's (each admin's Admin → Users lists his own
   squadron, D2191); the posted man's squadron is the war's, since each squadron's Leave War holds only its own people */
/* ONE AUDIENCE (the reshape plan §6.2 A5, step 6; D2202, D2198; PB1, PB2): a posting's lines go to the squadron's admins
   of TODAY (accounts.ts adminsOf — at home there, or a plain admin holding Plan of it; a master through his home only),
   the same set the gate checks every posting line against (perms.ts postingPassViolation). The pass reads it after its
   outcomes, so an admin archived by his own posting is not told. */
const postingAdmins = (unit: string): string[] => adminsOf(unit, effectiveToday())
const ownSchedulerIds = (): string[] => postingAdmins(worldUnit())
/* …and a man the war tells of its bidding or of a decision is one at home in the war's own squadron today (job 2, 19 Nov
   26 — the Opus read's F1; D2194): a man posted out of it stays a row of its war while his posting window runs (state/
   store.ts setPeople), and once moved to another squadron he is that squadron's — the gate refuses an admin's line to him
   (state/perms.ts 7e), which refused the whole command that wrote it, Open for bidding among them */
/* (TODAY on purpose — who is at home now — the reshape plan §3.2 A-i) */
const atWarHome = (pid: string): boolean => homeUnitOf(pid, effectiveToday()) === worldUnit()
/* A WORKING DAY WAS MADE A HOLIDAY — called by the war's store INSIDE the command that did it (state/store.ts
   tellHolidays), with the runs of dates. For each run with an input that now needs an OIL answer:
     · ONE notice a scheduler (state/notices.ts noticeHoliday — "never silent", D780), the one who made the holiday
       too: what he leaves for "Later" is on his own bell as well. Written through the scheduler store's own input
       command, as a child of this one — so the holiday's Undo takes the notices away and its Redo puts them back;
     · the ONE list opens by itself for the first run, saying the day is now a holiday (D783 (5)) — once the command
       has gone through, never for one that was refused.
   A run with nothing to answer tells nobody and opens nothing. The count is never stored (D783 (6)). */
function tellHoliday(runs: HolidayRun[]): void {
  const todo = holidayTodo(runs)
  if (!todo.length) return
  const by = me()
  commitInputs(SCHED_TYPES.inputsWrite, () => { for (const h of todo) noticeHoliday(h.told, by != null ? String(by) : null, h.name, h.from, h.to, h.unit) })
  /* THE LIST OPENS BY ITSELF ON THE LINE'S OWN SQUADRON (the blind read's R3 — the reshape plan §19b): the holiday is its
     squadron's alone, and every run here has something of that squadron's to answer, so the first run's list opens on it,
     carried on the list (ui/pops.ts OILLIST) to what it lists and what its Save answers — never the reader's home, which
     for an admin holding Plan of it is another squadron (it read myUnit) */
  const first = todo[0]!
  cmdDeferEffect(() => { setOilList({ from: first.from, to: first.to, name: first.name, fresh: true, unit: first.unit }); raptorNotify() })
}
/* (each holiday the runs make, as its line names it, and whom it tells — tellHoliday's own working, shared with the gate's
   question of which lines a command owes, holidayLinesOwed below, so the two can never disagree) */
function holidayTodo(runs: readonly HolidayRun[]): (HolidayRun & { name: string; told: string[]; unit: string })[] {
  const own = holidayOwnName
  /* ONE NOTICE A HOLIDAY — FOR THE WHOLE OF IT AS IT NOW STANDS, not only the dates that have just become non-working
     (the two code reads of the finished code, 13 Oct 26 — Fable F1, the Opus read F3). A holiday lengthened by a day
     gave a run of that one day, and so a second line beside the first; one entered Friday to Monday gave two runs —
     the weekend was never a working day — two lines, and a list opened for the Friday alone. So each run is widened
     to the holiday that holds its ends, as the war's own list has it (holidaysIn — a band, a repeated word, a seeded
     flag), and two runs of one holiday are one. */
  const lineOn = (iso: string) => holidaysIn(iso.slice(0, 4)).find(h => h.kind === 'ph' && h.from <= iso && iso <= h.to) || null
  /* THE HOLIDAY'S OWN SQUADRON (his D2195 — the reshape plan §7, A4): a holiday is written into the loaded war, its
     squadron's alone, so only that squadron's inputs can need an answer on it (oilOpenOn, by the input's own squadron's
     list) — "the squadron whose input asks" */
  const unit = worldUnit()
  const seen = new Set<string>()
  const todo: (HolidayRun & { name: string })[] = []
  for (const r of runs) {
    const h1 = lineOn(r.from), h2 = lineOn(r.to)
    const from = h1 && h1.from < r.from ? h1.from : r.from, to = h2 && h2.to > r.to ? h2.to : r.to
    if (seen.has(`${from}|${to}`)) continue
    seen.add(`${from}|${to}`)
    if (oilOpenOn(from, to, unit).length > 0) todo.push({ from, to, name: own(r.from) })
  }
  /* ITS ADMINS OF TODAY ARE TOLD — AND ONLY THEM (his D2195: "the 'Inputs need an OIL answer' line goes to its own
     squadron's schedulers only"; D2202: while an admin holds Plan of another squadron his bell carries that squadron's
     admin lines — the Plan audit's PB3, which found Hunter, holding Plan of 149, never told of 149's holiday; it replaces
     step 4's "every squadron at the place, each for its own", D2184 R32). accounts.ts adminsOf — at home there, or a
     plain admin holding Plan of it; a master admin through his home only (D2198) — the one audience the posting lines
     use and the gate checks an admin's line against (perms.ts 7e, PC1). The one who made it is among them. */
  const told = adminsOf(unit, effectiveToday())
  /* (and each line carries that squadron — notices.ts noticeHoliday's `u`, PB4) */
  return todo.map(h => ({ ...h, told, unit }))
}
/** THE HOLIDAY LINES A COMMAND OWES, FROM ITS OWN CHANGES (fix read 11, fault C — Fable's F11-1, the security read's
 *  SEC11-4): the gate (state/perms.ts, through setHolidayLinesOwed) let a new holiday line through wherever noticeHoliday
 *  minted it in the running command, signed by the actor (notices.ts holMade) — but noticeHoliday is a plain function, so
 *  142's admin called it inside his own input command and put "149: all leave cancelled, report 0600 Sat", signed by
 *  himself, on 149's admin's and a 149 member's bells, with no holiday made at all. A holiday line is owed only by this
 *  command's own change of the war that makes a working day a holiday (state/store.ts holidayRunsOfChanges — the same
 *  test tellHolidays runs), for exactly the holiday it makes, under its own name, to the schedulers tellHoliday tells —
 *  and for its own squadron (PB4: the line's `u`, so no command writes a holiday line counting another squadron's). */
export type OwedHolidayLine = { a: string; b: string; name: string; to: ReadonlySet<string>; u: string }
export function holidayLinesOwed(changes: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown; after?: unknown }>): OwedHolidayLine[] {
  const runs = holidayRunsOfChanges(changes)
  return runs.length ? holidayTodo(runs).map(h => ({ a: h.from, b: h.to, name: h.name, to: new Set(h.told), u: h.unit })) : []
}
/** does this owed line cover that line? — its run, its name, its day, its reader and its squadron, as noticeHoliday writes them */
export function holidayLineCovered(owed: readonly OwedHolidayLine[], n: { to?: unknown; name?: unknown; day?: unknown; what?: unknown }): boolean {
  const w = Array.isArray(n.what) && n.what.length === 1 ? looseRec(n.what[0]) : null
  if (!w || w.k !== 'oilhol') return false
  return owed.some(o => String(w.a) === o.a && String(w.b ?? w.a) === o.b && n.name === o.name && n.day === o.a && o.to.has(String(n.to)) && w.u === o.u)
}

/* ---- THE BELL'S LEAVE WAR LINES (the overhaul's M4, batch 9 — D1142, D1214, D1422) ----------------------------
   The war's store works out WHAT a command did to each man's leave (leavewar/state/store.ts decisionTells — from the
   state before and after, never raised by a door); this is where it becomes his line: written through the scheduler
   store's own input command, as a child of the war's, so the decision's Undo takes the line and its Redo puts it back
   (9.3's "taken back" is the follow-up below). */
/* each man's war-approved leave as it stands — person → "date|notation" → its notation (LL, *LL, LL*). Keyed by the date
   AND the half (the fixes' M2 — the Opus read's 2, 28 Oct 26): a day may hold two war-approved halves, and keyed by the
   date alone the later Input overwrote the earlier, so the bell read a half that stood all along as "deleted", an
   approval as "bid deleted", or a put-back as nothing. */
function warLeaveNow(): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>()
  for (const row of warInputs()) {
    if (!row || !row.lw || !isLeave(row.type)) continue
    const pid = onlyNamed(row)
    if (pid == null) continue
    const m = out.get(String(pid)) ?? new Map<string, string>()
    for (const d of inputDates(row)) {
      const c = absencesAt(String(pid), d).find(x => x.id === String(row.iid))
      const n = c ? notationOf(c.code, c.win) : String(row.type)
      m.set(`${d}|${n}`, n)
    }
    out.set(String(pid), m)
  }
  return out
}
function tellWar(tells: WarTell[]): void {
  const by = me()
  const who = by != null ? String(by) : null
  commitInputs(SCHED_TYPES.inputsWrite, () => {
    for (const t of tells) {
      if (!atWarHome(String(t.personId))) continue
      const part: NoticePart = { k: 'lw', c: t.code, a: t.from, b: t.to, d: t.d, ...(t.destFrom ? { to: t.destFrom, tb: t.destTo } : {}), ...(t.was ? { w: t.was } : {}) }
      noticeWar([t.personId], who, part)
    }
  })
}
/* who hears that bidding opened or closed: every person on the war with a sign-in — the archived, the deleted and the
   special left out (noticeWar), and the admin who did it (D1214) */
function warAudience(): string[] {
  const onWar = new Set(getState().people.map(p => p.id))
  return [...new Set(ACCOUNTS_LIST.filter(a => a && a.pid != null && onWar.has(String(a.pid)) && atWarHome(String(a.pid))).map(a => String(a.pid)))]
}
function tellBidding(tells: OpenTell[]): void {
  const by = me()
  const who = by != null ? String(by) : null
  const to = warAudience()
  if (!to.length) return
  commitInputs(SCHED_TYPES.inputsWrite, () => {
    for (const t of tells) noticeWar(to, who, { k: 'lwopen', a: t.from, b: t.to, open: t.open })
  })
}

/* BIDDING THAT ENDS BECAUSE ITS LAST DATE PASSES (M4 9.4 — D1214 ruled the register's P7 in as written, and P7's "when"
   includes "its last day passes"): "Leave War · 1 Apr – 30 Jun · bidding closed · its dates ended", with no name. No command
   runs on that date, so each person's bell works the line out from the periods' stored stretches once the date has passed
   — a steady id, read like any other line (state/notices.ts setDerivedNotices). A stretch that ended more than fourteen
   days ago is old news and not listed (the build's reading, named at his look), so a new member is not handed a year of
   them. At the database step a scheduled flow may write it instead (noted for the IT side). */
/* …AND A MAN TOLD A STRETCH OPENED IS ALWAYS TOLD IT ENDED (the walk's C-F3, 27 Oct 26). The bell keeps the newest line
   of a stretch (state/notices.ts noticeLive), and this line was dated the midnight after it: an "open" line written
   later than that, or any open line once this one passed its fourteen days, won — his bell went on reading "bidding
   open" for dates long gone. So where he holds a line about the stretch, it is listed however old, dated just after
   the newest of them. */
const ENDED_DAYS = 14
/* the war's audience (warAudience) for a squadron not loaded: a man with a sign-in, not a special, archived or deleted
   person (noticeWar's own leave-outs) */
function storedAudienceHas(pid: string): boolean {
  const p: any = (PEOPLE as any)[pid]
  if (!p || p.special || p.archived || p.deleted) return false
  return ACCOUNTS_LIST.some(a => a && a.pid != null && String(a.pid) === pid)
}
/* …READ FROM HIS OWN SQUADRON'S WAR, WHICHEVER IS LOADED (batch 1's second half, §16 D4′ — R3-O12, R3-F8): a master
   admin's or Plan holder's pick loads the picked squadron's war, and the line read the loaded one — his own war's line
   left his bell, and the unread count moved with the pick. The loaded war where it is his home's (its audience as
   before); else his home's stored war (storedWorld — its stretches only), for a man with a sign-in on no special,
   archived or deleted person. */
function endedLines(pid: string): Notice[] {
  const home = homeUnitOf(pid, effectiveToday())
  const loaded = home === worldUnit()
  if (loaded ? !warAudience().includes(pid) : !storedAudienceHas(pid)) return []
  const periods: Period[] = loaded ? rawState().wars.map(w => w.period) : (home ? storedWorld(home).periods : [])
  const today = memberToday(), since = addDays(today, -ENDED_DAYS)
  const out: Notice[] = []
  for (const period of periods) for (const o of period.open) {
    const w = { period }
    if (!(o.to < today)) continue
    let told = 0
    for (const n of NOTICES) {
      const p = n.to === pid ? (n.what || [])[0] : null
      if (p && p.k === 'lwopen' && String(p.a) <= o.to && o.from <= String(p.b || p.a)) told = Math.max(told, n.at)
    }
    if (!told && o.to < since) continue
    const end = addDays(o.to, 1)
    const at = Math.max(new Date(+end.slice(0, 4), +end.slice(5, 7) - 1, +end.slice(8, 10)).getTime(), told + 1)
    out.push({ id: `lwend:${w.period.id}:${o.from}:${o.to}`, to: pid, by: null, at, iid: '', name: 'Leave War', day: o.from, what: [{ k: 'lwopen', a: o.from, b: o.to, open: false, end: true }] })
  }
  return out
}

/* A POSTING WITH NOTHING TO RUN — "off the manpower" ([POSTOUT-RUN-NOTICE], D1690). Its date is the whole of it: no pass
   runs and nothing is written (poDueNow skips it — postingPendingTag's "nothing to run"), so, as with a stretch that ends,
   each admin's bell works the line out from the stored posting once its date has come — a steady id, read like any other
   line, dated the posting's own midnight. Old news is not listed: a posting whose date passed more than fourteen days ago
   (ENDED_DAYS, the ended stretch's rule), so the postings of months gone do not arrive as a pile of new lines. At the
   database step a scheduled flow may write it instead, beside the pass (noted for the IT side). */
/* PB2 (the Plan audit, §19): a reader is given the line of EVERY squadron he is one of today's admins of (postingAdmins —
   at home there, or a plain admin holding Plan of it, D2202): the loaded war's from its postings, another squadron's from
   its stored postings (storedPostings — the foreign pass's own read) */
function postedLines(pid: string): Notice[] {
  const here = worldUnit()
  const out: Notice[] = []
  for (const u of WORLD_DOOR ? unitList().map(x => x.id) : [here]) {
    // eslint-disable-next-line react-doctor/js-set-map-lookups -- each pass reads a different squadron's admin list, built fresh and looked in once: a Set would cost more than the one lookup
    if (!postingAdmins(u).includes(pid)) continue
    out.push(...postedLinesOf(pid, u === here ? getState().postOuts : storedPostings(u)))
  }
  return out
}
function postedLinesOf(pid: string, posts: Readonly<Record<string, Person>>): Notice[] {
  /* (an admin is never told of his own posting — as the pass's lines, above) */
  const today = effectiveToday(), since = addDays(today, -ENDED_DAYS)
  const out: Notice[] = []
  for (const [id, rec] of Object.entries(posts)) {
    if (!rec || !rec.to || rec.gone) continue
    const o = outcomeOf(rec)
    if (o && o !== 'none') continue
    const poDate = addDays(rec.to, 1)
    if (id === pid || poDate > today || poDate < since) continue
    const body = rosterBody(id)
    if (!body || body.special || body.deleted) continue
    const at = new Date(+poDate.slice(0, 4), +poDate.slice(5, 7) - 1, +poDate.slice(8, 10)).getTime()
    /* the line's id is steady, so his read record holds it — but once "Undo post out" has told this admin it was taken back
       ([NOTICE-UNDO-RETRACT], D1693), the same posting set again is NEWS: the id carries how many such "taken back" lines
       he holds for this man and date, so it comes back unread (the scenario designer's 12, 5 Nov 26). An admin never told
       (he had not read it, or pressed the Undo himself) keeps the plain id — unread, or his own act */
    const backs = NOTICES.filter(n => { const q = (n.what || [])[0]; return n.to === pid && n.day === poDate && q?.k === 'poback' && q.who === id }).length
    out.push({ id: `po:${id}:${poDate}${backs ? `:${backs}` : ''}`, to: pid, by: null, at, iid: '', name: String(body.cs), day: poDate, what: [{ k: 'po', who: id, o: 'none' }] })
  }
  return out
}

/** A TAP ON THE BELL'S LEAVE WAR LINE (M4 9.6): the Leave War, the war holding the date, the grid at that day and his cell
 *  ringed (ui/cellring.ts — the just-added mark). The page's first-visit landing takes the ask instead of its own
 *  (LeaveWarPage.tsx). A man with no row on the grid (a SANS man while SANS is off the war — B12) is shown his person
 *  window instead. Approvals is left (the bell is another way out of it). */
export function openWarAt(iso: string, personId?: string | null): void {
  const war = warHolding(rawState().wars, iso)
  if (war && war.period.id !== rawState().currentId) selectWar(war.period.id)
  setApprMode('off')
  /* …and the Balances page, which stands in the grid card's place as Approvals' page does (M5a — the Balances builder's 3) */
  setBalancesUp(false)
  const pid = personId ? String(personId) : ''
  const onGrid = !!pid && getState().people.some(p => p.id === pid)
  if (pid && !onGrid) askLw({ kind: 'person', id: pid })
  /* …and the grid in front: the OIL tab may be up over it (the scenario designer's 12 — the ringed day stood behind it) */
  else askLw({ kind: 'grid' })
  if (CURPAGE === 'leavewar') { if (onGrid) ringCell(pid, iso); else focusDay(iso) }
  else { askRing({ personId: onGrid ? pid : '', date: iso }); setPage('leavewar') }
  raptorNotify()
}

/** ONE FOLLOW-UP LINE A RESTORE OWES (fix read 6, fault B — the security read's SEC6-B, Astra's 1): what the line says
 *  (`what`), its name, day and input, and whom it reaches — ids, times and who wrote it aside. `of` — the line it follows
 *  up (its `ref`). */
export interface FollowUp { of: Notice; to: string; name: string; day: string; iid: ''; what: [NoticePart] }
/** THE FOLLOW-UP LINES A RESTORE'S NOTICES OWE, AND NOTHING ELSE (fix read 6, fault B — the security read's SEC6-B,
 *  Astra's 1). The gate let a genuine Undo or Redo carry any "taken back" or "again" line naming one of its lines: it
 *  checked the part's kind, its `ref` and its reader, never what the line said, its name, day or input, nor how many named
 *  one line — so a line "OL 1–31 Dec 2027 approved" rode 149's Undo onto a moved man's bell. This is the ONE body that
 *  says what a follow-up line says: warNoticesReversed (below) writes only from it, and the commit gate
 *  (state/perms.ts followUpOf, through its probe) lets a follow-up reach another squadron's man only where it is one of
 *  these, field for field. `changes` — each notice change's line image (a put's after, a delete's before): the step's
 *  own lines, or the restore's verified replay of them. Pure: it reads, never writes. Who is told is asked here too —
 *  a man since moved is no longer told of the war's own business, but a line about his own leave follows him (his D2222);
 *  one whose line left his bell on his move day (D2218) is told nothing more. */
export function followUpsFor(changes: ReadonlyArray<{ collection: string; op: string; before?: unknown; after?: unknown }>, dir: 'undo' | 'redo'): FollowUp[] {
  const out: FollowUp[] = []
  for (const c of changes) {
    if (c.collection !== 'notices') continue
    const n = (c.op === 'delete' ? c.before : c.after) as Notice | undefined
    if (!n || typeof n !== 'object' || !isWarNotice(n)) continue
    /* (one since moved to another squadron is no longer told here of the war's own business — bidding opened or closed,
       atWarHome — but a line about his OWN leave follows him: its Undo strikes it "taken back" where he read it, its Redo
       says "again" — his D2222, 19 Nov 26; the gate lets exactly that follow-up through, state/perms.ts followUpOf) */
    if (!noticeAboutHim(n) && (!atWarHome(String(n.to)) || noticeLeftBell(n))) continue
    /* (…nor one who moved away and has come BACK: the line left his bell on his first move day for good, D2218 — his home
       today being this squadron again does not bring it back, so no "taken back" or "again" is written for it — fix read
       5, Astra's 3; state/notices.ts noticeLeftBell reads every move since the line was written) */
    /* (a war notice's first part is one of the war's own three kinds — isWarNotice, just above) */
    const p = (n.what || [])[0] as Extract<NoticePart, { k: 'lw' | 'lwopen' | 'lwback' }> | undefined
    if (!p || p.k === 'lwback') continue
    let part: NoticePart
    if (dir === 'undo') {
      const d = p.k === 'lwopen' ? (p.open ? 'open' : 'close') : p.d
      /* (where a move took it, too: the taken-back line says the line it replaces word for word, struck — D1699) */
      part = { k: 'lwback', ...(p.k === 'lw' && p.c ? { c: p.c } : {}), a: p.a, b: p.b, d, ref: n.id, ...(p.k === 'lw' && p.w ? { w: p.w } : {}), ...(p.k === 'lw' && p.to ? { to: p.to, ...(p.tb ? { tb: p.tb } : {}) } : {}) } as NoticePart
    } else part = p.k === 'lw' ? { ...p, again: true, ref: n.id } : { ...p }
    /* (its day is the line's own first day — both the "taken back" and the "again" part carry it as `a`) */
    out.push({ of: n, to: String(n.to), name: warLineName(part), day: String(p.a), iid: '', what: [part] })
  }
  return out
}

/* "TAKEN BACK" (M4 9.3 — owner D1216, D148). An Undo restores an exact image, so it cannot itself leave a line or write
   one: the decision's line goes with the Undo, as every notice does. Then, once the Undo has LANDED (the undo's own
   `reversed` hook — state/undo-wire.ts), this follow-up — a command of its own, never an Undo step (undo/timeline.ts
   NOT_STEPS) — writes "Approval of LL taken back · Saber" for each line that went which its member had already READ (his
   read record, which an admin may read — state/perms.ts NoticeSeen): one he had not read simply went. A Redo puts the old
   line back with its old id — already in his read marks — so where a "taken back" stands for it, Redo's follow-up writes
   a FRESH line on top, new id and the time now ("LL approved again · Saber"), unread (the fresh read, finding 3).
   What each line says is followUpsFor's (above — fix read 6, fault B); here only whether it is owed now. */
/** THE FOLLOW-UP LINES A RESTORE OWES, WORDED AND WHETHER OWED — ONE BODY (fix read 7, fault F — Astra's A3). The gate
 *  asked followUpsFor for what a line says, but whether it is owed lived only in the writer below, so a genuine Undo of a
 *  decision its member never read, or a Redo with no "taken back" to answer, could carry the very line the writer would
 *  have worded, though it would never write it. Now the writer and the gate (state/perms.ts followUpOf, through its probe)
 *  both ask this. `moved` — the lines the restore took away (an Undo) or put back (a Redo), as images; `notices` — the bell
 *  as it stood before the command (only its follow-up lines are read: an Undo step never holds one, `lw.notice` being no
 *  step); `read` — his read record, as saved before the command. Owed on an Undo: he had read the line, and any "again" an
 *  earlier Redo wrote for it, the last; on a Redo: a "taken back" stands for it, and the last "again", if any, was read.
 *  Pure: it reads, never writes. */
export function followUpsOwed(moved: ReadonlyArray<{ collection: string; op: string; before?: unknown; after?: unknown }>, dir: 'undo' | 'redo',
  notices: readonly Notice[], read: (pid: string, n: Notice) => boolean): FollowUp[] {
  const out: FollowUp[] = []
  for (const f of followUpsFor(moved, dir)) {
    const n = f.of
    /* the "again" lines an earlier Redo wrote for this line, the newest last (the fixes' M9 — the Opus read's 5): by its
       time, the list's order where two share one */
    let last: Notice | null = null
    for (const x of notices) {
      const q = (x.what || [])[0]
      if (x.to === n.to && q?.k === 'lw' && q.again && q.ref === n.id && (!last || !(x.at < last.at))) last = x
    }
    if (dir === 'undo') {
      if (!read(n.to, n)) continue
      /* …a Redo after a "taken back" told him "again": that line is now the one he last had. Unread, it simply goes — it
         names the line it repeats, and with that line gone it is no longer shown (state/notices.ts noticeLive) — so the
         "taken back" he already holds still stands as what he knows (D1216); read, he is told "taken back" once more. */
      if (last && !read(n.to, last)) continue
    } else {
      if (!notices.some(x => { const q = (x.what || [])[0]; return x.to === n.to && q?.k === 'lwback' && q.ref === n.id })) continue
      /* an "again" line he has not read is shown again with its line (M9): no second one beside it */
      if (last && !read(n.to, last)) continue
    }
    out.push(f)
  }
  return out
}
/** THE WAR LINES A COMMAND OWES, FROM ITS OWN CHANGES (fix read 10, fault A — the security read's SEC10-1, Fable F10-1,
 *  F10-2, Astra): the gate (state/perms.ts, through setWarLinesOwed) let a war line through wherever one of the war's
 *  writers minted it in the running command (notices.ts warMade) — but those writers are plain functions, so an admin's
 *  ordinary input command could call noticeWar or noticePosting itself and put a made-up "your leave refused" on his own
 *  man's bell, which, being about him, followed him to his new squadron (D2218, D2222). A war line is owed only by a
 *  change the war itself made in this command:
 *  · a decision on a man's leave ("Your leave", `lw`) — a change of his war row (`lw.cell`) on a day of the line's run, or
 *    of a war-approved leave of his (an input carrying `lw`) covering one, holding the line's kind (or the kind a re-type
 *    came from) before or after;
 *  · bidding opened or closed ("Leave War", `lwopen`) — a change of a war's period that opens or closes exactly that
 *    stretch (store.ts openingTells, the writer's own body);
 *  · a posting's line (`po`) or its "taken back" (`poback`) — a change of that man's posting record, the line's day its
 *    posting date and its outcome the record's, before or after.
 *  What the line says beyond that (approved or refused) the change does not fix, so the gate keeps asking warMade too.
 *  A restore's "taken back" and "again" lines are owed by the restore (followUpsOwed above), not here. Pure: it reads the
 *  changes, never the stores. */
export type OwedWarLine =
  | { k: 'lw'; to: string; days: ReadonlySet<string>; kinds: ReadonlySet<string> }
  | { k: 'lwopen'; a: string; b: string; open: boolean }
  | { k: 'po' | 'poback'; who: string; day: string; o: string }
type LooseRec = Record<string, unknown>
const looseRec = (x: unknown): LooseRec | null => (x && typeof x === 'object' && !Array.isArray(x) ? (x as LooseRec) : null)
/* (the same war-approved leave on both sides: its one man, its days, its halves — whole day or its times — its kind and
   its war; what else changed, its remarks above all, is no change of the leave — fix read 11, fault D) */
const sameWarLeave = (b: LooseRec, a: LooseRec): boolean =>
  String(onlyNamed(b) ?? '') === String(onlyNamed(a) ?? '') && onlyNamed(a) != null
  && inputDates(b as unknown as InputRead).join() === inputDates(a as unknown as InputRead).join()
  && !!b.allday === !!a.allday && String(b.s ?? '') === String(a.s ?? '') && String(b.e ?? '') === String(a.e ?? '')
  && String(b.type ?? '') === String(a.type ?? '') && String(b.lw) === String(a.lw)
export function warLinesOwed(changes: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown; after?: unknown }>): OwedWarLine[] {
  const out: OwedWarLine[] = []
  const kindOf = (code: unknown) => String(code ?? '').replace(/\*/g, '')
  const leave = new Map<string, { days: Set<string>; kinds: Set<string> }>()
  const leaveOf = (pid: string) => { let m = leave.get(pid); if (!m) leave.set(pid, m = { days: new Set(), kinds: new Set() }); return m }
  for (const c of changes) {
    const imgs = [c.before, c.op === 'delete' ? null : c.after]
    if (c.collection === 'lw.cell') {
      /* `<war>:<person>:<date>` — read from the right: a war id may carry a colon */
      const parts = String(c.id).split(':')
      if (parts.length < 3) continue
      const m = leaveOf(parts[parts.length - 2]!)
      m.days.add(parts[parts.length - 1]!)
      for (const img of imgs) if (Array.isArray(img)) for (const x of img) { const r = looseRec(x); if (r && r.code != null) m.kinds.add(kindOf(r.code)) }
    } else if (c.collection === 'inputs') {
      /* (…only where the leave itself changed — fix read 11, fault D, Fable's F11-2: a 142 admin changed only the remarks of
         his man's war-approved leave in his own input command, and that "change of his leave" owed a war line on its days,
         so he put a made-up "your leave refused" signed as Saber on the man's bell. A war-approved leave that stays one, for
         the same man, on the same days and halves, of the same kind and the same war, owes nothing: its coming, its going,
         and a change of any of those owe as before) */
      const b0 = looseRec(c.before), a0 = looseRec(c.op === 'delete' ? null : c.after)
      if (b0 && a0 && b0.lw && a0.lw && sameWarLeave(b0, a0)) continue
      for (const img of imgs) {
        const row = looseRec(img)
        if (!row || !row.lw) continue
        const pid = onlyNamed(row)
        if (pid == null) continue
        const m = leaveOf(String(pid))
        for (const d of inputDates(row as unknown as InputRead)) m.days.add(d)
        m.kinds.add(kindOf(row.type))
      }
    } else if (c.collection === 'lw.war') {
      const a = looseRec(c.op === 'delete' ? null : c.after)
      if (!a) continue
      const b = looseRec(c.before)
      const open = (p: LooseRec | null) => ({ ...(p ?? {}), open: p && Array.isArray(p.open) ? p.open : [] }) as unknown as Period
      for (const t of openingTells(open(b), open(a))) out.push({ k: 'lwopen', a: t.from, b: t.to, open: t.open })
    } else if (c.collection === 'lw.postouts') {
      for (const img of imgs) {
        const r = looseRec(img)
        if (!r || typeof r.to !== 'string' || !r.to) continue
        const o = outcomeOf(r as { poOutcome?: unknown; poArchive?: boolean })
        if (!o) continue
        const day = addDays(r.to, 1)
        out.push({ k: 'po', who: String(c.id), day, o }, { k: 'poback', who: String(c.id), day, o })
      }
    }
  }
  for (const [to, m] of leave) out.push({ k: 'lw', to, days: m.days, kinds: m.kinds })
  return out
}
/** does this owed line cover that line? — what the gate asks, line by line (state/perms.ts setWarLinesOwed) */
export function warLineCovered(owed: readonly OwedWarLine[], n: { to?: unknown; iid?: unknown; name?: unknown; day?: unknown; what?: unknown }): boolean {
  const w = Array.isArray(n.what) && n.what.length === 1 ? looseRec(n.what[0]) : null
  if (!w || n.iid !== '' || typeof w.k !== 'string') return false
  /* (its name and day as its writer gives them — noticeWar: warLineName and the part's first day) */
  if ((w.k === 'lw' || w.k === 'lwopen') && (n.name !== warLineName(w as unknown as NoticePart) || n.day !== String(w.a))) return false
  const run = (a: unknown, b: unknown): string[] => {
    const out: string[] = []
    if (typeof a !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(a)) return out
    const end = typeof b === 'string' && b >= a ? b : a
    for (let d = a, i = 0; d <= end && i < 400; d = addDays(d, 1), i++) out.push(d)
    return out
  }
  const kindOf = (code: unknown) => String(code ?? '').replace(/\*/g, '')
  return owed.some(o => {
    if (o.k !== w.k) return false
    if (o.k === 'lw') {
      if (String(n.to) !== o.to || w.again || w.ref != null) return false
      if (!o.kinds.has(kindOf(w.c)) && !(w.w != null && o.kinds.has(kindOf(w.w)))) return false
      return [...run(w.a, w.b), ...run(w.to, w.tb)].some(d => o.days.has(d))
    }
    if (o.k === 'lwopen') return w.a === o.a && w.b === o.b && w.open === o.open
    return String(w.who) === o.who && String(w.o) === o.o && n.day === o.day
  })
}
export function warNoticesReversed(changes: ReadonlyArray<{ collection: string; op: string; after?: unknown }>, dir: 'undo' | 'redo'): number {
  /* (the step's own lines: what it put — a line it deleted owes no follow-up, as before — that this restore has taken
     away (an Undo: no longer on the bell) or put back (a Redo: on it again). Run inside the restore, before any follow-up
     is written, so the bell's follow-up lines are as they stood before the command.) */
  const moved = changes.filter(c => c.op === 'put' && (c.collection !== 'notices' || (() => {
    const id = (c.after as { id?: unknown } | null | undefined)?.id
    return NOTICES.some(x => x.id === id) === (dir === 'redo')
  })()))
  const made = followUpsOwed(moved, dir, NOTICES, hasRead)
  if (!made.length) return 0
  const by = me()
  let wrote = 0
  commitInputs('lw.notice', () => { for (const f of made) wrote += noticeWar([f.to], by != null ? String(by) : null, f.what[0]) })
  return wrote
}

/* WHO AN ALL / ALL AVAIL PUCK STANDS FOR ([ALL-AVAIL-REDEF], owner 21 Sep 26 —
   "ALL Avail and ALL pucks should not consist of ground crew by default. only
   SANS that are planned on the programmed on that day with us should be
   included. Like if they fly, then they should be counted as part of all
   avail/all. people on ATT B only should still be included. Those on Training,
   Course, Meeting, Appointment, Duty, Personal, Other, planned for anything on
   the schedule that conflicts in timing with the rest of the schedule is not
   part of All avail and ALL").

   ONE answer to "is this man available", which is the point: the board and the
   crew picker already knew who was busy on the programme (engine/avail.ts) and
   this expansion ignored the schedule entirely — two notions of available living
   in one app. It now asks the schedule's own body, on the day blob it is
   measuring, so a frozen snapshot resolves against the day it was issued with.

   The rule, in order:
   - never a sentinel, an archived body or ground-crew Personnel (unchanged);
   - a SANS man ONLY when he is planned on OUR programme that day — named
     anywhere on it (`dayEngaged`). He is otherwise another squadron's;
   - not posted in, or posted out, drops him (`inSquadron`, unchanged);
   - an away-making input — all leave, medical, overseas duty — that overlaps
     the event's window drops him, EXCEPT **ATT B**, the one type in the app
     that says "no flying, may still work" (`canWork`);
   - a COMMITMENT that overlaps the window drops him: Training, CSE, Meeting,
     Fly with, Personal, Appointment, Duty, Other. A commitment the scheduler
     took off the programme (`acc === 'r'`) is dormant and drops nothing;
   - anything he is NAMED for on the day's own schedule that overlaps the window
     drops him (`personBusy` — the same occupancy the validator and the picker
     read).

   A SENTINEL NEVER BLOCKS ANOTHER SENTINEL (ruled by the build, not the owner —
   raise it if reopened): only NAMED people count as "planned for something", so
   two overlapping ALL AVAIL rows cannot each empty the other. `personBusy`
   gives this for free — it matches a person by id, and a sentinel row names no
   one.

   The war grid needs no separate read: an approved war-side leave exists as an
   Input too, so INPUTS is the one absence record this consults. */
export function availableFor(iso: string, win: [number, number], day?: Day): string[] {
  const out: string[] = []
  const isoOrd = +iso.replace(/-/g, '')
  /* the Leave War body, for the posting window (bug pass, 28 Aug 26): a
     person posted out WITHOUT the archive switch — or not yet posted in —
     still holds a Raptor body, and expanding them under an ALL puck would
     mint a credit the matrix hides behind its not-yet-arrived blank. The
     same inSquadron read the manning counts make. */
  const lwById = new Map(getState().people.map(p => [p.id, p]))
  /* computed ONCE for the whole walk, not per person: dayEngaged is a full pass
     over the day, and this loop runs sixty times per sentinel window. */
  const engaged = day ? dayEngaged(day) : null
  const covers = (inp: WarInput) => {
    const a = dateOrd(inp.date, inp.yr)
    if (a == null) return false
    const b = inp.endDate ? dateOrd(inp.endDate, inp.yr) ?? a : a
    return isoOrd >= a && isoOrd <= b
  }
  const hits = (inp: WarInput) => { const w = inpWin(inp); return !!w && w[0] < win[1] && win[0] < w[1] }
  /* WHO IS KEPT OUT BY AN INPUT OF HIS OWN, worked out ONCE for the whole walk, not once a man ([ALL-AVAIL-AS-MEMBER]
     step 1): the inputs that could keep anyone out of this window are picked first — every test below is about the
     INPUT (its filing, its kind, its dates, its hours) — and then read as LINES, one a named person (engine/inputs.ts
     inputLines): a man's own line is his commitment over the window, whoever else is in the input, and an input for
     ALL AVAIL / ALL has no line and so keeps nobody out. */
  const keptOut = new Set<string | undefined>(warLines(warInputs().filter(inp => {
    /* A REMOVED REQUEST IS SILENT EVERYWHERE (Astra, 21 Sep 26). The dormant
       test used to sit on the `commit` branch only, so a Training or Meeting
       the scheduler had turned down correctly stopped speaking — while a
       LEAVE, MEDICAL or OVERSEAS DUTY he had turned down still kept its man
       out of ALL AVAIL. He was then missing from the membership frozen into
       the issued day and earned nothing, with nothing on screen to say why.
       `inputDormant` has always defined every removed input as silent; this
       is the one reader that applied it to half the types. */
    if (!inp || inp.acc === 'r') return false
    /* …and so is a CANCELLED or information-only one (step 4 of the one-rule build — owner D760: the scheduler's CX on
       its row cancels the input itself): its people are free for whoever else needs them */
    if (inputSilent(inp)) return false
    const away = isAway(inp) && !canWork(inp.type)
    /* …an overseas duty a scheduler put on the Ground Programme too (D1393 — the code read's F2) */
    const commit = isPersonal(inp.type) || goesOnProg(inp)
    if (!away && !commit) return false
    return covers(inp) && hits(inp)
  })).map(l => l.person))
  /* the people of the schedule this day belongs to — the one in view (multi-squadron step 3, engine/roster.ts): another
     squadron's men are never in this squadron's ALL AVAIL crowd (borrowing, batch 3, brings them in by name) */
  for (const id of rosterOf(UNIT, iso)) {
    const p = rosterBody(id)
    if (!p || p.special || p.pers) continue
    /* a DELETED man is read by DATE ([POST-OUT-OUTCOMES], D297 — Fable F1): on a day before his cutoff he is
       available exactly as he was, so the crowd a day he flew froze at publication compares equal and that day never
       reads pending for the delete; on or after it he is out. An ARCHIVED man is read by his STINTS (D327, 28 Sep 26 —
       "shouldnt all avail crowd remain the same as per how that was published?"): in the crowd on a day he was here,
       out from his archive on — the `inSquadron` read just below; with no war row (never here) he is out. */
    if (p.deleted ? iso >= String(p.deletedFrom || '') : (p.archived && !lwById.get(id))) continue
    /* SANS are another squadron's men until they are on our programme for the
       day. With no day blob to read (a caller that cannot supply one) they stay
       out, which is the pre-[ALL-AVAIL-REDEF] answer — fail closed. */
    if (p.san && !(engaged && engaged.has(id))) continue
    const lw = lwById.get(id)
    if (lw && !inSquadron(lw, iso)) continue
    if (keptOut.has(id)) continue
    if (engaged && personBusy(day, id).some((w: [number, number]) => w[0] < win[1] && win[0] < w[1])) continue
    out.push(id)
  }
  return out
}

/* The ISO date of day di in the week whose Monday is v (dd/mm/yyyy — the
   stash's own key). Pure calendar arithmetic on the key, so a stashed
   week's dates can never disagree with the key it is filed under. */
function weekDayISO(v: string, di: number): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v)
  if (!m) return null
  return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1] + di)).toISOString().slice(0, 10)
}

/* A stashed week's model + publish state, parsed ONCE per stored blob —
   runOilPass runs on every notify and must not re-parse unchanged weeks
   each time. Cached by the blob string's own REFERENCE identity (stashPut
   replaces the string, so a hit is proof nothing changed; a generation
   counter would collide across the tests' stashClear, which resets GEN).
   The publish fields ride the snapshot under schedFields' short keys
   (state/history.ts): ok=dayOK, cv=cur, a=als, o=orig, dr=drafts — mapped
   here into the SCHED shape the parameterized publish readers take.
   null = nothing usable stashed. */
/* (its days, and its publish state in the SCHED shape — each part as the blob held it, absent where it held none) */
type StashOilWeek = { days: Day[], sc: Partial<Pick<Sched, 'dayOK' | 'cur' | 'als' | 'orig' | 'drafts' | 'amV'>> }
const STASH_OIL_CACHE = new Map<string, { src: string, wk: StashOilWeek | null }>()
function stashOilWeek(v: string): StashOilWeek | null {
  const src = stashGet(v)
  if (!src) return null
  const hit = STASH_OIL_CACHE.get(v)
  if (hit && hit.src === src) return hit.wk
  let wk: StashOilWeek | null = null
  try {
    const s = JSON.parse(src)
    if (s && Array.isArray(s.d))
      /* amV (s.am) is carried so the OIL wire can CLASSIFY the stashed book
         (P2-REREVIEW-05) — an unsupported/future-version book whose snapshots
         still resolve must not be treated as authoritative. */
      wk = { days: s.d, sc: { dayOK: s.ok, cur: s.cv, als: s.a, orig: s.o, drafts: s.dr, amV: s.am } }
  } catch (_e) { /* a bad blob reads as never stashed — never throw in a pass */ }
  STASH_OIL_CACHE.set(v, { src, wk })
  return wk
}

/** The credits a non-working day earns right now: person|isoDate -> FO/HO,
 *  ONE ≤6h/>6h test per person per day over the ENVELOPE of BOTH sources —
 *  first start to last end, gaps included (owner, 29 Aug 26: between two
 *  commitments "they are still in squadron"; this replaced the 28 Aug
 *  interval-union sum):
 *  - the PUBLISHED schedule, from the ISSUED snapshot — an issued day is the
 *    squadron's word that the work stood, so a draft edit after publish
 *    moves nothing until it is published too (the AL/reissue paths), which
 *    is also where reverse-and-replace naturally lives: the snapshot
 *    changes, the diff below follows it;
 *  - ACKNOWLEDGED duty-&-commitments claims, which since [OIL-AUTO-REMOVE]
 *    (owner, 21 Sep 26 — "we make it a point to publish everyday so that
 *    silently earn nothing wont happen") ALSO WAIT FOR PUBLICATION: the claim
 *    rides the day's frozen OIL evidence block, so an answer revised after the
 *    day went out moves no money until the day is published again. Before this
 *    an answer moved the credit at once and produced no amendment, and an
 *    overseas-duty answer could never produce one at all — OD has no row.
 *    A day that stops reading non-working still stops crediting (checked live
 *    below), and the reverse sweep collects the cell.
 *
 *  The schedule half reads EVERY week, not just the loaded one (owner,
 *  29 Aug 26 — "pull the full day schedule regardless of what's on
 *  screen"): the live DAYS/SCHED for the loaded week, and the per-week
 *  session stash (engine/weekstash.ts) for every other week the user has
 *  visited, whose snapshot carries the same publish state under
 *  schedFields' short keys. A never-visited week has published nothing, so
 *  live + stash IS the whole session. Before this, the reverse sweep
 *  quietly COLLECTED a published weekend's credits the moment the user
 *  navigated to another week — the recorded known-issue, now closed. */
/** What the sync wire wants a person's day to hold: the credit code and the
 *  WHY that becomes the tracker's reason (`FLT`, `SIM + Duty`, an input's
 *  type name — owner, 2 Sep 26). */
export interface DesiredOil {
  code: 'FO' | 'HO'
  why: string
  /** the published schedule, or a duty-and-commitments input the owner
   *  accepted — what the credit's giver reads as on screen (owner, 21 Sep 26) */
  via: 'schedule' | 'input'
  /** the actual work times on the day (not the gap-inclusive envelope) —
   *  what a leave or a medical must not overlap (clash check B4, §26.3) */
  spans: Array<[number, number]>
}

/* A date is PROTECTED when the schedule evidence behind it cannot be read as an
   ISSUED document — a pre-Phase-2 (unsupported) book, a stash filed under the
   wrong week, or an approved day whose snapshot was undone away. For such a date
   the OIL wire must neither DERIVE a credit from the live/stashed DRAFT (which
   may have dropped the duty) NOR DELETE a credit already landed by the build that
   issued it: the issued evidence is unavailable, so the standing credit is the
   best truth we have (P2-IMPL-01). Never substitute draft content for missing
   issued content, and never reverse-collect a protected date. */
/* WHAT ONE ISSUED DAY EARNS — the only door credit comes through since
   [OIL-AUTO-REMOVE] (§7.1). The day's own frozen OIL EVIDENCE BLOCK answers
   everything: the scheduler's decisions, the duty-and-commitments claims
   projected at publication, and the people each ALL / ALL AVAIL puck stood for.
   Nothing live is consulted, so revising an answer or filing a leave cannot
   move an already-issued credit — that now costs a publication, like every
   other change to an issued day.

   A snapshot carrying NO block was issued by a build that did not store one. Its
   evidence cannot be reconstructed (rebuilding it from today's unapproved inputs
   is exactly what §7.5 forbids), so the date is PROTECTED rather than guessed
   at: the landed credit stands and nothing new is derived — the same rule the
   pass already applies to an unresolvable snapshot. Returns false to say so. */
function creditFrom(day: Day, iso: string, add: (p: string, iso: string, sp: OilWork[], via?: 'schedule' | 'input') => void, blocks?: Map<string, OilEvidence>): boolean {
  const ev: OilEvidence | undefined = day && day.oilev
  /* the block's own date must be the date we are crediting. The evidence carries
     its ISO precisely so this binding can be checked, and a block that does not
     match the date it was found under is a misfiled document, not a licence to
     pay against it — so the date is PROTECTED, exactly like a missing block. */
  if (!ev || ev.iso !== iso) return false
  /* the block this date's OIL comes from — its own full-day line faces the pooled envelope below ([OIL-WORK-START]) */
  if (blocks) blocks.set(iso, ev)
  for (const [person, sp] of Object.entries(oilEarnedWork(day, ev))) {
    /* the two halves POOL into one envelope per person per date, and the credit
       reads as the SCHEDULE's when the schedule earned any of it — that is the
       stronger evidence, and it is what the reader would go and look at (owner,
       21 Sep 26). */
    add(person, iso, sp, sp.some(w => w.via !== 'input') ? 'schedule' : 'input')
  }
  return true
}

/* `back` reads one loaded-week day from ANOTHER version — the one an Unpublish would leave as the issued schedule, or a
   draft (`ver` null), which earns nothing — so the warning before an Unpublish asks this same body what the war would
   be owed afterwards ([UNPUB-WARN-AL-RESTORES], 20 Oct 26). Read only: nothing here writes. */
/* WHOSE OIL THE LEAVE WAR WORKS OUT (multi-squadron batch 1, step 3): the squadron whose war is loaded — since step 4
   each squadron has a war of its own, and signing in loads the person's own (swapWarWorld, below; D2132) — never the
   schedule in view, which a viewer of the other squadron's schedule moves without touching anyone's OIL. Before anyone
   signs in (a headless test, the boot) it is the boot unit's. */
export const warUnit = (): string => worldUnit()

/* ---- ONE WORLD PER SQUADRON: SIGNING IN LOADS HIS OWN (multi-squadron batch 1, step 4 — the plan §3.4) ----------------
   The boot loads the boot unit's war (src/boot.ts) before anyone has signed in; the war a person opens is his own
   squadron's (D2132), so a sign-in whose home is another squadron loads that squadron's world in its place — read
   through its own door (storage/adapters.ts leavewarAdapter(wb, unit)), exactly as the boot reads one: the war's rows,
   then its roster (that squadron's people), then the boot's own passes (the absences from the Inputs, the postings, the
   OIL from that squadron's published days), and a fresh Undo baseline. The page's and this file's subscribers stay
   (keepListeners) — the war's screens repaint on the new world as on any change. Signing out reloads the app (ui/logout.ts),
   so a page holds one person's squadron at a time; a swap back to the boot unit (a headless sign-out) is the same path.
   No door (a unit test that boots the war alone) — nothing to swap. */
export type WarWorldDoor = (unit: string) => { backend: StorageBackend; started?: boolean; seedDemo?: boolean }
let WORLD_DOOR: WarWorldDoor | null = null
export function setWarWorldDoor(d: WarWorldDoor | null): void {
  WORLD_DOOR = d; storedMoved()
  /* the same doors write another squadron's stored war for Admin → Users' four doors (A3 — state/foreign.ts); a write
     there drops the stored worlds read here, so the next read sees it */
  setForeignDoor(d ? (u => d(u).backend) : null, storedMoved)
}
/** load `unit`'s Leave War in place of the one loaded — false where it already is, or no door was handed over */
export function swapWarWorld(unit: string): boolean {
  if (!WORLD_DOOR || !unit || unit === worldUnit()) return false
  const d = WORLD_DOOR(unit)
  lwInitStore(d.backend, { started: d.started, seedDemo: d.seedDemo ?? true, unit, demoRecords: false, keepListeners: true })
  /* the world that WAS loaded is now read from its door like any other squadron's, and the one loaded no longer is */
  storedMoved()
  setPeople(projectPeople(getState().showSans))
  setViewer(mirroredViewer()); mirrorCallsign()
  runPoArchive()
  refreshAbsences(true)
  absencesChanged()
  runOilPass()
  lastOilDaySig = oilDaySig()
  lwHistInit()
  return true
}

/* WHOSE PUBLISHED DAYS, AND WHOSE CREDITS (multi-squadron batch 1, step 3). A squadron's OIL comes from ITS OWN
   published days and lands only on ITS OWN people (homeUnitOf on the date) — never from the schedule in view: switching
   from 142's week to 149's same week must move nobody's credit, and 149's pass must never sweep away a credit 142's
   published Saturday owes a 142 man. `unit` is the squadron whose calculation this is (the Leave War's — warUnit). When
   it is the schedule in view its loaded week is read live (DAYS / SCHED) and its other weeks from the stash; any other
   squadron's weeks are ALL in the stash (the swap stashed the week it left — state/store.ts switchUnit), read by their
   unit-qualified keys. (A man borrowed onto the other squadron's line — batch 3, D2183 — is not this step's.) */
function desiredOilCells(back?: { di: number; ver: string | null }, unit: string = warUnit()): { desired: Map<string, DesiredOil>; protectedDates: Set<string> } {
  const protectedDates = new Set<string>()
  const live = unit === UNIT
  /* HIDING A MAN MUST NOT DESTROY HIS MONEY (owner, 21 Sep 26 — "There's no way
     to credit OIL to SANs even when they are hidden?"), and neither must
     ARCHIVING him (Astra, 21 Sep 26, confirmed by the owner as R-2).
     This guard used to consult the LIVE Leave War roster, which made the roster
     a second credit authority sitting behind `creditFrom`: archive a man on the
     Monday and the reverse sweep deleted the day in lieu an ISSUED Saturday had
     already promised him — no amendment, no record, no way to see it happen.
     Who earned was decided when the day was published and frozen in its
     evidence; nothing the roster does afterwards may reopen that. A credit lives
     on the person and the date, not on a grid row, so it lands and waits: turn
     "Show SANS" on, or bring an archived man back, and his row arrives with
     everything he earned already in it.
     What the guard rejects now is the only thing that was never a person: a
     SENTINEL. A named GROUND-CREW body is deliberately creditable — they ride
     the Leave War roster (owner, 18 Aug 26) and a scheduler who names one on a
     weekend row means it (O-2, "leave it", 21 Sep 26). */
  const creditable = (id: string, iso: string) => {
    const p = rosterBody(id)
    /* [POST-OUT-OUTCOMES] (D299 — "his OIL balance" goes; the plan's Round 1): a DELETED man earns nothing on or after
       his cutoff — not even from a published day to come that still carries him until it is re-issued. Before it, his
       credits stand (the past keeps its record). */
    return !!(p && !p.special && !(p.deleted && iso >= String(p.deletedFrom || ''))) && homeUnitOf(id, iso) === unit
  }
  /* person|iso -> that day's work spans; their ENVELOPE faces the threshold */
  const pool = new Map<string, OilWork[]>()
  /* iso -> the issued block that date's work was read from. One date comes from exactly one version (the loaded week's
     or one stashed week's), and the full-day line its envelopes face is THAT version's own — the Logic value as it
     stood when the day was published, never today's ([OIL-WORK-START] — owner, D592 (4): "a published day keeps the OIL
     it went out with"). The work spans are already measured with the version's own leads (oilev.ts oilDayWork). */
  const blocks = new Map<string, OilEvidence>()
  /* which of those days the PUBLISHED SCHEDULE earned, as opposed to a duty
     input the owner accepted — what the credit's giver reads as on screen
     (owner, 21 Sep 26). A day backed by both is the schedule's: that is the
     stronger evidence, and it is what the reader would go and look at. */
  const fromSchedule = new Set<string>()
  const add = (person: string, iso: string, spans: OilWork[], via: 'schedule' | 'input' = 'schedule') => {
    /* The same unknown-person guard both leave directions carry: a row naming
       someone the war has no business crediting — ground crew, a sentinel —
       must not become a grid row no matrix draws. A SANS man the war is merely
       HIDING is not that case (see `creditable` above). */
    if (!creditable(person, iso) || !spans.length) return
    const k = `${person}|${iso}`
    const arr = pool.get(k) ?? []
    arr.push(...spans)
    pool.set(k, arr)
    if (via === 'schedule') fromSchedule.add(k)
  }
  /* CLASSIFY the live book FIRST (P2-REREVIEW-05): an unsupported / wrong-week /
     future-version book must be quarantined even if its snapshots still resolve,
     so the whole loaded week's credit-bearing dates are protected up front. */
  /* a DAMAGED loaded week (P2-REV2-01) shows the seed as a placeholder, so
     amFormatOf(SCHED) would read 'current' — isPreservedWeek catches it so its
     credit-bearing dates are protected, never derived from the seed. */
  const liveUnsupported = amFormatOf(SCHED, CURWEEK) === 'unsupported' || isPreservedWeek(CURWEEK)
  for (let di = 0; live && di < DAYS.length; di++) {
    const iso = labelToISO(DATES[di])
    /* ONLY THE ISSUED SCHEDULE PAYS, BOTH DIRECTIONS (owner, 21 Sep 26 — R-1).
       This gate used to read the war's calendar LIVE, before the issued block
       was ever opened, and that made the two directions disagree: whether the
       day EARNS is frozen into the evidence, but whether it is a non-working day
       at all was answered by today's calendar. So taking a public holiday off a
       published day swept everybody's day in lieu on the next pass — silently,
       with no amendment and nothing on screen — while declaring one paid nobody.
       Now only an unreadable date skips before the snapshot is resolved, and the
       frozen `ev.earns` decides in both directions. A day that starts earning
       after it went out waits for a republication, and validateCore says so on
       the day (OIL_STALE_DAY). */
    if (!iso) continue
    if (liveUnsupported) { protectedDates.add(iso); continue }
    if (!dayApproved(di)) continue
    const swapped = !!back && back.di === di
    if (swapped && back!.ver == null) continue            // withdrawn to a draft: it earns nothing
    /* only ever credit from the RESOLVED ISSUED snapshot — never the live draft.
       No snapshot (an orphaned approved day) → protect it (P2-IMPL-01). */
    const snap = daySnapOf(di, swapped ? back!.ver : dayCurVer(di))
    if (!snap || !snap.d) { protectedDates.add(iso); continue }
    if (!creditFrom(snap.d, iso, add, blocks)) protectedDates.add(iso)
  }
  /* every OTHER week, out of its stash entry — the loaded week is skipped
     (its stash is at best a stale copy of the live model read above) and a
     blob that fails to parse reads as never stashed, the stashDays rule.
     The ISO comes from the week key + day index directly (v is the Monday,
     dd/mm/yyyy) — no label parsing, no year-convention trap. */
  for (const v of stashUnitKeys(unit)) {
    if (live && String(v) === String(CURWEEK)) continue
    /* (the stash's key is the unit's: the same Monday of 142's and 149's are two weeks) */
    const qv = qualify(unit, String(v))
    if (stashGet(qv) == null) continue
    const wk = stashOilWeek(qv)
    /* CLASSIFY the stashed book (P2-REREVIEW-05): an UNREADABLE stash (wk null)
       or one whose book is unsupported / wrong-week / future-version must have
       ALL its credit-bearing dates PROTECTED — never derived from, never deleted
       — even though a future-version book's snapshots might still resolve. */
    const stashUnsupported = !wk || amFormatOf(wk.sc, String(v)) === 'unsupported'
    for (let di = 0; di < 7; di++) {
      const iso = weekDayISO(String(v), di)
      /* the same rule as the loaded week above (R-1): the frozen block decides,
         never today's calendar. */
      if (!iso) continue
      if (stashUnsupported) { protectedDates.add(iso); continue }
      if (!(wk!.sc.dayOK || {})[di]) continue
      /* the stash's OWN week key (v = its Monday, dd/mm/yyyy) is the trusted
         identity threaded into the resolver, so a book self-consistent but filed
         under the WRONG week is rejected here rather than credited to these dates
         (P2-R3-03). Credit ONLY from a resolved issued snapshot; no snapshot →
         protect the date, never fall back to its stashed draft (P2-IMPL-01). */
      const snap = daySnapIn(wk!.sc, di, dayCurVerIn(wk!.sc, di, String(v)), String(v))
      if (!snap || !snap.d) { protectedDates.add(iso); continue }
      if (!creditFrom(snap.d, iso, add, blocks)) protectedDates.add(iso)
    }
  }
  const out = new Map<string, DesiredOil>()
  for (const [k, spans] of pool) {
    if (protectedDates.has(k.slice(k.indexOf('|') + 1))) continue   // never desire a protected date (P2-IMPL-01)
    const amt = oilAmount(blocks.get(k.slice(k.indexOf('|') + 1)), spans)
    if (amt) out.set(k, { code: amt === 1 ? 'FO' : 'HO', why: oilWorkWhy(spans), spans: workSpans(spans), via: fromSchedule.has(k) ? 'schedule' : 'input' })
  }
  return { desired: out, protectedDates }
}

/* the day's work spans clipped to the date and merged where they touch — the stored shape of an auto credit's times:
   `workSpans` is engine/oilev.ts oilWorkSpans (moved there 6 Oct 26, [OIL-WORK-START], unchanged — the comparison that
   says a published record would change under today's Logic values reads the same body the record is written with) */

/* THE PUBLISH DOOR ([ARCH-STACK] step 4).
 *
 * PUBLISHING NO LONGER THROWS A BID AWAY — it FLAGS the day and says so
 * (owner, 20 Sep 26, answering the last of the three questions the
 * consolidation review left open). It used to replace the clashing part of
 * every undecided leave bid the published work overlapped, and leave a notice
 * saying the schedule had taken it. Meanwhile a bid placed AFTER the publish
 * was kept and the day flagged. The same two facts, opposite outcomes, decided
 * only by which came first — the exact thing the owner's own rule was meant to
 * kill:
 *
 *   "Two different facts fighting → let both in, and flag the day."
 *
 * Put to him with both ways out spelled out; he chose "keep the bid and flag
 * the day, both ways".
 *
 * This SETS ASIDE the SECOND half of clash check B5 — "publishing is the door
 * that replaces an undecided bid, so undo of the publish brings the bid back".
 * (Its first half, "a bid made after the publish is refused at the bid door",
 * was already set aside the same day by `barsWrite`.) With nothing removed
 * there is nothing for an undo to bring back, which is a simplification rather
 * than a loss.
 *
 * The amber costs no machinery: the OIL credit lands on the day regardless
 * (`ingestDutyCredit`, the owner's "the credit always lands" ruling), and a
 * credit overlapping an undecided bid is already a `forbiddenPair`, so the day
 * flags itself and the warning list already names it. All this door does now
 * is TELL the admin at the moment of publishing, because the one thing the old
 * behaviour got right was that he found out immediately.
 *
 * Weekend and public holidays only, as before — weekday work never reaches the
 * war at all. Reads the RESOLVED issued snapshot, the same evidence the OIL
 * pass credits from. */
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* A WORKED DAY THAT EARNS NOBODY ANYTHING SAYS SO (owner, 20 Sep 26 — "Yes i
   want a warning … At the moment you publish").
 *
 * His own case: a man on the SDO desk for a Sunday, the day published, no OIL.
 * The desk had no start and no end, so it measured nothing and minted nothing.
 * Correct, and silent — a man's leave balance short with no screen admitting
 * it. This is the backstop for anyone who published past the day's own warning
 * strip, which is where the cheap fix is (a blank desk costs nothing to fill
 * before signing; after publishing it costs an amendment).
 *
 * Weekends and public holidays only, and only from the RESOLVED ISSUED
 * snapshot — the same evidence the credit itself is drawn from, so the warning
 * can never disagree with the OIL. */
/* `told` — THE FIRST FORM, IN TWO HALVES, FOR THE NOTE THAT FOLLOWS THE DAY'S OWN PUBLISH NOTE (owner D837, 14 Oct 26 —
   the passing note N1). `line` is the sentence exactly as it has always been said, and is what is shown wherever this
   note stands by itself or behind an amendment's receipt. `told` hands the one join that may fuse it with "Monday
   published and approved" (ui/toast.ts toastBatch) the day it names and what it says of it, so the pair reads "Monday
   13 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL." — the day once.
   There, and only there, the Common Programme wears the capitals of its heading on the schedule, as his approved
   wording has it. The second form ("… earned nobody any OIL — …") is not on his list of 13 Oct 26 and has no `told`:
   it is joined by the dot, as before, and so are the two lines below that may ride behind either form. */
type BlindLine = { line: string; told?: { head: string; body: string } }
function oilBlindLine(iso: string, day: Day, spans: Record<string, OilWork[]>): BlindLine | null {
  const blind = dayOilBlind(day)
  if (!blind.length) return null
  const earners = Object.values(spans).filter(sp => workSpans(sp).length).length
  const when = `${WEEKDAY_NAMES[weekday(iso)]} ${dm(iso)}`
  const { list, verb, desk } = blindDesks(blind)
  /* "the SDO desk has", but "the ground programme has" — the wrapper only fits
     a duty desk's bare role name (Fable, 21 Sep 26). */
  const desks = desk ? `the ${list} desk${blind.length > 1 ? 's' : ''} ${verb}` : `${list} ${verb}`
  /* "no USABLE times", for the same reason as the day's own warning (the
     follow-up code read, G1): a nought-minute standalone shift is on this list
     and it HAS two times typed on it. */
  const so = `no usable times, so nobody on ${blind.length > 1 ? 'them' : 'it'} earns OIL`
  return earners
    ? { line: `${when}: ${desks} ${so}`, told: { head: when, body: `${desks.replace('the common programme', 'the Common Programme')} ${so}` } }
    : { line: `${when} earned nobody any OIL — ${desks} no usable times` }
}

export function publishFlagsBids(di: number): void {
  const iso = labelToISO(DATES[di])
  /* THE `warHolding` TEST USED TO BE HERE, AND IT MADE THE BRANCH BELOW DEAD
     (Codex M8, 21 Sep 26). Returning on "no war" several lines before the code
     that handles a day no war covers meant that code could never run, so any
     repair written against it would have shipped nothing. The war is resolved
     further down, where it is actually needed. */
  if (!iso || !isNonWorkingISO(iso) || !dayApproved(di)) return
  const snap = daySnapOf(di, dayCurVer(di))
  if (!snap || !snap.d) return
  /* THE WARNING MUST READ THE SAME BLOCK THE MONEY DOES (Fable, 21 Sep 26 — the
     one caller left resolving a sentinel its own way). It used to walk the raw
     schedule and expand ALL AVAIL through the LIVE roster, knowing nothing about
     the day blanket, the event switches or the per-man decisions. So it could
     tell a scheduler that a man's leave bid now sat on published work when he
     had been taken off that event and no credit would ever land — sending him
     looking for a clash that did not exist — and its "earned nobody" sentence
     could be wrong under a blanket, where everyone has hours and nobody earns.
     A block-less snapshot is PROTECTED, so there is nothing to warn about. */
  const ev: OilEvidence | undefined = snap.d.oilev
  if (!ev) return
  const spans = oilEarnedWork(snap.d, ev)
  /* ONE MESSAGE, BOTH FACTS (Astra, 21 Sep 26). The strip at the foot of the
     screen is a single element whose text is REPLACED, so speaking twice in the
     same breath showed only the second — and the one that got swallowed was the
     silent-OIL warning, the whole point of the ruling. Both lines are collected
     and delivered together. */
  const lines: string[] = []
  const blind = oilBlindLine(iso, snap.d, spans)
  if (blind) lines.push(blind.line)
  /* said as ONE toast, as before; where the blind line is its first form, the toast also carries that line's two halves
     and whatever follows it (`after`), for the join with the day's own publish note (oilBlindLine above) */
  const say = () => HOOKS.toast(lines.join(' · '), 'warn', blind?.told && { day: di, ...blind.told, after: lines.slice(1).join(' · ') })
  const war = warHolding(rawState().wars, iso)
  /* amber, like the Inputs page's twin (N18, 21 Sep 26): this is a warning,
     not the face the app says "Saved" in. Both exits, because the day with
     no war is exactly the one a reader is least expecting a clash on. */
  if (!war) {
    /* AND NOW IT HAS SOMETHING TO SAY (owner's ruling D19, 22 Sep 26).
       Publishing is exactly the moment the scheduler expects the money to move,
       so it is the moment to tell him it cannot: no period holds this date, so
       there is nowhere for the credit to be written. The day's own warning list
       says the same thing and carries the way out. */
    lines.push(`there is no leave war period for ${iso.slice(0, 4)}, so no OIL can be earned for this day — create the period on the Leave War`)
    say(); return
  }
  const said: string[] = []
  for (const [person, sp] of Object.entries(spans)) {
    const wins = workSpans(sp)
    if (!wins.length) continue
    for (const r of recsAt(war.recs, person, iso)) {
      if (r.kind !== 'request' || r.state === 'refused') continue
      if (!wins.some(w => overlaps(w, requestWin(r.code)))) continue
      said.push(`${cs(person)}'s ${r.code.replace(/\*/g, '')} bid on ${dm(iso)}`)
    }
  }
  if (said.length) lines.push(`${said.join(', ')} now sits on published work — the day is flagged, the bid is still live`)
  if (lines.length) say()
}

/* [GLOBAL-UNDO] §6.6 — the Unpublish button's warn. Unpublishing a loaded-week day
   withdraws that day's weekend/holiday OIL credits on the Leave War (desiredOilCells
   skips an unapproved day); republish re-credits, so the gap is momentary. But if a
   person the day credits has already SPENT enough OIL that losing this credit would
   put their balance negative, a bid placed against it surfaces as a clash in the gap.
   True when withdrawing di's credit would push any credited person's OIL balance
   below zero — the "credits already bid against" case the button warns on. Read-only:
   safe to call from the click handler before running the forward unpublish.
   WITHDRAWING AN AMENDMENT IS NOT WITHDRAWING THE DAY ([UNPUB-WARN-AL-RESTORES] — Astra's F2 on
   [OIL-WORK-START], 6 Oct 26; built 20 Oct 26). The Original withdrawn makes the day a draft and it earns nothing; an
   ALn withdrawn makes the version before it the issued schedule again, and THAT version's OIL pays — read from its own
   kept evidence and Logic values, through the same desiredOilCells the pass lands credits from. So the balance is
   rebuilt with the credit the day will carry AFTERWARDS in place of today's (none, for a draft): a withdrawal that puts
   back a full day where AL1 cut it to a half raises his balance and no longer warns. */
export function oilCreditBidAgainst(di: number): boolean {
  const iso = labelToISO(DATES[di])
  if (!iso) return false
  /* the loaded week's day is the schedule in view's, so its squadron's calculation is asked (multi-squadron step 3) */
  const { desired } = desiredOilCells(undefined, UNIT)
  const after = desiredOilCells({ di, ver: unpublishBackTo(di) }, UNIT)
  /* a date the pass would PROTECT afterwards keeps its landed credit as it is (desiredOilCells' P2-IMPL-01) — nothing
     of today's balance moves, so nothing can be stranded */
  if (after.protectedDates.has(iso)) return false
  for (const [key, d] of desired) {
    const bar = key.indexOf('|')
    if (key.slice(bar + 1) !== iso) continue
    const person = key.slice(0, bar)
    /* [GLOBAL-UNDO] Fable#5 / Codex GU-P2-009 — only a credit that ACTUALLY LANDED as
       a Raptor-owned FO/HO cell can be withdrawn. A desired credit blocked by an
       existing manual cell (runOilPass returns a clash) never landed and is not in the
       balance, so counting it would falsely warn for anyone at a low balance. */
    const landed = rawState().wars.some(w => recsAt(w.recs, person, iso).some(r => r.kind === 'credit' && r.oil === 'auto' && r.code === d.code))
    if (!landed) continue
    /* ASK THE TRACKER'S OWN QUESTION, ON THE TRACKER'S OWN DATE (both
       reviewers, 21 Sep 26).
       It first asked `balanceOf`, which sums what every day earns and knows
       nothing about EXPIRY, while the tracker applies the squadron's policy —
       so the warning stayed silent while the tracker read zero. The first fix
       swapped the formula but measured AS OF THE DAY BEING UNPUBLISHED, which
       reports every credit that was alive back then as alive now, and left the
       same hole open a different way.
       And subtracting the credit's worth was never the right sum: expiry and
       FIFO are not linear. A credit that expired unused is worth nothing to
       take away, and removing a live one can strand a LATER debit that had
       drawn on it. So the ledger is rebuilt with that credit left out — the
       actual counterfactual — as of today, through the same `figureCtxOf()`
       the tracker reads, so the two cannot diverge on the figure OR the date.
       Only the SCHEDULE'S credit goes; an award on the same day stays in the
       balance and is none of this button's business (N16). */
    const stays = after.desired.get(key)
    const worth = stays ? codeWorth(stays.code) : 0          // an automatic credit is its code's own worth (engine/credit.ts)
    const ctx = figureCtxOf()
    const without = oilLedgerOf(ctx, person, c => (c.date === iso && c.source === 'auto' ? worth : false))
    /* …and only a press that LOWERS him warns (the scenario designer's U-12, 20 Oct 26): a man already below zero for
       other reasons — the demo's DECAL starts at −4.5 — is not stranded by a withdrawal that puts back as much as it
       takes, so it says nothing; one that takes more than it puts back still warns. */
    if (without.balance < 0 && without.balance < oilLedgerOf(ctx, person).balance) return true
  }
  return false
}

export function runOilPass(): void {
  if (SYNCING) return
  SYNCING = true
  try {
    const unit = warUnit()
    const { desired, protectedDates } = desiredOilCells(undefined, unit)

    /* Forward: land what the published schedule earns, with its work times.
       An unchanged credit writes nothing (ingestDutyCredit answers
       'confirmed'). A credit whose TIMES overlap leave, a medical or an
       undecided bid on that day is the clash — never placed (clash check B4;
       a credit beside a non-overlapping absence lands, so a worked Saturday
       morning + afternoon leave keeps its OIL). */
    for (const [key, { code, why, spans, via }] of desired) {
      const at = key.indexOf('|')
      const person = key.slice(0, at)
      const date = key.slice(at + 1)
      if (!warHolding(rawState().wars, date)) continue
      ingestDutyCredit(person, date, code, why, spans, via)
    }

    /* Reverse: a GENERATED credit no published work still earns goes. Only
       `auto` credits — a hand-typed one is the admin's (design §18 OA3-003). */
    for (const war of rawState().wars) {
      for (const [person, row] of Object.entries(war.recs)) {
        for (const [date, list] of Object.entries(row)) {
          if (!list.some(r => r.kind === 'credit' && r.oil === 'auto')) continue
          /* only what THIS squadron's calculation owns: a man whose home that day is another squadron is that
             squadron's pass's to keep or collect (multi-squadron step 3) */
          if (homeUnitOf(person, date) !== unit) continue
          if (protectedDates.has(date)) continue         // issued evidence unavailable → the landed credit stands (P2-IMPL-01)
          if (desired.has(`${person}|${date}`)) continue
          clearRaptorCell(person, date)
        }
      }
    }

    /* The strip is DERIVED from the day views, and only from them (20 Sep 26).
       Since the owner's ruling the credit always lands, so a credit that
       overlaps an absence IS a conflict on the day and `publishLeaveClashes`
       finds it — with the record it actually clashes with. The second list
       this pass used to keep alongside it read the day's BOX instead, which
       after the credit landed said the day held … the credit, giving the strip
       "earns FO but 18 Jul holds FO". One list, derived, no duplicate.
       It must run AFTER the credits are written, or it re-derives the world as
       it was before this pass. */
    publishLeaveClashes()
  } finally {
    SYNCING = false
  }
}

/* ---- wire 0 upkeep: the roster stays a live projection ------------------- */

/* A stable signature of the roster, so a re-projection that changed nothing
   does not churn a re-render. Every projected field is in it; the order is
   `projectPeople`'s own, which is deterministic. */
/**
 * Re-project Raptor's PEOPLE onto the Leave War roster (owner, 18 Aug 26 —
 * "when I add personnel through quals, the new personnel will appear on leave
 * war too"). The roster is a boot-time projection; without this a body added
 * on the Quals page mid-session never reached Leave War, and reload no longer
 * helps now the app is session-only. (A person is added on Admin → Users since
 * [ACCOUNTS-NEW-PERSON], 26 Sep 26 — D217; the projection is the same.)
 *
 * ADDITIONS AND REMOVALS ONLY. A body Quals gains is appended; a body it loses
 * is dropped; every EXISTING person's record is left exactly as it is. This is
 * deliberate: it lands the owner's ask (a new person shows up) without the
 * reconciler overwriting the demo overlay's posting dates, which a wholesale
 * re-projection silently reverted on the next Raptor notify. (The war's own
 * person sheet — `setPerson`, seat / band / SXO — is gone: D460, D461.) A field change to an EXISTING person on the Quals page
 * therefore reaches Leave War on the next reload rather than live — the rare
 * case, and the safe direction to err. Writes only when the set of ids
 * actually changed, so an ordinary leave edit does not repaint the grid; the
 * hand-order and personnel labels are keyed by id, so they reconcile for free.
 */
function reprojectRoster(): void {
  const st = getState()
  // showSans is the owner's SANS enable switch (store.ts:setShowSans): the
  // projection drops SANS aircrew unless it is on.
  const projected = projectPeople(st.showSans)
  const curById = new Map(st.people.map(p => [p.id, p]))
  // Raptor owns identity (store.ts §setPeople), so take each person fresh from
  // the projection — that is what carries a Quals change (a new SXO mark, a CAT
  // move, a seat swap, a re-callsign) through to Leave War on the next notify,
  // which the old additions/removals-only pass never did (owner, 18 Aug 26 —
  // an SXO marked in Quals did not show here). Then lay back the one thing
  // Leave War owns locally: the posting-out window (from/to). Seat, band and SXO
  // are the projection's alone — Quals is the one place they change (D460,
  // D461). A person Raptor no longer has drops out — they are simply absent
  // from `projected`.
  /* the posting window: the STORED record, through the one body setPeople lays it with ([POST-OUT-OUTCOMES] —
     windowFor; Astra A4: the SANS outcome lays no window while Show SANS is on, and two overlays laying it differently
     would defeat that); a window with no record behind it (the demo overlay's, first boot) keeps today's carry-over */
  const next: Person[] = projected.map(pp => {
    const ex = curById.get(pp.id)
    const merged: Person = { ...pp }
    const rec = st.postOuts[pp.id]
    if (rec) Object.assign(merged, windowFor(rec, st.showSans))
    else if (ex) { merged.from = ex.from; merged.to = ex.to; merged.poArchive = ex.poArchive; if (ex.past) merged.past = ex.past }
    return merged
  })
  // A POSTED-OUT person stays on the war after their Raptor body is archived
  // (owner, 19 Aug 26 — "their data will still be kept on the previous
  // schedules… nothing will be altered"): the auto-archive pass below (and
  // Archive on Admin → Users — [ONE-DOOR]) takes them out of the projection, but their leave history is
  // still what the past months show, and the month-window row filter is what
  // hides them from the months after they left. So an existing person with a
  // posting-out window who dropped out of `projected` is KEPT, identity
  // frozen as last projected. A body archived WITHOUT a posting-out window
  // still leaves at once — once the Quals ✕'s "should never have been here"; since
  // [ONE-DOOR] (D323) Archive always closes his stint, so only a man never here (his
  // post-in still to come) leaves this way.
  /* [POST-OUT-OUTCOMES]: the window a kept man carries is the RECORD's (a SANS posting shown with Show SANS on has no
     window on the person, and must still be kept once the switch goes off); a man DELETED on the Raptor side (D287,
     D290) is kept the same way — the months he was here keep his record (D299) — and marked `gone`, so no posting door,
     no OIL tracker row and no writer takes him (Fable F6) */
  const nextIds = new Set(next.map(p => p.id))
  for (const p of st.people) {
    if (nextIds.has(p.id)) continue
    const rec = st.postOuts[p.id]
    /* (A1: his squadron stints read fresh, as the projection lays them — a kept row never carries old ones) */
    const fresh = laidHome(homeStintsFor(p.id, worldUnit()))
    const { home: _old, ...bare } = p
    const kept: Person = rec ? { ...bare, ...windowFor(rec, false), ...fresh } : { ...bare, ...fresh }
    if (kept.to === null) continue
    if (rosterBody(p.id)?.deleted) kept.gone = true
    /* the final code reads (Fable F4, Astra 2 — both, 27 Sep 26): an ARCHIVED man renamed on Admin → Users (Save name)
       carries his new callsign here too — the war knows him by id, and a rename is a label (as on every flown day). A
       DELETED man keeps the name he flew under: his callsign is free for someone else (D297) */
    const body = rosterBody(p.id)
    const renamed = !!body && !body.deleted && !!body.cs && String(body.cs) !== kept.callsign
    next.push(renamed ? { ...kept, callsign: String(body.cs) } : kept)     // a copy: `kept` may be the store's own row
  }
  // Write only when a roster-visible field actually changed, so an ordinary
  // Raptor notify (a schedule edit touching no roster field) stays a cheap
  // no-op instead of thrashing the matrix on every keystroke.
  // scd/scn ride the signature so a Quals-page SC DAY / SC NIGHT tick — a
  // change no other field carries — still writes the roster and recounts the
  // SC team rows (owner, 19 Aug 26: quals edits must update the leave war).
  // The qualification catalogue rides the same reprojection (owner, 19 Aug
  // 26 — the counter form's chips must show a qualification the moment the
  // squadron adds one). Its own change guard, before the roster's early
  // return: the catalogue is derived from the same PEOPLE, but guarded
  // separately so neither write depends on the other having changed.
  const catalog = qualCatalogue()
  if (JSON.stringify(catalog) !== JSON.stringify(st.qualCatalog)) setQualCatalog(catalog)
  // xq is sorted at projection, so an unchanged qual set compares equal here.
  const sig = (p: Person) =>
    `${p.callsign}|${p.seat}|${p.band}|${p.sxo ? 1 : 0}|${p.q || ''}|${p.scd ? 1 : 0}|${p.scn ? 1 : 0}|${p.pers ? 1 : 0}|${p.label || ''}|${p.from || ''}|${p.to || ''}|${p.poArchive === undefined ? '' : p.poArchive ? 1 : 0}|${p.poOutcome || ''}|${p.poDone || ''}|${(p.past || []).map(x => `${x.from || ''}~${x.to}`).join(',')}|${p.gone ? 1 : 0}|${p.san ? 1 : 0}|${(p.xq || []).join(',')}|${(p.home || []).map(x => `${x.from || ''}~${x.to || ''}`).join(',')}`
  const before = new Map(st.people.map(p => [p.id, sig(p)]))
  const unchanged = before.size === next.length && next.every(p => before.get(p.id) === sig(p))
  if (unchanged) return
  setPeople(next)
}

/* ---- post-out auto-archive (owner, 19 Aug 26) ---------------------------- */

/**
 * Archive the Raptor body of anyone whose posting-out date has ARRIVED
 * (owner, 19 Aug 26 — "on that live date itself… under quals, they will go
 * into an archive section"). Keys on THREE things, each deliberate:
 *
 * - `to !== null` and today past it — `to` is the last day IN, so the PO date
 *   itself (to + 1) is the first day this fires.
 * - `poArchive === true` — the sheet's "Archive on PO date" switch, stored
 *   explicitly by setPostOut. A custom PO with the switch off never archives,
 *   and a `to` that predates the switch (the demo overlay's windows) is left
 *   alone rather than read as consent.
 * - the Raptor body exists and is not already archived — which is also what
 *   makes the second pass over an unchanged world a no-op, the same
 *   fixed-point property every reconciler here has.
 *
 * Archiving ONLY sets the flag: pucks on published and past schedules render
 * from the slot values and PEOPLE[id] is still there, so nothing a scheduler
 * issued changes — the body just leaves every roster surface, and Admin →
 * Users' Archived group is where it lands (Quals' Archived section before
 * [ONE-DOOR], D310). The person STAYS on the leave
 * war (reprojectRoster's keep rule) so the months before they left still
 * show their history.
 */
/* ---- THE POSTING'S OUTCOMES ON ITS DATE ([POST-OUT-OUTCOMES], 27 Sep 26) -----------------------------------------
   Owner D229 (26 Sep 26): a posting out says WHICH it is, and the app does it on the date as the archive does today:
   'overseas' → archived (Admin → Users' Archived group since D310) AND his account suspended (D280); 'delete' → his account and his person deleted (D287,
   the hidden mark — state/person-delete.ts); 'sans' → SANS on the date (D283); 'none' → off the manpower, nothing else.
   It EXTENDS the auto-archive above (the same triggers — boot, every Raptor notify, every Leave War notify, so a date
   already come runs at once — and the same clock, the calendar date: `effectiveToday()`, the ONE clock a delete's cutoff
   uses too — the plan's Round 2).
   EACH EFFECT ONCE, NEVER UNDOING A LATER HAND CHANGE (the plan's Round 1): the posting records the date it ran for
   (`poDone`, cleared whenever its date or outcome changes), so an admin who enables the account by hand while the
   posting stands is not suspended again, and one who ticks SANS off is not overruled. Each effect carries its maker's
   mark — `archivedBy: 'po'` (#444's), the account's `offBy: 'po'`, the person's `sanBy: 'po'` — so a take-back
   (Undo post out, a date moved later, an outcome changed) takes back only what the posting made.
   The last admin who can sign in is never suspended or deleted by a posting: that outcome is skipped, said ONCE per
   posting per session (never on every notify — Fable's round 2), and retried silently on later passes.
   ONE projection command for the whole pass (a reconciler, the system actor — never the signed-in person's door),
   enlisting every store an outcome writes; a delete also writes the schedule and the week stash. */
/* said once per POSTING (its person, date and outcome) and reason — a changed posting may say it again (Astra's code
   read 2: keyed by the sentence alone, a posting changed away and back never said it again) */
const PO_TOLD = new Set<string>()
const tellOnce = (key: string, t: string): void => { const k = `${key}|${t}`; if (!PO_TOLD.has(k)) { PO_TOLD.add(k); HOOKS.toast(t, 'warn') } }
/* the pass's command QUEUED behind another command (the pass runs from a notify, and a notify inside another command's
   release runs while that command is still delivering — its projection then waits its turn, commit.ts §3.2 ph.9).
   Until it runs, the world still reads "due", and re-queueing it on every notify was an endless loop (found by the
   post-out tests, 27 Sep 26). Keyed by posting and date; cleared when the queued command runs or is refused. */
const PO_INFLIGHT = new Set<string>()
/* A PASS THE GATE REFUSED (the fix read, 18 Nov 26 — Opus 1): its own notify ran it again at once, refused again, until
   the page ran out of stack. A posting whose pass was refused is not tried again this session (it runs on the next
   load, once what refused it is put right); a refused pass of several is tried again one posting at a time, so one bad
   posting never holds the others back. Keyed as PO_INFLIGHT. */
const PO_REFUSED = new Set<string>()
/* the postings already given their one retry (refused, below) */
const PO_RETRIED = new Set<string>()
type PoDue = { id: string; poDate: string; outcome: PostOutcome; key: string }
/* is this man's posting due to run TODAY — the one test, read by the scan and again by the command when it runs (a
   queued command may run after the posting was changed or taken back) */
function poDueNow(id: string, today: string): PoDue | null {
  return poDueOf(id, getState().postOuts[id], today)
}
/* …the same test of any posting record — the loaded war's, or another squadron's as its stored war holds it (A5, A6) */
function poDueOf(id: string, rec: Person | null | undefined, today: string): PoDue | null {
  if (!rec || rec.to === null) return null
  const outcome = outcomeOf(rec)
  if (!outcome || outcome === 'none') return null
  const poDate = addDays(rec.to, 1)
  if (today < poDate || rec.poDone === poDate) return null
  const body = rosterBody(id)
  if (!body || body.special || body.deleted) return null
  return { id, poDate, outcome, key: `${id}@${poDate}:${outcome}` }
}
/* WHY A POSTING WAITS — the one answer the pass, the posting sheets and Admin → Users all read (the plan's Round 2 item
   3; Astra's code read 1 and 2, 27 Sep 26). A posting that cannot be carried out WHOLE does nothing at all — never half:
   - Overseas Sqn for the last admin who can sign in: neither archived nor suspended (it used to archive him first and
     only then find the account could not be suspended — half done);
   - Delete for the last admin who can sign in, or while a stored week to come cannot be read or changed (the same
     preflight Admin → Users' delete runs — the posting's door skipped it and could delete him with a week still
     holding him).
   It runs as soon as the reason goes (another admin can sign in; the week is repaired). The sentence, or null. */
export function poHeldReason(id: string, outcome: PostOutcome, poDate: string = effectiveToday()): string | null {
  const body = rosterBody(id)
  if (!body) return null
  if (outcome === 'overseas') {
    const a = accountOfPid(id)
    if (!a || !a.on) return null
    const lock = lastAdminLock(id)
    /* the lock worded per squadron where it is his squadron's (the fix read, 18 Nov 26 — Opus 5) */
    return !lock ? null : lock === 'app' ? `${body.cs} is the last admin who can sign in — the posting waits until another admin can`
      : `${body.cs} is ${lock.num}'s last admin. The posting waits until ${lock.num} has another admin.`
  }
  if (outcome === 'delete') return deleteBlocked(id) || stashPreflight(id, deleteCutoff(poDate))
  return null
}
/* for Admin → Users' row ([ONE-DOOR], D310 — "a posting waiting for its date shown on the row"): a posting out set on
   the Leave War whose date is still to come — "posting out 14 Oct · Overseas Sqn" — or a post-in still to come, the
   posting that brings him (a Restore with a later date, a new person added ahead of it — the walk's design, Fable 4.1:
   his sign-in works at once, D308, while the war does not count him yet, and nothing on his row said so) —
   "posting in 19 Oct"; or null */
export function postingPendingTag(id: string): string | null {
  /* the RECORD's dates first — Show SANS lays no window on the displayed row of a man whose SANS posting has run */
  /* HIS OWN SQUADRON'S POSTING (the fix read of the reshape — fable-3 F6; A6's neighbour, as `postingHeldNote` below): the
     war loaded's where he is its squadron's today, else his home's stored war — the master with 142 loaded read a 149
     man's row in 142's war, found no posting and showed no tag */
  const fu = foreignHome(id)
  const w = fu ? storedPostings(fu)[id] : getState().postOuts[id] || getState().people.find(p => p.id === id)
  if (w && !w.gone && w.from && w.from > effectiveToday()) return `posting in ${dayMon(w.from)}`
  if (!w || !w.to || w.gone) return null
  const poDate = addDays(w.to, 1)
  const o = outcomeOf(w)
  if (poDate > effectiveToday()) {
    /* a Delete still to come reads "auto delete" on his row (his D1105) — Admin → Users and the Leave War alike; the
       other outcomes keep their word, and a delete that has run shows nothing (he is gone) */
    const word = o === 'delete' ? ' · auto delete' : o && o !== 'none' ? ` · ${OUTCOME_WORD[o] || o}` : ''
    return `posting out ${dayMon(poDate)}${word}`
  }
  /* D326 (28 Sep 26 — "6 yes"): a posting that has RUN and left him on the roster — no outcome (D303), or SANS (D283) —
     says so on his row, where he otherwise looked like everyone else while the Leave War shows him posted out */
  if (!o || o === 'none') return `posted out ${dayMon(poDate)}`           // nothing to run: its date is the whole of it
  if (w.poDone !== poDate) return null                                  // come but held, or not yet run — the held note speaks
  if (o === 'sans') return `posted out ${dayMon(poDate)} · SANS`
  return null
}
/* for Admin → Users' account row: his posting has come and is waiting — why, or null. A6 (the reshape plan §6.2): HIS OWN
   SQUADRON'S posting — the war loaded's where he is its squadron's today, else his home's stored war (A3's second store
   reads it the same way), so the master with 142 loaded sees a 149 man's held posting on his row */
export function postingHeldNote(id: string): string | null {
  const u = foreignHome(id)
  const d = poDueOf(id, u ? storedPostings(u)[id] : getState().postOuts[id], effectiveToday())
  return d ? poHeldReason(id, d.outcome, d.poDate) : null
}
/* would a posting dated `poDate` run NOW — on the pass's own clock (poDueNow: today on or after the date)? The Post out
   sheet asks before it saves a Delete's date that answers yes (D1102 — [PO-MOVE-DATE-DELETE-ASK]) */
export function postingRunsBy(poDate: string): boolean { return poDate <= effectiveToday() }
/* THE POSTING PASS OVER EVERY SQUADRON (the reshape plan §6.2 A5, step 1): the loaded war's postings as ever, then — a
   whole pass only, never one posting's retry — every other squadron's, from its stored war (runForeignPostings, below) */
export function runPoOutcomes(only?: string): void {
  runLoadedPostings(only)
  if (only === undefined) runForeignPostings()
}
/* A POSTING WHOSE MAN IS NOT AT HOME IN ITS SQUADRON TODAY IS SKIPPED BY BOTH PASSES (§6.2 A5, step 2): the gate would
   refuse it (perms.ts postingPassViolation: his home before the pass must be the war's); skipped, it is neither run, nor
   marked done, nor tried again on every command, and nothing is said. It runs if he comes back; what a posting set before
   a move means is the Transfer batch's (batch 4). Only while each squadron has a world of its own, and never for a man
   whose squadron is not known (a shared store before its rows — the gate's rule) */
function awayFrom(id: string, unit: string, today: string): boolean {
  if (!WORLD_DOOR) return false
  const h = homeOn(id, today)
  return !!h && h !== unit
}
function runLoadedPostings(only?: string): void {
  if (SYNCING) return
  /* THE POSTINGS AS SAVED (fix read 13, item B — SEC13-1): a posting made up or rewritten in memory outside every command
     (a browser's console, a member's too) is put back to the saved one before the pass reads which are due — as the
     roster is (revertUnsavedPeople, below) — and again inside the pass's own command, before it reads them a second time.
     Never while another command is under way: a posting made today runs inside its own Post out command, and a pass woken
     as a command lands (its phase 8) would find that command's posting not yet written to its row */
  if (!cmdIsCommitting()) revertUnsavedPostOuts()
  const today = effectiveToday()
  const due: PoDue[] = []
  for (const id of Object.keys(getState().postOuts)) {
    const d = poDueNow(id, today)
    if (!d || PO_INFLIGHT.has(d.key) || PO_REFUSED.has(d.key) || (typeof only === 'string' && d.key !== only)) continue
    if (awayFrom(id, worldUnit(), today)) continue
    const held = poHeldReason(id, d.outcome, d.poDate)
    if (held) { tellOnce(d.key, held); continue }
    due.push(d)
  }
  if (!due.length) return
  /* ONLY ITS OWN CHANGE TO THE ROSTER IS SAVED ([SYSTEM-PASS-SAVES-ROSTER], D1510's security read, 29 Oct 26 — built
     31 Oct 26). The pass runs as the app itself, which the commit gate lets through, and its people store diffs against
     the SAVED roster — so a change made to a person in memory outside every command (a browser's console) was saved with
     it, unchecked. Run as its own command (at idle, or queued behind the command that woke it), the pass first puts the
     roster in memory back to what is saved (people-settings-commit.ts revertUnsavedPeople): every in-app roster write is
     saved by its own command before then, so only such a stray change is undone, and the pass's outcomes are the whole of
     its change — the commit gate holds that too (perms.ts ownershipViolation: a `lw.postoutRun` change to a person only
     beside his posting record). Raised INSIDE another command's reducer it joins that command (a posting made today runs
     inside the Post out command — one envelope, judged as its maker's), where the live roster holds that command's own
     unsaved change: nothing is put back then. A command the app itself runs (a projection) is the one parent the gate
     would not judge, so under one the pass waits and runs as its own command straight after it. */
  const parent = isInReducer() ? activeEnvelope() : null
  if (parent && parent.origin === 'projection' && cmdDeferEffect(() => runLoadedPostings(only))) return
  const own = !parent
  const needsDays = due.some(d => d.outcome === 'delete')
  for (const d of due) PO_INFLIGHT.add(d.key)
  const settle = (): void => { for (const d of due) PO_INFLIGHT.delete(d.key) }
  let res: CommitResult | undefined
  SYNCING = true
  try {
    res = cmdCommitProjection({
      type: 'lw.postoutRun', scope: { module: 'people' },
      apply: (txn: Txn) => {
        settle()
        /* a queued command runs later, outside the scan's guard: hold the other passes off its half-made world here too */
        const was = SYNCING
        SYNCING = true
        try {
          if (own) revertUnsavedPeople()   // before the enlist: the roster as saved, so nothing else rides in (above)
          /* …and the postings as saved (fix read 13, item B): the pass may have been queued behind the command that woke it,
             and is asked below which postings are due as it runs */
          if (own) revertUnsavedPostOuts()
          /* the scheduler store's starting point brought up to what is in memory BEFORE it is enlisted — every time now that
             every pass enlists it ([POSTOUT-RUN-NOTICE]'s two reads, 5 Nov 26): the store's changes are worked out against
             that point, so a schedule or request change sitting in memory outside every command (a browser's console) would
             otherwise be saved inside this pass as the app's own act. Taken in, it is never saved by anyone (the next command
             starts from the same point), as commitInputsWith does for the same reason; it was always so for a delete. The bell's
             image follows it (resyncBeforeEnlist — fix read 9, fault B) */
          resyncBeforeEnlist()
          txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
          /* the scheduler store too, every time: the admins' bell lines are its records ([POSTOUT-RUN-NOTICE], below) — and a
             delete's days (no saved week is written for a delete — [DB-READINESS] group A, phase 6 (d)) */
          txn.enlist(schedStore)
          const told: Array<[string, string]> = []
          /* each posting that RAN, for the admins' bells: a held one changed nothing and tells nothing new (D306's note
             already speaks); `acct` — an archived man held a sign-in, read before it is suspended */
          const ran: Array<{ id: string; poDate: string; outcome: PoOutcome; acct: boolean }> = []
          for (const d0 of due) {
            const d = poDueNow(d0.id, effectiveToday())
            if (!d || d.key !== d0.key || awayFrom(d.id, worldUnit(), effectiveToday())) continue
            /* asked again when the command runs (it may run later, queued): held → nothing changes, not marked done */
            const held = poHeldReason(d.id, d.outcome, d.poDate)
            if (held) { told.push([d.key, held]); continue }
            const body = rosterBody(d.id)!   // (poDueNow just found his body)
            ran.push({ id: d.id, poDate: d.poDate, outcome: d.outcome as PoOutcome, acct: !!accountOfPid(d.id) })
            if (d.outcome === 'overseas') {
              if (!body.archived) { body.archived = true; body.archivedBy = 'po'; body.archivedOn = d.poDate }   // D329: when
              suspendForPosting(d.id)
            } else if (d.outcome === 'sans') {
              if (!body.san) {
                body.san = true
                body.quals = body.quals || {}
                body.quals.san = true
                body.sanQ = body.sanQ || { flown: 0, carry: 0, missedQtrs: 0 }
                body.sanBy = 'po'
              }
            } else if (d.outcome === 'delete') {
              applyDelete(d.id, deleteCutoff(d.poDate))
              forgetPersonFrom(d.id, deleteCutoff(d.poDate))
              /* the person signed in, deleted by his own posting (another admin made it): said, so he is not left working
                 as a man who is no longer there (Fable's code read 6) */
              if (me() != null && d.id === me()) told.push([d.key, 'You have been deleted by your posting out — please sign out'])
            }
            markPostingDone(d.id, d.poDate)
          }
          /* NOBODY IS GONE SILENTLY ([POSTOUT-RUN-NOTICE] — owner D1546, D1547 A, D1690): each posting that ran is one line in
             every admin's bell — "Ranger · Mon 16 Nov / Posted out · archived, account suspended". Written here, inside the
             pass's own command, so a refused pass tells nobody; the line then stays as the record that it ran (the top bar's
             Undo never takes a posting back — D350 — and the posting sheet's own Undo is a command of its own). The admins
             are read AFTER the outcomes, so an admin archived or deleted by his posting is not told; nor is an admin told
             of his own posting (made SANS, he is still an admin) */
          /* (the latest date first, then in the Post out sheet's own order of outcomes — Overseas Sqn, Delete, SANS — then
             by callsign, as drawn: each a millisecond earlier than the one before, since the bell lists the newest first.
             The postings keep no order of when they were made — the walk's B2b; one first opening may run two dates) */
          if (ran.length) {
            const to = ownSchedulerIds(), now = Date.now(), rank: Record<string, number> = { overseas: 0, delete: 1, sans: 2 }
            const cs = (id: string) => String(rosterBody(id)?.cs ?? id)
            ;[...ran].sort((a, b) => (a.poDate < b.poDate ? 1 : a.poDate > b.poDate ? -1 : 0) || (rank[a.outcome] ?? 3) - (rank[b.outcome] ?? 3) || cs(a.id).localeCompare(cs(b.id)))
              .forEach((r, i) => noticePosting(to.filter(t => t !== r.id), r.id, r.outcome, r.poDate, r.acct, now - i))
          }
          validate()
          finishPeopleWrite()
          /* the schedule's own save step — the bell's lines; for a delete the loaded week filed too (person-delete.ts deletePerson) */
          schedApplyEnd()
          if (needsDays) cmdDeferEffect(() => { HOOKS.reflow(); HOOKS.histPush() })
          /* said once the command has landed (a refused one says nothing) */
          if (told.length) { const say = () => told.forEach(([k, t]) => tellOnce(k, t)); if (!cmdDeferEffect(say)) say() }
        } finally {
          SYNCING = was
        }
      },
    })
  } finally {
    SYNCING = false
  }
  if (res && isQueued(res)) { res.done.then(r => { if (!isOk(r)) refused(); settle() }, settle); return }
  settle()
  if (res && !isOk(res)) { refused(); return }
  raptorNotify()
  /* refused: tried ONCE more as it was — the refused command's rollback has put the roster and the requests back to what
     is saved, so a change made in memory outside every command (the console case) no longer rides it; refused again,
     never re-run by its own notify; several, then one at a time */
  function refused(): void {
    const fresh = due.some(d => !PO_RETRIED.has(d.key))
    for (const d of due) PO_RETRIED.add(d.key)
    if (fresh) { runLoadedPostings(only); return }
    for (const d of due) PO_REFUSED.add(d.key)
    if (due.length < 2) return
    for (const d of due) { PO_REFUSED.delete(d.key); runLoadedPostings(d.key) }
  }
}
/* ---- THE PASS OVER EVERY OTHER SQUADRON (the reshape plan §6.2 A5, steps 2–6) -------------------------------------
   The loaded pass reads only the war on the page, so a 149 posting ran only when a 149 man opened the app. This reads every
   other squadron's stored `profile:` rows (never its whole war) and runs each due posting through the same outcomes:
   - ONE POSTING PER COMMAND (Opus 2 of round 3), so a refused one never rolls back another squadron's; a refused one is
     tried once more, then given up for the session (as the loaded pass's PO_REFUSED) — it runs on the next boot, once
     what refused it is put right. A HELD one (poHeldReason) is no refusal: it commits nothing and is tried again on the
     next run;
   - a man not at home in that squadron today is skipped, unsaid (awayFrom — step 2);
   - BOTH HALVES as the loaded pass runs them (Opus H1): the Raptor half as ever (Overseas Sqn: archive and suspend; SANS;
     Delete: person-delete.ts applyDelete), the war half on that squadron's stored war through the second store
     (state/foreign.ts — a Delete's records through deleteOnForeign), its done mark `poDone` in that stored profile, in the
     same command: when that war later loads, its own pass finds the posting done — run once, never twice;
   - IT SAYS NOTHING ON SCREEN (Fable 2, Opus 3 of round 3): no passing note — a held foreign posting shows only as Admin →
     Users' held note on that man's row (A6, postingHeldNote). The one exception is today's words for the man himself, a
     Delete that removes the signed-in person (dormant while every own page is his home's);
   - its command type is the loaded pass's own, `lw.postoutRun` (Fable 6), so the timeline keeps it out of every step and
     the gate judges it as the app's own posting run (perms.ts postingPassViolation, `lwx.profile` — step 7);
   - ONLY IN ITS OWN COMMAND, NEVER LOST (Astra 4; D306): raised inside another command it leaves the work OWED and runs
     straight after it; owed work stays owed until a run completes;
   - WHEN (step 5): at boot (wireLeaveWarSync), on a new day (the midnight wake), and once, coalesced, after a committed
     command that changes accounts, people, homes or rights — what a held posting's reason reads — or any squadron's
     postings; never on an ordinary notify (FX_DIRTY);
   - ONE AUDIENCE (step 6): the bell lines go to that squadron's admins of today (postingAdmins — accounts.ts adminsOf). */
let FX_DIRTY = true
let FX_OWED = false
let FX_RUNNING = false
let FX_DAY = ''
let FX_HOOKED = false
const FX_REFUSED = new Set<string>()
const FX_RETRIED = new Set<string>()
/* a run QUEUED behind the command whose release woke it (the loaded pass's PO_INFLIGHT, for the same reason): until it
   runs, the stored row still reads "due", and queueing it again on every notify ran it twice */
const FX_INFLIGHT = new Set<string>()
/* each squadron's postings as its stored war holds them (the profile rows' windows only), read once until something could
   have moved them — dropped with the stored worlds and after every command that writes a posting */
const FX_POSTS = new Map<string, Record<string, Person>>()
function storedPostings(unit: string): Record<string, Person> {
  let m = FX_POSTS.get(unit)
  if (m) return m
  m = {}
  if (WORLD_DOOR) {
    const b = WORLD_DOOR(unit).backend
    for (const k of b.keys()) {
      if (!k.startsWith(PROFILE)) continue
      const pid = k.slice(PROFILE.length)
      let raw: unknown = null
      try { raw = JSON.parse(b.read(k) ?? 'null') } catch { raw = null }
      const post = raw && typeof raw === 'object' && 'post' in raw ? readStoredPost(pid, (raw as { post: unknown }).post) : null
      if (post) m[pid] = post
    }
  }
  FX_POSTS.set(unit, m)
  return m
}
/* the stored worlds were dropped, or a command wrote something a posting run reads */
function fxMoved(): void { FX_POSTS.clear(); FX_DIRTY = true }
/* WHAT WAKES THE RUN (step 5): accounts, people, homes and rights, and any squadron's postings */
const fxWakes = (c: { collection: string; id: string }): boolean =>
  c.collection === 'people' || c.collection === 'lw.postouts' || c.collection.startsWith('lwx.')
  || (c.collection === 'settings' && (String(c.id).startsWith('account:') || UNIT_ROW_PREFIXES.some(p => String(c.id).startsWith(p))))
type FxDue = PoDue & { unit: string; fxKey: string }
export function runForeignPostings(): void {
  if (!WORLD_DOOR || SYNCING || FX_RUNNING) return
  const today = effectiveToday()
  if (today !== FX_DAY) { FX_DAY = today; FX_DIRTY = true }
  if (!FX_DIRTY && !FX_OWED) return
  /* never inside another command: owed, and run straight after it (a command the app runs, or the person's own) */
  if (isInReducer() || cmdIsCommitting()) {
    FX_OWED = true
    if (isInReducer()) cmdDeferEffect(() => runForeignPostings())
    return
  }
  FX_DIRTY = false
  FX_RUNNING = true
  try {
    const here = worldUnit()
    const due: FxDue[] = []
    for (const u of unitList()) {
      if (u.id === here) continue
      const posts = storedPostings(u.id)
      for (const id of Object.keys(posts)) {
        const d = poDueOf(id, posts[id], today)
        if (!d) continue
        const fxKey = `${u.id}:${d.key}`
        if (FX_REFUSED.has(fxKey) || FX_INFLIGHT.has(fxKey) || awayFrom(id, u.id, today)) continue
        if (poHeldReason(id, d.outcome, d.poDate)) continue          // held: nothing now, nothing said (A6's note says it)
        due.push({ ...d, unit: u.id, fxKey })
      }
    }
    for (const d of due) runForeignPosting(d)
    FX_OWED = false
  } finally {
    FX_RUNNING = false
  }
}
function runForeignPosting(d: FxDue): void {
  const fw = foreignWar(d.unit)
  fw.load(d.id)                                   // his stored profile and records, read fresh before the command
  let gone = false
  let res: CommitResult | undefined
  FX_INFLIGHT.add(d.fxKey)
  SYNCING = true
  try {
    res = cmdCommitProjection({
      type: 'lw.postoutRun', scope: { module: 'people' },
      apply: (txn: Txn) => {
        revertUnsavedPeople()                     // the roster as saved: nothing but this posting rides in (the loaded pass's rule)
        resyncBeforeEnlist()
        txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(schedStore); txn.enlist(fw)
        /* asked again as the command runs: still due, still his squadron's, not held */
        const now = poDueOf(d.id, fw.post(d.id), effectiveToday())
        const body = rosterBody(d.id)
        if (now && now.key === d.key && body && !awayFrom(d.id, d.unit, effectiveToday()) && !poHeldReason(d.id, now.outcome, now.poDate)) {
          const acct = !!accountOfPid(d.id)
          if (now.outcome === 'overseas') {
            if (!body.archived) { body.archived = true; body.archivedBy = 'po'; body.archivedOn = now.poDate }
            suspendForPosting(d.id)
          } else if (now.outcome === 'sans') {
            if (!body.san) {
              body.san = true
              body.quals = body.quals || {}
              body.quals.san = true
              body.sanQ = body.sanQ || { flown: 0, carry: 0, missedQtrs: 0 }
              body.sanBy = 'po'
            }
          } else if (now.outcome === 'delete') {
            const cut = deleteCutoff(now.poDate)
            applyDelete(d.id, cut)
            deleteOnForeign(txn, fw, d.id, cut, null)
            if (me() != null && d.id === me()) gone = true
          }
          /* the done mark, in that squadron's stored profile, with the outcome (a Delete whose man never arrived there has
             his window removed by deleteOnForeign: nothing left to mark, and he is deleted, so never due again) */
          const after = fw.post(d.id)
          if (after) fw.setPost(d.id, { ...after, poDone: now.poDate })
          noticePosting(postingAdmins(d.unit).filter(t => t !== d.id), d.id, now.outcome as PoOutcome, now.poDate, acct, Date.now())
          if (now.outcome === 'delete') cmdDeferEffect(() => { HOOKS.reflow(); HOOKS.histPush() })
        }
        validate()
        finishPeopleWrite()
        schedApplyEnd()
      },
    })
  } finally {
    SYNCING = false
  }
  const refusedNow = (): void => {
    if (!FX_RETRIED.has(d.fxKey)) { FX_RETRIED.add(d.fxKey); FX_DIRTY = true; return }   // tried once more on the next run
    FX_REFUSED.add(d.fxKey)                                                            // then given up for the session
  }
  const landed = (): void => { FX_INFLIGHT.delete(d.fxKey); FX_POSTS.delete(d.unit) }
  if (res && isQueued(res)) { res.done.then(r => { landed(); if (!isOk(r)) refusedNow() }, () => { landed(); refusedNow() }); return }
  landed()
  if (res && !isOk(res)) { refusedNow(); return }
  if (gone) { const t = 'You have been deleted by your posting out — please sign out'; if (!cmdDeferEffect(() => tellOnce(d.fxKey, t))) tellOnce(d.fxKey, t) }
  raptorNotify()
}
/* the run's wake-up wiring, once a page (wireLeaveWarSync) */
function hookForeignRun(): void {
  FX_REFUSED.clear(); FX_RETRIED.clear(); fxMoved()
  if (FX_HOOKED) return
  FX_HOOKED = true
  cmdOnCommit(env => { if (env.changes.some(fxWakes)) fxMoved() })
}
/* THE GATE'S PROBE (perms.ts setLwxPostingProbe — §6.2 A5, step 7): is this posting record his posting exactly as THAT
   squadron's stored profile row holds it? */
function foreignPostingSaved(unit: string, pid: string, p: unknown): boolean {
  if (!WORLD_DOOR) return false
  return samePosting(pid, p, readForeign(WORLD_DOOR(unit).backend, pid).post)
}

/* a DELETE's war half, for the admin's own delete (state/person-delete.ts deletePerson — Admin → Users): the war's
   store enlisted in that command, his records from the cutoff gone, his window closed the day before, `gone` set. The
   ONE place a Raptor command reaches the war's store — here, at the seam. */
export function deletePersonOnWar(txn: Txn, id: string, cutoff: string, frozen: Person | null = null): void {
  const fw = foreignOf(id)
  if (fw) { deleteOnForeign(txn, fw, id, cutoff, frozen); return }
  txn.enlist(lwStore)
  forgetPersonFrom(id, cutoff, frozen && pastOnWar(id, cutoff) ? frozen : null)
}

/* A3 — WHOSE WAR A MAN'S ADMIN → USERS DOOR WRITES (the second fix read's A3; Fable's design A, 19 Nov 26): the war loaded
   where he is its squadron's, as ever; otherwise — the master acting on another squadron's man (D2197) — HIS OWN
   squadron's stored war, through the second store (state/foreign.ts), never by swapping the war in view inside the
   command. null on a page with one war (no world door) or for a man with no squadron known: the war loaded, as before. */
function foreignHome(id: string): string | null {
  if (!WORLD_DOOR) return null
  const u = homeOn(id, effectiveToday())
  return u && u !== worldUnit() ? u : null
}
/* …loaded fresh for him, just before the command (or, for the delete, inside it before it is enlisted) */
function foreignOf(id: string): ForeignWar | null {
  const u = foreignHome(id)
  if (!u) return null
  const fw = foreignWar(u)
  fw.load(id)
  return fw
}
/* his person on his own squadron's war, as the war loaded reads one (store.ts `dated` / `withStored`): the projection of
   him there with his saved window laid on, or the saved window alone where the projection does not hold him (archived) */
function foreignPerson(post: Person | null, unit: string, id: string, identity?: Person | null): Person | null {
  const me = identity !== undefined ? identity : projectPeople(true, unit).find(p => p.id === id) ?? null
  if (me) return post ? { ...me, ...windowFor(post, false) } : me
  return post
}
/* whether that war SHOWS him (a SANS man with its Show SANS off is not shown — the war loaded's hidden rule) */
const foreignShows = (fw: ForeignWar, id: string, person: Person | null): boolean =>
  !!person && (!!fw.post(id) || !(rosterBody(id)?.san && !fw.showSans()))
/* a past on that war before `cutoff` — the same three tests as `pastOnWar` below: a war record, an input, an OIL award */
function pastOnForeign(fw: ForeignWar, id: string, cutoff: string): boolean {
  const cut = +cutoff.replace(/-/g, '')
  return Object.values(fw.recs(id)).some(r => r.date < cutoff)
    || warLines().some(r => r && r.person === id && (dateOrd(r.date, r.yr) ?? Infinity) < cut)
    || Object.values(fw.ledger(id)).some(e => isOilAward(e) && e.date < cutoff)
}
/* the delete's war half on his own squadron's stored war (`forgetPersonFrom`'s rules, its pure cut — store.ts personCut):
   his records and OIL awards from the cutoff go, his window closes the day before and is marked gone; a man who never
   arrived loses his window; a man that war does not show, with no past there, keeps it as it stands */
function deleteOnForeign(txn: Txn, fw: ForeignWar, id: string, cutoff: string, frozen: Person | null): void {
  txn.enlist(fw)
  for (const [k, r] of Object.entries(fw.recs(id))) if (r.date >= cutoff) fw.dropRec(id, k)
  for (const [k, e] of Object.entries(fw.ledger(id))) if (isOilAward(e) && e.date >= cutoff) fw.dropEntry(id, k)
  const person = foreignPerson(fw.post(id), fw.unit, id, frozen)
  if (!person || (!foreignShows(fw, id, person) && !pastOnForeign(fw, id, cutoff))) return
  const next = personCut(person, cutoff)
  fw.setPost(id, next && keepsWindow(next) ? next : null)
}
/* a hidden man's row is kept only when he has a past there: a war record before the cutoff, or an input (leave,
   medical, course…) that starts before it — the war derives his leave from those. One body for the delete and
   Archive ([ONE-DOOR], round 1 — Fable F3 / Astra 7) */
function pastOnWar(id: string, cutoff: string): boolean {
  const cut = +cutoff.replace(/-/g, '')
  return getState().wars.some(w => Object.keys((w.recs || {})[id] || {}).some(d => d < cutoff))
    || warLines().some(r => r && r.person === id && (dateOrd(r.date, r.yr) ?? Infinity) < cut)
    /* an OIL award before the cutoff is his past on the war too — a ledger entry since [OIL-AWARD-IS-A-GRANT], so the
       war's records no longer carry it (Astra's plan read F03; D299: his past OIL stays, and so does his row) */
    || rawState().ledger.some(e => e.personId === id && isOilAward(e) && e.date < cutoff)
}
/* the war's picture of a man it does NOT show right now (a SANS man with Show SANS off), taken before a delete's mark
   takes him off every projection — null when the war already has his row (the kept rule then carries him) */
function hiddenIdentity(id: string): Person | null {
  /* A3: a man of another squadron than the war loaded — his own squadron's projection of him, taken before the delete's
     mark takes him off it (the delete's war half writes his squadron's stored war) */
  const fu = foreignHome(id)
  if (fu) return projectPeople(true, fu).find(p => p.id === id) || null
  if (getState().people.some(p => p.id === id)) return null
  return projectPeople(true).find(p => p.id === id) || null
}
/* (the same answer, for the other files) */
export function warIdentityIfHidden(id: string): Person | null { return hiddenIdentity(id) }
/* the auto-archive's old name — every caller and test that runs it now runs the outcomes (an 'overseas' posting IS
   the old "Archive on PO date") */
export const runPoArchive = runPoOutcomes
/* a posting's Delete is never made on the last admin who can sign in (the door's own refusal, accounts.ts
   deleteAccountProblem — minus "yourself": the pass is not the signed-in person acting) */
function deleteBlocked(id: string): string | null {
  const body = rosterBody(id)!   // (its one caller, poHeldReason, has found his body)
  /* A MASTER'S DELETE WAITS (the fix read, 18 Nov 26 — Opus 1): the commit gate refuses any command that takes a master's
     account away (the master mark changes only by its own command), so run inside the pass's one command it refused the
     whole pass — every other posting due that day held back, unsaid — and the pass's own notify ran it again until the
     page ran out of stack. Held here, it is skipped and said once, and the others run. */
  const master = masterDeleteProblem(id)
  if (master) return master
  const lock = lastAdminLock(id)
  return !lock ? null : lock === 'app' ? `${body.cs} is the last admin who can sign in — he is not deleted until another admin can`
    : `${body.cs} is ${lock.num}'s last admin. He is not deleted until ${lock.num} has another admin.`
}

/**
 * Put an archived body back on the roster — Restore (Admin → Users' Archived group since [ONE-DOOR], D310; Quals'
 * Archived section before it — owner, 19 Aug 26: "in the future they post back into this sqn,
 * they can be re added easily"). Clears the Leave War posting-out FIRST:
 * restoring is "they are back", and a surviving window would hide their row
 * from every current month — and, with the archive switch on, re-archive
 * them on the very next pass. Quals, ticks and CAT were never touched by
 * archiving, so they come back exactly as they left.
 */
export function restoreArchivedPerson(id: string, postIn?: string): boolean {
  /* Write-path role backstop (bug hunt, 31 Aug 26): roster membership —
     archive and restore alike — is the admin's (the Quals page renders
     Restore for an admin only, and now draws the archive ✕ the same way).
     The commitInputEdit idiom: a signed-in non-admin is refused here too,
     so a hand-made call cannot do what the page will not offer; a
     sessionless test/boot context is not a member and passes. */
  if (!mayManageRoster()) return false
  const body = rosterBody(id)
  if (!body || !body.archived || body.special) return false
  /* [POST-OUT-OUTCOMES]: a DELETED man is never restored (D287 — final; Fable F3); and a man whose callsign a man ON
     THE ROSTER now holds is not restored under it (D286 reading (1): Restore refuses while the name is taken and never
     renames anyone by itself — the Quals page then offers another callsign on the spot, restoreArchivedAs below, D295) */
  if (body.deleted) return false
  /* [ONE-DOOR] (D308, D320): Restore on Admin → Users brings a post-in date — the war opens a new stint from it; without
     one this is the posting's own undo (the Leave War's Undo post out — the same stint continues) */
  if (postIn !== undefined && restoreProblem(id, postIn)) return false
  if (callsignProblem(body.cs, id)) return false
  return restoreBody(id, null, postIn)
}
/* why Restore on Admin → Users would be refused ([ONE-DOOR], D308): not an admin, not an archived man, no whole date,
   or a post-in on or before the day his stint closed (the store's one sentence). null when it would go ahead. */
export function restoreProblem(id: string, postIn: string): string | null {
  if (!mayManageRoster()) return 'Only an admin can restore someone'
  /* a master's person is a master's alone (D2205, Fable's plan H4) — said first */
  const masterOnly = masterChangeProblem(id)
  if (masterOnly) return masterOnly
  const other = otherSquadronPersonProblem(id)
  if (other) return other
  const body = rosterBody(id)
  if (!body || !body.archived || body.special || body.deleted) return 'That person cannot be restored'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(postIn ?? ''))) return 'Pick the post-in date'
  /* a man of another squadron than the war loaded: judged on his own squadron's stored window (A3), read, never loaded */
  const fu = foreignHome(id)
  if (fu) {
    const post = readForeign(WORLD_DOOR!(fu).backend, id).post
    return post ? restoreDateProblem(post, postIn) : null
  }
  const st = getState()
  const cur = st.people.find(p => p.id === id) || st.postOuts[id]
  return cur ? postingProblem(id, 'restore', postIn, cur) : null
}
/* THE ONE BODY OF "HE'S BACK" — Restore (Admin → Users since D310), Undo post out, Restore under another callsign. ONE command over the
   people, settings and war stores ([CMDL-FINISH] C10 — a single click is a single envelope): the posting cleared, the
   archive lifted, the account the POSTING suspended enabled again (D280: "on his return … his account can be enabled";
   `offBy: 'po'` only — one suspended by hand stays so), the SANS tick the posting made taken back — and the Quals prompt
   armed (D284: he returns as he was, and the admin is asked to check his quals; it changes nothing). `rename` — the
   callsign he comes back under, in the same step (D295).
   ITS TWO MODES ([ONE-DOOR], round 1 — Fable F7), named so neither absorbs the other:
   - UNDO (`postIn` undefined — the Leave War's Undo post out on a POSTING's archive): the posting cleared, the SAME
     stint continues, only the suspension the posting made enabled (`offBy: 'po'`), the admin prompted, no welcome note
     (he never left);
   - RESTORE (`postIn` — Admin → Users, D308): a NEW stint on the war from the post-in date (D320; the day after his
     stint closed reopens it — Fable F5), his sign-in enabled WHATEVER suspended it (D322), the admin prompted (D284)
     and `back` set on his Person so HE is told on his first sign-in (D305 — every Restore, with or without an account:
     Fable F12 / Astra 5). */
function restoreBody(id: string, rename: string | null, postIn?: string): boolean {
  const body = rosterBody(id)!   // (both callers have found his body, archived)
  /* A3: a man of another squadron than the war loaded comes back on HIS squadron's stored war. The posting sheet's Undo
     post out (no post-in date) is that war's own door, drawn only where it is loaded: never run on the wrong war */
  const fw = foreignOf(id)
  if (fw && postIn === undefined) return false
  let ok = true
  let forget: string[] = []
  const r = cmdCommit({
    /* UNDO is the posting's own decision taken back (the posting command, as `takeBack` is); RESTORE is Admin → Users'.
       The change history says each as what it is (Astra's read of the [DRAFT-PENDING] fixes, 02) */
    type: postIn === undefined ? 'lw.postout' : 'person.restore', scope: { module: 'people' }, meta: null,
    apply: (txn: Txn) => {
      /* the posting sheet's Undo takes back the posting's bell lines with it ([NOTICE-UNDO-RETRACT], D1693 — takeBack's
         notes); Restore on Admin → Users is "he's back", not the posting undone: its lines stay */
      const lines = postIn === undefined ? postingLinesOf(id) : []
      if (lines.length) { resyncBeforeEnlist(); txn.enlist(schedStore) }
      txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(fw ?? lwStore)
      if (rename != null && !renameCallsign(id, rename)) { ok = false; return }
      if (postIn === undefined) setPostOut(id, null)
      body.archived = false
      delete body.archivedBy; delete body.archivedOn; delete body.archivedWho
      if (body.sanBy === 'po') { body.san = false; if (body.quals) body.quals.san = false; delete body.sanBy }
      if (postIn === undefined) enableAfterPosting(id)
      else {
        /* the war's picture of him when it holds no row (archived with no stint closed — his post-in was still to come),
           taken now that the archive is lifted */
        if (fw) {
          /* his own squadron's stored war (A3): his saved window, or his projection there now the archive is lifted */
          const person = foreignPerson(fw.post(id), fw.unit, id)
          const next = person ? stintOpened(person, postIn) : null
          if (!next) throw new CmdRefused((person && restoreDateProblem(person, postIn)) || 'That did not save')
          fw.setPost(id, next)
        } else {
        const identity = getState().people.some(p => p.id === id) ? undefined : projectPeople(true).find(p => p.id === id)
        if (!openStint(id, postIn, identity)) throw new CmdRefused(restoreProblem(id, postIn) || 'That did not save')
        }
        enableForRestore(id)
        body.back = true
      }
      if (lines.length) forget = retractPostingLines(lines)
      validate()
      finishPeopleWrite()
      if (lines.length) schedApplyEnd()
    },
  })
  if (!ok || (r && 'ok' in r && r.ok === false)) return false
  if (forget.length) forgetRead(forget)
  markBack(id)
  raptorNotify()
  return true
}
/* Restore meeting a callsign now held by a man on the roster: he comes back under ANOTHER callsign, in one step
   ([POST-OUT-OUTCOMES], owner D295, 27 Sep 26 — "Can we just change the archived name directly?"). Refused with the one
   callsign rule's reason (blank, 14 letters, taken). null = done. */
export function restoreArchivedAs(id: string, cs: string, postIn?: string): string | null {
  if (!mayManageRoster()) return 'Only an admin can restore someone'
  /* a master's person is a master's alone (D2205, Fable's plan H4) — said first */
  const masterOnly = masterChangeProblem(id)
  if (masterOnly) return masterOnly
  const other = otherSquadronPersonProblem(id)
  if (other) return other
  const body = rosterBody(id)
  if (!body || !body.archived || body.special || body.deleted) return 'That person cannot be restored'
  const want = String(cs ?? '').trim()
  const bad = callsignProblem(want, id) || (postIn !== undefined ? restoreProblem(id, postIn) : null)
  if (bad) return bad
  return restoreBody(id, want === body.cs ? null : want, postIn) ? null : 'That did not save'
}

/* ARCHIVE ([ONE-DOOR], owner D309, D310, D322, D323 — 27 Sep 26): one tap on Admin → Users. ONE command over the people,
   settings and war stores: archived (`archivedBy: 'admin'`), his sign-in suspended (D310 "Archive also suspends"),
   his welcome note cleared, a SANS tick a posting made taken back (Fable F13), and on the war "posted out from today"
   — his stint closed yesterday as a posting that has run, a posting still to come replaced (store.ts
   closeStintOnArchive; D323). A man the war does not show now (a SANS man with Show SANS off) keeps his row only when
   he has a past there (Fable F3 / Astra 7 — the delete's own test). Restore on Admin → Users is the ONE way back
   (Fable F1 / Astra 2: the war's posting doors refuse him — adminArchived below). Not an Undo step: it writes the war's
   posting record (Fable F14 — undo/timeline.ts defers that collection). */
const OUTCOME_WORD: Record<string, string> = { overseas: 'Overseas Sqn', delete: 'Delete', sans: 'SANS' }
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayMon = (iso: string) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}`

/* A7 — THE WAR DAY A CHANGE IS ABOUT (perms.ts setLwManDayProbe; the reshape plan §6.2): a war cell's change names its man
   and day in its id, `<war>:<pid>:<date>`, read from the right (a war id may carry a colon), as applyLwRecord reads it.
   Any other war record is no man's day. */
/* …AND AN OIL AWARD OR ANY OTHER LEDGER ENTRY (the fix read of the reshape — opus-3 F5, fable-3 F5): `putList`'s rule says
   "no bid, no award, no absence, no credit", and an award is a ledger entry (`lw.ledger`, one record an entry, its man and
   its day inside it) — read from the image the change leaves, or the one it takes away. The gate's 7b and the Undo's
   sentence then judge it as they judge a cell: taking it away passes, giving or changing it does not. */
export function warCellDay(c: Change): { pid: string; iso: string } | null {
  if (c.collection === 'lw.ledger') {
    const e = (c.op === 'delete' ? c.before : c.after ?? c.before) as { personId?: unknown; date?: unknown } | null | undefined
    const pid = e && typeof e.personId === 'string' ? e.personId : '', iso = e && typeof e.date === 'string' ? e.date : ''
    return pid && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? { pid, iso } : null
  }
  if (c.collection !== 'lw.cell') return null
  const id = String(c.id)
  const iDate = id.lastIndexOf(':')
  const rest = id.slice(0, iDate), iPid = rest.lastIndexOf(':')
  if (iDate < 0 || iPid < 0) return null
  const pid = rest.slice(iPid + 1), iso = id.slice(iDate + 1)
  return pid && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? { pid, iso } : null
}
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
/* the day written as the approved sentence writes it — "Thu 16 Jul" */
const dowDayMon = (iso: string) => `${DOW[weekday(iso)]} ${dayMon(iso)}`
/* only removes: every entry left stood before, unchanged, in the same order (perms.ts removesOnly — the gate's rule) */
function cellRemovesOnly(c: Change): boolean {
  const b: unknown = c.before ?? null, f: unknown = c.op === 'delete' ? null : c.after ?? null
  if (f == null || JSON.stringify(b) === JSON.stringify(f)) return true
  if (!Array.isArray(b) || !Array.isArray(f)) return false
  let i = 0
  for (const x of f) {
    while (i < b.length && JSON.stringify(b[i]) !== JSON.stringify(x)) i++
    if (i === b.length) return false
    i++
  }
  return true
}
/* THE WORDS OF AN UNDO THAT WOULD PUT LEAVE BACK ON A DAY NOW ANOTHER SQUADRON'S (A7's sentence — the reshape plan §11's A7
   row; approved with the drawing by his D2243, Q3 and Q6): "Ranger is 149's from Thu 16 Jul, so this can't go back into
   142's Leave War." Said by the timeline before the apply, through its `restoreRefusal` hook (one line wired in
   state/undo-wire.ts by helper "undo & roles"); the gate's 7b refuses the same restore as a backstop. Judged as the gate
   judges it: a war cell's change about man P on day d whose squadron on d (his home over the rows now) is not the war
   loaded's, that adds or changes anything — a removal is never refused (D148: his own earlier entry can still be undone).
   "from" names the first day of his run in that squadron which holds d. Only while each squadron has a world of its own
   (the unit probe's rule); null otherwise. */
export function warDayRefusal(changes: readonly Change[]): string | null {
  if (!WORLD_DOOR) return null
  const u = worldUnit()
  for (const c of changes) {
    const at = warCellDay(c)
    if (!at) continue
    const h = homeOn(at.pid, at.iso)
    if (!h || h === u || cellRemovesOnly(c)) continue
    return warDaySentence(at.pid, at.iso, h, u)
  }
  /* …and leave a war approved, which is an Input (opus-3 F4: deleting such leave and pressing Undo put it back) */
  for (const x of warLeaveAdds(changes)) {
    const h = homeOn(x.pid, x.iso), w = x.unit ?? u
    if (h && h !== w) return warDaySentence(x.pid, x.iso, h, w)
  }
  return null
}
/** THE DAYS OF A MAN'S THAT A COMMAND ADDS TO A WAR'S APPROVED LEAVE (the fix read of the reshape — opus-3 F2, F4; astra-3 F2;
 *  A7, his D2243 Q3). Leave a war approved is an Input carrying `lw` (and `lwU`, the squadron whose war approved it), so the
 *  war's cell rule never saw it: slid onto a day now another squadron's, or put back there by Undo, it stood in the old war.
 *  Read over the WHOLE command, never record by record — a medical cutting a leave makes a new record of days the leave
 *  already held, and a slide cuts one record and files another: what counts is each (man, day, war's squadron) such leave
 *  covers after that it did not cover before. `unit` null: leave of before the stamp — the war loaded's. The gate's 7b
 *  (perms.ts setLwLeaveAddsProbe) and the Undo's sentence (`warDayRefusal`) both ask this one body.
 *  THE PART OF THE DAY COUNTS TOO (Astra's read of round 2, F2): whole-day leave cut to its morning, then put back whole by
 *  Undo, covered the same (man, day, squadron) before and after — and the afternoon went back into the old war. So each
 *  day is read with the part of it the leave takes (absences.ts inputWindow — the whole day, a half, or its typed hours):
 *  a day is added where the leave covers, after, any part of it that the command's before-images together did not. A
 *  shorter leave, and a day split into its two halves (the morning ends at 12:00, the afternoon starts at 12:01), add none. */
export function warLeaveAdds(changes: readonly Change[]): Array<{ pid: string; iso: string; unit: string | null; id: string }> {
  const held = new Map<string, Array<[number, number]>>()
  const days = (x: unknown): Array<{ pid: string; iso: string; unit: string | null; win: readonly [number, number] }> => {
    if (!x || typeof x !== 'object' || Array.isArray(x) || !(x as WarInput).lw) return []
    const row = x as WarInput, unit = typeof row.lwU === 'string' && row.lwU ? row.lwU : null
    const win = inputWindow(row).win
    return idsOf(row).flatMap(p => inputDates(row).map(iso => ({ pid: String(p), iso, unit, win })))
  }
  const keyOf = (d: { pid: string; iso: string; unit: string | null }) => `${d.pid}|${d.iso}|${d.unit ?? ''}`
  const ins = changes.filter(c => c.collection === 'inputs')
  for (const c of ins) for (const d of days(c.before)) {
    const k = keyOf(d), list = held.get(k)
    if (list) list.push([d.win[0], d.win[1]]); else held.set(k, [[d.win[0], d.win[1]]])
  }
  /* is the stretch [s, e] wholly inside what was held — the held stretches joined where one ends the minute before the next starts */
  const covered = (k: string, s: number, e: number): boolean => {
    const list = held.get(k)
    if (!list) return false
    let at = s
    for (const w of [...list].sort((a, b) => a[0] - b[0])) {
      if (w[0] > at) break
      if (w[1] >= e) return true
      if (w[1] + 1 > at) at = w[1] + 1
    }
    return at > e
  }
  const out: Array<{ pid: string; iso: string; unit: string | null; id: string }> = []
  for (const c of ins) {
    if (c.op === 'delete') continue
    for (const d of days(c.after)) if (!covered(keyOf(d), d.win[0], d.win[1])) out.push({ pid: d.pid, iso: d.iso, unit: d.unit, id: String(c.id) })
  }
  return out
}
/** WHY THIS WAR TAKES NO LEAVE OF HIS ON THAT DAY — the sentence, where the day is another squadron's (his home that day is
 *  not the war loaded's); null where it is this war's, or while one war serves the page. The live doors' form of
 *  `warDayRefusal` (W2-F3: an Approve of a bid left there from before his move was saved). */
export function warDayWhy(pid: string, iso: string): string | null {
  if (!WORLD_DOOR) return null
  const h = homeOn(pid, iso), u = worldUnit()
  return h && h !== u ? warDaySentence(pid, iso, h, u) : null
}
/* the sentence itself, for man `pid`, whose day `iso` is unit `h`'s, refused in unit `u`'s war */
export function warDaySentence(pid: string, iso: string, h: string, u: string): string {
  const num = (id: string) => unitList().find(x => x.id === id)?.num ?? id
  const run = homeStintsFor(pid, h).find(s => (s.from === null || s.from <= iso) && (s.to === null || s.to >= iso))
  const cs = String((PEOPLE as Record<string, { cs?: unknown }>)[pid]?.cs ?? pid)
  return `${cs} is ${num(h)}'s from ${dowDayMon(run?.from ?? iso)}, so this can't go back into ${num(u)}'s Leave War.`
}
/* D329 (28 Sep 26 — "those on archived should also have a history on how they ended up there and when"; his pick, one
   line): an archived man's row says how and when — "Archived 27 Sep 26 by Saber" (Admin → Users; the admin read by his
   id, so a later rename follows) or "Archived 14 Oct 26 by his posting (Overseas Sqn)". null for a man on the roster,
   a deleted man, or one archived before this was kept (demo data — D56). */
export function archivedLine(id: string): string | null {
  const b = rosterBody(id)
  if (!b || !b.archived || b.deleted || !b.archivedOn) return null
  const when = `${dayMon(b.archivedOn)} ${String(b.archivedOn).slice(2, 4)}`
  if (b.archivedBy === 'po') return `Archived ${when} by his posting (${OUTCOME_WORD.overseas})`
  const who = b.archivedWho && rosterBody(b.archivedWho) ? rosterBody(b.archivedWho)!.cs : null
  return `Archived ${when}${who ? ` by ${who}` : ''}`
}
export function archiveProblem(id: string): string | null {
  if (!mayManageRoster()) return 'Only an admin can archive someone'
  /* a master's person is a master's alone (D2205, Fable's plan H4) — said first */
  const masterOnly = masterChangeProblem(id)
  if (masterOnly) return masterOnly
  const other = otherSquadronPersonProblem(id)
  if (other) return other
  const body = rosterBody(id)
  if (!body || body.special) return 'That person cannot be archived'
  if (body.deleted) return 'That person has been deleted'
  if (body.archived) return `${body.cs} is already archived`
  if (me() != null && id === me()) return "You can't archive yourself — ask another admin"
  const a = accountOfPid(id)
  if (a && a.on) { const lock = archiveLockWords(id, body.cs); if (lock) return lock }
  return null
}
/* the last-admin lock in Archive's words: per squadron where it is his squadron's — the lock's own sentence (accounts.ts
   lockProblem; the fix read, 18 Nov 26 — Opus 5) — the whole app's otherwise, as before. The squadron's sentence is the
   one words table's (accounts.ts lockWords — the reshape plan §5.2: its dated form, and his D2246's for one who cannot
   make another admin there) */
function archiveLockWords(id: string, cs: string): string | null {
  const lock = lastAdminLock(id)
  return !lock ? null : lock === 'app' ? `${cs} is the last admin who can sign in — he can't be archived until another admin can`
    : lastAdminIfGone(id)
}
export function archivePerson(id: string): { bad: string | null; said: string } {
  const bad = archiveProblem(id)
  if (bad) return { bad, said: '' }
  const body = rosterBody(id)!   // (archiveProblem has just found his body)
  const today = effectiveToday()
  const st = getState()
  /* A3: a man of another squadron than the war loaded is archived on HIS squadron's stored war */
  const fw = foreignOf(id)
  const fperson = fw ? foreignPerson(fw.post(id), fw.unit, id) : null
  const fkeep = !!fw && foreignShows(fw, id, fperson) || (!!fw && !!fperson && pastOnForeign(fw, id, today))
  const hidden = fw ? null : hiddenIdentity(id)
  const keepHidden = hidden && pastOnWar(id, today) ? hidden : undefined
  const w0 = fw ? (fw.post(id) ?? null) : st.people.find(p => p.id === id) || st.postOuts[id] || null
  const pendingDate = w0 && w0.to && w0.poDone !== addDays(w0.to, 1) ? addDays(w0.to, 1) : null   // not yet RUN (Fable F5)
  let replaced: string | null = null
  const r = cmdCommit({
    type: 'person.archive', scope: { module: 'people' }, meta: null,
    apply: (txn: Txn) => {
      txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(fw ?? lwStore)
      if (suspendForArchive(id) === 'lock') throw new CmdRefused(archiveLockWords(id, body.cs) ?? `${body.cs} is the last admin who can sign in — he can't be archived until another admin can`)
      body.archived = true
      body.archivedBy = 'admin'
      body.archivedOn = today                                           // D329: how and when — who, by his person id
      if (me() != null) body.archivedWho = me() as string; else delete body.archivedWho
      delete body.back
      if (body.sanBy === 'po') { body.san = false; if (body.quals) body.quals.san = false; delete body.sanBy }
      if (fw) {
        /* store.ts closeStintOnArchive's rules, its pure half, on his own squadron's stored window */
        if (fperson && !fperson.gone && fkeep) {
          const done = stintClosed(fperson, today)
          fw.setPost(id, keepsWindow(done.next) ? done.next : null)
          replaced = done.replaced
        }
      } else replaced = closeStintOnArchive(id, today, keepHidden).replaced
      validate()
      finishPeopleWrite()
    },
  })
  /* the refusal in the app's words, never the commit gate's own (the fix read, 18 Nov 26 — Opus 4) */
  if (r && 'ok' in r && r.ok === false) return { bad: saidOf(r) || 'That did not save', said: '' }
  clearBack(id)
  raptorNotify()
  /* his sign-in named only when he has one (the walk's design, Fable 4.7 — the posting sheets already word it so) */
  const said = `${body.cs} archived` + (accountOfPid(id) ? ' — his sign-in is suspended' : '')
    + (replaced && pendingDate ? `; his posting out on ${dayMon(pendingDate)} (${OUTCOME_WORD[replaced] || replaced}) is replaced` : '')
  return { bad: null, said }
}
/* A NEW PERSON'S POST-IN DATE (D308, [ONE-DOOR]) — the war half of the one add, inside its command: the war's store
   enlisted, his war identity taken from the projection (the war has not re-projected him yet), his first stint opened on
   the date. Refused whole (the add rolls back) if the war cannot take it. */
function postInNewPerson(txn: Txn, id: string, date: string): void {
  txn.enlist(lwStore)
  const identity = projectPeople(true).find(p => p.id === id)
  /* no identity with a war loaded means the add would lose his date in silence (the second fix read, 18 Nov 26 —
     Astra 4: the writers once called this before his home was written, so 149's projection did not have him): refuse
     the whole add; a store with no war yet has nothing to count him in */
  if (!identity) { if (getState().wars.length) throw new CmdRefused('That did not save'); return }
  if (!openStint(id, date, identity)) throw new CmdRefused('Pick the post-in date')
}
/* a man archived on Admin → Users: the war's posting doors refuse him — Restore there is the one way back (Fable F1) */
export function adminArchived(id: string): string | null {
  const body = rosterBody(id)
  return body && body.archived && !body.deleted && body.archivedBy === 'admin'
    ? `${body.cs} was archived on Admin → Users — restore him there` : null
}

/**
 * The posting sheet's "Undo post out (PO)" — he is back, AS HE WAS BEFORE THE POST OUT (the absence-record re-test,
 * W5-F1, 26 Sep 26 — found by the orders walker). A Post out with "Archive on PO date" on (the sheet's default)
 * archives his body the moment its date has come; the sheet's Undo used to clear the date and LEAVE the archive, and
 * an archived man with no posting dates is dropped from the war's roster — so his row, his bids and his leave vanished
 * from every month, a reload included, with nothing on screen to say where he went. When the archive is the Post
 * out's own (the switch was on), the undo is the Quals page's Restore — the posting cleared and the body back, ONE
 * command; otherwise it is the date alone, as before.
 */
/* why the posting sheet's Undo would be refused — the Post out's own archive, with his callsign now held by a man on the
   roster (D286 (1): never renaming anyone by itself; Admin → Users' Archived group restores him under another in one step,
   D295, D310).
   null when the Undo can go ahead. */
export function undoPostOutProblem(id: string): string | null {
  const body = rosterBody(id)
  if (!body || body.deleted) return null
  const here = adminArchived(id)
  if (here) return here
  if (body.archived && body.archivedBy === 'po' && callsignProblem(body.cs, id))
    return `${body.cs} is taken on the roster — restore him on Admin → Users under another callsign`
  return null
}
export function undoPostOut(id: string): boolean {
  const body = rosterBody(id)
  /* a DELETED man's posting is final ([POST-OUT-OUTCOMES], D287 — Fable F3) */
  if (body && body.deleted) return false
  /* [ONE-DOOR] (Fable F1 / Astra 2): an Admin archive comes back only by Restore on Admin → Users */
  if (adminArchived(id)) return false
  /* the Post out's OWN archive only (finding 4): a man archived by hand on the Quals page stays archived — the Undo
     then clears the date alone */
  if (body && body.archived && body.archivedBy === 'po') return restoreArchivedPerson(id)
  /* [POST-OUT-OUTCOMES]: what else the posting made is taken back with it — the SANS tick it put on (`sanBy: 'po'`);
     an account it suspended is only ever suspended with its archive, so Restore above enables it */
  /* …and otherwise the date alone — always as the posting command (`lw.postout`, never a bare war write routed as a
     generic `lw.edit` — Astra's code read 4, 27 Sep 26), taking back what else the posting made (the SANS tick it put on;
     an account it suspended is only ever suspended with its archive, so Restore above enables it) */
  return takeBack(id, () => setPostOut(id, null), {}, true)
}
/* THE POSTING'S BELL LINES, TAKEN BACK WITH IT ([NOTICE-UNDO-RETRACT] step 1 — owner D1693, D1699, 5 Nov 26). The posting
   sheet's "Undo post out" is a command of its own, never an Undo step (D350), so it takes back the lines its posting made
   itself, inside its own command: each admin's line about this posting goes; one he had READ (his read record — state/
   noticeseen.ts hasRead) is replaced by "~~Posted out · now SANS~~ · taken back · Saber", unread; one he had not read simply
   goes; the admin who pressed Undo gets nothing, read or not — he did it (as the war's own "taken back" lines: noticeWar
   never tells their maker). The "off the manpower" line is no stored line — each admin's bell works it out from the posting
   (postedLines, D1696) — so it goes by itself with the posting; read, it gets its "taken back" line all the same.
   `postingLinesOf` is read BEFORE the write clears the posting (the derived line is gone after it). A posting whose date
   has not come made no line, and its Undo touches no bell.
   A posting that ran and is then CHANGED on its Post out sheet — its date moved, or another outcome — takes its lines back
   the same way (his D1710, [PO-CHANGE-RETRACT]): `postOut` below. */
function postingLinesOf(id: string): Notice[] {
  const rec = getState().postOuts[id]
  if (!rec || !rec.to) return []
  /* the stored lines THIS posting wrote when it ran: only once it has run (`poDone` is its date), and only the lines of
     its date and outcome. Any other posting line of his is another posting's record and stays — an earlier posting he was
     restored from, even when the Restore reopened that same stint (post-in on the posting's own day: no boundary — the
     fix's own read, 1 and 2, 5 Nov 26, which the old "every line of this stint" test took back). A posting moved or changed
     after it ran has no older line left to find: the change itself took them back (D1710, `postOut`). */
  const poDate = addDays(rec.to, 1)
  const o = outcomeOf(rec)
  const mine = rec.poDone === poDate
    ? NOTICES.filter(n => { const p = (n.what || [])[0]; return p?.k === 'po' && p.who === id && n.day === poDate && p.o === o })
    : []
  /* …and of its own RUN: restored on the posting's own day, then posted again for the same date and outcome, he has two runs'
     lines no date or outcome tells apart (the fix round's narrow read, 1). One run writes every admin's line with one
     moment (runPoOutcomes → noticePosting), and a man's posting runs once in a pass — so the newest moment is this run's.
     Never "the newest line per admin": an admin at the first run and not the second would lose the first's record. */
  const last = mine.reduce((m, n) => Math.max(m, n.at), -Infinity)
  /* …and only the lines of a man at home in this war's squadron TODAY — whoever would be told of the take-back today (his
     D2218, 19 Nov 26: "after a move, who is told of a take-back is whoever would be told of it today. So a moved admin gets
     nothing when his old squadron undoes a posting"). An admin who got the line and has since moved squadron is neither
     taken back nor told: the line left his bell on the day he moved (state/notices.ts noticeLeftBell), and this squadron's
     command never writes to another's bell. Fix read 3's A2, which took his line back across the squadrons, is undone by
     D2218. */
  /* …nor the line of an admin who moved away and has come BACK (fix read 5, Astra's 3): at home here today, but his line
     left his bell on his first move day for good (D2218, noticeLeftBell). The newest run is still found from EVERY stored
     line of this posting (`last`, above) — only then is each retired line left out: neither deleted nor told. The worked-out
     "off the manpower" line the same, by its posting date. */
  /* PB1 (the Plan audit, §19 — with §6.2 step 6): "whoever would be told of it today" is the squadron's admins of today
     (postingAdmins — a plain admin holding Plan of it among them, D2202), never the reader's home alone */
  /* (…and a man at home here today as before: a suspended admin, whom adminsOf leaves out, still has his line taken back
     — the fixes' read 1 below) */
  const told = new Set(postingAdmins(worldUnit()))
  const stored = mine.filter(n => n.at === last && (told.has(String(n.to)) || atWarHome(n.to) || noticeAboutHim(n)) && !noticeLeftBell(n))
  const derived = ownSchedulerIds().flatMap(pid => postedLines(pid)).filter(n => { const p = n.what[0]; return p?.k === 'po' && p.who === id && !noticeLeftBell(n) })
  return [...stored, ...derived]
}
/* Returns the ids of the presser's OWN lines he had read: they leave his read record after the command (forgetRead — the
   code read's 2, 5 Nov 26), or a posting set again for the same date, whose worked-out line keeps its id, came back to him
   already read. A "taken back" line goes only to a man still an admin (the security read's S1, 5 Nov 26): a posting's
   lines are a scheduler's, and one who is a member since is not sent one (his old line still goes); an admin whose sign-in is
   suspended is still one, and is (the fixes' read 1 — by role, never by `schedulerIds`, which wants the sign-in on). */
function retractPostingLines(lines: readonly Notice[]): string[] {
  const by = me() != null ? String(me()) : null
  const at = Date.now()
  const admins = new Set(ACCOUNTS_LIST.filter(a => isAdminAccount(a) && !!a.pid).map(a => String(a.pid)))
  const forget: string[] = []
  /* PB1: the squadron's admins of today, as postingLinesOf reads them — a Plan holder's line struck too */
  const told = new Set(postingAdmins(worldUnit()))
  for (const n of lines) {
    /* (a line held by a man since moved to another squadron is neither removed nor told — above, D2218) */
    if (!(told.has(String(n.to)) || atWarHome(n.to) || noticeAboutHim(n)) || noticeLeftBell(n)) continue
    const ix = NOTICES.findIndex(x => x.id === n.id)
    if (ix >= 0) NOTICES.splice(ix, 1)
    if (n.to === by) { if (by && hasRead(by, n)) forget.push(n.id); continue }
    if (!hasRead(n.to, n) || !admins.has(n.to)) continue
    const p = n.what[0]
    if (p?.k !== 'po') continue
    noticePostingBack(n.to, by, p.who, p.o, n.day, !!p.acct, at)
  }
  return forget
}
/* a posting write that also takes back what the posting made and no longer makes TODAY — the archive (#444's rule),
   the account's suspension and the SANS tick — in ONE command over the people, settings and war stores. It is NOT
   "he's back": no prompt (the plan's Round 2, Fable 5). `retract` — the posting sheet's "Undo post out", or a change that
   leaves a posting no longer as it ran (D1710): its bell lines are taken back too (above), the scheduler store joining the
   command only then. */
function takeBack(id: string, write: () => boolean, keep: { archive?: boolean; suspend?: boolean; sans?: boolean } = {}, retract = false): boolean {
  const body = rosterBody(id)
  let ok = false
  let forget: string[] = []
  const r = cmdCommit({
    type: 'lw.postout', scope: { module: 'people' }, meta: null,
    apply: (txn: Txn) => {
      const lines = retract ? postingLinesOf(id) : []
      /* the scheduler store's starting point brought up to memory BEFORE it is enlisted, as the posting pass does (its
         notes there): only this command's own lines are its change */
      if (lines.length) { resyncBeforeEnlist(); txn.enlist(schedStore) }
      txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
      ok = write()
      if (!ok || !body) return
      if (!keep.archive && body.archived && body.archivedBy === 'po') { body.archived = false; delete body.archivedBy; delete body.archivedOn }
      if (!keep.suspend) enableAfterPosting(id)
      if (!keep.sans && body.sanBy === 'po') { body.san = false; if (body.quals) body.quals.san = false; delete body.sanBy }
      if (lines.length) forget = retractPostingLines(lines)
      validate()
      finishPeopleWrite()
      if (lines.length) schedApplyEnd()
    },
  })
  /* the command LANDED — never only its body run: a commit refused after the body put every store back, his read record
     included (the fixes' read 2, as restoreBody already asks) */
  const landed = ok && !(r && 'ok' in r && r.ok === false)
  if (landed && forget.length) forgetRead(forget)
  if (landed) raptorNotify()
  return landed
}

/**
 * Set or move a post-out — every posting door's route (Matrix postOutOr: the bid sheet's PO, the Post out sheet's date
 * and switch, the drag-selection's Post out). When the Post out has ALREADY archived him and the new posting no longer
 * archives him today — its date still to come, or "Archive on PO date" turned off — he comes back on the roster in the
 * same command (Astra's final code read, finding 2, 26 Sep 26: he stayed archived, off the Quals roster, while the
 * sheet said he stays or before his date). When the new date has also come, the archive stands. The pass
 * (runPoArchive) archives him again on the date, as for any Post out.
 */
/* a posting door's own refusal before anything is written: an admin never deletes HIMSELF by posting himself out with
   Delete — Admin → Users' door refuses the same (accounts.ts deleteAccountProblem); without this the pass deleted the
   signed-in admin on the spot (Fable's scenario 5). The sentence, or null. */
export function postOutProblem(id: string, outcome: PostOutcome): string | null {
  const here = adminArchived(id)
  if (here) return here
  /* the second fix read (18 Nov 26 — the security read's H2, Fable's plan): an Overseas Sqn posting suspends a master's
     account on its date, which only a master does (D2205), and a posting for another squadron's man is that squadron's
     admins' to set — said here, as Archive and Restore say it, before the commit gate refuses it */
  if (outcome === 'overseas') { const m = masterChangeProblem(id); if (m) return m }
  const other = otherSquadronPersonProblem(id)
  if (other) return other
  /* NO SANS FOR GROUND CREW (his D1709, 5 Nov 26): SANS is an aircrew status — the chips offer him none (OutcomeChips), and
     the writer refuses it whatever door asks */
  if (outcome === 'sans' && isGroundCrew(id)) return "Ground crew can't be made SANS"
  if (outcome === 'delete' && me() != null && id === me()) return "You can't delete yourself — ask another admin"
  /* a master is never deleted (accounts.ts masterDeleteProblem — the fix read, 18 Nov 26, Opus 1): refused as the
     posting is set, as Admin → Users' Delete refuses it */
  return outcome === 'delete' ? masterDeleteProblem(id) : null
}
/** a ground-crew man (the war's `pers`, Raptor's GND seat) — offered no SANS posting (his D1709) */
export function isGroundCrew(id: string): boolean {
  const b = rosterBody(id)
  return !!b && (!!b.pers || b.seat === 'GND')
}
export function postOut(id: string, from: string, archive: boolean | PostOutcome = true): boolean {
  const body = rosterBody(id)
  /* a DELETED man's posting is final ([POST-OUT-OUTCOMES], D287 — Fable F3) */
  if (body && body.deleted) return false
  const outcome: PostOutcome = typeof archive === 'string' ? archive : (archive ? 'overseas' : 'none')
  if (postOutProblem(id, outcome)) return false
  /* [POST-OUT-OUTCOMES] — #444's take-back, widened: what the posting made (its archive, the account it suspended, the
     SANS tick it put on) and the NEW posting no longer makes today — its date still to come, or its outcome changed —
     comes back in the same command. When the new posting makes it today too, it stands (the pass then records it). */
  const due = effectiveToday() > addDays(from, -1)
  const keep = { archive: due && outcome === 'overseas', suspend: due && outcome === 'overseas', sans: due && outcome === 'sans' }
  /* ALWAYS the posting command (`lw.postout` — its permission row, its envelope, what the database will authorise), a
     first posting and a change with nothing to take back included: a bare war write was routed as a generic `lw.edit`,
     a member's own-bid row (Astra's code read 4, 27 Sep 26). The command's gate decides who may; the take-back inside it
     touches only what the posting made. */
  /* A POSTING THAT RAN, THEN CHANGED, TAKES BACK ITS BELL LINES (his D1710, 5 Nov 26 — [PO-CHANGE-RETRACT], the take-back
     code read's 1). Its date moved — later, or earlier — or another outcome: what the bells say it did is no longer what it
     does (the SANS tick lifted above, the archive back), and the store clears its "has run" mark so it runs, and tells,
     again on its own date. So its lines go as the sheet's Undo takes them (a read one struck through, "taken back · Saber";
     an unread one simply goes; the admin who changed it told nothing). "Changed" is the store's own test for clearing that
     mark (store.ts setPostOut `same`, read from the saved posting); which lines are its own — none before it has run — is
     `postingLinesOf`'s. Saved unchanged, nothing is taken back. */
  const w = getState().postOuts[id]
  const changed = !!w && !!w.to && !(addDays(w.to, 1) === from && outcomeOf(w) === outcome)
  return takeBack(id, () => setPostOut(id, from, outcome), keep, changed)
}

/* ---- wiring -------------------------------------------------------------- */

/**
 * Boot the sync: one full pass now (inbound first, so Raptor's inputs are on
 * the grid before the grid answers back), then both stores are subscribed.
 * Each notification runs the near pass first and the far pass after it, so
 * a change on either side converges in one turn — including the ones the
 * reconcilers cannot see coming, like an Undo that removes an lw-tagged row.
 * Both passes are cheap no-ops when nothing they read has changed.
 */
/* THE PROBE PIN — the developer's-PC bridge only (probe-bridge.ts w.lwSetViewer, which is
   never installed on a deployed host). The Leave War's MECHANICS e2e drive rows as nobody in
   particular (null: canEditRow imposes no row rule) or as a named person; since [ACCOUNTS]
   the mirror below re-derives the viewer from the signed-in person on EVERY Raptor notify,
   so a plain setViewer from the bridge was overwritten by the next repaint (53 e2e failures,
   26 Sep 26). A pin holds for the sign-in it was set in and no longer: it is keyed to the
   SESSION object, which resetSession replaces at every sign-in and sign-out, so no pin can
   outlive the person who set it. No production caller. */
let VIEWER_PIN: { v: string | null; s: unknown } | null = null
export function pinViewer(v: string | null): void { VIEWER_PIN = { v, s: SESSION }; setViewer(v) }
/* …and a role changed IN PLACE is the same sign-in ([LW-HARNESS-VIEWER-PIN], 27 Sep 26): setEffectiveRole replaces the
   session object with a copy, so the bridge's raptorRole quietly ended the pin and the next repaint lit the signed-in
   man's row, not the pinned one — a test that pinned a viewer and then switched role tested a different man. The bridge
   hands the session it replaced; a pin keyed to it moves to the copy. A real sign-in (resetSession) still ends it. */
export function carryViewerPin(from: unknown): void {
  if (VIEWER_PIN && VIEWER_PIN.s === from && from !== SESSION) VIEWER_PIN = { v: VIEWER_PIN.v, s: SESSION }
}
const mirroredViewer = (): string | null => (VIEWER_PIN && VIEWER_PIN.s === SESSION ? VIEWER_PIN.v : viewerId())
/* and the signed-in person's callsign beside it, read off Raptor's whole roster (the war's own
   roster may not hold him — a SANS or archived callsign): the approver stamp's fallback */
const mirrorCallsign = (): void => { const m = me(); setViewerCallsign(m && rosterBody(m) ? rosterBody(m)!.cs : null) }

/* THE POSTINGS' MIDNIGHT ([POSTOUT-RUN-NOTICE] — owner D1546: "so it is not like gone silently"; the walk's C5, 5 Nov 26).
   The posting pass runs on every change the app makes (raptorSubscribe, below) — and on nothing else: with the app left
   open and untouched across midnight, a posting dated that day did not run, and no admin's bell was told, until someone
   next changed a page. So the app wakes itself just after each local midnight, and whenever the page is shown again after
   the day has turned (a phone asleep through midnight runs no timer): one notify, and the pass — with the OIL pass beside
   it, as on any change — runs as it would at the next tap. The Leave War page's own day clock (ui/dayclock.ts, D1266)
   still redraws what that page reads of today; this one wakes the passes on every page. One clock, started by the app's boot
   (src/boot.ts) — never by wiring the sync, which every Leave War test does (the fix round's read, 3: a real timer armed in
   each would fire inside a later test). Re-armed if started again; answers its clean-up. */
let POSTCLOCK: (() => void) | null = null
export function installPostingClock(): () => void {
  if (POSTCLOCK) POSTCLOCK()
  if (typeof window === 'undefined' || typeof document === 'undefined') { POSTCLOCK = null; return () => {} }
  let seen = effectiveToday()
  let timer: ReturnType<typeof setTimeout> | null = null
  const check = () => { const now = effectiveToday(); if (now !== seen) { seen = now; raptorNotify() } }
  const arm = () => {
    if (timer) clearTimeout(timer)
    const d = new Date(), next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 1)
    timer = setTimeout(() => { check(); arm() }, Math.max(1000, next.getTime() - d.getTime()))
  }
  const onShow = () => { if (document.visibilityState !== 'hidden') { check(); arm() } }
  arm()
  document.addEventListener('visibilitychange', onShow)
  window.addEventListener('pageshow', onShow)
  window.addEventListener('focus', onShow)
  const off = () => {
    if (timer) clearTimeout(timer)
    document.removeEventListener('visibilitychange', onShow)
    window.removeEventListener('pageshow', onShow)
    window.removeEventListener('focus', onShow)
    if (POSTCLOCK === off) POSTCLOCK = null
  }
  POSTCLOCK = off
  return off
}

export function wireLeaveWarSync(): void {
  /* a fresh wiring (a boot) tries every refused posting again (the fix read, 18 Nov 26 — Opus 1) */
  PO_REFUSED.clear(); PO_RETRIED.clear()
  /* [POST-OUT-OUTCOMES]: the posting's one line names his account only when he has one — the answer installed here, at
     the seam (the war never reads Raptor's accounts itself) */
  setAccountLookup(id => !!accountOfPid(id))
  setPostingBlockLookup((id, outcome) => adminArchived(id) || poHeldReason(id, outcome))
  /* [ONE-DOOR]: an Admin-archived man's posting dates are read-only on the war — both writers ask (Fable 4.2 / 4.3) */
  setPostingLockLookup(adminArchived)
  /* D308 ([ONE-DOOR]): a new person's post-in date, written inside the add's own command */
  HOOKS.warPostIn = (txn: Txn, id: string, date: string) => postInNewPerson(txn, id, date)
  /* The VIEWING PERSON rides this same wire (owner, 17 Aug 26 — the matrix
     lights the viewer's row and the counter picker answers with their
     numbers). Since [ACCOUNTS] (D166 (4), 26 Sep 26) it is the SIGNED-IN person —
     "View as" is retired — read through state/perms.ts viewerId(): his person, or ''
     (matches NO row) for a pending person or an account switched off (there is no guest any
     more: the guest view is removed, D2239), and null only with no session. Pushing it here — once at boot, again on every Raptor
     notify below — keeps the mirror converged without a new seam; setViewer no-ops on
     a same value. */
  setViewer(mirroredViewer()); mirrorCallsign()
  /* a sign-in loads his own squadron's war (swapWarWorld, above — multi-squadron batch 1, step 4) */
  setSessionWorldHook(u => { swapWarWorld(u) })
  /* the absence door — the war's changes to approved leave (design §5.2) */
  installAbsenceDoor()
  runPoArchive()
  refreshAbsences(true)
  absencesChanged()
  runOilPass()
  lastOilDaySig = oilDaySig()
  raptorSubscribe(() => {
    setViewer(mirroredViewer()); mirrorCallsign()
    // Before the passes: a body added on the Quals page must be on the roster
    // before inbound tries to land any of its leave (owner, 18 Aug 26).
    reprojectRoster()
    // [CMDL-FINISH] M3 — coalesce an IDLE multi-cell reconcile (week-nav
    // loadWeek→runOilPass crediting K cells) into ONE lw.sync projection. A no-op
    // when this callback runs at phase 8 (the committing lane coalesces on its own).
    /* design §4.1 order: roster, then the absence index (fresh before the OIL
       pass reads the merged day), then the passes */
    if (refreshAbsences()) absencesChanged()
    lwSyncTurn(() => { runPoArchive(); runOilPass() })
    lastOilDaySig = oilDaySig()
  })
  lwSubscribe(() => {
    /* The showSans switch (store.ts:setShowSans) is a Leave War write, so the
       re-projection that makes it take effect must run on THIS lane too — the
       Raptor lane alone would leave the toggle dead until some unrelated
       schedule edit happened to notify. Safe against its own echo: the write
       it makes (setPeople) re-fires this callback, and the signature compare
       inside reprojectRoster then finds nothing changed and stops. */
    reprojectRoster()
    /* A post-out placed just now (setPostOut is a Leave War write) archives on
       this lane too, so a PO dated in the past takes effect the moment it is
       set rather than waiting for a Raptor edit to happen along.
       [CMDL-FINISH] M3 — coalesced into ONE lw.sync projection when this lane runs
       at idle (a view-only setter waking the reconcilers writes nothing and emits
       nothing; a setShowSans that changes OIL cells emits one envelope). */
    /* the war's own records changed (a bid, a refusal, a credit): the clash
       strip is derived from them too (design §19 OA4-003) */
    publishLeaveClashes()
    lwSyncTurn(() => {
      runPoArchive()
      /* The OIL pass reads Leave War too — a PH flag set, an event word tagged
         "off day", a war created over the loaded week — so a Leave War change
         can change what a published Saturday earns. */
      runOilPass()
    })
    /* And the same change can create a PENDING OIL QUESTION out of thin air
       (owner, 28 Aug 26): mark a PH after an input already covers that day
       and the applicable user must be told. Nothing on the RAPTOR side
       repaints on a Leave War write, so the bell would stay dark until an
       unrelated schedule edit happened along — the confirmed missing-notify
       gap. A raptor notify is fired ONLY when the pending picture actually
       changed (a signature over every person's pending iid|iso pairs, the
       reprojectRoster change-guard idiom), so this lane's own echo finds an
       unchanged signature and the loop terminates. */
    /* Skipped mid-pass (bug pass, 28 Aug 26): the reconcilers' own per-cell
       store notifies re-fire this callback while SYNCING holds — the passes
       above all return at the door, and recomputing the signature once per
       ingested cell of a long leave span is pure waste. The top-level
       notify that follows the writer's finish runs it exactly once. */
    if (SYNCING) return
    /* A WAR CHANGE THAT MOVES WHAT A DAY OF THE LOADED WEEK EARNS RE-CHECKS THE SCHEDULE
       ([HUMAN-RETEST] amendment re-test, walk W4-F1, 24 Sep 26; register AM47 — D2: a holiday
       declared after publication waits for a republication AND THE DAY SAYS SO). The saying
       is the schedule's own advisory (validate.ts: OIL_STALE_DAY / OIL_STALE_HOLIDAY /
       OIL_NO_PERIOD / OIL_UNPUBLISHED), and nothing re-ran the checks on a Leave War write — so
       the day read an unexplained "1 pending" until a reload. Guarded like the pending
       signature below: only when the war's answer for some loaded day actually changed, so
       this lane's own echo (the raptor notify → the passes → a war write) finds nothing new. */
    const ods = oilDaySig()
    if (ods !== lastOilDaySig) { lastOilDaySig = ods; validate(); raptorNotify() }
    const sig = warInputs()
      .filter(r => oilAsks(r.type) && !oilSilent(r) && r.iid)
      .flatMap(r => {
        const answered = (r.oil ?? {}) as Record<string, number>
        return oilAskPlan(r).filter(p => answered[p.iso] == null).map(p => `${r.iid}|${p.iso}`)
      })
      .sort().join(';')
    if (sig !== lastPendingSig) { lastPendingSig = sig; raptorNotify() }
  })
}
/* the last pending-OIL signature the lw lane saw — module state, compared
   before the cross-lane notify above so it can never ping-pong */
let lastPendingSig: string | null = null
/* what the schedule's checks read from the war about the LOADED week: which days can earn
   (the weekend, a PH; an Off day does not) and which have no period to earn into — the facts
   behind the OIL advisories. One string per day, compared by the lw lane above. */
function oilDaySig(): string {
  return DAYS.map((_: unknown, di: number) => `${HOOKS.oilEarningDay(di) ? 1 : 0}:${HOOKS.oilNoPeriod(di) || ''}`).join('|')
}
let lastOilDaySig: string | null = null

/* =====================================================================
   WHAT THE CALENDARS READ FROM THE WAR — a rider on this seam (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.1; owner D617, D627, D631, D637, D640)
   ---------------------------------------------------------------------
   Two stores hold the facts of one day. Its flying class and its required pilots and WSOs are the scheduler's settings
   rows (state/flyplan.ts) — they outlive any one leave period. Whether it is a public holiday or an Off day, and who
   is available per seat, are the WAR's: its day events and bands, its roster, its bids and the absences it derives.
   The ONE resolver that joins them is state/flyplan-model.ts planFor; no screen joins them itself. This block is the
   war's half, read-only for the calendars:

     dayFacts(iso)      a date's holiday (with its name) and who is available per seat, from the period HOLDING the date
     holidaysIn(year)   the year's public holidays and Off days as one list — the war's own records, seen as a list
     useWarFacts()      the signal: a number that moves when anything those two read has moved

   WHY A SIGNAL OF ITS OWN (both readers of the plan, finding 1): the war's store repaints its own screens, and the one
   thing it tells the scheduler's side is the narrow OIL signal (the lw lane above fires a Raptor notify only when an
   OIL answer changed) — kept narrow on purpose, so the board is not repainted by leave bids. A holiday added in Days,
   a count row re-defined or a bid decided would otherwise leave a calendar showing yesterday's answer. The version
   below is PULLED, not pushed: each read compares what the reads depend on — the roster, the count rows, the event
   types and every period as merged with its absences — by identity, so it costs a handful of comparisons, cannot miss
   a writer (an Undo and a Redo replace the same objects), and stands still for a look (the day in view, the viewer,
   the role). */
export interface WarDayFacts extends DayFacts {
  /** the holiday's or Off day's name as typed ("PH", "National Day"); '' where the day is neither */
  name: string
  /** what a calendar's date tag prints for it, in the kind's colour — "PH", "OFF", "ND" (the build plan §3.12, D652:
   *  the same answer the Leave War's Event row prints, eventdefs.ts shortOf); '' where the day is neither */
  short: string
  /** a Saturday or a Sunday */
  weekend: boolean
}
/** one line of the Holidays list: a public holiday or an Off day, over one date or a run of dates — the record it
 *  stands for (engine/holidays.ts HolidayRef: its period, where it is, its dates, kind and name) and an id for the list.
 *  The list's three writers take the line itself: holidayChange(line, …), holidayRemove(line). */
export interface HolidayLine extends HolidayRef { id: string }
export { holidayAdd, holidayChange, holidayCheck, holidayRemove, holidaysImport, type HolidayResult, type HolidayFail, type HolidayImportResult } from './state/store'
/* holidays by file (D1501): the sheet the Calendar window's Export sheet writes and Import sheet reads */
export { holidaySheetRows, readHolidaySheet, type SheetRow } from './engine/holidaysheet'
export { MAX_HOLIDAY_NAME, type HolidayDraft, type HolidayRef } from './engine'

let WF_VER = 0
let WF_SIG: readonly unknown[] = []
const FACTS = new Map<string, WarDayFacts>()
export function warFactsVersion(): number {
  const s = getState()
  /* the Required rows' names too (D1193): the calendars and the war's rows name them, so a rename must move this */
  const sig: unknown[] = [s.people, s.requirements, s.eventDefs, s.reqNames, ...s.wars]
  if (sig.length !== WF_SIG.length || sig.some((x, i) => x !== WF_SIG[i])) {
    WF_SIG = sig
    WF_VER += 1
    FACTS.clear()
  }
  return WF_VER
}
/** told once per change that matters — never for a look */
export function subscribeWarFacts(fn: () => void): () => void {
  let seen = warFactsVersion()
  return lwSubscribe(() => {
    const v = warFactsVersion()
    if (v !== seen) { seen = v; fn() }
  })
}
/** for a component: re-renders it when the war's answers may have moved; the number is fit to key a memo on */
export function useWarFacts(): number {
  return useSyncExternalStore(lwSubscribe, warFactsVersion, warFactsVersion)
}

const holidayKind = (k: EventKind | null): 'ph' | 'off' | null => (k === 'off' ? 'ph' : k === 'free' ? 'off' : null)
/* a period's days run from its first date without a gap, so a date's day is found by counting — with a plain search
   behind it should a stored period ever not be */
function dayIn(period: Period, iso: string): DayInfo | undefined {
  const i = Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) -
    Date.UTC(+period.start.slice(0, 4), +period.start.slice(5, 7) - 1, +period.start.slice(8, 10))) / 86400000)
  const d = period.days[i]
  return d && d.date === iso ? d : period.days.find(x => x.date === iso)
}
function readDayFacts(iso: string): WarDayFacts {
  if (!validIso(iso)) return { covered: false, kind: null, name: '', short: '', weekend: false, availP: null, availW: null }
  const weekend = isWeekend(iso)
  const st = getState()
  /* the period HOLDING the date — never the one on screen: the calendars show any month */
  const war = warHolding(st.wars, iso) as MergedWar | undefined
  /* no period covers it: there was nowhere to file a holiday, and nobody's leave is known — so who is available is
     UNKNOWN, never zero and never everyone (the need then shows "–") */
  if (!war) return { covered: false, kind: null, name: '', short: '', weekend, availP: null, availW: null }
  const day = dayIn(war.period, iso)
  const h = day ? holidayAt(st.eventDefs, day, war.period.bands) : null
  const rows = availRules()
  return {
    covered: true,
    kind: h ? holidayKind(h.kind) : null,
    name: h ? h.name : '',
    short: h ? shortOf(st.eventDefs, h.name, h.short) : '',
    weekend,
    /* the same sum the war's own Available cells draw (engine/availrows.ts availHave) — a SANS man never counted */
    availP: availHave(rows.p, st.people, war.grid, war.states, iso, war.views),
    availW: availHave(rows.w, st.people, war.grid, war.states, iso, war.views),
  }
}
export function dayFacts(iso: string): WarDayFacts {
  warFactsVersion()                       // drops every kept answer when anything they were read from has moved
  const hit = FACTS.get(iso)
  if (hit) return hit
  const out = Object.freeze(readDayFacts(iso))
  if (FACTS.size >= 4096) FACTS.clear()   // a few years of dates; clearing is only a miss
  FACTS.set(iso, out)
  return out
}

/** THE YEAR'S PUBLIC HOLIDAYS AND OFF DAYS, in date order — every period that reaches into the year, not only the one
 *  on screen. A line is the record as the war holds it: a merged band; a day's own Event line, with the same word
 *  repeated over neighbouring days read as ONE run (the Event sheet's "repeat" writes it that way); or the seeded
 *  holiday flag where no event names the day. A line that starts or ends outside the year is shown whole. */
export function holidaysIn(year: number | string): HolidayLine[] {
  const y = String(year).trim()
  if (!/^\d{4}$/.test(y)) return []
  const lo = `${y}-01-01`, hi = `${y}-12-31`
  const st = getState()
  const out: HolidayLine[] = []
  const kinds = new Map<string, EventKind | null>()
  const kindOf = (text: string, own: EventKind | null | undefined): 'ph' | 'off' | null => {
    if (own) return holidayKind(own)
    if (!kinds.has(text)) kinds.set(text, classifyEvent(st.eventDefs, text))
    return holidayKind(kinds.get(text)!)
  }
  for (const war of st.wars) {
    const p = war.period
    if (p.end < lo || p.start > hi) continue
    const mine: HolidayLine[] = []
    const add = (src: HolidayLine['src'], line: number | null, from: string, to: string, kind: 'ph' | 'off', name: string, own?: unknown): HolidayLine => {
      /* `short` = what it prints, the same answer as the calendars' tag and the Leave War's Event row (D652) */
      const h: HolidayLine = { id: `${p.id}|${src}|${line ?? 'f'}|${from}`, warId: p.id, from, to, kind, name, src, line, short: shortOf(st.eventDefs, name, normShort(own)) }
      mine.push(h)
      return h
    }
    const phBands: EventBand[] = []
    for (const b of p.bands) {
      const k = kindOf(b.text, b.kind)
      if (!k) continue
      if (k === 'ph') phBands.push(b)
      add('band', b.line, b.from, b.to, k, b.text, b.short)
    }
    const open = new Map<number, HolidayLine>()      // per Event row, the run still growing
    let flag: HolidayLine | null = null
    for (const d of p.days) {
      let named = false
      for (let i = 0; i < d.events.length; i++) {
        const t = d.events[i]
        const k = t ? kindOf(t, d.eventKinds?.[i]) : null
        if (!k) { open.delete(i); continue }
        if (k === 'ph') named = true
        const run = open.get(i)
        if (run && run.kind === k && defKey(run.name) === defKey(t!) && addDays(run.to, 1) === d.date) run.to = d.date
        else open.set(i, add('day', i, d.date, d.date, k, t!, d.eventShorts?.[i]))
      }
      for (const i of [...open.keys()]) if (i >= d.events.length) open.delete(i)
      if (d.ph && !named && !phBands.some(b => b.from <= d.date && d.date <= b.to)) {
        if (flag && addDays(flag.to, 1) === d.date) flag.to = d.date
        else flag = add('flag', null, d.date, d.date, 'ph', 'PH')
      } else flag = null
    }
    for (const h of mine) if (h.to >= lo && h.from <= hi) out.push(h)
  }
  return out.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : (a.line ?? -1) - (b.line ?? -1)))
}

/** THE DATES OF A YEAR NO LEAVE PERIOD COVERS, as runs in date order — [] when the year is held whole. A holiday is the
 *  war's own record, kept in the period HOLDING its date, so a date outside every period has nowhere to be written: the
 *  Holidays list says which dates those are BEFORE a save is refused (the plan §3.4; D19 — "indicate that the leave war
 *  period doesn't exist, create it"). One run that is the whole year = no period reaches the year at all. */
export function uncoveredIn(year: number | string): Array<{ from: string; to: string }> {
  const y = String(year).trim()
  if (!/^\d{4}$/.test(y)) return []
  const lo = `${y}-01-01`, hi = `${y}-12-31`
  const held = getState().wars.map(w => w.period).filter(p => p.end >= lo && p.start <= hi).sort((a, b) => (a.start < b.start ? -1 : 1))
  const out: Array<{ from: string; to: string }> = []
  let at = lo                                  // the first date not yet known to be covered
  for (const p of held) {
    if (p.start > at) out.push({ from: at, to: addDays(p.start, -1) })
    if (p.end >= at) at = addDays(p.end, 1)
  }
  if (at <= hi) out.push({ from: at, to: hi })
  return out
}
/** the word a holiday with no name of its own is saved under — the squadron's first event type of that kind, else the
 *  standard one (the same answer as state/store.ts holidayPlan; the list's form shows it in its empty name box) */
export function holidayWord(kind: 'ph' | 'off'): string {
  const k = kind === 'ph' ? 'off' : 'free'
  return getState().eventDefs.find(d => d.kind === k)?.name || (kind === 'ph' ? 'PH' : 'Off day')
}
/** WHAT A HOLIDAY OF THAT NAME WOULD PRINT with no short form typed for it - the SAME suggestion the Event sheet shows in
 *  its "On grid" box (eventdefs.ts shortOf: a preset's own short form, else one made from the name), so the Holidays
 *  list's form can show it as he types (D652 reading 1: "filled by itself from the name's initials ... exactly as on
 *  the Event sheet - the same rule"). '' where the name gives nothing to print. */
export function holidayShortHint(kind: 'ph' | 'off', name: string): string {
  const s = shortOf(getState().eventDefs, name.trim() || holidayWord(kind), null)
  return s === '•' ? '' : s
}

/* =====================================================================
   THE WAR READS THE FLYING PLAN — the second rider on this seam (the plan §3.1 point 2)
   ---------------------------------------------------------------------
   The war's Required rows show the scheduler's own records — a day's class, its required pilots and WSOs, a figure
   that runs from a date — and write them through the scheduler's typed commands. They reach them HERE and nowhere
   else, so the boundary between the two apps stays the one file it has always been. The plan's rows repaint on the
   scheduler's own change signal (state/store useVersion), the war's on `useWarFacts()` above.

   AND THE ONE JOIN. `flyAnswer` hands the three halves of a day — the plan, the war's facts, the SANS committed to
   fly — to the ONE resolver (state/flyplan-model.ts planFor). Every screen that shows a day's class, its required
   figures or how many more are needed asks here: the war's rows, the SANS calendar, the Inputs calendar's tags, Days.
   A screen that puts the halves together itself is a defect (the plan's risk 1) — two screens would then be free to
   show two answers for one day. */
/* EVERY PART READS ONE SQUADRON — THE WAR'S (the reshape plan §3.2 A-ii, "Own-page settings"; helper "war", second
   pass). The scheduler's plan, its SANS colours and its writers default to the squadron PICKED ("149 ▾"); the war is its
   own squadron's (warUnit) whatever is picked, so the reads and the writers the war reaches here name the war's squadron
   unless a caller names another — never the pick by default. (sansFly and sansCommittedOn take their people from the
   caller, sansFlyOwn below for the war.) */
export { sansFly, sansCommittedOn, type FlyDayPatch, type FlySave, type SansCommitted, type SeatIds } from '../state/flyplan'
export const getFlyPlan = (unit: string = warUnit()): FlyPlan => planOfUnit(unit)
export const getTones = (unit: string = warUnit()): Tones => tonesOfUnit(unit)
export const setFlyDays = (patches: FlyDayPatch[], unit: string = warUnit()): FlySave => setFlyDaysOf(patches, unit)
export const setFlyRun = (iso: string, patch: FlyRun, opts?: { clearDay?: boolean; clear?: readonly string[] }, unit: string = warUnit()): FlySave =>
  setFlyRunOf(iso, patch, opts, unit)
export const dropFlyRun = (iso: string, seats: Array<'p' | 'w'>, unit: string = warUnit()): FlySave => dropFlyRunOf(iso, seats, unit)
export type { DayAnswer, FlyCls, Tone } from '../state/flyplan-model'

/** THE PLAN'S OWN CHANGE SIGNAL, for a component of the war (the plan §3.3 "Repaint"): the scheduler's version, which
 *  moves when a plan row or a SANS commitment moves. The war's rows hear the scheduler HERE,
 *  as they reach its records here — beside `useWarFacts()` for the war's own half. */
export function usePlanVersion(): number {
  return useSyncExternalStore(raptorSubscribe, raptorVersion, raptorVersion)
}
/** the two Available rows' names as they stand (an admin renames them with the counter form — D640) */
export function availRowNames(): { p: string; w: string } {
  const r = availRules()
  return { p: r.p.label, w: r.w.label }
}
/** the two Required rows' names as they stand (D1193 — an admin renames them from the row's name; "Required P" and
 *  "Required W" until then). The war's rows and every window that names a Required row read them here. */
export function reqRowNames(): { p: string; w: string } {
  return reqNamesOf(getState().reqNames)
}

/** WHERE AN AVAILABLE ROW STANDS ON A DAY — '' | 'amber' | 'red' (D1190, D1191, D1202): who the war has for the seat
 *  against that day's Required from the ONE resolver, judged by the row's own points (engine/availrows.ts availVerdict,
 *  the one answer). A no-fly day requires nobody and shows neither. `a` — the day's answer, where the caller has it. */
export function availVerdictAt(iso: string, seat: 'p' | 'w', a: DayAnswer = flyAnswer(iso)): AvailVerdict {
  const f = dayFacts(iso)
  const rule = availRules()[seat]
  return availVerdict(seat === 'p' ? f.availP : f.availW, a.reqFrom[seat] === 'nf' ? null : a.req[seat], availPointsOf(rule))
}
/** THE BID WINDOWS' DAY LINE (D1144, D1213; M3): what a bid of `code` on `dates` would do to manning, each day the store
 *  would write — his seat's Available row judged against that day's Required by its own points (the same judge as
 *  `availVerdictAt`, on the figure the bid would leave), and the Manning rows it would turn amber or red. */
export function bidDayLine(personId: string, dates: readonly string[], code: string): DayWhatIf[] {
  const rules = availRules()
  return bidWhatIf(personId, dates, code, (seat, have, iso) => {
    const a = flyAnswer(iso)
    return availVerdict(have, a.reqFrom[seat] === 'nf' ? null : a.req[seat], availPointsOf(rules[seat]))
  })
}

/** The Available rows at RED on one day, each named with its figure (P, then W) — never at amber (D1243). */
export function availRedAt(iso: string, a: DayAnswer = flyAnswer(iso)): RedLine[] {
  const f = dayFacts(iso)
  const req = (s: 'p' | 'w') => (a.reqFrom[s] === 'nf' ? null : a.req[s])
  return availRedLines(availRules(), { p: { have: f.availP, required: req('p') }, w: { have: f.availW, required: req('w') } })
}

/** THE DAYS BREAKING A MANNING RULE — the under-manned count and its list (D1243, narrowing D1213): every day of
 *  `dates` with a Manning row below its red (`verdicts`, evaluatePeriod's) or an Available P or W row at its red, each
 *  with the rows and their figures ("SXO 1 · Available P 23"); amber is never counted. In date order. The Available
 *  rows' Required comes from the scheduler's plan, so a screen showing this listens to `usePlanVersion()` as well as to
 *  the war. The answers are read a month at a time (the resolver's own month), never once per day. */
export function manningRedDays(dates: readonly string[], verdicts: Record<string, DayVerdict>): RedDay[] {
  const months = new Map<string, Record<string, DayAnswer>>()
  const answer = (iso: string): DayAnswer => {
    const k = iso.slice(0, 7)
    let m = months.get(k)
    if (!m) { m = flyMonth(+k.slice(0, 4), +k.slice(5, 7)); months.set(k, m) }
    return m[iso] ?? flyAnswer(iso)
  }
  /* the two rows read once for the whole run of dates, not once a day (the strip repaints on every war notify) */
  const rules = availRules()
  const req = (a: DayAnswer, s: 'p' | 'w') => (a.reqFrom[s] === 'nf' ? null : a.req[s])
  return redDays(dates, verdicts, iso => {
    if (!validIso(iso)) return []
    const a = answer(iso), f = dayFacts(iso)
    return availRedLines(rules, { p: { have: f.availP, required: req(a, 'p') }, w: { have: f.availW, required: req(a, 'w') } })
  })
}

/** THE WAR'S DOOR TO DAYS (the plan §3.3 — the "Days…" line in the war's ⚙ Settings). Days is the scheduler's window
 *  (ui/DaysWindow.tsx, admins only — the window itself is the gate); the war asks for it HERE, on the month of the date
 *  given, and tells the scheduler's screens so it draws at once. Only the open-flag is reached (ui/pops.ts, plain state
 *  with no screen behind it) — the war imports no scheduler screen. */
export function openDays(iso: string): void {
  if (!validIso(iso)) return
  /* the war is his own squadron's page: the window is that squadron's, stamped as it opens (step A, R-O5) */
  openWinFor('days', pageUnit('own'))
  setDaysWin(iso)
  raptorNotify()
}

/* …AND WHETHER IT IS UP, read back the same way ([LW-DOUBLETAP-MORE-WINDOWS], the fix brief of 15 Nov 26, item 3): on a
   phone with the page scrolled, its ✕ stands over the war's pinned dates, so its going is handed to the grid's double-tap
   guard (LeaveWarPage.tsx). The open-flag only — still no scheduler screen. */
const daysWinUp = () => DAYSWIN !== null
/** whether the scheduler's Calendar window (the "Calendar…" line in the war's ⚙) is up */
export function useDaysWinUp(): boolean { return useSyncExternalStore(raptorSubscribe, daysWinUp, daysWinUp) }

/** THE WAR'S DOOR TO AN INPUT'S OWN WINDOW — the clash note's "Change the leave on Inputs" ([LW-CLASH-NOTE-PHONE], owner
 *  D827, 13 Oct 26: a tap opens "the leave's own window on the Inputs page"). The day's sheet has no control for leave
 *  filed there (it says so), which is why the clash sends him here. Like `openDays`, only a flag is reached (ui/pops.ts
 *  — the window is the scheduler's, drawn at the app's own level, and is its own gate on who may change what): the
 *  Inputs page is brought to the front and the input's window opened on it. False where the input is gone — the
 *  caller then opens the day instead, so the tap never does nothing. */
/** "ALSO SINCE YOU LAST LOOKED · nothing to decide" (the overhaul's M4, 8.4 — D1231's reading; the register's P9; drawn
 *  full/r22-2-desk): what reached the war since this admin last opened Approvals that is not his to decide —
 *  · a member's WITHDRAWN pending bid: the request is gone, so its only trace is the change history's line for it
 *    (state/changelines.ts warLines — marked `fld: 'withdrawn'`, its code in `itype`), read by that mark;
 *  · LEAVE FILED ON THE INPUTS PAGE, which lands on the war approved (D1166): read off the leave itself, whose `by` / `at`
 *    say who filed it and when (state/inputstamp.ts — D629). A leave the war approved (`lw`) is a decision, not news.
 *  Only the period's dates; never what he did himself. Each a line a run of days, newest first. */
export interface AlsoLine { key: string; personId: string; code: string; from: string; to: string; what: 'withdrawn' | 'inputs'; by: string | null; at: number }
export function alsoSince(prev: number, from: string, to: string, me: string | null): AlsoLine[] {
  const out: AlsoLine[] = []
  /* the withdrawals — one history line a day; consecutive days of one man and one kind are one line */
  const rows = ELOG.rows.filter(r => r.fld === 'withdrawn' && r.sub && r.t > prev && r.date && r.date >= from && r.date <= to && String(r.pid ?? '') !== String(me ?? ''))
    .slice().sort((a, b) => (a.sub! < b.sub! ? -1 : a.sub! > b.sub! ? 1 : 0) || ((a.itype || '') < (b.itype || '') ? -1 : 1) || (a.date! < b.date! ? -1 : 1))
  for (const r of rows) {
    const last = out[out.length - 1]
    if (last && last.what === 'withdrawn' && last.personId === r.sub && last.code === (r.itype || '') && addDays(last.to, 1) === r.date) {
      last.to = r.date!
      if (r.t > last.at) last.at = r.t
      continue
    }
    out.push({ key: `w|${r.lineId}`, personId: r.sub!, code: r.itype || '', from: r.date!, to: r.date!, what: 'withdrawn', by: r.pid != null ? String(r.pid) : null, at: r.t })
  }
  /* the Inputs page's leave, on a man the war shows */
  const onWar = new Set(getState().people.map(p => p.id))
  for (const row of warInputs()) {
    if (!row || row.lw || !isLeave(row.type) || !(typeof row.at === 'number' && row.at > prev)) continue
    if (row.by != null && me != null && String(row.by) === String(me)) continue
    const pid = onlyNamed(row)
    if (pid == null || !onWar.has(String(pid))) continue
    const days = inputDates(row).filter((d: string) => d >= from && d <= to)
    if (!days.length) continue
    const c = absencesAt(String(pid), days[0]!).find(x => x.id === String(row.iid))
    out.push({ key: `i|${row.iid}`, personId: String(pid), code: c ? notationOf(c.code, c.win) : String(row.type), from: days[0]!, to: days[days.length - 1]!, what: 'inputs', by: row.by != null ? String(row.by) : null, at: row.at })
  }
  return out.sort((a, b) => b.at - a.at || (a.key < b.key ? -1 : 1))
}

/** A REQUEST'S DOCUMENTS, READ ONLY (the overhaul's M4 — 8.2's paperclip, and every document chip on the war): the app's one
 *  document viewer (ui/DocViewer.tsx) on a request-shaped page — whose leave, the kind and its days, its remarks, who placed
 *  it — with no "Edit input" or "Upchit" in its foot. Nothing on the war opened a document before (the survey §4). */
export function openRequestDocs(r: { personId: string; code: string; from: string; to: string; docIds: readonly string[]; remarks?: string; placedBy?: string; placedAt?: number }): boolean {
  if (!r.docIds.length) return false
  setDocView({ row: requestDocRow(r), readOnly: true })
  raptorNotify()
  return true
}
/** …the page itself: whose leave, its kind (a bid not yet placed — no kind picked — reads "Bid") and its days. Also what a
 *  window's own Document chip opens on (ui/inputedit.tsx DocField — his D1292: a file just added opens straight away) */
export function requestDocRow(r: { personId: string; code: string; from: string; to: string; docIds: readonly string[]; remarks?: string; placedBy?: string; placedAt?: number }): WarInput {
  const a = isoToInputDate(r.from), b = isoToInputDate(r.to)
  return {
    person: r.personId, type: r.code ? (parseCell(r.code)?.type ?? r.code) : 'Bid', allday: true, date: a.date, yr: a.yr,
    ...(r.to > r.from ? { endDate: b.yr === a.yr ? b.date : `${b.date} ${b.yr}` } : {}),
    remarks: r.remarks ?? '', docIds: [...r.docIds],
    ...(r.placedBy ? { by: r.placedBy } : {}), ...(typeof r.placedAt === 'number' ? { at: r.placedAt } : {}),
  }
}
/** …AND A LEAVE'S, FILED OR APPROVED, READ ONLY (M4 — the spec's reading 8: every document chip on the war opens the
 *  document; the day's list and the bid windows' Document row): the same viewer on the input itself; its papers change on
 *  the Inputs page or in its own bid window, never from the viewer opened here */
/* `row` — an input, or a war request's own words and documents (DayList's read-only line): only its documents are read */
export function openInputDocs(row: Partial<WarInput> | null | undefined): boolean {
  if (!row || !rowDocIds(row).length) return false
  setDocView({ row, readOnly: true })
  raptorNotify()
  return true
}
/** M3's leftover (7), M4 9.3a: put a replaced bid's remarks and documents — kept on its grid notice — onto the leave that
 *  replaced it, when that is a leave of the same man that still stands. Through the one remarks save (ui/inputedit.tsx
 *  setLeaveRemarks → commitInputEdit), so who may change that leave is asked as anywhere: the man himself or an admin.
 *  Answers the input it would go onto (`can`) and whether it was written. */
export function replacedCarry(personId: string, n: { remarks?: string; docIds?: readonly string[]; iid?: string }): { row: WarInput; remarks: string; docIds: string[] } | null {
  if (!n.iid || (!n.remarks && !n.docIds?.length)) return null
  const row = warInputs().find(r => String(r.iid) === n.iid)
  if (!row || !isLeave(row.type) || !idsOf(row).map(String).includes(personId)) return null
  const have = rowDocIds(row)
  const docIds = [...new Set([...have, ...(n.docIds ?? [])])]
  const cur = String(row.remarks ?? '').trim()
  const add = (n.remarks ?? '').trim()
  const remarks = !add || cur.includes(add) ? cur : cur ? `${cur} · ${add}` : add
  if (remarks === cur && docIds.length === have.length) return null       // already carried
  return { row, remarks, docIds }
}
export function openInputWindow(iid: string): boolean {
  const row = warInputs().find(r => String(r.iid) === String(iid))
  if (!row) return false
  if (CURPAGE !== 'inputs') setPage('inputs')
  setInpEdit(row)
  raptorNotify()
  return true
}

/** A PASSING NOTE FROM THE WAR'S OWN WINDOWS (round 2's FULL check — the fresh code read's F2): a press that did less than
 *  it was asked — a day of a range left out — said where the window that would have said it has closed (the design
 *  guide, D850). A rider on this seam, as `openInputsPage` is: the app's passing note, reached from the war's screens. */
export function sayOnWar(text: string): void { HOOKS.toast(text, 'warn') }

/** THE CLOSED NOTE'S "Open the Inputs page" (D1176, D1166 — "seek management's approval, then file it on the Inputs
 *  page"; drawn r7-08): the Inputs page brought to the front, nothing opened on it. Only a flag is reached, as `openDays`. */
export function openInputsPage(): void {
  if (CURPAGE !== 'inputs') setPage('inputs')
  raptorNotify()
}

/** THE WAR'S NEW-PERIOD SHEET, ASKED FOR FROM DAYS, on a run of dates no leave period covers (the plan §3.4). The
 *  Holidays list cannot write a holiday there, and nothing about making a period is rebuilt in the scheduler's
 *  window: the ask is left for the war's own top row (ui/warask.ts, ui/Chrome.tsx), the Leave War is brought to the
 *  front — the sheet is the war's, drawn on its page — and the scheduler's screens are told. The sheet still checks
 *  everything itself (a name, an admin, no overlap): the ask grants nothing. */
export function openNewPeriod(from: string, to: string): void {
  if (!validIso(from) || !validIso(to) || to < from) return
  askNewWar({ from, to })
  if (CURPAGE !== 'leavewar') setPage('leavewar')
  raptorNotify()
}

/* (the SANS men committed are the WAR'S OWN squadron's on that date — multi-squadron step 4: a 149 SANS man's offer to
   fly never lowers 142's need, and a man's squadron is read on the day, engine/roster.ts unitPeople) */
/* (every part of an answer is ONE squadron's — the plan, its SANS colours and its SANS men — the war's unless the caller
   names another, never the pick by default: helper "war", second pass. The day's facts are the named squadron's own —
   ownDayFacts, below.) */
const sansFlyOf = (unit: string) => (iso: string) => sansFly(iso, undefined, unitPeople(unit, iso))
/** WHAT A DAY IS FOR A NAMED SQUADRON — what an own page reads (the SANS calendar and its day, the Inputs calendar, the
 *  Calendar window), never `dayFacts` itself, which is the LOADED war's.
 *  - Its holiday kind, name and short tag are the named squadron's own — a public holiday or an Off day from its own
 *    list (D2195; the reshape plan §7, A4's flying-plan reader: a 149 page read 142's holidays whenever 142's war was
 *    loaded) — its own war's when loaded, else its saved war (unitDayFacts).
 *  - WHO IS AVAILABLE is known only from a loaded war: for a squadron whose war is not the loaded one it is NOT KNOWN —
 *    `availP` / `availW` null, so its "still needed" is "–" with no colour, as on a date no period covers — never the
 *    loaded war's figure (helper "left2", 21 Nov 26: 149's need once read 142's availability — 11 / 22 where its own war
 *    said 35 / 35 — and a 142 pilot's leave moved it; reachable when his own move takes effect at midnight while a Leave
 *    War window holds the old war). `otherWar` says so, so a page does not say "No leave period covers this date" there:
 *    a period may cover it in that squadron's own war. */
export function ownDayFacts(unit: string, iso: string): WarDayFacts & { otherWar: boolean } {
  const f = dayFacts(iso)
  if (!unit || unit === worldUnit()) return { ...f, otherWar: false }
  const own = unitDayFacts(unit, iso)
  return { covered: false, kind: own.kind, name: own.name, short: own.short, weekend: f.weekend, availP: null, availW: null, otherWar: true }
}
const factsOf = (unit: string) => (iso: string): DayFacts => !unit || unit === worldUnit() ? dayFacts(iso) : ownDayFacts(unit, iso)
export function flyAnswer(iso: string, unit: string = warUnit()): DayAnswer {
  return planFor(iso, planOfUnit(unit), factsOf(unit)(iso), sansFlyOf(unit)(iso), tonesOfUnit(unit))
}
/** a month of answers (1-based month) — what a drawn month is painted from, and what its repaint is keyed on: a figure
 *  or a weekday rule that began months earlier moves these, so a memo built from them cannot miss it */
export function flyMonth(y: number, m: number, unit: string = warUnit()): Record<string, DayAnswer> {
  return monthAnswers(y, m, planOfUnit(unit), factsOf(unit), sansFlyOf(unit), tonesOfUnit(unit))
}

/* A LEAVE REQUEST'S DOCUMENT AND REMARKS (M3 5.9, 5.10 — D1159, D1226): the bid windows draw the app's one Document
   button and the Inputs page's own "till <date>" — reached through this seam, never imported across it (a rider on the
   inputs wire, as the published remarks editor's is) */
export { DocField } from '../ui/InputWindow'
export { tillOfISO } from '../engine/inputs'
export { rowDocIds }
export { docGet } from '../state/docs'

/* THE SCHEDULE'S OWN PUCK, for the war's day panel and its one-line leave row (M3 6.3 — his lesson 25: never a look-alike) */
export function puckHtml(id: string, callsign = ''): string {
  const h = puck(id, false, true, false).replace(' tabindex="0"', '')
  /* a war person the roster no longer draws (a demo row, one deleted since) still reads as his callsign */
  return h || `<span class="ll-cs">${String(callsign).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c])}</span>`
}
