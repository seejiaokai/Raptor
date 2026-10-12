# `[ALL-AVAIL-AS-MEMBER]` step 3 — ALL AVAIL / ALL as one of an input's own people: the check at this stop (12 Oct 26)

**What was built:** the plan's step 3 (`docs/superpowers/plans/2026-10-11-one-rule-plan.md` §5, §4.1, §4.4, §4.5, §4.7,
§4.8; what was built and found — its §10). ALL AVAIL / ALL may be one of an input's people (D750, D753, D755, D757):
"Several people" offers the two; put on an input's row it joins, taken off it leaves, and it stays when anyone else
leaves; everyone in the input — the named people and the men behind the puck — follows the input's one OIL answer
(D762); on a published day each of those acts is one change waiting (D736). Branch `claude/all-avail-as-member`;
nothing merged; no pull request.

**This is a step of a batch, not the job's check** (D485). The one-rule job gets ONE full check, after its last screen
is built (the plan's §7 is its roll-call; Fable's twenty-one scenarios its walk's start; Fable reads the finished code —
D764). What follows is what was checked of step 3 by itself, and, as plainly, what was NOT. He asked to be shown this
stop before step 4, then — going to sleep — lifted the stop (D766): the run goes on, and this sheet is what he reads.

## 1. The eight questions, and the tier

| # | Question | Answer for step 3 |
|---|---|---|
| 1 | OIL / what a man is owed | **YES** — the men behind ALL AVAIL follow the input's answer; a switch-off ends when its man leaves |
| 2 | The published record | **YES** — the count of changes waiting when ALL AVAIL is put in or taken out |
| 3 | Saved data | **YES** — an input's list may hold a placeholder beside people; `leftAt` is written when a person leaves |
| 4 | A shared drawer | **YES** — the row, the card, the bar, the picker, the To go out list name such an input |
| 5 | A new gesture or mode | **YES** — ALL AVAIL dropped on an input's row; two new pucks in "Several people" |
| 6 | A new surface | NO |
| 7 | Roles | **YES** — who may change an input that holds a man and ALL AVAIL |
| 8 | The warning list | NO — the rules read a line a NAMED person, as before; a placeholder makes none |

**Tier: FULL**, by the facts — and FULL is what the job gets, once.

- **Done at this stop:** the whole gate set (§4); every older test that pinned "filed on its own", or was waiting for
  this step, re-expressed by three helpers who did not write the build, each with a second scenario pass of its area
  (§3); a short LOOK at the running built app by real presses, a desktop and a phone (§2).
- **NOT done at this stop — the job's own check does it:** the roll-call of every surface (the plan's §7); the walk
  from Fable's twenty-one scenarios; the break tests; a member's and a guest's face on screen; a published day on
  screen; OIL Earn and the ALL AVAIL window on screen with a person and ALL AVAIL on one row (carried here by tests
  that mount the app and press its controls in jsdom — no layout, no picture); print and the PDF; the CSV; Fable's
  read of the finished code; a ChatGPT read (his call at the merge — D761, D764).

## 2. The look (the sizing step — D607)

1. **Type of change:** C, D, G and H — a gesture's meaning (a placeholder dropped on an input's row), a thing drawn in
   several places, the saved shape, who may.
2. **What only a look could find:** whether the two new pucks in "Several people" can be seen, reached and pressed at
   both sizes; whether the greyed state reads as greyed with its reason; whether the row draws the placeholder last
   with its counter; whether the notes say what happened. What tests carry: every refusal, the OIL answers, the counts
   on a published day, the two routes (T1) — `ui/phmember.test.tsx` and the helpers' files, most through the app's own
   doors, some by direct fixture (the engine files).
3. **What the ledger says:** step 2's short look (the same type) found nothing; the old tests found twelve faults.
   The job's wide walk is still owed.
4. **Size chosen for THIS stop:** short — the host alone, one scripted browser on the built bundle, a desktop and a
   phone, ten presses or so a size — because the wide walk is the job's and would be walked twice. A test that changes
   the data directly is not counted as a look.
5. Its row is in `docs/walk-ledger.md`.

Script: `scripts/handpass/onerule-step3-look.mjs`, on the built bundle (the served bundle's name checked against
`dist/index.html`). Pictures: `2026-10-12-one-rule-step3/`.

| # | What was pressed | What the app answered | Picture |
|---|---|---|---|
| 1 | Inputs calendar, 15 Jul, "+ Input", "Several people" | the two pucks ALL AVAIL and ALL under "Whoever is free that day", above Pilots | `desk-1…`, `phone-1…` |
| 2 | two people picked, then ALL AVAIL; a title; Add | the count line reads "2 picked + ALL AVAIL"; ONE input stored holding the two and ALL AVAIL | `desk-2…`, `phone-2…` |
| 3 | a second new input, the kind turned to a leave | the two pucks greyed and not pressable; under them "ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and Other" | `desk-3…`, `phone-3…` |
| 4 | Edit Schedule, that day | ONE row: the two people A to Z, then ALL AVAIL with its counter (25) | `desk-5…`, `phone-5…` |
| 5 | the other input's "+ add" armed, ALL AVAIL tapped in the crew list | it JOINED ("ALL AVAIL added to Kit check"); one row, three pucks | `desk-6…`, `phone-6…` |
| 6 | "+ add" armed again, ALL tapped | refused: "This input already has ALL AVAIL"; nothing changed | `desk-7…`, `phone-7…` |
| 7 | (desktop) both named pucks right-clicked off, then ALL AVAIL | the two LEFT, ALL AVAIL stayed; alone it is refused — "ALL AVAIL is the last on this input — use ✕ …" | `desk-8…` |
| 8 | Inputs calendar, the day opened | the cards name "Nomad, Ranger, ALL AVAIL" and (desktop, after step 7) "ALL AVAIL"; the month's bar reads "2 + ALL AVAIL · Range brief" | `desk-9…`, `desk-10…`, `phone-9…`, `phone-10…` |

No console error, page error or failed request at either size. Opened and looked at by the builder: `desk-2`, `desk-3`,
`desk-6`, `phone-2`, `phone-5`.

**What the look found — one fault, fixed and pinned:** after step 2 the note read "Input added for 3 people" for two
people and ALL AVAIL. The window's sentences now count the people and say the placeholder beside them
(`ui/inputedit.tsx howMany`, pinned equal to the calendar's own wording by `ui/phmember.test.tsx`). **The pictures were
taken before that fix and before §3's fixes** — `desk-3` still shows the old note; none of the later fixes changes what
these pictures show otherwise. (The red rings on two pucks are those men's own clashes on the demo day — as they
should be.)

## 3. What found the faults

**The builder's own new tests** (`engine/phmember.test.ts`, `ui/phmember.test.tsx`, `ui/phpick.test.tsx`) found one:
on a published day, ALL AVAIL put on an input's row — or an input filed holding it — read TWO changes waiting (the
placeholder, and "what this day earns" for the men behind it), on a weekday too. The crowd that arrives with an input
is that input's change now, the mirror of the crowd that leaves with one (`engine/publish.ts`).

**The older tests, re-expressed by three helpers under the four-choice brief** (rule survives / a named ruling changed
it / old data, kept as a legacy case / subject gone, what is true now pinned; never skipped or loosened; a product
fault is reported, not pinned), about 190 cases added, found EIGHT more in the builder's first pass — each fixed, each
pinned by the case that found it:

1. The window offered Save and Delete to a member who is the only named person beside ALL AVAIL, and the save refused
   him. Such an input is nobody's own: he reads it and may take himself out (`engine/inputs.ts onlyNamed` — D755 (3)).
2. A scheduler's OIL switch-off about a man lived on after he left an input that also holds ALL AVAIL — so the same
   people, reached in two orders, earned differently.
3. …and a switch-off the app had voided (the man put on the row by name) came back when he was taken off again.
   Both: leaving is a holding of its own (`engine/inputown.ts` — `hand` moves on, `leftAt` says where).
4. An input under Unavailable, turned into ALL AVAIL's in its window, was refused; it goes back onto the programme at
   the save, as before the step.
5. The OIL question was headed "ALL AVAIL +1" — a placeholder never leads.
6. "Placed by Saber for 2 people" for one person and ALL AVAIL.
7. The picker told a reader — who can pick nothing — why ALL AVAIL could not be picked.
8. The To go out list still said "ALL AVAIL came off with him" / "the puck on Ranger place … came off with Ranger" —
   D745's sentence, set aside by D755.

Also brought up to date, found by a helper and not a fault of this step: OIL Earn's hint on an input's row said
"answered for each person on it" — one answer for everyone since D762.

## 4. The gates

The whole set, under the PC's lock, nothing else running, in one run, after the last fix: unit 10468 / 10468 (600 files) · build clean · tfin 728 / 0 · e2e 769 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK.

## 5. Questions waiting for him — none stops the run (D596)

1. **A man who is the only named person beside ALL AVAIL may not change the input for everyone** — he reads it and may
   take himself out; whoever filed it, or a scheduler, changes it. *Recommended and built:* as stated (D755 (3), D763 —
   it reaches everyone behind the puck). The other reading — "it is still his own request" — would let one member
   change what 25 people's OIL rests on. Waits on it: nothing; say so if you want the other.
2. **A person or ALL AVAIL dragged from one input's row onto another's — ANSWERED 12 Oct 26, and the builder's first
   answer was wrong.** It read TWO changes waiting on a published day (out of one input, into the other), and that was
   parked here as "recommended and built". He asked: *"Is this consistent with the rest of the app?"* It was not: D109
   (25 Sep 26) already rules that a man — or a placeholder puck — moved from one place to another on the same day is
   ONE change, said as a move. Fixed the same day: one line, "Ranger: Range safety brief → Second brief"
   (`engine/publish.ts`, `ui/pendlist.ts`; pinned in `ui/phmember.test.tsx`). No new ruling — D109 covers it.

`Walk:` SHORT LOOK ONLY at this stop — 8 steps by real presses, a desktop and a phone, 19 pictures, 5 opened by the
builder; the job's FULL walk is owed after its last screen is built, and nothing here is ready for "merge live".
