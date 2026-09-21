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
import { envMin, uniformOil, dayOilWork, rowItemKey, groundItemKey, inputItemKey, type OilWork } from '../engine/oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, personDecision, type OilEvidence, type OilDecisions } from '../engine/oilev'
import { OILDAY, setOilDay, afterSchedMutate, esc } from '../state/view'

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
  return on
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

/** EVERY PERSON'S FIGURE FOR THE DAY — `personId -> FO | HO`. This is THE
 *  MAN'S DAY, not what one event earned (§2.10): the same bar is repeated on
 *  every puck he wears that day, so a man on four DASH rows shows one full day
 *  four times, not four full days. Getting that wrong is what would have made
 *  positive marking actively wrong. */
export function oilDayFigures(di: any): Record<string, OilAmt> {
  const d = DAYS[+di]
  const ev = evOf(di)
  const out: Record<string, OilAmt> = {}
  if (!d || !ev.earns) return out
  const work = oilEarnedWork(d, ev)
  for (const person of Object.keys(work)) { const a = amtOf(work[person]); if (a) out[person] = a }
  return out
}

/** One man's figure for the day — what the green edge draws and what the mode
 *  prints on every one of his pucks. */
export function oilFigureFor(di: any, person: any): OilAmt {
  const f = oilDayFigures(di)
  return f[String(person)] || null
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

/** What the mode shows on ONE puck: whether it glows, and the man's figure for
 *  the day. `null` figure with `on` true means he is on the item but the day
 *  measures him nothing yet (no written times) — the puck glows nothing. */
export function oilPuck(di: any, person: any, item: string): { on: boolean; amt: OilAmt } {
  return { on: oilPersonOn(di, person, item), amt: oilFigureFor(di, person) }
}

/** THE PEOPLE A SENTINEL PUCK STANDS FOR, for the mode to open into real pucks
 *  (§2.1 item 6) and for the issued schedule's count chip (§7.6). On an issued
 *  day this is the FROZEN membership, so the puck's answer cannot change under
 *  the reader; on a working copy it resolves live. */
export function oilSentinelPeople(di: any, item: string, win: [number, number]): string[] {
  const ev = evOf(di)
  if (ev.sent && ev.sent[item]) return ev.sent[item]
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
function tidy(di: any): void {
  const d = DAYS[+di], dec = d && d.oild
  if (!dec) return
  if (dec.items && !Object.keys(dec.items).length) delete dec.items
  if (dec.people && !Object.keys(dec.people).length) delete dec.people
  if (!dec.blanket && !dec.items && !dec.people) delete d.oild
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
  if (!item) return false
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
export function dayBarHTML(di: any, tplBtn: string): string {
  const oil = oilShown(di)
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
  const { on, amt } = oilPuck(di, person, item)
  const ttl = on
    ? `${p.cs} earns ${amt === 'FO' ? 'a full day' : amt === 'HO' ? 'half a day' : 'nothing yet'} — tap to take him off this event`
    : `${p.cs} earns nothing from this event — tap to put him back on it`
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
  /* a claim-derived item is eligible when the claim itself is live */
  const inp = ev.inputs.find(i => inputItemKey(i.iid) === item && i.person === String(person))
  if (inp) return !!(inp.asks && inp.acc !== 'r' && inp.win)
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
 *  his figure for the DAY, repeated on every puck he wears that day. Null five
 *  days a week and on any day that earns nothing, so nothing is emitted at all
 *  and the printed schedule is byte-identical to before. */
export function oilBarOf(di: any, id: any): { bar: 'FO' | 'HO' } | null {
  const a = oilFigureFor(di, id)
  return a ? { bar: a } : null
}

/** The ITEM a slot key belongs to — how a seat renderer, which knows only the
 *  key it is drawing, finds the row's OIL address. */
export function oilItemOfKey(di: any, key: any): string {
  const s = String(key || ''), c = s.indexOf(':')
  if (c < 0) return ''                                    // a flying seat: no sentinel earns there
  const p = s.slice(0, c), a = s.slice(c + 1).split('.')
  const d: any = DAYS[+di] || {}
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
  const fig = oilDayFigures(di)
  const amts = people.map(p => fig[p] || null)
  const n = people.length, earn = amts.filter(Boolean).length
  const all = (v: OilAmt) => n > 0 && amts.every(a => a === v)
  return { bar: all('FO') ? 'FO' : all('HO') ? 'HO' : null, n, earn }
}

/** The people behind a sentinel, each with his own figure, in the words the
 *  count chip's tap shows. */
export function oilSentinelList(di: any, item: string): string {
  const ev = evOf(di)
  const people = (ev.sent && ev.sent[item]) || []
  const fig = oilDayFigures(di)
  if (!people.length) return 'Nobody is behind this puck on this day'
  const say = people.map(p => `${((PEOPLE as any)[p] || {}).cs || p} ${fig[p] === 'FO' ? 'full day' : fig[p] === 'HO' ? 'half day' : 'nothing'}`)
  return `${people.length} behind this puck — ${say.join(', ')}`
}
