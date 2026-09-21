# Blocks A and B — walked by the host session (21 Sep 26)

The everything-Saturday, built through the app's own controls in the real production bundle
(`scripts/handpass/fixture.mjs`, 70 seconds, every seat verified after it was dropped). Pictures in
`docs/img/handpass/2026-09-21-oil/`.

## What the day carries

| Row | Who | Times | Should be worth |
|---|---|---|---|
| VIPER (flying) | Ranger / Echo | 10:00–11:00 | HO — the working day is 07:00–13:00, exactly six hours |
| COBRA (flying) | Ridge / Grit | 14:00–15:30 | FO — 11:00–17:30 |
| SC MAIN | Piston / Basher | 06:00–14:00 | FO |
| SC SPARE | Cobra / Ledger | 06:00–14:00 | nothing — spare |
| AVALON line | Hunter / Quill | 09:00–12:00 | nothing — exempt |
| SDO | Fable | 08:00–18:00 | FO |
| SXO | Warden | **no times** | nothing — blind desk |
| OPS DESK | Outlaw | 07:00–07:00 | nothing — zero length |
| AVALON desk | Saint | 09:00–12:00 | nothing — exempt |
| SC desk (SXO AM) | Drifter | 07:00–13:00 | HO — exactly six hours |
| OFT EP-6 | Reaper / Basher | 14:00–15:30 | HO for Reaper; Basher FO from his morning shift |
| AMT BOX | Cinch / Cinder | 09:00–11:00 | HO |
| OCU REVIEW | Saber | 09:00–11:00 | FO with the mass brief — 09:00–16:00 |
| ADMIN (ⓘ) | Vandal | 13:00–14:00 | nothing — info only |
| FAMILY DAY | ALL AVAIL | 10:00–14:00 | HO |
| MASS BRIEF | Saber / Torch | 15:00–16:00 | Saber FO, Torch HO |
| Training (his own request) | Talisman | 09:00–12:00, answered yes | HO |
| Duty (his own request) | Sidewinder | all day, answered yes | FO |
| Meeting (his own request) | Gambit | 13:00–14:00, answered **no** | nothing |

**Every one of those came out exactly right**, on the board and after publishing. Picture:
`A-03-sat-published.png`. That is the whole of A11 / Fable S12 / Codex 2, and it passes.

The day's warning list on the draft reads, in order: *"SXO and OPS DESK have no times — nobody on
them earns OIL for this day"*, a crew-rest note about the sim brief, and *"This day is not published
yet, so nobody earns their OIL for it — publish it before the day is out"*. Both OIL lines are
right, and the reminder goes when the day is published.

## The table

| # | What it checks | Result | Picture |
|---|---|---|---|
| A11 | the whole Saturday read as a scheduler | **PASS** — every figure above | `A-03-sat-published` |
| A1 | the pending bar | **FINDING 1** | `A1-pending-board`, `A1-issued-face` |
| A2 | a second man on a member's landed request row | **FINDING 2** | `A2-second-man-on-request-row` |
| A7 | switches on rows that can never earn | **FINDING 3** (part) · **PASS** (part) | `A7-sc-spare-switch-mode` |
| A4 | a placeholder where it cannot expand | **FINDING 4** · **PASS** on cockpit and sim seats | `A4-placeholders-planted`, `A4-placeholders-in-mode` |
| A10 | the blanket, then publish | **FINDING 5** — silent only when nobody earns | `A10-blanket-on`, `A10-published-under-blanket` |
| B1 | mark then publish vs publish then mark | **PASS** — a round trip leaves no change | — |
| B4 | the double tap, and the member's own word | **PASS** | `B4-double-tap` |
| B2 | switch an event off, then add a man | **PASS**, with one wording gap (see below) | `B2-tenth-man-under-a-switched-off-event` |
| B3 | a tap under the day blanket | **PASS** — and it is the fix for the worst defect the two reviews found | `B3-under-the-blanket` |
| B5 | undo, and redo, across a publish | **PASS** — the day and the money never disagree | `B5-after-AL1`, `B5-after-undo-of-publish` |

## The findings

### 1. On a published day nothing on the puck says the change is not yet in force
*(Fable S4 — the one already carried as an open question for the owner, Q1 in `DECISIONS.md`)*

Take a man off OIL on a day that has gone out. On the scheduler's own board his green bar
disappears **at once**. The issued page still shows it, and the Leave War still pays him a full day
— both correct, because only a published day pays. But there is nothing on the puck itself saying
"this is not in force yet". A typed edit gets a dotted amendment mark; this gets none.

What the scheduler *does* get is the day's Publish button changing to "Publish AL1" and the
sign-offs going back to unsigned, so it is discoverable — just not where he is looking.

Measured: Fable on the SDO desk. Board after the tap: no bar, tooltip reads only
*"Fable · C · ops wingman"*. Issued page: still a full-day bar. Leave War 18 Jul: still **FO**.

**This is a product question, not a bug.** Recommendation: put a dotted edge on the puck, the same
mark a typed edit already gets, so "changed but not issued" looks the same everywhere.

### 2. A second man on someone's own request row earns nothing, and nothing says why
*(Fable S5)*

Talisman filed Training 09:00–12:00 on the Saturday and answered yes, so it landed on the Ground
Programme and he earns a half day. Drop a second man — Comet — onto that same row, the way a
scheduler would if two of them were doing the training together.

- Outside the mode: Talisman wears a half-day bar, **Comet wears nothing**.
- Inside the mode: the row offers exactly one tappable man, Talisman. Comet's puck is dim and inert,
  and his tooltip says only *"Comet · IP · instructor pilot"* — not a word about OIL.

So the row belongs to the request, and anyone else standing on it is invisible to the measure. A
scheduler has no way to tell whether that is deliberate.

**Either he should earn like the man beside him, or the app should say why he cannot.** Silence
next to a glowing puck is the wrong answer. Owner's call which.

### 3. The switch beside an empty SC spare row belongs to the whole shift, and takes the main crew's day away
*(Fable S3, Codex 15 — confirmed in the running app)*

In the mode, an event's name becomes a switch reading *"Earns OIL — tap to stop this item earning"*.
Of the twenty switches on this Saturday, **ten sit on rows with nobody on them at all** — seven
empty SC aircraft rows and three empty duty rows in the SC block.

Seven of those are the dangerous ones. An SC shift draws **one** switch on **every** aircraft row it
holds, including the empty spare rows. Press the one beside an empty spare row and it does not
switch off that row — it switches off the whole shift:

- before: Piston a full day, Basher a full day
- after: **Piston nothing, Basher down to a half day** (he keeps the sim)

Nothing on screen connects the switch you pressed to the men two rows above it.

**It is not silent about the money.** The day immediately reads "Publish AL1" and the four sign-offs
go back to unsigned, so it cannot slip out without an amendment. That caps the damage at "the
scheduler does not know what he just did" rather than "two men quietly lose a day".

**Passing, and worth recording:** the AVALON line, the AVALON desk, the blind SXO desk, the
zero-length ops desk and the ⓘ row correctly offer **no switch at all**. Fable predicted they would
offer one. They do not.

**Recommendation:** draw the shift's switch once, on the shift header, not on every line under it;
and do not draw a switch on a row with nobody on it.

### 4. A placeholder parked on a duty desk pays nobody and says nothing
*(Fable S6)*

Drag ALL AVAIL onto the SDO desk — a desk that has real times, 08:00–18:00, with Fable already on
it. This is an ordinary thing to do while planning a weekend.

- Outside the mode the placeholder sits there dim, with no green edge, no count beside it, and a
  tooltip that reads only *"ALL AVAIL"*.
- Inside the mode it is not tappable at all.
- After publishing, nobody extra is paid. **The money is right.**

Compare the same placeholder on the family day two rows down: there it wears a half-day edge and
opens into real people. On the desk it is silent. Nothing tells the scheduler the difference.

**Passing, and worth recording:** the app will not let a placeholder into a cockpit seat or a sim
seat at all — the crew palette simply does not offer it. Fable expected it would. It does not.

**Recommendation:** one line on the desk placeholder — *"a placeholder here earns nobody"* — and
the difference stops looking like a bug.

### 5. Under "Nothing today earns", publishing says nothing — and loses the line it would otherwise give

Watched properly this time: everything the page put on screen for five seconds either side of the
press was recorded, so a message that flashes and goes is still caught.

**Publishing the day normally**, the app speaks, and speaks well:

> *"Saturday 18 Jul: the SXO and OPS DESK desks have no start and end times, so nobody on them
> earns OIL"*

**Publishing the same day with "Nothing today earns" on**, that line disappears and **nothing takes
its place**. A Saturday carrying two flying lines, an SC shift, three desks, two sims and two
programme rows went out paying nobody, and the only thing that changed on screen was the version
chip going from DRAFT to ORIG.

The checks panel says nothing either, before or after.

So this is narrower than it first looked — the publish message machinery works, and the blind-desk
line is good. What is missing is the case OIL33 was written for: **the day that pays nobody.**

**Recommendation:** one line at publish — *"nobody earns OIL on this day"* — whenever a weekend or
holiday goes out with no credits on it, whatever the reason.

*(Correction to an earlier reading in this session: I first recorded "no message at all at publish".
That was measured with too short a window and only under the blanket. The message exists; it is the
no-earner case that is silent.)*

### The tenth man, and the day blanket — both pass, and one of them matters

**Switch an event off, then add a man to it.** Mass brief switched off on the draft day, then a
third man dropped onto it. In the mode the whole row goes dim and **none** of the three pucks
invites a tap — the tooltip is just the man's name and category, with no "tap to put him back on
it". That was the wording the reviews warned about, and it is right. After publishing, Saber drops
to a half day (his remaining work is 09:00–11:00) and the third man earns nothing from that event.
The money is correct.
*The one gap:* a dim puck under a switched-off event says nothing about **why** it is dim. A line
like "this event earns nobody" would close it. Same shape as findings 2 and 4 — the app is right
and silent.

**A tap under the day blanket.** This is the one the two code reviews both rated highest, because
the old behaviour let an invisible tap destroy a stored decision. Walked in the running app:

- Under the blanket every puck is inert — there is no tap target at all, so the dangerous tap
  cannot happen.
- Every item switch reads *"Nothing on this day earns — the day blanket is on"*.
- Lifting the blanket brings Fable back **exactly** as he was: *"Fable earns a full day"*, his green
  edge restored, Piston and Saber unchanged.
- The day reads "Unpublish" afterwards — blanket on, tap, blanket off leaves **no pending change**.

**That fix works.**

### Undo across a publish — walked end to end, and it holds

The step both models flagged as the one where a day and its money could end up disagreeing.

| Step | Day says | Fable's green | Fable's Leave War cell |
|---|---|---|---|
| publish the Saturday | ORIG | full day | **FO** |
| take him off OIL | ORIG, "Publish AL1" waiting | gone from the board | **FO** — frozen, correct |
| publish the amendment | AL1 | gone | **empty** — the day is withdrawn |
| **Undo** | back to ORIG, "Publish AL1" waiting again | still gone on the working copy | **FO again** |
| **Redo** | AL1 | gone | **empty again** |

At no point does the schedule say one thing and the money another. The working copy keeps the
decision through all of it, which is right — undoing a publish takes back the issued document, not
the scheduler's own draft.

### Also passing, recorded so a later session does not re-test them

- A round trip leaves no change: deny a man, then tap him back, and the day returns to "Unpublish"
  with no amendment pending. Deny him once and it reads "Publish AL1" with the sign-offs cleared.
- The member keeps the first word. Gambit answered **no** to his meeting. In the mode his puck reads
  *"earns nothing from this event — tap to put him back on it"*; one tap makes it *"earns half a
  day"*; a second puts it back. The override is removed, not inverted.
- Switching the mass brief off drops Saber from a full day to a half — his remaining work is
  09:00–11:00 — and the green disappears from the mass brief row only. That is O-1 working.
