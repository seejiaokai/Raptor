/* THE ONE ROW OF A SHARED INPUT, WHERE A PERSON MEETS IT (`[GROUP-INPUT-ONE-ROW]`; owner D661, D734; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.3, §4.5).

   Underneath, a shared input is one ground row a man (engine/grouprows.ts says which rows are one row, and whose pucks
   it draws). This module is the screen's side of that. */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { INPUTS, inpId, inpLabel, isPersonal, nowStamp, inputOwnDueISO } from '../engine/inputs'
import { PEOPLE, whoId, isSpecial } from '../engine/people'
import { groundGroups } from '../engine/grouprows'
import { sharedRowOf } from '../engine/overlay'
import { ridWriteKey, posKey } from '../engine/rowids'
import { lastFilled } from '../engine/slots'
import { CmdRefused } from '../command'
import { canEditSched } from '../state/auth'
import { entryLines, entryRowsOf } from '../state/inputgroup'
import { notify } from '../state/store'
import { commitGroup, draftOf, entryOilAnswer, saveBatchX } from './inputedit'
import { setInpEdit, setOilAsk } from './pops'

/* A PLACE ON A ROW THAT IS NOT DRAWN RESOLVES TO THE ONE ROW (the plan §4.3). A member row that is not the lead draws no
   name box, no time boxes, no remark box and no "+ add" of its own — so a jump that names one of them (a tap on a line
   of the changes window, History's gold dot, a warning's click) goes to the lead's. A PUCK is drawn under its own
   row's key and is left as it is. Under Personal Inputs the line is addressed by its first record (`iu:<iid>`), so any
   of its people's inputs resolves to that one. Anything else — another kind of key, a row that stands alone, a row
   that is gone — comes back unchanged. */
export function leadKeyOf(key: any): string {
  const k = String(key)
  if (k.startsWith('iu:')) {
    const id = k.slice(3)
    const mine = (INPUTS as any[]).find(r => r && String(inpId(r)) === id)
    if (!mine || !mine.grp || !isPersonal(mine.type) || mine.acc === 'u') return k
    const line = entryLines((INPUTS as any[]).filter(r => r && isPersonal(r.type) && r.acc !== 'u')).find(l => l.includes(mine))
    return line && line.length > 1 ? `iu:${inpId(line[0])}` : k
  }
  const m = /^(gr?):(\d+)\.(\d+)(\..+)?$/.exec(k)
  if (!m) return k
  const [, pre, di, ri, rest] = m
  /* a puck's own place (`g:di.ri`, `g:di.ri.xN`) is drawn; only the row's boxes and its "+ add" are the lead's */
  if (pre === 'g' && rest !== '.+') return k
  const g = groundGroups(DAYS[+di!])[+ri!]
  return g && g.lead !== +ri! ? `${pre}:${di}.${g.lead}${rest || ''}` : k
}

/* THE RECORDS DRAWN WITH AN INPUT AS ONE LINE UNDER PERSONAL INPUTS — the line its one Undo / Accept / "→ Unavail" act
   for (the plan §4.5): the records of its entry that are filed as it is (state/inputgroup.ts entryLines — the same
   split the panel draws by, so a press is true of everyone on the line it was pressed on). Itself alone for an
   ordinary input, and for one filed under Unavailable, which stays a row a man (D737). */
export function lineOf(inp: any): any[] {
  if (!inp || !inp.grp || !isPersonal(inp.type) || inp.acc === 'u') return [inp]
  const line = entryLines((INPUTS as any[]).filter(r => r && isPersonal(r.type) && r.acc !== 'u')).find(l => l.includes(inp))
  return line && line.length > 1 ? line : [inp]
}

/* ==== WHAT A HAND DOES TO THE ONE ROW (owner D734 — "on a shared input's row the pucks ARE the input's people: a puck
   taken off the row takes that man out of the input itself, and a puck put on the row adds him to it — the same as
   doing it in the input's own window"; the plan §4.5).

   ONE DOOR, asked by every place that writes a person to a ground row BEFORE it writes: a drop (ui/drag.ts applyDrop),
   an armed place filled (state/view.ts placeArmed), the right-click remove (ui/Shell.tsx), the store's own writers
   (state/store.ts writeSlot / writeFill) and the developer's probe bridge — state/ reaches it through one HOOKS entry,
   as it reaches the typed box's door (ui/reqrow.ts). Behind it stands a BELT in the engine (slots.ts sharedSeatBar): a
   write that reaches a member's place without this door is refused there, so no door forgotten today, and none added
   later, can leave a stranger in one man's request or a member's name box empty.

   Every answer is one of three: 'none' — not a shared input's row, or not this door's business there: the caller writes
   exactly as before; 'done' — the INPUT was changed, in one command (one Undo step, one line of the change history),
   and the caller makes NO schedule write of its own; 'refused' — nothing was changed and the reason was said.

   WHICH ROW, AND WHOSE PUCK, is the engine's one answer (overlay.ts sharedRowOf — shared with the belt): a row carrying
   its entry's mark that is its request's standing row. A puck is ONE OF THE INPUT'S MEN when it stands in a member
   row's own name box and that row's request is his; anything among a row's extras is the row's own (D46, D470), and is
   moved and taken off as on any row. A ONE-MAN REQUEST'S ROW IS NOT THIS DOOR'S (D18, D470; D734 reading 3). ==== */
export type RowAnswer = 'none' | 'done' | 'refused'

type Place = { di: number; ri: number; rest: string; d: any; row: any; inp: any }
function placeOf(key: any): Place | null {
  const m = /^g:(\d+)\.(\d+)(\.x\d+|\.\+)?$/.exec(String(key))
  if (!m) return null
  const di = +m[1]!, ri = +m[2]!, d: any = DAYS[di], row = d && (d.ground || [])[ri]
  const inp = sharedRowOf(d, row)
  return inp ? { di, ri, rest: m[3] || '', d, row, inp } : null
}
const isMember = (p: Place): boolean => p.rest === '' && whoId(p.row.who) === String(p.inp.person)
const csOf = (id: any): string => (PEOPLE[id] ? String(PEOPLE[id].cs) : String(id ?? ''))
/** is this place on the one row of a shared input (any place of it — a man's, an extra's, its "+ add") */
export const onSharedRow = (key: any): boolean => !!placeOf(key)
/** is the puck at this place one of the input's men (a member row's own name box, holding its request's man) */
export const isRowMan = (key: any): boolean => { const p = placeOf(key); return !!p && isMember(p) }
/** WHERE A MAN STANDS ON THE ONE ROW that `key` names — his own member row's place, for the landing flash and the "is he
 *  busy" question after he was added (his row is drawn there under its own key); null when he is not one of its men. */
export function placeOnRow(key: any, id: any): string | null {
  const p = placeOf(key)
  if (!p || !id) return null
  const rows: any[] = p.d.ground || []
  const i = rows.findIndex(g => g && g.src && !g.kept && g.srcg === p.row.srcg && whoId(g.who) === String(id))
  return i < 0 ? null : `g:${p.di}.${i}`
}
/* run a save, and learn whether it said anything of its own (leave over recorded work, a refusal's sentence) — the
   door's own short note is then not said over it */
function quietly<T>(fn: () => T): { out: T; spoke: boolean } {
  const say = HOOKS.toast
  let spoke = false
  HOOKS.toast = (...a: any[]) => { spoke = true; return (say as any)(...a) }
  try { const out = fn(); return { out, spoke } } finally { HOOKS.toast = say }
}

/* A REAL PERSON PUT ANYWHERE ON THE ROW — on a puck, on an extra, on "+ add" — IS ADDED TO THE INPUT (D734). From the
   crew list or from a seat elsewhere; the seat he came from keeps him (reading R4 — a data edit to the input, no seat
   vacated, as the Unavailable seat's door has always worked). Already in it: refused, in words (D271).
   Written by the entry's own command (commitGroup — the save the input's window uses), as a schedule-side save: nobody
   else's record is touched. Then, inside the SAME command, on HIS record alone:
   · HIS OIL (D738 as D744 narrowed it): a copy of the answer the input carries while everyone in it carries the same
     one — no question on the schedule; none where nobody has answered (the question stays with whoever filed it);
     and where the answers differ he is given nobody's, and the question opens at once for whoever added him, on HIS
     record, for his answer alone (the sheet a man answers his own bell on — ui/inputedit.tsx, `own`);
   · HIS LATE DATE (D741): the earlier of today and his input's own deadline — he can never read late for having been
     added from the schedule; who placed him and when stay true, and the others read as they did. */
export function groupPut(key: any, id: any): RowAnswer {
  const p = placeOf(key)
  const pid = String(id || '')
  if (!p || !pid || !PEOPLE[pid] || isSpecial(pid)) return 'none'
  if (!canEditSched()) return 'refused'
  const rows = entryRowsOf(INPUTS, p.inp)
  if (rows.some((r: any) => String(r.person) === pid)) { HOOKS.toast(`${csOf(pid)} is already on this input`, 'warn'); return 'refused' }
  const carried = entryOilAnswer(rows)
  let hisId: string | false = false
  const { out, spoke } = quietly(() => saveBatchX(() => { hisId = addInside(rows, pid, carried); return hisId !== false }))
  if (!out.ok) return 'refused'
  if (!spoke) HOOKS.toast(`${csOf(pid)} added to ${inpLabel(p.inp)}`, 'ok')
  askHim(carried, hisId)
  notify()
  return 'done'
}
/* the adding itself — INSIDE a command that is already open: the entry's own save, then his OIL and his late date on
   his record alone (the head of groupPut says why). His record's id, or false when the save refused (it said why). */
function addInside(rows: any[], pid: string, carried: ReturnType<typeof entryOilAnswer>): string | false {
  if (!commitGroup({ rows }, draftOf(rows[0]), [...rows.map((r: any) => r.person), pid], undefined, { sched: true })) return false
  const his = entryRowsOf(INPUTS, rows[0]).find((r: any) => String(r.person) === pid)
  if (!his) throw new CmdRefused('the man added is not in the entry')
  if (carried.kind === 'same') his.oil = { ...carried.oil }
  const due = inputOwnDueISO(his), now = nowStamp()
  his.mod = due && due < now ? due : now
  return String(inpId(his))
}
/* …and, afterwards, the question for him alone where the input's answers differ (D744) */
function askHim(carried: ReturnType<typeof entryOilAnswer>, hisId: string | false): void {
  if (carried.kind !== 'differ' || !hisId) return
  const his = (INPUTS as any[]).find(r => r && String(inpId(r)) === hisId)
  if (his) { setOilAsk(his.iid, true); setInpEdit(his) }
}

/* ONE OF AN INPUT'S MEN DRAGGED ONTO ANOTHER SHARED INPUT'S ROW MOVES — HE IS NEVER IN BOTH (Fable's read of the job's
   code, F1 — 11 Oct 26; reading R4, D734: a man dragged from the one row onto another place "LEAVES the input and is
   put there, in one step"). The drop asked the TARGET's door first, and groupPut's "the seat he came from keeps him"
   is right for a flying seat and wrong for a member's own place: he was added to the second input and stayed in the
   first — two inputs at the same hour, by one gesture that reads as a move. So the drop asks THIS first when its
   source is one of an input's men: he leaves the first and joins the second in ONE command (one Undo), taking the
   second's OIL answer by its own rule and never marked late. Refused whole — he stays where he was — when he is the
   first input's last man (R5) or is already in the second. 'none' when the target is no shared row, or is his own
   input's row (groupPut then says he is already on it). */
export function groupMove(fromKey: any, toKey: any): RowAnswer {
  const a = placeOf(fromKey), b = placeOf(toKey)
  if (!a || !isMember(a) || !b) return 'none'
  const rowsB = entryRowsOf(INPUTS, b.inp)
  if (rowsB.includes(a.inp)) return 'none'
  if (!canEditSched()) return 'refused'
  const pid = String(a.inp.person)
  if (rowsB.some((r: any) => String(r.person) === pid)) { HOOKS.toast(`${csOf(pid)} is already on this input`, 'warn'); return 'refused' }
  const carried = entryOilAnswer(rowsB)
  let hisId: string | false = false
  if (!leave(a, () => { hisId = addInside(rowsB, pid, carried); return hisId !== false }, `${csOf(pid)} moved to ${inpLabel(b.inp)}`)) return 'refused'
  askHim(carried, hisId)
  notify()
  return 'done'
}

/* ONE OF THE INPUT'S MEN LEAVES IT — the body of a puck taken off the row and of one dragged to another place. The
   LAST man is not taken off this way: the input's own window will not save an input with nobody in it, which is the
   measure D734 names (reading R5) — refused, saying how. WHAT STOOD ON HIS PLACE GOES WITH HIM (owner D745 — "Ok go
   with as recommended"): an ALL AVAIL or ALL among his row's extras earns through HIS request, so it leaves with his
   row and is not handed to another man — and the app SAYS so, to whoever did it, who can drop it on the row again.
   `then` runs INSIDE the command, after his record has gone; a `false` from it refuses the whole command. */
function leave(p: Place, then?: () => boolean | void, said?: string): boolean {
  const rows = entryRowsOf(INPUTS, p.inp), cs = csOf(p.inp.person), name = inpLabel(p.inp)
  if (rows.length < 2) {
    HOOKS.toast(`${cs} is the last person on this input — use ✕ to take it off the programme, or delete it in its own window`, 'warn')
    return false
  }
  const rest = rows.filter((r: any) => r !== p.inp)
  const extras: string[] = ((p.row.more || []) as any[]).map(v => String(whoId(v) || '')).filter(x => x && PEOPLE[x])
  const went = extras.map(csOf), men = extras.some(x => !isSpecial(x))
  const { out, spoke } = quietly(() => saveBatchX(() => {
    if (!commitGroup({ rows }, draftOf(rest[0]), rest.map((r: any) => r.person), undefined, { sched: true })) return false
    if (then && then() === false) throw new CmdRefused('the place he was put on refused him')
    return true
  }))
  if (!out.ok) return false
  /* a man of the scheduler's who stood among his row's extras goes with the row as a puck does — said as a man is
     (Fable F3: the note called him "it") */
  if (went.length) HOOKS.toast(men || went.length > 1
    ? `${went.join(', ')} came off ${name} with ${cs} — put them on the row again if they still apply`
    : `${went[0]} came off ${name} with ${cs} — drop it on the row again if it still applies`, 'warn')
  else if (!spoke) HOOKS.toast(said || `${cs} taken out of ${name}`, 'ok')
  return true
}

/* A MEMBER'S PLACE EMPTIED — dragged off to nowhere, removed by right-click, written blank: he leaves the input. */
export function groupTake(key: any): RowAnswer {
  const p = placeOf(key)
  if (!p || !isMember(p)) return 'none'
  if (!canEditSched()) return 'refused'
  if (!leave(p)) return 'refused'
  notify()
  return 'done'
}

/* A MEMBER DRAGGED ONTO ANOTHER PLACE LEAVES THE INPUT AND IS PUT THERE — IN ONE COMMAND (reading R4; both readers of
   the plan): `write` puts him on the place INSIDE the command, so one Undo puts back both, and a place that refuses
   him (a `false` from `write`) leaves him in the input — never out of it and nowhere. A man already standing on that
   place comes off it as when a name from the crew list is dropped on him; nobody is ever swapped INTO the request.
   THE PLACE IS REMEMBERED BY ITS ROW'S ID, NOT ITS POSITION: the command's own pass takes his old row away and every
   row below it moves up one, so the place is named again AFTER the command — `landed` is where he stands now, for
   the landing flash and the "is he busy" question. The caller makes no second schedule write (its ordinary finish
   would add an Undo step). */
export function groupLeaveTo(fromKey: any, toKey: any, write: () => boolean | void): 'none' | 'refused' | { landed: string } {
  const p = placeOf(fromKey)
  if (!p || !isMember(p)) return 'none'
  if (!canEditSched()) return 'refused'
  let at = ridWriteKey(String(toKey), DAYS)
  const ok = leave(p, () => {
    if (write() === false) return false
    /* a "+ add" names the row; the place he landed on is the fill's own (slots.ts lastFilled) */
    if (/\.\+$/.test(String(toKey))) at = ridWriteKey(String(lastFilled() || toKey), DAYS)
  })
  if (!ok) return 'refused'
  notify()
  return { landed: posKey(at, DAYS) ?? String(toKey) }
}

/* A PLACEHOLDER (ALL / ALL AVAIL) AIMED ANYWHERE ON THE ROW IS THE ROW'S OWN, NEVER A MAN'S PLACE (D46, D745): it joins
   the extras of the LEAD's row — the row the one "+ add" is drawn for. The key comes back re-aimed there and the
   caller writes as it always does (a move still vacates the place it came from); anything else comes back unchanged. */
export function groupRetarget(key: any, id: any): string {
  const k = String(key), p = placeOf(k)
  if (!p || !id || !isSpecial(id)) return k
  const g = groundGroups(p.d)[p.ri]
  return `g:${p.di}.${g ? g.lead : p.ri}.+`
}

/* the store's and the armed place's way in (state/ may not import ui/): a blank is a man taken off, a real man is a
   man put on; a placeholder is none of this door's — `retarget` re-aims it where the caller draws the row */
export function groupWrite(key: any, id: any): RowAnswer {
  return id ? groupPut(key, id) : groupTake(key)
}
HOOKS.groupRow = { write: groupWrite, retarget: groupRetarget }
