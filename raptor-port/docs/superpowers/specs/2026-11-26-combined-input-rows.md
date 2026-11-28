# Combined input rows on the schedule — the plan put to Fable (chat 189, 26 Nov 26)

**Status:** his rulings D2770–D2780 recorded (§His answers); nothing is built. Fable reviewed it (his
call, 26 Nov 26) before he decides.

## The problem he found (26 Nov 26)

- An input filed for several people (one record, `people:[…]`) is drawn on the schedule two ways today:
  - **Ground Programme and Personal Inputs:** one row holding every puck, one title, time, remark and set of buttons
    (his D661, D743); a time or remark typed on it changes the input for everyone (D739, D740).
  - **Unavailable:** a row per man (his D737, 10 Oct 26 — "the list is read by name, each man's absence can end on its
    own day, and on that list a puck moved changes the input itself").
- On the Unavailable rows the two men LOOK like separate inputs, but:
  - Reject on either man's row takes the whole input out for both;
  - the input's own window (Inputs page, or a tap on it) changes it for both (D681, D748);
  - a time typed on one man's row splits him off onto an input of his own (built; the shared-row fix, PR 845);
  - the Leave War shows each man on his own row; a change to one man there splits him off too.
  His words: the admin "will not be tricked into thinking that these are individual inputs and inadvertently change
  the others if that's not the intent".
- On Unavailable a dropped puck can only REPLACE a man (`ui/inputedit.tsx reassignInput`) — there is no place to drop
  to ADD one. He reports Personal Inputs behaves the same (to verify). The survey below lists every row on Edit
  Schedule and the Scheduler Board where a second person cannot be added by a drop.

## The proposal

> On the schedule, an input filed for several people is **one row everywhere, Unavailable included**, except
> **medical** (HL, OML, ATT C, ATT B), which stays a row per man. On that row a scheduler **drops on the row to add**
> a person, **drops on a puck to replace** him, and **drags a puck off to remove** him. The Leave War keeps each man
> on his own row; a change to one man there makes him an input of his own.
>
> **Likewise Personal Inputs** (his words, 26 Nov 26: "likewise for personal inputs"): its line — already one line
> for a shared input — takes the same drop to add, drop on a puck to replace, drag off to remove.

Kinds this moves to one row under Unavailable: every leave kind (LL, OL, OIL, CCL, PL, FCL, EL, CL), overseas duty
(OD), course (CSE), attach (Attach), and any commitment moved there by "→ Unavail" or an Other whose "Goes to" is
Unavailable. Medical stays as today. (The agent's earlier recommendation was leave per man too; he weighed it and
leans to combining leave as well.)

## What it changes, as the agent sees it

- **Replaces** D737 (a row per man under Unavailable) except for medical; narrows nothing else he has said.
- **One man ending on another day:** today he is re-timed on his own row and split off. On a combined row a time
  typed changes everyone (D739) — so one man is changed on the Leave War (leave) or taken off the row and filed on
  his own. Rare for group leave (a stand-down) and group OD; more common for a course?
- **Reject:** one button, the whole input — what it does today, now honest on screen.
- **Drop to add / replace / remove** on the combined row, as on a Ground Programme row (D755, D757, D776, D861);
  each man added or taken off on a published day is one change waiting (D736).
- **Published days:** a combined row re-timed or taken off is one change waiting, one line naming its people (D736).
- **Leave War, OIL, warnings:** unchanged — each man is still counted on his own; the OIL question is the input's ONE
  answer (D762).
- **Reading by name:** a big group (6–8 men on an OD) is a tall row of pucks; the row grows downward (D743).
- **Faults it removes:** the family of faults from one input drawn as several rows (OUTSTANDING
  `[SHARED-ROW-HELD-LEFTOVERS]` (1), (2), (4)–(6)) stops arising for these kinds; it stays for medical.
- **Members:** who is in an input is changed only by its filer or a scheduler, each man free to take himself out; a
  member files for others only duties and commitments, never leave or medical (the Inputs rulings).

## The survey — where a second person cannot be added by a drop today

Checked on the running app (chat 189's survey helper, desktop 1536 and the Board's phone layout 402; its pictures in
the chat's scratchpad, the host opened the deciding ones). Wed 15 Jul of the demo week.

**A drop DOES add a second person on:** duty desks; sims (passengers; under an OFT's two seats; AMT BOX on Edit
Schedule); the Common Programme (ALL HANDS); every Ground Programme row, including a row from an input — where a drop on
a shared input's puck also JOINS, and on a one-man input's only puck REPLACES (D755 (2)). Dragging a man off removes
him; the last man of an input is refused ("…is the last on this input. Take the input off the programme, or delete it
in its own window.").

**A scheduler CANNOT add a second person by dropping on:**
1. **Every Unavailable row**, every kind (LL, OL, OD, CSE, Attach, Other, a Training moved there; ATT C and OML for
   one), one man or shared: a drop on the puck REPLACES that man only ("<new> is now unavailable instead of <old>");
   a drop on the row's empty part replaces on Edit Schedule but does NOTHING on the Board; the puck cannot be dragged
   off (`drag.ts applyDrop` Unavailable branch → `ui/inputedit.tsx reassignInput`).
2. **Every Personal Inputs line** (Edit Schedule, Board desktop and phone): a drop does NOTHING, silently, and its
   pucks cannot be picked up (`html.ts inGrp` / `board-html.ts sbInpRow`: `seatable=!acc&&…`). (He reported
   "replace only" there; the survey found no effect at all.) While a puck from elsewhere is dragged over it the
   Board shows "drop to unassign", and letting go there takes that man off his row — as built.
3. **Flying seats and SC standby seats** — one man a seat by nature (FCP / RCP); a drop on the jet line is refused.
4. **SANS AVAIL cards** — not a drop place, silently.
5. **The Board's sim seat grids (AMT BOX, an OFT with seats)** — no "+ add" strip: a man is added only on an empty
   spare seat, and a drop a little off it replaces the FCP.
6. **Medical for two people cannot be filed at all** — the window offers no "Several people" for ATT C or OML (it
   does for LL), so "medical stays a row per man" is already true at filing.

**Also seen (not proposals):** silent no-ops with no note (Personal Inputs, a SANS card, an Unavailable row's empty
part on the Board); the same gesture doing different things by page (Unavailable's empty part: replace on Edit
Schedule, nothing on the Board); on the phone a tap on a filled seat never arms it, so replacing someone there needs a
held drag, while an Unavailable puck arms on a tap; the Common Programme's drag-off leaves an empty place in its saved
list (`who: ["", "Saint"]`), the screen fine; the last-man refusal names doors that are not on the row in view.

## The questions for Fable

1. Is the plan sound — is the rule clear, the same everywhere, and does it leave fewer places for a fault?
2. What is missing: a case, a surface, a door, a reader of the change that this plan does not mention?
3. Is medical the right exception, and is there a kind on the list above that should also stay a row per man?
4. Anything in the survey that the same change should fix, or that should stay as it is (and why)?

## His answers (26 Nov 26, chat 189 — recorded on the scheduler page)

- **D2770** — a man whose dates or times differ from his group's gets a separate input of his own; no "separate him"
  button (against the three readers' advice, told to him).
- **D2771** — a man added to a several-day input is on every day of it; one who joined for only some days gets a
  separate input. The agent's reading, to confirm: taken off is every day too.
- **D2772** — every input row works as a sim row: a drop on a man's puck replaces him, an extra empty place adds —
  changing today's join on a shared Ground Programme row (D755, D776).
- **D2773** — a Personal Inputs line stays the accept / Reject list; a drop there is refused, pointing to the Ground
  Programme row; the Board's "drop to unassign" stays (sets aside his "likewise for personal inputs" of the same hour).
- **D2774** — a man dragged from a seat onto an input changes only the input; his seat is left as it was.
- **D2775** — medical stays one man's, a row per man.
- **D2776** — a drop on a medical row is refused with a short note saying why (always one man's).
- **Leave — his yes, 26 Nov 26 (chat 190), point 2 changed to his way first:**
  - **D2777** — a shared input is one row on the Unavailable list too: a group leave stays one input (one card, one
    row of its pucks); OD, course, Attach and a commitment moved there one row; medical alone a row per man (points 1,
    4, 5; it replaces D737, and point 4 restates D2775, D2776).
  - **D2778** (the Leave War page) — on the Leave War a group leave changes as one: a man's box opens the input's own
    window, a change there is for everyone, the box marked as shared (drawn first); to change one man alone he is
    taken off and given his own leave — no "his only" choice, and the war never splits a man off by himself. His
    question that changed it: a grouped input changes for the whole group; one man different = his own input (D2770
    kept whole). Today the war DOES split him off — this changes what is built.
  - **D2779** — a drop on any input row, leave included, adds or replaces as on a sim row, nothing asked, no note;
    Undo the way back; the man still told on his bell (D755, D757). Against the fresh Opus read's advice (point A
    below).
  - **D2780** — a man taken off a several-day input is off every day of it (D2771's reading confirmed).
  - **D2781** (round 1, question 6, his "B") — a group input may hold several papers, each marked as one man's and
    opened only by him and the admins; a security read before build (D1411), perms and the table list together.
- **Leave — as it was put to him in chat 189 (kept for the record; point 2 replaced by D2778):** (1) a
  group leave stays ONE input — one card, one row of its pucks (he weighed the split, one leave a man, and found it
  clutters the Inputs page; the agent came round to group); (2) on the Leave War, a group leave opened from one man's
  box and changed asks at Save "Change it for all 6" / "Change Ranger's only" — his only = his own copy, everything
  kept, one Undo (the deliberate split; it narrows D2770 for leave on the Leave War only); the Leave War's window opens
  the input's own window (his idea — it builds [LW-FULL-EDITING], D1724); (3) on the schedule drops edit who is on any
  input as a sim row — leave included, with NO question and NO note (his: a drop says nothing, the puck is the sign —
  D851, D854; the top bar's Undo is the way back); (4) medical one man's (D2775, D2776); (5) OD, course, attach,
  moved commitments one combined row; (6) the reading of D2771: a man taken off is off every day too.

## The three reads (26 Nov 26) — all "sound with changes"; the plan is NOT ready to rule on as written

Fable first (his call), then — on his word "this task is high risk… we also need astra and opus to review" — Astra
and a fresh Opus, each blind to Fable's read and to each other's, given one brief
(`../briefs/2026-11-26-combined-input-rows-read-brief.md`). Whole reports: Fable
`../briefs/2026-11-26-combined-input-rows-fable-read.md`, Astra `../briefs/2026-11-26-combined-input-rows-astra-read.md`.
The fresh Opus read's transcript file came back empty (the known trap); its points, condensed by the host:

**Opus (condensed):** (a) one row is sound; (b) what a drop does is not, for leave, and unspecified for several-day
inputs — settle (b) kind by kind. A: leave approved on the Leave War is one man's already (`engine/inputs.ts LW_OWN`);
a replace on a leave row hands Ranger's approved leave to Hex with nothing asked; a drag-off cancels a leave; an add on
OIL leave spends the added man's OIL — recommend no people-changing drop on leave rows, refused with where leave is
changed. B: several-day inputs — who is in it is every day (D759); a drop or drag-off rewrites past published days —
ask first ("all 5 days?") or refuse. C: one man back early — a control giving him his own copy (`ownInputOf`),
drawn first. D: three doors already split a man out by themselves (a medical cutting a shared leave, posting
out/archive/delete, the Leave War's remark window) — clashes with D735; place his row under the combined one, Undo
rejoins. E: a transfer mid-input (D2163) — the agent to check. F: a borrowed 149 man dropped on a 142 OD — refuse. G:
a man added who is already away — refusals must say why on the schedule; OD over a course — decide. H: ALL / ALL AVAIL
stay refused on Unavailable. J: LATE is per man — mark the late man's puck. K: the waiting mark (D1784) per puck for a
man added. L: which kinds carry Reject; "→ Ground"/"→ Unavail" now move one row. M: OIL — `oilFirst` for a man added.
N: a warning lights his puck, not the row. P: phone — a guaranteed empty add place (D743's spare line), one tap rule,
D947 named. Q: the Board's Personal Inputs panel is the "drop to unassign" place and only an audit echo of rows the
Ground Programme already carries — keep it the accept/Reject list with a refusal pointing to the Ground row, or move
the unassign place. R: drawings first (D1625), words Opus then Fable (D2441). S: say which per-man row code retires.
Rulings it touches, not named: D735, D739 r.2/D681, D743 r.9, D947, D1784, D1586/D1620, D861, D1625, D2441, D2163,
D2101/D2146, D2133, LW_OWN.

**Where they agree:** one row is right; medical stays one man's (already true at filing); leave approved on the Leave
War is one man's and must be decided; several-day inputs are the biggest gap; one man with other dates needs a
deliberate "separate him" action (one save, one Undo), never a split while typing; the Board's Personal Inputs panel
collides with "drop to unassign"; ALL / ALL AVAIL limits kept; LATE per man; drawings first; a FULL bug check.
**Where they differ:** a drop on a named puck of a shared row — Fable: keep the Ground Programme's (it JOINS; only a
one-man input's sole puck replaces); Astra: replace on any named puck, with a separate add target. Leave — Fable: never
shared (filed for several = one each); Opus: one row but no people-changing drops; Astra: combine shared leave filed on
the Inputs page, Leave-War-approved leave stays one man's. Astra alone: a man dragged from a seat onto an input should
NOT swap the displaced man into that seat (today some replaces do); an allowed ALL AVAIL drop should move the whole
input to the Common Programme as its window does.
