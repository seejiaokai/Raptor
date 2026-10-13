# The blind read of the design guide's first draft — a fresh Opus reader, 13 Oct 26 (D70; D810's precedent; D812 reading 3)

Read through git from `claude/design-guide` @ cb6a16063: `raptor-port/docs/design-practices.md`, `.claude/rules/ui-design.md`,
the map row in `raptor-port/CLAUDE.md`. Nothing built, nothing changed.

## Verdict

**Ready after these fixes — not ready as it stands.** The draft covers almost everything he approved (all five Jakub pieces,
the two added Apple pieces, the 2 Oct checks as narrowed) and its ruling-first order is right. But it states one thing about the
app that is false (the second "automatic" route), four of its rules collide with a ruling or a look he asked for without saying
which wins, the colour table has two wrong statements, and its own "how it is changed" line misstates D70. Seven HIGH, fourteen
MEDIUM, nine LOW. All are wording fixes; none needs a redesign of the guide.

## HIGH — would mislead, or contradicts a ruling

- **H1. The second "automatic" route does not exist.** The opening says `/impeccable` reads the product record `PRODUCT.md`,
  which names this guide. There is no `PRODUCT.md` on any branch. Fix (if the record is not built in this change): say the
  second route D812 names is NOT built yet (`[UI-SLEEK-PASS]` step 1) and until it is `/impeccable` reaches the guide only
  through the rule file; add `- .claude/skills/impeccable/**` to the rule's `paths:` (not tested that a path rule fires on
  reads under `.claude/`).
- **H2. §1 "never 'OK' / 'Yes' / 'No' on a choice" collides with D782** — the OIL question's answers are ruled "Yes", "No",
  "Yes to all", "No to all". Fix: "never a bare OK / Yes / No under a question that does not itself say what will happen.
  Ruled and staying: the OIL question's "Yes · FO / HO", "No", "Yes to all", "No to all" (D782), and the bare "OK" on a bar
  that only closes."
- **H3. §1 cites D677 for half of what it says.** D677 also rules "Delete counter" in the counter's own window STILL asks
  "Really delete?". And Apple rule 4 (a passing note for what is done; a question only when he must choose) is dropped. Fix,
  replacing the bullet: "A done thing gets a passing note, never a window; a window asks only where he must CHOOSE (the OIL
  question). A "sure?" question names what will happen, not "Are you sure?" — and Undo beats it where the thing can be undone
  (D792; the counter's cross, D677). Ask "sure?" only where it cannot be undone, touches other people, or removes many things
  at once. Left as ruled, never a finding: "Delete counter" in the counter's own window still asks "Really delete?" (D677)."
- **H4. §6 "Wrap, don't cut" collides with the product invariants** "pucks never wrap" and "sim notes single-line". Fix:
  append "— on a callsign cell, an input's card and a list (those rulings). Never a puck and never a sim note: pucks never
  wrap and sim notes stay one line (the product invariants)."
- **H5. §4 colour table — two false statements.** (a) "Selection blue — the puck he clicked, nothing else": the same blue is
  the box round a thing just added, for about six seconds, on the board and the Inputs list (owner, 14 Aug 26). Fix: "the
  puck he clicked (a fill, never a ring); and the box round a thing just added, for about six seconds". (b) "The app's own
  Legend is the full list": the Legend holds only pilot / WSO / ground-crew fills, the CAT chips, "you", "selected" and the
  flags. Fix: "The app's Legend names the pucks' fills, the CAT chips and the flags; the rest are ruled where this table
  says. Neither is the whole list — a colour not found here is not free: search the stylesheets' named colours before
  spending one."
- **H6. §5 as worded condemns motion he asked for** (the six-second blue box and its fade; a dragged puck's 120 ms bloom and
  600 ms landing flash, 6 Sep 26; a newly flagged puck's flash; the board sliding up). Fix: head the section "These rules
  are for NEW motion. The motion already in the app that he asked for stays as measured — the box round a new thing and its
  fade, the picked-up look and landing flash of a drag, a new flag's flash; a look does not report them." and change the
  example to "(typing, tapping a puck)". The same clause in the rule file's point 6.
- **H7. "Changing this guide" misstates D70** — D70 is TWO readers, Astra and Sol 6.1, one round each; one fresh Opus reader
  is the exception for named jobs. Fix: "it is a working guide — a change is read before he approves it, one round each and
  never by its writer: by Astra and Sol 6.1 (D70, D590). This first draft: one fresh, blind Opus reader while the ChatGPT
  readers are out (D812; D810's precedent), written on the no-ChatGPT list (D761)."

## MEDIUM

- **M1. Permission to remove notes.** §1 "Delete what the screen already shows…" is an imperative; rule point 2 has no "shown
  to him". Fix §1: "What the screen already shows is a candidate to go (…)" and add "Nothing already on screen is reworded or
  removed on this guide's word alone — each change is put to him before and after (D726, D808)." Rule point 2: after
  "(D808)" add "— each put to him before and after, nothing built reworded unasked".
- **M2. §4 contradicts its own table** ("Red, amber and green appear only where they mean stop, look, fine" — CAT B is amber,
  CAT A red, CAT C cyan, a WSO's puck green, the picked week button green…). Fix: "On a ring, a box, a flag or a note, red,
  amber and green mean stop, look, fine. The other things that wear those hues are in the table below and keep them."
- **M3. Colour table rows:** Cyan's source is "the stylesheets (the app's one accent)", and add today's date, the focus
  outline, the picked-up look of a drag · "Olive / dark green / white fill of a puck (and the Leave War's name bars) | pilot
  / WSO / ground crew | the Legend" · "Grey ring or flag | a note-level item — the long work day; never amber" (off days are
  light grey too, D627) · split "green on a date": D627 is the holiday; the open-bidding green box is the owner's of 1 Sep 26
  · AL tags: D362 says AL8 and later SHARE AL7's orange and the number tells them apart; D110 is AL colours versus ORIG ·
  missing: green on the picked week button (and the Leave War's live period), orange on a no-leave day, the amber of the
  Leave War's clash note.
- **M4. §2 "A date calendar" row** is from the ARIA date-picker pattern, not the cited source, and reads as fact. As built:
  arrows, Page Up/Down, Enter/Space, a Today button, one tab stop, Escape first — NO Home/End, and no clear in the calendar
  (D796; the ✕ is on the box). Fix the cell: "…Home / End to the week's ends (not built in today's calendar — a gap for the
  keyboard sweep to list, built on his word, D807); … a way to clear on the BOX where a date may be empty (the calendar
  itself has none — D796)", and credit the ARIA practices for the row.
- **M5. §2 "the tap-to-arm route is its keyboard and touch way"** — no key handler arms a puck was found. Fix: "(a drag of a
  puck: tap-to-arm is its touch way; whether a keyboard can arm is for the keyboard sweep to say — D807)".
- **M6. §6's icon line is not approved** (rules 17–18 of make-interfaces-feel-better, excluded by the 2 Oct read). Remove it,
  or mark it "proposed, not yet his".
- **M7. Three weights, one corner scale, "never decoration" read as checks the whole app fails** (seven weights, about
  fifteen corner sizes today). Add to §6 and §4: "For new work. The app today uses more; bringing it down is
  `[UI-SLEEK-PASS]`'s, as pictures to him — a look does not report each instance and nothing is re-weighted or recoloured as
  a side effect."
- **M8. §3 "What can be changed comes first" generalises D809** (the Logic page only). Fix: "On the Logic page, what can be
  changed comes first… (D809). Elsewhere it is offered as a picture, not assumed." The same in the rule file.
- **M9. §3 "Group with space"** has no ruling beside it. Fix: "Group with the space already there and a change of surface
  before another box — never added height on a working screen (§0: D688, D696)."
- **M10. §8 puts file and line in what goes to him.** Fix: "the place — the screen, in the app's own words (the file and line
  go in the evidence sheet for the next agent, never in what he reads)".
- **M11. Rule file `paths:` misses** `raptor-port/src/leavewar/LeaveWarPage.tsx` and the words on screen written outside the
  interface folders (about 18 files under `src/state/`, `src/engine/`, `src/leavewar/`, `src/command/`, `src/storage/` call
  the passing-note writer; `[NOTES-SHORTER]` starts in `engine/publish.ts` and `state/sched-commit.ts`), and
  `.claude/skills/brainstorming/mockups-on-the-real-app.md`, `.claude/skills/impeccable/**`. Simplest: replace the first four
  lines with `- raptor-port/src/**` and add the two `.claude` paths.
- **M12. Codex gets none of it.** `AGENTS.md` step 4: add "Before any interface work: `.claude/rules/ui-design.md` and
  `raptor-port/docs/design-practices.md`."
- **M13. Records owed:** the guide cites D805, D806, D808, D809, D812, D813, which are not on its own branch (it must merge
  after the Inputs batch, or say so); no `[NO-ASTRA-LIST]` line for a guide going ahead on one Opus read (D761); after it
  lands, D812's home line in `ui-contracts.md` and `[SKILL-FUSION-JAKUB]` should point at the guide.
- **M14. §2 header "his D544–D555"** takes in D546–D548 (unrelated) and D549 (archived). Replace: "D544, D545, D550–D555,
  D597, D732".

## LOW

- L1. "How it works" versus the app's own "How this works" (D646) — use "How this works".
- L2. §1's three shapes read as three allowed texts. Replace: "A passing note says one of three things: it is happening
  ("Saving…"), it is done ("Saved"), or it failed and what to do ("Not saved — keep this page open")."
- L3. §6 touch target: add "never an invisible area that overlaps its neighbour (the top bar's would)".
- L4. Credits: the Apple row has no copyright holder (© 2026 rukkiecodes) and omits rule 4, rule 6 and its report shape;
  §6's header credits one source though it holds Apple's rule 6 and his rulings; the ARIA practices are not credited for §2.
- L5. §4 readable text: put D630 beside it — "a contrast finding on a look he chose (the SANS calendar's soft washes, D630)
  goes to him with the small step first, never strengthened quietly".
- L6. §0 density: cite "(D812; first said of the Inputs pages — D688, D696, D653)".
- L7. §6 cites D722 for wrapping; keep D367, D719, D721.
- L8. `ui-design.md` has no size marker in `docsize.mjs`; `doc-budget.md`'s tier list does not name the guide. Optional.
- L9. Rule point 6 lacks "off for a reader who asked for less motion".

## What was approved, checked off

All five Jakub pieces, Apple rules 1–3 and 5–7, the two additions and the four 2 Oct checks are in the guide; Apple rule 4 is
not as worded (H3). Additions on no approved list: the icon line (M6), the date-calendar row (M4), D809 generalised (M8).

## The D-numbers

Support it: D812, D813, D486, D491, D623, D487, D765, D726 (its reading 3 missing — M1), D808, D806, D541, D628, D646, D792,
D544, D554, D555, D597, D732, D687, D805, D183, D1, D272, D270, D651, D339, D345, D111, D618, D630, D367, D719, D721, D489
(not the icon line). Loosely: D688, D696, D653 (L6); D751 (M3); D722 (L7). Half: D677 (H3). Does not: the range "D544–D555"
(M14); D362 for "which amendment by colour" past AL7 (M3); D627 for "bidding open" (M3); D809 beyond the Logic page (M8).
Misstated: D70 (H7).

## Not checked

The running app; `npm run docsize`; whether a keyboard can arm a puck; whether a path rule fires on reads under `.claude/`;
the Leave War's leave-type colours and the Tracker's colours; Jakub's "break", "state-machine" and `patterns.md`; the Apple
skill's five reference documents.

## What was done with it (the host, the same afternoon)

All seven HIGH and all fourteen MEDIUM taken as worded or nearer the ruling; of the LOW, all but L8 (a size marker for the
rule file — optional, left). **H1:** the guide now says the design skill's own record is NOT built and why; the rule file
loads on the skill's own files too. Writing that record needs his answers — it is the next step, put to him. **M11:** the
rule file's paths are `raptor-port/src/**` and the mock-ups, as the executor's rule. **M12:** one clause in `AGENTS.md`.
**M13:** a line on the list of jobs without a ChatGPT reader; the guide says where D805–D813 were recorded; the pointers in
`ui-contracts.md` and the backlog item are turned to the guide when the Inputs batch (pull request 497) is live and this
branch has it. **M6:** the icon line is removed. Not re-read after the fixes: they are the reader's own wordings.
