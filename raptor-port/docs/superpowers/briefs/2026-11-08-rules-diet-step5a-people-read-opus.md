# The fresh Opus reader's blind read — the rules diet's step 5a, People & accounts as a page (8 Nov 26, of `3f84658cd`)

A fresh Opus subagent, blind to Astra, the brief `2026-11-08-rules-diet-step5a-people-read-brief.md`; saved whole below, unchanged.

# Blind read — rules diet step 5a, People & accounts as a page (fresh Opus reader, 8 Nov 26)

Read at `3f84658cd` on `claude/rules-diet-step-5a-people-1288c3`. Read only; nothing in the repository changed. Every
People & accounts full row read with the shell, all three cells; the old table at `97eaa5251`; the account; the plan's
§2 and both §Step 5a sections; every pointer's short line in its own area, and the full rows behind the pointers where the
page says more than the short line.

## Findings — most serious first

### 1. Medium — a later scheduler ruling on renames is not pointed to, and two lines state the rule as it stood before it (D1589 against D218 and D166)
- **Page lines:** §Quals — who edits what, "A callsign's rename stays on Quals, an admin's alone, and stays a label: every
  puck, the history and his account follow it [D218, D1510, D1651]"; and §Accounts and signing in, first bullet,
  "everything that records who did something names the callsign [D166, D292, D165]".
- **What the rulings say:** D218 (26 Sep 26) did say the history follows the rename. But D1589 (3 Nov 26, the
  scheduler's — his "1-4 as recommended", decision 4) rules: *the change history and every other record of who did
  something show the person's name as it was at the time, and keep the person himself underneath, so his record can still
  be found after a rename* — the change history's "who", the Tracker mark's "by", the Leave War ledger's "approvedBy"; at
  the database step each stores the person's id beside the name as it was. The pucks still follow a rename (D186 — a
  rename updates the published schedule at once); the history does not.
- **What the page says:** the history follows the rename; records name "the callsign" (read plainly, today's). D1589 is
  cited nowhere on the page, and no pointer names it. The account marks D218 (d) "stated" with no note, so it missed it
  too — the same pattern as the IT guide's D1724: a later ruling of another area changes this area's rule without naming it.
- **Why it matters:** an agent working on the rename, the change history or the database step's who-did-what records,
  following the page, would make the history show the new name (or store the id alone) — against D1589. Taken literally,
  "follow it" makes this high; I rate it medium because "follow" can also be read as "stays tied to him" and the app today
  already prints the old name.
- **Fix:** on the D218 line say "every puck and his account follow it; the change history and every other record of who
  did something keep the name as it was at the time, the person kept underneath (the scheduler's D1589)", cite D1589 on
  the D166 line's "names the callsign" too, and add a "The scheduler's: … [D1589]" pointer.

### 2. Low — the hosting trial changes the sign-in before the database step, and the page does not say so (D1532 against D223, D166)
- **Page lines:** "The sign-in keeps its password box until the database step, when Microsoft's sign-in replaces the
  whole page [D223]"; "at the database step Microsoft's sign-in, with an authenticator, replaces it [D166, D292]".
- **What the rulings say:** D1532 (31 Oct 26, How we work, his "Yes"): the hosting trial on his own M365, before the
  database step, runs the app inside Power Apps; the agent's readings told to him — he tests Microsoft's sign-in there,
  and the trial covers the move plan's points that replace the sign-in card with Microsoft's. D1682 holds the trial until
  he says he is ready.
- **What the page says:** "until the database step", with no word of the trial; D1532 is not pointed to.
- **Fix:** add a How we work pointer: the hosting trial on his own M365 (started only on his word, D1682) tests
  Microsoft's sign-in in place of the card — the agent's reading of D1532 — the Vercel app keeping its password box until
  the database step.

### 3. Low — his ruling stated as the agent's reading: a medical change shown in full in the change history (D211, with D1536 and D169)
- **Page line:** §How a person joins, "Every member sees a medical input's type, remarks and documents … ; the change
  history shows a medical change in full to members too (the agent's reading) [D211, D213]".
- **What the rulings say:** it began as D211's reading (1), but D169's full row is marked "NARROWED BY D211: … members see
  a medical change in full too", and D1536 (31 Oct 26, his "5 keep it the same", the M365 plan's point 23 — the change
  history) makes it his: "a medical change stays shown in full in the change history". How we work states it as his rule.
- **What the page says:** "(the agent's reading)" — while its own pointer, "The scheduler's: members see the full change
  history, a medical change in full too [D169, D211, D213]", states it as a rule. Two lines of the page disagree on whose it is.
- **Fix:** drop "(the agent's reading)" from that clause and cite D1536 beside D211.

### 4. Low — a part of D204's rule stated as the agent's reading (D204, D216)
- **Page line:** §How a person joins, "… a member's bell never lights for it; at the database step it also becomes a Teams
  message — the agent's readings, shown on the mock-up [D216, D204]".
- **What the row says:** D204's meaning cell states it as part of the rule, unmarked: "the admin is notified (a badge on
  the Admin tab; a Teams message at the database step)". D216 repeats it inside its readings, citing D204.
- **Fix:** move "at the database step a new request also becomes a Teams message [D204]" out of the readings clause.

### 5. Low — the undo pointer says every excluded act has its own way back, and drops "in this build" (D350)
- **Page line:** §From other areas, "How we work: the one undo does not take back adding a person, archive, Restore /
  Restore as, delete or a posting — each has its own way back, and the greyed button says why …".
- **What the row says:** "**In this build** the one undo does not take back …"; "each has its own way back — Restore
  undoes Archive, the sheet's 'Undo post out' a posting, Delete a man added by mistake — **and a Delete is never undone
  at all** (D287)"; the reason, the stints the undo cannot yet re-lay, is filed as `[UNDO-POSTING-RECORD]`.
- **What the page says:** "each has its own way back", delete included, and no "in this build" — which reads as
  permanent and clashes with the page's own "it cannot be undone" (§Delete).
- **Fix:** write "in this build … — Restore undoes Archive, 'Undo post out' a posting, Delete a man added by mistake, and
  a Delete is never undone".

### 6. Low — the bell's take-back pointer widens one condition and drops two (D1710)
- **Page line:** §From other areas, "The scheduler's: every bell line is taken back by the undo of what made it — a
  posting out's by its sheet's 'Undo post out', or by a change of its date or outcome once it has run …".
- **What the row says:** D1710 — a posting that has run and is then changed: "its date **moved later**, or another
  outcome"; "the admin who changed it is told nothing; the changed posting tells again when it runs".
- **Fix:** write "its date moved later, or another outcome", and add "the admin who changed it is told nothing; the
  changed posting tells again when it runs".

### 7. Low — two lines mix his rule with the agent's readings under one marker, and one reading lost a word (D320, D289; also D1101)
- **D320:** "A leave period he is away for the whole of shows no row for him; one holding his posting-out date shows his
  days before it as normal; a stint opens … ; Restore opens a new one … ; and the war's own Post in / Post out edit the
  stint the day falls in (the agent's readings) [D320]" — the first two clauses are his rule (the main meaning cell, his
  "A"), the rest the readings; one trailing marker reads as covering all.
- **D289:** "the mark never hides the callsign — 'Viper · F-16' in full wherever there is room: the lists, the pickers, a
  tap (the agent's reading)" — "the mark never hides the callsign" is his concern, which the row says "stands with" the
  ruling; and the reading names "a tap **or hover**" — the hover is dropped (the account's D289 (f) dropped it too).
- **D1101:** "… so far at most two squadrons a type, so lending a man between the two F-15 squadrons stays inside one
  system (the agent's reading)" — "so far at most two squadrons a type" is his own confirming message, not a reading.
- **Fix:** in each, put his part first and close it, then "the agent's readings:" before the readings; restore "or hover".

### 8. Low — the new-person mock-up named as the design of record without what the one door replaced (D224, D322)
- **Page line:** §Settled, "The new person and the sign-up: the new-person mock-up … is the design of record for
  `[ACCOUNTS-NEW-PERSON]`, the post-in date added to its form …  [D224, D308]".
- **What the rows say:** D224's content includes "'On the roster / New person' on Admin → Users' add and approve"; D322
  (the one-door mock-up, the later design of record) makes "Add a person" a New person only — the account itself marks
  D224 (e) superseded by D322.
- **What the page says:** the mock-up stands whole; an agent following it would bring back the add's "On the roster" choice.
- **Fix:** add "its 'On the roster' choice on the add replaced by the one door's 'Add a person' (New person only) and
  Give sign-in [D322]".

### 9. Low — a pointer cites two design rulings and states neither (D1654, D1656)
- **Page line:** "The design file's: the screen after asking for access takes look B's pass at its top … with 'Signed in as
  …' small at the foot [D1649, D1650, D1654, D1656]".
- **What the rulings say:** D1654 and D1656 are the pass's blue fade from the top left, laid over the whole card so it thins
  out across the tear line — the softened fade approved as drawn.
- **Fix:** add "the pass's blue fade from the top left laid over the whole card, thinning across the tear".

## Not findings, noted
- **The full-text file's head for How we work** still says "Each row's one-line short form is in
  `.claude/rules/decisions/how-we-work.md`" and "`backlog-archive.mjs --rulings` then refreshes its short line's change
  tail" — stale since How we work became a page (7 Nov 26). Not part of this change; OIL's, the IT guide's and People &
  accounts' heads have the page wording.
- **D165's reading "the agent never sets up the tenant, the accounts or any login"** checked against D1571, D1662 and
  D1749 (tables built at the database step in his own test account with the IT side's kit): no clash — tables are not the
  tenant, the accounts or a login.
- **D1101 against D1695 ("Not settled")** — the page says plainly where the question sits and marks the reading; the IT
  side's answer and the recommendation are in `OUTSTANDING.md` and `HANDOFF.md` as the page says. Fair.
- **D212's stale clause** — left for the scheduler's page, as the brief says; this page's pointer is true.

## The account (question 3)
- **Its count holds:** a script over its table gives 80 rulings, 553 parts — 424 stated, 37 in a gap, 31 spent, 41
  detail, 20 superseded — exactly its own figures.
- **Its marks:** all 92 parts marked detail, spent or superseded read against their full rows. None hides a live wording,
  control, scope or who-does-what, except as findings 8 (D224 (e) is correctly marked superseded, but the page's Settled
  line did not follow it) and 7 (D289 (f) lost "hover").
- **Missed by it:** D1589 (finding 1 — D218 (d) marked stated); D1532 (finding 2); D1536 on D211 (finding 3). Its
  subject search found the Leave War's and the design file's pointers, but not the scheduler's rename ruling or How we
  work's hosting trial.

## The four small edits (question 4)
All four say what is now true: `DECISIONS.md`'s head ("How we work since 7 Nov 26, D1735, OIL, the IT flow guide and
People & accounts since 8 Nov 26"), `AGENTS.md` item 5 (the four pages named, each file), the project guide's map row,
and the head of `.claude/decisions-full/people-accounts.md` (matching OIL's and the IT guide's heads word for word). The
other areas (scheduler, Leave War, Inputs, Tracker, design) are still in short lines, and nothing claims otherwise.
The two new marks — D149 and D218 narrowed by D1651, D218 by D1510 — are right against D1510's and D1651's rows.

## What was checked, and what was found whole
- **Rulings of this area:** all 80 full rows, every cell, against the page, the changed chains first (D287 with D1102,
  D299, D297, D290; D229 and D294 with D1709, D287, D283, D298; D1547 and D1546 with D1691, D1690; D149 with D1510,
  D1651, D218; D166, D204, D165; D281, D282, D1100, D1101, D1695; D283 with D1692). **71 found whole.** The nine with a
  finding: D218 and D166 (1), D223 and D166 (2), D211 (3), D204 and D216 (4), D320 and D289 (7), D224 (8) — plus D1101's
  marker (7).
- **Rulings these rows name but the table did not hold:** D217, D305 and D210 (archived — each restated in full or spent,
  as their marks say), D212 and D169 (the scheduler's) — read whole.
- **The page's pointers:** 41 bullets, 79 numbers; every short line read in its own area, and 28 full rows of other
  areas opened where the page says more than the short line (among them D785, D350, D148, D1536, D1587, D337, D338,
  D796, D797, D914, D1614, D1627, D1628, D1542, D672, D1127, D1134, D1502, D1532, D1571, D1662, D1749). **All true but
  D350 (5), D1710 (6) and D1654/D1656 (9).** The old "Also read" paragraph and the 12 Leave War pointers are all carried.
- **Searched by subject in every other area file** (Leave War, scheduler, Inputs, Tracker, design, OIL; How we work and
  OIL as pages): sign-in, accounts, suspend, archive, restore, post in and out, stints, SANS, transfer, guests, callsigns
  and renames, Admin → Users, Quals and its columns, roles, the bell, squadrons and aircraft types. Found: D1589 (1),
  D1532 (2), D1536 (3); the rest either pointed to or not bearing on this area (D1722, D1731, D1121, D121, D1383, D769 —
  each consistent with the page).
- **The head and Settled section:** the head's claims hold (it loads by its `paths:`, the Leave War's file no longer loads
  with Quals, its column list, `engine/people.ts` or `state/store.ts`, the seams file does). Nothing settled is shown as
  open; the open points (D1101 with D1695, D1653's IT answers, D1547's auto / manual idea, D288's proposals (4) and (5))
  are each shown as open — except finding 8, where a design of record is shown whole after a later one replaced part of it.
