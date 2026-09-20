// THE ABSENCE RULES AT THE INPUTS DOOR ([ARCH-STACK] step 4 — clash check B7,
// H1, H2, H6; design §25, §26; owner answers A–D, 20 Sep 26).
//
// Every Input write runs through the Raptor inputs door (`runInputWrite`), and
// every undo / redo of Inputs through its restore body; this module is the
// Leave War's seat in both (state/inputgate-hook.ts). One statement of the
// rules, so the Inputs page, the calendar, reassign, the medical cascade and
// the war's own approve / move / remove all obey the same ones:
//
//   1. SICK CUTS LEAVE (H2, §26.1). ATT C / HL / OML filed over a person's
//      leave trims the leave in half-day steps in the same command: a
//      full-day medical removes the leave day; a half-day medical turns a
//      full leave day into the other half, or removes a same-half leave. The
//      charge follows on its own (figures read what is there).
//   2. THE INVARIANT (B7, §25, owner H3-overruled). No two leaves of one
//      person on overlapping TIMES, and no leave over a medical. Refused
//      whole, naming the blocker. Judged only for the records this command
//      changed (their dates, type or times), so an old record elsewhere never
//      blocks an unrelated edit.
//      Leave over RECORDED WORK is NO LONGER refused (owner, 20 Sep 26,
//      setting aside §26.3): it is written, the day goes amber, and the filer
//      is told in the same breath — `vet` returns those notes rather than
//      throwing, so a flag and a door stay separate things.
//   3. A CLASHING INPUT REPLACES AN UNDECIDED BID (owner rule 19 Sep 26 as
//      narrowed by H1 and answer B). Leave, or ATT C / HL / OML, on the same
//      time as a pending or acknowledged bid removes the clashing part of the
//      bid (only the clashing half; the rest keeps its state) in the same
//      command. When anyone but the bid's own person did it, a notice record
//      stays on the war until "OK, seen" (B6). Course, overseas duty, ATT B
//      and everything that never shows on the war leave a bid alone.
//      The war's own writes (approve / move / remove) manage their requests
//      themselves and skip this step (`inDoor`).
//
// A restore (undo / redo) runs rule 2 only: it replays exact records.

import { CmdRefused } from '../command'
import { HOOKS } from '../engine/hooks'
import { INPUTS, inpId, isLeave, nowStamp } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { LOGINROLE, ME, SESSION } from '../state/auth'
import { setInputGate } from '../state/inputgate-hook'
import { buildAbsenceIndex, contribsOfInput, inputDates, warCodeOf, warVisible } from './absences'
import { addDays, warHolding } from './engine'
import { AM, FULL, PM, forbiddenPair, isLeaveCode, isSickCode, overlaps, winsOf, type Contrib, type Win } from './engine/dayview'
import { creditWins, newRecId, portionOfCode, recsAt, requestWin, type NoticeRec, type RequestRec, type WarRec } from './engine/warrecs'
import { lwEditLists, rawState } from './state/store'
import { inDoor, refreshAbsencesAndRepaint, sliceInput } from './sync'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** '2026-07-18' → '18 Jul'. Exported so the publish door names a day in the
 *  same words this door does. */
export const dm = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const winText = (w: Win) => (w[0] === FULL[0] && w[1] === FULL[1] ? '' : `${hhmm(w[0])}–${hhmm(w[1])}`)
/** A person's callsign, falling back to their id. Exported for the same
 *  reason as `dm` above. */
export const cs = (p: string) => ((PEOPLE as any)[p]?.cs ?? p) as string
const typeLabel = (code: string) => (code === 'ATTC' ? 'ATT C' : code === 'ATTB' ? 'ATT B' : code)

/** The fields that decide what an Input claims on the war: who, what, when. A
 *  remark, a document, the `lw` provenance or an acceptance mark is not a new
 *  claim, so it is not re-judged. */
const claimKey = (r: any) => JSON.stringify([r.person, r.type, r.date, r.endDate ?? null, r.yr ?? null, !!r.allday, r.half ?? null, r.s ?? null, r.e ?? null])

function refuse(msg: string): never {
  HOOKS.toast(msg, 'warn')
  throw new CmdRefused(msg)
}

/* ---- 1. sick cuts leave ------------------------------------------------- */
function sickCutsLeave(changed: any[], changedIds: Set<string>): string[] {
  const said: string[] = []
  for (const med of changed) {
    if (!isSickCode(warCodeOf(med.type))) continue
    /* THE CUT KEEPS THE HOURS THE MEDICAL DOES NOT COVER (owner, 20 Sep 26 —
       "keep leave from 2pm"). Two readings of the same medical, each doing one
       job, and they must not be confused:
         `medWins`   — the REAL hours. Whether this medical touches the leave
                       at all, and how far the surviving piece is pushed clear.
         `medHalves` — the half the six-hour rule DRAWS it in (H2). Which half
                       of a touched day the medical takes.
       A 09:00–14:00 medical draws as a MORNING (five hours, midpoint 11:30),
       so the medical takes the morning and the leave keeps the afternoon — but
       its real hours run to 14:00, so the surviving afternoon starts at 14:00,
       not at 12:01. Reading the cut from the half ALONE left leave standing
       from 12:01 that the invariant then refused, because the real hours were
       still in it: the door cut a leave into a piece it would not accept.
       Reading it from the real hours ALONE took the WHOLE day, which charged
       the man for an afternoon he was free for. */
    const medWins = new Map<string, Win[]>()
    const medHalves = new Map<string, Win[]>()
    for (const [d, c] of contribsOfInput(med)) {
      medWins.set(d, [...(medWins.get(d) ?? []), ...winsOf(c)])
      medHalves.set(d, [...(medHalves.get(d) ?? []), c.win])
    }
    for (const leave of INPUTS.slice()) {
      if (!leave || leave === med || String(leave.person) !== String(med.person) || !isLeave(leave.type)) continue
      if (changedIds.has(String(leave.iid))) continue   // judged by the invariant instead
      const own = new Map<string, Win>()
      /* an overnight leave's tail, keyed by the date it STARTED on (H6: the
         tail counts on the next date, so a next-morning medical cuts it) */
      const tailOf = new Map<string, Win>()
      for (const [d, c] of contribsOfInput(leave)) {
        if (!c.spill) own.set(d, c.win)
        else tailOf.set(addDays(d, -1), c.win)
      }
      /* a shape per date: what survives, and for a trimmed half the exact
         window it survives with, so two dates trimmed differently never merge
         into one run */
      type Shape = { sh: 'keep' | 'drop' | 'am' | 'pm' | 'trim'; s?: number; e?: number }
      const shapes: Array<[string, Shape]> = []
      const cutDays: string[] = []
      for (const d of inputDates(leave)) {
        const lw = own.get(d) ?? FULL
        const mw = medWins.get(d) ?? []
        if (!mw.some(w => overlaps(w, lw))) {
          const tail = tailOf.get(d)
          const next = medWins.get(addDays(d, 1)) ?? []
          if (tail && next.some(w => overlaps(w, tail))) { cutDays.push(addDays(d, 1)); shapes.push([d, { sh: 'trim' }]) }
          else shapes.push([d, { sh: 'keep' }])
          continue
        }
        cutDays.push(d)
        const mh = medHalves.get(d) ?? []
        const medAm = mh.some(w => overlaps(w, AM)), medPm = mh.some(w => overlaps(w, PM))
        /* a leave taking both halves (all day, or its own times across noon)
           keeps the half the medical leaves free (H2), pushed clear of the
           medical's real hours (owner, 20 Sep 26) */
        if (overlaps(lw, AM) && overlaps(lw, PM) && !(medAm && medPm)) {
          const medS = Math.min(...mw.map(w => w[0])), medE = Math.max(...mw.map(w => w[1]))
          const from = leave.allday ? 0 : Number(leave.s), to = leave.allday ? 1439 : Number(leave.e)
          const keep: Shape = medAm
            ? { sh: 'pm', s: Math.max(PM[0], medE, from), e: to }
            : { sh: 'am', s: from, e: Math.min(AM[1], medS, to) }
          // a piece the medical squeezes to nothing is simply gone
          shapes.push([d, keep.s! < keep.e! ? keep : { sh: 'drop' }])
        } else shapes.push([d, { sh: 'drop' }])
      }
      if (!cutDays.length) continue
      const runs: Array<{ sh: Shape; from: string; to: string }> = []
      const sameShape = (a: Shape, b: Shape) => a.sh === b.sh && a.s === b.s && a.e === b.e
      for (const [d, sh] of shapes) {
        const last = runs[runs.length - 1]
        if (last && sameShape(last.sh, sh) && addDays(last.to, 1) === d) last.to = d
        else runs.push({ sh, from: d, to: d })
      }
      const pieces: any[] = []
      for (const r of runs) {
        if (r.sh.sh === 'drop') continue
        const piece = sliceInput(leave, r.from, r.to, pieces.length === 0)
        if (r.sh.sh === 'trim') {
          // the overnight tail goes: the leave now ends at midnight (Codex/Opus scenario, H6)
          piece.e = 1439
        } else if (r.sh.sh === 'am' || r.sh.sh === 'pm') {
          /* the surviving window, already pushed clear of the medical above.
             It keeps the half PRESET only when it is exactly that half —
             otherwise it carries its own times, which is how "leave from 2pm"
             is expressed at all (the war reads a real window). */
          piece.allday = false
          piece.s = r.sh.s!
          piece.e = r.sh.e!
          if (r.sh.s === AM[0] && r.sh.e === AM[1]) piece.half = 'am'
          else if (r.sh.s === PM[0] && r.sh.e === PM[1]) piece.half = 'pm'
          else delete piece.half
        }
        pieces.push(piece)
      }
      INPUTS.splice(INPUTS.indexOf(leave), 1, ...pieces)
      const span = cutDays.length > 1 ? `${dm(cutDays[0]!)}–${dm(cutDays[cutDays.length - 1]!)}` : dm(cutDays[0]!)
      said.push(`${cs(String(leave.person))}'s ${typeLabel(warCodeOf(leave.type))} on ${span} is cut for the ${med.type} — that leave goes back to the balance`)
    }
  }
  return said
}

/* ---- 2. the invariant ---------------------------------------------------- */
/** Refusals stop the command; the returned notes are things the filer is TOLD
 *  about a write that went through (leave over recorded work — owner, 20 Sep
 *  26). Kept apart on purpose: a refusal is a door, a note is a flag. */
function vet(persons: ReadonlySet<string>, changedIds: ReadonlySet<string>, withWork: boolean): string[] {
  const workNotes: string[] = []
  for (const p of persons) {
    const rows = INPUTS.filter((r: any) => r && String(r.person) === p && r.iid && warVisible(r.type))
    const byDate = buildAbsenceIndex(rows).get(p)
    if (!byDate) continue
    for (const [d, list] of byDate) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!, b = list[j]!
          if (a.id === b.id) continue
          if (!changedIds.has(a.id) && !changedIds.has(b.id)) continue
          if (!forbiddenPair(a, b)) continue
          const [mine, other] = changedIds.has(a.id) ? [a, b] : [b, a]
          /* the hours the blocker REALLY covers — a medical drawn as a
             morning may be a two-hour appointment, and naming the whole half
             would misdescribe what is in the way (owner, 20 Sep 26) */
          const realWins = winsOf(other)
          const at = realWins.length === 1 ? winText(realWins[0]!) : ''
          if (isSickCode(other.code) && isLeaveCode(mine.code))
            refuse(`${cs(p)} is on ${typeLabel(other.code)} on ${dm(d)}${at ? ` (${at})` : ''} — leave can't go over a medical`)
          refuse(`${cs(p)} already has ${typeLabel(other.code)} on ${dm(d)}${at ? ` (${at})` : ''} — ${typeLabel(mine.code)} can't overlap it`)
        }
      }
      if (!withWork) continue
      const war = warHolding(rawState().wars, d)
      if (!war) continue
      const credits = recsAt(war.recs, p, d).filter(r => r.kind === 'credit')
      if (!credits.length) continue
      for (const c of list) {
        if (!changedIds.has(c.id) || !isLeaveCode(c.code)) continue
        for (const cr of credits) {
          for (const w of creditWins(cr as any)) {
            if (!overlaps(w, c.win)) continue
            /* LEAVE OVER RECORDED WORK IS FLAGGED, NOT REFUSED (owner, 20 Sep
               26): "does making a hard refusal be a bit contradicting to what
               I'm allowing for the schedule? Currently on the schedule if
               there's a clash I still allow planning but there is just
               flagging." It is. The whole validation engine's doctrine is
               record it, flag it, let a human resolve — a double booking is
               two facts that cannot both be true and the schedule flags it
               rather than blocking the scheduler. The owner had already
               applied that doctrine to this very pair in the other direction
               (work published onto leave: allowed, amber, credit banked until
               resolved), so refusing here made the SAME two facts acceptable
               or forbidden purely by which was entered first.
               So: the leave is written, the day goes amber from this very
               pair in `dayView`, the clash strip names it, and it stands until
               someone removes one side. The filer is told in the same breath,
               so nothing lands silently. */
            const at = winText(w)
            workNotes.push(`${cs(p)} is recorded as working ${at ? `${at} ` : ''}on ${dm(d)} — this ${typeLabel(c.code)} is filed anyway and flagged for someone to resolve`)
          }
        }
      }
    }
  }
  return workNotes
}

/* ---- 3. a clashing claim replaces an undecided bid ---------------------- */
/* A notice group: every notice ONE command made shares it, and "OK, seen"
   clears the group. Unique per command even within one millisecond (Codex
   AS4-003): the time in ms times 1000 plus a rolling counter. */
let GROUP_N = 0
function nextNoticeGroup(): number {
  GROUP_N = (GROUP_N + 1) % 1000
  return Date.now() * 1000 + GROUP_N
}

export interface BidClaim { person: string; date: string; win: Win; byType: string }

/** Remove the clashing part of every undecided bid the claims overlap — the
 *  one body both doors share (an Input filed on the Inputs page; weekend / PH
 *  work in a publish, answer A). Per person/date the claims' windows are taken
 *  together, so a full-day bid loses only the halves something actually covers
 *  (answer B). A notice goes on the war unless `own(person)` (B6). Runs inside
 *  the caller's command, so its undo brings the bid back. */
export function replaceClashingBids(claims: readonly BidClaim[], byWho: string, own: (p: string) => boolean): string[] {
  const byAddr = new Map<string, { person: string; date: string; wins: Win[]; byType: string }>()
  for (const c of claims) {
    const k = `${c.person}|${c.date}`
    const e = byAddr.get(k)
    if (e) e.wins.push(c.win)
    else byAddr.set(k, { person: c.person, date: c.date, wins: [c.win], byType: c.byType })
  }
  const group = nextNoticeGroup()
  const edits: Array<{ personId: string; date: string; drop: string[]; add: WarRec[] }> = []
  const said: string[] = []
  for (const { person: p, date: d, wins, byType } of byAddr.values()) {
    const war = warHolding(rawState().wars, d)
    if (!war) continue
    const hit = (w: Win) => wins.some(x => overlaps(x, w))
    const drop: string[] = []
    const add: WarRec[] = []
    for (const r of recsAt(war.recs, p, d)) {
      if (r.kind !== 'request' || r.state === 'refused' || !hit(requestWin(r.code))) continue
      const bare = r.code.replace(/\*/g, '')
      let keep: RequestRec | null = null
      let gone = r.code
      if (portionOfCode(r.code) === 'full') {
        const amHit = hit(AM), pmHit = hit(PM)
        if (!(amHit && pmHit)) {
          keep = { ...(r as RequestRec), code: amHit ? `${bare}*` : `*${bare}` }
          gone = amHit ? `*${bare}` : `${bare}*`
        }
      }
      drop.push(r.id)
      if (keep) add.push(keep)
      if (!own(p)) {
        const n: NoticeRec = { id: newRecId('n'), kind: 'notice', code: gone, was: (r as RequestRec).state as 'pending' | 'acknowledged', byType, byWho, seq: group, at: nowStamp() }
        add.push(n)
      }
      said.push(`${own(p) ? 'your' : `${cs(p)}'s`} ${bare} bid on ${dm(d)}${keep ? ` (${gone.startsWith('*') ? 'morning' : 'afternoon'})` : ''}`)
    }
    if (drop.length) edits.push({ personId: p, date: d, drop, add })
  }
  if (edits.length) lwEditLists(edits)
  return said
}

function replaceBids(changed: any[]): string[] {
  /* B6 — decided by the LOGIN, not by the admin's "view as member" toggle or
     "View as" (Codex AS4-004): a real admin login is always someone else acting
     for the member; a member login is the person they view as */
  const adminLogin = LOGINROLE === 'admin'
  const own = (p: string) => !!SESSION && !adminLogin && String(ME) === p
  const who = SESSION ? (adminLogin ? 'an admin' : cs(String(ME))) : 'the Inputs page'
  const claims: BidClaim[] = []
  for (const row of changed) {
    if (!isLeave(row.type) && !isSickCode(warCodeOf(row.type))) continue
    /* a medical claims the hours it really covers, not the whole half it is
       drawn in (owner, 20 Sep 26) — an afternoon bid survives a two-hour
       morning appointment */
    for (const [d, c] of contribsOfInput(row) as Array<[string, Contrib]>)
      for (const w of winsOf(c)) claims.push({ person: String(row.person), date: d, win: w, byType: String(row.type) })
  }
  return replaceClashingBids(claims, who, own)
}

/* ---- the gate ------------------------------------------------------------ */
function snapshot(): Map<string, string> {
  const m = new Map<string, string>()
  for (const r of INPUTS) if (r && r.iid && warVisible(r.type)) m.set(String(r.iid), claimKey(r))
  return m
}

function apply(before: unknown): void {
  const prior = before as Map<string, string>
  const changed: any[] = []
  for (const r of INPUTS) {
    if (!r || !r.person || !warVisible(r.type)) continue
    inpId(r)
    if (prior.get(String(r.iid)) !== claimKey(r)) changed.push(r)
  }
  if (!changed.length) return
  const changedIds = new Set(changed.map(r => String(r.iid)))
  const cut = sickCutsLeave(changed, changedIds)
  const overWork = vet(new Set(changed.map(r => String(r.person))), changedIds, true)
  const replaced = inDoor() ? [] : replaceBids(changed)
  const msgs = [...cut, ...overWork, ...(replaced.length ? [`This replaces ${replaced.join(', ')} on the Leave War`] : [])]
  if (msgs.length) HOOKS.toast(msgs.join(' · '), '')
  refreshAbsencesAndRepaint()
}

function vetRestore(iids: ReadonlySet<string>, persons: ReadonlySet<string>): void {
  vet(persons, iids, false)
}

export function installInputGate(): void {
  setInputGate({ snapshot, apply, vetRestore })
}
