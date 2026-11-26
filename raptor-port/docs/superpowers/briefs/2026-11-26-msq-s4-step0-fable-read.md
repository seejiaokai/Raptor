# Step 0 read — section 4, the Leave War's posting sheet (D2728)

Reader: a fresh Fable. Read only; nothing built, edited or committed.

**Read:** the plan on `origin/claude/msq-b1-screens-135` — §21's head with "Rules for every section", §21.4, §21.5 finding 1, §22 (and, by search only, the plan's other lines that name this sheet); the full rows of D2648, D2653, D2659, D2660, D2727, D2732; lesson 105; the approved page `body-s4.html` (version 2) as text; fifteen of its pictures opened and looked at (greyed-out d/p, undo-a d/p, delete-grey d, lastadmin d, ground d/p, drag p, postin d, existing-in d, error d, none d). On `main` (this worktree): `BidPicker.tsx` posting rows and both existing sheets, `OutcomeChips.tsx`, `SelectSheet.tsx` posting part, `Matrix.tsx` `placeAt`, `AskCard.tsx`, the stylesheets by search, and the tests that name the changed parts.

**Not done:** no test was run, no screen driven. `s4-d-drag-crop.png` is byte-for-byte the same size as `s4-d-greyed-out-crop.png` (the drag sheet is drawn identical to the day's sheet), so it was not opened separately. `ownaward.test.tsx` matched the search for the removed button but was not read.

The approved facts every finding is measured against (page v2 + D2732):
- Choices, in this order: **Overseas Sqn · Delete · SANS**. Aircrew: three, **one row at a desk, two and one on a phone** (SANS alone on the second line, half width, at the left). Ground crew: **two** (Overseas Sqn · Delete), side by side at both sizes. "No choice made" is a state, not a choice ("On 14 Dec: off the manpower, nothing else.").
- Title "Cinch  Post out" on the day's sheet, on an existing posting's sheet and on the drag sheet's posting (Q2); "Cinch  Post in" on Post in, new or existing.
- "PO from": its label over its box, about half the sheet's width, alone — nothing beside it.
- Existing posting: the foot holds **"Undo post out" alone**, design A — the app's plain button, the top bar's Undo arrow in teal in front, built as "Move" is; "(PO)" dropped. Twin: "Undo post in", "(PI)" dropped.
- Q3: two presses on the day, as today. Q4: the "Delete Cinch?" card's Delete in the dashed grey Delete look, Cancel still blue, on the Leave War's cards only.
- D2727: "Place leave or OIL here instead…" gone from both existing sheets.

---

## Findings — the plan disagrees with, drops or goes beyond what he approved

### F1 (HIGH) — a ground-crew man has TWO choices; the plan says three in three places
- **Plan:** §21.4 PS3 "a ground-crew man's three chips in the new look"; §22 e "a ground-crew man's three in the same grid"; §22 PT8 "a ground-crew man: three choices". (§22's own "Owed before the build" line already says "two while 'Transfer to Sqn' is left out" — the plan contradicts itself.)
- **Page:** "A ground-crew man: Cotter has no SANS, so two choices, Overseas Sqn and Delete." Picture `s4-d-ground-crop` / `s4-p-ground-crop`: two, each half the width, on a desk and a phone.
- **Why it matters:** PT8 as written would fail on a correct build, or push the builder to bring a third chip back.
- **Replace with:** PS3 — "a ground-crew man's two choices (Overseas Sqn · Delete, D1709, D2659) in the new look". §22 e — "a ground-crew man's two, side by side, each half the width, on a desk and on a phone". PT8 — "a ground-crew man: two choices, Overseas Sqn and Delete, no SANS and no Transfer to Sqn".

### F2 (HIGH) — on a phone the choices are "two and one", not "two by two with none on a line of its own"
- **Plan:** §22 e "the four choices, equal, one row at a desk and two by two on a phone"; §22 e2e "the choices two by two on a phone with none on a line of its own".
- **Page:** "three choices in a row at a desk, two and one on a phone." Picture `s4-p-greyed-out-crop`: Overseas Sqn · Delete on the first line, SANS alone under Overseas Sqn at the same width.
- **Why it matters:** the e2e assertion "none on a line of its own" cannot pass with three choices; a builder would stretch SANS full width or shrink the three onto one line — neither was drawn.
- **Replace with:** §22 e — "the three choices (Overseas Sqn · Delete · SANS, in that order), equal: one row at a desk; on a phone two and one — SANS alone on the second line, at its neighbours' width, under Overseas Sqn; the chosen one ticked." e2e — "on a phone the aircrew man's choices stand two and one, every choice the same width and height, the lone one at the left; the ground-crew man's two on one line; the chosen choice no taller than its neighbours."

### F3 (MEDIUM) — "four outcomes" is left ambiguous now that Transfer is out
- **Plan:** §22 PT4 "one call, the same arguments, for each of the four outcomes"; Twins "the four outcomes"; (outside my part, by search: line 1632 "Post out with each of the four outcomes").
- **Page / code:** three choices can be pressed; the fourth thing the writer takes is "none chosen" (`PostOutcome` none · overseas · delete · sans). Delete does not post from the button — it raises the card.
- **Replace with:** PT4 — "'Post out' carries the main button's look and posts exactly as today — one call, the same arguments — for Overseas Sqn, for SANS and for no choice made; for Delete the same call is made from the card's Delete (PT5)." Twins — "the three choices and none chosen". Line 1632 — the same wording.

### F4 (HIGH) — D2727's removal changes a file this section is not given, and has no step and no test
- **Plan:** §22 "Today" says "the `placeAt` path in `Matrix.tsx` and both `onPlace` buttons in `BidPicker.tsx` go, with their tests changed in the same step". But §21.4 "The files it changes" lists only `BidPicker.tsx`, `SelectSheet.tsx`, `OutcomeChips.tsx`, `bidpicker.css`, `outcomewords.ts`, "its tests" — no `Matrix.tsx`; no PS step names the removal; no PT test covers it; the tests are not named.
- **Code on `main`:** `Matrix.tsx` holds `placeAt` / `placing` (about lines 291–304) and reads `placing` in four conditions (about 3721, 4575, 4606, 4801) plus the two `onPlace=` props (4597, 4620); `MatrixRows.tsx` line ~309 has a comment that names the button. Tests bound to the button: `leavewar/ui/creditdoor.test.tsx` — the whole block "placing leave on a day outside the posting dates" (four tests, about lines 171–216); `leavewar/ui/ownaward.test.tsx` (matched, not read); `e2e/leavewar.spec.ts` — the three "round 3b" tests about lines 8188–8240, which reach the one-day window on a gone day only through this button.
- **Why it matters:** §21's own rule — "a builder who finds a file missing from his list tells the coordinator before he edits it". And those tests pin behaviour he has now removed; the plan's "none deleted" promise (PT8, risk 38) cannot hold for them and must say so by name, or the builder weakens or keeps them on a guess. `e2e/leavewar.spec.ts` is a browser-test file: changing and running it needs the checks lock.
- **Replace with:** §21.4 files — add "`leavewar/ui/Matrix.tsx` — only the `placeAt` state, `placing` and its four reads, and the two `onPlace` props (D2727); `leavewar/ui/MatrixRows.tsx` — one comment; told to the coordinator before PS1 (no other section's list names either file)". A new row in the steps table, before PS2: "**PS1b** — D2727: 'Place leave or OIL here instead…' gone from both existing sheets, with `onPlace`, `placeAt` and `placing`; an admin's tap on a day outside a man's time opens the posting sheet and nothing else. Tests changed by name, each citing D2727: `creditdoor.test.tsx`'s four 'placing leave on a day outside the posting dates' tests — the first rewritten to assert the posting sheet opens with no such button, the other three retired as tests of a removed door; `ownaward.test.tsx` — read, then the same; `e2e/leavewar.spec.ts`'s three round-3b tests — each re-pointed to a door that still reaches that state, or retired by name if none does, said in the report. After the removal the builder checks whether the 'reason it stays pending' note kept by cell in `Matrix.tsx` can still be reached; if not he says so in his report and leaves it — no tidy-up beyond D2727." A new test: "**PT9** — an admin taps a day after Cinch's posting-out date: the posting sheet, no 'Place leave or OIL here instead…', no way from it to the leave buttons; the same on a day before his post-in; a locked (archived) sheet and a 'back from a posting' sheet, whose foot now holds nothing, draw no empty foot row."

### F5 (MEDIUM, a hold to state) — whose tap D2727 changes
- **Plan:** §22 "a tap on a day outside a man's time opens the posting sheet only".
- **Ruling:** D2727's row says the same words, about the posting sheets — which are the admin's alone (D328). Today a member's tap on his own such day opens the bid window, never the posting sheet (the code's own note on `PostInSheet`).
- **Why it matters:** read literally the plan's sentence would close the member's door too; nothing he said covers that.
- **Replace with:** "an **admin's** tap on a day outside a man's time opens the posting sheet only; a member's tap on his own such day stays as today (reading: D2727 speaks of the posting sheets, the admin's — D328; told to him in the closing report, not built differently on a guess)."

### F6 (HIGH) — the "Undo post out" design is settled; the plan still holds it and never builds or tests it
- **Plan:** §21.4 PS1's "waits on": "an existing posting's sheet with 'Undo post out (PO)' redesigned through the design skill (D2660)"; §22: "His D2660: … redesigned through the design skill and shown to him before it is built"; PT8 says only "in the same shape"; the ledger row for D2660 (line 3638) says the same.
- **Ruling:** D2732 — "Q1 'Undo post out' is design A — the app's plain button with the top bar's Undo arrow in teal, alone at the sheet's foot ('Undo post in' its twin)". Page: "All three drop '(PO)'"; "built as 'Move' is".
- **Why it matters:** the button's look, its words and its place are his answer now; today's code draws `dchip po` (the hatched grey) reading "Undo post out (PO)" / "Undo post in (PI)".
- **Replace with:** §22, in place of the D2660 sentence — "His D2732 Q1 (answering D2660): on an existing posting's sheet the foot holds one button alone, 'Undo post out' — the app's plain button, the top bar's Undo arrow in teal before the words, built as 'Move' is, where 'Post out' stands on a new posting; '(PO)' is dropped. 'Undo post in' is its twin, '(PI)' dropped. These two wordings are his (the page's), not a builder's draft." PT8 adds — "an existing posting's sheet: one button at its foot, reading exactly 'Undo post out', the plain button's look with the teal Undo arrow, not the hatched grey; it takes the posting back as today (a pin of the call). An existing post-in: 'Undo post in', the same; none on a 'back from a posting' sheet or a locked one, as today."
- **Note for the builder:** the page's caption under Q1 "A, phone: the two buttons one over the other" is left over from version 1; the picture beside it and D2732 both show one button. One button.

### F7 (MEDIUM) — titles: the plan names two of five sheets
- **Plan:** PS1 "the head 'Cinch  Post out'" (the day's sheet); PS2 "an existing posting's sheet, the drag sheet's posting and Post in ('Cinch  Post in')" — the drag sheet's and the existing sheets' titles are not said; PT8 does not test a title.
- **Ruling / page:** D2732 Q2 — "an existing posting's and a dragged range's sheet are titled 'Cinch  Post out', the day only in the date box". Today they read "Cinch  Tue 15 Dec" and "Cinch  14–18 Dec · 5 days". Picture `s4-d-existing-in-crop`: an existing post-in is "Cinch  Post in". Page, not drawn: "Post in from a dragged range … the same new look".
- **Replace with:** PS2 — "…each titled by its act: 'Cinch  Post out' on an existing post-out and on the drag sheet while its Post out is open (the range's first day in 'PO from'); 'Cinch  Post in' on Post in from a day, from a drag and on an existing post-in. With no posting open the drag sheet keeps its dates in the title, as today." PT8 adds — "each of the five titles; no day or range in any of them; the drag sheet's 'PO from' holds the range's first day."

### F8 (MEDIUM) — what steps aside: PT1 tests less than the picture shows
- **Plan:** PT1 "no leave button is on the sheet".
- **Picture** (`s4-d-greyed-out-crop`, `s4-d-postin-crop`): with a posting open the sheet holds the title and ✕, "Posting" and its choices (Post out only), the date box, the line, the button — and nothing else: no Duration row, no Approve / Refuse / Move / Delete row, no Remarks or Document, no manning line, no CSE · OD · Grant OIL · ⋯ row, no Auto-approve switch in the title bar, no line of what the day holds.
- **Replace with:** PT1 — "…no day in it; the sheet holds only the title, ✕, the choices, 'PO from', the line and 'Post out' — none of the leave buttons, the Duration row, the decide row, Remarks, Document, the manning line, the row under the leaves or the Auto-approve switch (fails today). The same for Post in (no choices) and for the drag sheet's posting."

### F9 (MEDIUM) — Q4, the card's Delete look, is in no step and no test; and where it may be styled
- **Plan:** PS3 "the 'Delete Cinch?' card … in the new look"; PT5 "a pin of what it does". Neither says dashed grey.
- **Ruling:** D2732 Q4 — "the 'Delete Cinch?' card's Delete is the dashed grey Delete look (D332), on the Leave War's cards only." Picture `s4-d-delete-grey-crop`: Delete dashed grey, Cancel still blue, the card hanging above "Post out", nothing else changed.
- **Code:** the three cards' Delete buttons (`po-delete-go`, `sel-po-delete-go`, `postout-delete-go`) wear the app-wide `abtn danger`, whose reddish look lives in `ui/scheduler/02-shell.css` and `08-windows-tools.css` — files outside this section, used across the app. The card is drawn inside the sheet, so a rule in `bidpicker.css` under the sheet's selector reaches it.
- **Replace with:** PS3 — "the 'Delete Cinch?' card's Delete in the Leave War's dashed grey Delete look (D2732 Q4, D332) on the three posting cards — the day's sheet, the drag sheet, an existing posting's — by a rule in `bidpicker.css` under the sheet's selector; the app's `.abtn.danger` and every card outside the Leave War are not touched; Cancel, the words and what Delete does stay." PT5 adds — "the card's Delete wears the dashed grey look, not the reddish one, on all three cards; an input window's delete card elsewhere in the app keeps its own (a pin)."
- **A small hold:** an existing posting's sheet has a second card, "Delete Cinch now?" (a Delete posting's date moved to today or earlier, D1102). Same button, same card; the page names only "Delete Cinch?". Recommended: it takes the same dashed grey as a Leave War card (reading of "the Leave War's cards"), named to him in the closing report.

### F10 (MEDIUM) — holds and "(reading)" marks his answers have settled, still written as open
- §21.4 PS1–PS3 "waits on: its mock-up page seen; the looks not drawn yet drawn and seen…" → **"— (his go, D2732: every screen and each of the four questions as recommended)"**.
- §22 a, d — "(reading of 'pressing the day again' … if he means one press, that is a question for him and a line of the core's file)" → **"settled by D2732 Q3: two presses, as today — the first closes the posting, nothing posted; the next opens the day's sheet with its leave buttons. `Sheet.tsx` is not changed. The page read this from the code and had not tried it on screen: PT3's pin is that check, and if it fails the builder stops and tells the coordinator."**
- §22 "(readings — this fold's, on the section's mock-up page)" → the tick's height and the raised strip are now as drawn and approved (D2732); the clause "so 'To squadron' is laid out here and first shown live by that step" goes (F11).
- §22 "Owed before the build (D2653's own list, D1625)" → **"Drawn and approved (D2732, section 4's page v2): the 'Delete Cinch?' card, the last-admin line, an existing posting's sheet, the drag sheet's posting, a ground-crew man's two choices, an error. The page's own 'not drawn' list — the 'Delete Cinch?' card on an existing posting, Post in from a dragged range, 'back from a posting' on a post-in sheet, an archived man's sheet — is built from the app's own parts in the same look, nothing new on them."**
- §21.4 item 2's read list and the §23 ledger: add D2727 and D2732; the D2660 ledger row is answered by D2732 Q1.

### F11 (LOW) — "To squadron" should not be built at all here
- **Plan:** §22 "Then 'PO from' and 'To squadron' side by side, each label over its box, each half the width … the sheet is the same height without it"; readings: "'To squadron' is laid out here".
- **Ruling / picture:** D2659 — "leaves 'Transfer to Sqn' out altogether"; page: "'Transfer to Sqn' chosen, and the 'To squadron' list: both come back with the Transfer step". Pictures: "PO from" alone, its label over its box, about half the width, nothing beside it.
- **Replace with:** "'PO from': its label over its box, half the sheet's width, at the left, alone. Nothing of 'To squadron' is built in this section — no box, no hidden slot; the Transfer step adds it beside the date (D2659)."

### F12 (LOW) — existing tests and records D2659 changes, not named
- `leavewar/ui/po.test.tsx` (about lines 190–204) asserts "Transfer not pressable" by `po-transfer` being disabled. It must now assert the chip is absent — named in the plan as a test changed for D2659, not left to "the existing posting tests stay green".
- `docs/ui-contracts.md` (about line 6938) lists the four chips with Transfer; `OutcomeChips.tsx`'s head comment says "four chips … drawn and not pressable". PS4's records step names only the title-bar contract and the 18 Aug note.
- **Replace with:** PS0 — "…named; and the tests his answers change, listed before PS1: `po.test.tsx`'s Transfer assertion (D2659), the tests in F4 (D2727), any test reading 'Undo post out (PO)' / 'Undo post in (PI)' or an existing sheet's dated title (D2732)." PS4's records — add "`ui-contracts.md`'s posting-chips passage (D2659) and its posting-sheet passages (D2727, D2732 Q1, Q2, Q4); the 20 Sep 26 comments (D2727)".

### F13 (LOW) — two drawn placements no test holds
- **Pictures:** the last-admin amber line stands between the strip and "Post out" (`s4-d-lastadmin-crop`), shown before the confirm, in the app's own words "Mako is 150's last admin. The posting waits until 150 has another admin."; an error stands under the button (`s4-d-error-crop`, "Posted in on 14 Dec 26 — the post-out has to be after that day.").
- **Plan:** PT6 pins what happens and "stays in sight"; no test names the error line.
- **Add to PT6:** "the amber line stands between the line of what will happen and 'Post out', on the sheet before the confirm (D306), in the app's own words". **Add to PT4 or the e2e:** "a refused posting's reason stands under the button, the app's own words, the sheet staying open." Both wordings exist on `main` today (`sync.ts`), so the test world needs Mako as 150's only admin and Saber, a master admin, posting him — worth naming in `msq-s4-world.ts`'s cast with Cinch (pilot) and Cotter (ground crew), the page's cast.

### F14 (LOW) — the existing post-in sheet's order changes; the plan does not say so
- **Code today:** the note stands above "PI from". **Picture** (`s4-d-existing-in-crop`): "PI from" first, then the note on the strip, then "Undo post in". PS2's "the same shape" covers it only by implication, and PT7 / PT8 do not test the existing post-in sheet at all.
- **Add to PT8:** "an existing post-in: 'PI from', then the app's own note on the strip, then 'Undo post in'."

---

## Where the plan is right and needs nothing

- **Way C's bones** — the kind of posting first, then the date, the line on its own strip just above the button, a blue main "Post out" in the posting button's own place and size, the head naming the act: all match D2653 and every picture.
- **Post in from a day** — "Cinch  Post in", "PI from", the app's own note on the strip, a blue "Post in", no choices: matches `s4-d-postin-crop`.
- **PT2's aircrew count** ("no 'Transfer to Sqn' … no 'To squadron' box — three choices for an aircrew man") is right.
- **PT3** is exactly Q3's recommended answer.
- **PT6's two events kept apart** match D306 and the app's words on `main`.
- **Finding 1 (`ui/postout.css`)** stands and its recommendation is workable: `.po-outcomes` there is one loose rule (`flex-wrap`, `gap`), which a rule in `bidpicker.css` under the sheet's selector can override; `.dchip.po.del-armed` need not change. Read from the stylesheets, not tried by building.
- **"It must not touch"** — `UsersPanel.tsx`, `sync.ts`, `Sheet.tsx`, `postout.css` — holds for everything above; F4 adds two Leave War files, none of these.
- **Its own test world, shipping from `main`, no security reader** — nothing in the page or D2732 changes these.
- **The words of the lines** ("On 14 Dec: archived, account suspended.", "…: becomes SANS.", "…: off the manpower, nothing else.", "On 14 Dec: archived." for a man with no sign-in) are today's and are drawn unchanged; `outcomewords.ts` should need no change.

## One thing outside the plan's text, for the coordinator
The size line (about 11 hours) was written before D2727's removal and its test changes (F4) and before five titles and the Undo button were settled; it is likely light. Not measured.
