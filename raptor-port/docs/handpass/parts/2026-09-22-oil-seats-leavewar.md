# [OIL-SEATS-CAN-EARN] — the walk, part: THE LEAVE WAR SIDE

Round 1 of this change never opened this tab. This is the walk of it, driven by hand against the
production bundle served at `localhost:4173` (byte-identical to the branch head — confirmed by the
coordinator, not rebuilt here).

**Walk:** 56 pictures in `docs/img/handpass/2026-09-22-oil-seats/` (`LW-*`) · 6 surfaces (the war
grid, the OIL tracker, the day-tap list, the clash strip, the board's count chip, the amendment
bar) · both widths · both roles · 22 driver scripts, `scripts/handpass/seat-lw-00…21`.

Every script is kept and re-runnable, so the next session reproduces a finding instead of
rediscovering it. They chain through saved worlds: `state-lw-published.json` (both weekend days
published with a crowd on a desk), `state-lw-reversed.json` (after the first amendment turned a
desk off), `state-lw-leave.json` (after leave was filed on the issued Saturday).

---

## 1. What was built, by hand, through the app's own controls

Saturday 18 Jul 26 (day 5, the everything-day) and Sunday 19 Jul 26 (day 6):

| What | How | Why that one |
|---|---|---|
| **KEY CONTROL**, ground row, 08:00–18:00, **Piston named on it** | `+ Item`, typed, then the man armed and dropped from the crew palette | the CONTROL — a man named straight onto a row, the way the app has always paid people |
| **SAT DESK**, a new duty desk row, 08:00–18:00, **ALL AVAIL** on it | `+ Row` on the plain Duty block, typed, then the placeholder armed and dropped | the headline of this change — the owner's Sunday desk. Before it, a placeholder here paid nobody |
| **SUN DESK**, a new duty desk row, 09:00–12:00, **ALL** on it | same, on the Sunday | the OTHER placeholder puck. Wiring one and forgetting the other is the shape this build must avoid |
| Both days signed by four roles and **published** | the day's own Sign-off strip and Publish day | money only moves off a published day |

Long row on the Saturday, short row on the Sunday, deliberately: the day is judged once on its
whole span, so a full day and a half day cannot be tested on the same day for the same men.

Picture: `LW-03-sat-rows-built`, `LW-04-sat-mode-on`, `LW-05-sat-published`, `LW-06-sun-mode-on`.

---

## 2. The four questions the plan set

### Q1 — Does a man paid through a placeholder get the same OIL figure as a man named directly?

**YES. Identical.** (`seat-lw-03-read`, `seat-lw-04-figures`; `LW-07`, `LW-08`)

| Man | How he got there | Saturday | Sunday | OIL figure before | after | moved |
|---|---|---|---|---|---|---|
| **Piston** | named directly on KEY CONTROL | FO | HO | 0 | 1.5 | **+1.5** |
| **Anvil** | swept up by ALL AVAIL on SAT DESK | FO | HO | 0 | 1.5 | **+1.5** |
| Warden, Comet, Forge, Havoc, Trident, Vandal, Ace, Nomad, Diesel, Vapor, Relay, Scope, Rune, Cutter, Ghost, Hex, Ryder, Vector, Recon, Wildcard | the same crowd | FO | HO | 0 | 1.5 | +1.5 each |

Before this change a placeholder on a desk credited **nobody**. It now pays, and it pays the same
as a name. The tracker names the reason in the squadron's words — "AUTO Weekend/PH · Duty".

**The whole roster was read, not a sample.** 50 rows, every man's figure before and after. The
script cross-checks each man's day cell against his money and reports any mismatch:
**no mismatches.** Two that looked wrong and are not:

- **Outlaw** — cell says FO, his figure moved +1.5, but no new line shows in his ledger. He carries
  an old uncovered debit of −4.5, so the two new credits went straight to his archive to cover it.
  The money arrived; it was spent on arrival.
- **Dash** — reads a full day on a three-hour Sunday. He is the Sunday's SDO, 08:00–18:00. Correct.

### Q2 — Does the date's cell read FO or HO as the schedule decided?

**YES.** (`seat-lw-03-read`; `LW-07`)

- Saturday, crowd on a 08:00–18:00 row → **FO** (full day) for all 33 men credited that day.
- Sunday, crowd on a 09:00–12:00 row → **HO** (half day) for all 45.
- The eight men reading HO on the Saturday instead of FO were each busy elsewhere during the
  desk's window, so the crowd correctly left them out, and each earned from his own shorter
  event — a flight, a sim, the mass brief. Every one checks out against his own row.

### Q3 — What does the war show when one of the crowd has leave that day?

**It shows both, names the clash, and keeps the money.** (`seat-lw-08-leave-clash`,
`seat-lw-09-clash-tap`; `LW-18`, `LW-21`, **`LW-22-clash-tapped`**)

Leave was filed for **Anvil** — one of the crowd behind the placeholder — on the Saturday that had
already gone out, through the squadron's own door: the **Unavailable** panel's "+ Add" on the
board. (The Ground "+ Inputs" door offers ground types only and is not the leave door.)

What happened, in order:

1. The app accepted it — "Input added". It did not refuse it.
2. **The clash strip across the top of the Leave War now reads:**
   *"1 clash with the schedule — Anvil: weekend/PH work earns FO but 18 Jul 26 holds LL — resolve
   on the sheet"*
3. His day cell changed from `FO` to **`LL !`** — the leave code with the amber mark.
4. **Tapping that cell opens the day list with both records**, and says what to do about each:
   *"Two of these can't both stand on the same time — an admin needs to change one."*
   · *"LL — local leave · filed on the Inputs page. Change it on the Inputs page."*
   · *"FO — OIL earned (Duty), worked 08:00–18:00 · given by Weekend/PH. From the published schedule."*
5. **His OIL figure did not move — still 1.5.** The issued day keeps paying the man it went out
   with, which is what D44 promises.

The control (Warden, credited, no leave) taps through to the ordinary picker, which reads
"NOW FO · Earned off the published schedule — change the schedule and the OIL follows."
(`LW-23`)

### Q4 — Does the money come back down when a switch is turned off on a published day?

**YES, in both halves.** (`seat-lw-06-reverse`, `seat-lw-07-reverse-full`; `LW-09`–`LW-13`)

**Half one — one item off.** On the published Saturday, tapped the SAT DESK item's name inside the
OIL Earn mode. The app said *"SAT DESK earns nobody any OIL"*, the switch flipped to *"Earns
nothing — tap to let it earn again"*, all four signatures cleared, and the day offered
**Publish AL1**. Signed and published.

- **Exactly the 26 men that desk was paying came down by half a day each**, FO → HO. Nobody else
  moved.
- The 15 who kept their Saturday all had other work on it — a flight, a sim, the mass brief.

**Half two — the last thing off.** Then turned FAMILY DAY (the Common Programme row those same men
were also on) off and published AL2.

- **All 26 fell to nothing**: their Saturday cell went **blank**, and each lost the remaining half
  day. Their ledgers hold no 18 Jul line at all any more.
- **No stale cell anywhere** — the script checks for a cell still showing FO or HO with no credit
  behind it. None.
- The 15 with other work kept exactly what that work earns.

A credit that goes out comes all the way back. Nothing was banked.

---

## 3. What else was walked, and found sound

| Checked | Result |
|---|---|
| **Both widths** (`seat-lw-13-phone`; `LW-30`–`LW-33`) | Phone: the war's top row holds one line — Manning · ⚙ · ⇅ · ◷ OIL · − ＋. The credited Saturday reads FO after jumping to JUL (the grid draws a rolling window of months on a phone — documented, not a fault). The OIL tracker fits the screen exactly, no sideways scroll, all 50 rows, same figures as the desktop. |
| **The period selector trap** (`LW-33`) | The war carries TWO periods, JAN–DEC 26 and JAN–DEC 27. Switching to 2027 drops the 2026 days from the grid, as it should — **and the OIL tracker still shows both July 26 credits**, so the money is not period-scoped. A read of one period is not a read of the war. |
| **The member's view** (`seat-lw-14-member`; `LW-34`, `LW-35`) | A squadron member sees the same cells and the same figures (Warden 1.5), the tracker header reads "one row per person" rather than the admin's line, and the settings gear and every delete button are absent. |
| **Errors on screen** | **None.** Every one of the 22 scripts watched the browser's own error list, console errors, page errors and 4xx responses throughout. All clean. |
| **A man's figure moving with no cell to explain it** | Checked across all 50 men in both directions. None. |

---

## 4. Findings

### F1 — A published day carrying a placeholder crowd reopens asking for an amendment nobody made

**Severity: MEDIUM. New to this branch.**
(`seat-lw-15` … `seat-lw-21`; `LW-37`, `LW-39`, `LW-43`, `LW-44`)

Publish a weekend day that has ALL or ALL AVAIL anywhere on it. Straight after publishing, the day
is clean. **Close the app and open it again, and that day says "1 pending" and offers "Publish
AL1", with all four signatures cleared — and nobody has touched it.**

The register promises the opposite in as many words: *"No amendment nobody made — a day published
before the app kept this record does not light up the moment the change ships."*

Isolated with controls, each publishing the same untouched world and reopening it:

| Day published, then reopened | Reads |
|---|---|
| Monday — a weekday, the other everything-day | clean |
| Friday — a quiet weekday | clean |
| **Sunday — earns OIL, a plain desk, no placeholder** | **clean** |
| **Saturday — earns OIL, carries ALL AVAIL on the Common Programme** | **"1 pending · Publish AL1"** |
| Sunday once a placeholder crowd is put on it | **"1 pending · Publish AL1"** |

So it is not the day, not the weekend, and not the extra row — it is the **placeholder crowd**. A
desk with a man NAMED on it does it too only because that Saturday already carries a placeholder
elsewhere; the Sunday control separates the two cleanly.

**What it costs him.** One spurious amendment per published day that has a crowd on it: he
re-signs four roles and issues a new version of the squadron's schedule that changes nothing. There
is **no way on screen to find out what changed** — no cell wears an amendment mark, and History is
empty, because the change is worked out rather than recorded.

**It does not repeat.** Publishing the phantom AL1 settles the day: reopened again it is clean, and
a third reopen is clean too. So it is one wasted amendment per day, not a treadmill.

**Why it is this branch's.** The day's OIL block is now compared on WHO the crowd stood for — that
comparison is new here (step 9b). The code that does it already carries a comment naming this exact
"manufactured amendment" shape as something this branch *"has now met three times"*; this is a
fourth instance of it that is still live. I could not run `main`'s bundle to prove it by behaviour
(I was told not to rebuild), so the provenance rests on those controls plus the fact that the
weekday and no-placeholder days are clean.

### F2 — The desk says it covers 46 men; it pays 45. The 46th left the squadron in January.

**Severity: MEDIUM. New to this branch.**
(`seat-lw-10`, `seat-lw-12`; **`LW-29-sunday-count-chips`**, `LW-25`, `LW-24`, `LW-27`)

On the published Sunday the SUN DESK's count chip reads **46**, and its caption reads
*"All 46 earn half a day — tap to see each one (who is free as things stand now)"*. Opening the
crowd inside the OIL Earn mode draws **46 pucks, all 46 lit as being paid**.

**The war paid 45 of them.** The odd man out is **Torch**, whose own row in the war says
*"Torch posts out 2026-01-13 — this is their last day in the squadron"*, and whose every day from
14 January onward is drawn as PO in the greyed "gone" style.

The money side deliberately leaves a departed man out — it makes the same in-the-squadron check the
manning counts make, and a comment there from 28 Aug says so. **The count chip and the opened crowd
do not make that check.** So the board tells a scheduler the desk covers a man it will never pay,
and gives him no way to see which one.

New here because the count chip, the crowd opening into pucks on a desk, and the desk earning at
all are all built in this branch — before it a desk drew no chip, no crowd, and paid nobody.

### F3 — "ALL" does not include the ground crew, but a ground crewman named on the same desk is paid

**Severity: LOW–MEDIUM, and it is a question for the owner, not a bug to fix blind.**
(`seat-lw-10`, `seat-lw-11`; `LW-26`, `LW-28`)

Cotter, Ratchet and Widget are on the war's roster with their own rows.

- **Named by hand** on a Sunday desk 09:00–17:00, Cotter is paid: his cell reads **FO** and his OIL
  figure goes **0 → 1**.
- **Neither placeholder ever includes him.** ALL AVAIL on the Saturday's desk swept up 26 men and
  ALL on the Sunday's swept up 46, and both left all three ground crew out, every time.

So the same desk pays a ground crewman when he is typed in and not when the desk says "ALL". The
exclusion is deliberate and pre-existing in the money side; what is new is that desks now pay at
all, which is what makes the two answers visible side by side. Whether "ALL" should mean all is
the owner's call — but the word currently promises something the app does not do.

### F4 — Filing leave on a published day clears all four signatures — cannot be separated here

**Severity: OPEN QUESTION, not a finding.** (`seat-lw-08`; `LW-17`)

D45 says *"a change in availability NEVER invalidates a signature — the pending mark is the whole
mechanism."* Filing leave for Anvil on the issued Saturday cleared all four signatures.

But filing an input also changes the day's own content, and a separate ruling (15 Sep 26) says a
change to the day's content clears the sign-offs. One action does both, so driving the app cannot
tell which rule fired. Flagging it for whoever runs the code read: it wants one unit-level answer,
not another walk.

---

## 5. What was NOT walked on this side, and why

- **The version preview ("as issued")** — named in the plan as a surface another worker's block
  covers; I stayed on the working copy and the war.
- **A war at a stage other than "open for bidding"** — the demo world's 2026 war is open, and the
  cell tap behaves as documented at that stage. A closed or draft war was not opened.
- **Bidding and deciding against an OIL credit** — the plan's four questions are about the figure,
  the cell, the clash and the reverse; bidding is its own feature and untouched by this change.
- **`main` run side by side.** I was told not to rebuild or serve a second bundle. Provenance in F1
  and F2 rests on in-app controls plus the branch's own diff, and is stated as such rather than
  claimed as measured.

## 6. Where to start if this is picked up again

`node seat-lw-02-setup.mjs` rebuilds the published world from scratch (about a minute), then every
other script runs against the saved worlds beside the pictures. Run from
`raptor-port/scripts/handpass/` with `HP_STATE` pointed at `docs/handpass/state-sat.json` and
`HP_SHOTS` at `docs/img/handpass/2026-09-22-oil-seats`.

`seat-lw-21-pending-is-it-oil.mjs` is the four-line reproduction of F1 and takes under a minute.

**Rulings: none this session** — nothing new was ruled; this is a walk, not a build.
