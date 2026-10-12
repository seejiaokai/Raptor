/* THE DOOR OF AN INPUT'S ROW — what a hand on a puck does where the row came from an input ([ALL-AVAIL-AS-MEMBER] step 2
   (c), 12 Oct 26; owner D755 — "a row that came from an input IS the input: whoever stands on it … is in the input, and
   the schedule and the Inputs calendar always show the same people, time and remark"; D755 (2): "a man dropped on the
   ONLY man's puck replaces him, and the input becomes the new man's"; D757: the walk-through; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.4). It replaces ui/grouprow.ts's door, which answered for a
   SHARED input's row alone (D734): every input's row is this door's now, an input of one person included.

   ONE DOOR, asked by every place that writes a person to a ground row BEFORE it writes: a drop (ui/drag.ts applyDrop),
   an armed place filled (state/view.ts placeArmed), the right-click remove (ui/Shell.tsx), the store's own writers
   (state/store.ts writeSlot / writeFill) and the developer's probe bridge — state/ reaches it through one HOOKS entry,
   as it reaches the typed box's door (ui/reqrow.ts). Behind it stands a BELT in the engine (slots.ts inputSeatBar): a
   raw write to any place of such a row is refused there, so no door forgotten today, and none added later, can leave a
   row saying what its input does not.

   WHICH ROW is the engine's one answer (overlay.ts requestOfBox — shared with the belt and with the typed boxes): the
   request's standing row, the request one that can be changed from the schedule. A row nobody filed, a dead `kept` row
   (D363), a row whose request is gone or taken off the programme, a read-only request's: 'none' — written as any
   ground row is.

   Every answer is one of three: 'none' — not this door's: the caller writes exactly as before; 'done' — the INPUT was
   changed, in ONE command (one Undo step, one line of the change history a thing changed), and the caller makes NO
   schedule write of its own; 'refused' — nothing was changed and the reason was said.

   THE HANDS (the plan's table, §4.4):
     · a person put anywhere on the row — "+ add", a puck where the row holds several, an armed tap — JOINS the input;
     · a person put ON THE ONLY PERSON'S PUCK replaces him: from the crew list the man replaced simply leaves; dragged
       from a seat elsewhere it is a SWAP — the man replaced takes that seat, in the same command, and a seat that
       refuses him refuses the whole (Fable F8);
     · a puck taken off — dragged to nowhere, right-click, written blank — LEAVES the input; the LAST one is refused,
       saying how;
     · a person dragged from the row to another place leaves the input and is put there, ONE command;
     · a person dragged from one input's row to another's MOVES: out of the first, into the second, ONE command.
   Every save here is a schedule-side one (ui/inputedit.tsx `opts.sched`): nobody reads late for it (D741), and a Yes to
   the OIL question is kept at what the hours give.

   OIL AT THE ADD (owner D755 (1), D762): the person added follows the input's ONE answer — nothing is written for him.
   Where the input asks the question for a day and has no answer, the question opens at once, for the INPUT, for whoever
   added him; where its answer is No, the note says he is not counted. A REPLACEMENT voids the answer — it was the first
   man's own (D762 reading 1; Fable F7) — and asks again.

   ALL AVAIL / ALL IS ONE OF THE INPUT'S PEOPLE (step 3 of the build, 12 Oct 26 — owner D750, D753, D755, D757): put
   anywhere on the row it JOINS — it never replaces anyone, and a named person put on ITS puck joins beside it; taken
   off, it leaves, and it STAYS when anyone else leaves ("ALL AVAIL stays when anyone leaves"). Where it cannot apply the
   input's own save refuses with the one body's sentence (engine/inputs.ts placeholderProblem, shapeProblem): a second
   placeholder, an input longer than a day, a kind that is not one of the six. Its crowd's OIL switches end with its
   holding: taken off and dropped back it is a new one (inputown.ts putPerson — Fable F11). */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { idsOf, inpLabel, oilAsks, personalKind, PERSONAL_OWN } from '../engine/inputs'
import { PEOPLE, whoId, isSpecial } from '../engine/people'
import { requestOfBox, standsOn } from '../engine/overlay'
import { toPeople } from '../engine/inputown'
import { ridWriteKey, posKey } from '../engine/rowids'
import { lastFilled } from '../engine/slots'
import { CmdRefused } from '../command'
import { canEditSched } from '../state/auth'
import { me } from '../state/perms'
import { stampChanged } from '../state/inputstamp'
import { notify } from '../state/store'
import { oilAskPlan } from '../leavewar/sync'
import { commitInput, commitInputEdit, draftOf, saveBatchX, askOilIfPending } from './inputedit'

export type RowAnswer = 'none' | 'done' | 'refused'

/* a place on a row that came from an input: the row, its input, and who stands on the place ('' — its "+ add", or an
   empty place) */
type Place = { di: number; ri: number; rest: string; d: any; row: any; inp: any; at: string }
function placeOf(key: any): Place | null {
  const m = /^g:(\d+)\.(\d+)(\.x(\d+)|\.\+)?$/.exec(String(key))
  if (!m) return null
  const di = +m[1]!, ri = +m[2]!, d: any = DAYS[di], row = d && (d.ground || [])[ri]
  const inp = requestOfBox(d, row)
  if (!inp) return null
  const rest = m[3] || ''
  const at = rest === '' ? whoId(row.who) : rest === '.+' ? '' : whoId((row.more || [])[+m[4]!])
  return { di, ri, rest, d, row, inp, at: at ? String(at) : '' }
}
const csOf = (id: any): string => (PEOPLE[id] ? String(PEOPLE[id].cs) : String(id ?? ''))
/* already in it — one sentence a placeholder, whichever door says it (inputs.ts shapeProblem says the same of ALL beside
   ALL AVAIL) */
const alreadyOn = (id: string): string => (isSpecial(id) ? `This input already has ${csOf(id)}` : `${csOf(id)} is already on this input`)
/** is this place on a row that came from an input (any place of it — a puck's, its "+ add") */
export const onInputRow = (key: any): boolean => !!placeOf(key)
/** does someone of the input stand on this place — its name box or a place under it, a placeholder included (F8: the
 *  drag's seat-to-seat branch must never run its raw pair of writes from such a place) */
export const isRowMan = (key: any): boolean => { const p = placeOf(key); return !!p && !!p.at }
/** WHERE A PERSON STANDS ON THE INPUT'S ROW NOW — for the landing flash and the "is he busy" question after the door's
 *  command, which re-made the row (the name box, or his place under it); null when he is not on it. `key` is any place
 *  of the row as it was named before the command. */
export function placeOnRow(key: any, id: any): string | null {
  const m = /^g:(\d+)\.(\d+)/.exec(String(key))
  if (!m || !id) return null
  const di = +m[1]!, d: any = DAYS[di], row = d && (d.ground || [])[+m[2]!]
  if (!row || !row.src) return null
  const now = standsOn(d, row.src), ri = now ? (d.ground as any[]).indexOf(now) : -1
  if (ri < 0) return null
  if (whoId(now.who) === String(id)) return `g:${di}.${ri}`
  const n = ((now.more || []) as any[]).findIndex(v => whoId(v) === String(id))
  return n < 0 ? null : `g:${di}.${ri}.x${n}`
}
/* run a save, and learn whether it said anything of its own (leave over recorded work, a refusal's sentence) — the
   door's own short note is then not said over it */
function quietly<T>(fn: () => T): { out: T; spoke: boolean } {
  const say = HOOKS.toast
  let spoke = false
  HOOKS.toast = (...a: any[]) => { spoke = true; return (say as any)(...a) }
  try { const out = fn(); return { out, spoke } } finally { HOOKS.toast = say }
}
const people = (inp: any): string[] => idsOf(inp).map(String)

/* THE NOTE AFTER SOMEONE WAS PUT IN, AND THE OIL QUESTION WHERE THE INPUT HAS NO ANSWER (D755 (1), D762). The person
   follows the input's one answer; nothing was written for him. */
function afterPut(inp: any, said: string, spoke: boolean): void {
  let tail = ''
  if (oilAsks(inp.type)) {
    const plan = oilAskPlan(inp), ans = (inp.oil || {}) as Record<string, number>
    if (plan.length && plan.every((p: any) => ans[p.iso] === 0)) tail = ' — not counted for OIL'
  }
  if (!spoke) HOOKS.toast(said + tail, 'ok')
  askOilIfPending(inp, true)
}

/* SOMEONE JOINS — appended to the input's list, by the input's own save. */
function join(p: Place, pid: string): RowAnswer {
  const name = inpLabel(p.inp)
  const { out, spoke } = quietly(() => commitInput(p.inp, draftOf(p.inp), [...people(p.inp), pid], { sched: true }))
  if (!out) return 'refused'
  afterPut(p.inp, `${csOf(pid)} added to ${name}`, spoke)
  notify()
  return 'done'
}

/* THE ONLY PERSON REPLACED (D755 (2)) — the input becomes the new man's: the list is [him], who filed it passes to
   whoever did this (§4.5 "By Saber" — so the bell's OIL question and "who may change it" go to someone still involved),
   the OIL answer is void and the holding moves on (commitInputEdit's hand-over: engine/inputown.ts swapPerson, engine/oil.ts —
   a new holder has not answered). `then` runs INSIDE the command — the man replaced taking the seat the newcomer came
   from; a `false` from it refuses the whole command. */
function replace(p: Place, pid: string, then?: (was: string) => boolean | void, said?: (was: string) => string): RowAnswer {
  const was = p.at, name = inpLabel(p.inp)
  const { out, spoke } = quietly(() => saveBatchX(() => {
    toPeople(p.inp)
    if (!commitInputEdit(p.inp, { ...draftOf(p.inp), person: pid }, undefined, undefined, { sched: true })) return false
    const by = me()
    if (by != null) p.inp.by = String(by)
    if (then && then(was) === false) throw new CmdRefused('the seat he came from refused the man replaced')
    return true
  }))
  if (!out.ok) return 'refused'
  if (!spoke) HOOKS.toast(said ? said(was) : `${csOf(pid)} is on ${name} instead of ${csOf(was)}`, 'ok')
  askOilIfPending(p.inp, true)
  notify()
  return 'done'
}

/** A PERSON PUT ON A PLACE OF AN INPUT'S ROW. `from` — the seat he was dragged from, when it is a seat elsewhere on the
 *  schedule (not a place of an input's row): onto the ONLY person's puck that is a swap, and `seat(was)` — handed in by
 *  the drag — puts the man replaced on that seat inside the command. */
export function rowPut(key: any, id: any, seat?: (was: string) => boolean | void): RowAnswer {
  const p = placeOf(key)
  const pid = String(id || '')
  if (!p || !pid || !PEOPLE[pid]) return 'none'
  if (!canEditSched()) return 'refused'
  const ids = people(p.inp)
  if (ids.includes(pid)) { HOOKS.toast(alreadyOn(pid), 'warn'); return 'refused' }
  /* a placeholder: never replaces anyone — it joins, where the input may hold one (the input's own save says why
     where it may not) */
  if (isSpecial(pid)) return join(p, pid)
  /* A PERSONAL INPUT IS ONE PERSON'S OWN — on his puck too (D755 (4), D757: "Anyone onto a Personal input"): the
     hand-over below would make one man's personal matter another's. Refused with the sentence the "+ add" drop gets
     from the record's own shape (engine/inputs.ts shapeProblem) — found by the job's walk, B8 (12 Oct 26). */
  if (p.at && ids.length === 1 && !isSpecial(p.at) && personalKind(p.inp.type)) { HOOKS.toast(PERSONAL_OWN, 'warn'); return 'refused' }
  if (p.at && ids.length === 1 && !isSpecial(p.at))
    return replace(p, pid, seat, seat ? was => `${csOf(pid)} and ${csOf(was)} swapped` : undefined)
  return join(p, pid)
}

/* SOMEONE LEAVES — the body of a puck taken off the row and of one dragged to another place. The LAST one is not taken
   off this way: an input holds at least one person (the plan §4.1), and the words name the two doors there are.
   `then` runs INSIDE the command, after he has left; a `false` from it refuses the whole command. */
function leave(p: Place, then?: () => boolean | void, said?: string): boolean {
  const ids = people(p.inp), cs = csOf(p.at), name = inpLabel(p.inp)
  if (ids.length < 2) {
    HOOKS.toast(`${cs} is the last on this input — use ✕ to take it off the programme, or delete it in its own window`, 'warn')
    return false
  }
  const { out, spoke } = quietly(() => saveBatchX(() => {
    if (!commitInput(p.inp, draftOf(p.inp), ids.filter(x => x !== p.at), { sched: true })) return false
    if (then && then() === false) throw new CmdRefused('the place he was put on refused him')
    return true
  }))
  if (!out.ok) return false
  if (!spoke) HOOKS.toast(said || `${cs} taken out of ${name}`, 'ok')
  return true
}

/** A PLACE EMPTIED — dragged off to nowhere, removed by right-click, written blank: whoever stood there leaves the
 *  input. */
export function rowTake(key: any): RowAnswer {
  const p = placeOf(key)
  if (!p || !p.at) return p ? 'refused' : 'none'
  if (!canEditSched()) return 'refused'
  if (!leave(p)) return 'refused'
  notify()
  return 'done'
}

/** SOMEONE DRAGGED FROM THE ROW ONTO ANOTHER PLACE LEAVES THE INPUT AND IS PUT THERE — IN ONE COMMAND: `write` puts him
 *  on the place INSIDE the command, so one Undo puts back both, and a place that refuses him (a `false` from `write`)
 *  leaves him in the input — never out of it and nowhere. The place is remembered by its row's ID: `landed` is where
 *  he stands after the command, for the landing flash and the "is he busy" question. The caller makes no second
 *  schedule write. */
export function rowLeaveTo(fromKey: any, toKey: any, write: () => boolean | void): 'none' | 'refused' | { landed: string } {
  const p = placeOf(fromKey)
  if (!p || !p.at) return 'none'
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

/** SOMEONE DRAGGED FROM ONE INPUT'S ROW ONTO ANOTHER'S MOVES — HE IS NEVER IN BOTH: out of the first and into the
 *  second in ONE command (one Undo), following the second's OIL answer. Refused whole — he stays where he was — when
 *  he is the first input's last person or is already in the second. 'none' when either end is not an input's row, or
 *  both are the same input's (rowPut then says he is already on it). */
export function rowMove(fromKey: any, toKey: any): RowAnswer {
  const a = placeOf(fromKey), b = placeOf(toKey)
  if (!a || !a.at || !b || a.inp === b.inp) return 'none'
  if (!canEditSched()) return 'refused'
  const pid = a.at
  if (people(b.inp).includes(pid)) { HOOKS.toast(alreadyOn(pid), 'warn'); return 'refused' }
  if (!leave(a, () => commitInput(b.inp, draftOf(b.inp), [...people(b.inp), pid], { sched: true }), `${csOf(pid)} moved to ${inpLabel(b.inp)}`)) return 'refused'
  askOilIfPending(b.inp, true)
  notify()
  return 'done'
}

/** A SCHEDULER'S MARK ON AN INPUT'S ROW IS THE INPUT'S (step 4 of the one-rule build, 12 Oct 26 — owner D760: "a CX the
 *  scheduler puts on a row that came from an input cancels the input itself … and it goes with the input if it moves;
 *  the red box and 'information only' go with the input too"; the plan §4.4). The board's three buttons ask this before
 *  they write (ui/board.ts): on an input's row the INPUT is changed, in ONE command — one Undo step — and the row
 *  follows as the copy it is (engine/overlay.ts requestRowFields); the caller makes no schedule write of its own.
 *  `what`: 'cx' with its reason (`on` false takes it off, and its reason with it), 'flag' — the red box — or 'info'.
 *  A schedule-side save: nobody reads late for it (D741). Only a scheduler (D760 reading 2) — and behind this door the
 *  member's commit gate refuses a mark he sets by any other way (state/perms.ts inputBreach). */
export function rowMark(key: any, what: 'cx' | 'flag' | 'info', on: boolean, reason?: string): RowAnswer {
  const p = placeOf(key)
  if (!p) return 'none'
  if (!canEditSched()) return 'refused'
  const inp = p.inp
  const out = saveBatchX(() => {
    if (what === 'cx') { if (on) { inp.cx = true; inp.cxr = String(reason ?? '').trim() } else { inp.cx = false; delete inp.cxr } }
    else if (on) inp[what] = true
    else delete inp[what]
    stampChanged(inp)
    return true
  })
  if (!out.ok) return 'refused'
  notify()
  return 'done'
}

/* the store's and the armed place's way in (state/ may not import ui/): a blank is someone taken off, an id is someone
   put on */
export function rowWrite(key: any, id: any): RowAnswer {
  return id ? rowPut(key, id) : rowTake(key)
}
HOOKS.inputRow = { write: rowWrite }
