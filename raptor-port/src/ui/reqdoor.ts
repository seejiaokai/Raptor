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
   Where its answer is No, the note says he is not counted. A REPLACEMENT voids the answer — it was the first man's own
   (D762 reading 1; Fable F7).

   THE OIL QUESTION COMES FIRST, AND THE WRITE ONLY ON AN ANSWER ([OIL-ASK-NOTIFY] — owner D780, D781, D783, 12 Oct 26:
   "a swap or an add that raises an OIL question is NOT MADE until the question is answered — nothing moves; not
   answered, both pucks flash and a bar stays until tapped"; the plan docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md
   §3.1, §5a). Until then this door made the change and THEN opened the question over the input's window, and a Cancel
   left the change made with nobody having answered. Now a person put in where the input has no answer, a man put in
   place of its only person (whose answer was his own), and a move onto such an input each go through `gated`:
     1. the door's own save is TRIED and thrown away (ui/inputedit.tsx dryRun) — a change that would be refused is
        refused now, in its own words, and nobody is asked a question for it (Fable's read of the plan, A2);
     2. the one gate is asked (inputedit.tsx oilGate — the body the input's window asks);
     3. nothing to ask → the change is made, as before; something to ask → NOTHING is written, the change is left
        waiting (ui/oilwait.ts) and the door answers 'asked' — a FOURTH answer: every caller ends its gesture there
        with nothing moved and nothing said.
   The answer, when it comes, runs this same door again WITH it: the change and the answer are one command, one Undo.
   The row, the seat and the men are found again by what they ARE (the row's id, the input's id, who stands where),
   never by where they stood — the page works while the bar is up, and a row may have moved or gone (Fable A5).

   ALL AVAIL / ALL IS ONE OF THE INPUT'S PEOPLE (step 3 of the build, 12 Oct 26 — owner D750, D753, D755, D757): put
   anywhere on the row it JOINS — it never replaces anyone, and a named person put on ITS puck joins beside it; taken
   off, it leaves, and it STAYS when anyone else leaves ("ALL AVAIL stays when anyone leaves"). Where it cannot apply the
   input's own save refuses with the one body's sentence (engine/inputs.ts placeholderProblem, shapeProblem): a second
   placeholder, an input longer than a day, a kind that is not one of the six. Its crowd's OIL switches end with its
   holding: taken off and dropped back it is a new one (inputown.ts putPerson — Fable F11). */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { INPUTS, idsOf, inpLabel, oilAsks } from '../engine/inputs'
import { PEOPLE, whoId, isSpecial } from '../engine/people'
import { requestOfBox, standsOn } from '../engine/overlay'
import { toPeople } from '../engine/inputown'
import { ridWriteKey, posKey } from '../engine/rowids'
import { lastFilled, slotVal } from '../engine/slots'
import { CmdRefused } from '../command'
import { canEditSched } from '../state/auth'
import { me } from '../state/perms'
import { stampChanged } from '../state/inputstamp'
import { notify } from '../state/store'
import { oilAskPlan } from '../leavewar/sync'
import { commitInput, commitInputEdit, draftOf, saveBatchX, askOilIfPending, dryRun, oilGate, inputWho } from './inputedit'
import { holdForOil } from './oilwait'
import type { OilWait, OilWaitKind } from '../state/view'

/** 'asked' — the change raises the OIL question: NOTHING was written, and it waits on the answer (ui/oilwait.ts). */
export type RowAnswer = 'none' | 'done' | 'refused' | 'asked'
type Oil = Record<string, number>
/** THE SEAT A SWAP HANDS THE MAN REPLACED — the seat the newcomer was dragged from, and the caller's own way of putting
 *  a man on it (its checks, its words). The seat is named so the swap can find it again when the answer comes. */
export type SeatTake = { from: string; take: (from: string, was: string) => boolean | void }

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
const iidOf = (p: Place): string => String(p.inp.iid)
/* a save's options from the schedule: nobody reads late (D741) — and the OIL answer given with it, where there is one */
const opts = (oil?: Oil) => (oil ? { sched: true, oil } : { sched: true })

/* ---- THE QUESTION FIRST ([OIL-ASK-NOTIFY]) ------------------------------------------------------------------------ */
/* the gate, asked without a word: a draft it would refuse is the save's to refuse, in the save's own words */
function quietGate<T>(gate: () => T): T {
  const say = HOOKS.toast
  HOOKS.toast = () => {}
  try { return gate() } finally { HOOKS.toast = say }
}
/* a save being tried and thrown away: it says nothing and repaints nothing */
let TRYING = false
/* where the person stands after the change just made — for the landing flash and the "is he busy" question */
let LANDED: string | null = null
function gated(o: {
  kind: OilWaitKind
  /** the sheet's own first line */
  lead: string
  /** the answer in hand: the wait's own second call */
  oil?: Oil
  /** the change, on the row AS IT STANDS NOW: 'none' where the row, the seat or the men are no longer what they were */
  make: (oil?: Oil) => RowAnswer
  /** the question the change would raise, asked of the records as they stand now; null where they are gone */
  gate: () => ReturnType<typeof oilGate> | null
  /** who the question names, where it is not the gate's own person */
  who?: () => string
  /** the input the change is made to */
  iid: string
  /** what flashes when it is not answered */
  places: string[]
  /** this whole door, asked afresh — the bar's "Answer OIL" */
  again: () => RowAnswer
}): RowAnswer {
  if (o.oil) return o.make(o.oil)
  /* THE GATE FIRST, THE TRY ONLY WHERE THERE IS A QUESTION. Nothing to ask (a working day, a kind that never earns, an
     input already answered — nearly every drop there is) → the change is made exactly as it always was. Only a change
     that WOULD raise the question is tried and thrown away first — and a thrown-away save puts every record back as a
     NEW object, so nothing here keeps one across it (`make` and `gate` find theirs afresh). */
  const g = quietGate(o.gate)
  if (!g || g.kind !== 'ask') return o.make()
  TRYING = true
  let good = false
  try { good = dryRun(() => o.make() === 'done') } finally { TRYING = false }
  if (!good) {
    /* it would be refused: the real run says why, in its own words, and writes nothing. (Should the two ever disagree
       — tried: no, real: yes — the change is made as it always was, and the question follows it: never silent.) */
    const a = o.make()
    if (a === 'done') askOilIfPending(INPUTS.find((x: any) => String(x.iid) === o.iid), true)
    else notify()                                    // every screen reads its records again after the thrown-away save
    return a
  }
  const w: OilWait = {
    kind: o.kind, lead: o.lead, places: o.places,
    gate: { who: o.who ? o.who() : g.who, typeLabel: g.typeLabel, plan: g.plan, prev: g.prev },
    redo: oil => { LANDED = null; const a = o.make(oil); w.landed = LANDED; return a },
    ask: () => { LANDED = null; const a = o.again(); w.landed = LANDED; return a },
  }
  holdForOil(w)
  return 'asked'
}

/* THE NOTE AFTER SOMEONE WAS PUT IN (D755 (1), D762). The person follows the input's one answer; nothing was written
   for him. (The OIL question no longer FOLLOWS the add — where the input has no answer it was asked first: `gated`.)
   THE PUCK ON THE ROW IS THE SIGN (owner D854, 14 Oct 26 — "Yes to all", of the picture that marked "<name> added to
   <row>" where it stands; the design guide's §1, D850: feedback is the screen's, a note only for what the screen does
   not show). So a plain add says nothing. The note is still raised where it has something to say that the puck does
   not: the input's OIL answer is No, so he is on the row and NOT counted for OIL — said in the words it always had. */
function afterPut(inp: any, said: string, spoke: boolean): void {
  let tail = ''
  if (oilAsks(inp.type)) {
    const plan = oilAskPlan(inp), ans = (inp.oil || {}) as Record<string, number>
    if (plan.length && plan.every((p: any) => ans[p.iso] === 0)) tail = ' — not counted for OIL'
  }
  if (!spoke && tail) HOOKS.toast(said + tail, 'ok')
}

/* SOMEONE JOINS — appended to the input's list, by the input's own save; with the input's one OIL answer where the
   question was put first. */
function join(p: Place, pid: string, oil?: Oil): RowAnswer {
  const name = inpLabel(p.inp)
  const { out, spoke } = quietly(() => commitInput(p.inp, draftOf(p.inp), [...people(p.inp), pid], opts(oil)))
  if (!out) return 'refused'
  afterPut(p.inp, `${csOf(pid)} added to ${name}`, spoke)
  if (!TRYING) notify()
  return 'done'
}

/* THE ONLY PERSON REPLACED (D755 (2)) — the input becomes the new man's: the list is [him], who filed it passes to
   whoever did this (§4.5 "By Saber" — so the bell's OIL question and "who may change it" go to someone still involved),
   the OIL answer is void and the holding moves on (commitInputEdit's hand-over: engine/inputown.ts swapPerson, engine/oil.ts —
   a new holder has not answered). `then` runs INSIDE the command — the man replaced taking the seat the newcomer came
   from; a `false` from it refuses the whole command. `oil` — the new holder's answer, given before the swap was made
   (`gated`): written by the same save, after the hand-over voided the first man's. */
function replace(p: Place, pid: string, then?: (was: string) => boolean | void, said?: (was: string) => string, oil?: Oil): RowAnswer {
  const was = p.at, name = inpLabel(p.inp)
  const { out, spoke } = quietly(() => saveBatchX(() => {
    toPeople(p.inp)
    if (!commitInputEdit(p.inp, { ...draftOf(p.inp), person: pid }, undefined, undefined, opts(oil))) return false
    const by = me()
    if (by != null) p.inp.by = String(by)
    if (then && then(was) === false) throw new CmdRefused('the seat he came from refused the man replaced')
    return true
  }))
  if (!out.ok) return 'refused'
  if (!spoke) HOOKS.toast(said ? said(was) : `${csOf(pid)} is on ${name} instead of ${csOf(was)}`, 'ok')
  if (!TRYING) notify()
  return 'done'
}

/** A PERSON PUT ON A PLACE OF AN INPUT'S ROW. `seat` — the seat he was dragged from, when it is a seat elsewhere on the
 *  schedule (not a place of an input's row): onto the ONLY person's puck that is a swap, and `seat.take` — handed in by
 *  the drag — puts the man replaced on that seat inside the command. `oil` — the answer to the OIL question this
 *  change raised, when it is being made on that answer (ui/oilwait.ts); without it a change that raises the question
 *  is NOT made, and the answer is 'asked' (`gated`, above). */
export function rowPut(key: any, id: any, seat?: SeatTake, oil?: Oil): RowAnswer {
  const p = placeOf(key)
  const pid = String(id || '')
  if (!p || !pid || !PEOPLE[pid]) return 'none'
  if (!canEditSched()) return 'refused'
  const ids = people(p.inp)
  if (ids.includes(pid)) { HOOKS.toast(alreadyOn(pid), 'warn'); return 'refused' }
  /* a placeholder never replaces anyone — it joins, where the input may hold one (the input's own save says why where
     it may not). A real person on the ONLY person's puck replaces him; anywhere else he joins.
     (A PERSONAL INPUT'S ROW IS A ROW LIKE ANY INPUT'S — owner D776, 12 Oct 26, "A2 B2": it may hold several people, and
     a puck dropped on it swaps or joins as on any input's. The refusal the job's walk added here for its one person's
     puck — B8, D755 (4) — is withdrawn with the rule it kept.) */
  const swap = !isSpecial(pid) && !!p.at && ids.length === 1 && !isSpecial(p.at)
  /* the row, the seat and the men by what they ARE — found again each time the change is run */
  const T = ridWriteKey(String(key), DAYS), F = seat ? ridWriteKey(String(seat.from), DAYS) : null
  const iid = iidOf(p), at = p.at
  const here = (): Place | null => { const k = posKey(T, DAYS), q = k ? placeOf(k) : null; return q && iidOf(q) === iid && q.at === at ? q : null }
  /* the seat he came from, while he still sits on it (a swap hands it to the man replaced) */
  const seatNow = (): string | null => { const k = F ? posKey(F, DAYS) : null; return k && String(whoId(slotVal(k)) || '') === pid ? k : null }
  const make = (o?: Oil): RowAnswer => {
    const q = here(), sk = swap ? seatNow() : null
    if (!q || (swap && F && !sk)) return 'none'
    if (people(q.inp).includes(pid)) { HOOKS.toast(alreadyOn(pid), 'warn'); return 'refused' }
    const a = swap
      ? replace(q, pid, sk ? was => seat!.take(sk, was) : undefined, sk ? was => `${csOf(pid)} and ${csOf(was)} swapped` : undefined, o)
      : join(q, pid, o)
    if (a === 'done') LANDED = placeOnRow(posKey(T, DAYS) || String(key), pid)
    return a
  }
  return gated({
    kind: swap ? 'swap' : 'add', oil, make, iid,
    lead: swap ? (seat ? `Swapping ${csOf(pid)} and ${csOf(at)}` : `Putting ${csOf(pid)} in place of ${csOf(at)}`) : `Adding ${csOf(pid)} to ${inpLabel(p.inp)}`,
    /* a replacement is asked of the NEW holder — the first man's answer was his own; a join of the input as it stands */
    gate: () => { const q = here(); return q ? oilGate(swap ? { ...draftOf(q.inp), person: pid } : draftOf(q.inp), q.inp) : null },
    ...(swap ? {} : { who: () => { const q = here(); return inputWho({ people: [...(q ? people(q.inp) : ids), pid].map(x => ({ p: x })) }) } }),
    /* the puck dropped on (a "+ add": the row's own name box), and the seat he was dragged from */
    places: [ridWriteKey(`g:${p.di}.${p.ri}${at ? p.rest : ''}`, DAYS), ...(F ? [F] : [])],
    /* …and it must still be the SAME KIND of change (the Opus read, F2 — 13 Oct 26): the door works swap-or-add out from
       the row as it stands, so with a second man put on the row meanwhile the waiting SWAP came back as an ADD — and,
       the input being answered, was made at once: no question, the man added and still on his seat. A row that is no
       longer what the question was asked about says so (A5), whatever has changed about it. */
    again: () => {
      const k = posKey(T, DAYS), sk = F ? posKey(F, DAYS) : null, q = here()
      if (!k || (F && !sk) || !q) return 'none'
      const swapNow = !isSpecial(pid) && !!q.at && people(q.inp).length === 1 && !isSpecial(q.at)
      return swapNow !== swap ? 'none' : rowPut(k, pid, seat && sk ? { from: sk, take: seat.take } : undefined)
    },
  })
}

/* SOMEONE LEAVES — the body of a puck taken off the row and of one dragged to another place. The LAST one is not taken
   off this way: an input holds at least one person (the plan §4.1), and the words name the two doors there are.
   `then` runs INSIDE the command, after he has left; a `false` from it refuses the whole command. */
function leave(p: Place, then?: () => boolean | void, said?: string): boolean {
  const ids = people(p.inp), cs = csOf(p.at)
  if (ids.length < 2) {
    /* (the words name the ACT, not a button: "use ✕ …" pointed at a control only the Scheduler Board's row has — on Edit
       Schedule's week the same act is "Undo" on the input's line under Personal Inputs. Found by the job's walk, share H —
       12 Oct 26; the door check wants a refusal to name a door the person can see.) */
    HOOKS.toast(`${cs} is the last on this input. Take the input off the programme, or delete it in its own window.`, 'warn')
    return false
  }
  const { out, spoke } = quietly(() => saveBatchX(() => {
    if (!commitInput(p.inp, draftOf(p.inp), ids.filter(x => x !== p.at), { sched: true })) return false
    if (then && then() === false) throw new CmdRefused('the place he was put on refused him')
    return true
  }))
  if (!out.ok) return false
  /* a caller's own words are said (a move names where he went); a plain take-off says nothing — the puck gone from the
     row is the sign, and Undo is lit (owner D854, 14 Oct 26; it read "<name> taken out of <row>") */
  if (!spoke && said) HOOKS.toast(said, 'ok')
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
export function rowMove(fromKey: any, toKey: any, oil?: Oil): RowAnswer {
  const a = placeOf(fromKey), b = placeOf(toKey)
  if (!a || !a.at || !b || a.inp === b.inp) return 'none'
  if (!canEditSched()) return 'refused'
  const pid = a.at
  if (people(b.inp).includes(pid)) { HOOKS.toast(alreadyOn(pid), 'warn'); return 'refused' }
  /* both rows and the man by what they are — found again each time the move is run ([OIL-ASK-NOTIFY]; `gated`, above:
     where the input he moves INTO has no OIL answer the move waits on the question, as an add does — D783's reading) */
  const A = ridWriteKey(String(fromKey), DAYS), B = ridWriteKey(String(toKey), DAYS)
  const ai = iidOf(a), bi = iidOf(b), bat = b.at
  const ends = (): [Place, Place] | null => {
    const ka = posKey(A, DAYS), kb = posKey(B, DAYS), x = ka ? placeOf(ka) : null, y = kb ? placeOf(kb) : null
    return x && y && iidOf(x) === ai && iidOf(y) === bi && x.at === pid && y.at === bat ? [x, y] : null
  }
  const make = (o?: Oil): RowAnswer => {
    const e = ends()
    if (!e) return 'none'
    const [x, y] = e
    if (people(y.inp).includes(pid)) { HOOKS.toast(alreadyOn(pid), 'warn'); return 'refused' }
    if (!leave(x, () => commitInput(y.inp, draftOf(y.inp), [...people(y.inp), pid], opts(o)), `${csOf(pid)} moved to ${inpLabel(y.inp)}`)) return 'refused'
    LANDED = placeOnRow(posKey(B, DAYS) || String(toKey), pid)
    if (!TRYING) notify()
    return 'done'
  }
  return gated({
    kind: 'move', oil, make, iid: bi,
    lead: `Moving ${csOf(pid)} to ${inpLabel(b.inp)}`,
    gate: () => { const e = ends(); return e ? oilGate(draftOf(e[1].inp), e[1].inp) : null },
    who: () => { const e = ends(); return inputWho({ people: [...people(e ? e[1].inp : b.inp), pid].map(x => ({ p: x })) }) },
    places: [A, ridWriteKey(`g:${b.di}.${b.ri}${bat ? b.rest : ''}`, DAYS)],
    again: () => { const ka = posKey(A, DAYS), kb = posKey(B, DAYS); return !ka || !kb || !ends() ? 'none' : rowMove(ka, kb) },
  })
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
  /* TAKING THE CANCEL — OR THE INFORMATION-ONLY MARK — OFF PUTS THE OIL QUESTION FIRST (owner D816, 13 Oct 26 — "taking
     the cancel off an input that has no OIL answer for a non-working day puts the OIL question first, as 'Accept' does —
     nothing is un-cancelled until it is answered; where it is already answered, or nothing is to be asked, it is
     un-cancelled at once and the answer counts again"; reading 1: the information-only mark the same). The other half
     of D814: while an input wears either mark no door asks for it (it can earn nothing), so the moment its question
     comes back is the moment the mark comes off — and this door asked nothing: its card wore "OIL?" and the member's
     bell lit, but the scheduler who brought it back was never asked.
     The gate is asked of the input AS IT WILL STAND — without the mark; wearing it, the gate's answer is "nothing to
     ask". The take-off is TRIED and thrown away first, so one the save would refuse is refused in its own words and
     nobody is asked a question for it. Putting a mark ON, and the red box either way, ask nothing; neither does an
     Undo of a cancel (an Undo never asks — D793 reading 3: it does not come through here). */
  if (!on && (what === 'cx' || what === 'info') && inp[what]) {
    const iid = String(inp.iid), mark = what
    const find = (): any => INPUTS.find((x: any) => String(x.iid) === iid)
    const gateOf = (x: any) => { const as = { ...x, [mark]: false }; return quietGate(() => oilGate(draftOf(as), as)) }
    const g = gateOf(inp)
    if (g && g.kind === 'ask') {
      TRYING = true
      let good = false
      try { good = dryRun(() => unmark(find(), mark) === 'done') } finally { TRYING = false }
      if (!good) { const a = unmark(find(), mark); if (a !== 'done') notify(); return a }   // refused: said by the save itself
      const now = find()
      /* the bar's "Answer OIL", and the answer itself, find the input afresh: gone, or no longer wearing the mark
         (brought back by another hand, by an Undo) → it has changed, and says so; answered meanwhile → nothing is
         left to ask, and it is simply brought back */
      const again = (): RowAnswer => {
        const x = find()
        if (!x || !x[mark]) return 'none'
        if (!canEditSched()) return 'refused'
        const g2 = gateOf(x)
        if (g2 && g2.kind === 'ask') { hold(x, g2); return 'asked' }
        const a = unmark(x, mark)
        if (a === 'done') { HOOKS.toast(UNMARKED[mark]); notify() }
        return a
      }
      /* THE ROW'S BUTTON, FOUND WHEN THE QUESTION IS PUT — never the place the row had at the first press (the fresh read
         of the finished code, F4 — 14 Oct 26): with the bar up another row can be taken off above it, and "Answer OIL"
         then "Don't un-cancel" flashed whichever row had taken the old place. The board's buttons are addressed by
         position, so the position is read from where the input stands NOW. */
      const placeOf = (): string[] => {
        for (let di = 0; di < DAYS.length; di++) {
          const d: any = DAYS[di], row = d && standsOn(d, iid)
          const ri = row ? ((d.ground || []) as any[]).indexOf(row) : -1
          if (ri >= 0) return [`sel:[data-gr${mark === 'cx' ? 'cx' : 'info'}="${di}.${ri}"]`]
        }
        return []
      }
      const hold = (x: any, gg: any) => holdForOil({
        kind: mark === 'cx' ? 'uncx' : 'uninfo',
        lead: mark === 'cx' ? `Un-cancelling ${inputWho(x)}'s ${inpLabel(x)}` : `Taking “information only” off ${inputWho(x)}'s ${inpLabel(x)}`,
        /* what flashes when it is not answered: the row's own button */
        places: placeOf(),
        gate: { who: inputWho(x) || gg.who, typeLabel: gg.typeLabel, plan: gg.plan, prev: gg.prev },
        /* the answer and the take-off are ONE command — one Undo step (D816 reading 3); the board's own word for a
           row brought back is said here, because the press that asked it was answered "not done" */
        redo: oil => {
          const x2 = find()
          if (!x2 || !x2[mark]) return 'none'
          const a = unmark(x2, mark, oil)
          if (a === 'done') HOOKS.toast(UNMARKED[mark])
          return a
        },
        ask: again,
      })
      hold(now, gateOf(now) || g)
      return 'asked'
    }
  }
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
/** what the board says when a mark comes off a row — said by the board for a take-off made at once, and by this door
 *  for one made on an OIL answer (ui/board.ts reads the same two) */
export const UNMARKED: Record<'cx' | 'info', string> = {
  cx: 'Restored',
  info: 'This item is checked against the rules again and can earn OIL',
}
/* a cancel or an information-only mark taken off the record — with the input's one OIL answer where the take-off was
   made on it: one command, one Undo step */
function unmark(inp: any, mark: 'cx' | 'info', oil?: Oil): RowAnswer {
  if (!inp) return 'none'
  const out = saveBatchX(() => {
    if (mark === 'cx') { inp.cx = false; delete inp.cxr } else delete inp.info
    if (oil) inp.oil = { ...oil }
    stampChanged(inp)
    return true
  })
  if (!out.ok) return 'refused'
  if (!TRYING) notify()
  return 'done'
}

/* the store's and the armed place's way in (state/ may not import ui/): a blank is someone taken off, an id is someone
   put on */
export function rowWrite(key: any, id: any): RowAnswer {
  return id ? rowPut(key, id) : rowTake(key)
}
HOOKS.inputRow = { write: rowWrite }
