/* =====================================================================
   THE "OIL EARN" MODE, AND THE GREEN EDGE ON THE PUCK
   [OIL-AUTO-REMOVE] §2.1, §2.2, §2.10, §7.6 — owner, 21 Sep 26.

   The owner designed the interface himself: instead of fighting the derived
   credit in the Leave War, ask about the EVENT, on the board, at the source.

     "An OIL Earn button at the top of the day. Weekend / public-holiday days
      only. Pressed, it goes green and the board enters OIL mode. Every person
      who would earn OIL that day wears a glowing green puck. Tap a puck to take
      the glow off; tap again to put it back."

   ONE DOOR, not three: this replaces the per-row OIL button and the separate
   OIL panel earlier drafts proposed.

   WHAT THE MODE MUST CARRY (all agreed in the session):
   1. Per-person-per-EVENT. Tapping a man's puck on one event removes THAT
      event's hours from his day; his other events keep glowing and keep counting.
   2. The figure is recomputed on WHAT IS LEFT, first start to last end, gaps
      included (his 29 Aug rule, re-confirmed 21 Sep). NOT the sum of the
      remaining events. So unticking one puck often changes nothing — another
      event still spans the day — and occasionally a one-hour event costs half a
      day, because it was holding the far end.
   3. So EVERY PUCK SHOWS ITS FIGURE LIVE, FO or HO, in place of the
      qualification letter. That is the mitigation for (2) and is not optional:
      without it the mode looks broken.
   4. Full day and half day are visually distinct: a solid glow is a full day, an
      outline only is a half.
   5. Tapping the ITEM'S NAME toggles the whole item, and everyone's glow
      recalculates. Needed because unticking nine men is not the same as marking
      the item — a tenth added later would otherwise earn silently.
   6. A sentinel (ALL / ALL AVAIL) opens into real pucks inside the mode, or its
      people cannot be tapped at all.
   7. The whole-day blanket is a FACT about the day, not a stamp on the rows, so
      it covers anything added later. Row and person marks survive underneath it
      and come back when it is turned off.

   AND THE MEMBER GETS THE FIRST WORD (§2.2): his own answer to the OIL question
   on his input decides whether that input's puck glows by DEFAULT; the admin can
   override it by tapping. His answer is never overwritten, so lifting the
   override brings his word back.

   The decisions themselves, their three states and what they mean live in
   engine/oilev.ts; this file is the board's half of it plus the one figure
   reader the issued schedule's green edge shares.
   ===================================================================== */
import { DAYS } from '../engine/data'
import { PEOPLE, whoId, isSpecial } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { envMin, uniformOil, dayOilWork, oilCapableItems, rowItemKey, groundItemKey, inputItemKey, type OilWork } from '../engine/oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, oilInputEligible, personDecision, type OilEvidence, type OilDecisions } from '../engine/oilev'
import { OILDAY, setOilDay, afterSchedMutate, esc } from '../state/view'
import { CURWEEK } from '../engine/waves'
import { stashKeys, stashEditDays } from '../engine/weekstash'
import { undoMark } from '../undo'

export { rowItemKey, groundItemKey, inputItemKey }

/* ---- the mode ------------------------------------------------------------ */

/** Is the OIL Earn button drawn on this day at all? Weekends, the war's public
 *  holidays and off-day-tagged days only — five days a week the board is
 *  unchanged (§2.8). */
export function oilShown(di: any): boolean { return HOOKS.oilEarningDay(+di) }
/** Is this day's board in OIL mode right now? */
export function oilModeOn(di: any): boolean { return OILDAY != null && +OILDAY === +di }

/** Enter or leave the mode. Nothing is written — the mode only decides what the
 *  board draws and what a tap means. */
export function toggleOilMode(di: any): boolean {
  const on = !oilModeOn(di)
  setOilDay(on ? +di : null)
  /* where Undo stood when the door opened — see oilUndoBoundary */
  OIL_UNDO_DOOR = on ? undoMark() : null
  return on
}

/* ---- Undo stops at the door (fix 5, corrected 22 Sep 26) ------------------
   Undo already reverses an OIL tap correctly, and that is worth keeping — it is
   the natural way to take back a mis-tap, measured in the running app: 18 bars,
   tap a puck, 17, press Undo, 18 again. One reviewer wanted the mode CLOSED on
   Undo, which would take that away, so it is not followed as written.

   What the walk actually caught is different: Undo does not STOP at the mode.
   It walks back whatever the last change was, so with the mode open it removed
   a ground-programme row from the day — a schedule change, made from a screen
   that says the schedule cannot be changed.

   So the rule is a BOUNDARY, not a door. Opening the mode marks the spot Undo
   stood at; inside, it walks back OIL decisions freely down to that spot; the
   press that would reach PAST it closes the mode instead, and the one after
   that behaves normally, outside. The mark is the timeline's own position, not
   a count of presses — a count could not survive a redo, a refused press, or
   anything else writing in between. */
let OIL_UNDO_DOOR: number | null = null

/** Was this Undo press CONSUMED by closing the mode? The one body; the Undo
 *  button asks it before it does anything else.
 *
 *  A mode entered without going through `toggleOilMode` has no recorded door
 *  (only tests reach the state that way). That reads as "the door is right
 *  here", which errs towards closing the mode rather than towards reaching
 *  past it into the schedule — the safe direction for a screen whose whole
 *  purpose is that the day underneath does not move. */
export function oilUndoBoundary(): boolean {
  if (OILDAY == null) return false
  if (OIL_UNDO_DOOR != null && undoMark() !== OIL_UNDO_DOOR) return false
  setOilDay(null)
  OIL_UNDO_DOOR = null
  return true
}

/* ---- reading the day's figures ------------------------------------------- */

/** The evidence a day is showing: the FROZEN block on an issued day (so a
 *  reader's green edge says exactly what the money says), the live candidate on
 *  a working copy. Inside a version preview DAYS[di] IS the snapshot, so this
 *  needs no argument to get the right answer. */
export function evOf(di: any): OilEvidence { return oilEvidenceOf(+di) }

export type OilAmt = 'FO' | 'HO' | null
const amtOf = (spans: OilWork[]): OilAmt => {
  const v = uniformOil(envMin(spans.map(w => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}

/* the day's earning work per person, in ONE place — every figure on every
   surface is measured from this, so the bar, the mode and the count chip can
   never disagree about what a man earned or about which events earned it. */
function oilDaySpans(di: any): Record<string, OilWork[]> {
  const d = DAYS[+di]
  const ev = evOf(di)
  if (!d || !ev.earns) return {}
  return oilEarnedWork(d, ev)
}

/** EVERY PERSON'S FIGURE FOR THE DAY — `personId -> FO | HO`. The man's DAY,
 *  never what one event earned (§2.10): first start to last end, gaps included,
 *  so a man on four rows has ONE figure. Where that figure is SHOWN is O-1's
 *  question, answered in oilFigureFor below. */
export function oilDayFigures(di: any): Record<string, OilAmt> {
  const work = oilDaySpans(di)
  const out: Record<string, OilAmt> = {}
  for (const person of Object.keys(work)) { const a = amtOf(work[person]); if (a) out[person] = a }
  return out
}

/** One man's figure for the day — what the green edge draws and what the mode
 *  prints on his pucks.
 *
 *  THE FIGURE IS ALWAYS HIS DAY (owner, 21 Sep 26 — O-1). There is no such thing
 *  as a per-event OIL figure: the measure runs first-start to last-end across the
 *  whole day including the gaps, and inventing a number per event would make a
 *  man on four rows read as four separate part-days.
 *
 *  WHAT `item` CHANGES IS WHERE IT IS SHOWN, not what it says. Pass an item and
 *  the figure is WITHHELD unless that event actually counted towards his day —
 *  so an ⓘ info-only row, an event switched off, a man the scheduler denied and a
 *  row with no written times all show nothing. The owner asked for this on being
 *  shown an ⓘ row wearing a green bar: "I thought the green should show for
 *  individual pucks on individual events?" Green now means "this row counted
 *  towards his day", which is what the mode already says when a puck is tapped
 *  off. A man on four rows where two counted shows the figure twice.
 *  This SUPERSEDES §2.10 / OIL21, which repeated it on every puck he wore. */
export function oilFigureFor(di: any, person: any, item?: string): OilAmt {
  const spans = oilDaySpans(di)[String(person)] || []
  const a = amtOf(spans)
  if (!a || item == null) return a
  return spans.some(w => String(w.item || '') === item) ? a : null
}

/* ---- the mode's own reads ------------------------------------------------- */

/** Does this ITEM earn anything at all right now (the blanket and its own mark
 *  together)? What the item's name chip shows. */
export function oilItemOn(di: any, item: string): boolean {
  const dec = (DAYS[+di] || {}).oild || {}
  if (dec.blanket) return false
  return !(item && dec.items && dec.items[item] === 0)
}

export function oilBlanketOn(di: any): boolean { return !!((DAYS[+di] || {}).oild || {}).blanket }

/** Does this man earn from THIS item, as the board must draw it — the ordinary
 *  rules plus the scheduler's three-state on top. Structural ineligibility has
 *  already decided when he carries no work for the item at all, in which case he
 *  is not offered a toggle. */
export function oilPersonOn(di: any, person: any, item: string): boolean {
  const ev = evOf(di)
  if (!oilItemOn(di, item)) return false
  const dec = personDecision(ev, String(person), item)
  if (dec) return dec === 'allow'
  return itemDefaultFor(ev, String(person), item)
}

/** The ordinary rule's own answer for one man on one item, before any override:
 *  yes for schedule work, the MEMBER'S OWN ANSWER for a duty-and-commitments
 *  claim (§2.2 — "the OIL question is posed to the member, so we delegate to the
 *  member to decide as well, but ultimately the admin can still overwrite"). */
function itemDefaultFor(ev: OilEvidence, person: string, item: string): boolean {
  const inp = ev.inputs.find(i => inputItemKey(i.iid) === item && i.person === person)
  if (!inp) return true
  return inp.ans != null && inp.ans > 0
}

/** WHY a man is not earning from an item — because the three reasons read
 *  identically today and only one of them is a mistake (hand pass finding 13 /
 *  Fable M3, 22 Sep 26). One sentence covered "the scheduler took him off",
 *  "he said No himself" and "nobody has asked him", and the third is the one
 *  that costs a man money in silence: a request handed to a new holder arrives
 *  unanswered, and unanswered was drawn with the wording of a refusal.
 *
 *  `denied`   — a scheduler's own mark on this man.
 *  `declined` — the member answered No, which is his word and stands (§2.2).
 *  `unasked`  — the question exists for him and has no answer yet.
 *  `off`      — anything else (ordinary schedule work switched off). */
export type OilOffWhy = 'denied' | 'declined' | 'unasked' | 'off'
export function oilOffReason(di: any, person: any, item: string): { why: OilOffWhy, what: string } {
  const ev = evOf(di)
  const dec = personDecision(ev, String(person), item)
  if (dec === 'deny') return { why: 'denied', what: '' }
  const inp = ev.inputs.find(i => inputItemKey(i.iid) === item && i.person === String(person))
  if (!inp) return { why: 'off', what: '' }
  const what = String(inp.type || '').trim()
  return { why: inp.ans == null ? 'unasked' : 'declined', what }
}

/** What the mode shows on ONE puck: whether it glows, and the man's figure for
 *  the day. `null` figure with `on` true means he is on the item but the day
 *  measures him nothing yet (no written times) — the puck glows nothing. */
export function oilPuck(di: any, person: any, item: string): { on: boolean; amt: OilAmt } {
  return { on: oilPersonOn(di, person, item), amt: oilFigureFor(di, person, item) }
}

/** THE PEOPLE A SENTINEL PUCK STANDS FOR, for the mode to open into real pucks
 *  (§2.1 item 6) and for the issued schedule's count chip (§7.6). On an issued
 *  day this is the FROZEN membership, so the puck's answer cannot change under
 *  the reader; on a working copy it resolves live. */
export function oilSentinelPeople(di: any, item: string, win: [number, number]): string[] {
  const ev = evOf(di)
  /* A COPY, not the frozen array itself. On a published day this is a slice of
     the ISSUED document; nothing writes to it today, but one in-place sort() in
     some future caller would rewrite what the squadron was given — which is
     exactly the shape of the aliasing bug found by hand in this build. The cost
     is one array per call; the alternative is trusting every future reader. */
  if (ev.sent && ev.sent[item]) return [...ev.sent[item]]
  if (!ev.earns || !ev.iso) return []
  return HOOKS.oilSentinel(ev.iso, win, DAYS[+di])
}

/* ---- writing a decision -------------------------------------------------- */

/* Every write lands on `DAYS[di].oild` — the day's own content, so it rides the
   snapshot, a parked plan, an undo and the persistence funnel exactly like a
   typed time does, and publishing it is a real amendment (§7.2). The derived
   halves of the evidence are never stored. */
function decOf(di: any): OilDecisions {
  const d = DAYS[+di]
  if (!d.oild) d.oild = {}
  return d.oild
}
/* an empty decisions object is DELETED rather than left behind, so a day the
   scheduler has undone every mark on serialises identically to one he never
   touched — otherwise turning a mark on and off again would read as a change
   forever and offer an empty amendment. */
function tidyDay(d: any): void {
  const dec = d && d.oild
  if (!dec) return
  if (dec.items && !Object.keys(dec.items).length) delete dec.items
  if (dec.people && !Object.keys(dec.people).length) delete dec.people
  if (!dec.blanket && !dec.items && !dec.people) delete d.oild
}
function tidy(di: any): void { tidyDay(DAYS[+di]) }

/** A DECISION DIES WITH THE ASSIGNMENT IT WAS MADE ABOUT (Codex scenario 7,
 *  22 Sep 26). A scheduler's refusal names a man AND an item; nothing ever
 *  cleared it when that man left the item, so it lay dormant while somebody
 *  else held the request and came back to life the moment it was handed back —
 *  taking a day from a man whose refusal everyone believed was cleared.
 *
 *  Cleared on EVERY loaded day, not only the one in front of the scheduler: one
 *  request can cover several days, and the stale key would otherwise wait on
 *  whichever of them nobody was looking at. The item is the request's own id, so
 *  clearing it cannot touch a decision about anything else this man is on.
 *
 *  IT REACHES THE WEEKS NOBODY IS LOOKING AT TOO ([OIL-XWEEK-DENY], 22 Sep 26 —
 *  Fable F1 and Codex rank 2, found independently, which is the strongest signal
 *  the branch produced). This used to walk the seven LOADED days and say so,
 *  leaning on the read-side prune for the rest. But the prune only HIDES a key
 *  while somebody else holds the request: hand it away and BACK — ordinary,
 *  because the Inputs page is global and the scheduler may be on any week — and
 *  the holder matches again, so the old refusal is live the moment its week is
 *  opened. A man who worked and answered Yes is paid nothing, silently; and if
 *  that day was already published the live and frozen keys match, so nothing
 *  flags it either. The prune STAYS, as the guard it always was, for a week the
 *  stash cannot read or is forbidden to rewrite.
 *
 *  It writes through no funnel of its own on purpose: the one caller
 *  (`commitInputEdit`'s person branch) is already inside `writeInputsBatch`, so
 *  the clear, the person change and the relink are ONE undo step — and the
 *  caller enlists the weekstash in that batch when the person moves, so ONE undo
 *  puts back the assignment and the off-week refusal together. */
export function clearOilPersonDecisions(person: string, item: string): number {
  if (!person || !item) return 0
  const k = `${person}|${item}`
  let n = 0
  DAYS.forEach((d: any, di: number) => {
    const ppl = d && d.oild && d.oild.people
    if (!ppl || ppl[k] == null) return
    delete ppl[k]; n++
    tidy(di)
  })
  /* the loaded week is DAYS, and writing its stash entry is refused anyway */
  for (const wk of stashKeys()) {
    if (wk === CURWEEK) continue
    stashEditDays(wk, (days: any[]) => {
      let hit = false
      for (const d of days || []) {
        const ppl = d && d.oild && d.oild.people
        if (!ppl || ppl[k] == null) continue
        delete ppl[k]; n++; hit = true
        tidyDay(d)
      }
      return hit
    })
  }
  return n
}

/** The whole-day blanket (§2.1 item 7). A FACT about the day: it MASKS every row
 *  and person mark rather than deleting them, so turning it off brings them all
 *  back exactly as they were. */
export function setOilBlanket(di: any, on: boolean): void {
  const dec = decOf(di)
  if (on) dec.blanket = 1; else delete dec.blanket
  tidy(di)
  afterSchedMutate()
}

/** Toggle a whole ITEM (§2.1 item 5). Marked items are stored, unmarked ones are
 *  absent, so the default "everything earns" costs nothing on the record. */
export function toggleOilItem(di: any, item: string): boolean {
  /* the same rule one level up: the blanket masks every item mark, so a tap
     under it must not rewrite one. The board already refuses this gesture; this
     is the writer's own guard behind it. */
  if (!item || oilBlanketOn(di)) return false
  const dec = decOf(di)
  const wasOn = oilItemOn(di, item)
  if (wasOn) { dec.items = dec.items || {}; dec.items[item] = 0 }
  else if (dec.items) delete dec.items[item]
  tidy(di)
  afterSchedMutate()
  return !wasOn
}

/** Toggle ONE MAN on ONE item — the three-state write (§9.1). It records `deny`
 *  or `allow` only where that differs from the ordinary rule; where the tap
 *  merely restores the rule's own answer the override is REMOVED instead, so the
 *  member's word comes back and the record stays as small as the decision is. */
export function toggleOilPerson(di: any, person: any, item: string): boolean {
  if (!item || !person) return false
  /* A TAP UNDER A MASK MUST NOT REWRITE WHAT THE MASK HIDES (Astra + Fable,
     21 Sep 26 — both found it independently, and it is the sharpest bug in the
     mode). The blanket and the item switch MASK the decisions beneath them
     (§9.1); `oilPersonOn` therefore answers false for every man under one,
     whatever his own decision says. Reading that masked false back as the man's
     own answer meant a tap DELETED a stored `deny` — or wrote an `allow` over a
     member's own No — while the puck stayed dim and said nothing. Lift the mask
     weeks later and he earns a day nobody granted him.
     The guard sits BEFORE decOf so a masked tap does not even mint an empty
     record. The board refuses the gesture and says which mask is on; this is the
     writer's own belt, so no future caller can repeat it. */
  if (!oilItemOn(di, item)) return false
  const dec = decOf(di)
  const want = !oilPersonOn(di, person, item)
  const dflt = itemDefaultFor(evOf(di), String(person), item)
  dec.people = dec.people || {}
  const k = `${person}|${item}`
  if (want === dflt) delete dec.people[k]
  else dec.people[k] = want ? 'allow' : 'deny'
  tidy(di)
  afterSchedMutate()
  return want
}

/* ---- the board's markup --------------------------------------------------- */

/** THE DAY'S OWN CONTROL BAR — ONE bar, not two panels (owner, 21 Sep 26:
 *  "Perhaps combine them into a single bar? … It can still remain on the phone
 *  at that position? just merged", then "a looks better" of the two comps).
 *
 *  Templates and OIL Earn were a full-width panel each at the top of the day's
 *  own content: two rows of vertical space, each with a heading and a sub-line,
 *  and both reading as part of the schedule rather than as controls. They are
 *  one compact row now, headed THIS DAY, with the buttons where the eye already
 *  goes for controls on every other section header.
 *
 *  The buttons carry a slight tint of the app's ACCENT — his word, "since
 *  settings usually have some blue to it. Make the buttons slightly stand out".
 *  A tint and an edge, never the solid fill, which belongs to Done and Publish
 *  day and has to keep meaning "this is the action that finishes the job".
 *
 *  IN THE MODE the bar changes job: it stops offering the way in and becomes the
 *  mode's own strip — the heading goes green and reads OIL EARN, Templates steps
 *  aside (it does nothing in this mode), and what is left is the day blanket,
 *  the way out, and one line saying what a tap does.
 *
 *  WHERE IT IS DRAWN. On a PHONE this bar is the whole control, in and out. On a
 *  DESKTOP the way IN rides the board's action row instead (he circled the empty
 *  stretch of it), so the bar appears there only once the mode is on — at which
 *  point it is not a duplicate button, it is the blanket and the instruction.
 *  CSS picks; the builder never asks the width, so a resize answers instantly.
 *
 *  ONE FIT LESSON, from the comp that had to be drawn before this was built: at
 *  390px "✓ Done with OIL" ran off the right edge. It is "✓ Done". Re-draw the
 *  comp before lengthening any label here. */
export function dayBarHTML(di: any, tplBtn: string, canEdit = true): string {
  /* a reader who cannot edit the day is not offered the mode at all, rather than
     offered it and refused at the click (Fable, 21 Sep 26) */
  const oil = canEdit && oilShown(di)
  const on = oilModeOn(di)
  const bl = oilBlanketOn(di)
  if (!oil && !tplBtn) return ''
  const head = on ? `<span class="daybar-h on">OIL EARN</span>` : `<span class="daybar-h">THIS DAY</span>`
  const oilBtn = !oil ? ''
    : on
      ? `<button class="mbtn daybtn done" data-oilmode="${di}" title="Leave OIL mode and edit the schedule again">✓ Done</button>`
      : `<button class="mbtn daybtn" data-oilmode="${di}" title="Show who earns OIL on this day, and change it">OIL Earn</button>`
  const blankBtn = on
    ? `<button class="mbtn daybtn blank${bl ? ' on' : ''}" data-oilblank="${di}" title="${bl ? 'Let this day earn again' : 'Nothing today earns — covers anything added later too'}">Nothing today earns</button>`
    : ''
  return `<div class="sb-panel daybar${on ? ' oilon' : ''}">`
    + `<div class="sb-ph">${head}<span class="gctl">${on ? '' : tplBtn}${blankBtn}${oilBtn}</span></div>`
    + (on
      ? `<div class="daybar-note">${bl
        ? 'Nothing on this day earns OIL. The marks underneath are kept — turn it off and they come back.'
        : 'Tap a puck to take a man off that event · tap an item to stop the whole item earning'}</div>`
      : '')
    + `</div>`
}

/** An item's NAME, as a toggle, for the mode (§2.1 item 5). Replaces the row's
 *  ordinary editable name box while the mode is on: the board is read-only for
 *  schedule editing in OIL mode, so the name has nothing else to do, and a
 *  disabled box cannot be tapped. */
export function oilItemCellHTML(di: any, item: string, name: any, cls: string): string {
  const txt = String(name || '').trim()
  if (!item) return `<span class="${cls} oilitem none" title="This row has no identity yet — save the day and it can be marked on its own">${esc(txt)}</span>`
  /* AN EVENT THAT CAN NEVER EARN OFFERS NO SWITCH (Fable, 21 Sep 26). The switch
     used to be drawn on every row with an id, so an AVALON line, its desk, an SC
     spare, a cancelled row, an ⓘ row and a desk with no written times all read
     "Earns OIL — tap to stop this item earning" while sitting beside pucks that
     already said they earn nothing. Worse, on a published day a tap wrote a real
     decision, so the day grew an amendment for something that moves no money.
     An EMPTY ordinary row keeps its switch — put a man on it and he earns, and
     OIL7 says the switch covers later additions too. */
  if (!oilCapableItems(DAYS[+di] || {}).has(item)) {
    return `<span class="${cls} oilitem none" title="Nothing on this row can earn OIL, so there is nothing to switch off">${esc(txt) || '&nbsp;'}</span>`
  }
  const on = oilItemOn(di, item)
  const blanket = oilBlanketOn(di)
  return `<span class="${cls} oilitem${on ? ' on' : ' off'}" data-oilitem="${esc(item)}" data-oilday="${+di}"`
    + ` title="${blanket ? 'Nothing on this day earns — the day blanket is on' : on ? 'Earns OIL — tap to stop this item earning' : 'Earns nothing — tap to let it earn again'}">${esc(txt) || '&nbsp;'}</span>`
}

/** One PUCK inside the mode: the ordinary puck, glowing or not, wearing the
 *  man's figure for the day in place of his qualification letter, and tappable.
 *  A man the day measures NOTHING for (no written times, a cancelled row, a
 *  spare, AVALON/BB, an ⓘ row) carries no work at all, so he is drawn plain and
 *  inert — an allow is permission to count real work, never to invent it. */
export function oilSeatHTML(di: any, person: any, item: string, pk: (oil: any) => string): string {
  const p = (PEOPLE as any)[person]
  if (!p) return ''
  const eligible = oilEligible(di, person, item)
  if (!eligible) return `<span class="seat oilpk inert" title="${esc(p.cs)} — nothing measurable to earn from here">${pk(null)}</span>`
  /* UNDER A MASK THE PUCK IS NOT A CONTROL. The old markup left it tappable and
     its title actively invited the tap — "tap to put him back on it" — while the
     tap could only destroy the decision the mask was hiding. It keeps the man's
     day figure, because he may still be earning from other events; what it loses
     is the tap target and the lie. */
  if (!oilItemOn(di, item)) {
    const why = oilBlanketOn(di) ? 'nothing on this day earns' : 'this event earns nobody'
    return `<span class="seat oilpk inert" title="${esc(p.cs)} — ${why}, so this cannot be changed here">`
      + pk({ on: false, amt: oilFigureFor(di, person, item) }) + `</span>`
  }
  const { on, amt } = oilPuck(di, person, item)
  let ttl: string
  if (on) {
    ttl = `${p.cs} earns ${amt === 'FO' ? 'a full day' : amt === 'HO' ? 'half a day' : 'nothing yet'} — tap to take him off this event`
  } else {
    /* the three OFF states are three different facts and must not share a
       sentence — see oilOffReason. "Not answered" is the one that used to read
       as a refusal while quietly costing a man his day. */
    const { why, what } = oilOffReason(di, person, item)
    const thing = what ? `this ${what}` : 'this event'
    ttl = why === 'unasked'
      ? `${p.cs} has not answered the OIL question for ${thing} yet — tap to put him on it`
      : why === 'declined'
        ? `${p.cs} answered No for ${thing} — tap to put him on it anyway`
        : why === 'denied'
          ? `${p.cs} was taken off this event — tap to put him back on it`
          : `${p.cs} earns nothing from this event — tap to put him back on it`
  }
  return `<span class="seat oilpk${on ? ' on' : ' off'}" data-oilp="${esc(String(person))}" data-oilitem="${esc(item)}" data-oilday="${+di}" title="${esc(ttl)}">`
    + pk({ on, amt }) + `</span>`
}

/** Is there anything for this man to earn from this item at all? Asked of the
 *  day's own rules (engine/oil.ts), with every decision lifted, so a `deny`
 *  cannot make a man look ineligible and strand him with no way back. */
export function oilEligible(di: any, person: any, item: string): boolean {
  const d = DAYS[+di]
  if (!d) return false
  const ev = evOf(di)
  if (!ev.earns) return false
  /* a claim-derived item is eligible when the claim itself is live — ONE body
     decides that, shared with the money (oilInputEligible), so the mode can
     never offer a toggle on a claim the credit path has already ruled out. */
  const inp = ev.inputs.find(i => inputItemKey(i.iid) === item && i.person === String(person))
  if (inp) return oilInputEligible(d, inp)
  const work = dayOilWork(d, { expandAll: (win, it) => oilSentinelPeople(di, it, win) })
  return (work[String(person)] || []).some(w => String(w.item || '') === item)
}

/** Every person a ROW shows in the mode, in order: its named crew with any
 *  sentinel opened out into the real people it stands for (§2.1 item 6). */
export function oilRowPeople(di: any, whos: any[], item: string, win: [number, number] | null): string[] {
  const out: string[] = []
  const push = (id: any) => { if (id && (PEOPLE as any)[id] && out.indexOf(id) < 0) out.push(id) }
  for (const v of whos) {
    const id = whoId(v)
    if (id && isSpecial(id)) { if (win) oilSentinelPeople(di, item, win).forEach(push) }
    else push(id)
  }
  return out
}

/* ---- the issued schedule's green edge, and the sentinel's summary --------- */

/** The OIL decoration an ordinary person's puck wears on the schedule (§2.10) —
 *  his figure for the DAY, shown on the events that COUNTED towards it (O-1,
 *  owner 21 Sep 26; see oilFigureFor). Null five days a week and on any day that
 *  earns nothing, so nothing is emitted at all and the printed schedule is
 *  byte-identical to before. */
export function oilBarOf(di: any, id: any, item?: string): { bar: 'FO' | 'HO' } | null {
  const a = oilFigureFor(di, id, item)
  return a ? { bar: a } : null
}

/** The ITEM a slot key belongs to — how a seat renderer, which knows only the
 *  key it is drawing, finds the row's OIL address. */
export function oilItemOfKey(di: any, key: any): string {
  const s = String(key || ''), c = s.indexOf(':')
  const d: any = DAYS[+di] || {}
  if (!s) return ''                                       // no seat address at all
  /* A FLYING SEAT: `di.wave.line.aircraft.seat`, the one key grammar with no
     prefix (slots.ts flyRef). It used to answer '' here, which was true of the
     only question then being asked — no sentinel is ever planted in a cockpit.
     Since O-1 the ordinary bar needs this address too, and answering '' would
     have silently stripped the green edge off every sortie and every SC shift,
     which is exactly the kind of row that earns a weekend day. The LINE is the
     item, the same address dayOilWork tags a flying span with. */
  if (c < 0) {
    const a = s.split('.')
    const w = (d.waves || [])[+a[1]], f = w && (w.formations || [])[+a[2]]
    return f ? rowItemKey(f.rid) : ''
  }
  const p = s.slice(0, c), a = s.slice(c + 1).split('.')
  if (p === 'g') { const r = (d.ground || [])[+a[1]]; return r ? groundItemKey(r) : '' }
  if (p === 'a') { const r = (d.allhands || [])[+a[1]]; return r ? rowItemKey(r.rid) : '' }
  if (p === 'd') { const b = (d.dutywaves || [])[+a[1]], r = b && (b.rows || [])[+a[2]]; return r ? rowItemKey(r.rid) : '' }
  if (p === 's') { const r = (((d.sims || {})[a[1]]) || [])[+a[2]]; return r ? rowItemKey(r.rid) : '' }
  return ''
}

/** THE FOUR STATES OF A SENTINEL PUCK (§7.6, as the owner refined it: "if
 *  everyone in the all avail or all puck is granted OIL, it should be green").
 *  ALL / ALL AVAIL is not a person and cannot carry a person's figure — the men
 *  behind one puck can earn a full day, a half day and nothing at once. So:
 *
 *    behind the puck            the puck                  the count chip
 *    everyone a FULL day        full-height green bar      plain, `9`
 *    everyone HALF a day        half-height paler bar      plain, `9`
 *    nobody earns               no bar                     plain, `9`
 *    MIXED                      no bar                     green, `6 of 9 earn`
 *
 *  The mixed case is the BUILD's call, not the owner's — flag it if reopened. A
 *  mixed puck and an earns-nothing puck both wear no bar, so the CHIP is what
 *  tells them apart: green with a fraction means "some of these men earn", plain
 *  means none do. That beats inventing a third bar style for a state that has no
 *  single honest figure.
 *
 *  Returns null where the puck is not a resolved sentinel at all (a sentinel in a
 *  flying seat earns nobody anything, and the day's own rules never expand it). */
export function oilSentinelSummary(di: any, item: string): { bar: 'FO' | 'HO' | null; n: number; earn: number } | null {
  const ev = evOf(di)
  if (!ev.earns || !item) return null
  const people = ev.sent && ev.sent[item]
  if (!people) return null
  /* measured ON THIS ROW, not across the man's day (O-3, re-examined under O-1).
     The chip used to count anyone earning ANYWHERE that day, so a row switched
     off could still read "1 of 45 earn". The owner left that alone only because
     the green bar meant the same thing; now that the bar is withheld on a row
     that gave a man nothing, the two agree again — and they must, because they
     sit on the same puck. */
  const amts = people.map(p => oilFigureFor(di, p, item))
  const n = people.length, earn = amts.filter(Boolean).length
  const all = (v: OilAmt) => n > 0 && amts.every(a => a === v)
  return { bar: all('FO') ? 'FO' : all('HO') ? 'HO' : null, n, earn }
}

/** The people behind a sentinel, each with his own figure, in the words the
 *  count chip's tap shows. */
export function oilSentinelList(di: any, item: string): string {
  const ev = evOf(di)
  const people = (ev.sent && ev.sent[item]) || []
  if (!people.length) return 'Nobody is behind this puck on this day'
  /* each man as THIS ROW earned him, so the list and the chip above it agree */
  const say = people.map(p => { const a = oilFigureFor(di, p, item)
    return `${((PEOPLE as any)[p] || {}).cs || p} ${a === 'FO' ? 'full day' : a === 'HO' ? 'half day' : 'nothing'}` })
  return `${people.length} behind this puck — ${say.join(', ')}`
}
