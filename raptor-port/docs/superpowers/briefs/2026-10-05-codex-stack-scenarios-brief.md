# Scenario-design brief — Claude's one check of the Codex stack (D589): five pieces, one walk — the FULL check — 5 Oct 26

You are designing TEST SCENARIOS for a walk of the running app. You are not reviewing code for style and you are not
asked whether the code is "clean". Work READ-ONLY: change nothing, build nothing, run no test and start no server.
Report as your final message, in the format at the foot.

**Who built this, and why that matters to you.** Between 2 and 5 Oct 26 Codex built five pieces on top of each other
(Astra planned, Sol 6.1 built, a fresh Astra session inspected). You are NOT that session. Every plan, evidence sheet
and "PASS" those sessions wrote is a CLAIM made by the side that built the thing — use them to learn what was promised
and what was never walked, never as proof that anything works. The owner's rulings are the promise; the running app is
the only proof.

**The build** is branch `claude/codex-stack-review` (app code at commit `bcc69fc8`), against `main` at `de470db5`:
`git diff de470db5 bcc69fc8 -- raptor-port/src`. **The owner's rulings**, from the live files — one line each in
`.claude/rules/decisions/scheduler.md`, `tracker.md`, `oil.md`, `leave-war.md`, `people-accounts.md`, `how-we-work.md`,
and each ruling's full row by `grep -h '^| D509 |' .claude/decisions-full/*.md`. Also read
`raptor-port/docs/bug-check-order.md` §2b, §6, §7 and `raptor-port/CLAUDE.md` §Architecture rules.

## What the app should now do — the five pieces

**1. "Discard marks" is gone (D488).** The amendments box no longer has a "Discard marks" button. A day not yet published
keeps its change marks until it is published, which clears them as before; nothing else about publishing, amendments,
Unpublish or "Load onto working copy" changed. Its sheet: `raptor-port/docs/handpass/2026-10-02-discard-marks-remove.md`.

**2. In-time / Rally, and work hours (D497–D511).** A wave's reporting box is "In-time / Rally": each line carries one
clock, its activity words and remarks; a line naming a formation's callsign applies to that formation, an unnamed line
to the whole wave; in-time and Rally are resolved separately and the EARLIEST applicable clock is where the crew's day
starts (D505, D506); Rally and brief may share a time (D507). A reporting clock later than its take-off is read as the
PREVIOUS day, never more than one day back (D503) — and the work span is never negative. A timing pair out of order
(in-time, Rally, brief, take-off, landing) is a RED WARNING in the day's warning list and is explained while editing —
it never blocks publishing (D509, which reversed D502); a blank brief is checked as the suggested brief and the message
says "suggested brief". The "+ In-time / Rally" button fills in the wave's earliest take-off less the Logic page's
"nominal report before T/O" (3 hours by default) and the words set beside it on Logic ("IN TIME + WX/NOTAMS" by default)
(D510, D511). Every warning that reads a person's start of day — the long day, crew rest and its dotted "breaks
tomorrow" mark, the 7-day run — Insights' work hours, and the earned-leave (OIL) test of a weekend or holiday's worked
hours must agree on that one start. Documents: `raptor-port/docs/superpowers/specs/2026-10-02-rally-behaviour-register.md`,
`…/specs/2026-10-02-rally-time-design.md`, `raptor-port/docs/handpass/2026-10-02-rally-workspan.md`,
`raptor-port/docs/superpowers/briefs/2026-10-03-codex-review-fixes.md`.

**3. Insights' mission mix (D512–D532, D535, D481, D513, D516).** The Logic page has a switch "Track Blue/RED sorties",
OFF at first (D521, D522, D524); while it is off Insights is as it was. On: a formation whose Mission is exactly DS, RED
or RED AIR counts Red with no question; any other Mission counts Blue — unless its Mission contains DS or RED without
being exactly those (DS-2, RED AIR 2, ACM/DS — D531), or its Remarks mention DS or RED (D518, D514), in which case the
scheduler is ASKED Blue or Red for the whole formation (D517). The question appears by itself only straight after the
scheduler's own edit to that Remarks or Mission box leaves the formation needing an answer; otherwise a temporary
"Choose mission role" / "Change mission role" button shows under the formation while its Remarks box is being edited;
passing through an unchanged box never asks (D529, D527). An open question stays until Blue, Red or Later is pressed,
the formation's own Mission or cue wording changes, the formation goes, or he moves to another day, week, version or
sign-in — an unrelated edit on the same day does not remove it (D535); Remarks are saved whether or not it is answered
(D526). The answer is remembered until the Mission or the relevant wording changes; crew and timing changes do not ask
again (D525). The answer COUNTS IN INSIGHTS AT ONCE, ON A PUBLISHED DAY TOO: no amendment, no "N pending", the four
sign-offs untouched — while a change to the Mission or Remarks WORDING on a published day still waits for its amendment
(D530). In Insights a person's weekly bar splits Blue/Red only when every one of their sorties is resolved; otherwise the
ordinary total bar (D512, D523). The chart shows the first twelve flying people with "Show all" (D513). SC, AVALON and BB
standby do not count as flying load; SC MAIN counts towards work hours (D516). The Scheduler Board has its own way into
Insights (D481, D532). Only an admin may answer; a member and a guest read. On a phone a tall pop-up window runs up to a
thin strip at the top of the visible screen (D536, D537), and a window closes on its surround only when the press BEGAN
on the surround (D538) — thirteen windows. Documents: `raptor-port/docs/superpowers/specs/2026-10-03-insights-mission-mix-behaviour-register.md`,
`raptor-port/docs/handpass/2026-10-03-insights-mission-mix.md` (its 33 routes — many "qualified", not walked for real),
`…/2026-10-03-insights-mission-mix-opus-interim.md`.

**4. The workflow UI pass (D540–D566).** (a) The scheduler's one stylesheet was split into per-screen parts and must
change NOTHING visible on any screen at phone or desktop size (D541). (b) On a phone, the Scheduler Board's Desktop
layout shows the schedule again — only that was fixed (D548). (c) While typing on Edit Schedule's week AND on the
Scheduler Board, Tab follows callsign, mission, brief, take-off, landing, then the remarks and stores text, through text
boxes already open for typing (empty ones too), on through the day's open sections and notes in their displayed order;
Shift+Tab reverses it exactly; after the day's last open box Tab goes to the next ordinary control — no loop, no change
of day; closed editors, folded sections and pop-ups stay closed; Enter and Escape mean what they did (D544–D556).
(d) On a phone, Edit Schedule and View-only Sched each have a ⋯ menu after Highlight with one item, Insights; the
drawer's WEEK section is gone (D557–D559). (e) The Tracker's blue flight symbol has the accepted tapered wing with a
readable label; on Logic the search stays visible while scrolling and the kept-visible buttons take fewer rows; the Week
Insights window's close cross stays visible and reachable while it scrolls (D560–D566). Documents:
`raptor-port/docs/handpass/2026-10-03-css-split.md`, `…/2026-10-04-phone-desktop-board-repair.md`,
`…/2026-10-04-schedule-tab.md`, `…/2026-10-04-schedule-insights-menu.md`, `…/2026-10-04-accepted-taper-interface-batch.md`,
`raptor-port/docs/superpowers/specs/2026-10-04-schedule-tab-route.md`.

**5. The failed-save warning's band (D586, D587).** While a save has failed, the top bar is one line taller and "Not saved
— keep this page open" with Retry lies along that line, so nothing is underneath it; the same band sits under the bar of
every full-screen surface that covers the top bar (the Scheduler Board, the Inputs calendar, the Medical view, the Leave
War's OIL tracker) but not in a window, sheet or menu; the passing "Saving…" note is unchanged. Contract:
`raptor-port/docs/ui-contracts.md` §The failed-save warning has a band of its own; sheet
`raptor-port/docs/handpass/2026-10-05-save-note-controls.md`.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Give **12 to 18 scenarios for each of pieces 2, 3 and 4(c)**, **6 to 10 for each of 1, 4(a), 4(b), 4(d), 4(e) and 5**, and
then **10 to 15 CROSSING scenarios** — the ones nobody who built a single piece would have written, where two pieces
meet: Tab out of a Remarks box that triggers the Blue/Red question; Tab through the in-time / Rally lines; the Blue/Red
answer and an out-of-order Rally warning on one published day; the phone ⋯ menu, the Insights cross and the Logic search
while the failed-save band is showing; the board's Insights door on a phone in the Desktop layout; a failed save in the
middle of a Tab route or of a Blue/Red answer and its Retry; the work-hours bar and the Blue/Red bar for the same person;
a day published before a Logic value (the report lead, the tracking switch) is changed. Each scenario must be something a
person — or a scripted browser — can carry out through the app's OWN controls and check on screen.

Cover across the list: every KIND of row a scenario's thing can sit on (a normal flying wave with several formations,
an SC shift with MAIN and SPARE, AVALON and BB standby, a wave with no take-off time, a cancelled line, an empty
formation, a duty desk, a sim, a ground row, a Common Programme row, the day note and section notes); every PLACE it is
shown (Edit Schedule's week, View-only Sched, the Scheduler Board in its desktop and phone layouts, the next-week peek,
a look at an older version, print and CSV, the changes window and History, Insights from every door, the Logic page);
both WIDTHS and a SHORT screen (a phone on its side); every ROLE (admin, the admin's member view, a member, a guest, a
person signed in with no access); every ORDER across the publish line (before publishing; published with nothing
waiting; published with changes waiting; after an amendment; after an Unpublish; "Load onto working copy"; a saved plan
switched in and out; a day template applied); Undo and Redo, incl. after another person's change; a reload and a second
sign-in at each stage; a second week and the week's edge (Sunday into Monday, both directions); and what must NOT have
changed (earned leave for a published weekend, the published face before an amendment, button sizes — D487, the
Tracker's and the Leave War's own Tab behaviour inside their windows, the sign-in card).

**Earned leave (OIL) is the downstream number.** For piece 2 include scenarios that read it: a published weekend or
holiday day whose worked hours cross the six-hour line only because of an in-time or Rally clock, in each direction; a
previous-day report on a Sunday into Monday; and a Logic change after the day went out (an issued day keeps what it
went out with — D48, D142).

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

A physical iPhone, a hardware keyboard on a phone and a truly full disk cannot be walked here — leave them out, and say
in one line which of your scenarios only a real device can settle.

## How to report

- Number the scenarios by piece: `P1-01 …`, `P2-01 …`, `P3-…`, `P4a-…`, `P4b-…`, `P4c-…`, `P4d-…`, `P4e-…`, `P5-…`,
  `X-01 …` for the crossings. Within each piece, most likely to fail FIRST. Each: a one-line title; the surface and the
  ruling it tests (D number); SETUP (in the app's own words — which day, which wave or line, which button; the demo week
  is Mon 13 – Sun 19 Jul 26, the next from Mon 20 Jul); ACTION; EXPECTED (what the screen says, and for OIL what the
  Leave War shows); and THE OBSERVATION THAT WOULD DISPROVE IT.
- Then: any place you believe the build is MISSING a call site, with the file and function, and how a person would see
  it — each with exact, step-by-step fix instructions.
- Then: explicit negatives — surfaces you checked and believe are wired, one line each.
