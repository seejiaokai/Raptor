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
//      person on overlapping TIMES, no leave over a medical, and no leave
//      over recorded work (an OIL credit's work times, §26.3). Refused whole,
//      naming the blocker. Judged only for the records this command changed
//      (their dates, type or times), so an old record elsewhere never blocks
//      an unrelated edit.
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
import { ME, SESSION } from '../state/auth'
import { setInputGate } from '../state/inputgate-hook'
import { buildAbsenceIndex, contribsOfInput, inputDates, warCodeOf, warVisible } from './absences'
import { addDays, warHolding } from './engine'
import { AM, FULL, PM, forbiddenPair, isLeaveCode, isSickCode, overlaps, type Contrib, type Win } from './engine/dayview'
import { creditWins, newRecId, portionOfCode, recsAt, requestWin, type NoticeRec, type RequestRec, type WarRec } from './engine/warrecs'
import { lwEditLists, rawState } from './state/store'
import { inDoor, refreshAbsences, sliceInput } from './sync'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dm = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const winText = (w: Win) => (w[0] === FULL[0] && w[1] === FULL[1] ? '' : `${hhmm(w[0])}–${hhmm(w[1])}`)
const cs = (p: string) => ((PEOPLE as any)[p]?.cs ?? p) as string
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
    const medWins = new Map<string, Win[]>()
    for (const [d, c] of contribsOfInput(med)) medWins.set(d, [...(medWins.get(d) ?? []), c.win])
    for (const leave of INPUTS.slice()) {
      if (!leave || leave === med || String(leave.person) !== String(med.person) || !isLeave(leave.type)) continue
      if (changedIds.has(String(leave.iid))) continue   // judged by the invariant instead
      const own = new Map<string, Win>()
      for (const [d, c] of contribsOfInput(leave)) if (!c.spill) own.set(d, c.win)
      const shapes: Array<[string, 'keep' | 'drop' | 'am' | 'pm']> = []
      const cutDays: string[] = []
      for (const d of inputDates(leave)) {
        const lw = own.get(d) ?? FULL
        const mw = medWins.get(d) ?? []
        if (!mw.some(w => overlaps(w, lw))) { shapes.push([d, 'keep']); continue }
        cutDays.push(d)
        const medAm = mw.some(w => overlaps(w, AM)), medPm = mw.some(w => overlaps(w, PM))
        if (leave.allday && !(medAm && medPm)) shapes.push([d, medAm ? 'pm' : 'am'])
        else shapes.push([d, 'drop'])
      }
      if (!cutDays.length) continue
      const runs: Array<{ sh: string; from: string; to: string }> = []
      for (const [d, sh] of shapes) {
        const last = runs[runs.length - 1]
        if (last && last.sh === sh && addDays(last.to, 1) === d) last.to = d
        else runs.push({ sh, from: d, to: d })
      }
      const pieces: any[] = []
      for (const r of runs) {
        if (r.sh === 'drop') continue
        const piece = sliceInput(leave, r.from, r.to, pieces.length === 0)
        if (r.sh === 'am' || r.sh === 'pm') {
          piece.allday = false
          piece.half = r.sh
          piece.s = r.sh === 'am' ? 0 : 721
          piece.e = r.sh === 'am' ? 720 : 1439
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
function vet(persons: ReadonlySet<string>, changedIds: ReadonlySet<string>, withWork: boolean): void {
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
          const at = winText(other.win)
          if (isSickCode(other.code) && isLeaveCode(mine.code))
            refuse(`${cs(p)} is on ${typeLabel(other.code)} on ${dm(d)} — leave can't go over a medical`)
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
            const at = winText(w)
            refuse(`${cs(p)} is recorded as working ${at ? `${at} ` : ''}on ${dm(d)} — ${typeLabel(c.code)} can't go over it`)
          }
        }
      }
    }
  }
}

/* ---- 3. a clashing input replaces an undecided bid ---------------------- */
function replaceBids(changed: any[]): string[] {
  const own = (p: string) => !!SESSION && SESSION.role !== 'admin' && String(ME) === p
  const who = () => (SESSION ? (SESSION.role === 'admin' ? 'an admin' : cs(String(ME))) : 'the Inputs page')
  const group = Date.now()
  const handled = new Set<string>()
  const edits: Array<{ personId: string; date: string; drop: string[]; add: WarRec[] }> = []
  const said: string[] = []
  for (const row of changed) {
    const code = warCodeOf(row.type)
    if (!isLeave(row.type) && !isSickCode(code)) continue
    const p = String(row.person)
    for (const [d, c] of contribsOfInput(row) as Array<[string, Contrib]>) {
      const war = warHolding(rawState().wars, d)
      if (!war) continue
      for (const r of recsAt(war.recs, p, d)) {
        if (r.kind !== 'request' || r.state === 'refused' || handled.has(r.id)) continue
        if (!overlaps(requestWin(r.code), c.win)) continue
        handled.add(r.id)
        const bare = r.code.replace(/\*/g, '')
        let keep: RequestRec | null = null
        let gone = r.code
        if (portionOfCode(r.code) === 'full') {
          const amHit = overlaps(AM, c.win), pmHit = overlaps(PM, c.win)
          if (!(amHit && pmHit)) {
            keep = { ...(r as RequestRec), code: amHit ? `${bare}*` : `*${bare}` }
            gone = amHit ? `*${bare}` : `${bare}*`
          }
        }
        const add: WarRec[] = keep ? [keep] : []
        if (!own(p)) {
          const n: NoticeRec = { id: newRecId('n'), kind: 'notice', code: gone, was: (r as RequestRec).state as 'pending' | 'acknowledged', byType: String(row.type), byWho: who(), seq: group, at: nowStamp() }
          add.push(n)
        }
        edits.push({ personId: p, date: d, drop: [r.id], add })
        said.push(`${own(p) ? 'your' : `${cs(p)}'s`} ${bare} bid on ${dm(d)}${keep ? ` (${gone.startsWith('*') ? 'morning' : 'afternoon'})` : ''}`)
      }
    }
  }
  if (edits.length) lwEditLists(edits)
  return said
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
  vet(new Set(changed.map(r => String(r.person))), changedIds, true)
  const replaced = inDoor() ? [] : replaceBids(changed)
  const msgs = [...cut, ...(replaced.length ? [`This replaces ${replaced.join(', ')} on the Leave War`] : [])]
  if (msgs.length) HOOKS.toast(msgs.join(' · '), '')
  refreshAbsences()
}

function vetRestore(iids: ReadonlySet<string>, persons: ReadonlySet<string>): void {
  vet(persons, iids, false)
}

export function installInputGate(): void {
  setInputGate({ snapshot, apply, vetRestore })
}
