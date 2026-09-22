/* =====================================================================
   THE OIL EVIDENCE BLOCK — [OIL-AUTO-REMOVE], 21 Sep 26
   (docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md §7.1,
   §7.3, §7.4, §9.1, §9.2, §9.3)

   ONE place that says what earns OIL on a day, and the ONE body that computes
   it. Before this, the money came from two disagreeing sources: the day's
   ISSUED snapshot for schedule work, and LIVE `INPUTS` for a duty-and-
   commitments claim. So revising an OIL answer on a published Saturday moved
   the credit at once and produced no amendment, and an overseas-duty answer
   could never produce one at all, because OD has no row on the programme.

   THE ANSWER: the day carries an OIL EVIDENCE BLOCK, and money comes only from
   it. On an ISSUED day the block is FROZEN into the snapshot (`Day.oilev`,
   attached by publish.ts's daySnap) and the credit pass reads nothing else. On
   the live working copy the block is DERIVED ON READ from the current inputs,
   roster and day content plus the scheduler's stored decisions — never stored,
   so it cannot go stale, and a parked plan restored months later re-derives it
   rather than resurrecting an obsolete one (§9.3).

   WHAT IS STORED on a day is only the DECISIONS (`Day.oild`): the whole-day
   blanket, the per-item marks and the three-state per-person decisions. Those
   are the owner's choices and they are the day's content. Everything else — the
   input projection, the resolved sentinel participants — exists on the issued
   snapshot only.

   THREE STATES, NOT A FLAG (§9.1). A per-person-per-event decision is `inherit`
   (absent — follow the member's own answer and the ordinary rules), `allow`
   (this man earns from this event whatever the member's answer said) or `deny`.
   `allow` and `deny` both outrank the member's answer; the member's answer is
   stored on his own input and is NEVER overwritten, so lifting an override
   brings his word back and the Inputs page still shows him what he said.

   NOTHING OVERRIDES INELIGIBILITY. A dormant input, a cancelled row, a day that
   cannot earn at all, work with no written times, an SC spare, AVALON/BB, an ⓘ
   info row — all stay at nothing whatever the three-state says. An `allow` is
   permission to count real work, never permission to invent it. That is why the
   decisions are applied to the work the day's own rules produced (engine/oil.ts)
   rather than being a second source of work.

   Ordinary TS style — a new file, not a ported engine body.
   ===================================================================== */
import { DAYS } from './data'
import { INPUTS, inpId, inpWin, oilAsks, dateOrd, dateIx } from './inputs'
import { weekKeyOfOrd } from './weeks-data'
import { CURWEEK } from './waves'
import { stashHas, stashGet, stashDays } from './weekstash'
import { PEOPLE, whoId, isSpecial } from './people'
import { HOOKS } from './hooks'
import { dayOilWork, envMin, uniformOil, inputItemKey, rowItemKey, groundItemKey, type OilWork } from './oil'

/* the item-address grammar lives in engine/oil.ts, beside the walk that tags
   every span with it — re-exported here so callers of the evidence block have
   one import. */
export { inputItemKey, rowItemKey, groundItemKey }

/* ---- the stored decisions (Day.oild — day content) ---------------------- */

export type OilDecision = 'allow' | 'deny'

export interface OilDecisions {
  /** the whole-day blanket: nothing today earns. A FACT about the day, not a
   *  stamp on the rows, so it covers anything added later — and it MASKS the
   *  marks beneath it rather than deleting them (§2.1 item 7, §9.1). */
  blanket?: 1
  /** item key → the scheduler's mark on the whole item.
   *  `0` = this item earns nobody anything.
   *  `1` = this item earns EVERYONE on it, whatever the seat's own default
   *  ([OIL-SEATS-CAN-EARN], 22 Sep 26). The `1` exists because from step 3 a
   *  seat can default OFF — an SC spare, an AVALON or BB line, an AVALON desk —
   *  and D24 says the admin must be able to switch such a line ON. Absent means
   *  "no decision": the seat's own default answers. NOTHING WRITES THE `1` YET;
   *  it is the shape the switch needs, landed with the two readers below so the
   *  guards and the switch stop sharing one boolean. */
  items?: Record<string, 0 | 1>
  /** `<personId>|<itemKey>` → allow | deny (§9.1). */
  people?: Record<string, OilDecision>
}

/* ---- the derived halves (issued snapshots only) -------------------------- */

/** One OIL-bearing input covering the day's date, frozen at publication (§7.1
 *  item 4). This is what lets an OD claim — which never lands on the programme
 *  — be part of the issued document at all, and what makes revising an answer
 *  on a published day an amendment like any other change. */
export interface OilInputEv {
  /** the input's own stable id: the decision address that survives an edit (§7.4) */
  iid: string
  person: string
  type: string
  /** does the TYPE ask for OIL at all (`oilAsks`) */
  asks: boolean
  /** its standing on the programme: 'g' landed · 'u' unavailable · 'r' dormant · '' fresh */
  acc: string
  /** THE ONE LANDED ROW'S OWN STATE, frozen here so every covered day can read
   *  it (job 2, 22 Sep 26). A request lands ONE row, on its FIRST day, by
   *  design — so asking "is there a row on the day being paid?" answered NO on
   *  every other day it covers, and a Saturday the member had answered YES for
   *  paid nothing. The row's state travels with the claim instead:
   *  `unlanded` never landed · `active` a live row · `cx` cancelled ·
   *  `info` shown-only · `gone` its row was deleted · `elsewhere` landed on a
   *  week nobody has loaded. */
  stand: 'unlanded' | 'active' | 'cx' | 'info' | 'gone' | 'elsewhere'
  /** its window on this date, rolled; null when it carries no usable one */
  win: [number, number] | null
  /** the MEMBER's own answer for this date — null = unanswered. Never overwritten. */
  ans: number | null
}

export interface OilEvidence {
  /** the date this block belongs to, so a frozen block can never be read against another day */
  iso: string
  /** can this day earn at all — a weekend, or the war's public holiday.
   *  NOT an "off day" (owner, D21, 22 Sep 26: "nope"). An off day is time GIVEN
   *  to a man, not a holiday he was called in on, so working it earns nothing.
   *  This comment used to list it and was the drift Fable's M10 named. */
  earns: boolean
  /** the scheduler's decisions (a copy of Day.oild) */
  d: OilDecisions
  /** every OIL-bearing input covering the date */
  inputs: OilInputEv[]
  /** item key → the people a sentinel on that item stands for, frozen (§7.3) */
  sent: Record<string, string[]>
  /** DOES THIS BLOCK RECORD MEMBERSHIP ON EVERY DAY ([OIL-SEATS-CAN-EARN] step
   *  9, D44)? Every block written from that step on does, earning day or not,
   *  so an entry that is ABSENT means "there is no puck on that seat" — a known,
   *  honest nobody.
   *
   *  A block frozen by an EARLIER build carries no flag, and its absences mean
   *  something quite different: it recorded nothing at all on a non-earning day,
   *  and nothing for a duty or sim placeholder on any day, because the walk did
   *  not reach those seats yet. Reading those absences as "nobody" would be a
   *  lie, and resolving them LIVE would be worse — an issued day's count would
   *  move the moment somebody filed leave, which is the one thing D44 forbids
   *  (OSE-T-02). So the flag's absence is what makes the reader say "membership
   *  not recorded" and invent nothing. Same shape, and the same reason, as
   *  `stand` on a claim. */
  mem?: 1
}

export const EMPTY_OIL_EVIDENCE: OilEvidence = { iso: '', earns: false, d: {}, inputs: [], sent: {}, mem: 1 }

/** WHO IS BEHIND A PLACEHOLDER ON THIS SEAT — the ONE body every reader asks
 *  (Fable correction 2). The count chip, its tap, the mode's opened pucks and
 *  the row's people list all come through here, or the chip says 27 and the tap
 *  says "Nobody is behind this puck on this day" — which is what happened when
 *  they were four separate readers.
 *
 *  IT RESOLVES NOTHING ITSELF. The answer is whatever the day's own block wrote
 *  down: live on a working copy, because the block is rebuilt on every read;
 *  frozen inside an issued document, because the block IS the record. That is
 *  the whole of D44, and it is why this takes the block rather than a day index
 *  — a reader holding an issued block cannot accidentally be handed today's
 *  availability.
 *
 *  THREE ANSWERS, because they are three different facts and one of them must
 *  never be read as another:
 *  · `resolved`   — the day wrote this seat down. An EMPTY list is a real
 *                   answer here: a puck nobody is free for stands for nobody,
 *                   and the screen should say 0 rather than go quiet.
 *  · `none`       — the day records membership and wrote nothing for this seat,
 *                   so there is no puck on it (or its row carries no times the
 *                   rules could resolve anyone against).
 *  · `unrecorded` — the block predates membership being kept (see `mem`).
 *                   Nothing is known and nothing may be invented. */
export function oilSentOf(ev: OilEvidence | null | undefined, item: string):
  { people: string[]; state: 'resolved' | 'none' | 'unrecorded' } {
  const sent = (ev && ev.sent) || {}
  if (item && Object.prototype.hasOwnProperty.call(sent, item)) return { people: [...sent[item]], state: 'resolved' }
  return { people: [], state: ev && ev.mem ? 'none' : 'unrecorded' }
}

/* a plain deep copy — the evidence block must never hand back a live reference
   into the day it was read from (see oilEvidence below). */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

/* ---- item identity (§7.4) ------------------------------------------------
   Decisions are keyed by what SURVIVES an ordinary member edit. `commitInputEdit`
   DELETES and RECREATES an accepted ground row, and `acceptInput` builds a fresh
   one, so a mark hung on the row — or on its rid — vanishes when a member edits
   his own remarks or times, and his default "yes" comes back at the next
   publication: an admin override undone by an ordinary member edit, silently.
   So an INPUT-DERIVED item is addressed by the INPUT's own id, and only a
   hand-built row by its `rid` (the addressing the amendment book already uses).
   The grammar itself is `inputItemKey` / `rowItemKey` / `groundItemKey`, in
   engine/oil.ts beside the walk that stamps it onto every span.

   A change of person, date or type makes it a DIFFERENT thing: the input keeps
   its id, so its item address survives, but the projection records the new
   person — and a decision addressed to the old man no longer matches anyone the
   item earns for, so it stops applying. A copied row starts with no decision,
   like a new one, because a copy is minted a fresh rid (`stripRowIds`). */

/* ---- the decision algebra ------------------------------------------------ */

/** TWO READERS, NOT ONE ([OIL-SEATS-CAN-EARN] §4, Fable R2-2). The single
 *  boolean `itemOn` was doing two jobs: it answered the GUARDS ("may anything
 *  under this item earn at all?") and it was also read as the SWITCH's own
 *  state. Once the mark has three values that stops working — six callers treat
 *  the answer as a boolean, and `!undefined` is true, so making one function
 *  three-valued would send every puck inert and make every item tap report the
 *  item masked. So the two questions get two functions and neither can drift.
 *
 *  MASKED — can nothing under this item earn? The blanket, or an explicit `0`.
 *  Semantics identical to the old `itemOn`, inverted so the name says what it
 *  tests: an item with NO mark is not masked, and neither is a forced-on `1`. */
export function itemMasked(ev: OilEvidence, item: string): boolean {
  if (ev.d.blanket) return true
  return !!(item && ev.d.items && ev.d.items[item] === 0)
}

/** THE MARK ITSELF — the scheduler's own decision about this item, apart from
 *  the blanket over it. `undefined` means he has made none, which is what lets
 *  the switch tell "he turned it off" from "nobody has touched it" (the blanket
 *  MASKS the marks beneath rather than deleting them, §2.1 item 7, so the mark
 *  must stay readable underneath one or turning the blanket off would not bring
 *  the marks back). */
export function itemMark(ev: OilEvidence, item: string): 0 | 1 | undefined {
  if (!item || !ev.d.items) return undefined
  const v = ev.d.items[item]
  return v === 0 ? 0 : v === 1 ? 1 : undefined
}

/** The three-state decision for one man on one item; undefined = inherit. */
export function personDecision(ev: OilEvidence, person: string, item: string): OilDecision | undefined {
  if (!item || !ev.d.people) return undefined
  return ev.d.people[`${person}|${item}`]
}

/** Does this man earn from this item — `allow`/`deny` outranking `dflt`, which
 *  is the ordinary rule's own answer (yes for schedule work, the member's own
 *  answer for an input claim). Ineligibility is decided before this is asked. */
export function earnsFrom(ev: OilEvidence, person: string, item: string, dflt: boolean): boolean {
  if (itemMasked(ev, item)) return false
  const dec = personDecision(ev, person, item)
  if (dec) return dec === 'allow'
  /* AN ITEM FORCED ON BEATS THE SEAT'S OWN DEFAULT ([OIL-SEATS-CAN-EARN] §4).
   *  This is D24's switch: an AVALON line or an SC spare earns nothing by
   *  default, and the admin must be able to say "this one did". The man's own
   *  decision is asked FIRST, above, so taking one man off a line the admin
   *  forced on still works — without that order the `1` would make him earn
   *  again the instant his override was written (Codex OSE-R2-01). */
  if (itemMark(ev, item) === 1) return true
  return dflt
}

/* ---- the ONE body behind the screen and the money ------------------------ */

/** THE SEAT'S OWN ANSWER for one man on one item, before any decision is
 *  applied: does this piece of work earn by default?
 *
 *  IT EXISTS BECAUSE THE SCREEN AND THE MONEY MUST NOT ANSWER IT SEPARATELY
 *  (Fable R2-1 and Codex OSE-R2-01, found from opposite ends). The mode used to
 *  carry its own `itemDefaultFor`, which returned true whenever there was no
 *  claim. Once a seat can default OFF that is wrong in the worst direction: the
 *  man would draw GLOWING while the money paid him nothing, and his tap would
 *  write `deny` for a credit he never had — so `allow` became unreachable and
 *  D24's only door would not exist. Both now derive from here.
 *
 *  A CLAIM is answered by the MEMBER (§2.2 — the OIL question is put to him and
 *  his word is the default); anything else is answered by the span the day's own
 *  rules produced. A man with no span at all defaults to yes, which is what the
 *  input half's D18 extras rely on. */
export function spanDefault(day: any, ev: OilEvidence, person: string, item: string): boolean {
  const inp = ev.inputs.find(i => inputItemKey(i.iid) === item && i.person === person)
  if (inp) return inp.ans != null && inp.ans > 0
  const spans = (oilDayWork(day, ev)[person] || []).filter(w => String(w.item || '') === item)
  return spans.length ? spans.every(w => w.dflt !== false) : true
}

/** WHAT THE ITEM'S SWITCH SHOULD DRAW — `on`, `off`, or `mixed`.
 *
 *  MIXED IS NOT A CURIOSITY: an SC shift holds MAIN seats (which earn) and SPARE
 *  seats (which do not) under ONE item address, and a duty row can hold a named
 *  man beside an ALL AVAIL. Two titles could not describe that, and the switch
 *  would tell the admin something false about half the row (Fable S8).
 *
 *  The admin's own mark answers outright when he has made one; otherwise the
 *  spans speak. An item nobody is standing on yet reads ON — put a man there and
 *  he earns, and OIL7 says the switch covers later additions too. */
export function itemState(day: any, ev: OilEvidence, item: string): 'on' | 'off' | 'mixed' {
  const mark = itemMark(ev, item)
  if (mark === 0) return 'off'
  if (mark === 1) return 'on'
  let on = 0, off = 0
  const work = oilDayWork(day, ev)
  for (const person of Object.keys(work)) {
    for (const w of work[person]) {
      if (String(w.item || '') !== item) continue
      if (w.dflt === false) off++; else on++
    }
  }
  if (off && on) return 'mixed'
  return off ? 'off' : 'on'
}

/* ---- building the block -------------------------------------------------- */

/** every OIL-bearing input covering `iso`, projected (§7.1 item 4). Reads live
 *  INPUTS — which is exactly right while this is the LIVE candidate, and is
 *  never reached on an issued day, whose block is frozen. */
/** The ONE row a request landed on, wherever it sits, reduced to what the
 *  money needs to know. A request lands once (`acceptInput` refuses a second
 *  landing for the same id), so this is a search for a single row across every
 *  LOADED day — not a per-day question.
 *
 *  NOT FOUND is the case that needs care, because it means two opposite things
 *  and they pay opposite ways:
 *    · the row was DELETED out from under the claim — it earns nothing, and a
 *      test has pinned that since R-2 (21 Sep 26);
 *    · the row is simply on a week nobody has LOADED — the claim stands, which
 *      is the whole point of this repair.
 *  They are told apart by the request's FIRST covered day, which is where
 *  `acceptInput` puts the row. If that day is in front of us and carries no
 *  row, the row is gone. If it is not loaded at all, the row is elsewhere and
 *  we simply cannot see it.
 *
 *  THE WEEK NOBODY HAS LOADED IS READ TOO ([OIL-XWEEK-ELSEWHERE], 22 Sep 26 —
 *  Fable F2 and Codex rank 3, and both wanted it closed before the branch could
 *  go live). It used to stop at the loaded week and file the rest as a limit,
 *  and the limit was described wrongly: a request anchored in another week does
 *  not read `elsewhere`, because every `'g'` is cleared on a week swap, so it
 *  reads `acc:''` and the money paid it at a short-circuit before the standing
 *  was consulted at all. A repair written against the `elsewhere` branch would
 *  never have fired. A ten-day Training cancelled on its row therefore went on
 *  paying its weekend in the following week — a day paid for work the schedule
 *  itself says did not happen, and one that can be frozen into a publication.
 *
 *  So the anchor's own week is resolved from the request's first date and its
 *  stashed days are searched. What each answer means:
 *    · no stash entry at all — that week was never edited, so no row was ever
 *      made there, so nothing contradicts the man's own answer: `unlanded`;
 *    · a stash entry that cannot be read — we know the week WAS touched and
 *      cannot see how. Codex asked for the conservative answer here and is
 *      right: absence of evidence about a week somebody worked in is not
 *      evidence of work. `elsewhere` now means exactly that, and does not pay;
 *    · a row found — its own state, the same as a loaded one. */
function landedStanding(row: any): OilInputEv['stand'] {
  const acc = String(row.acc || '')
  if (acc === 'r' || acc === 'u') return 'unlanded'       // dormant, or a kind that never lands
  const key = String(inpId(row))
  for (let i = 0; i < DAYS.length; i++) {
    const hit = ((DAYS[i] as any || {}).ground || []).find((r: any) => r && String(r.src || '') === key)
    if (hit) return hit.cx ? 'cx' : hit.info ? 'info' : 'active'
  }
  /* `dateIx` is the app's own "is this label one of the loaded days", and it
     resolves BOTH sides under the right year convention — the day labels under
     the loaded week's, the request's under its own `yr`. Comparing the day
     label against the ROW's year (which is what this did) reads the anchor day
     as not loaded across a New Year boundary (Fable F7). Pinned by
     `engine/crossyear.test.ts` §"the OIL money asks the app's own question". */
  if (dateIx(row.date, row.yr) >= 0) return acc === 'g' ? 'gone' : 'unlanded'
  return stashStanding(dateOrd(row.date, row.yr), key)
}

/* The anchor row's state in a week that is not on screen. Memoised on the
   stashed BLOB ITSELF, the way leavewar/sync.ts's STASH_OIL_CACHE already does:
   the evidence is rebuilt once per puck, and parsing a whole week for every one
   of them would be felt. Keyed on the blob and not on a counter deliberately —
   a counter that can restart (stashClear) serves a stale answer under a key
   that looks fresh, which is a hard defect to see. A rewritten week is a new
   string, so it misses correctly. */
const XW_MEMO = new Map<string, Map<string, OilInputEv['stand']> | null>()
function stashStanding(first: number | null, key: string): OilInputEv['stand'] {
  if (first == null) return 'unlanded'
  const wk = weekKeyOfOrd(first)
  /* the loaded week is DAYS, which was just scanned; its stash blob is the
     stale one written on the way IN and must never be read back over it */
  if (!wk || wk === CURWEEK || !stashHas(wk)) return 'unlanded'
  const blob = String(stashGet(wk) || '')
  let rows = XW_MEMO.get(blob)
  if (rows === undefined) {
    const parsed: any = stashDays(wk)
    if (!parsed || !Array.isArray(parsed.days)) rows = null
    else {
      rows = new Map<string, OilInputEv['stand']>()
      for (const d of parsed.days) {
        for (const r of ((d || {}).ground || [])) {
          const src = r && String(r.src || '')
          if (src && !rows.has(src)) rows.set(src, r.cx ? 'cx' : r.info ? 'info' : 'active')
        }
      }
    }
    if (XW_MEMO.size > 32) XW_MEMO.clear()
    XW_MEMO.set(blob, rows)
  }
  if (!rows) return 'elsewhere'                           // stashed and unreadable
  return rows.get(key) || 'unlanded'
}

export function projectOilInputs(iso: string): OilInputEv[] {
  const ord = +String(iso).replace(/-/g, '')
  const out: OilInputEv[] = []
  for (const row of INPUTS as any[]) {
    if (!row || !row.person || !oilAsks(row.type)) continue
    const a = dateOrd(row.date, row.yr)
    if (a == null) continue
    const b = row.endDate ? dateOrd(row.endDate, row.yr) ?? a : a
    if (ord < a || ord > b) continue
    const w = inpWin(row)
    const ans = (row.oil || {})[iso]
    out.push({
      iid: String(inpId(row)),
      person: String(row.person),
      type: String(row.type || ''),
      asks: true,
      acc: String(row.acc || ''),
      stand: landedStanding(row),
      win: w && w[1] > w[0] ? [w[0], w[1]] : null,
      ans: typeof ans === 'number' ? ans : null,
    })
  }
  /* deterministic order, so an unchanged day serialises byte-identically and a
     reordered INPUTS array is not read as a change (§9.2). */
  out.sort((x, y) => (x.iid < y.iid ? -1 : x.iid > y.iid ? 1 : 0))
  return out
}

/** THE ONE BODY (§9.3). The day's OIL evidence as it stands right now: the
 *  stored decisions, the projected inputs and the resolved sentinel membership.
 *  The preview, the amendment comparison, the signature binding and publication
 *  all call THIS, so they cannot disagree about what is being signed.
 *
 *  `day` defaults to the loaded week's day, which is what every caller in the
 *  app wants; passing one explicitly is for tests and for a stashed week. */
/** Drop every per-person override that names a man who no longer holds the
 *  request it is about. Mutates the COPY oilEvidence has already made — never
 *  `DAYS`. Row items (`r:`/`g:`) are not assignments and are never touched. */
function pruneHandedOverDecisions(dec: OilDecisions, day: any): void {
  const ppl = dec && dec.people
  if (!ppl) return
  for (const k of Object.keys(ppl)) {
    const cut = k.indexOf('|')
    if (cut < 0) continue
    const person = k.slice(0, cut), item = k.slice(cut + 1)
    if (!item.startsWith('i:')) continue                     // only a REQUEST can change hands
    const iid = item.slice(2)
    const inp = (INPUTS as any[]).find(r => r && String(inpId(r)) === iid)
    if (!inp) continue                                       // orphan: already inert, leave it be
    if (String(inp.person || '') === person) continue        // the man who holds it
    /* AND ANYONE THE SCHEDULER PUT ON ITS ROW (D18, 22 Sep 26). This used to
       assume only the requester could carry a decision about a request, which
       was true until a second man on the row started earning from it. Left as
       it was, taking that second man off did nothing: the prune deleted his
       refusal on the way out and he was paid anyway. Caught by job 8's own
       test, which is the only place the two fixes meet. */
    if (landedExtras(day, iid, String(inp.person || '')).includes(person)) continue
    /* AND EVERY DECISION ON A ROW THAT CARRIES A PLACEHOLDER
       ([OIL-SEATS-CAN-EARN] step 6). Who a placeholder stands for is worked out
       from who is free, so it changes as people file leave — and a decision must
       not be thrown away because the man it names happens to be busy today.
       Deleting it would silently pay him the moment he was free again, which is
       the same failure D18's half of this prune was written to close. The row
       standing the puck is what makes his decision legitimate, not today's
       answer to who is available. */
    if (landedHasSentinel(day, iid)) continue
    delete ppl[k]
  }
  if (!Object.keys(ppl).length) delete (dec as any).people
}

export function oilEvidence(di: any, day?: any): OilEvidence {
  di = +di
  const d = day || DAYS[di]
  const iso = HOOKS.oilDayISO(di)
  const earns = !!d && !!iso && HOOKS.oilEarningDay(di)
  /* THE DECISIONS ARE COPIED, NEVER ALIASED — found by hand in the running app,
     21 Sep 26. `daySnap` freezes this block onto the issued day, so handing back
     the LIVE `oild` object made the frozen evidence track every later edit: mark
     one more man on a published Saturday and the issued document silently agreed
     with you, the delta read as "no change", and the day could never be amended.
     The whole point of the block is that the issued answer stops moving. */
  const dec: OilDecisions = clone((d && d.oild) || {})
  /* A DECISION DIES WITH THE ASSIGNMENT (Codex M1, 22 Sep 26). A scheduler's
     override names a man AND an item; when a request changes hands, the write
     side clears the old holder's key on every LOADED day, but a request can
     cover a day in a stashed week that no write can reach. Left there, the key
     is dormant until that week is opened and then decides against a man who has
     nothing to do with the request any more.

     So it is closed here as well, and only here is it safe to: this runs on the
     LIVE day only — an issued day carries its own frozen block, written once at
     publication and never recomputed — and it works on the COPY above, so the
     stored day is untouched and the issued record cannot move.

     ONLY on a positive mismatch: the request still exists and names somebody
     else. An ORPHANED key, whose request is gone, is deliberately left alone —
     it is already inert (no input, no span, nothing to decide), and dropping it
     would move the day's evidence for no reason, which is exactly how the
     phantom amendment in job 3 was made.

     Runs BEFORE the non-earning bail: a day that earns nothing today may earn
     tomorrow (a holiday declared late), and the copy every reader is handed
     should be clean whichever it is. */
  pruneHandedOverDecisions(dec, d)
  /* A DAY WITH NO DATE CAN ANSWER NOTHING — who is free at a time needs the
     date to ask about. It is the only way out of here that records nothing. */
  if (!iso) return { iso: '', earns: false, d: dec, inputs: [], sent: {}, mem: 1 }
  const sent: Record<string, string[]> = {}
  /* the walk that finds the day's work is the SAME walk the credit uses, so the
     frozen membership can never be resolved for an item the credit does not
     measure (or missed for one it does). It hands each sentinel its item key. */
  dayOilWork(d, {
    expandAll: (win, item) => {
      const people = HOOKS.oilSentinel(iso as string, win, d)
      if (item) sent[item] = people
      return people
    },
  })
  const ins = projectOilInputs(iso as string)
  /* AND THE REQUEST HALF'S OWN MEMBERSHIP ([OIL-SEATS-CAN-EARN] step 6). An
     accepted request's row is the one row the walk above skips whole — its money
     comes down a separate route — so a placeholder standing on it would be
     resolved nowhere and written down nowhere, and an issued day could not hold
     its people still.

     THE REQUEST'S OWN WINDOW, NOT THE ROW'S (Fable M6, the same trap as D18's
     extras): an all-day request lands a row with no times at all, so reading the
     row would gather nobody on exactly the request that covers most of the day.

     Only a row that actually stands a placeholder is asked. A request with no
     puck on it writes no entry, so an ordinary day's block is byte-identical to
     before and nothing reads as changed. */
  for (const inp of ins) {
    if (!inp.win || !landedHasSentinel(d, inp.iid) || !oilInputEligible(d, inp)) continue
    sent[inputItemKey(inp.iid)] = HOOKS.oilSentinel(iso as string, inp.win, d)
  }
  /* A DAY THAT EARNS NOBODY ANYTHING STILL KNOWS WHO IS BEHIND ITS PUCKS
     ([OIL-SEATS-CAN-EARN] step 9; D27, D44). The count is a SCHEDULING fact —
     dropped anywhere, a placeholder works out who would attend — and until now
     it existed only as a by-product of working out the money, so five days a
     week the puck stood for nobody and the chip said nothing.
     The money half stays exactly where it was: `inputs` is left empty and
     `earns` false, so every reader of what a day PAYS is byte-identical to
     before. Only the membership is now kept. */
  if (!earns) return { iso, earns: false, d: dec, inputs: [], sent, mem: 1 }
  return { iso: iso as string, earns: true, d: dec, inputs: ins, sent, mem: 1 }
}

/* ---- the read-only render pass ([OIL-SEATS-CAN-EARN] §5 step 1) -----------
   Consolidating the mode's item guard onto the evidence turns an O(1) property
   read into a whole evidence build — the day's work walk plus the input
   projection — and from step 9 it is asked per row and per puck on every day,
   every repaint, not just on a weekend inside the mode (Fable R2-7, S4;
   docs/performance.md Part 1).

   SO IT IS MEMOISED — BUT NEVER ON (day identity, store version), WHICH IS
   UNSAFE (OSE-T-01, found by the targeted check on the fold). The day is
   mutated IN PLACE and the version only advances at notify, while the
   post-mutation epilogue runs VALIDATION first — and validation asks whether
   the day would earn. A cache filled by the previous paint would hand
   validation the PRE-change evidence, so switching off the last earning item
   could leave an obsolete OIL warning standing on the day. The same window
   covers signing and publication, which read the authoritative answer in the
   same breath as a mutation.

   So: the authoritative calculation stays UNCACHED, and the cache exists only
   inside an explicitly opened read-only pass — the two HTML builders, which
   write nothing. Outside a pass every call recomputes, which is the behaviour
   this step inherits and must not change.

   Keyed on the day OBJECT as well as the index, because `withDaySnap` swaps a
   snapshot into `DAYS[di]` for the same index: a pass that spans the swap must
   MISS rather than serve the live day's answer inside the issued document. */
let OIL_PASS: Map<number, { d: any; ev: OilEvidence }> | null = null
/* the same pass holds the day's WORK WALK, for the same reason and with the
   same safety. From step 3 the walk is asked by `spanDefault` — once per PUCK,
   and again by `itemState` once per row — where before it ran once per credit
   pass. Keyed on the EVIDENCE object, which is itself per-day and stable only
   inside a pass, and the day object is verified as well so a snapshot swapped in
   under the same index can never be served the live day's work. */
let OIL_WORK: Map<OilEvidence, { d: any; work: Record<string, OilWork[]> }> | null = null

/** Run `fn` as a read-only pass, memoising each day's evidence for its duration.
 *  NOTHING INSIDE MAY WRITE `DAYS`, `INPUTS` or `PEOPLE`. A nested pass reuses
 *  the outer one and only the outermost clears, so the cache can never outlive
 *  the paint that opened it. */
export function oilReadPass<T>(fn: () => T): T {
  const outer = OIL_PASS
  if (!outer) { OIL_PASS = new Map(); OIL_WORK = new Map() }
  try { return fn() } finally { if (!outer) { OIL_PASS = null; OIL_WORK = null } }
}

/** THE DAY'S WORK, resolved against the evidence's own membership — the ONE
 *  walk the money, the seat default and the switch's state all read, so none of
 *  them can disagree with the others about what the day contains. On an issued
 *  day `ev.sent` is the frozen membership, so an ALL AVAIL event's people cannot
 *  change under the reader (§7.3). Uncached outside a read pass, exactly like
 *  the evidence itself (OSE-T-01). */
export function oilDayWork(day: any, ev: OilEvidence): Record<string, OilWork[]> {
  if (OIL_WORK) {
    const hit = OIL_WORK.get(ev)
    if (hit && hit.d === day) return hit.work
  }
  const work = dayOilWork(day, { expandAll: (_win, item) => (item && ev.sent[item]) || [] })
  if (OIL_WORK) OIL_WORK.set(ev, { d: day, work })
  return work
}

/** The evidence a DAY OBJECT carries: the frozen block on an issued snapshot,
 *  else the live candidate. This is what every reader should ask — inside a
 *  version preview (ui/html.ts withDaySnap) DAYS[di] IS the snapshot, so the
 *  same call returns the issued answer without the caller knowing. */
export function oilEvidenceOf(di: any, day?: any): OilEvidence {
  const d = day || DAYS[+di]
  if (d && d.oilev) return d.oilev as OilEvidence      // already frozen: nothing to compute
  if (OIL_PASS && d) {
    const hit = OIL_PASS.get(+di)
    if (hit && hit.d === d) return hit.ev
    const ev = oilEvidence(di, d)
    OIL_PASS.set(+di, { d, ev })
    return ev
  }
  return oilEvidence(di, d)
}

/* ---- serialisation (§9.2) ------------------------------------------------
   ONE ALWAYS-PRESENT AGGREGATE VALUE PER DAY, not one key per fact. The
   canonical diff ignores a key that newly APPEARS unless `rowKeyOf` recognises
   its owning row, and ignores one that DISAPPEARS — and `rowKeyOf` knows only
   the crew-slot families. So "one key per fact" would change the digest and
   still emit no amendment item. The whole block serialises to a single
   deterministic string under one synthetic per-day address instead: always
   present, always compared, byte-identical when nothing changed.

   THE COST, stated: the amendment item reads "the OIL decisions on this day
   changed" rather than naming each man. One line instead of twelve, and the
   history still holds the before and after through the edit log. A per-man item
   would need canonicalDiff taught the identity lifecycle — a bigger job, and
   not in this build. */
const sortedPairs = (o: any) => Object.keys(o || {}).sort().map(k => `${k}=${(o as any)[k]}`).join(',')

export function oilDecisionsKey(dec: OilDecisions | undefined): string {
  const d = dec || {}
  /* EMPTINESS, NOT PRESENCE (Fable, 21 Sep 26). This used to test whether the
     sub-maps EXIST, so `{ people: {} }` — a record with nothing in it — keyed as
     '||' where a day nobody had touched keyed as ''. A published day left in
     that state would read as changed for ever and offer an amendment with an
     empty OIL item. `tidy()` deletes empty maps on every UI write, so no path
     reaches it today; a parked plan, an undo snapshot or any future writer that
     skips tidy would. Cheaper to make the key itself safe than to rely on every
     writer remembering. */
  const items = sortedPairs(d.items), people = sortedPairs(d.people)
  if (!d.blanket && !items && !people) return ''
  return [d.blanket ? 'B' : '', items, people].join('|')
}

/** A FROZEN BLOCK WRITTEN BEFORE `stand` EXISTED HAS NONE, and the key must not
 *  read that absence as a change (Fable F3, 22 Sep 26 — and it was a real
 *  defect: every already-published weekend carrying a claim would have reported
 *  "1 pending" and gone unsigned the moment the owner opened the app, which is
 *  exactly the manufactured-amendment shape §9 of the hand-pass sheet is about).
 *
 *  CORRECTED, Codex rank 4, 22 Sep 26. The first repair guessed the missing
 *  value from `acc` — `'g'` meant `active`, anything else `unlanded`. That guess
 *  is the same false premise `3df527d` had to undo in the money reader: a day
 *  published while its row was CANCELLED keyed `active` here and `cx` live, so
 *  a day the money agrees is unchanged still offered an amendment nobody asked
 *  for. Two readers of one stored fact, and only one of them was repaired.
 *
 *  So the key reads it the way the money does — `effectiveStand`, which runs the
 *  OLD rule against the day being read, which for an issued block is the frozen
 *  schedule itself. One body, one answer.
 *
 *  `day` is optional only because the key is exported; both production callers
 *  pass it (`oilDelta` passes the frozen day, `currentBind` the live one). With
 *  no day and a legacy input there is nothing to reconstruct from, so the old
 *  guess remains as the last resort rather than a silent wrong answer. */
function standIn(day: any, i: OilInputEv): OilInputEv['stand'] {
  if (i.stand) return i.stand
  if (day) return effectiveStand(day, i)
  return String(i.acc || '') === 'g' ? 'active' : 'unlanded'
}

/** DOES THIS STANDING LET THE CLAIM EARN? The one body — the money asks it and
 *  so does the key, so they cannot disagree about a day. */
function standEarns(st: OilInputEv['stand']): boolean {
  return st !== 'cx' && st !== 'info' && st !== 'gone' && st !== 'elsewhere'
}

export function oilEvidenceKey(ev: OilEvidence | null | undefined, day?: any): string {
  /* THE KEY RECORDS WHAT THE DAY PAYS, NOT AN INTERNAL WORD (22 Sep 26). It used
     to serialise the standing itself, so a claim whose row simply moved to a
     week nobody has loaded — `active` to `unlanded`, both of which pay exactly
     the same — moved the key and offered an amendment with no money behind it.
     That is the manufactured-amendment shape this branch has now met three
     times. Two values, and they are the two the money makes: earns, or does
     not. Every standing change that moves money still moves the key. */
  if (!ev || !ev.earns) return ''
  const ins = ev.inputs.map(i => `${i.iid}:${i.person}:${i.type}:${i.acc}:${standEarns(standIn(day, i)) ? 'y' : 'n'}:${i.win ? i.win.join('-') : ''}:${i.ans == null ? '' : i.ans}`).join(',')
  const sent = Object.keys(ev.sent).sort().map(k => `${k}=${[...ev.sent[k]].sort().join('+')}`).join(',')
  return `${ev.iso}|${oilDecisionsKey(ev.d)}|${ins}|${sent}`
}

/** THE SAME KEY AS THE BUILD BEFORE `stand` WROTE IT — six parts per claim, not
 *  seven. Kept for exactly one purpose: a signature binding frozen by that build
 *  stores this string, and the only way to ask "is the day still what he signed"
 *  is to write today's content the way he saw it written. Never used to compare
 *  two live keys, and never written anywhere new. */
export function oilKeyBeforeStand(ev: OilEvidence | null | undefined): string {
  if (!ev || !ev.earns) return ''
  const ins = ev.inputs.map(i => `${i.iid}:${i.person}:${i.type}:${i.acc}:${i.win ? i.win.join('-') : ''}:${i.ans == null ? '' : i.ans}`).join(',')
  const sent = Object.keys(ev.sent).sort().map(k => `${k}=${[...ev.sent[k]].sort().join('+')}`).join(',')
  return `${ev.iso}|${oilDecisionsKey(ev.d)}|${ins}|${sent}`
}

/** DID JOB 2 CHANGE WHAT THIS DAY PAYS? The old rule looked for the request's
 *  row on the day being paid; the new one reads the ONE anchor row's standing,
 *  wherever it sits, and lets it govern every day the request covers. For most
 *  days the two agree. Where they do not — a Saturday covered by a request
 *  anchored on the Friday, which paid nothing before and pays a full day now —
 *  the day's money moved when the build changed, and no signature given before
 *  the change can honestly still cover it.
 *
 *  This is the guard Codex asked for in rank 4: an old binding is never accepted
 *  merely because it matches an old serialiser. */
export function oilUpgradeMovedMoney(day: any, ev: OilEvidence | null | undefined): boolean {
  if (!ev || !ev.earns) return false
  for (const inp of ev.inputs) {
    const before = !(!inp.asks || inp.acc === 'r' || !inp.win) &&
      (inp.acc !== 'g' || effectiveStand(day, { ...inp, stand: undefined } as any) === 'active')
    if (before !== oilInputEligible(day, inp)) return true
  }
  return false
}

/* ---- what the block says a day EARNS ------------------------------------- */

/** CAN THIS CLAIM EARN AT ALL, before any decision is asked? Structural
 *  ineligibility, which nothing overrides — an `allow` is permission to count
 *  real work, never permission to invent it (§9.1).
 *
 *  A claim the member never asked about, a DORMANT one (the scheduler removed
 *  it) or one with no readable window earns nothing, and never did. The part
 *  that was missing: a claim which LANDED on the programme is answered by the
 *  row it landed on, and the schedule half deliberately skips every `src` row so
 *  the claim owns it — so nobody was reading that row's own state. Cancel the
 *  row, or turn it ⓘ info-only, and the claim went on paying for work the
 *  schedule itself says did not happen (Astra + Fable, 21 Sep 26; fixed under
 *  R-2). §3.3 has always said anything cancelled earns nothing, and ⓘ is the
 *  same judgement the green bar makes about a row that gave a man nothing (O-1).
 *  A row that has been deleted outright takes its claim with it for the same
 *  reason. */
export function oilInputEligible(day: any, inp: OilInputEv): boolean {
  if (!inp.asks || inp.acc === 'r' || !inp.win) return false
  /* the ONE row's state, frozen onto the claim at projection — NOT a lookup on
     the day being paid, which is what made a multi-day request pay nothing on
     every day but the one its row happened to sit on (job 2).
     THE `acc !== 'g'` SHORT-CIRCUIT THAT USED TO SIT HERE IS GONE
     ([OIL-XWEEK-ELSEWHERE]): it answered "pays" before the standing was read,
     and since every `'g'` is cleared on a week swap it caught every request
     anchored in another week — including one whose row had been cancelled. The
     standing now decides alone, and it says `unlanded` for everything that
     genuinely never landed, which pays exactly as before. */
  return standEarns(effectiveStand(day, inp))
}

/** A BLOCK FROZEN BEFORE `stand` EXISTED CARRIES NONE, AND THE MONEY MUST NOT
 *  READ THAT ABSENCE AS "FINE" (Codex rank 1, 22 Sep 26 — and it refuted the
 *  reasoning in 195943e, which repaired only the key).
 *
 *  Left alone, the test above read `undefined !== 'cx'` and answered YES: an
 *  already-ISSUED day whose row had been cancelled started PAYING, with no
 *  amendment and the frozen schedule still saying the work did not happen.
 *  Money out of nowhere on a published record — worse than the phantom
 *  amendment it replaced.
 *
 *  The premise that made it — that `acc:'g'` meant "landed and paying" — was
 *  simply wrong: the pre-job-2 reader rejected cancelled, info-only and missing
 *  rows outright. So the old value is not guessed from `acc`. It is
 *  RECONSTRUCTED by running the old rule against the very day being read, which
 *  for an issued block is the frozen schedule itself — the one place that
 *  actually records what was true when the day went out. */
function effectiveStand(day: any, inp: OilInputEv): OilInputEv['stand'] {
  if (inp.stand) return inp.stand
  if (String(inp.acc || '') !== 'g') return 'unlanded'
  const row = (day && day.ground || []).find((g: any) => g && String(g.src || '') === inp.iid)
  if (!row) return 'gone'                                           // the old rule: no row, no claim
  return row.cx ? 'cx' : row.info ? 'info' : 'active'
}

/** The work that actually earns on a day, after the day's OIL evidence is
 *  applied: the schedule's own work minus what the decisions take out, plus the
 *  duty-and-commitments claims the evidence carries. `id -> spans`.
 *
 *  Both halves come from the SAME block, which is the whole point: on an issued
 *  day that block is the frozen document, so the money follows the schedule the
 *  squadron was given and nothing else. */
/** The people a SCHEDULER added to a request's landed row, beside the man who
 *  filed it — D18. Read off the day being paid, so a man standing on the row is
 *  credited on the day he is actually on it and not on every day the request
 *  happens to cover. Sentinels are never real work here; the requester is
 *  excluded because the input half already carries him. */
/** The men the SCHEDULER stood on a claim's landed row beside the requester
 *  (D18). EXPORTED because the mode has to ask exactly this question too:
 *  `oilEligible` used to fall back to `dayOilWork`, whose ground walk skips
 *  every `src` row whole, so an extra the money was paying was drawn INERT —
 *  "nothing measurable to earn from here" — with no item and no switch. The
 *  screen contradicted the money about a man's entitlement and offered no way
 *  to change it (walk find, 22 Sep 26). One body, so they cannot disagree. */
/** The row an accepted request landed on, if it is still live. A cancelled or
 *  information-only row is not work, so it has nobody on it for this purpose. */
function landedRow(day: any, iid: string): any {
  const row = (day && day.ground || []).find((g: any) => g && String(g.src || '') === iid)
  return (!row || row.cx || row.info) ? null : row
}

/** DOES THIS REQUEST'S ROW STAND A PLACEHOLDER ON IT — in the name box, or in
 *  the extras under it? ([OIL-SEATS-CAN-EARN] step 6, D46.) BOTH places, because
 *  a placeholder can sit in either and the first rewrite covered only the extras
 *  (Codex OSE-R2-04). A row that carries one needs its crowd resolved once and
 *  written down, so the day can hold those people still after it is issued. */
export function landedHasSentinel(day: any, iid: string): boolean {
  const row = landedRow(day, iid)
  if (!row) return false
  for (const v of [row.who, ...(row.more || [])]) {
    const id = whoId(v)
    if (id && isSpecial(id)) return true
  }
  return false
}

/** `crowd` is the people a placeholder on the row stands for, ALREADY RESOLVED —
 *  the day's own written-down membership (`ev.sent`), frozen on an issued day and
 *  live on the working copy. It is passed in rather than looked up here, because
 *  a body that resolved availability itself would let an ISSUED day's crowd move
 *  when somebody files leave, which is the one thing D44 forbids.
 *
 *  A NAMED man in the name box is deliberately NOT gathered. In every path the
 *  app has, that box holds the man who filed the request, and he is paid by the
 *  input half on his own answer; crediting whoever is in it would be a second
 *  change to who gets paid, with no case behind it. The box matters here only
 *  when it holds a PLACEHOLDER. */
export function landedExtras(day: any, iid: string, owner: string, crowd?: string[] | null): string[] {
  const row = landedRow(day, iid)
  if (!row) return []
  const out: string[] = []
  const add = (v: any) => {
    const id = whoId(v)
    if (!id || id === owner || isSpecial(id) || !PEOPLE[id]) return
    if (!out.includes(id)) out.push(id)
  }
  for (const v of (row.more || [])) add(v)
  /* the crowd joins the men the scheduler typed, rather than replacing them: a
     row can carry a name AND a placeholder, and both are people who were there.
     The requester is dropped by `add` — he is already in the input half, and
     paying him here would bury his own No under an ordinary yes. */
  if (landedHasSentinel(day, iid)) (crowd || []).forEach(add)
  return out
}

export function oilEarnedWork(day: any, ev: OilEvidence): Record<string, OilWork[]> {
  const out: Record<string, OilWork[]> = {}
  if (!ev.earns) return out
  const put = (person: string, w: OilWork) => { (out[person] = out[person] || []).push(w) }
  /* the schedule half — the frozen participants resolve every sentinel, so an
     issued ALL AVAIL event's people cannot change under the reader (§7.3) */
  const work = oilDayWork(day, ev)
  for (const person of Object.keys(work)) {
    for (const w of work[person]) {
      /* THE SPAN'S OWN DEFAULT, not a hard `true` ([OIL-SEATS-CAN-EARN] §4).
         The hard true was correct while every seat earned; from step 4 an SC
         spare, an AVALON or BB line and an AVALON desk reach this walk carrying
         `false`, and paying them would be silent money — the exact opposite of
         D24. `w.dflt !== false` rather than `w.dflt` so a span written by an
         older build, or by any future producer that forgets the field, keeps
         today's answer instead of silently ceasing to pay. */
      if (!earnsFrom(ev, person, String(w.item || ''), w.dflt !== false)) continue
      put(person, w)
    }
  }
  /* the input half — a claim earns on its own evidence, with the member's own
     answer as the default and the admin's three-state over the top (§9.1) */
  for (const inp of ev.inputs) {
    if (!oilInputEligible(day, inp) || !inp.win) continue            // dormant / cancelled / unreadable: nothing to allow
    const item = inputItemKey(inp.iid)
    /* the span carries the default that actually decided it, so a reader of the
       work can tell WHY a claim paid without re-deriving it: the requester's own
       answer for him, and an ordinary yes for a man the scheduler stood beside
       him on the row (D18). */
    const span = (dflt: boolean): OilWork => ({ s: (inp.win as any)[0], e: (inp.win as any)[1], src: (inp.type || 'Duty').trim() as any, item, dflt, via: 'input' })
    /* the man who FILED it: his own answer is the default, and the admin's
       three-state sits over the top (§2.2 / OIL10) */
    const own = inp.ans != null && inp.ans > 0
    if (earnsFrom(ev, inp.person, item, own)) put(inp.person, span(own))
    /* D18 (owner, 21 Sep 26 — "for 2 he should earn"): a second man the
       SCHEDULER puts on the row earns from it, the same as the man who filed
       it. Until now the claim owned the row and the schedule half skipped every
       `src` row, so he wore no bar and his tooltip said nothing about OIL.

       WHY IT IS A SPLIT AND NOT "STOP SKIPPING src ROWS" (Codex, 22 Sep 26):
       putting the row through the schedule half would put the REQUESTER through
       it too, where the default is yes — overriding his own No and paying him
       twice, once as unconditional work and again as the answered claim. So the
       requester stays here, on his own answer, and the extras are ordinary
       scheduled work on the SAME item: default yes, each with his own override,
       so taking one off never touches the other.

       The CLAIM's window, not the row's (Fable M6): an all-day request lands a
       row with no times at all, and reading the row would have left the second
       man on an all-day request unpaid — the mirror of the bug being fixed. */
    /* THE CROWD BEHIND A PLACEHOLDER ON THAT ROW IS ORDINARY WORK TOO
       ([OIL-SEATS-CAN-EARN] step 6, D46 — no carve-outs). It is resolved from
       the day's own written-down membership, so an issued day pays the people it
       went out with and not whoever happens to be free when it is read. */
    for (const extra of landedExtras(day, inp.iid, inp.person, ev.sent[item])) {
      if (!earnsFrom(ev, extra, item, true)) continue
      put(extra, span(true))
    }
  }
  return out
}

/** WOULD ANYBODY EARN ANYTHING ON THIS DAY AS IT STANDS? What the day's
 *  publish reminder asks before it speaks (§2.3). Reads the LIVE candidate,
 *  because the whole point is that the day has NOT gone out yet — so this is
 *  "there is money here waiting on a publication", not "money has landed". */
export function oilWouldEarn(di: any): boolean {
  const d = DAYS[+di]
  if (!d) return false
  const ev = oilEvidence(di)
  if (!ev.earns) return false
  const work = oilEarnedWork(d, ev)
  for (const p of Object.keys(work)) {
    if (uniformOil(envMin(work[p].map(w => [w.s, w.e] as [number, number])))) return true
  }
  return false
}
