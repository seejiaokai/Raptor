# Hand pass — the interface as a person uses it, and the days that are not Saturday

Walked 21 Sep 26 against the built app served at `localhost:4173`, driven in a real browser.
Scope: A8, A9, A6, G1–G5, H1, H2, H4 (Fable S8, S9, S35–S42, S44; Codex 3, 12, 16, 20, 21).
Every state below was reached through the app's own controls. Nothing was injected.

**Walk:** 121 pictures in `docs/img/handpass/2026-09-21-oil/` (named `G-…`) · 11 scenarios ·
9 PASS · 2 mixed · 18 findings · no browser errors in any run.

The everything-Saturday (18 Jul 26) is the fixture throughout: two flying lines, an SC MAIN and
SPARE, an AVALON line and its desk, five duty desks including one with no times and one of zero
length, two sims, five ground rows including an info-only one and three that came from members'
requests, a FAMILY DAY on ALL AVAIL and a MASS BRIEF, and four personal requests.

---

## The table

| id | what it checks | what happened | verdict | picture |
|---|---|---|---|---|
| **A8** | a public holiday taken OFF a day after it was published (Wed 15 Jul) | The money is right: Anvil's full day stays on the Leave War until the day is republished, and AL1 removes it. The screen is not: the instant the holiday is cleared, all 26 green bars vanish from the published day, OIL Earn disappears, and the day grows "1 pending · Publish AL1" with nothing anywhere saying why. | **FINDING 1** | `G-A8-03`, `G-A8-06`, `G-A8-07`, `G-A8-09` |
| **A9** | a weekend no Leave War period covers (Sat 13 Feb 27) | Full green bar on Ace, tooltip "earns a full day of OIL", the day nags "publish it before the day is out", and after publishing it reports "No conflicts flagged for this day ✓". The war has no cell for that date at all. Nothing is paid, nothing says so. | **FINDING 2** | `G-A9-01`, `G-A9-03`, `G-A9-04` |
| **A6** | every way out of the OIL mode | Every route out works. Clearing the holiday while in the mode leaves the board editable, not stranded, and the decisions made there come back when the holiday does. Leaving for View-only and returning, ✕ Close and reopening, the phone's day arrows, and the week arrows all drop the mode cleanly and hand back an editable board. Undo eventually walks past the mode's own taps into earlier schedule edits and carries the board to that other day — no lock-up, but it is not scoped to the mode. | **PASS** (one note) | `G-A6-02`, `G-A6-06`, `G-A6-07`, `G-A6-08`, `G-A6-09`, `G-A6-13` |
| **G1** | is anything usable inside the mode that should not be | The schedule itself is properly shut: 145 typing boxes all disabled, no seat drop zones, no "+ add" strips, no + Line / + Wave / + Row / + Block, no CX / ⓘ / red flag / ✕, no Templates, the wave picker dead, the row grips emptied. But five things stay live: the crew palette (a drag really starts), the four sign-off pickers, Publish day, the plans selector, Unpublish — and the Personal Inputs and Unavailable panels are not read-only at all. | **FINDINGS 4–8** | `G-G1-03`, `G-G1-07`, `G-G1-09`, `G-G1-13`, `G-G1-14`, `G-G1-15` |
| **G2** | a member, not a scheduler | The member's tabs are View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help — no Edit Schedule, no way to open a board, no OIL Earn button anywhere, no mode furniture in the page at all, and the words "NO OIL" appear nowhere. He sees 19 green bars on the week, desktop and phone, each with the figure in words ("Saber · IP · instructor pilot · SXO · earns a full day of OIL"). | **PASS** (chip tap is FINDING 10) | `G-G2-08`, `G-G2-09`, `G-G2-12`, `G-G2-13` |
| **G3** | what the day's change history says, gesture by gesture | Ten gestures in one sitting, ten history lines, and the day shows exactly **one** pending item for all of them. Eight name the event the way the board does: "Ranger earns nothing from VIPER", "Fable earns nothing from SDO", "Cinch earns nothing from BOX", "Ace earns nothing from FAMILY DAY". The blanket reads "Nothing on this day earns OIL — anything added later is covered too" and "This day can earn again — the marks underneath are back". A row with no name reads "this event earns nobody any OIL", as asked. Two claims do not. | **FINDINGS 14, 17** | `G-G3-07`, `G-G3-09`, `G-G3-10` |
| **G4** | phone width, 390px, every surface | The bar holds one row in and out of the mode: "THIS DAY · Templates · OIL Earn" becomes "OIL EARN · Nothing today earns · ✓ Done" with the instruction line under it. Nothing is clipped (✓ Done ends at 348 of 390), there is no sideways page scroll at 360, 389, 390, 391 or 430, the desktop OIL button is correctly hidden and the THIS DAY one is the door, and ✓ Done hands the board straight back. Two problems: the pucks and the missing count. | **FINDINGS 11, 12** | `G-G4-01`, `G-G4-03`, `G-G4-05`, `G-G4-06`, `G-G4-08-*` |
| **G5** | do the tooltips match what a tap does | Most do, exactly. A row that cannot earn says "Nothing on this row can earn OIL, so there is nothing to switch off" and offers no switch (AVALON lines, the AVALON desk, the blind SXO desk, the zero-length desk, the info-only row). A masked puck no longer invites a tap. A row added on the board and opened at once does **not** say "no identity yet". Two tooltips lie. | **FINDINGS 10, 13** | `G-G5-01`, `G-G5-02` |
| **H1** | ordinary weekdays untouched, and an "off day" tag | An ordinary Tuesday is exactly the old board: no OIL Earn, no bars, no OIL warnings, the bar reads only "THIS DAY · Templates". Tag it "PH" and everything appears (25 bars, the button, the warnings); clear it and everything goes. Tag it **"Off day"** — the war's own second event type — and nothing at all happens. | **PASS** + **FINDING 16** | `G-H1-01`, `G-H1-02`, `G-H1-03` |
| **H2** | a request over several days, answered yes for one day only | The question is asked well — "THIS INPUT COVERS 2 NON-WORKING DAYS · Each confirmed day earns FO · All days / Only some days… / No OIL" — the per-day picker works, and Saturday-yes / Sunday-no is stored. Then nothing is paid: Saturday's mode calls the man inert, and no credit lands. The request puts a row only on its first day. | **FINDING 3** + **FINDING 18** | `G-H2-31`, `G-H2-32`, `G-H2-34-mode-day5`, `G-H2-35`, `G-H2-40` |
| **H4** | the "not published yet" reminder, and its silence | On the unpublished Saturday with earners it reads "This day is not published yet, so nobody earns their OIL for it — publish it before the day is out". Turn the blanket on and it goes quiet. Publish and it goes. On a weekday it never appears. A desk with no times warns on the day and again at publishing ("SDO has no times — nobody on it earns OIL for this day"). One case is wrong: a completely empty Saturday. | **PASS** + **FINDING 15** | `G-H4-01`, `G-H4-02`, `G-H4-03`, `G-H4-04`, `G-H4-05` |

---

## The findings

### Money and the published record

**1. A day that stops being a holiday goes blank and silent while the war keeps paying.**
Wednesday 15 Jul was declared a public holiday, a man was put on a desk 08:00–16:00, and the day
was published — the Leave War showed his full day. Clearing the holiday from the Leave War grid
then did this to the published Wednesday: every green bar disappeared (26 of them), the OIL Earn
button disappeared with them, and the day grew "1 pending · Publish AL1". The warning list gained
nothing about it, the change history recorded nothing about it, and the Leave War went on paying
him. A scheduler reading his own screen would conclude nobody is being paid for that Wednesday,
and would find a pending amendment he never made and cannot open the mode to inspect. Publishing
AL1 then correctly removes the credit. *So the money obeys the rule and the screen contradicts it.*
The forward direction (a holiday declared after publication) does carry an advisory; the reverse
carries none. **Bad for a real squadron: high** — this is the exact reading that makes a scheduler
"fix" something that is already right.

**2. A worked weekend outside every Leave War period shows full green and pays nothing.**
The war holds 2026 only. On Saturday 13 Feb 2027 the OIL Earn button is offered, a man on an SDO
desk 08:00–18:00 wears a full green bar whose tooltip says "earns a full day of OIL", and the day
tells the scheduler "This day is not published yet, so nobody earns their OIL for it — publish it
before the day is out". After publishing, the day reports "No conflicts flagged for this day ✓".
The war has no column for that date, so nothing lands and nothing ever will. **High** — the app
actively instructs the scheduler to do something that cannot work, then tells him it went fine.

**3. A request over several days, answered yes for Saturday, earns nothing on Saturday.**
Anvil, Training, Fri 17 → Mon 20 Jul. The app asked which non-working days it deserved, the
per-day picker was used to pick Saturday only, and the answer was stored correctly (Saturday yes,
Sunday no). Saturday's board never gets a Training row for him — the request lands a row on its
first day only — so in the mode his puck reads "Anvil — nothing measurable to earn from here", and
after Saturday is published no credit appears on any of the four days. **High** — the app asks a
money question, records the answer, and then pays none of it.

### The mode is not read-only

**4. The Personal Inputs and Unavailable panels stay fully editable inside the mode.**
The schedule's own boxes are all disabled, but on those two panels, with the mode on: a time box
took a typed change (13:00 → 05:00, and it stuck); the LATE chip toggled; and **UNDO removed a
ground-programme row** — "MEETING 13:00–14:00, Gambit" disappeared from the day with no
confirmation and the mode still running. All three change how much OIL a man earns, which is the
one thing the mode exists to stop happening by accident. **High.**

**5. The crew palette stays live and a drag really starts.** With the mode on, the palette is
drawn in full — heading "PLACEHOLDERS · DRAG IN", ALL AVAIL, ALL and 63 pucks. Pressing a puck and
dragging it onto a seat raises the drag ghost and puts the page into its drag state; the drop does
nothing, because no seat can receive it. A gesture that begins and can never finish reads as
broken rather than as "not allowed". **Medium.**

**6. Sign-off and Publish work from inside the mode.** All four sign-off pickers are live; setting
them from inside the mode unlocks "Publish day"; pressing it publishes the day (ORIG) while the
mode stays on. Whether that is wanted is a product call, but it is not "read-only". **Medium.**

**7. The plans selector and Unpublish stay live inside the mode.** "Live working copy ▾" opens the
plans menu — Live working copy / Original (read-only) / + Alt Plan — drawn straight over the mode's
own green bar, and "Unpublish" sits enabled beside it with its full tooltip. Switching the plan or
unpublishing from inside the OIL mode is a large change made from a screen that says it cannot
change anything. **Medium.**

**8. Two buttons reading "✓ Done" on screen at once.** The board's own ✓ Done (finish editing) sits
top right; the mode's ✓ Done sits in the green bar a few centimetres below it. They do different
things. **Low, but it is the exit button.**

### What the screen says

**9. The green bar is never painted on the puck of the person you are viewing as.** Ranger's puck
carries the half-day class but draws no stripe, on the board and on both weeks, for the scheduler
and for the member — the "this is you" styling wins and wipes the background the stripe is drawn
with. Every other puck draws its 4px stripe correctly. The scheduler's own row is the one he is
most likely to check. **Medium.**

**10. "tap to see each one" does nothing.** The ALL AVAIL count chip reads "All 27 earn half a day
— tap to see each one". Tapping it opens nothing — as the scheduler on the week, and as a member.
**Low, but it is a written promise.**

**11. The board never shows the count.** On the board's Common Programme the ALL AVAIL row shows
the placeholder puck with a half bar and the title "ALL AVAIL · earns half a day of OIL" — and no
"27". The number exists only on the week. The board is where the day is worked. **Medium.**

**12. Every tappable puck in the mode is 15 pixels tall on a phone.** 48 of them, 74 × 15px, in
rows 15px apart — the family day alone stacks 27 of them into a 304px block. They can be tapped by
a machine; a finger cannot pick one out reliably. **Medium-high for phone use.**

**13. A claim row's name says the opposite of the puck beside it.** On Personal Inputs, Unavailable
and the landed ground rows, the name cell reads "Nothing on this row can earn OIL, so there is
nothing to switch off" while the puck on the same line reads "Sidewinder earns a full day — tap to
take him off this event". Both are on screen together. The wording is meant for rows that genuinely
cannot earn; a claim row cannot be switched as a whole for a different reason, and should say so.
**Medium.**

**14. The history names a claim by the puck's own text.** "Sidewinder earns nothing from
SidewinderFO" and "Talisman earns nothing from TalismanHO". They should read "Overseas duty" and
"Training". The other eight lines name their event correctly. **Medium** — the change history is
the record of a money decision.

**15. An empty Saturday still nags.** Saturday 25 Jul, with nothing and nobody on it, shows
"⚠ 1 issue" and "This day is not published yet, so nobody earns their OIL for it — publish it
before the day is out". Nobody would earn anything. **Low.**

**16. "Off day" does not behave like a day off.** Tagging Tuesday "Off day" — one of the four event
types the Leave War ships with — changes nothing: no OIL Earn, no bars, no warnings. Only "PH"
turns the day on. A squadron that declares an Off day and then works it will pay nobody, with no
sign that anything was missed. **This is a product question for the owner, not obviously a bug.**

**17. No feedback for any OIL gesture.** None of the ten taps produced a toast or any other
acknowledgement; the only sign anything happened is the puck or switch changing and a line that
appears in the change history if you go and open it. **Low.**

**18. A multi-day request cannot be filed from the board.** The board's "+ INPUTS" form is headed
"New input · Jul 18" and carries no date field at all, so it can only file for the day whose board
is open. The multi-day request — and therefore the per-day OIL question — exists only on the Inputs
page. **Low, but worth knowing:** the OIL question the board raises can never be the multi-day one.

---

## What was NOT walked, and why

- **The forward holiday direction** (declared after publication) — already walked and passing;
  deliberately not repeated.
- **The desktop day chips while the mode is on** — the harness could not reach the board's own day
  chips (the ones it can click belong to the week behind the board, and they do nothing whether the
  mode is on or off). The phone's day arrows were driven instead and work correctly, and the week
  arrows were driven and work correctly, so the "stepping strands the mode" question is answered;
  the desktop chip specifically is not.
- **A real phone.** 390 × 844 emulation only.
- **Codex 21's "lose edit authority with a board open"** — there is no on-screen control that takes
  edit authority away mid-session in the scheduler; the member simply has no board. Reported as a
  missing route rather than a pass.
