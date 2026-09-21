# [OIL-AUTO-REMOVE] — owner decisions and the design as it stands (21 Sep 26)

**Status: DESIGNED, NOT BUILT.** This is the context doc for `[OIL-AUTO-REMOVE]` in
`OUTSTANDING.md`. It records what the owner ruled in the 21 Sep design session, the
verified facts about how OIL works today that those rulings rest on, and the two jobs the
session split out. Written so a fresh session can build without re-deriving any of it.

Companion mockup (the owner's, private): an artifact canvas "OIL switches on the board" —
board, panel and workflow. It is **one revision behind** these decisions: it still shows the
per-row `OIL` button and the separate panel, both of which the owner's mode ruling replaces.
Redraw before using it.

---

## 1. Where this started, and how the question changed

The original ask (21 Sep 26): *"Should we allow the admin to remove the OIL credited
automatically from the schedule? I think we should yeah."* Three shapes were put to him — a
standing refusal, changing the evidence, or an OIL-tracker balance correction.

**He rejected the framing** and proposed a better one: ask about the EVENT, at the source,
rather than fighting the derived credit. That is the design below.

Two independent reviews (the session's own analysis and Fable) converged on the same
architecture: per-event primary, the day as a FACT not a stamp, per-person as
per-person-per-DAY, and nothing on the puck.

---

## 2. THE OWNER'S RULINGS (21 Sep 26) — build to these

### 2.1 The interface is a MODE on the scheduler board

An **"OIL Earn"** button at the top of the day. Weekend / public-holiday days only.

- Pressed, it goes green and the board enters OIL mode.
- Every person who would earn OIL that day wears a **glowing green puck**.
- By default on a weekend/PH that is everyone who earns under the existing rules.
- Tap a puck to take the glow off; tap again to put it back.
- Toggle the button off and the board returns to normal.

**This replaces** the per-row `OIL` control-strip button and the separate OIL panel that
earlier drafts proposed. One door, not three.

**The mode must carry these, agreed in session:**

1. **Per-person-per-EVENT unclicking.** Tapping a man's puck on one event removes THAT
   event's hours from his day; his other events keep glowing and keep counting. This was
   the owner's explicit refinement of the first draft (which cleared all of a man's pucks
   at once).
2. **The figure is recomputed on what is left, first start to last end, gaps included** —
   the owner's 29 Aug 26 rule, **re-confirmed 21 Sep 26**: *"yes it should be start till end
   hours"*. NOT the sum of the remaining events. Consequence the owner was shown and
   accepted: unclicking one puck will often change nothing (another event still spans the
   day), and occasionally a one-hour event will cost half a day (it was holding the far end
   of the envelope).
3. **Each puck shows its own figure live in the mode** — **FO** or **HO** in place of the
   qualification letter — so every tap shows its consequence immediately. This is the
   mitigation for (2) and is not optional: without it the mode looks broken.
4. **Full day vs half day must be visually distinct.** Solid green glow = full day, green
   outline only = half day.
5. **Tapping the ITEM (its name, not a puck) toggles the whole item**, and everyone's glow
   recalculates live. Needed because unticking nine people is not the same as marking the
   item — a tenth person added later would otherwise earn silently.
6. **A sentinel (ALL / ALL AVAIL) opens into real pucks inside the mode**, or its people
   cannot be tapped at all.
7. **A whole-day blanket** ("nothing today earns") is a FACT about the day, not a stamp on
   the rows, so it covers anything added later. Row and person marks survive underneath and
   come back when it is turned off.

### 2.2 The member's OIL answer is kept, and becomes the default glow

**Owner, 21 Sep 26:** *"The separate OIL question i think could still be retained and it
controls if the input is glowing or not when the Oil earned button is pressed. This is
because the OIL question is posed to the member, so we delegate to the member to decide as
well, but ultimately the admin can still overwrite. Makes the admin job easier."*

So: the member answers the OIL question on their own input → that answer sets whether that
input's puck **glows by default** in the mode → the admin can override it by tapping.

### 2.3 Input OIL now WAITS for publication

**Owner, 21 Sep 26:** *"In that case we make it a point to publish everyday so that silently
earn nothing wont happen."*

This is a CHANGE. Today input-earned OIL credits the moment the input is accepted and
answered yes, without the day ever being published (§3.4). Under this ruling all OIL —
schedule-earned and input-earned alike — lands on publication, which is what lets the board
mode be the single door.

**The risk he accepted, and the mitigation he chose:** a weekend nobody bothers to publish
would pay nobody. His answer is a standing practice of publishing every day, **plus a standing
reminder to all schedulers** — RULED 21 Sep 26: *"ok u can set it as a reminder to all
schedulers."* Build the backstop: a weekend or PH day carrying accepted work and not yet
published tells whoever is looking.

### 2.4 Overseas duty

**Owner:** *"Overseas duty will show on unavailable on the schedule as OD."* It never lands
on the ground programme, but it is on the day, in the Unavailable block. The mode must
reach it there.

### 2.5 A removed input earns nothing

**Owner:** *"If the input is rejected off the programme, it should be counted as there isint
an input to earn any OIL there even if the member says that this input on a weekend/PH earns
OIL."*

Confirms today's behaviour: a dormant input (`acc === 'r'`) is skipped by the OIL pass. The
member's own yes does NOT survive the scheduler taking the row off the programme. No change
needed — pin it with a test so it is never "fixed" the other way.

### 2.6 ALL AVAIL / ALL — a new definition (SEPARATE JOB, see §5)

**Owner, 21 Sep 26**, verbatim: *"ALL Avail and ALL pucks should not consist of ground crew
by default. only SANS that are planned on the programmed on that day with us should be
included. Like if they fly, then they should be counted as part of all avail/all. people on
ATT B only should still be included. Those on Training, Course, Meeting, Appointment, Duty,
Personal, Other, planned for anything on the schedule that conflicts in timing with the rest
of the schedule is not part of All avail and ALL."*

Resolved against the current behaviour (§3.5), that is:

| | today | the owner's rule |
|---|---|---|
| Ground crew | out | **out** (no change) |
| SANS | out, always | **in when planned on our programme that day** (e.g. he flies with us) |
| ATT B — "no flying, may still work" | out | **in** |
| Other medical, all leave, overseas duty | out | out (no change) |
| Not posted in / posted out / archived | out | out (no change) |
| Fly with | out | out (no change) |
| Training, Course, Meeting, Appointment, Duty, Personal, Other | **in** | **out when the commitment overlaps the row's window** |
| Already planned on the schedule at that time | **in** | **out when it overlaps the row's window** |

**Ruled by the session, not the owner (flag if reopened):** a sentinel never blocks another
sentinel — only NAMED people count as "planned for something". Otherwise two overlapping
ALL AVAIL rows each empty the other.

**RULED 21 Sep 26 — they stay identical, deliberately.** Asked whether ALL should mean
everybody regardless, the owner said no: *"U cant possible force ALL to join, its just like a
best effort to join kind of thing. even if people are not available. So the mechanism is still
the same, filters those out who are actually not available."* So ALL and ALL AVAIL keep ONE
behaviour and two names. **Do not "fix" the duplication** — it is the owner's call, not an
oversight. Both sentinels take the §2.6 definition.

### 2.7 Seeing inside a sentinel puck

Owner asked for hover on desktop and something equivalent on the phone.

**Recommended, not yet ruled:** put the count on the puck (`ALL AVAIL · 9`) and make the
COUNT the tap target, opening a list. One control, identical on both platforms; desktop hover
shows the same list as a convenience, never as the mechanism. Do NOT take over tapping the
whole puck — that already arms the slot so a scheduler can swap the sentinel for real people.

### 2.8 Rulings carried from earlier in the session

- **Amendment cost.** Marking an item or a person on an already-published day **goes out as
  an amendment**. An earlier session ruling that it should not was WRONG and is withdrawn:
  the OIL pass reads the ISSUED snapshot, so a mark that is never published moves no money at
  all — the board would update and the credit would not.
- **Colour.** The marked state is NEUTRAL (the plain lit-button fill), never amber or red.
  Amber means "look at this" and red means a clash; a deliberate scheduler decision is
  neither, and borrowing either would make every family day read as a problem.
- **Only where it can earn.** Every one of these controls is drawn only on weekends, public
  holidays and off-day-tagged days. Five days a week the board is unchanged.
- **The one case none of it covers**, and its cheap answer: two men on one briefing, one
  presenting (work) and one attending on his own time. Split the item into two rows and mark
  one. Rows are cheap and the split is the record of why they differ.
- **`ⓘ` info-only silently kills OIL today** and its wording does not say so — and it also
  makes the people look FREE, which is why it is the wrong tool for this. Extend its wording
  in the same change.

### 2.9 How the exception SHOWS — ruled 21 Sep 26

The owner pushed back on tagging rows: *"How does the NO OIL mark show on the schedule? Why not
show OIL instead of NO OIL? I am afraid that the schedule will be very cluttered."* Right on the
clutter, and the answer to the second half is that on a weekend nearly everything earns — marking
the EARNERS means marking almost every line, marking the exceptions means marking almost none.
The rare thing gets the mark.

**SUPERSEDED THE SAME DAY by §2.10 — the owner reversed to showing OIL POSITIVELY.** The
reasoning above (mark the rare thing, one line not per-row tags) stands as the record of why the
NEGATIVE marking was shaped that way; the shipped answer is §2.10. Kept because if positive
marking is ever dropped, this is what it reverts to.

- One LINE on the day, weekend / PH only, only when there is an exception; no per-row tags on the
  issued schedule; a per-person exclusion never appears there at all.

### 2.10 OIL IS SHOWN POSITIVELY — a green EDGE on the puck (owner, 21 Sep 26, FINAL)

The owner asked to see OIL shown by default rather than its absence: *"can u show a mock up if OIL
is default shown on the schedule? Like a green little OIL tag on the applicable pucks"*. Three
treatments were drawn on one real Saturday (14 pucks) — today's nothing, a green `FO`/`HO` chip on
the puck, and a green edge bar. **He chose the EDGE: "c looks good."**

- **A green bar down the LEFT edge of the puck.** Full height = a full day. Half height (bottom
  half) = half a day, drawn a shade PALER as a second cue — height is the structural signal that
  survives colour-blindness, the tint is the one that survives being read alone with nothing to
  compare against. Costs NO width, so no callsign clips and the puck geometry is untouched (the
  measured contracts in `scheduler.css` and the geometry gate are unaffected).
- **Weekend / public-holiday days only.** Five days a week the schedule is byte-identical.
- **It is the MAN'S DAY figure, repeated on every puck he wears that day**, never what that one
  event earned. DASH on four rows shows the same bar four times = one full day, not four. This was
  the trap that would have made positive marking actively wrong, and it is fixed by what the mark
  MEANS, not by showing it less.
- **It RETIRES the `NO OIL` marking entirely** (§2.9). If green means earns, no green means earns
  nothing, and no sentence is needed. The day line and the remarks tag both go.
- **It needs teaching once** — put it in whatever legend the schedule carries, and give the bar a
  hover title naming the figure in words.

**COLLISION FOUND, and the call made — raise it again if a reviewer disagrees.** The crew palette
ALREADY draws a green left inset on a puck: `.rpuck.standby .puck{box-shadow:inset 2px 0 0
var(--ok)}` (`scheduler.css`) means "on standby", with a grey twin for "busy". Same colour family,
same side, and a scheduler sees the palette and the board at once on a Saturday with an SC wave.
**The call: the OIL bar is a 4px SOLID bar, the standby mark stays a 2px INSET, and the OIL bar
exists only on weekend/PH days** — different weight, different rendering, different context (a
strip you drag FROM vs a row you read). The palette's mark is NOT changed for this. If a reviewer
judges that too subtle on a money-bearing mark, the fallback order is: a distinctly different green
for OIL, then the bottom edge (nothing uses it; the right edge is taken by the SANS purple).

---

## 3. VERIFIED GROUND TRUTH (read before changing anything)

All of this was read out of the code on 21 Sep 26, not remembered.

### 3.1 The pass, and when it runs

`runOilPass()` — `src/leavewar/sync.ts:1042`, "wire 4". Not on publish: a full reconciliation
on **every notify from either store**, plus once at boot. Forward half mints
(`ingestDutyCredit`), reverse half sweeps (`clearRaptorCell`, `store.ts:3523`) any `oil:'auto'`
credit it can no longer justify. A hand-typed award (`oil:'manual'`) is a separate record and
is never touched by the sweep.

Desired cells: `desiredOilCells()` — `sync.ts:785`.

### 3.2 The measure

`dayOilWork()` — `src/engine/oil.ts:101` — collects each person's spans tagged FLT / SIM /
Duty. `envMin()` (`oil.ts:69`) is FIRST START to LAST END, gaps included. `uniformOil()`
(`oil.ts:76`): `VCONF.oilFullMin = 361`, so exactly six hours is still HO; 6 h 1 min is FO.
Flying seats are report (T-O − `reportLead` 180) to land + `debrief` 120.

### 3.3 What earns nothing by DEFAULT today (the owner's existing rulings)

Days: only a Saturday, Sunday, the war's public holiday, or a day tagged "off day"
(`isNonWorkingISO`, `sync.ts:601`) — **and the day must be published** for the schedule route.

On a day that can earn, these never count:
- An SC **spare** (standing by at home, not at work) — and a spare aircraft or spare line.
- **AVALON and BB** — the whole wave AND the desk block it brings (`saExemptKind`).
- Anything **cancelled** (`cx`) at any level.
- Anything with **no readable start and end** — "based on what timing was written"; money
  must not come from a guess. This is the `blindDesks` / publish-warning case (`oil.ts:178`).
- A **zero-length** row.
- A ground row carrying **`src`** — it came from an accepted input, so the input's own OIL
  answer decides instead (a Saturday dental appointment must not mint OIL uninvited).
- An input whose OIL answer for that day is an explicit **0**.
- An **`info`** (ⓘ) row, ground or Common Programme.
- Sim `who` free text — not a person.

### 3.4 The publication asymmetry (what §2.3 changes)

- **Schedule route**: needs `dayApproved(di)`, and reads `daySnapOf(di, dayCurVer(di))` — the
  ISSUED snapshot, never the live draft.
- **Input route** (`sync.ts:856-879`): needs only that the input is not rejected, `oilAsks`
  its type, the day is held by a war, is non-working, and is not protected. **No
  `dayApproved` check.** So today an accepted input credits before publication.
- Both routes **pool into one envelope** per person per date — a man with both is credited
  once, and the credit is labelled `via: 'schedule'` because that is the stronger evidence
  (owner, 21 Sep 26).

### 3.5 `availableFor` today — how a sentinel resolves

`sync.ts:672`. Walks `PEOPLE` and drops: `special`, `archived`, `pers` (ground crew), `san`
(SANS); anyone failing `inSquadron(lw, iso)`; and anyone with an input where `isAway(inp)` and
the dates cover the ISO and the window overlaps.

`isAway` (`engine/inputs.ts:263`) = `isUnavail && !isSansAvail && !isUpchit`, OR a `Fly with`
with `acc` of `'g'` or `'u'`. `isUnavail` = any type whose group is not `'act'` — so all leave,
all medical (**including ATT B**), and OD.

**It never consults the schedule.** `src/engine/avail.ts` (`busyWindows`, `dayEngaged`,
`dayAway`) already knows who is busy on the programme, and the OIL expansion does not use it.
The two notions of "available" disagree today; §2.6 is what makes them agree.

### 3.6 Input types, groups and landing

`INPUT_META`, `src/engine/inputs.ts:77-153`.

- **`grp:'act'`** — Training, CSE, Meeting, Fly with, Personal, Appointment, Duty, Other.
  These **auto-land on the ground programme the moment they are filed**
  (`autoAcceptInput`, `slots.ts:422`; `acceptInput`, `slots.ts:344`) — no scheduler action.
  On an already-published day the interactive paths land it on the WORKING copy as a pending
  amendment; the issued face stays frozen (owner, 16 Sep 26).
- **`grp:'leave' | 'med' | 'upchit' | 'sans' | 'duty'`** — never land; they live in the
  Unavailable block.
- **`oilAsks(t)` = `restsInput(t)`** (`inputs.ts:389`) — the crew-rest set: Training, CSE,
  Meeting, Fly with, Appointment, Duty, **OD**, Other. Personal and SANS Availability are
  excluded. So **OD asks for OIL but never lands on the programme** — the one OIL-earning
  input with no row.
- `acc`: `'g'` landed on the ground programme · `'u'` filed under Unavailable · `'r'` removed
  by a scheduler, dormant, flags nothing, **earns nothing** (§2.5).

### 3.7 What is live after publication

- **Frozen, needs an amendment**: the day's issued face — waves, formations, sims, duty desks,
  ground programme, Common Programme, times, who is on what — and the OIL earned off it.
- **Still live, no amendment**: everything on the Leave War (bids, leave, credits, the OIL
  tracker, balances); personal inputs; input-earned OIL (until §2.3 lands); the working copy's
  own warnings. A new input on a published day raises the pending count and stays off the
  issued face until published.

### 3.8 Record shapes

- Credit: `CreditRec` — `src/leavewar/engine/warrecs.ts:57-108`. `oil: 'auto' | 'manual'`,
  `via: 'schedule' | 'input'`, `spans`, `note`, `givenBy`, `days` (award only). Person and date
  are the ADDRESS, not fields. At most one auto + one manual per address.
- **Hard constraint**: `readRec` returns null for an unknown `kind` → `readWars` throws away
  EVERY war and the demo re-seeds (`store.ts:725`). A new `WarRec` kind is not
  forward-compatible. New facts belong on the DAY record (so they ride the snapshot) or in
  their own store, never as a new war-record kind.
- The three new marks all belong on the day record so they reach `dayOilWork(snap.d)` for free.

---

## 4. Does the Leave War still need a removal door?

**ANSWERED 21 Sep 26: NO — do not build one.** The owner asked for the recommendation and it
was given: with the item switch, the day blanket and the per-person exclusion all on the board,
every case where the DAY'S EVIDENCE is wrong now has a door. The one case that is not about a day
— the balance is wrong for some other reason — is already served by the OIL tracker's correction,
which exists and needs no build. And a removal on the war would let the war DISAGREE with the
schedule: a man with no credit, a published Saturday saying he worked, and nothing on the day
explaining the gap — the exact drift the house rules name.

**The cost, stated to him and accepted:** correcting OIL on a published day costs an amendment.
Revisit only if that proves too heavy in daily use; do not pre-build a second door for it.

Note that shape 3 from the original three (an OIL-tracker balance correction) **already exists
and needs no build** — `CreditForm` with the `±` chip writes a dated, signed, reasoned
correction. Its weaknesses, which is why it was not recommended: the day still reads as earning
forever, and the correction does not follow its evidence, so if the schedule later changes and
the automatic credit disappears on its own, the correction stays behind and subtracts twice.

---

## 5. What this session SPLIT OUT

**`[ALL-AVAIL-REDEF]` — the new ALL AVAIL / ALL definition (§2.6) is its own job.** It changes
who gets **planted** on a row, not only who gets credited, and it closes a disagreement between
two existing notions of "available" (§3.5). It needs its own test pass and its own hand test in
the running app. Do NOT bury it inside the OIL build.

It also already overlaps `[LW-COMMIT-MANNING]` in `OUTSTANDING.md` — the other half of N17,
where duty-and-commitment inputs do not reach the Leave War manning at all. Same root: the app
has more than one answer to "is this man available". **Consider doing them as one job.**

**A bug found while answering, not yet filed as its own item:** a man files Training 09:00–17:00
on a Saturday and the owner answers **no** to its OIL question; a Common-Programme family day
10:00–14:00 carrying ALL AVAIL sweeps him in and credits him anyway, for an event he is not at,
after the answer was no. §2.6 fixes it as a side effect. If §2.6 is deferred, this needs its own
guard.

---

## 6. Build order, when it is built

1. `[ALL-AVAIL-REDEF]` first, or at least decided — the OIL mode's sentinel expansion depends
   on what ALL AVAIL means.
2. The three day-record marks + the pass reading them (item, day, person-per-event).
3. The mode on the board: the button, the glow, the live FO/HO, the sentinel expansion.
4. §2.3's publication change + the publish-reminder warning.
5. The `ⓘ` wording fix.

**Model guidance:** the plan still needs a Codex (Astra) red team — Fable has reviewed it, Codex
has not, and the owner's standing rule is both providers before building. Build on **Opus, high**;
it touches the pass, the day record, the board renderer and the crew-picker seam.
